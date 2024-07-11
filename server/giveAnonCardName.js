function giveAnonCardName(cardsListOpponent) {
  // this func helps in displaying the last/fifth card in each opponent hand as upside-down
  for (let i = 0; i < cardsListOpponent.length; i++) {
    if (cardsListOpponent[i].length > 4) {
      cardsListOpponent[i].pop();
      cardsListOpponent[i].push({ name: "anon_card" });
    }
  }
}

module.exports = giveAnonCardName;
