// initializing variables
let divMain,
  divHeaders,
  divDeck,
  divPlayers,
  divComputer,
  divPlayer,
  divInfo,
  divPlayerPickupCard,
  buttCheckWin;
let data = {};
let winArr = [];

//greet screen func
function greet() {
  divMain = document.getElementById("divMain");
  let img = document.createElement("img");
  img.src = "images/flush.png";
  img.id = "flush";
  divMain.appendChild(img);
  let play = document.createElement("img");
  play.src = "images/spades.png";
  play.id = "buttPlay";
  divMain.appendChild(play);
  play.onclick = () => {
    sendHttpGETReq("api/start_game", (res) => {
      data = JSON.parse(res);
      init();
      render();
    });
  };
}
// init func
function init() {
  cleanElement(divMain);
  let reset = document.createElement("button");
  reset.innerHTML = "reset";
  reset.className = "buttReset";
  document.body.appendChild(reset);
  reset.onclick = () => {
    sendHttpGETReq("api/start_game", (res) => {
      data = JSON.parse(res);
      init();
      render();
    });
  };
  divDeck = document.createElement("div");
  divDeck.id = "divDeck";
  divPlayers = document.createElement("div");
  divPlayers.id = "divPlayers";
  divComputer = document.createElement("div");
  divComputer.id = "divComputer";
  divPlayer = document.createElement("div");
  divPlayer.id = "divPlayer";
  divPlayerPickupCard = document.createElement("div");
  divPlayerPickupCard.id = "divPlayerPickupCard";
  divInfo = document.createElement("div");
  divInfo.id = "divInfo";
  divHeaders = document.createElement("div");
  divHeaders.id = "divHeaders";
}
// render func:
function render() {
  cleanElement(divDeck);
  cleanElement(divPlayers);
  cleanElement(divComputer);
  cleanElement(divPlayer);
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
      for (let i = 0; i < data.computerCards.length; i++) {
        setTimeout(() => {
          sendHttpGETReq("api/check_win?cardIndex=" + i, (res) => {
            data = JSON.parse(res);
            winArr.push(data.results.winner);
            render();
            renderInfoScore();
          });
          console.log(i);
        }, 2000 * i); //1750
      }
    };
    /////////////////////////////////////////////////////////////////////////////////////
  } else {
    hStatus.innerHTML = data.playerTurn
      ? "&middot; your turn to place card"
      : "&middot; computer's turn, please wait";
  }
  let hCardsleft = document.createElement("h1");
  hCardsleft.innerHTML = "&middot; deck count: " + data.cardsLeft;

  //deck image:
  let hDeck = document.createElement("h1");
  if (data.cardsLeft >= 2) {
    hDeck.innerHTML = "your card:";
  } else {
    hDeck.innerHTML =
      data.cardsLeft == 1 && !data.playerTurn
        ? "played wild card."
        : "your wild card:";
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
  if (data.playerTurn) {
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
    if (data.playerTurn) divDeck.appendChild(drawnCard);
    divInfo.appendChild(buttCheckWin);
  }
  divMain.appendChild(divInfo);

  //players divs
  divPlayers.append(divComputer, divPlayer);
  divMain.appendChild(divPlayers);
  let hComputer = document.createElement("h2");
  hComputer.innerHTML = "Opponent cards";
  let hPlayer = document.createElement("h2");
  hPlayer.innerHTML = "Your cards";

  //cards computer
  for (let i = 0; i < data.computerCards.length; i++) {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("cardDiv", "cardDivComputer");
    for (let j = 0; j < data.computerCards[i].length; j++) {
      let imgCard = document.createElement("img");
      imgCard.style.zIndex += 1;
      imgCard.src = "images/" + data.computerCards[i][j].name.toLowerCase() + ".png";
      if (j > 3) {
        if (data.cardIndex == i) {
          if (data.computerCards[i][j].name != "anon_card") {
            imgCard.src = "images/anon_card.png";
            setTimeout(() => {
              imgCard.classList.add("imgCardAnimated");
              imgCard.src = "images/" + data.computerCards[i][j].name.toLowerCase() + ".png";
            }, 2);
            if (winArr[i] == -1) {
              setTimeout(() => {
                cardDiv.classList.add("cardDivComputerLostAnimated");
              }, 500);
            }
          }
        } else {
          if (winArr[i] == -1) {
            cardDiv.classList.add("cardDivComputerLostFinal"); // Consultttttt
          }
        }
      }
      cardDiv.appendChild(imgCard);
    }

    divComputer.appendChild(cardDiv);
  }

  //cards player  /// TRY to fuse this loop into the next (SAME LOOP).
  let temp = 1;
  for (let i = 0; i < data.playerCards.length; i++) {
    if (data.playerCards[i].length > temp) {
      temp = data.playerCards[i].length;
    }
  }
  for (let i = 0; i < data.playerCards.length; i++) {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("cardDiv", "cardDivPlayer");
    if (data.playerTurn) {
      if (
        data.playerCards.every((hand) => hand.length == temp) ||
        data.playerCards[i].length < temp
      ) {
        cardDiv.classList.add("cardDivPlayerPlay");
      }
      if (data.cardsLeft == 1) {
        cardDiv.classList.remove("cardDivPlayerPlay");
      }
    }

    for (let j = 0; j < data.playerCards[i].length; j++) {
      let imgCard = document.createElement("img");
      if (data.cardsLeft == 1 && data.playerTurn && j == 4) {
        imgCard.classList.add("imgCardPlayerWild");
        imgCard.onclick = (ev) => {
          let divPop = document.createElement("div");
          divPop.id = "divPop";
          let divPopLeft = document.createElement("div");
          divPopLeft.id = "divPopLeft";
          let hLeft = document.createElement("h1");
          hLeft.innerHTML = "wild card:";
          let cardImgWildCard = document.createElement("img");
          cardImgWildCard.src = "images/" + data.drawnCard.name.toLowerCase() + ".png";
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
          for (let k = 0; k < data.playerCards[i].length; k++) {
            let img = document.createElement("img");

            img.src = "images/" + data.playerCards[i][k].name.toLowerCase() + ".png";
            if (k == 4) {
              console.log(data.playerCards[i][k].name);
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
      imgCard.src = "images/" + data.playerCards[i][j].name.toLowerCase() + ".png";
      cardDiv.appendChild(imgCard);
    }

    cardDiv.onclick = (ev) => {
      if (!data.playerTurn) return;
      if (data.cardsLeft == 1) {
        ev.target.onclick = () => {
          return;
        };

        return;
      }
      sendHttpGETReq("api/place_card?i=" + i, (res) => {
        data = JSON.parse(res);
        render();
        setTimeout(() => {
          sendHttpGETReq("api/computer_go_on", (res) => {
            data = JSON.parse(res);
            render();
          });
        }, 2);
      });
    };
    divPlayer.appendChild(cardDiv);
  }
  divPlayers.append(hComputer, divComputer, hPlayer, divPlayer);
}
function renderInfoScore() {
  cleanElement(divInfo);
  let hand1Name = data.results.hand1Name;
  let hand2Name = data.results.hand2Name;
  if (hand1Name.startsWith("Two Pairs")) {
    hand1Name = formatCardPairs(hand1Name);
  } else {
    hand1Name = hand1Name.replace(/_/g, " ");
  }
  if (hand2Name.startsWith("Two Pairs")) {
    hand2Name = formatCardPairs(hand2Name);
  } else {
    hand2Name = hand2Name.replace(/_/g, " ");
  }
  divInfo.id = "divInfoEnd";
  let hHandComputer = document.createElement("h1");
  hHandComputer.innerHTML = "Opponent got: " + hand1Name;

  let hHandPlayer = document.createElement("h1");
  hHandPlayer.innerHTML = "You got: " + hand2Name;

  let hAnounce = document.createElement("h1");
  hAnounce.innerHTML =
    data.results.winner == 1
      ? "Opponent takes."
      : data.results.winner == -1
      ? "You take."
      : "a tie.";
  divInfo.append(hHandComputer, hHandPlayer, hAnounce);
}

function formatCardPairs(description) {
  const cardPart = description.substring("Two Pairs ".length);

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
