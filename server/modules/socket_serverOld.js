const { Server } = require("socket.io");
// const { LocalStorage } = require("node-localstorage");
// const comparePokerHands = require("./comparePokerHands");
// const generatePIN = require("./generatePin");
// const isValidCardPlacement = require("./isValidCardPlacement");
// const giveAnonCardName = require("./giveAnonCardName");
// const RishPokMulti = require("./RishPokMulti");
// const localStorage = new LocalStorage("./scratch");

// const POT = require("./modules/pot");
const usersModule = require("./modules/users"),
      users = new usersModule(),
      matchesModule = require("./modules/matches"),
      matches = new matchesModule();

// let pendingGames = {};
// let games;

// if (localStorage.getItem("games")) {
//   games = JSON.parse(localStorage.getItem("games"));
// } else {
//   games = {};
// }

function startServer(io_server) {
  // CORS Policy nuisance:
  let current_user;
  io_server.on("connection", (socket) => {
    console.log("socket-connection");
    socket.on("game-request-from-user", () => {
      socket.handshake.session.reload((err) => {
        current_user = socket.handshake.session.current_user;
        let match = matches.create(current_user.id);
        io_server.emit("game-request-response", match.pin);
      });
      
      /*
        pendingGames[pin] = socket.id;
        games[pin] = {};
      const pin = generatePIN();
      games[pin].occupid = false;
      */
    });

    socket.on("join-online-game", (pin) => {
      console.log("join-online-game");
      socket.handshake.session.reload((err) => {
        current_user = socket.handshake.session.current_user;
        user_session = socket.handshake.session;
        let pin = data.pin;
        matches.start(pin,user_session.current_user.id)
        /*
        if (
          !pendingGames[pin] ||
          socket.id == pendingGames[pin] ||
          (games[pin].hasOwnProperty("occupied") && games[pin].occupied)
        ) {
          io_server.to(socket.id).emit("game-start", "invalid");
        } else {
          let rishPok = new RishPokMulti(),
              gamepotObject = new POT(sess.current_user.id,data.uid),
              dbUsers = new USERS(),
              guest = dbUsers.find(user => user.id === sess.current_user.id),
              host = dbUsers.find(user => user.id === data.uid),
              gamePot = gamepotObject.read(),
              players = {};

          players[host.id] = {name:host.username,credit:host.credit};
          players[guest.id] = {name:guest.username,credit:guest.credit};
          const game = {
            playerA: pendingGames[pin],
            playerB: socket.id,
            occupied: true,
            winArr: [],
            winner: null,
            currentGame: {
              potAmount:gamePot.credit,
              players:players,
              pin: pin,
              gameMode: rishPok.gameMode,
              playerACards: rishPok.playerACards,
              playerBCards: rishPok.playerBCards,
              cardsLeft: rishPok.deck.length,
              player: "a",
              currentDrawnCard: {},
              twoToTango: 0,
            },
            drawnCard() {
              let takeCard = rishPok.drawCard();
              return takeCard;
            },
          };
          games[pin] = game;

          localStorage.setItem("games", JSON.stringify(games));

          let [diceA, diceB] = generateDiceNumbers();

          game.currentDrawnCard = game.drawnCard();
          game.currentGame.cardsLeft -= 1;

          if (diceA < diceB) {
            // player A starts
            io_server
              .to(game.playerA)
              .emit("roll-dice", [diceA, diceB, "You\nStart"]);
            io_server
              .to(game.playerB)
              .emit("roll-dice", [diceB, diceA, "Opponent\nStarts"]);

            io_server.to(game.playerA).emit("game-start", {
              currentGame: game.currentGame,
              drawnCard: game.currentDrawnCard,
            });

            game.currentGame.player = "b";

            io_server.to(game.playerB).emit("game-start", {
              currentGame: game.currentGame,
              drawnCard: null,
            });
          } else {
            // player B starts
            io_server
              .to(game.playerA)
              .emit("roll-dice", [diceA, diceB, "Opponent\nStarts"]);

            io_server
              .to(game.playerB)
              .emit("roll-dice", [diceB, diceA, "You\nStart"]);

            io_server.to(game.playerA).emit("game-start", {
              currentGame: game.currentGame,
              drawnCard: null,
            });

            game.currentGame.player = "b";
            io_server.to(game.playerB).emit("game-start", {
              currentGame: game.currentGame,
              drawnCard: game.currentDrawnCard,
            });
          }
        }
      });

      */
    });

    socket.on("place-card", (data) => {
      let i = data.i;
      let pin = data.pin;
      const game = games[pin];

      let player, opponent, playerCards;

      if (socket.id == game.playerA) {
        player = game.playerA;
        opponent = game.playerB;
        playerCards = game.currentGame.playerACards;
        game.currentGame.player = "a";
      }
      if (socket.id == game.playerB) {
        player = game.playerB;
        opponent = game.playerA;
        playerCards = game.currentGame.playerBCards;
        game.currentGame.player = "b";
      }

      if (isValidCardPlacement(playerCards, i)) {
        playerCards[i].push(game.currentDrawnCard);

        if (game.currentGame.cardsLeft > 2) {
          game.currentDrawnCard = game.drawnCard();
          game.currentGame.cardsLeft -= 1; /////////////////////////////
        } else {
          game.currentDrawnCard = null;
        }

        let pseudoObj = JSON.parse(JSON.stringify(game.currentGame));
        /*
          pseudoObj is used to create a 'mirror' of currentGame with the difference that
          it allows us to sent the fifth card of each hand as Anonymous without tempering with actual currentGame data
        */
        let handsToPatch;

        if (pseudoObj.player == "a") {
          handsToPatch = pseudoObj.playerBCards;
        } else {
          handsToPatch = pseudoObj.playerACards;
        }

        giveAnonCardName(handsToPatch);

        io_server
          .to(player)
          .emit("player-played", { currentGame: pseudoObj, drawnCard: null });

        if (game.currentGame.player == "a") {
          game.currentGame.player = "b";
        } else if (game.currentGame.player == "b") {
          game.currentGame.player = "a";
        }
        // create pseudo obj for player B:
        pseudoObj = JSON.parse(JSON.stringify(game.currentGame));
        if (pseudoObj.player == "a") {
          handsToPatch = pseudoObj.playerBCards;
        } else {
          handsToPatch = pseudoObj.playerACards;
        }
        giveAnonCardName(handsToPatch);

        io_server.to(opponent).emit("player-played", {
          currentGame: pseudoObj,
          drawnCard: game.currentDrawnCard,
        });
      } else {
        io_server.to(player).emit("player-played", "invalid");
      }
    });

    socket.on("quit", () => {
      /*
        this event is taken whenever a player uses the 'quit' butt, setting himself as the game loser
      */
      
      game.pot.conclude(game.winArr);
      let winMsg = "opponent quit, you win!";
      let loseMsg = "you lose";
      let gameOverType = 1; // type: opponent-quit
      let loser;
      if (socket.id == game.playerA) {
        game.winner = game.playerB;
        loser = game.playerA;
      } else {
        game.winner = game.playerA;
        loser = game.playerB;
      }
      io_server
        .to(game.winner)
        .emit("game-over", { msg: winMsg, gameOverType });
      io_server.to(loser).emit("game-over", { msg: loseMsg, gameOverType });
    });

    socket.on("game-over-show-winner", (pin) => {
      const game = games[pin];

      // this event is taken after all final-sequence animation is done, prompting the server to send final winner message
      let winMsg = "you win!";
      let loseMsg = "you lose!";
      let tieMsg = "It's a tie";
      let gameOverType = 0; // type: game-over
      if (game.winner != 0) {
        let loser;

        if (game.winner == 1) {
          game.winner = game.playerA;
          loser = game.playerB;
        } else {
          game.winner = game.playerB;
          loser = game.playerA;
        }
        io_server
          .to(game.winner)
          .emit("game-over", { msg: winMsg, gameOverType });
        io_server.to(loser).emit("game-over", { msg: loseMsg, gameOverType });
      } else {
        io_server.emit("game-over", { msg: tieMsg, gameOverType });
      }
    });
  });

  io_server.on("disconnect", (socket) => {
    socket.on("disconnecting", (msg) => {
      console.log("User disconnected " + msg);
    });
  });
}

function countOnesAndMinusOnes(winArr) {
  let counter = 0;
  let counterMinus = 0;
  for (let i = 0; i < winArr.length; i++) {
    if (winArr[i].winner == 1) counter += 1;
    else if (winArr[i].winner == -1) counterMinus += 1;
  }
  if (counter > counterMinus) {
    return -1;
  } else if (counter < counterMinus) return 1;
  return 0;
}

function emitFinalSequence(game) {
  for (let i = 0; i < 5; i++) {
    game.winArr.push(
      comparePokerHands(
        game.currentGame.playerBCards[i],
        game.currentGame.playerACards[i]
      )
    );
  }
  game.winner = countOnesAndMinusOnes(game.winArr);
  game.currentGame.player = "a";
  io_server.to(game.playerA).emit("start-flippin", {
    currentGame: game.currentGame,
    socketWinArr: game.winArr,
  });
  game.currentGame.player = "b";
  io_server.to(game.playerB).emit("start-flippin", {
    currentGame: game.currentGame,
    socketWinArr: game.winArr,
  });
}

/*
function generateDiceNumbers() {
  let diceResult = [];
  let diceA = Math.floor(Math.random() * 6) + 1;
  let diceB = Math.floor(Math.random() * 6) + 1;
  while (diceA == diceB) {
    diceB = Math.floor(Math.random() * 6) + 1;
  }
  diceResult.push(diceA, diceB);
  return diceResult;
}

function getIo() {
  if (!io_server) {
    throw new Error("Socket.io instance not initialized!");
  }
  return io_server;
}
*/
module.exports = {
  startServer,
  getIo,
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////