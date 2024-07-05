const ipLH = "localhost";
const ipHome = "10.0.0.2";
const ipHome2 = "10.0.0.6";
const ipShakury = "192.168.50.81";
const ipOfer = "";
const ipWork = "10.0.0.225";

// const io_client = io.connect("http://" + ipWork + ":8080");
const io_client = io.connect("/");

let startFliipinActive = false;
let gameOverActive = false;

io_client.on("connect", function () {
  console.log("client connected to server");
});

io_client.on("disconnect", function () {
  console.log("client disconnected from server");
});

io_client.on("server-created-online-game", function (pin) {
  console.log("in client manager >> PIN received from server:", pin);
});

io_client.on("game-start", (data) => {
  if (data == "invalid") {
    alert(data + " PIN number");
  } else {
    if (soundOn) openingSound.play();
    ({ currentGame, drawnCard, chatFriend } = data);
    init();
    renderMultiplayer();
  }
});

io_client.on("player-played", (data) => {
  if (data == "invalid") {
    console.log(data + "card placement");
    return;
  } else {
    ({ currentGame, drawnCard } = data);
    if (soundOn) placeCardSound.play();
    renderMultiplayer();
  }
});

io_client.on("player-played-wild-card", (data) => {
  if (data == "invalid") {
    alert(data + " card placement");
  } else {
    ({ currentGame, drawnCard } = data);
    if (soundOn) wildCardSound.play();
    renderMultiplayer();
  }
});

io_client.on("opponent-flip-ready", (opponentReadyToFlip) => {
  if (opponentReadyToFlip) {
    let hOpponentReady = document.createElement("h1");
    hOpponentReady.innerHTML = "&middot; your opponent is ready to flip";
    hOpponentReady.className = "hOpponentReady";
    divInfo.appendChild(hOpponentReady);
  }
});

io_client.on("start-flippin", (data) => {
  ({ currentGame, socketWinArr } = data);

  for (let i = 0; i < 5; i++) {
    if (!gameOverActive) {
      setTimeout(() => {
        if (!gameOverActive) {
          renderWinMultiplayer(i);
        }
      }, 2000 * i);
    }
  }
});

io_client.on("game-over", (gameOver) => {
  if (document.body.contains(document.getElementById("winDiv"))) {
    return;
  }
  gameOverActive = true;

  setTimeout(() => {
    gameOverActive = true;
  }, 150);

  ({ msg, gameOverType } = gameOver);

  let divOverlay = document.createElement("div");
  divOverlay.className = "divOverlay";

  let winDiv = document.createElement("div");
  winDiv.id = "winDiv";
  winDiv.className = "divPop divPopQuit";

  let h1 = document.createElement("h1");
  h1.innerHTML = msg;
  let okButt = document.createElement("button");
  okButt.className = "buttGame";
  okButt.innerHTML = "OK";
  winDiv.append(h1, okButt);
  okButt.addEventListener("click", () => {
    console.log("quit");
    removeElementByQuery("chat");
    removeElementByQuery("buttQuit");
    cleanElement(divMain);
    greet();
    emptyArray(arrPlayerAHandMessages);
    emptyArray(arrPlayerBHandMessages);
    document.body.removeChild(divOverlay);
    document.body.removeChild(winDiv);
  });
  document.body.appendChild(divOverlay);
  document.body.appendChild(winDiv);
});

io_client.on("chat-message", function (data) {
  if (!isChatOpen) {
    let messageDot = document.createElement("div");
    messageDot.id = "messageDot";
    chatMessage.play();
    chat.appendChild(messageDot);
  }
  const { msg, senderId } = data;
  const messagePrefix = senderId === io_client.id ? "you: " : "opponent: ";
  let span = document.createElement("span");
  span.innerText = messagePrefix;
  appendMessage(span, msg);
});

function appendMessage(name, msg) {
  const item = document.createElement("li");
  item.style.display = "inline-block";
  item.textContent = "~ " + msg;
  messages.append(name, item);
  messages.scrollTop = messages.scrollHeight;
}
