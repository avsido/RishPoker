const io_client = io.connect("/");
app.game = null;
let gamePotObj = null;

let gameOverActive = false; // while game still on, this should be false.

io_client.on("connect", function () {
  console.log("client connected to server");
});
io_client.on("disconnect", function () {
  console.log("client disconnected from server");
});
io_client.on("game-start", (currentGame) => {
  console.log(currentGame);
  let message = currentGame.turn == "player" ? "YOU START" : "OPPONENT STARTS";
  cleanElement(divMain);
  Dice.roll(currentGame.dice.player, "dice1");
  Dice.roll(currentGame.dice.opponent, "dice2",message,()=>{
    setTimeout(() => {
      if (soundOn) openingSound.play();
      app.game = new game(currentGame);
    }, 2500);
  });
});

io_client.on("player-played", (currentGame) => {
  console.log(currentGame);
  app.game.update(currentGame);
});

io_client.on("player-left", (data) => {
  //console.log(window.userBox);
  ({ matchId, current_user } = data);
  //console.log(data);
  app.user = current_user;

  app.game.resolveAfterOpponentQuit(matchId);
});
