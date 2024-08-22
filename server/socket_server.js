const { Server } = require("socket.io");
const { LocalStorage } = require("node-localstorage");
const comparePokerHands = require("./comparePokerHands");
const generatePIN = require("./generatePin");
const isValidCardPlacement = require("./isValidCardPlacement");
const giveAnonCardName = require("./giveAnonCardName");
const RishPokMulti = require("./RishPokMulti");

const localStorage = new LocalStorage("./scratch");
let io_server;

let pendingGames = {};
let games;

if (localStorage.getItem("games")) {
  games = JSON.parse(localStorage.getItem("games"));
} else {
  games = {};
}

function startServer(server) {
  // CORS Policy nuisance:
  io_server = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io_server.on("connection", (socket) => {
    socket.on("game-request-from-user", () => {
      const pin = generatePIN();

      pendingGames[pin] = socket.id;

      games[pin] = {};
      games[pin].occupied = false;

      io_server.emit("game-request-response", pin);
    });

    socket.on("join-online-game", (pin) => {
      if (
        !pendingGames[pin] ||
        socket.id == pendingGames[pin] ||
        (games[pin].hasOwnProperty("occupied") && games[pin].occupied)
      ) {
        io_server.to(socket.id).emit("game-start", "invalid");
      } else {
        let rishPok = new RishPokMulti();

        const game = {
          playerA: pendingGames[pin],
          playerB: socket.id,
          occupied: true,
          winArr: [],
          winner: null,
          currentGame: {
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

    socket.on("place-wild-card", (data) => {
      // serious kefel-kod ahead, couldnt shake it..
      /*
        occurs when player attempts to play - you guessed it - a Wild Card
        takes i (hand) and j (card to switch from that hand. must be 4) from client and validates the move.
      */
      let pin = data.pin;
      const game = games[pin];

      let hand = data.hand;
      let card = data.card;

      let player, opponent, playerCards, drawnCard, drawnCardOpponent;

      if (socket.id == game.playerA) {
        player = game.playerA;
        opponent = game.playerB;
        playerCards = game.currentGame.playerACards;
        drawnCard = game.currentGame.wildCardA;
        drawnCardOpponent = game.currentGame.wildCardB;
        game.currentGame.player = "a";
      }
      if (socket.id == game.playerB) {
        player = game.playerB;
        opponent = game.playerA;
        playerCards = game.currentGame.playerBCards;
        drawnCard = game.currentGame.wildCardB;
        drawnCardOpponent = game.currentGame.wildCardA;
        game.currentGame.player = "b";
      }
      if (isNaN(hand) || isNaN(card)) {
        io_server.to(player).emit("player-played-wild-card", "invalid");
        return;
      }

      hand = parseInt(hand);
      card = parseInt(card);

      if (!Number.isInteger(hand) || !Number.isInteger(card)) {
        io_server.to(player).emit("player-played-wild-card", "invalid");
        return;
      }
      if (hand < 0 || hand > 4 || card != 4) {
        io_server.to(player).emit("player-played-wild-card", "invalid");
        return;
      }

      playerCards[hand].splice(card, 1, drawnCard);

      game.currentGame.cardsLeft -= 1;

      let pseudoObj = JSON.parse(JSON.stringify(game.currentGame));
      let handsToPatch;
      if (pseudoObj.player == "a") {
        handsToPatch = pseudoObj.playerBCards;
      } else {
        handsToPatch = pseudoObj.playerACards;
      }

      giveAnonCardName(handsToPatch);

      io_server.to(player).emit("player-played-wild-card", {
        currentGame: pseudoObj,
        drawnCard: null,
      });

      if (game.currentGame.player == "a") {
        game.currentGame.player = "b";
      } else if (game.currentGame.player == "b") {
        game.currentGame.player = "a";
      }

      pseudoObj = JSON.parse(JSON.stringify(game.currentGame));
      if (pseudoObj.player == "a") {
        handsToPatch = pseudoObj.playerBCards;
      } else {
        handsToPatch = pseudoObj.playerACards;
      }
      giveAnonCardName(handsToPatch);

      io_server.to(opponent).emit("player-played-wild-card", {
        currentGame: pseudoObj,
        drawnCard: drawnCardOpponent,
      });

      game.currentGame.twoToTango += 1;
      if (game.currentGame.twoToTango == 2) {
        // if both players are 'ready' end players involvement in game and start final sequence aka the 'animation'
        return emitFinalSequence(game); // bellow..
      } else {
        io_server.to(opponent).emit("opponent-flip-ready");
      }
    });

    socket.on("client-ready-to-flip", (pin) => {
      // this event is taken a player either plays the 'Wild Card' or clicks the 'PASS' butt
      const game = games[pin];

      let player, opponent;
      if (socket.id == game.playerA) {
        player = game.playerA;
        opponent = game.playerB;
      } else {
        player = game.playerB;
        opponent = game.playerA;
      }
      game.currentGame.twoToTango += 1;
      if (game.currentGame.twoToTango == 2) {
        // if both players are 'ready' end players involvement in game and start final sequence aka the 'animation'
        emitFinalSequence(game); // bellow..
      } else {
        io_server.to(opponent).emit("opponent-flip-ready");
      }
    });

    socket.on("chat-message", (msg, senderId) => {
      // pretty self-explanatory
      io_server.emit("chat-message", msg, senderId);
    });

    socket.on("quit", () => {
      /*
        this event is taken whenever a player uses the 'quit' butt, setting himself as the game loser
      */
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
        game.currentGame.playerACards[i],
        game.currentGame.playerBCards[i]
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

module.exports = {
  startServer,
  getIo,
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
