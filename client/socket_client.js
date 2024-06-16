// import { io } from "socket.io-client";

const io_client = io.connect("http://localhost:8080");

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
    ({ currentGame, drawnCard } = data);
    init();
    renderMultiplayer();
  }
});

io_client.on("player-played", (data) => {
  if (data == "invalid") {
    console.log("invalid card placement");
    return;
  } else {
    ({ currentGame, drawnCard } = data);
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
