class game {
  html =
    '<div id="divInfo">' +
    '<div id="divDeck">' +
    '<div id="imgDeck">' +
    '<img src="images/deck.png"></div>' +
    "</div>" +
    '<h1 class="count"> Deck count: <span></span></h1>' +
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
    this.divPlayerTitle.innerHTML = this.currentGame.player.username;
    this.divOpponentTitle.innerHTML = this.currentGame.opponent.username;

    // this.quitButton.classList.add("show");
    // this.quitButton.addEventListener("click", () => {
    //   this.quit();
    // });
    this.update(this.currentGame);
    this.setPageEvents(); ///////////////////////////////////////AVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVI
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
  ///////////////////////////////////////AVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVI
  // setPageEvents() {
  //   window.addEventListener("unload", (event) => {
  //     this.leaveGamePage();
  //     // event.preventDefault();
  //     // event.returnValue = "";
  //   });
  //   window.addEventListener("beforeunload", (event) => {
  //     this.leaveGamePage();
  //     // event.preventDefault();
  //     // event.returnValue = "";
  //   });
  // }

  setPageEvents() {
    window.removeEventListener("unload", this.handleUnload);
    window.removeEventListener("Beforeunload", this.handleBeforeUnload);
    this.handleUnload = (ev) => {
      this.leaveGamePage();
    };
    this.handleBeforeUnload = (ev) => {
      this.leaveGamePage();
    };
    window.addEventListener("unload", this.handleUnload);
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  }
  leaveGamePage() {
    let url = "/leave_game_page/" + this.currentGame.id;
    app.getRequest(url, (res) => {
      this.remove();
    });
  }
  ///////////////////////////////////////AVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVIAVI
  placeCard(colIndex) {
    let url = "/place_card/" + this.currentGame.id + "/" + colIndex;
    app.getRequest(url, (res) => {
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
      imgSrc = "images/" + data.name.toLowerCase() + ".png",
      moveMargin = data.move - this.lastMove;
    if (moveMargin > 0 || this.currentGame.move == 0) {
      imgCard.classList.add("hide");
      imgCard.classList.add("animate");
    }
    if (hidden) {
      imgCard.dataset.hidden = imgSrc;
      imgSrc = "images/anon_card.png";
    }
    imgCard.src = imgSrc;
    columns[col].appendChild(imgCard);
    if (moveMargin > 0 || this.currentGame.move == 0) {
      imgCard.classList.add("delay-animation-" + moveMargin.toString());
      window.setTimeout(() => {
        imgCard.classList.remove("hide");
      }, 25);
    }
  }
  addDraw() {
    let draw = this.currentGame.cards.drawn,
      drawImage = document.querySelector("#drawnCard");
    if (draw) {
      let anon = !draw.rankValue,
        imageSrc = "images/" + draw.name.toLowerCase() + ".png";
      if (drawImage) {
        if (anon) {
          drawImage.remove();
          this.createDraw(imageSrc);
        } else {
          drawImage.src = imageSrc;
        }
      } else {
        this.createDraw(imageSrc);
      }
    } else {
      if (drawImage) {
        drawImage.remove();
      }
    }
  }
  createDraw(imageSrc) {
    let drawImage = document.createElement("img");
    drawImage.id = "drawnCard";
    drawImage.src = imageSrc;
    this.divDeck.appendChild(drawImage);
  }
  clearCards() {
    this.divPlayers.querySelectorAll(".cardDiv img").forEach((card) => {
      card.remove();
    });
  }
  update(currentGame) {
    this.lastMove = this.currentGame.move;
    this.currentGame = currentGame;
    app.user = currentGame.player;
    let bets = this.currentGame.bets;
    this.currentRow = 4 - Math.floor((this.currentGame.cardsLeft - 2) / 10);
    this.rowComplete =
      (this.currentGame.cardsLeft - 2) % 10 == 0 &&
      !this.currentGame.cards.drawn;
    this.betting = bets.checked !== true;
    this.playerTurn = this.currentGame.turn == "player";
    this.playerCards = this.currentGame.cards.player;
    this.opponentCards = this.currentGame.cards.opponent;

    this.divMain.classList[this.betting ? "add" : "remove"]("betting");
    this.divMain.classList[this.playerTurn ? "add" : "remove"]("playerTurn");

    this.playerColumns.forEach((column, colIndex) => {
      let validCol = this.playerCards[colIndex][this.currentRow];
      column.classList[validCol ? "remove" : "add"]("valid");
    });

    this.clearCards();
    this.addCards(this.playerCards, this.playerColumns);
    this.addCards(this.opponentCards, this.opponentColumns, "opponent");
    this.addDraw();
    this.count.innerHTML = this.currentGame.cardsLeft + " cards left";
    let statusMsg = "";
    if (!currentGame.results) {
      if (this.betting) {
        statusMsg += "Place bet";
      } else {
        statusMsg += this.playerTurn ? "✅ Place card" : "🕰️ Opponent's turn";
      }
      this.playerTurn
        ? this.divPlayers.classList.add("playerTurn")
        : this.divPlayers.classList.remove("playerTurn");
      this.status.innerHTML = statusMsg;
      this.gamepot.update();
      window.userBoxEl.update();
    } else {
      this.finish();
    }
  }
  quit() {
    let url = "/leave/" + this.currentGame.id;
    app.getRequest(url, (res) => {
      this.remove();
    });
  }

  resolveAfterOpponentQuit(matchId) {
    if (matchId != this.currentGame.id) {
      return false;
    }
    this.remove();
    let popupMsg =
      "Opponent left. <br/> Current game pot is: $" +
      this.currentGame.pot.toString();
    new popup(popupMsg, () => {
      this.remove();
    });
    //debugger;
    window.userBoxEl.update();
  }

  remove() {
    this.divMain.innerHTML = "";
    // this.quitButton.classList.remove("show");
    this.divMain.classList.remove("contains-game");
    this.divMain.classList.remove("player-turn");
    this.gamepot.remove();
    greet();
  }
  finish() {
    this.divInfo.innerHTML = this.handInfoHtml;
    this.divMain.classList.remove("betting");
    this.gamepot.update();
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
          "Hand " + (handResult.winner == "player" ? " won" : " lost");
        wins[handResult.winner]++;
      }
      if (handIndex == 4) {
        if (wins.player == wins.opponent) {
          bottomMsg = "⚖️ <br>Game tied!";
        } else {
          bottomMsg =
            wins.player > wins.opponent ? "🍾<br>You won" : "👎<br>You lost";
        }
        let popupMsg =
          bottomMsg + ".<br/>Your share: $" + this.currentGame.share.toString();
        new popup(popupMsg, () => {
          this.remove();
        });
        clearInterval(interval);
      }
      bottomLine.innerHTML = bottomMsg;
      handIndex++;
    }, this.revealspeed);
  }
}
