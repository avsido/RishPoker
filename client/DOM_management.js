// initializing variables
let divMain,
  divPIN,
  buttMenu,
  divHeaders,
  divDeck,
  divPlayers,
  divPlayerB,
  divPlayerA,
  divInfo,
  divPlayerAPickupCard,
  buttCheckWin;

let gameMode;
let isSideMenuOpen = false;
let isChatOpen = false;
let messages = document.createElement("ul");
let soundOn = true;
let data = {};
let menuItems = {};
let winArr;

let arrPlayerBHandMessages = [];
let arrPlayerAHandMessages = [];

//initiating sounds:
let placeCardSound = new Howl({
  src: ["sounds/card_place.ogg"],
});
let flipOpponentCardSound = new Howl({
  src: ["sounds/card_flip.wav"],
});
let winSound = new Howl({
  src: ["sounds/win.wav"],
});
let loseSound = new Howl({
  src: ["sounds/lose.wav"],
});
let tieSound = new Howl({
  src: ["sounds/tie.mp3"],
});
let wildCardSound = new Howl({
  src: ["sounds/wild_card.mp3"],
});
let openingSound = new Howl({
  src: ["sounds/opening.mp3"],
});
let chatMessage = new Howl({
  src: ["sounds/chat_message.mp3"],
});

//greet screen func
function greet() {
  buttMenu = document.getElementById("buttMenu");
  divMain = document.getElementById("divMain");
  divMain.style.flexDirection = "column";
  let img = document.createElement("img");
  img.src = "images/flush.png";
  img.id = "flush";
  divMain.appendChild(img);
  let buttPlayVSComputer = document.createElement("button");
  buttPlayVSComputer.className = "buttPlay";
  buttPlayVSComputer.innerHTML = "VS Computer";
  divMain.appendChild(buttPlayVSComputer);
  buttPlayVSComputer.onclick = () => {
    sendHttpGETReq("api/start_game_vs_computer", (res) => {
      data = JSON.parse(res);
      if (soundOn) openingSound.play();
      winArr = [];
      init();
      render();
    });
  };

  let buttJoinMultiplayerGame = document.createElement("button");
  buttJoinMultiplayerGame.className = "buttPlay";
  buttJoinMultiplayerGame.innerHTML = "join friend";
  buttJoinMultiplayerGame.onclick = () => {
    if (divMain.querySelector(".divPIN")) {
      divMain.removeChild(divPIN);
      return;
    }

    let pHeader = document.createElement("p");
    pHeader.innerHTML = "insert PIN:";
    pHeader.className = "pHeaderPIN";
    let inputPIN = document.createElement("input");
    inputPIN.className = "inputPIN";
    inputPIN.type = "text";
    inputPIN.value = "Insert PIN here";
    inputPIN.style.color = "grey";
    inputPIN.onclick = () => {
      inputPIN.value = "";
      inputPIN.style.color = "black";
    };
    let buttAccept = document.createElement("img");
    buttAccept.src = "images/accept.png";
    buttAccept.onclick = () => {
      let pin = inputPIN.value;
      io_client.emit("join-online-game", pin);
    };

    let buttCancel = document.createElement("img");
    buttCancel.src = "images/cancel.png";
    buttCancel.onclick = () => {
      divMain.removeChild(divPIN);
    };
    let pButtons = document.createElement("p");
    pButtons.append(buttAccept, buttCancel);
    pButtons.style.display = "flex";
    pButtons.style.justifyContent = "space-around";
    divPIN = document.createElement("div");
    divPIN.className = "divPIN";
    divPIN.append(pHeader, inputPIN, pButtons);
    divMain.appendChild(divPIN);
  };

  let buttCreateMultiplayerGame = document.createElement("button");
  buttCreateMultiplayerGame.className = "buttPlay";
  buttCreateMultiplayerGame.innerHTML = "invite friend";
  divMain.appendChild(buttCreateMultiplayerGame);
  divMain.appendChild(buttJoinMultiplayerGame);
  ///////////////////////////////////////////////////////////////////////////////////////
  buttCreateMultiplayerGame.onclick = () => {
    if (divMain.querySelector(".divPIN")) {
      divMain.removeChild(divPIN);
      return;
    }
    let pHeader = document.createElement("p");
    pHeader.innerHTML = "send PIN to friend:";
    pHeader.className = "pHeaderPIN";
    let divPPIN = document.createElement("div");
    divPPIN.className = "divPPIN";
    let pPIN = document.createElement("h3");
    pPIN.className = "pPIN";

    let buttCopy = document.createElement("img");
    buttCopy.src = "images/copy.png";
    buttCopy.onclick = (ev) => {
      let textPIN = pPIN.innerText;
      let dummyTextarea = document.createElement("textarea");
      dummyTextarea.value = textPIN;
      document.body.appendChild(dummyTextarea);
      dummyTextarea.select();
      document.execCommand("copy");
      document.body.removeChild(dummyTextarea);
      ev.target.src = "images/copied.png";
    };
    let buttCancel = document.createElement("img");
    buttCancel.src = "images/cancel.png";
    buttCancel.onclick = () => {
      divMain.removeChild(divPIN);
    };
    divPPIN.append(pPIN, buttCopy);
    divPIN = document.createElement("div");
    divPIN.className = "divPIN";
    divPIN.append(pHeader, divPPIN, buttCancel);
    divMain.appendChild(divPIN);
    io_client.emit("game-request-from-user");
    io_client.on("game-request-response", (pin) => {
      pPIN.innerHTML = pin;
    });
  };
}

// init func
function init() {
  cleanElement(divMain);
  removeElementByQuery("buttQuit");
  let buttQuit = document.createElement("button");
  buttQuit.innerHTML = "quit";
  buttQuit.id = "buttQuit";
  buttQuit.className = "buttGame";
  document.body.appendChild(buttQuit);

  buttQuit.onclick = (ev) => {
    let divOverlay = document.createElement("div");
    divOverlay.className = "divOverlay";
    document.body.appendChild(divOverlay);
    let quitDiv = document.createElement("div");
    quitDiv.className = "divPop divPopQuit";
    let h1 = document.createElement("h1");
    h1.innerHTML = "Quit game?";
    let buttY = document.createElement("button");
    let buttN = document.createElement("button");
    buttY.className = "buttGame";
    buttN.className = "buttGame";
    buttY.innerHTML = "Yes";
    /////////////////////////////////////////////////////
    buttY.onclick = () => {
      switch (gameMode) {
        case "single":
          sendHttpGETReq("api/quit", (res) => {
            if (res == "ok") {
              arrPlayerBHandMessages = [];
              arrPlayerAHandMessages = [];
              cleanElement(divMain);
              greet();
            }
          });

          break;
        case "double":
          removeElementByQuery("chat");
          io_client.emit("quit");
          break;
      }

      /////////////////////////////////////////////////////
      document.body.removeChild(divOverlay);
      document.body.removeChild(quitDiv);
      document.body.removeChild(ev.target);
      cleanElement(divMain);
      greet();
    };
    buttN.innerHTML = "No";
    buttN.onclick = () => {
      document.body.removeChild(divOverlay);
      document.body.removeChild(quitDiv);
    };
    let pButts = document.createElement("p");
    pButts.append(buttY, buttN);
    quitDiv.append(h1, pButts);
    document.body.appendChild(quitDiv);
  };
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
    if (winArr[i] == -1) {
      h2.style.color = "black";
    }
    if (winArr[i] == 1) {
      h2.style.color = "white";
    }
    divInfoPlayerB.appendChild(h2);
  }

  for (let i = 0; i < arrPlayerAHandMessages.length; i++) {
    let h2 = document.createElement("h2");
    h2.innerHTML = "&middot; " + arrPlayerAHandMessages[i];
    if (winArr[i] == -1) {
      h2.style.color = "white";
    }
    if (winArr[i] == 1) {
      h2.style.color = "black";
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
  if (isSideMenuOpen) {
    removeElementByQuery("divMenu");
    removeElementByQuery("contentBox");

    isSideMenuOpen = false;
    return;
  }
  isSideMenuOpen = true;
  let divMenu = document.createElement("div");
  divMenu.className = "menu";
  divMenu.id = "divMenu";
  document.body.appendChild(divMenu);

  sendHttpGETReq("api/get_menu_items", (res) => {
    menuItems = JSON.parse(res);
    for (let i = 0; i < menuItems.length; i++) {
      let pMenu = document.createElement("p");
      pMenu.className = "pMenu";
      pMenu.innerHTML = "> " + menuItems[i].name + "";
      pMenu.onclick = () => {
        let contentBox = document.createElement("div");
        contentBox.className = "menu";
        contentBox.id = "contentBox";
        if (menuItems[i].HttpRequest == "none") {
          let pokerHands = document.createElement("img");
          pokerHands.src = "images/poker_hands_rankings.jpg";
          pokerHands.id = "pokerHands";
          let quitButt = document.createElement("button");
          quitButt.innerHTML = "X";
          quitButt.className = "buttGame buttPokerHands";
          contentBox.append(pokerHands, quitButt);
          quitButt.onclick = (ev) => {
            removeElementByQuery("contentBox");
          };
        } else {
          sendHttpGETReq("/api" + menuItems[i].HttpRequest, (res) => {
            let content = JSON.parse(res);
            let h3 = document.createElement("h3");
            h3.innerHTML = content;
            contentBox.appendChild(h3);
            let buttEsc = document.createElement("button");
            buttEsc.innerHTML = "X";
            buttEsc.onclick = () => {
              document.body.removeChild(contentBox);
            };

            contentBox.appendChild(buttEsc);
          });
        }
        document.body.appendChild(contentBox);
        document.body.removeChild(divMenu);
      };
      divMenu.appendChild(pMenu);
    }
  });
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

function chatWindow() {
  if (isChatOpen) {
    isChatOpen = false;
    removeElementByQuery("chatBox");
    return;
  }
  cleanElement(chat);
  isChatOpen = true;
  let chatBox = document.createElement("div");
  chatBox.id = "chatBox";

  let form = document.createElement("form");
  form.id = "formChat";
  form.action = "";

  let send = document.createElement("button");
  send.id = "sendButt";
  send.type = "submit";
  send.innerHTML = "Send";

  send.onclick = (ev) => {
    ev.preventDefault();
    let msg = input.value;
    if (msg == "") return;
    io_client.emit("chat-message", { msg, senderId: io_client.id });
    input.value = "";
  };

  let input = document.createElement("input");
  input.id = "inputChat";
  input.autocomplete = "off";

  messages.id = "messagesChat";
  chatBox.appendChild(messages);

  form.append(send, input);
  chatBox.appendChild(form);

  document.body.appendChild(chatBox);
}
