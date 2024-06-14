function renderMultiplayer() {
  cleanElement(divDeck);
  cleanElement(divPlayers);
  cleanElement(divPlayerB);
  cleanElement(divPlayerA);
  cleanElement(divInfo);

  let winArr = [];

  divMain.style.flexDirection = "row";

  let playerCards;
  let opponentCards;
  let playedWildCard;

  if (currentGame.player == "a") {
    playerCards = currentGame.playerACards;
    opponentCards = currentGame.playerBCards;
    playedWildCard = currentGame.playerAPlayedWildCard;
  }
  if (currentGame.player == "b") {
    playerCards = currentGame.playerBCards;
    opponentCards = currentGame.playerACards;
    playedWildCard = currentGame.playerBPlayedWildCard;
  }

  let hStatus = document.createElement("h1");
  let hCardsleft = document.createElement("h1");

  hCardsleft.innerHTML = "&middot; deck count: " + currentGame.cardsLeft;

  let hDeck = document.createElement("h1");
  let imgDeck = document.createElement("img");
  imgDeck.src = "images/deck.png";
  let divImgDeck = document.createElement("div");
  divImgDeck.id = "imgDeck";
  if (!playedWildCard) divImgDeck.appendChild(imgDeck);
  divDeck.appendChild(divImgDeck);

  //drawn card:
  let imgDrawnCard = document.createElement("img");
  if (!playedWildCard) divDeck.appendChild(imgDrawnCard);
  divInfo.append(hDeck, divDeck, hCardsleft, hStatus);
  divMain.appendChild(divInfo);
  ///////////////////////////////////////////////////////////////////////////////////////////

  if (drawnCard) {
    hStatus.innerHTML =
      currentGame.cardsLeft == 1
        ? "&middot; play wild card?"
        : "&middot; your turn to place card";
    imgDrawnCard.id = "drawnCard";
    imgDrawnCard.src = "images/" + drawnCard.name + ".png";
    hDeck.innerHTML = "~ your card ~";

    if (currentGame.cardsLeft == 1) {
      hDeck.innerHTML = "~ your wild card ~";
    }
  } else {
    hStatus.innerHTML = "&middot; opponent's turn, please wait";
    hDeck.innerHTML = "...";
    imgDrawnCard.id = "waitGif";
    imgDrawnCard.src = "images/5.gif";
  }

  ////////////////////////////////////////////////////////////////////////////

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
      if (j > 3) {
        // if (data.cardIndex == i) {
        //   if (opponentCards[i][j].name != "anon_card") {
        //     imgCard.src = "images/anon_card.png";
        //     setTimeout(() => {
        //       imgCard.classList.add("imgCardAnimated");
        //       if (soundOn) flipOpponentCardSound.play();
        //       imgCard.src =
        //         "images/" + opponentCards[i][j].name.toLowerCase() + ".png";
        //     }, 2);
        //     if (winArr[i] == -1) {
        //       setTimeout(() => {
        //         cardDiv.classList.add("cardDivPlayerBLostAnimated");
        //       }, 500);
        //       // This will only happen for the last hand should the computer loose
        //       // This is a special case because we usually draw this _after_
        //       if (i == 4) {
        //         setTimeout(() => {
        //           cardDiv.classList.add("cardDivPlayerBLostFinal");
        //         }, 2000);
        //       }
        //     }
        //   }
        // } else {
        //   // This will happen in the NEXT iteration of i
        //   if (winArr[i] == -1) {
        //     cardDiv.classList.add("cardDivPlayerBLostFinal");
        //   }
        // }
      }
      cardDiv.appendChild(imgCard);
    }

    divPlayerB.appendChild(cardDiv);
  }

  //cards player  /// TRY to fuse this loop into the next (SAME LOOP).
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
      // if (j > 3) {
      //   if (data.cardIndex == i) {
      //     if (winArr[i] == 1) {
      //       setTimeout(() => {
      //         cardDiv.classList.add("cardDivPlayerALostAnimated");
      //       }, 500);
      //       if (i == 4) {
      //         setTimeout(() => {
      //           cardDiv.classList.add("cardDivPlayerALostFinal");
      //         }, 2000);
      //       }
      //     }
      //   } else {
      //     // This will happen in the NEXT iteration of i
      //     if (winArr[i] == 1) {
      //       cardDiv.classList.add("cardDivPlayerALostFinal");
      //     }
      //   }
      // }

      if (j == 4) {
        if (currentGame.cardsLeft <= 1) {
          if (!playedWildCard && drawnCard) {
            imgCard.classList.add("imgCardPlayerWild");
            imgCard.onclick = (ev) => {
              let divPop = document.createElement("div");
              divPop.id = "divPop";
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
              divOverlay.id = "divOverlay";
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
              buttSwitch.className = "buttReset";
              let buttCancel = document.createElement("button");
              let divCancel = document.createElement("div");
              divCancel.className = "divCancel";
              let hOr = document.createElement("h1");
              hOr.innerHTML = "or ";
              buttCancel.innerHTML = "Cancel";
              buttCancel.className = "buttReset";
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
}
