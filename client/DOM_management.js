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
  buttPass;

// initializing more variables
let iAmFlipReady; // for double mode. this is used to prevent display of 'PASS' button when player already pressed it (if renderMultiplayer is called again)
let gameMode; // will be passed from game obj
let isSideMenuOpen = false; // will help with opening/closing of side menu
let isLogInMenuOpen = false;
let isChatOpen = false; // will help with opening/closing of chat
let messages = document.createElement("ul"); // actual chat container
let soundOn = true;
let data = {}; // this will be passed from server > client as main game obj (single)
let menuItems = {}; // will take info object from server
let winArr; // for single - will eventually hold 5 elements, one for each hand, stating if lose win or tie (1, -1, 0)
let renderInfo = true; // when false, will prevent mis-rendering of info after single ending sequence

let arrPlayerBHandMessages = []; // for ending sequence
let arrPlayerAHandMessages = []; // for ending sequence

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

  divMain = document.getElementById("divMain"); // this is the main game div (body center)
  divMain.style.flexDirection = "column";
  let img = document.createElement("img");
  img.src = "images/lemmy.png";
  img.id = "flush";
  divMain.appendChild(img);
  let buttPlayVSComputer = document.createElement("button");
  buttPlayVSComputer.className = "buttPlay";buttPlayVSComputer.innerHTML = "VS. pc";
  buttPlayVSComputer.innerHTML = "VS. PC";
  divMain.appendChild(buttPlayVSComputer);

  buttPlayVSComputer.onclick = () => {
    // butt to start single player game
    sendHttpGETReq("api/start_game_vs_computer", (res) => {
      data = JSON.parse(res);
      if (soundOn) openingSound.play();
      // resetting:
      renderInfo = true;
      winArr = [];
      // calling init that initializes DOM vars, and render that is the game loop
      init();
      render();
    });
  };

  // what it means to start a multiplyer game:
  // PIN management for both game game solicitor and taker
  let buttJoinMultiplayerGame = document.createElement("button");
  buttJoinMultiplayerGame.className = "buttPlay";
  buttJoinMultiplayerGame.innerHTML = "JOIN";
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
    buttAccept.className = "startDoubleGame"; // for python automation
    buttAccept.src = "images/accept.png";
    buttAccept.onclick = () => {
      let pin = inputPIN.value;
      io_client.emit("join-online-game", pin);
      iAmFlipReady = false;
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
  buttCreateMultiplayerGame.innerHTML = "INVITE";
  divMain.appendChild(buttCreateMultiplayerGame);
  divMain.appendChild(buttJoinMultiplayerGame);
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
      // copy PIN to clipboard
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
    io_client.emit("game-request-from-user"); // prompts socket server to give long hard PIN
    io_client.on("game-request-response", (pin) => {
      // this event did not function well when placed in socket-client manager
      iAmFlipReady = false;
      pPIN.innerHTML = pin;
    });
  };
}

// init func
function init() {
  //
  cleanElement(divMain);
  removeElementByQuery("buttQuit");
  let buttQuit = document.createElement("button");
  buttQuit.innerHTML = "QUIT";
  buttQuit.id = "buttQuit";
  buttQuit.className = "buttGame";
  document.body.appendChild(buttQuit);

  // this provides a 'quit' functionality for single/double mode:
  buttQuit.onclick = (ev) => {
    // if clicked & accepted, sends you back to main menu
    let divOverlay = document.createElement("div");
    divOverlay.className = "divOverlay";
    document.body.appendChild(divOverlay);
    let quitDiv = document.createElement("div");
    quitDiv.className = "divPop divPopQuit";
    let h1 = document.createElement("h1");
    h1.innerHTML = "Quit game?";
    let buttY = document.createElement("button");
    buttY.id = "buttY";
    let buttN = document.createElement("button");
    buttY.className = "buttGame";
    buttN.className = "buttGame";
    buttY.innerHTML = "Yes";
    /////////////////////////////////////////////////////
    buttY.onclick = () => {
      // asks what to do ("how" to quit) in case of single/double mode.
      // if needed, will reset vars for the mode
      switch (gameMode) {
        case "single":
          renderInfo = false;
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
          greet();
          break;
      }

      document.body.removeChild(divOverlay);
      document.body.removeChild(quitDiv);
      document.body.removeChild(ev.target);
      cleanElement(divMain);
      // calling main menu:
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
  // further initializing of vars
  divDeck = document.createElement("div");
  divDeck.id = "divDeck";
  divPlayers = document.createElement("div"); // div for players
  divPlayers.id = "divPlayers";
  divPlayerB = document.createElement("div");
  divPlayerB.id = "divPlayerB";
  divPlayerA = document.createElement("div");
  divPlayerA.id = "divPlayerA";
  divPlayerAPickupCard = document.createElement("div");
  divPlayerAPickupCard.id = "divPlayerAPickupCard";

  divInfo = document.createElement("div"); // for info, cards to play, ending sequence and score
  divInfo.id = "divInfo";
  divHeaders = document.createElement("div");
  divHeaders.id = "divHeaders";
}

function renderInfoScore() {
  // in the ending sequence (aka the 'animation') of single player, this func is called for player hand (5 times over all),
  // displaying the name of the hands to 'divInfo'
  cleanElement(divInfo);

  let handPlayerBName = data.results.handPlayerBName;
  let handPlayerAName = data.results.handPlayerAName;

  // this chunk deals with pleasant representation of hands names strings, provided by the generous GPT
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

  // this deals the repaired 'names' to their player owner
  // player B here is computer, player A is human
  arrPlayerBHandMessages.push(handPlayerBName);
  arrPlayerAHandMessages.push(handPlayerAName);
  let divInfoPlayerB = document.createElement("div");
  divInfoPlayerB.className = "divInfoPlayers";
  let hHandPlayerB = document.createElement("h1");
  hHandPlayerB.innerHTML = "Opponent got:";
  hHandPlayerB.style.color = "silver";
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
      h2.style.color = "grey"; // grey color for losing hand
    }
    if (winArr[i] == 1) {
      h2.style.color = "white"; // white color for winning hand
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
      h2.style.color = "grey";
    }
    divInfoPlayerA.appendChild(h2);
  }

  let hBottomLine = document.createElement("h1");
  hBottomLine.className = "hBottomLine";
  // concusion for each hands pair (hwo wins current round)
  hBottomLine.innerHTML =
    data.results.winner == 1
      ? "Hand lost."
      : data.results.winner == -1
      ? "Hand won."
      : "A tie.";
  if (winArr.length >= 5) {
    // countOnesAndMinusOnes() refrenced from file
    // countOnesAndMinusOnes() determines who is overall winner after counting 1's and -1's, or declares tie
    if (countOnesAndMinusOnes(winArr) == -1) {
      hBottomLine.innerHTML = "You lost..";
      if (soundOn) loseSound.play();
    } else if (countOnesAndMinusOnes(winArr) == 1) {
      hBottomLine.innerHTML = "You won!";
      if (soundOn) winSound.play();
    } else {
      hBottomLine.innerHTML = "It's a tie.";
      if (soundOn) tieSound.play();
    }
  }
  divInfo.append(divInfoPlayerB, divInfoPlayerA, hBottomLine);
}

function openSideMenu() {
  // attached directly to HTML menu butt (top left-most)

  let topButtsTexts = Array.from(
    document.getElementsByClassName("hidden-text")
  );

  if (isSideMenuOpen) {
    removeElementByQuery("divMenu");
    removeElementByQuery("contentBox");
    for (let i = 0; i < topButtsTexts.length; i++) {
      topButtsTexts[i].style.visibility = "visible";
    }
    isSideMenuOpen = false;
    return;
  }
  for (let i = 0; i < topButtsTexts.length; i++) {
    topButtsTexts[i].style.visibility = "hidden";
  }

  isSideMenuOpen = true;
  let divMenu = document.createElement("div");
  divMenu.className = "menu";
  divMenu.id = "divMenu";
  document.body.appendChild(divMenu);

  // the button prompts the server to give menu items
  sendHttpGETReq("api/get_menu_items", (res) => {
    menuItems = JSON.parse(res);
    for (let i = 0; i < menuItems.length; i++) {
      let pMenu = document.createElement("p");
      pMenu.className = "pMenu";
      pMenu.innerHTML = "> " + menuItems[i].name + "";
      pMenu.onclick = () => {
        // each paragraph is clickable
        let contentBox = document.createElement("div");
        contentBox.className = "menu";
        contentBox.id = "contentBox";
        if (menuItems[i].HttpRequest == "none") {
          // specific case for 'hands hierarchy' img, provided by client
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
          // each paragraph when clicked, prompts server for that paragraph-related info, to display to client
          sendHttpGETReq("/api" + menuItems[i].HttpRequest, (res) => {
            let content = JSON.parse(res);
            content = content.replace(/\n/g, "<br>");
            let h3 = document.createElement("h3");
            h3.innerHTML = content;
            contentBox.appendChild(h3);
            contentBox.scrollTop = contentBox.scrollHeight;
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
  // attached directly to HTML butt, pretty self-explanatory
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
  // utilized in double mode

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

function openLogInMenu() {
  // if (isLogInMenuOpen) {
  //   isLogInMenuOpen = false;
  //   removeElementByQuery("loginBox");
  //   return;
  // }
  // let loginBox = document.createElement("div");
  // loginBox.className = "menu";
}
