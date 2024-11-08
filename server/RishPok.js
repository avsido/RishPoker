/*
  game class for single player
  creates deck
  shuffles it
  sets starter cards for each player
  shoots current drawn cards to players in their turn
  in single player scenario this will also say if it's the player's turn or computer's
*/

class RishPok {
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
    this.playerACards = [];
    this.playerBCards = [];
    this.setDeck();
    this.shuffleDeck();
    this.dealHands();
    this.playerATurn = true;
    this.gameMode = "single";
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
      this.playerACards.push([this.deck.pop()]);
      this.playerBCards.push([this.deck.pop()]);
    }
  }
  drawCard() {
    return this.deck.pop();
  }
}
module.exports = RishPok;
