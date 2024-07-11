/*
  this func takes 2 poker hands and determines who is the better
  provided by GPT after several attempts, I am not fluent in what goes on here and it may have issues
*/

function comparePokerHands(handPlayerB, handPlayerA) {
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

  function compareHighCards(valuesPlayerB, valuesPlayerA) {
    for (let i = 0; i < valuesPlayerB.length; i++) {
      if (valuesPlayerB[i] > valuesPlayerA[i]) return 1;
      if (valuesPlayerB[i] < valuesPlayerA[i]) return -1;
    }
    return 0;
  }

  const resultPlayerB = rankHand(handPlayerB);
  const resultPlayerA = rankHand(handPlayerA);

  if (resultPlayerB.rank > resultPlayerA.rank) {
    return {
      winner: 1,
      handPlayerBName: resultPlayerB.name,
      handPlayerAName: resultPlayerA.name,
      highCardPlayerB: resultPlayerB.highCard,
      highCardPlayerA: resultPlayerA.highCard,
    };
  } else if (resultPlayerB.rank < resultPlayerA.rank) {
    return {
      winner: -1,
      handPlayerBName: resultPlayerB.name,
      handPlayerAName: resultPlayerA.name,
      highCardPlayerB: resultPlayerB.highCard,
      highCardPlayerA: resultPlayerA.highCard,
    };
  } else {
    if (resultPlayerB.rank === 1) {
      // One Pair
      const pair1 = handPlayerB.find(
        (card) => handPlayerB.filter((c) => c.rank === card.rank).length === 2
      ).rankValue;
      const pair2 = handPlayerA.find(
        (card) => handPlayerA.filter((c) => c.rank === card.rank).length === 2
      ).rankValue;
      if (pair1 > pair2)
        return {
          winner: 1,
          handPlayerBName: resultPlayerB.name,
          handPlayerAName: resultPlayerA.name,
          highCardPlayerB: resultPlayerB.highCard,
          highCardPlayerA: resultPlayerA.highCard,
        };
      if (pair1 < pair2)
        return {
          winner: -1,
          handPlayerBName: resultPlayerB.name,
          handPlayerAName: resultPlayerA.name,
          highCardPlayerB: resultPlayerB.highCard,
          highCardPlayerA: resultPlayerA.highCard,
        };
    }
    if (resultPlayerB.rank === 2) {
      // Two Pairs
      const pairsPlayerB = handPlayerB
        .filter(
          (card) => handPlayerB.filter((c) => c.rank === card.rank).length === 2
        )
        .map((c) => c.rankValue)
        .sort((a, b) => b - a);
      const pairsPlayerA = handPlayerA
        .filter(
          (card) => handPlayerA.filter((c) => c.rank === card.rank).length === 2
        )
        .map((c) => c.rankValue)
        .sort((a, b) => b - a);
      for (let i = 0; i < pairsPlayerB.length; i++) {
        if (pairsPlayerB[i] > pairsPlayerA[i])
          return {
            winner: 1,
            handPlayerBName: resultPlayerB.name,
            handPlayerAName: resultPlayerA.name,
            highCardPlayerB: resultPlayerB.highCard,
            highCardPlayerA: resultPlayerA.highCard,
          };
        if (pairsPlayerB[i] < pairsPlayerA[i])
          return {
            winner: -1,
            handPlayerBName: resultPlayerB.name,
            handPlayerAName: resultPlayerA.name,
            highCardPlayerB: resultPlayerB.highCard,
            highCardPlayerA: resultPlayerA.highCard,
          };
      }
    }
    if (resultPlayerB.rank === 3) {
      // Three of a Kind
      const three1 = handPlayerB.find(
        (card) => handPlayerB.filter((c) => c.rank === card.rank).length === 3
      ).rankValue;
      const three2 = handPlayerA.find(
        (card) => handPlayerA.filter((c) => c.rank === card.rank).length === 3
      ).rankValue;
      if (three1 > three2)
        return {
          winner: 1,
          handPlayerBName: resultPlayerB.name,
          handPlayerAName: resultPlayerA.name,
          highCardPlayerB: resultPlayerB.highCard,
          highCardPlayerA: resultPlayerA.highCard,
        };
      if (three1 < three2)
        return {
          winner: -1,
          handPlayerBName: resultPlayerB.name,
          handPlayerAName: resultPlayerA.name,
          highCardPlayerB: resultPlayerB.highCard,
          highCardPlayerA: resultPlayerA.highCard,
        };
    }
    if (resultPlayerB.rank === 7) {
      // Four of a Kind
      const four1 = handPlayerB.find(
        (card) => handPlayerB.filter((c) => c.rank === card.rank).length === 4
      ).rankValue;
      const four2 = handPlayerA.find(
        (card) => handPlayerA.filter((c) => c.rank === card.rank).length === 4
      ).rankValue;
      if (four1 > four2)
        return {
          winner: 1,
          handPlayerBName: resultPlayerB.name,
          handPlayerAName: resultPlayerA.name,
          highCardPlayerB: resultPlayerB.highCard,
          highCardPlayerA: resultPlayerA.highCard,
        };
      if (four1 < four2)
        return {
          winner: -1,
          handPlayerBName: resultPlayerB.name,
          handPlayerAName: resultPlayerA.name,
          highCardPlayerB: resultPlayerB.highCard,
          highCardPlayerA: resultPlayerA.highCard,
        };
    }
    const highCardComparison = compareHighCards(
      resultPlayerB.values,
      resultPlayerA.values
    );

    if (highCardComparison > 0) {
      return {
        winner: 1,
        handPlayerBName: resultPlayerB.name,
        handPlayerAName: resultPlayerA.name,
        highCardPlayerB: resultPlayerB.highCard,
        highCardPlayerA: resultPlayerA.highCard,
      };
    } else if (highCardComparison < 0) {
      return {
        winner: -1,
        handPlayerBName: resultPlayerB.name,
        handPlayerAName: resultPlayerA.name,
        highCardPlayerB: resultPlayerB.highCard,
        highCardPlayerA: resultPlayerA.highCard,
      };
    } else {
      return {
        winner: 0,
        handPlayerBName: resultPlayerB.name,
        handPlayerAName: resultPlayerA.name,
        highCardPlayerB: resultPlayerB.highCard,
        highCardPlayerA: resultPlayerA.highCard,
      };
    }
  }
  //returns -1 for player B win, -1 for player A win, 0 for tie
}

module.exports = comparePokerHands;
