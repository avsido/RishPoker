function render() {
  gameMode = data.gameMode;
  cleanElement(divDeck);
  cleanElement(divPlayers);
  cleanElement(divPlayerB);
  cleanElement(divPlayerA);
  cleanElement(divInfo);

  divMain.style.flexDirection = "row";

  //headers:
  let hStatus = document.createElement("h1");
  if (data.cardsLeft == 1) {
    //
    hStatus.innerHTML = data.playerATurn
      ? "&middot; play wild card or flip"
      : "&middot; NOW -";
    buttCheckWin = document.createElement("button");
    buttCheckWin.id = "buttCheckWin";
    buttCheckWin.innerHTML = "Flip!";
    /////////////////////////////////////////////////////////////////////////////////////
    buttCheckWin.onclick = () => {
      for (let i = 0; i < data.playerBCards.length; i++) {
        setTimeout(() => {
          sendHttpGETReq("api/check_win?cardIndex=" + i, (res) => {
            data = JSON.parse(res);
            winArr.push(data.results.winner);
            render();
            renderInfoScore();
          });
        }, 2000 * i); //1750
      }
    };
    /////////////////////////////////////////////////////////////////////////////////////
  } else {
    hStatus.innerHTML = data.playerATurn
      ? "&middot; your turn to place card"
      : "&middot; opponent's turn, please wait";
  }
  let hCardsleft = document.createElement("h1");
  hCardsleft.innerHTML = "&middot; deck count: " + data.cardsLeft;

  //deck image:
  let imgDeck = document.createElement("img");
  imgDeck.src = "images/deck.png";
  let divImgDeck = document.createElement("div");
  divImgDeck.id = "imgDeck";
  divImgDeck.appendChild(imgDeck);
  divDeck.appendChild(divImgDeck);

  //drawn card:
  let drawnCard = document.createElement("img");
  drawnCard.id = "drawnCard";
  if (data.playerATurn) {
    if (data.cardsLeft >= 1) {
      drawnCard.src = "images/" + data.drawnCard.name.toLowerCase() + ".png";
    }
  } else {
    drawnCard.id = "waitGif";
    drawnCard.src = "images/5.gif";
  }

  divDeck.appendChild(drawnCard);

  divInfo.append(divDeck, hCardsleft, hStatus);
  if (data.cardsLeft == 1) {
    cleanElement(divDeck);
    drawnCard.style.marginLeft = "35%";
    if (data.playerATurn) divDeck.appendChild(drawnCard);
    divInfo.appendChild(buttCheckWin);
  }
  divMain.appendChild(divInfo);

  //players divs
  divPlayers.append(divPlayerB, divPlayerA);
  divMain.appendChild(divPlayers);
  let hPlayerB = document.createElement("h2");
  hPlayerB.innerHTML = "Opponent";
  let hPlayerA = document.createElement("h2");
  hPlayerA.innerHTML = "You";

  //cards computer
  for (let i = 0; i < data.playerBCards.length; i++) {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("cardDiv", "cardDivPlayerB");
    for (let j = 0; j < data.playerBCards[i].length; j++) {
      let imgCard = document.createElement("img");
      imgCard.style.zIndex += 1;
      imgCard.src =
        "images/" + data.playerBCards[i][j].name.toLowerCase() + ".png";
      if (j > 3) {
        if (data.cardIndex == i) {
          if (data.playerBCards[i][j].name != "anon_card") {
            imgCard.src = "images/anon_card.png";
            setTimeout(() => {
              imgCard.classList.add("imgCardAnimated");
              if (soundOn) flipOpponentCardSound.play();
              imgCard.src =
                "images/" + data.playerBCards[i][j].name.toLowerCase() + ".png";
            }, 2);
            if (winArr[i] == -1) {
              setTimeout(() => {
                cardDiv.classList.add("cardDivPlayerBLostAnimated");
              }, 500);

              // This will only happen for the last hand should the computer loose
              // This is a special case because we usually draw this _after_
              if (i == 4) {
                setTimeout(() => {
                  cardDiv.classList.add("cardDivPlayerBLostFinal");
                }, 2000);
              }
            }
          }
        } else {
          // This will happen in the NEXT iteration of i
          if (winArr[i] == -1) {
            cardDiv.classList.add("cardDivPlayerBLostFinal");
          }
        }
      }
      cardDiv.appendChild(imgCard);
    }

    divPlayerB.appendChild(cardDiv);
  }

  //cards player  /// TRY to fuse this loop into the next (SAME LOOP).
  let temp = 1;
  for (let i = 0; i < data.playerACards.length; i++) {
    if (data.playerACards[i].length > temp) {
      temp = data.playerACards[i].length;
    }
  }
  for (let i = 0; i < data.playerACards.length; i++) {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("cardDiv", "cardDivPlayerA");
    if (data.playerATurn) {
      if (
        data.playerACards.every((hand) => hand.length == temp) ||
        data.playerACards[i].length < temp
      ) {
        cardDiv.classList.add("cardDivPlayerAPlay");
      }
      if (data.cardsLeft == 1) {
        cardDiv.classList.remove("cardDivPlayerAPlay");
      }
    }

    for (let j = 0; j < data.playerACards[i].length; j++) {
      let imgCard = document.createElement("img");
      if (j > 3) {
        if (data.cardIndex == i) {
          if (winArr[i] == 1) {
            setTimeout(() => {
              cardDiv.classList.add("cardDivPlayerALostAnimated");
            }, 500);
            if (i == 4) {
              setTimeout(() => {
                cardDiv.classList.add("cardDivPlayerALostFinal");
              }, 2000);
            }
          }
        } else {
          // This will happen in the NEXT iteration of i
          if (winArr[i] == 1) {
            cardDiv.classList.add("cardDivPlayerALostFinal");
          }
        }
      }
      ///////////////////////////////////////////////////////
      if (data.cardsLeft == 1 && data.playerATurn && j == 4) {
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
            "images/" + data.drawnCard.name.toLowerCase() + ".png";
          divPopLeft.append(hLeft, cardImgWildCard);
          let divPopRight = document.createElement("div");
          divPopRight.id = "divcPopRight";
          let hRight = document.createElement("h1");
          hRight.innerHTML = "your wild card:";
          divPopRight.id = "divPopRight";
          let innerDivPop = document.createElement("div");
          innerDivPop.id = "innerDivPop";
          let divOverlay = document.createElement("div");
          divOverlay.className = "divOverlay";
          for (let k = 0; k < data.playerACards[i].length; k++) {
            let img = document.createElement("img");
            ///////////////////////////////////////////////////////
            img.src =
              "images/" + data.playerACards[i][k].name.toLowerCase() + ".png";
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
            sendHttpGETReq(
              "api/butt_replace_wild_card?hand=" + i + "&card=" + j,
              (res) => {
                data = JSON.parse(res);
                if (soundOn) wildCardSound.play();
                render();
              }
            );
          };
          buttCancel.onclick = () => {
            document.body.removeChild(divPop);
            document.body.removeChild(divOverlay);
            render();
          };
        };
      }
      imgCard.src =
        "images/" + data.playerACards[i][j].name.toLowerCase() + ".png";
      cardDiv.appendChild(imgCard);
    }
    cardDiv.onclick = (ev) => {
      if (!data.playerATurn) {
        return;
      }
      if (data.cardsLeft == 1) {
        ev.target.onclick = () => {
          return;
        };
        return;
      }
      sendHttpGETReq("api/place_card?i=" + i, (res) => {
        data = JSON.parse(res);
        if (soundOn) placeCardSound.play();
        render();
        setTimeout(() => {
          sendHttpGETReq("api/computer_go_on", (res) => {
            data = JSON.parse(res);

            render();
          });
          if (soundOn) placeCardSound.play();
        }, 500);
      });
    };
    divPlayerA.appendChild(cardDiv);
  }
  divPlayers.append(hPlayerB, divPlayerB, hPlayerA, divPlayerA);
}
