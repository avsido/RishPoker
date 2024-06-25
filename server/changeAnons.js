function changeAnons(cardsListOpponent) {
  for (let i = 0; i < cardsListOpponent.length; i++) {
    if (cardsListOpponent[i].length > 4) {
      cardsListOpponent[i].pop();
      cardsListOpponent[i].push({ name: "anon_card" });
    }
  }
}

module.exports = changeAnons;
