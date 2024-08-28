const 
	MODEL_DB = require("../modules/model_db"),
	Users = require("../modules/users"),
	Cards = require("../modules/cards");

class Matches extends MODEL_DB {
	static db_name = 'matches';
	static startingPot = 100;
	static winMarginToPercent = [50, 70, 77.5, 92.5, 100];
	static create(hostId, amount) {
		let match = {
			id: this.randID(),
			pin: Math.floor(Math.random() * 10000).toString().padStart(4, "0"),
			pot: amount ? parseFloat(amount) : this.startingPot,
			host: hostId,
			guest: null
		};
		this.upsert(match);
		return match;
	}
	static getByPin(pin) {
		let match = this.find((match) => match.pin === pin);
		return match ? match : false;
	}
	static start(req) {
		let pin = req.params.pin,
			current_user = req.session.current_user,
			match = this.getByPin(pin),
			potShare = match.pot / 2,
			dice = {host:0,guest:0};
		if (!match) {
			return false;
		}
		while (dice.host == dice.guest) {
	      dice.host = Math.floor(Math.random() * 6) + 1;
	      dice.guest = Math.floor(Math.random() * 6) + 1;
	    };
		Object.assign(match, {
			guest: current_user.id,
			pin: null,
			cards: new Cards(),
			bets: { host: 0, guest: 0, checked: true },
			turn: dice.host < dice.guest ? "host" : "guest",
			first: dice.host < dice.guest ? "host" : "guest",
			move:0,
			dice:dice
		});
		let host = Users.updateBalance(match.host, 0 - potShare);
		current_user = Users.updateBalance(match.guest, 0 - potShare);
		req.session.current_user = current_user;
		req.session.save();
		this.upsert(match);
		match.cardsLeft = match.cards.deck.length;
		delete match.cards.deck;
		match.host = host;
		match.guest = current_user;
		delete match.guest.password;
		delete match.host.password;
		return match;
	}
	static placeCard(req) {
		let current_user = req.session.current_user,
			{ cardcol, match_id } = req.params,
			match = this.getOne(match_id),
			role = current_user.id == match.host ? "host" : "guest",
			opponentRole = role == "guest" ? "host" : "guest",
			currentRow = 4 - Math.floor((match.cards.deck.length - 2) / 10),
			valid = !match.cards[role][cardcol][currentRow];
		if (valid && match.turn == role) {
			match.move++;
			match.cards.drawn.move = match.move;
			match.cards[role][cardcol].push(match.cards.drawn);
			let last2cardsInRow = ((match.cards.deck.length-4)%10==0);

			if (last2cardsInRow) {
				match.cards.drawn = null;
				match.cards[opponentRole].forEach((col, colIndex) => {
					if (!col[currentRow]) {
						let card = match.cards.deck.pop();
						match.move++;
						card.move = match.move;
						col[currentRow]=card;
					}
				});
				match.cards[role].forEach((col, colIndex) => {
					if (!col[currentRow]) {
						let card = match.cards.deck.pop();
						match.move++;
						card.move = match.move;
						col[currentRow]=card;
					}
				});
				match.bets.checked = false;
			} else {
				let nextCard = match.cards.deck.pop();
				nextCard.move = match.move++;
				match.cards.drawn = nextCard;
			}
			match.turn = match.turn=='host' ? 'guest':'host';

			this.upsert(match);
			match.cardsLeft = match.cards.deck.length;
			delete match.cards.deck;
			match.host = role == "host" ? current_user : Users.getOne(match.host);
			match.guest = role == "guest" ? current_user : Users.getOne(match.guest);
			return match;
		} else {
			return false;
		}
	}
	static placeBet(req) {
		let current_user = req.session.current_user,
				{ amount, match_id } = req.params,
				match = this.getOne(match_id),
				role = current_user.id == match.host ? "host" : "guest",
				opponentRole = role == "guest" ? "host" : "guest",
				betMargin = match.bets[opponentRole] - match.bets[role];
		amount = parseFloat(amount);
		if (amount==0){
			if (betMargin==0){
				match.bets.checked = match.bets.checked===opponentRole ? true:role;
			} else {
				return false;
			}
		} else {
			let valid = match.pot >= amount && current_user.credit >= amount && amount >= betMargin;
			if (valid){
				match.pot+=amount;
				match.bets[role]+=amount;
				current_user = Users.updateBalance(current_user.id, 0 - amount);
				req.session.current_user = current_user;
				req.session.save();
				match.bets.checked = false;
			}
		}
		if (match.bets.checked===true){
			if (match.cards.deck.length == 2){
				match = this.conclude(match); //call to finish game
			} else {
				match.cards.drawn = match.cards.deck.pop();
				match.bets[role] = match.bets[opponentRole] = 0;
			}
		}
		this.upsert(match);
		match.cardsLeft = match.cards.deck.length;
		delete match.cards.deck;
		match.host = role == "host" ? current_user : Users.getOne(match.host);
		match.guest = role == "guest" ? current_user : Users.getOne(match.guest);
		return match;
	}
	static formatForRole(match, role){
		let 
	        playerId = match[role].id,
	        opponentRole = role == "guest" ? "host" : "guest",
	        playerRoom = "match-" + match.id + "-user-" + playerId,
	        checked = (match.bets.checked.length>1) ? (match.bets.checked==role ? 'player':'opponent'):match.bets.checked,
	        playerCards = JSON.parse(JSON.stringify(match.cards[role])),
	        opponentCards = JSON.parse(JSON.stringify(match.cards[opponentRole])),
	        drawn = match.cards.drawn ? 
	                  match.turn == role ? 
	                    match.cards.drawn : Cards.anonimize(match.cards.drawn): match.cards.drawn,
	        playerMatch = {
	          id: match.id,
	          turn: match.turn == role ? "player" : "opponent",
	          first: match.first == role ? "player" : "opponent",
	          player: match[role],
	          opponent: match[opponentRole],
	          cards: {
	            player: playerCards,
	            opponent: opponentCards,
	            deck: match.cards.deck,
	            drawn: match.cards.drawn ? match.turn == role ? match.cards.drawn : { name: "anon_card" }: match.cards.drawn,
	          },
	          move: match.move,
	          pot: match.pot,
	          cardsLeft: match.cardsLeft,
	          bets: {
	            player: match.bets[role],
	            opponent: match.bets[opponentRole],
	            checked: checked
	          }
	        };

	    if (match.dice) {
	      playerMatch.dice = {
	        player: match.dice[role],
	        opponent: match.dice[opponentRole],
	      };
	    }

	    if (match.results) {
	      playerMatch.results = [];
	      playerMatch.cards.drawn = null;
	      match.results.forEach((handResult, handIndex) => {
	        playerMatch.results[handIndex] = {
	          winner: handResult.winner == role ? "player" : "opponent",
	          hands: {
	            player: handResult.hands[role],
	            opponent: handResult.hands[opponentRole],
	          },
	        };
	      });
	      playerMatch.share = match.share[role];
	    } else {
	      opponentCards.forEach((cardCol, colIndex) => {
	      	if (cardCol[4]){
	        	cardCol[4] = Cards.anonimize(cardCol[4]);
	      	}
	      });
	    }
	    return playerMatch;
	 
	}
	static conclude(match) {
		// console.log('concluding match');
		let wins = { host: 0, guest: 0 };
		match.results = [];
		match.cards.host.forEach((hostHand, colIndex) => {
			let guestHand = match.cards.guest[colIndex],
				comparisonResult = Cards.compareHands(hostHand, guestHand),
				handWinner =comparisonResult.winner == 0 ? false	: comparisonResult.winner > 0? "host": "guest";
			match.results[colIndex] = {
				winner: handWinner ? handWinner : "tie",
				hands: {
					host: comparisonResult.handPlayerBName,
					guest: comparisonResult.handPlayerAName,
				},
			};
			if (handWinner) {
				wins[handWinner]++;
			}
		});
		let winMargin = wins.host - wins.guest,
			winnerPercent = this.winMarginToPercent[Math.abs(winMargin)],
			winnerShare = Math.ceil((match.pot * winnerPercent) / 100),
			loserShare = match.pot - winnerShare,
			winner =
				wins.host == wins.guest
					? "host"
					: wins.host > wins.guest
						? "host"
						: "guest",
			loser = winner == "guest" ? "host" : "guest",
			winnerId = match[winner],
			loserId = match[loser];
		match.winner = winner;

		match.share = {};
		match.share[winner] = winnerShare;
		match.share[loser] = loserShare;
		Users.updateBalance(winnerId, winnerShare);
		Users.updateBalance(loserId, loserShare);
		return match;
	}
	static leave(req) {
		//console.log('concluding game early');
		let current_user = req.session.current_user,
			match_id = req.params.match_id,
			match = this.getOne(match_id),
			opponentRole = current_user.id == match.host ? "guest" : "host";
		Users.updateBalance(match[opponentRole], match.pot);
		return match;
	}
	static leaveAll(req) {
		let current_user = req.session.current_user,
			userMatches = this.filter(
				(match) =>
					match.host === current_user.id || match.guest === current_user.id
			);
		userMatches.forEach((match) => {
			opponentRole = current_user.id == match.host ? "guest" : "host";
			Users.updateBalance(match[opponentRole], match.pot);
		});
	}
	static updateBalance(match_id, offset) {
		let match = this.getOne(match_id);
		match.pot += offset;
		this.upsert(match);
	}
}

module.exports = Matches;