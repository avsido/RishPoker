class game {
  html =
    '<div id="divInfo">' +
    '<div id="divDeck">' +
    '<div id="imgDeck">' +
    '<img src="images/deck.png"></div>' +
    "</div>" +
    '<h1 class="count">· deck count: <span></span></h1>' +
    '<h1 class="status"></h1>' +
    "</div>" +
    "</div>" +
    '<div id="divPlayers">' +
    '<h2 id="divOpponentTitle">Opponent</h2>' +
    '<div id="divOpponent">' +
    '<div class="cardDiv cardDivPlayerB"></div>' +
    '<div class="cardDiv cardDivPlayerB"></div>' +
    '<div class="cardDiv cardDivPlayerB"></div>' +
    '<div class="cardDiv cardDivPlayerB"></div>' +
    '<div class="cardDiv cardDivPlayerB"></div>' +
    "</div>" +
    '<h2 id="divPlayerTitle">You</h2>' +
    '<div id="divPlayer">' +
    '<div class="cardDiv cardDivPlayerA"></div>' +
    '<div class="cardDiv cardDivPlayerA"></div>' +
    '<div class="cardDiv cardDivPlayerA"></div>' +
    '<div class="cardDiv cardDivPlayerA"></div>' +
    '<div class="cardDiv cardDivPlayerA"></div>' +
    "</div>" +
    "</div>";
  handInfoHtml =
    '<div class="divInfoPlayers opponent">' +
    "<h1>Opponent got:</h1>" +
    "<h2></h2>" +
    "<h2></h2>" +
    "<h2></h2>" +
    "<h2></h2>" +
    "<h2></h2>" +
    "</div>" +
    '<div class="divInfoPlayers player">' +
    "<h1>You got:</h1>" +
    "<h2></h2>" +
    "<h2></h2>" +
    "<h2></h2>" +
    "<h2></h2>" +
    "<h2></h2>" +
    "</div>" +
    '<h1 class="hBottomLine"></h1>';

  divDeck = null;
  divPlayers = null;
  divPlayer = null;
  divOpponent = null;
  divInfo = null;
  currentGame = null;
  playerTurn = true;
  revealspeed = 2000;
  constructor(currentGame) {
    this.currentGame = currentGame;
    this.divMain = document.querySelector("#divMain");
    this.divMain.classList.add("contains-game");
    this.divMain.innerHTML = this.html;
    //this.quitButton = document.querySelector("#buttQuit");
    this.divInfo = this.divMain.querySelector("#divInfo");
    this.status = this.divInfo.querySelector(".status");
    this.count = this.divInfo.querySelector(".count");
    this.divDeck = this.divMain.querySelector("#divDeck");
    this.divPlayers = this.divMain.querySelector("#divPlayers");
    this.divPlayer = this.divMain.querySelector("#divPlayer");
    this.divPlayerTitle = this.divMain.querySelector("#divPlayerTitle");
    this.playerColumns = this.divPlayer.querySelectorAll(".cardDiv");
    this.divOpponent = this.divMain.querySelector("#divOpponent");
    this.divOpponentTitle = this.divMain.querySelector("#divOpponentTitle");
    this.opponentColumns = this.divOpponent.querySelectorAll(".cardDiv");

    this.gamepot = new gamepot(this);
    this.divPlayerTitle.innerHTML = "~ " + this.currentGame.player.username;
    this.divOpponentTitle.innerHTML = "~ " + this.currentGame.opponent.username;

    // this.quitButton.classList.add("show");
    // this.quitButton.addEventListener("click", () => {
    //   this.quit();
    // });
    this.update(this.currentGame);

    this.playerColumns.forEach((column, colIndex) => {
      column.addEventListener("click", () => {
        if (
          column.classList.contains("valid") &&
          this.currentGame.turn == "player"
        ) {
          this.placeCard(colIndex);
        }
      });
    });
  }

  placeCard(colIndex) {
    let url = "/place_card/" + this.currentGame.id + "/" + colIndex;
    sendHttpGETReq(url, (res) => {
      if (res != "failed") {
      }
    });
  }
  addCards(cards, cardColumns) {
    cards.forEach((colCards, colIndex) => {
      colCards.forEach((card, rowIndex) => {
        this.addCard(card, cardColumns, colIndex, rowIndex);
      });
    });
  }
  addCard(data, columns, col, row) {
    let imgCard = document.createElement("img"),
      hidden = columns[col].parentElement.id == "divOpponent" && row == 4,
      imgSrc = "images/" + data.name.toLowerCase() + ".png";
    imgCard.style.zIndex += 1;
    if (hidden) {
      imgCard.dataset.hidden = imgSrc;
      imgSrc = "images/anon_card.png";
    }
    imgCard.src = imgSrc;
    columns[col].appendChild(imgCard);
  }
  addDraw() {
    //console.log(this);
    if (this.currentGame.cards.drawn) {
      let img = document.createElement("img");
      img.id = "drawnCard";
      img.src =
        "images/" + this.currentGame.cards.drawn.name.toLowerCase() + ".png";
      this.divDeck.appendChild(img);
    }
  }
  clear() {
    this.divPlayers.querySelectorAll(".cardDiv img").forEach((card) => {
      card.remove();
    });
    let draw = document.querySelector("#drawnCard");
    if (draw) {
      draw.remove();
    }
  }
  update(currentGame) {
    this.currentGame = currentGame;
    window.current_user = currentGame.player;
    let bets = this.currentGame.bets;
    this.currentRow = 4 - Math.floor((this.currentGame.cardsLeft - 2) / 10);
    this.rowComplete =
      (this.currentGame.cardsLeft - 2) % 10 == 0 &&
      !this.currentGame.cards.drawn;
    this.betsDone = bets.player == bets.opponent && bets.player != 0;
    this.betting = this.rowComplete && !this.betsDone;
    this.playerTurn = this.currentGame.turn == "player";
    this.playerCards = this.currentGame.cards.player;
    this.opponentCards = this.currentGame.cards.opponent;

    this.divMain.classList[this.betting ? "add" : "remove"]("betting");
    this.divMain.classList[this.playerTurn ? "add" : "remove"]("playerTurn");

    this.playerColumns.forEach((column, colIndex) => {
      let validCol = this.playerCards[colIndex][this.currentRow];
      column.classList[validCol ? "remove" : "add"]("valid");
    });

    this.clear();
    this.addCards(this.playerCards, this.playerColumns);
    this.addCards(this.opponentCards, this.opponentColumns, "opponent");
    //console.log(this.opponentCards);
    this.addDraw();
    this.count.innerHTML = "deck count:" + this.currentGame.cardsLeft;
    let statusMsg = "&middot; ";
    if (!currentGame.results) {
      if (this.betting) {
        statusMsg += "place bet";
      } else {
        statusMsg += this.playerTurn ? "place card" : "opponent's turn";
      }
      this.playerTurn
        ? this.divPlayers.classList.add("playerTurn")
        : this.divPlayers.classList.remove("playerTurn");
      this.status.innerHTML = statusMsg;
      this.gamepot.update();
      //console.log(window.userBoxEl);
      window.userBoxEl.update();
    } else {
      this.finish();
    }
  }
  quit() {
    let url = "/leave/" + this.currentGame.id;
    sendHttpGETReq(url, (res) => {
      this.remove();
    });
  }

  resolveAfterOpponentQuit(matchId) {
    if (matchId != this.currentGame.id) {
      return false;
    }
    this.remove();
    let popupMsg =
      "opponent left <br/> current game pot is: " +
      this.currentGame.pot.toString();
    new popup(popupMsg, () => {
      this.remove();
    });
    //debugger;
    window.userBoxEl.update();
  }

  remove() {
    this.divMain.innerHTML = "";
    this.quitButton.classList.remove("show");
    this.divMain.classList.remove("contains-game");
    this.divMain.classList.remove("player-turn");
    this.gamepot.remove();
    greet();
  }
  finish() {
    this.divInfo.innerHTML = this.handInfoHtml;
    this.divMain.classList.remove("betting");
    let handIndex = 0,
      playerTitles = this.divInfo.querySelectorAll(".player h2"),
      opponentTitles = this.divInfo.querySelectorAll(".opponent h2"),
      bottomLine = this.divInfo.querySelector(".hBottomLine"),
      wins = { player: 0, opponent: 0 },
      interval;
    interval = setInterval(() => {
      let handResult = this.currentGame.results[handIndex],
        playerTitle = playerTitles[handIndex],
        opponentTitle = opponentTitles[handIndex],
        playerColumn = this.playerColumns[handIndex],
        opponentColumn = this.opponentColumns[handIndex],
        bottomMsg = "a tie",
        hiddenCard = opponentColumn.querySelector("img[data-hidden]");
      hiddenCard.src = hiddenCard.dataset.hidden;
      playerTitle.innerHTML = handResult.hands.player;
      opponentTitle.innerHTML = handResult.hands.opponent;
      if (handResult.winner != "tie") {
        let winningTitle =
          handResult.winner == "player" ? playerTitle : opponentTitle;
        winningTitle.classList.add("won");
        playerColumn.classList.add(
          handResult.winner == "player" ? "won" : "lost"
        );
        opponentColumn.classList.add(
          handResult.winner == "opponent" ? "won" : "lost"
        );
        bottomMsg =
          "hand " + (handResult.winner == "player" ? " won" : " lost");
        wins[handResult.winner]++;
      }
      if (handIndex == 4) {
        if (wins.player == wins.opponent) {
          bottomMsg = "Game tied!";
        } else {
          bottomMsg = "You " + (wins.player > wins.opponent ? "won" : "lost");
        }
        let popupMsg =
          bottomMsg + ".<br/>Your share: " + this.currentGame.share.toString();
        new popup(popupMsg, () => {
          this.remove();
          greet();
        });
        clearInterval(interval);
      }
      bottomLine.innerHTML = bottomMsg;
      handIndex++;
    }, this.revealspeed);
  }
}
