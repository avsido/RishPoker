function formatCardPair(str) {
    // returns name of pair (i.e 'Kings', '2's' etc.)
    const words = str.split(" ");

    words.splice(0, 2);

    const resultName = words.join(" ");

    return resultName;
}

function formatCard2Pairs(str) {
    // returns name of 2 pairs (i.e 'Kings and Queens', '2's and Jacks' etc.)
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
    // takes an array with 5 values ranging that can be either -1, 0 or 1
    // counts the values and returns winner
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