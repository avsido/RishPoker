function renderWinMultiplayer(index) {
  cleanElement(divDeck);
  cleanElement(divPlayers);
  cleanElement(divPlayerB);
  cleanElement(divPlayerA);
  cleanElement(divInfo);

  divMain.style.flexDirection = "row";

  let playerCards;
  let opponentCards;

  if (currentGame.player == "a") {
    playerCards = currentGame.playerACards;
    opponentCards = currentGame.playerBCards;
  }

  if (currentGame.player == "b") {
    playerCards = currentGame.playerBCards;
    opponentCards = currentGame.playerACards;
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
      imgCard.src =
        j > 3
          ? "images/anon_card.png"
          : "images/" + opponentCards[i][j].name.toLowerCase() + ".png";
      if (j > 3) {
        if (index == i) {
          setTimeout(() => {
            imgCard.classList.add("imgCardAnimated");
            if (soundOn) flipOpponentCardSound.play();
            imgCard.src =
              "images/" + opponentCards[i][j].name.toLowerCase() + ".png";
          }, 2);
          if (socketWinArr[i].winner == -1) {
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

        //  else {
        //   // This will happen in the NEXT iteration of i
        //   if (socketWinArr[i].winner == -1) {
        //     cardDiv.classList.add("cardDivPlayerBLostFinal");
        //   }
        // }
      }
      cardDiv.appendChild(imgCard);
    }

    divPlayerB.appendChild(cardDiv);
  }
  divPlayers.append(hPlayerB, divPlayerB);
  divMain.appendChild(divPlayers);
  // divPlayers.append(hPlayerB, divPlayerB, hPlayerA, divPlayerA);
  // divMain.appendChild(divPlayers);
}
