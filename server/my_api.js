const RishPok = require("./RishPok");
const comparePokerHands = require("./comparePokerHands");
const computerTurn = require("./computerTurn");
let fs = require("fs");

let data = {};
let rp = {};
// let computerPlay = 3;
let playerBFinalCards = ["", "", "", "", ""];

exports.getMenuItems = (req, res, q) => {
  menuItems = [
    { name: "about Rishpon poker", HttpRequest: "/get_info" },
    { name: "the rules", HttpRequest: "/get_rules" },
    { name: "get coins" },
    { name: "poker hands rankings", HttpRequest: "none" },
    { name: "about us", HttpRequest: "/get_about_us_info" },
    { name: "contribute" },
    { name: "log in" },
  ];
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(menuItems));
};

exports.getInfo = (req, res, q) => {
  let content = fs.readFileSync("game_info.txt", "utf-8");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(content));
};

exports.getRules = (req, res, q) => {
  let content = fs.readFileSync("game_rules.txt", "utf-8");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(content));
};

exports.getAboutUsInfo = (req, res, q) => {
  let content = fs.readFileSync("about_us.txt", "utf-8");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(content));
};

// creates instance of game, and sends the player their starting hand and starting card
// also sends computer's opening cards for presentation
exports.startGameVSComputer = (req, res, q) => {
  rp = new RishPok();
  ///
  data.playerBCards = rp.playerBCards;
  data.playerACards = rp.playerACards;
  data.drawnCard = rp.drawCard();
  data.cardsLeft = rp.deck.length;
  data.playerATurn = rp.playerATurn;
  data.results = {};
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

exports.placeCard = (req, res, q) => {
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
};

exports.computerGoOn = (req, res, q) => {
  data.playerATurn = true;
  // computerTurn();
  computerTurn(rp, data);
  if (rp.deck.length > 0) data.drawnCard = rp.drawCard();
  data.cardsLeft = rp.deck.length;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

exports.checkWin = (req, res, q) => {
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

exports.buttReplaceWildCard = (req, res, q) => {
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
};

exports.quit = (req, res, q) => {
  rp = {};
  data = {};
  playerBFinalCards = ["", "", "", "", ""];
};

// DEPRECATED:
// function computerTurn() {
//   if (computerPlay == 4) {
//     computerPlay = 0;
//   } else {
//     computerPlay += 1;
//   }
//   if (data.playerBCards[computerPlay].length > 3) {
//     data.playerBCards[computerPlay].push({ name: "anon_card" });
//     playerBFinalCards[computerPlay] = rp.drawCard();
//   } else data.playerBCards[computerPlay].push(rp.drawCard());
// }
