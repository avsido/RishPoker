function renderMultiplayer() {
  gameMode = currentGame.gameMode;
  cleanElement(divDeck);
  cleanElement(divPlayers);
  cleanElement(divPlayerB);
  cleanElement(divPlayerA);
  cleanElement(divInfo);
  removeElementByQuery("chat");

  let chat = document.createElement("button");
  chat.id = "chat";
  chat.innerHTML = "Chat";
  chat.className = "buttPlay buttStartChat";

  chat.onclick = chatWindow;

  document.body.appendChild(chat);

  divMain.style.flexDirection = "row";

  let playerCards;
  let opponentCards;
  let playedWildCard;
  let readyToFlip;

  if (currentGame.player == "a") {
    playerCards = currentGame.playerACards;
    opponentCards = currentGame.playerBCards;
    playedWildCard = currentGame.playerAPlayedWildCard;
    readyToFlip = currentGame.playerAFlipReady;
  }
  if (currentGame.player == "b") {
    playerCards = currentGame.playerBCards;
    opponentCards = currentGame.playerACards;
    playedWildCard = currentGame.playerBPlayedWildCard;
    readyToFlip = currentGame.playerBFlipReady;
  }

  let hStatus = document.createElement("h1");
  let hCardsleft = document.createElement("h1");

  hCardsleft.innerHTML = "&middot; deck count: " + currentGame.cardsLeft;

  let imgDeck = document.createElement("img");
  imgDeck.src = "images/deck.png";
  let divImgDeck = document.createElement("div");
  divImgDeck.id = "imgDeck";

  divImgDeck.appendChild(imgDeck);

  if (currentGame.cardsLeft >= 2) {
    divDeck.appendChild(divImgDeck);
  }

  //drawn card:
  let imgDrawnCard = document.createElement("img");

  if (drawnCard) {
    if (!playedWildCard) {
      imgDrawnCard.src = "images/" + drawnCard.name + ".png";
      imgDrawnCard.id = "drawnCard";
      if (currentGame.cardsLeft == 1 || currentGame.cardsLeft == 0) {
        imgDrawnCard.style.marginLeft = "75px";
        hStatus.innerHTML = "&middot; play wild card or flip";
        if (currentGame.cardsLeft == 0) {
          imgDrawnCard.style.animation = "none";
          imgDrawnCard.style.width = "30%";
        }
      } else {
        hStatus.innerHTML = "&middot; your turn to place card";
      }
    } else {
      hStatus.innerHTML = "&middot; played wild card";
    }
  } else {
    if (currentGame.cardsLeft == 0) {
      hStatus.innerHTML = "&middot; played wild card";
    } else {
      hStatus.innerHTML = "&middot; opponent's turn, please wait";
      imgDrawnCard.id = "waitGif";
      imgDrawnCard.src = "images/5.gif";
    }
  }

  divDeck.appendChild(imgDrawnCard);
  divInfo.append(divDeck, hCardsleft, hStatus);
  divMain.appendChild(divInfo);

  let hPlayerB = document.createElement("h2");
  hPlayerB.innerHTML = "Opponent";
  let hPlayerA = document.createElement("h2");
  hPlayerA.innerHTML = "You";

  //opponent cards
  for (let i = 0; i < opponentCards.length; i++) {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("cardDiv", "cardDivPlayerB");
    for (let j = 0; j < opponentCards[i].length; j++) {
      let imgCard = document.createElement("img");
      imgCard.style.zIndex += 1;
      imgCard.src = "images/" + opponentCards[i][j].name.toLowerCase() + ".png";
      cardDiv.appendChild(imgCard);
    }

    divPlayerB.appendChild(cardDiv);
  }
  //cards player
  /// TRY to fuse this loop into the next (SAME LOOP).
  let temp = 1;
  for (let i = 0; i < playerCards.length; i++) {
    if (playerCards[i].length > temp) {
      temp = playerCards[i].length;
    }
  }
  for (let i = 0; i < playerCards.length; i++) {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("cardDiv", "cardDivPlayerA");
    if (drawnCard) {
      if (
        playerCards.every((hand) => hand.length == temp) ||
        playerCards[i].length < temp
      ) {
        cardDiv.classList.add("cardDivPlayerAPlay");
      }
      if (currentGame.cardsLeft <= 1) {
        cardDiv.classList.remove("cardDivPlayerAPlay");
      }
    }

    for (let j = 0; j < playerCards[i].length; j++) {
      let imgCard = document.createElement("img");
      if (j == 4) {
        if (currentGame.cardsLeft <= 1) {
          if (!playedWildCard && drawnCard) {
            imgCard.classList.add("imgCardPlayerWild");
            imgCard.onclick = (ev) => {
              let divPop = document.createElement("div");
              divPop.className = "divPop";
              let divPopLeft = document.createElement("div");
              divPopLeft.id = "divPopLeft";
              let hLeft = document.createElement("h1");
              hLeft.innerHTML = "wild card:";
              let cardImgWildCard = document.createElement("img");
              cardImgWildCard.src =
                "images/" + drawnCard.name.toLowerCase() + ".png";
              divPopLeft.append(hLeft, cardImgWildCard);
              let divPopRight = document.createElement("div");
              divPopRight.id = "divcPopRight";
              let hRight = document.createElement("h1");
              hRight.innerHTML = "your switch card:";
              divPopRight.id = "divPopRight";
              let innerDivPop = document.createElement("div");
              innerDivPop.id = "innerDivPop";
              let divOverlay = document.createElement("div");
              divOverlay.className = "divOverlay";
              for (let k = 0; k < playerCards[i].length; k++) {
                let img = document.createElement("img");

                img.src =
                  "images/" + playerCards[i][k].name.toLowerCase() + ".png";
                if (k == 4) {
                  img.id = "innerDivPopFifth";
                }
                innerDivPop.appendChild(img);
              }
              let buttSwitch = document.createElement("button");
              buttSwitch.innerHTML = "Switch";
              buttSwitch.className = "buttGame";
              let buttCancel = document.createElement("button");
              let divCancel = document.createElement("div");
              divCancel.className = "divCancel";
              let hOr = document.createElement("h1");
              hOr.innerHTML = "or ";
              buttCancel.innerHTML = "Cancel";
              buttCancel.className = "buttGame";
              divCancel.append(buttSwitch, hOr, buttCancel);
              divPopRight.append(hRight, innerDivPop, divCancel);
              divPop.append(divPopRight, divPopLeft); //IRONICALLY right is left and left is right.. dumb amirite..
              document.body.appendChild(divOverlay);
              document.body.appendChild(divPop);
              buttSwitch.onclick = () => {
                document.body.removeChild(divPop);
                document.body.removeChild(divOverlay);
                cleanElement(divDeck);
                divDeck.className = "divDeckFinal";
                io_client.emit("place-wild-card", { hand: i, card: j });
              };
              buttCancel.onclick = () => {
                document.body.removeChild(divPop);
                document.body.removeChild(divOverlay);
              };
            };
          }
        }
      }
      imgCard.src = "images/" + playerCards[i][j].name.toLowerCase() + ".png";
      cardDiv.appendChild(imgCard);
    }
    cardDiv.onclick = (ev) => {
      if (!drawnCard) {
        return;
      }
      if (currentGame.cardsLeft > 1) {
        io_client.emit("place-card", i);
      }
    };
    divPlayerA.appendChild(cardDiv);
  }

  divPlayers.append(hPlayerB, divPlayerB, hPlayerA, divPlayerA);
  divMain.appendChild(divPlayers);

  buttCheckWin = document.createElement("button");
  buttCheckWin.id = "buttCheckWin";
  buttCheckWin.innerHTML = playedWildCard ? "flip!" : "ready to flip";
  buttCheckWin.onclick = (ev) => {
    divInfo.removeChild(ev.target);
    hCardsleft.innerHTML = " ";
    hStatus.innerHTML = "&middot; great, now wait for opponent response";
    io_client.emit("client-ready-to-flip");

    let wildCards = Array.from(
      document.getElementsByClassName("imgCardPlayerWild")
    );

    for (let i = 0; i < wildCards.length; i++) {
      wildCards[i].onclick = null;
      wildCards[i].classList.remove("imgCardPlayerWild");
    }
  };

  if (currentGame.cardsLeft <= 1) {
    divInfo.appendChild(buttCheckWin);
  }
}
