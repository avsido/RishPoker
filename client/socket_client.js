const ipLH = "localhost";
const ipHome = "10.0.0.2";
const ipWork = "10.0.0.205";
const ipOfer = "";

const io_client = io.connect("http://" + ipWork + ":8080");

io_client.on("connect", function () {
  console.log("client connected to server");
});

io_client.on("disconnect", function () {
  console.log("client disconnected from server");
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

io_client.on("server-created-online-game", function (pin) {
  console.log("in client manager >> PIN received from server:", pin);
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
  let arrPlayerBHandMessages = [];
  let arrPlayerAHandMessages = [];
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      renderWinMultiplayer(i);
    }, 2000 * i);
  }
});

io_client.on("chat-message", function (data) {
  if (!isChatOpen) {
    let messageDot = document.createElement("div");
    messageDot.id = "messageDot";
    chat.appendChild(messageDot);
  }
  const { msg, senderId } = data;
  const messagePrefix = senderId === io_client.id ? "you: " : "opponent: ";
  let span = document.createElement("span");
  span.innerText = messagePrefix;
  appendMessage(span, msg);
});

io_client.on("opponent-quit", () => {
  let winDiv = document.createElement("div");
  winDiv.className = "divPop divPopQuit";
  let h1 = document.createElement("h1");
  h1.innerHTML = "Opponent quit, You win!";
  let okButt = document.createElement("button");
  okButt.className = "buttGame";
  okButt.innerHTML = "OK";
  okButt.onclick = () => {
    let chat = document.querySelector("#chat");
    if (chat) {
      document.body.removeChild(chat);
    }
    let buttQuit = document.querySelector("#buttQuit");
    if (buttQuit) {
      document.body.removeChild(buttQuit);
    }
    document.body.removeChild(winDiv);
    cleanElement(divMain);
    greet();
  };
  winDiv.append(h1, okButt);
  document.body.appendChild(winDiv);
});

function appendMessage(name, msg) {
  const item = document.createElement("li");
  item.style.display = "inline-block";
  item.textContent = "~ " + msg;
  messages.append(name, item);
  window.scrollTo(0, document.body.scrollHeight);
}
