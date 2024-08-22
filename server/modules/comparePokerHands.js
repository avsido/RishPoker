function comparePokerHands(hand1, hand2) {
  function getHandRank(hand) {
    const ranks = hand.map((card) => card.rankValue).sort((a, b) => b - a);
    const suits = hand.map((card) => card.suit);
    const rankCounts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    const countValues = Object.values(rankCounts).sort((a, b) => b - a);

    const isFlush = suits.every((suit) => suit === suits[0]);
    const isStraight = ranks.every(
      (rank, index) =>
        index === 0 ||
        rank === ranks[index - 1] - 1 ||
        (ranks[0] === 14 && ranks[1] === 5 && rank === ranks[index - 1])
    );

    const highCard = hand.reduce((high, card) =>
      card.rankValue > high.rankValue ? card : high
    );

    if (isFlush && isStraight && ranks[0] === 14)
      return { name: "Royal Flush", rank: 10, values: ranks, highCard };
    if (isFlush && isStraight)
      return { name: "Straight Flush", rank: 9, values: ranks, highCard };
    if (countValues[0] === 4) {
      const fourOfAKindRank = Number(
        Object.keys(rankCounts).find((rank) => rankCounts[rank] === 4)
      );
      return {
        name: `Four of a Kind (${getRankName(fourOfAKindRank)}s)`,
        rank: 8,
        values: [
          fourOfAKindRank,
          ...ranks.filter((r) => r !== fourOfAKindRank),
        ],
        highCard,
      };
    }
    if (countValues[0] === 3 && countValues[1] === 2) {
      const threeOfAKindRank = Number(
        Object.keys(rankCounts).find((rank) => rankCounts[rank] === 3)
      );
      const pairRank = Number(
        Object.keys(rankCounts).find((rank) => rankCounts[rank] === 2)
      );
      return {
        name: `Full House (${getRankName(threeOfAKindRank)}s over ${getRankName(pairRank)}s)`,
        rank: 7,
        values: [threeOfAKindRank, pairRank],
        highCard,
      };
    }
    if (isFlush) return { name: "Flush", rank: 6, values: ranks, highCard };
    if (isStraight)
      return { name: "Straight", rank: 5, values: ranks, highCard };
    if (countValues[0] === 3) {
      const threeOfAKindRank = Number(
        Object.keys(rankCounts).find((rank) => rankCounts[rank] === 3)
      );
      return {
        name: `Three of a Kind (${getRankName(threeOfAKindRank)}s)`,
        rank: 4,
        values: [
          threeOfAKindRank,
          ...ranks.filter((r) => r !== threeOfAKindRank),
        ],
        highCard,
      };
    }
    if (countValues[0] === 2 && countValues[1] === 2) {
      const pairs = Object.keys(rankCounts)
        .filter((rank) => rankCounts[rank] === 2)
        .map(Number)
        .sort((a, b) => b - a);
      return {
        name: `Two Pair (${getRankName(pairs[0])}s and ${getRankName(pairs[1])}s)`,
        rank: 3,
        values: [...pairs, ...ranks.filter((r) => !pairs.includes(r))],
        highCard,
      };
    }
    if (countValues[0] === 2) {
      const pairRank = Number(
        Object.keys(rankCounts).find((rank) => rankCounts[rank] === 2)
      );
      return {
        name: `Pair of ${getRankName(pairRank)}s`,
        rank: 2,
        values: [pairRank, ...ranks.filter((r) => r !== pairRank)],
        highCard,
      };
    }
    return {
      name: `High Card ${getRankName(ranks[0])}`,
      rank: 1,
      values: ranks,
      highCard,
    };
  }

  function getRankName(rankValue) {
    const rankNames = { 14: "Ace", 13: "King", 12: "Queen", 11: "Jack" };
    return rankNames[rankValue] || rankValue.toString();
  }

  const resultPlayerA = getHandRank(hand1);
  const resultPlayerB = getHandRank(hand2);

  if (resultPlayerA.rank !== resultPlayerB.rank) {
    return {
      winner: resultPlayerA.rank > resultPlayerB.rank ? -1 : 1,
      handPlayerBName: resultPlayerB.name,
      handPlayerAName: resultPlayerA.name,
      highCardPlayerB: resultPlayerB.highCard.name,
      highCardPlayerA: resultPlayerA.highCard.name,
    };
  }

  for (
    let i = 0;
    i < Math.max(resultPlayerA.values.length, resultPlayerB.values.length);
    i++
  ) {
    if ((resultPlayerA.values[i] || 0) > (resultPlayerB.values[i] || 0)) {
      return {
        winner: -1,
        handPlayerBName: resultPlayerB.name,
        handPlayerAName: resultPlayerA.name,
        highCardPlayerB: resultPlayerB.highCard.name,
        highCardPlayerA: resultPlayerA.highCard.name,
      };
    }
    if ((resultPlayerA.values[i] || 0) < (resultPlayerB.values[i] || 0)) {
      return {
        winner: 1,
        handPlayerBName: resultPlayerB.name,
        handPlayerAName: resultPlayerA.name,
        highCardPlayerB: resultPlayerB.highCard.name,
        highCardPlayerA: resultPlayerA.highCard.name,
      };
    }
  }

  return {
    winner: 0,
    handPlayerBName: resultPlayerB.name,
    handPlayerAName: resultPlayerA.name,
    highCardPlayerB: resultPlayerB.highCard.name,
    highCardPlayerA: resultPlayerA.highCard.name,
  };
}

module.exports = comparePokerHands;
