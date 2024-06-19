const ipLH = "localhost";
const ipHome = "10.0.0.2";
const ipWork = "10.0.0.219";
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
  console.log(msg);
  console.log(typeof msg);
  const messagePrefix = senderId === io_client.id ? "you: " : "opponent: ";
  appendMessage(`${messagePrefix}${msg}`);
});

function appendMessage(message) {
  const item = document.createElement("li");
  item.textContent = message;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}
