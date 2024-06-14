function renderMulti() {
  cleanElement(divDeck);
  cleanElement(divPlayers);
  cleanElement(divPlayerB);
  cleanElement(divPlayerA);
  cleanElement(divInfo);

  divMain.style.flexDirection = "row";

  let hStatus = document.createElement("h1");
  let hCardsleft = document.createElement("h1");
  hCardsleft.innerHTML = "&middot; deck count: " + currentGame.cardsLeft;

  let hDeck = document.createElement("h1");
  let imgDeck = document.createElement("img");
  imgDeck.src = "images/deck.png";
  let divImgDeck = document.createElement("div");
  divImgDeck.id = "imgDeck";
  divImgDeck.appendChild(imgDeck);
  divDeck.appendChild(divImgDeck);

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

  //drawn card:
  let imgDrawnCard = document.createElement("img");
  divDeck.appendChild(imgDrawnCard);
  divInfo.append(hDeck, divDeck, hCardsleft, hStatus);
  divMain.appendChild(divInfo);

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
}
