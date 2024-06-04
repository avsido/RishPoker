console.log("DOMManagement.js loaded");

// initializing variables
let buttMenu,
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
let winSound = new Howl({
  src: ["sounds/win.wav"],
});
let loseSound = new Howl({
  src: ["sounds/lose.wav"],
});
let tieSound = new Howl({
  src: ["sounds/tie.wav"],
});

//greet screen func
function greet() {
  console.log(io_client);
  buttMenu = document.getElementById("buttMenu");
  // buttSound = document.getElementById("buttSound");
  divMain = document.getElementById("divMain");
  divMain.style.flexDirection = "column";
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
    io_client.on("connect", () => {
      console.log("Socket connected!");
    });
  };
  let aSignIn = document.createElement("a");
  aSignIn.className = "aSignIn";
  aSignIn.innerHTML = "sign in";
  divMain.appendChild(aSignIn);
}

// init func
function init() {
  cleanElement(divMain);
  let buttQuit = document.createElement("button");
  buttQuit.innerHTML = "quit";
  buttQuit.className = "buttGame";
  document.body.appendChild(buttQuit);
  buttQuit.onclick = (ev) => {
    sendHttpGETReq("api/quit", (res) => {
      // data = JSON.parse(res);
      document.body.removeChild(ev.target);
      cleanElement(divMain);
      greet();
    });
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

function cleanElement(element) {
  while (element.lastElementChild) {
    element.removeChild(element.lastElementChild);
  }
}
