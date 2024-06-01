// initializing variables
let buttNav,
  buttSound,
  divMenu,
  divMain,
  divHeaders,
  divDeck,
  divPlayers,
  divPlayerB,
  divPlayerA,
  divInfo,
  divPlayerAPickupCard,
  buttCheckWin;
let soundOn = true;
let data = {};
let menuItems = {};
let winArr = [];

//initiating sounds:
let placeCardSound = new Howl({
  src: ["sounds/card_place.ogg"],
});
let flipOpponentCardSound = new Howl({
  src: ["sounds/card_flip.wav"],
});
let foldSound = new Howl({
  src: ["sounds/fold.wav"],
});
let winSound = new Howl({
  src: ["sounds/win.wav"],
});
let loseSound = new Howl({
  src: ["sounds/lose.wav"],
});
let tieSound = new Howl({
  src: ["sounds/tie.wav"],
});
let invalidMoveSound = new Howl({
  src: ["sounds/invalid_move.mp3"],
});

//greet screen func
function greet() {
  buttMenu = document.getElementById("buttMenu");
  // buttSound = document.getElementById("buttSound");
  divMain = document.getElementById("divMain");
  let img = document.createElement("img");
  img.src = "images/flush.png";
  img.id = "flush";
  divMain.appendChild(img);
  let buttPlayVSComputer = document.createElement("button");
  buttPlayVSComputer.className = "buttPlay";
  buttPlayVSComputer.innerHTML = "Play vs machine";
  divMain.appendChild(buttPlayVSComputer);
  buttPlayVSComputer.onclick = () => {
    sendHttpGETReq("api/start_game_vs_computer", (res) => {
      data = JSON.parse(res);
      init();
      render();
    });
  };
  let buttPlayVSRemotePlayer = document.createElement("button");
  buttPlayVSRemotePlayer.className = "buttPlay";
  buttPlayVSRemotePlayer.innerHTML = "Play vs friend";
  divMain.appendChild(buttPlayVSRemotePlayer);
  buttPlayVSRemotePlayer.onclick = () => {
    // sendHttpGETReq("api/start_game_vs_remote_player", (res) => {
    //   data = JSON.parse(res);
    //   init();
    //   render();
    // });
  };
  let aSignIn = document.createElement("a");
  aSignIn.className = "aSignIn";
  aSignIn.innerHTML = "sign in";
  divMain.appendChild(aSignIn);
}
// init func
function init() {
  cleanElement(divMain);
  // let reset = document.createElement("button");
  // reset.innerHTML = "reset";
  // reset.className = "buttReset";
  // document.body.appendChild(reset);   // will probably cancel this..
  // reset.onclick = () => {
  //   sendHttpGETReq("api/reset", (res) => {
  //     data = JSON.parse(res);
  //     init();
  //     render();
  //   });
  // };
  divDeck = document.createElement("div");
  divDeck.id = "divDeck";
  divPlayers = document.createElement("div");
  divPlayers.id = "divPlayers";
  divPlayerB = document.createElement("div");
  divPlayerB.id = "divPlayerB";
  divPlayerA = document.createElement("div");
  divPlayerA.id = "divPlayerA";
  divPlayerAPickupCard = document.createElement("div");
  divPlayerAPickupCard.id = "divPlayerAPickupCard";
  divInfo = document.createElement("div");
  divInfo.id = "divInfo";
  divHeaders = document.createElement("div");
  divHeaders.id = "divHeaders";
}
// render func:
function render() {
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
    hStatus.innerHTML = data.playerTurn
      ? "&middot; select Switch card or -"
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
  let hDeck = document.createElement("h1");
  if (data.playerATurn) {
    if (data.cardsLeft > 2) {
      hDeck.innerHTML = "~ your card ~";
    } else {
      if (data.cardsLeft == 2) {
        hDeck.innerHTML = "~ your wild card ~";
      }
    }
  } else {
    hDeck.innerHTML = "...";
  }
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

  divInfo.append(hDeck, divDeck, hCardsleft, hStatus);
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

      if (data.cardsLeft == 1 && data.playerATurn && j == 4) {
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
            "images/" + data.drawnCard.name.toLowerCase() + ".png";
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
          for (let k = 0; k < data.playerACards[i].length; k++) {
            let img = document.createElement("img");

            img.src =
              "images/" + data.playerACards[i][k].name.toLowerCase() + ".png";
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
            sendHttpGETReq(
              "api/butt_replace_wild_card?hand=" + i + "&card=" + j,
              (res) => {
                data = JSON.parse(res);
                render();
              }
            );
          };
          buttCancel.onclick = () => {
            document.body.removeChild(divPop);
            document.body.removeChild(divOverlay);
          };
        };
      }
      imgCard.src =
        "images/" + data.playerACards[i][j].name.toLowerCase() + ".png";
      cardDiv.appendChild(imgCard);
    }
    cardDiv.onclick = (ev) => {
      if (!data.playerATurn) {
        if (soundOn) invalidMoveSound.play();
        return;
      }
      if (data.cardsLeft == 1) {
        ev.target.onclick = () => {
          if (soundOn) invalidMoveSound.play();
          return;
        };
        if (soundOn) invalidMoveSound.play();
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
        }, 500); //1750
      });
    };
    divPlayerA.appendChild(cardDiv);
  }
  divPlayers.append(hPlayerB, divPlayerB, hPlayerA, divPlayerA);
}
let arrPlayerBHandMessages = [];
let arrPlayerAHandMessages = [];

function renderInfoScore() {
  cleanElement(divInfo);
  let handPlayerBName = data.results.handPlayerBName;
  let handPlayerAName = data.results.handPlayerAName;
  if (handPlayerBName.startsWith("Two Pairs")) {
    handPlayerBName = formatCard2Pairs(handPlayerBName);
  } else {
    handPlayerBName = handPlayerBName.replace(/_/g, " ");
  }
  if (handPlayerAName.startsWith("Two Pairs")) {
    handPlayerAName = formatCard2Pairs(handPlayerAName);
  } else {
    handPlayerAName = handPlayerAName.replace(/_/g, " ");
  }
  if (handPlayerAName.startsWith("Pair ")) {
    handPlayerAName = formatCardPair(handPlayerAName);
  }
  if (handPlayerBName.startsWith("Pair ")) {
    handPlayerBName = formatCardPair(handPlayerBName);
  }
  arrPlayerBHandMessages.push(handPlayerBName);
  arrPlayerAHandMessages.push(handPlayerAName);
  let divInfoPlayerB = document.createElement("div");
  divInfoPlayerB.className = "divInfoPlayers";
  let hHandPlayerB = document.createElement("h1");
  hHandPlayerB.innerHTML = "Opponent:";
  divInfoPlayerB.appendChild(hHandPlayerB);
  let divInfoPlayerA = document.createElement("div");
  divInfoPlayerA.className = "divInfoPlayers";
  let hHandPlayerA = document.createElement("h1");
  hHandPlayerA.innerHTML = "You:";
  divInfoPlayerA.appendChild(hHandPlayerA);
  for (let i = 0; i < arrPlayerBHandMessages.length; i++) {
    let h2 = document.createElement("h2");
    h2.innerHTML = "&middot; " + arrPlayerBHandMessages[i];
    if (winArr[i] == -1) {
      h2.style.color = "red";
    }
    if (winArr[i] == 1) {
      h2.style.color = "#031561";
    }
    divInfoPlayerB.appendChild(h2);
  }

  for (let i = 0; i < arrPlayerAHandMessages.length; i++) {
    let h2 = document.createElement("h2");
    h2.innerHTML = "&middot; " + arrPlayerAHandMessages[i];
    if (winArr[i] == -1) {
      h2.style.color = "#031561";
    }
    if (winArr[i] == 1) {
      h2.style.color = "red";
    }
    divInfoPlayerA.appendChild(h2);
  }

  let hBottomLine = document.createElement("h1");
  hBottomLine.className = "hBottomLine";
  hBottomLine.innerHTML =
    data.results.winner == 1
      ? "hand lost."
      : data.results.winner == -1
      ? "hand won."
      : "a tie.";
  if (winArr.length >= 5) {
    if (countOnesAndMinusOnes(winArr) == -1) {
      hBottomLine.innerHTML = "You Lose..";
      if (soundOn) loseSound.play();
    } else if (countOnesAndMinusOnes(winArr) == 1) {
      hBottomLine.innerHTML = "You Win!";
      if (soundOn) winSound.play();
    } else {
      hBottomLine.innerHTML = "It's a tie.";
      if (soundOn) tieSound.play();
    }
  }
  divInfo.append(divInfoPlayerB, divInfoPlayerA, hBottomLine);
}

function openSideMenu() {
  let menuAlreadyOpen = document.body.querySelector("#divMenu");
  let secondMenuAlreadyOpen = document.body.querySelector("#contentBox");
  if (menuAlreadyOpen) {
    document.body.removeChild(menuAlreadyOpen);
  } else if (secondMenuAlreadyOpen) {
    document.body.removeChild(secondMenuAlreadyOpen);
  } else {
    let divMenu = document.createElement("div");
    divMenu.className = "divMenu";
    divMenu.id = "divMenu";
    document.body.appendChild(divMenu);

    sendHttpGETReq("api/get_menu_items", (res) => {
      menuItems = JSON.parse(res);
      for (let i = 0; i < menuItems.length; i++) {
        let pMenu = document.createElement("p");
        pMenu.className = "pMenu";
        pMenu.innerHTML = "> " + menuItems[i].name + "";
        pMenu.onclick = () => {
          sendHttpGETReq("/api" + menuItems[i].HttpRequest, (res) => {
            let content = JSON.parse(res);
            document.body.removeChild(divMenu);
            let contentBox = document.createElement("div");
            contentBox.className = "divMenu";
            contentBox.id = "contentBox";
            let h3 = document.createElement("h3");
            h3.innerHTML = content;
            contentBox.appendChild(h3);
            let buttEsc = document.createElement("button");
            buttEsc.innerHTML = "X";
            buttEsc.onclick = () => {
              document.body.removeChild(contentBox);
            };
            contentBox.appendChild(buttEsc);
            document.body.appendChild(contentBox);
          });
        };
        divMenu.appendChild(pMenu);
      }
    });
  }
}

function formatCardPair(str) {
  const words = str.split(" ");

  words.splice(0, 2);

  const resultName = words.join(" ");

  return resultName;
}

function formatCard2Pairs(str) {
  const cardPart = str.substring("".length);

  const cardRanks = cardPart
    .match(/(\d+|[A-Za-z]+)&/g)
    .map((rank) => rank.slice(0, -1));

  const uniqueRanks = [...new Set(cardRanks)];

  const formattedRanks = uniqueRanks.map((rank) => {
    if (!isNaN(rank)) {
      return `${rank}'s`;
    } else {
      if (["Jack", "Queen", "King"].includes(rank)) {
        return `${rank}s`;
      } else {
        return rank;
      }
    }
  });

  return formattedRanks.join(" & ");
}
function countOnesAndMinusOnes(winArr) {
  let counter = 0;
  let counterMinus = 0;
  for (let i = 0; i < winArr.length; i++) {
    if (winArr[i] == 1) counter += 1;
    else if (winArr[i] == -1) counterMinus += 1;
  }
  if (counter > counterMinus) {
    return -1;
  } else if (counter < counterMinus) return 1;
  return 0;
}
function toggleSound() {
  let imgButtSound = document.getElementById("imgButtSound");
  if (soundOn) {
    soundOn = false;
    imgButtSound.src = "images/sound_off.png";

    return;
  }
  soundOn = true;
  imgButtSound.src = "images/sound_on.png";
}
