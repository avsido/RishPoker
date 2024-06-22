const RishPok = require("./RishPok");
const comparePokerHands = require("./comparePokerHands");
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
  computerTurnGPT(data.playerACards, data.playerBCards);
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
function computerTurn() {
  if (computerPlay == 4) {
    computerPlay = 0;
  } else {
    computerPlay += 1;
  }
  if (data.playerBCards[computerPlay].length > 3) {
    data.playerBCards[computerPlay].push({ name: "anon_card" });
    playerBFinalCards[computerPlay] = rp.drawCard();
  } else data.playerBCards[computerPlay].push(rp.drawCard());
}
// v1:
// function computerTurnGPT(cardsArrayA, cardsArrayB) {
//   if (rp.deck.length == 0) {
//     return;
//   }
//   let drawnCard = rp.drawCard();

//   function calculateDrawnCardRankValue(drawnCard, hand) {
//     if (drawnCard.rank === "Ace") {
//       const values = hand.map((card) => card.rankValue);
//       return values.includes(2) &&
//         values.includes(3) &&
//         values.includes(4) &&
//         values.includes(5)
//         ? 1
//         : 14;
//     } else {
//       return drawnCard.rankValue;
//     }
//   }

//   function isFlush(hand) {
//     const suit = hand[0].suit;
//     return hand.every((card) => card.suit === suit);
//   }

//   function isStraight(hand) {
//     const sortedHand = hand.slice().sort((a, b) => a.rankValue - b.rankValue);
//     for (let i = 0; i < sortedHand.length - 1; i++) {
//       if (sortedHand[i + 1].rankValue - sortedHand[i].rankValue !== 1) {
//         return false;
//       }
//     }
//     return true;
//   }

//   function evaluateHand(hand) {
//     if (hand.length < 2) return 0;

//     if (isFlush(hand)) return 5;
//     if (isStraight(hand)) return 4;

//     const rankCount = {};
//     hand.forEach((card) => {
//       rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
//     });
//     const counts = Object.values(rankCount);
//     const maxCount = Math.max(...counts);

//     if (maxCount === 4) return 7;
//     if (maxCount === 3 && counts.includes(2)) return 6;
//     if (maxCount === 3) return 3;
//     if (maxCount === 2 && counts.filter((count) => count === 2).length === 2)
//       return 2;
//     if (maxCount === 2) return 1;

//     return 0;
//   }

//   function evaluateHandDifference(myHand, opponentHand) {
//     const myHandStrength = evaluateHand(myHand);
//     const opponentHandStrength = evaluateHand(opponentHand);
//     return myHandStrength - opponentHandStrength;
//   }

//   const handSizes = cardsArrayB.map((hand) => hand.length);
//   const minHandSize = Math.min(...handSizes);

//   let bestHandIndex = -1;
//   let bestHandScore = -Infinity;
//   const drawnCardRankValue = calculateDrawnCardRankValue(drawnCard, []);

//   for (let i = 0; i < cardsArrayB.length; i++) {
//     if (cardsArrayB[i].length > minHandSize) continue;

//     const currentHand = cardsArrayB[i];
//     const combinedHand = currentHand.concat({
//       ...drawnCard,
//       rankValue: drawnCardRankValue,
//     });

//     let handScore = evaluateHandDifference(combinedHand, cardsArrayA[i]);

//     let potentialHandStrength = evaluateHand(combinedHand);
//     handScore += potentialHandStrength * 2;

//     const opponentHand = cardsArrayA[i];
//     const opponentHandStrength = evaluateHand(opponentHand);
//     if (potentialHandStrength > opponentHandStrength) {
//       handScore += (potentialHandStrength - opponentHandStrength) * 2;
//     }

//     if (drawnCard.rankValue >= 11) {
//       const currentHighCards = currentHand.filter(
//         (card) => card.rankValue >= 11
//       ).length;
//       const opponentHighCards = cardsArrayA[i].filter(
//         (card) => card.rankValue >= 11
//       ).length;

//       if (currentHighCards <= opponentHighCards) {
//         handScore += drawnCard.rankValue;
//       }
//     }

//     if (
//       drawnCard.rankValue >= 11 &&
//       currentHand.some((card) => card.rankValue >= 11)
//     ) {
//       handScore += drawnCard.rankValue;
//     }

//     if (handScore > bestHandScore) {
//       bestHandIndex = i;
//       bestHandScore = handScore;
//     }
//   }

//   if (data.playerBCards[bestHandIndex].length > 3) {
//     data.playerBCards[bestHandIndex].push({ name: "anon_card" });
//     playerBFinalCards[bestHandIndex] = drawnCard;
//   } else {
//     data.playerBCards[bestHandIndex].push(drawnCard);
//   }
// }

// v2:
function computerTurnGPT(cardsArrayA, cardsArrayB) {
  let drawnCard = rp.drawCard();
  // Helper function to calculate the rank value of the drawn card, considering Ace's value for straights
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
