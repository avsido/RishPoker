const RishPok = require("../RishPok");
const comparePokerHands = require("../comparePokerHands");
let fs = require("fs");

class APP_CLASS {
	playerBFinalCards = null;
	data = null;
	rp = null;
	current_user = null;
	constructor(){
		
	}
	placeCard = (req, res, q) => {
	  let wantedHand = q.query.i;
	  if (isNaN(wantedHand)) {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end("Bad Request 1 placeCard");
		return;
	  }

	  wantedHand = parseInt(wantedHand);

	  if (!Number.isInteger(wantedHand)) {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end("Bad Request 2 placeCard");
		return;
	  }
	  if (wantedHand < 0 || wantedHand > 4) {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end("Bad Request 3 placeCard");
		return;
	  }

	  let temp = data.playerACards[wantedHand].length;
	  for (let i = 0; i < data.playerACards.length; i++) {
		if (temp > data.playerACards[i].length) {
		  res.writeHead(400, { "Content-Type": "text/plain" });
		  res.end("Bad Request 4 placeCard");
		  return;
		}
	  }
	  data.playerACards[wantedHand].push(data.drawnCard);
	  data.cardsLeft = rp.deck.length - 1;
	  data.playerATurn = false;

	  res.writeHead(200, { "Content-Type": "application/json" });
	  res.end(JSON.stringify(data));
	}

	computerGoOn = (req, res, q) => {
	  data.playerATurn = true;
	  // computerTurn();
	  this.computerTurnGPT(rp, data);
	  if (rp.deck.length > 0) data.drawnCard = rp.drawCard();
	  data.cardsLeft = rp.deck.length;
	  res.writeHead(200, { "Content-Type": "application/json" });
	  res.end(JSON.stringify(data));
	};

	checkWin = (req, res, q) => {
	  let cardIndex = q.query.cardIndex;

	  if (isNaN(cardIndex)) {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end("Bad Request 1 checkWin");
		return;
	  }
	  cardIndex = parseInt(cardIndex);
	  if (!Number.isInteger(cardIndex)) {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end("Bad Request 2 checkWin");
		return;
	  }
	  if (cardIndex < 0 || cardIndex > 4) {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end("Bad Request 3 checkWin");
		return;
	  }

	  data.playerBCards[cardIndex][4] = playerBFinalCards.splice(0, 1)[0];
	  data.drawnCard = null;
	  data.playerATurn = false;
	  data.cardIndex = cardIndex;
	  data.results = comparePokerHands(
		data.playerBCards[cardIndex],
		data.playerACards[cardIndex]
	  );
	  res.writeHead(200, { "Content-Type": "application/json" });
	  res.end(JSON.stringify(data));
	};

	buttReplaceWildCard = (req, res, q) => {
	  let hand = q.query.hand;
	  let card = q.query.card;
	  if (isNaN(hand) || isNaN(card)) {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end("Bad Request 1 placeCard");
		return;
	  }

	  hand = parseInt(hand);
	  card = parseInt(card);

	  if (!Number.isInteger(hand) || !Number.isInteger(card)) {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end("Bad Request 2 placeCard");
		return;
	  }
	  if (hand < 0 || hand > 4 || card != 4) {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end("Bad Request 3 placeCard");
		return;
	  }

	  data.playerACards[hand].splice(card, 1, data.drawnCard);
	  data.drawnCard = null;
	  data.playerATurn = false;
	  res.writeHead(200, { "Content-Type": "application/json" });
	  res.end(JSON.stringify(data));
	}

	quit = (req, res, q) => {
	  res.writeHead(200, { "Content-Type": "text/plain" });
	  res.end("ok");
	}

	login = (req, res, q) => {
	  const users_class = require("../modules/users.js"),
			users = new users_class(),
			data = {login_success:true},
			url = new URL(req.url,'http://localhost:8080'),
			params = new URLSearchParams(url.search),
			username = params.get('username'),
			password = params.get('password'),
			loggedUser = users.login(username,password),
			response = loggedUser ? JSON.stringify(loggedUser.read()):'failed';
	  this.current_user = loggedUser;
	  res.writeHead(200, { "Content-Type": "application/json" });
	  res.end(response);
	}

	register = (req, res, q) => {
	  const users_class = require("../modules/users.js"),
			users = new users_class(),
			url = new URL(req.url,'http://localhost:8080'),
			params = new URLSearchParams(url.search),
			username = params.get('username'),
			password = params.get('password'),
			loggedUser = users.register(username,password),
			response = loggedUser ? JSON.stringify(current_user.read()):'failed';
	  this.current_user = loggedUser;
	  res.writeHead(200, { "Content-Type": "application/json" });
	  res.end(response);
	}

	computerTurnGPT(rp, data) {
	  let cardsArrayA = data.playerACards;
	  let cardsArrayB = data.playerBCards;
	  let drawnCard = rp.drawCard();
	  // Helper function to calculate the rank value of the drawn card, considering Ace's value for straights (either 1 or 14)
	  function calculateDrawnCardRankValue(drawnCard, hand) {
		if (drawnCard.rank === "Ace") {
		  // If Ace is needed for a lower straight, its rank value is 1
		  let values = hand.map((card) => card.rankValue);
		  return values.includes(2) &&
			values.includes(3) &&
			values.includes(4) &&
			values.includes(5)
			? 1
			: 14;
		} else {
		  return drawnCard.rankValue;
		}
	  }

	  // Helper function to check if a hand is a flush
	  function isFlush(hand) {
		let suit = hand[0].suit;
		return hand.every((card) => card.suit === suit);
	  }

	  // Helper function to check if a hand is a straight
	  function isStraight(hand) {
		// Sort the cards by rank value
		let sortedHand = hand.slice().sort((a, b) => a.rankValue - b.rankValue);
		// Check if the cards form a sequence
		for (let i = 0; i < sortedHand.length - 1; i++) {
		  if (sortedHand[i + 1].rankValue - sortedHand[i].rankValue !== 1) {
			return false;
		  }
		}
		return true;
	  }

	  // Helper function to evaluate the hand strength
	  function evaluateHand(hand) {
		if (hand.length < 2) return 0; // Single card hand is the weakest

		// Check for flush
		if (isFlush(hand)) return 5; // Flush

		// Check for straight
		if (isStraight(hand)) return 4; // Straight

		// Check for pairs, three of a kind, four of a kind, full house
		let rankCount = {};
		hand.forEach((card) => {
		  rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
		});
		let counts = Object.values(rankCount);
		let maxCount = Math.max(...counts);

		if (maxCount === 4) return 7; // Four of a kind
		if (maxCount === 3 && counts.includes(2)) return 6; // Full house
		if (maxCount === 3) return 3; // Three of a kind
		if (maxCount === 2 && counts.filter((count) => count === 2).length === 2)
		  return 2; // Two pairs
		if (maxCount === 2) return 1; // One pair

		return 0; // High card
	  }

	  // Helper function to evaluate hand strength difference
	  function evaluateHandDifference(myHand, opponentHand) {
		let myHandStrength = evaluateHand(myHand);
		let opponentHandStrength = evaluateHand(opponentHand);
		return myHandStrength - opponentHandStrength;
	  }

	  // Find the current size of each hand
	  let handSizes = cardsArrayB.map((hand) => hand.length);
	  let minHandSize = Math.min(...handSizes);

	  let bestHandIndex = -1;
	  let bestHandScore = -Infinity;
	  let drawnCardRankValue = calculateDrawnCardRankValue(drawnCard, []);

	  // Iterate over each hand in cardsArrayB
	  for (let i = 0; i < cardsArrayB.length; i++) {
		if (cardsArrayB[i].length > minHandSize) continue; // Skip if this hand is already larger

		let currentHand = cardsArrayB[i];
		let combinedHand = currentHand.concat({
		  ...drawnCard,
		  rankValue: drawnCardRankValue,
		});

		// Evaluate the hand strength difference
		let handScore = evaluateHandDifference(combinedHand, cardsArrayA[i]);

		// Boost score if creating a potential strong hand
		let potentialHandStrength = evaluateHand(combinedHand);
		if (potentialHandStrength >= 4) {
		  handScore += potentialHandStrength;
		}

		// Adjust score based on opponent's hand
		let opponentHand = cardsArrayA[i];
		let opponentHandStrength = evaluateHand(opponentHand);
		if (potentialHandStrength > opponentHandStrength) {
		  handScore += (potentialHandStrength - opponentHandStrength) * 2;
		}

		if (handScore > bestHandScore) {
		  bestHandIndex = i;
		  bestHandScore = handScore;
		}
	  }
	  if (data.playerBCards[bestHandIndex].length > 3) {
		data.playerBCards[bestHandIndex].push({ name: "anon_card" });
		playerBFinalCards[bestHandIndex] = drawnCard;
	  } else data.playerBCards[bestHandIndex].push(drawnCard);
	}
}

module.exports = APP_CLASS;