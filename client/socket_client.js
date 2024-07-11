const io_client = io.connect("/");

let gameOverActive = false; // while game still on, this should be false.

io_client.on("connect", function () {
  console.log("client connected to server");
});

io_client.on("disconnect", function () {
  console.log("client disconnected from server");
});

io_client.on("game-start", (data) => {
  // instigated by server when game 'joiner' enters valid PIN number
  if (data == "invalid") {
    alert(data + " PIN number");
  } else {
    if (soundOn) openingSound.play();
    ({ currentGame, drawnCard } = data);
    // currentGame is the game data, mainly the cards
    // drawnCard is the card to play and will be a card object for active player and null for inactive player
    init(); // initial vars definition
    renderMultiplayer();
  }
});

io_client.on("player-played", (data) => {
  // this event is sent by server when a player played, prompting DOM to re-render screen
  if (data == "invalid") {
    console.log(data + "card placement");
    return;
  } else {
    ({ currentGame, drawnCard } = data);
    // currentGame is the game data, mainly the cards
    // drawnCard is the card to play and will be a card object for active player and null for inactive player
    if (soundOn) placeCardSound.play();
    renderMultiplayer();
  }
});

io_client.on("player-played-wild-card", (data) => {
  // this event is sent by server when a player played the Wild Card, prompting DOM to re-render screen
  if (data == "invalid") {
    alert(data + " card placement");
  } else {
    ({ currentGame, drawnCard } = data);
    if (soundOn) wildCardSound.play();
    renderMultiplayer();
  }
});

io_client.on("opponent-flip-ready", () => {
  // this event is sent from server when one of the players either played his 'Wild Card' or pressed the 'PASS' button
  // to inform other player that everybody's waiting for him
  let hOpponentReady = document.createElement("h1");
  hOpponentReady.innerHTML = "&middot; your opponent is ready to flip";
  hOpponentReady.className = "hOpponentReady";
  divInfo.appendChild(hOpponentReady);
});

io_client.on("start-flippin", (data) => {
  // this event starts the ending sequence (aka the 'animation')
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
  // this event basically concludes the game.
  // takes win/lose message from server and displays it
  if (document.body.contains(document.getElementById("winDiv"))) {
    return;
  }
  gameOverActive = true;

  setTimeout(() => {
    gameOverActive = false;
  }, 5000);

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
  // new chatbox msg
  // adds the fresh msg to the ul element
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
  // inner-use utility func that appends last message to messages body
  const item = document.createElement("li");
  item.style.display = "inline-block";
  item.textContent = "~ " + msg;
  messages.append(name, item);
  messages.scrollTop = messages.scrollHeight;
}
