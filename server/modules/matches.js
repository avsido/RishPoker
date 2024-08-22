const MODEL_DB = require("../modules/model_db"),
  usersModule = require("../modules/users"),
  users = new usersModule(),
  RishPokModule = require("../modules/RishPok"),
  rishPok = new RishPokModule();

class matchesModule extends MODEL_DB {
  startingPot = 100;
  winMarginToPercent = [50, 70, 77.5, 92.5, 100];
  constructor() {
    super("matches");
  }
  create(hostId, amount) {
    let match = {
      id: this.randID(),
      pin: Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0"),
      pot: amount ? parseFloat(amount) : this.startingPot,
      host: hostId,
      guest: null,
    };
    this.upsert(match);
    return match;
  }
  getByPin(pin) {
    const matches = this.read(),
      match = this.find((match) => match.pin === pin);
    return match ? match : false;
  }
  start(req) {
    let pin = req.params.pin,
      current_user = req.session.current_user,
      match = this.getByPin(pin),
      potShare = match.pot / 2;
    if (!match) {
      return false;
    }
    let rishPok = new RishPokModule(),
      dice = rishPok.generateDiceNumbers();
    Object.assign(match, {
      guest: current_user.id,
      pin: null,
      cards: {
        host: rishPok.playerACards,
        guest: rishPok.playerBCards,
        deck: rishPok.deck,
        drawn: null,
      },
      bets: { host: 0, guest: 0, checked: null },
      turn: dice.host < dice.guest ? "host" : "guest",
      first: dice.host < dice.guest ? "host" : "guest",
    });
    match.cards.drawn = match.cards.deck.pop();
    let host = users.updateBalance(match.host, 0 - potShare);
    current_user = users.updateBalance(match.guest, 0 - potShare);
    req.session.current_user = current_user;
    req.session.save();
    this.upsert(match);

    match.dice = dice;
    match.cardsLeft = match.cards.deck.length;
    delete match.cards.deck;
    match.host = host;
    match.guest = current_user;
    delete match.guest.password;
    delete match.host.password;
    return match;
  }
  placeCard(req) {
    let current_user = req.session.current_user,
      { cardcol, match_id } = req.params,
      match = this.getOne(match_id),
      role = current_user.id == match.host ? "host" : "guest",
      opponentRole = role == "guest" ? "host" : "guest",
      valid = this.isValidCardPlacement(match.cards[role], cardcol),
      currentRow = 4 - Math.floor((match.cards.deck.length - 2) / 10);
    // lastCardInRow = ((match.cards.deck.length-2)%10)==0;
    if (valid && match.turn == role) {
      match.cards[role][cardcol].push(match.cards.drawn);
      let lastCardInRow = (match.cards.deck.length - 2) % 10 == 0;
      match.cards.drawn = lastCardInRow ? null : match.cards.deck.pop();

      if (lastCardInRow) {
        match.cards[opponentRole].forEach((col, colIndex) => {
          if (!col[currentRow]) {
            match.cards[opponentRole][colIndex][currentRow] =
              match.cards.deck.pop();
          }
        });
        match.cards[role].forEach((col, colIndex) => {
          if (!col[currentRow]) {
            match.cards[role][colIndex][currentRow] = match.cards.deck.pop();
          }
        });
      }
      match.turn = lastCardInRow
        ? match.turn
        : match.turn == "host"
          ? "guest"
          : "host";
      this.upsert(match);
      match.cardsLeft = match.cards.deck.length;
      delete match.cards.deck;
      match.host = role == "host" ? current_user : users.getOne(match.host);
      match.guest = role == "guest" ? current_user : users.getOne(match.guest);
      return match;
    } else {
      return false;
    }
  }
  placeBet(req) {
    let current_user = req.session.current_user,
      { amount, match_id } = req.params,
      match = this.getOne(match_id);
    amount = parseFloat(amount);
    let role = current_user.id == match.host ? "host" : "guest",
      opponentRole = role == "guest" ? "host" : "guest",
      betMargin = match.bets[opponentRole] - match.bets[role],
      valid =
        match.pot >= amount &&
        current_user.credit >= amount &&
        amount >= betMargin;
    if (valid) {
      match.bets.checked = amount == 0 && !match.bets.checked ? role : null;
      match.pot += amount;
      match.bets[role] += amount;

      let betsChecked = amount == 0 && match.bets.checked != role,
        betsDone =
          (match.bets.host == match.bets.guest && match.bets.host != 0) ||
          betsChecked;

      // console.log("role is: -" + role + " and betsDone is: " + betsDone);
      if (match.cards.deck.length == 2 && betsDone) {
        match = this.conclude(match); //call to finish game
      } else {
        match.cards.drawn = betsDone ? match.cards.deck.pop() : null;
        match.turn = betsDone
          ? match.turn
          : match.turn == "host"
            ? "guest"
            : "host";

        match.bets.host = betsDone ? 0 : match.bets.host;
        match.bets.guest = betsDone ? 0 : match.bets.guest;
      }
      current_user = users.updateBalance(current_user.id, 0 - amount);
      this.upsert(match);
      req.session.current_user = current_user;
      req.session.save();
      match.cardsLeft = match.cards.deck.length;

      delete match.cards.deck;

      match.host = role == "host" ? current_user : users.getOne(match.host);
      match.guest = role == "guest" ? current_user : users.getOne(match.guest);
      return match;
    } else {
      return false;
    }
  }
  conclude(match) {
    // console.log('concluding match');
    let comparePokerHands = require("../modules/comparePokerHands"),
      wins = { host: 0, guest: 0 };

    match.results = [];
    match.cards.host.forEach((hostHand, colIndex) => {
      let guestHand = match.cards.guest[colIndex],
        comparisonResult = comparePokerHands(hostHand, guestHand),
        handWinner =
          comparisonResult.winner == 0
            ? false
            : comparisonResult.winner > 0
              ? "host"
              : "guest";
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
    users.updateBalance(winnerId, winnerShare);
    users.updateBalance(loserId, loserShare);
    return match;
  }
  leave(req) {
    //console.log('concluding game early');
    let current_user = req.session.current_user,
      match_id = req.params.match_id,
      match = this.getOne(match_id),
      opponentRole = current_user.id == match.host ? "guest" : "host";
    users.updateBalance(match[opponentRole], match.pot);
    return match;
  }
  leaveAll(req) {
    let current_user = req.session.current_user,
      userMatches = this.filter(
        (match) =>
          match.host === current_user.id || match.guest === current_user.id
      );
    userMatches.forEach((match) => {
      opponentRole = current_user.id == match.host ? "guest" : "host";
      users.updateBalance(match[opponentRole], match.pot);
    });
  }
  updateBalance(match_id, offset) {
    let match = this.getOne(match_id);
    match.pot += offset;
    this.upsert(match);
  }
  isValidCardPlacement(cardsToCheck, wantedHand) {
    if (!Number.isInteger(Number(wantedHand))) {
      return false;
    }
    wantedHand = Number(wantedHand);
    if (wantedHand < 0 || wantedHand > 4) {
      return false;
    }
    const wantedHandLength = cardsToCheck[wantedHand].length;
    return cardsToCheck.every((hand) => wantedHandLength <= hand.length);
  }
}

module.exports = matchesModule;
