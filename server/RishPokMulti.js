/*
  game class for single player
  creates deck
  shuffles it
  sets starter cards for each player
  shoots current drawn cards to players in their turn
  in double player scenario this will 'reserve' (make a copy of) last 2 cards in the deck (wild cards) because I concluded
  that if a player chooses to play his/her Wild Card, the Wild Card must be re-sent to the player, and this was a problem,
  because the first time 'pops' it out of the cards array. so 'reserving' them solves it. (getWildCards() method)
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
    this.wildCardA = null;
    this.wildCardB = null;
    this.gameMode = "double";
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
  getWildCards() {
    [this.wildCardA, this.wildCardB] = this.deck.slice(0, 2);
    return [this.wildCardA, this.wildCardB];
  }
}
module.exports = RishPok;
