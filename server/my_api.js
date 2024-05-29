const Game = require("./ChinPok");
let fs = require("fs");

let data = {};
let cp = {};
let computerPlay = 3;
let computerFinalCards = ["", "", "", "", ""];

exports.getMenuItems = (req, res, q) => {
  menuItems = [
    { name: "about Rishpon poker", HttpRequest: "/get_info" },
    { name: "the rules", HttpRequest: "/get_rules" },
    { name: "get coins" },
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

//func to start game:
// creates instance of game, and sends the player their starting hand and starting card
// also sends computer's opening cards for presentation
exports.startGameVSComputer = (req, res, q) => {
  cp = new Game();
  ///
  data.computerCards = cp.computerCards;
  data.playerCards = cp.playerCards;
  data.drawnCard = cp.drawCard();
  data.cardsLeft = cp.deck.length;
  data.playerTurn = true;
  data.results = {};
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

//// func to place player card on chosen hand.
// will:
// check if query is legit
// check if wanted location is valid
// if so, add card to corresponding arr
// will activate local func computerTurn
// will send next card for player to play
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

  let temp = data.playerCards[wantedHand].length; // gave rare weird following error:
  //   C:\Users\97252\Desktop\chinesePoker\RishponPoker\server\my_api.js:82
  //   let temp = data.playerCards[hand].length;
  //                              ^

  // TypeError: Cannot read properties of undefined (reading '3')
  //     at exports.placeCard [as /place_card] (C:\Users\97252\Desktop\chinesePoker\RishponPoker\server\my_api.js:82:30)
  //     at Server.<anonymous> (C:\Users\97252\Desktop\chinesePoker\RishponPoker\server\my_server.js:21:24)
  //     at Server.emit (node:events:514:28)
  //     at parserOnIncoming (node:_http_server:1143:12)
  //     at HTTPParser.parserOnHeadersComplete (node:_http_common:119:17)
  // Node.js v20.9.0
  // probably has to do with this check:
  for (let i = 0; i < data.playerCards.length; i++) {
    if (temp > data.playerCards[wantedHand].length) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request 4 placeCard");
      return;
    }
  }
  data.playerCards[wantedHand].push(data.drawnCard);
  data.cardsLeft = cp.deck.length - 1;
  data.playerTurn = false;

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

exports.computerGoOn = (req, res, q) => {
  data.playerTurn = true;
  // computerTurn();
  computerTurnTrial();
  if (cp.deck.length > 0) data.drawnCard = cp.drawCard();
  data.cardsLeft = cp.deck.length;
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

  data.computerCards[cardIndex][4] = computerFinalCards.splice(0, 1)[0];
  data.drawnCard = null;
  data.playerTurn = false;
  data.cardIndex = cardIndex;
  data.results = comparePokerHands(
    data.computerCards[cardIndex],
    data.playerCards[cardIndex]
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

  data.playerCards[hand].splice(card, 1, data.drawnCard);
  data.drawnCard = null;
  data.playerTurn = false;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

// exports.reset = (req, res, q) => {
//   // think over whole reset button
//   cp = new Game();
//   ///
//   data.computerCards = cp.computerCards;  // will probably cancel
//   data.playerCards = cp.playerCards;
//   data.drawnCard = cp.drawCard();
//   data.cardsLeft = cp.deck.length;
//   data.playerTurn = true;
//   data.results = {};
//   res.writeHead(200, { "Content-Type": "application/json" });
//   res.end(JSON.stringify(data));
// };

function comparePokerHands(hand1, hand2) {
  const pokerHands = [
    "High Card",
    "One Pair",
    "Two Pairs",
    "Three of a Kind",
    "Straight",
    "Flush",
    "Full House",
    "Four of a Kind",
    "Straight Flush",
    "Royal Flush",
  ];

  // Function to determine the rank of the hand
  function rankHand(hand) {
    const ranks = {};
    const suits = {};
    const values = [];

    for (let card of hand) {
      ranks[card.rank] = (ranks[card.rank] || 0) + 1;
      suits[card.suit] = (suits[card.suit] || 0) + 1;
      values.push(card.rankValue);
    }

    const uniqueValues = new Set(values);
    const sortedValues = values.slice().sort((a, b) => b - a);
    const highCard = hand.find(
      (card) => card.rankValue === sortedValues[0]
    ).name;

    const straight =
      sortedValues[0] - sortedValues[4] === 4 && uniqueValues.size === 5;
    const flush = Object.values(suits).some((count) => count === 5);

    if (straight && flush) {
      if (sortedValues[0] === 14)
        return {
          rank: 9,
          name: "Royal Flush",
          highCard: highCard,
          values: sortedValues,
        };
      return {
        rank: 8,
        name: "Straight Flush",
        highCard: highCard,
        values: sortedValues,
      };
    }
    if (Object.values(ranks).some((count) => count === 4)) {
      const fourOfKindCard = hand.find((card) => ranks[card.rank] === 4);
      return {
        rank: 7,
        name: `Four ${fourOfKindCard.rank}'s`,
        highCard: highCard,
        values: sortedValues,
      };
    }
    if (
      Object.values(ranks).some((count) => count === 3) &&
      Object.values(ranks).some((count) => count === 2)
    ) {
      const threeOfKindCard = hand.find((card) => ranks[card.rank] === 3);
      return {
        rank: 6,
        name: `Full House: ${threeOfKindCard.rank}`,
        highCard: highCard,
        values: sortedValues,
      };
    }
    if (flush)
      return {
        rank: 5,
        name: "Flush",
        highCard: highCard,
        values: sortedValues,
      };
    if (straight)
      return {
        rank: 4,
        name: "Straight",
        highCard: highCard,
        values: sortedValues,
      };
    if (Object.values(ranks).some((count) => count === 3)) {
      const threeOfKindCard = hand.find((card) => ranks[card.rank] === 3);
      return {
        rank: 3,
        name: `Three ${threeOfKindCard.rank}'s`,
        highCard: highCard,
        values: sortedValues,
      };
    }
    if (Object.values(ranks).filter((count) => count === 2).length === 2) {
      const pairs = hand.filter((card) => ranks[card.rank] === 2);
      return {
        rank: 2,
        name: `Two Pairs ${pairs.map((card) => card.rank).join("& ")}'s`,
        highCard: highCard,
        values: sortedValues,
      };
    }
    if (Object.values(ranks).some((count) => count === 2)) {
      const pairCard = hand.find((card) => ranks[card.rank] === 2);
      return {
        rank: 1,
        name: `Pair of ${pairCard.rank}s`,
        highCard: highCard,
        values: sortedValues,
      };
    }
    return {
      rank: 0,
      name: `High Card ${highCard}`,
      highCard: highCard,
      values: sortedValues,
    };
  }

  function compareHighCards(values1, values2) {
    for (let i = 0; i < values1.length; i++) {
      if (values1[i] > values2[i]) return 1;
      if (values1[i] < values2[i]) return -1;
    }
    return 0;
  }

  const result1 = rankHand(hand1);
  const result2 = rankHand(hand2);

  if (result1.rank > result2.rank) {
    return {
      winner: 1,
      hand1Name: result1.name,
      hand2Name: result2.name,
      highCard1: result1.highCard,
      highCard2: result2.highCard,
    };
  } else if (result1.rank < result2.rank) {
    return {
      winner: -1,
      hand1Name: result1.name,
      hand2Name: result2.name,
      highCard1: result1.highCard,
      highCard2: result2.highCard,
    };
  } else {
    if (result1.rank === 1) {
      // One Pair
      const pair1 = hand1.find(
        (card) => hand1.filter((c) => c.rank === card.rank).length === 2
      ).rankValue;
      const pair2 = hand2.find(
        (card) => hand2.filter((c) => c.rank === card.rank).length === 2
      ).rankValue;
      if (pair1 > pair2)
        return {
          winner: 1,
          hand1Name: result1.name,
          hand2Name: result2.name,
          highCard1: result1.highCard,
          highCard2: result2.highCard,
        };
      if (pair1 < pair2)
        return {
          winner: -1,
          hand1Name: result1.name,
          hand2Name: result2.name,
          highCard1: result1.highCard,
          highCard2: result2.highCard,
        };
    }
    if (result1.rank === 2) {
      // Two Pairs
      const pairs1 = hand1
        .filter(
          (card) => hand1.filter((c) => c.rank === card.rank).length === 2
        )
        .map((c) => c.rankValue)
        .sort((a, b) => b - a);
      const pairs2 = hand2
        .filter(
          (card) => hand2.filter((c) => c.rank === card.rank).length === 2
        )
        .map((c) => c.rankValue)
        .sort((a, b) => b - a);
      for (let i = 0; i < pairs1.length; i++) {
        if (pairs1[i] > pairs2[i])
          return {
            winner: 1,
            hand1Name: result1.name,
            hand2Name: result2.name,
            highCard1: result1.highCard,
            highCard2: result2.highCard,
          };
        if (pairs1[i] < pairs2[i])
          return {
            winner: -1,
            hand1Name: result1.name,
            hand2Name: result2.name,
            highCard1: result1.highCard,
            highCard2: result2.highCard,
          };
      }
    }
    const highCardComparison = compareHighCards(result1.values, result2.values);

    if (highCardComparison > 0) {
      return {
        winner: 1,
        hand1Name: result1.name,
        hand2Name: result2.name,
        highCard1: result1.highCard,
        highCard2: result2.highCard,
      };
    } else if (highCardComparison < 0) {
      return {
        winner: -1,
        hand1Name: result1.name,
        hand2Name: result2.name,
        highCard1: result1.highCard,
        highCard2: result2.highCard,
      };
    } else {
      return {
        winner: 0,
        hand1Name: result1.name,
        hand2Name: result2.name,
        highCard1: result1.highCard,
        highCard2: result2.highCard,
      };
    }
  }
}

function computerTurn() {
  if (computerPlay == 4) {
    computerPlay = 0;
  } else {
    computerPlay += 1;
  }
  if (data.computerCards[computerPlay].length > 3) {
    data.computerCards[computerPlay].push({ name: "anon_card" });
    computerFinalCards[computerPlay] = cp.drawCard();
  } else data.computerCards[computerPlay].push(cp.drawCard());
}
// FIX RECURRING push/givenCard bug
function computerTurnTrial() {
  let givenCard = cp.drawCard();
  console.log(givenCard);
  // define a function to check if optional straight
  function isOptionalStraight(hand, card) {
    let rankValueArr = [];
    for (let i = 0; i < hand.length; i++) {
      rankValueArr.push(hand[i].rankValue);
    }
    rankValueArr.push(card.rankValue);

    let minNum = Math.min(...arr);
    let maxNum = Math.max(...arr);
    if (maxNum - minNum + 1 === arr.length) {
      const uniqueNumbers = new Set(arr);
      if (uniqueNumbers.size === arr.length) {
        return true;
      }
    }
    return false;
  }
  function is10OrHigher(card) {
    if (card.rankValue > 9) return true;
    return false;
  }
  // let humanCards = [];
  // filling humanCards with all of the human player's cards. for comfortable iteration:
  // for (let i = 0; i < data.playerCards.length; i++) {
  //   for (let j = 0; j < data.playerCards[i].length; j++) {
  //     if (j < 4) {
  //       humanCards.push(data.playerCards[i][j]);
  //     }
  //   }
  // }
  let availableHands = [];
  let temp = 1;
  // setting temp value:
  for (let i = 0; i < data.computerCards.length; i++) {
    if (data.computerCards[i].length > temp) {
      temp = data.computerCards[i].length;
    }
  }
  // filling availableHands arr:
  if (data.computerCards.every((hand) => hand.length == temp)) {
    for (let i = 0; i < data.computerCards.length; i++) {
      availableHands.push(data.computerCards[i]);
    }
  } else {
    for (let i = 0; i < data.computerCards.length; i++) {
      if (data.computerCards[i].length < temp) {
        availableHands.push(data.computerCards[i]);
      }
    }
  }
  if (availableHands.length == 1) {
    availableHands[0].push(givenCard);
    return;
  }
  // deciding where to place card:
  if (availableHands.every((hand) => hand.length == 1)) {
    // 1

    for (let i = 0; i < availableHands.length; i++) {
      // for royalty cards:
      if (is10OrHigher(givenCard)) {
        if (
          // look for high pair:
          availableHands[i][0].rank == givenCard.rank &&
          Math.random() < 0.95
        ) {
          availableHands[i].push(givenCard);
          return;
        }
        // look for high flush:
        else if (
          is10OrHigher(availableHands[i][0]) &&
          availableHands[i][0].suit == givenCard.suit &&
          Math.random() < 0.9
        ) {
          availableHands[i].push(givenCard);
          return;
        } else if (
          // look for high straight (consecutive):
          is10OrHigher(availableHands[i][0]) &&
          Math.abs(availableHands[i][0].rankValue - givenCard.rankValue) == 1 &&
          Math.random() < 0.9
        ) {
          availableHands[i].push(givenCard);
          return;
        } else if (
          availableHands[i][0].suit == givenCard.suit &&
          Math.random() < 0.9
        ) {
          // look for any flush:
          availableHands[i].push(givenCard);
          return;
        } else if (is10OrHigher(availableHands[i][0] && Math.random() < 0.9)) {
          // look for high straight (any):
          availableHands[i].push(givenCard);
          return;
        } else {
          // just place it randomly:
          availableHands[
            Math.floor(Math.random() * (availableHands.length + 1))
          ].push(givenCard);
          return;
        }
      } else {
        // givenCard not royal
        // look for pair:
        if (
          availableHands[i][0].rank == givenCard.rank &&
          Math.random() < 0.9
        ) {
          availableHands[i].push(givenCard);
          return;
        } else if (
          // look for straight flush:
          availableHands[i][0].suit == givenCard.suit &&
          Math.abs(availableHands[i][0].rankValue - givenCard.rankValue) == 1
        ) {
          availableHands[i].push(givenCard);
          return;
        } else if (
          // look for flush:
          availableHands[i][0].suit == givenCard.suit &&
          Math.random() < 0.9
        ) {
          availableHands[i].push(givenCard);
          return;
        } else if (
          // look for straight:
          Math.abs(availableHands[i][0].rankValue - givenCard.rankValue) == 1 &&
          Math.random() < 0.9
        ) {
          availableHands[i].push(givenCard);
          return;
        } else {
          // just place it randomly:
          let randomIndex = Math.floor(
            Math.random() * (availableHands.length - 1 + 1)
          );
          availableHands[randomIndex].push(givenCard);
          return;
        }
      }
    }
  }
}
// WHAT TO DO WITH ACES???
