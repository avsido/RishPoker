class ChinPok {
  constructor() {
    this.suits = ["Hearts", "Spades", "Clubs", "Diamonds"];
    this.ranks = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "Jack",
      "Queen",
      "King",
      "Ace",
    ];
    this.rankValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    this.deck = [];
    this.playerCards = [];
    this.computerCards = [];
    this.setDeck();
    this.shuffleDeck();
    this.dealHands();
  }
  setDeck() {
    for (let i = 0; i < this.suits.length; i++) {
      for (let j = 0; j < this.ranks.length; j++) {
        let card = {};
        card.suit = this.suits[i];
        card.rank = this.ranks[j];
        card.rankValue = this.rankValues[j];
        card.name = this.ranks[j] + "_of_" + this.suits[i];
        this.deck.push(card);
      }
    }
  }
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }
  dealHands() {
    for (let i = 0; i < 5; i++) {
      this.playerCards.push([this.deck.pop()]);
      this.computerCards.push([this.deck.pop()]);
    }
  }
  drawCard() {
    return this.deck.pop();
  }
}
module.exports = ChinPok;
