function renderMultiplayer() {
  /*
    very similar to single player render. http requests converted to fit sockets
    here the 'flip!' button is called 'PASS'
    here playing the wild card and pushing the 'PASS' butt both end the participation of the player
  */
  gameMode = currentGame.gameMode;
  cleanElement(divDeck);
  cleanElement(divPlayers);
  cleanElement(divPlayerB);
  cleanElement(divPlayerA);
  cleanElement(divInfo);
  removeElementByQuery("chat");

  // 'chat' button exists only on double mode
  let chat = document.createElement("button");
  chat.id = "chat";
  chat.innerHTML = "Chat";
  chat.className = "buttPlay buttStartChat";
  chat.onclick = chatWindow;

  document.body.appendChild(chat);

  divMain.style.flexDirection = "row-reverse";

  let playerCards;
  let opponentCards;

  /* question to determine orientation of cards
    "a" and "b" are given by the server
    "a" will be the game solicitor and "b" the game joiner
    dice decides who goes first.
  */
  if (currentGame.player == "a") {
    playerCards = currentGame.playerACards;
    opponentCards = currentGame.playerBCards;
  }
  if (currentGame.player == "b") {
    playerCards = currentGame.playerBCards;
    opponentCards = currentGame.playerACards;
  }

  let hStatus = document.createElement("h1");

  let hCardsleft = document.createElement("h1");
  hCardsleft.innerHTML = "&middot; deck count: " + currentGame.cardsLeft;

  let imgDeck = document.createElement("img");
  imgDeck.src = "images/deck.png";

  let divImgDeck = document.createElement("div");
  divImgDeck.id = "imgDeck";
  divImgDeck.appendChild(imgDeck);

  divDeck.appendChild(divImgDeck);

  //drawn card:
  let imgDrawnCard = document.createElement("img");

  if (drawnCard) {
    // if drawnCard is null or not, basically asking if its the players turn or opponents turn
    if (!iAmFlipReady) {
      let lastSlotData = isLastSlotInLine(playerCards);

      if (lastSlotData.isLastSlot) {
        let data = {
          i: lastSlotData.i,
          pin: currentGame.pin,
        };
        setTimeout(() => {
          io_client.emit("place-card", data);
        }, 800);
      }
      imgDrawnCard.src = "images/" + drawnCard.name + ".png";
      imgDrawnCard.id = "drawnCard";
      hStatus.innerHTML = "&middot; place card";
    }
  } else {
    if (currentGame.cardsLeft <= 2) {
      divImgDeck.style.display = "none";
      divDeck.className = "divDeckFinal";
      hStatus.innerHTML = "&middot; Gamble / Show Cards";
    } else {
      hStatus.innerHTML = "&middot; opponent's turn";
      imgDrawnCard.id = "waitGif";
      imgDrawnCard.src = "images/5.gif";
    }
  }

  divDeck.appendChild(imgDrawnCard);
  divInfo.append(divDeck, hCardsleft, hStatus);
  divMain.appendChild(divPlayers); // div on the right

  if (currentGame.cardsLeft == 41) {
    setTimeout(() => {
      divMain.appendChild(divInfo);
    }, 5000);
  } else {
    divMain.appendChild(divInfo);
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
        (playerCards[i].length < temp &&
          currentGame.cardsLeft >= 2 &&
          !isLastSlotInLine(playerCards).isLastSlot)
      ) {
        cardDiv.classList.add("cardDivPlayerAPlay");
      }
    }

    for (let j = 0; j < playerCards[i].length; j++) {
      let imgCard = document.createElement("img");
      imgCard.src = "images/" + playerCards[i][j].name.toLowerCase() + ".png";
      cardDiv.appendChild(imgCard);
    }

    cardDiv.onclick = (ev) => {
      if (!drawnCard) {
        return;
      }
      if (currentGame.cardsLeft > 2) {
        let data = {
          i: i,
          pin: currentGame.pin,
        };

        io_client.emit("place-card", data);
      }
    };
    divPlayerA.appendChild(cardDiv);
  }

  divPlayers.append(hPlayerB, divPlayerB, hPlayerA, divPlayerA);

  buttPass = document.createElement("button");
  buttPass.id = "buttCheckWin";
  buttPass.innerHTML = "Show Cards";
  buttPass.onclick = (ev) => {
    divInfo.removeChild(ev.target);
    hCardsleft.innerHTML = " ";
    iAmFlipReady = true;

    let pin = currentGame.pin;
    io_client.emit("client-ready-to-flip", pin);
  };

  if (currentGame.cardsLeft <= 2 && !iAmFlipReady) {
    divInfo.appendChild(buttPass);
  }
}

function isLastSlotInLine(hands) {
  let lengths = hands.map((arr) => arr.length);
  let uniqueLengths = [...new Set(lengths)];

  // If there are not exactly 2 unique lengths, the condition is not met
  if (uniqueLengths.length !== 2) {
    return { isLastSlot: false, i: null };
  }

  let maxLen = Math.max(...uniqueLengths);
  let minLen = Math.min(...uniqueLengths);

  // Check if the longer length is exactly 1 more than the shorter length
  if (maxLen - minLen !== 1) {
    return { isLastSlot: false, i: null };
  }

  // Count occurrences of each length
  let maxCount = lengths.filter((len) => len === maxLen).length;
  let minCount = lengths.filter((len) => len === minLen).length;

  // Check if exactly one array has the shorter length
  if (maxCount === hands.length - 1 && minCount === 1) {
    return { isLastSlot: true, i: lengths.indexOf(minLen) };
  } else {
    return { isLastSlot: false, i: null };
  }
}
