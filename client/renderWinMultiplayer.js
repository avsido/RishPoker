function renderWinMultiplayer(index) {
  cleanElement(divDeck);
  cleanElement(divPlayers);
  cleanElement(divPlayerB);
  cleanElement(divPlayerA);
  cleanElement(divInfo);

  divMain.style.flexDirection = "row";

  let playerCards;
  let opponentCards;
  let lose;
  let win;

  if (currentGame.player == "a") {
    playerCards = currentGame.playerACards;
    opponentCards = currentGame.playerBCards;
    lose = -1;
    win = 1;
  }

  if (currentGame.player == "b") {
    playerCards = currentGame.playerBCards;
    opponentCards = currentGame.playerACards;
    lose = 1;
    win = -1;
  }

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
        imgCard.src =
          index > i
            ? "images/" + opponentCards[i][j].name.toLowerCase() + ".png"
            : "images/anon_card.png";
        if (index == i) {
          // if hand loses RIGHT NOW
          setTimeout(() => {
            imgCard.classList.add("imgCardAnimated");
            if (soundOn) flipOpponentCardSound.play();
            imgCard.src =
              "images/" + opponentCards[i][j].name.toLowerCase() + ".png";
          }, 2);
          if (socketWinArr[i].winner == lose) {
            setTimeout(() => {
              cardDiv.classList.add("cardDivPlayerBLostAnimated");
            }, 500);
          }
          // This will only happen for the last hand should the computer loose
          // This is a special case because we usually draw this _after_
          if (i == 4 && socketWinArr[i].winner == lose) {
            setTimeout(() => {
              cardDiv.classList.add("cardDivPlayerBLostFinal");
            }, 2000);
          }
        } else {
          // This will happen in the NEXT iteration of i
          if (socketWinArr[i].winner == lose && index > i) {
            // if hand loses at all
            imgCard.src =
              "images/" + opponentCards[i][j].name.toLowerCase() + ".png";
            cardDiv.classList.add("cardDivPlayerBLostFinal");
          }
        }
      }

      cardDiv.appendChild(imgCard);
    }

    divPlayerB.appendChild(cardDiv);
  }
  // player cards:
  for (let i = 0; i < playerCards.length; i++) {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("cardDiv", "cardDivPlayerA");
    for (let j = 0; j < playerCards[i].length; j++) {
      let imgCard = document.createElement("img");
      imgCard.src = "images/" + playerCards[i][j].name.toLowerCase() + ".png";
      cardDiv.appendChild(imgCard);
      if (j > 3) {
        if (index == i) {
          if (socketWinArr[i].winner == win) {
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
          if (socketWinArr[i].winner == win && index > i) {
            cardDiv.classList.add("cardDivPlayerALostFinal");
          }
        }
      }
    }
    divPlayerA.appendChild(cardDiv);
  }
  divPlayers.append(hPlayerB, divPlayerB);
  divMain.appendChild(divPlayers);
  divPlayers.append(hPlayerB, divPlayerB, hPlayerA, divPlayerA);
  divMain.appendChild(divPlayers);

  /////////////////////////////////////////////////////////////////////////////

  let handPlayerBName = socketWinArr[index].handPlayerBName;
  let handPlayerAName = socketWinArr[index].handPlayerAName;

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
  if (currentGame.player == "a") {
    arrPlayerBHandMessages.push(handPlayerBName);
    arrPlayerAHandMessages.push(handPlayerAName);
  } else {
    arrPlayerBHandMessages.push(handPlayerAName);
    arrPlayerAHandMessages.push(handPlayerBName);
  }

  let divInfoPlayerB = document.createElement("div");
  divInfoPlayerB.className = "divInfoPlayers";
  let hHandPlayerB = document.createElement("h1");
  hHandPlayerB.innerHTML = "Opponent got:";
  hHandPlayerB.style.color = "darkgrey";
  divInfoPlayerB.appendChild(hHandPlayerB);
  let divInfoPlayerA = document.createElement("div");
  divInfoPlayerA.className = "divInfoPlayers";
  let hHandPlayerA = document.createElement("h1");
  hHandPlayerA.innerHTML = "You got:";
  hHandPlayerA.style.color = "darkgrey";
  divInfoPlayerA.appendChild(hHandPlayerA);

  for (let i = 0; i < arrPlayerBHandMessages.length; i++) {
    let h2 = document.createElement("h2");
    h2.innerHTML = "&middot; " + arrPlayerBHandMessages[i];
    if (socketWinArr[i].winner == lose) {
      h2.style.color = "black";
    }
    if (socketWinArr[i].winner == win) {
      h2.style.color = "white";
    }
    divInfoPlayerB.appendChild(h2);
  }

  for (let i = 0; i < arrPlayerAHandMessages.length; i++) {
    let h2 = document.createElement("h2");
    h2.innerHTML = "&middot; " + arrPlayerAHandMessages[i];
    if (socketWinArr[i].winner == lose) {
      h2.style.color = "white";
    }
    if (socketWinArr[i].winner == win) {
      h2.style.color = "black";
    }
    divInfoPlayerA.appendChild(h2);
  }

  let hBottomLine = document.createElement("h1");
  hBottomLine.className = "hBottomLine";
  hBottomLine.innerHTML =
    socketWinArr[index].winner == win
      ? "hand lost."
      : socketWinArr[index].winner == lose
      ? "hand won."
      : "a tie.";
  if (index == 4) {
    let checkArr = [];
    for (let q = 0; q < socketWinArr.length; q++) {
      checkArr.push(socketWinArr[q].winner);
    }
    if (countOnesAndMinusOnes(checkArr) == lose) {
      hBottomLine.innerHTML = "You Lose..";
      if (soundOn) loseSound.play();
    } else if (countOnesAndMinusOnes(checkArr) == win) {
      hBottomLine.innerHTML = "You Win!";
      if (soundOn) winSound.play();
    } else {
      if (soundOn) tieSound.play();
      hBottomLine.innerHTML = "It's a tie.";
    }
  }
  divInfo.append(divInfoPlayerB, divInfoPlayerA, hBottomLine);
}
