class gamepot {
  html =
    '<div class="betters">' +
    '<div class="opponent pot-divs">' +
    '<div class="name"></div>' +
    '<div class="credit"></div>' +
    '<div class="bet"></div>' +
    "</div>" +
    '<div class="pot-amount-container"><img class="chest-image" src="images/chest.png"/><br><div class="pot-amount"</div></div></div>' +
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
    '<a class="bet" href="javascript:void(0);">CALL</a>' +
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
    this.potamount = this.el.querySelector(".pot-amount-container .pot-amount");
    this.betButton = this.el.querySelector(".buttons .bet");
    this.quitButton = this.el.querySelector(".buttons .quit");
    this.betAmount = this.el.querySelector(".player>.bet .amount");
    this.maxAmount = this.el.querySelector(".player>.bet .max");
    this.input = this.el.querySelector(".player>.bet input");

    this.input.addEventListener("input", () => {
      this.betAmount.innerHTML = this.input.value;
      this.updateButton();

    });
    this.betButton.addEventListener("click", () => {
      if (!this.betsDisabled) {
        this.bet(this.input.value);
      }
    });
    this.quitButton.addEventListener("click", () => {
      this.parent.quit();
    });
  }
  updateButton(){
    let val = parseFloat(this.input.value),
        min = parseFloat(this.input.min),
        buttonType = val==0 ? 'check':val>min ? 'raise':'call';
    this.betButton.classList.remove('raise');
    this.betButton.classList.remove('call');
    this.betButton.classList.remove('check');

    this.betButton.classList.add(buttonType);
    this.betButton.innerHTML = buttonType.toUpperCase();
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
    this.betsDisabled = bets.player > bets.opponent || bets.checked == "player" || firstGameBet || bets.checked==true;
    this.input.min = minValue;
    this.input.max = currentGame.pot;
    this.input.value = minValue;
    this.betAmount.innerHTML = this.input.value;
    this.maxAmount.innerHTML = maxBet;
    this.opponentBet.innerHTML = "+" + (currentGame.bets.opponent - currentGame.bets.player).toString();
    this.opponentCredit.innerHTML = "💰 $" + currentGame.opponent.credit;
    this.opponentName.innerHTML = "Player: " + currentGame.opponent.username;
    this.playerCredit.innerHTML = "💰 $" + currentGame.player.credit;
    this.playerName.innerHTML = "Player: " + currentGame.player.username;
    this.potamount.innerHTML = "Shared pot: " + currentGame.pot;
    this.container.classList[this.parent.betting ? "add" : "remove"]("betting");
    this.container.classList[this.betsDisabled ? "add" : "remove"](
      "bets-disabled"
    );
    this.updateButton();
  }
  bet(amount) {
    let url = "/place_bet/" + this.parent.currentGame.id + "/" + amount;
    app.getRequest(url, (res) => {});
  }
  validate(amount) {}
  remove() {
    this.el.remove();
  }
}
