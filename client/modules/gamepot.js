class gamepot {
  html =
    '<div class="betters">' +
    '<div class="opponent pot-divs">' +
    '<div class="name"></div>' +
    '<div class="credit"></div>' +
    '<div class="bet"></div>' +
    "</div>" +
    '<div class="pot pot-divs"></div>' +
    '<div class="player pot-divs">' +
    '<div class="name"></div>' +
    '<div class="credit"></div>' +
    '<div class="bet">' + /////////////////////////////////////////////////////////////
    '<div class="amountMaxNumbers">' +
    '<div class="amount"></div>' +
    '<div class="max"></div>' +
    "</div>" +
    '<input id="scroller" type="range" step=5 placeholder="bet" />' +
    '<div class="buttons">' +
    '<a class="bet" href="javascript:void(0);">BET</a>' +
    '<a class="quit" href="javascript:void(0);">QUIT</a>' +
    "</div>" +
    "</div>" + /////////////////////////////////////////////////////////////
    "</div>" +
    "</div>";
  el = null;
  data = {};
  constructor(parent) {
    this.parent = parent;
    this.container = document.querySelector("#pot-container");
    this.container.innerHTML = this.html;
    this.el = this.container.querySelector(".betters");
    this.opponentCredit = this.el.querySelector(".opponent .credit");
    this.opponentName = this.el.querySelector(".opponent .name");
    this.opponentBet = this.el.querySelector(".opponent .bet");
    this.playerCredit = this.el.querySelector(".player .credit");
    this.playerName = this.el.querySelector(".player .name");
    this.potamount = this.el.querySelector(".pot");
    this.betButton = this.el.querySelector(".buttons .bet");
    this.quitButton = this.el.querySelector(".buttons .quit");
    this.betAmount = this.el.querySelector(".player>.bet .amount");
    this.maxAmount = this.el.querySelector(".player>.bet .max");
    this.input = this.el.querySelector(".player>.bet input");

    this.input.addEventListener("input", () => {
      this.betAmount.innerHTML = this.input.value;
    });
    this.betButton.addEventListener("click", () => {
      console.log(this.betsDisabled);
      if (!this.betsDisabled) {
        this.bet(this.input.value);
      }
    });
    this.quitButton.addEventListener("click", () => {
      this.parent.quit();
    });
  }
  update() {
    let currentGame = this.parent.currentGame,
      bets = currentGame.bets,
      betMargin = bets.opponent - bets.player,
      maxBet = Math.min(
        currentGame.pot,
        currentGame.player.credit,
        currentGame.opponent.credit
      ),
      firstGameBet =
        this.parent.currentRow == 1 &&
        currentGame.first == "opponent" &&
        this.parent.betting &&
        bets.opponent == 0 &&
        bets.checked != "opponent",
      minValue = betMargin > 0 ? betMargin : 0;
    this.betsDisabled =
      bets.player > bets.opponent || bets.checked == "player" || firstGameBet;
    this.input.setAttribute("min", minValue);
    this.input.setAttribute("max", currentGame.pot);
    this.input.value = minValue;
    this.betAmount.innerHTML = this.input.value;
    this.maxAmount.innerHTML = maxBet;
    this.opponentBet.innerHTML =
      "+" + (currentGame.bets.opponent - currentGame.bets.player).toString();
    this.opponentCredit.innerHTML = "credit: " + currentGame.opponent.credit;
    this.opponentName.innerHTML = "player: " + currentGame.opponent.username;
    this.playerCredit.innerHTML = "credit: " + currentGame.player.credit;
    this.playerName.innerHTML = "player: " + currentGame.player.username;
    this.potamount.innerHTML = "shared pot: " + currentGame.pot;
    this.container.classList[this.parent.betting ? "add" : "remove"]("betting");
    this.container.classList[this.betsDisabled ? "add" : "remove"](
      "bets-disabled"
    );
  }
  bet(amount) {
    let url = "/place_bet/" + this.parent.currentGame.id + "/" + amount;
    sendHttpGETReq(url, (res) => {});
  }
  validate(amount) {}
  remove() {
    this.el.remove();
  }
}
