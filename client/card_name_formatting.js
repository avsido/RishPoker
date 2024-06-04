
function formatCardPair(str) {
  const words = str.split(" ");

  words.splice(0, 2);

  const resultName = words.join(" ");

  return resultName;
}

function formatCard2Pairs(str) {
  const cardPart = str.substring("".length);

  const cardRanks = cardPart
    .match(/(\d+|[A-Za-z]+)&/g)
    .map((rank) => rank.slice(0, -1));

  const uniqueRanks = [...new Set(cardRanks)];

  const formattedRanks = uniqueRanks.map((rank) => {
    if (!isNaN(rank)) {
      return `${rank}'s`;
    } else {
      if (["Jack", "Queen", "King"].includes(rank)) {
        return `${rank}s`;
      } else {
        return rank;
      }
    }
  });

  return formattedRanks.join(" & ");
}

function countOnesAndMinusOnes(winArr) {
  let counter = 0;
  let counterMinus = 0;
  for (let i = 0; i < winArr.length; i++) {
    if (winArr[i] == 1) counter += 1;
    else if (winArr[i] == -1) counterMinus += 1;
  }
  if (counter > counterMinus) {
    return -1;
  } else if (counter < counterMinus) return 1;
  return 0;
}


