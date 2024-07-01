const { Server } = require("socket.io");
const { LocalStorage } = require("node-localstorage");
const comparePokerHands = require("./comparePokerHands");
const generatePIN = require("./generatePin");
const isValidCardPlacement = require("./isValidCardPlacement");
const changeAnons = require("./changeAnons");
const RishPokMulti = require("./RishPokMulti");

const localStorage = new LocalStorage("./scratch");

let io_server;
let pendingGames = {};
let games;
let game;
let currentGame;
let rishPok;
let drawnCard;
let wildCardA;
let wildCardB;

if (localStorage.getItem("games")) {
  games = JSON.parse(localStorage.getItem("games"));
} else {
  games = {};
}

function startServer(server) {
  io_server = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io_server.on("connection", (socket) => {
    socket.on("game-request-from-user", (msg) => {
      let pin = generatePIN();
      pendingGames[pin + ""] = socket.id;
      io_server.emit("game-request-response", pin);
    });

    socket.on("join-online-game", (pin) => {
      if (!pendingGames[pin]) {
        io_server.emit("game-start", "invalid");
      } else {
        game = {};
        game.playerA = pendingGames[pin]; //socketID for player A
        game.playerB = socket.id; //socketID for player B

        game.winArr = [];
        game.winner = null;
        games[pin] = game;

        localStorage.setItem("games", JSON.stringify(games));

        rishPok = new RishPokMulti();

        currentGame = {};
        currentGame.gameMode = rishPok.gameMode;
        currentGame.playerACards = rishPok.playerACards;
        currentGame.playerBCards = rishPok.playerBCards;

        currentGame.playerAPlayedWildCard = false;
        currentGame.playerBPlayedWildCard = false;
        currentGame.playerAFlipReady = false;
        currentGame.playerBFlipReady = false;

        let wildCards = rishPok.getWildCards();
        wildCardA = wildCards[0];
        wildCardB = wildCards[1];

        drawnCard = rishPok.drawCard();

        currentGame.cardsLeft = rishPok.deck.length;

        currentGame.player = "a";

        io_server.to(game.playerA).emit("game-start", {
          currentGame,
          drawnCard,
          chatFriend: game.playerB,
        });

        currentGame.player = "b";
        io_server.to(game.playerB).emit("game-start", {
          currentGame,
          drawnCard: null,
          chatFriend: game.playerA,
        });
      }
    });

    socket.on("place-card", (i) => {
      let player, opponent, playerCards;

      if (socket.id == game.playerA) {
        player = game.playerA;
        opponent = game.playerB;
        playerCards = currentGame.playerACards;
        currentGame.player = "a";
      }
      if (socket.id == game.playerB) {
        player = game.playerB;
        opponent = game.playerA;
        playerCards = currentGame.playerBCards;
        currentGame.player = "b";
      }

      if (isValidCardPlacement(playerCards, i)) {
        playerCards[i].push(drawnCard);
        drawnCard = rishPok.drawCard();
        currentGame.cardsLeft = rishPok.deck.length;
        let pseudoObj = JSON.parse(JSON.stringify(currentGame));
        if (pseudoObj.player == "a") {
          handsToPatch = pseudoObj.playerBCards;
        } else {
          handsToPatch = pseudoObj.playerACards;
        }
        changeAnons(handsToPatch);
        if (rishPok.deck.length == 1) {
          io_server
            .to(player)
            .emit("player-played", { currentGame: pseudoObj, drawnCard });
          drawnCard = rishPok.drawCard();
        } else {
          io_server
            .to(player)
            .emit("player-played", { currentGame: pseudoObj, drawnCard: null });
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (currentGame.player == "a") {
          currentGame.player = "b";
        } else if (currentGame.player == "b") {
          currentGame.player = "a";
        }

        pseudoObj = JSON.parse(JSON.stringify(currentGame));
        if (pseudoObj.player == "a") {
          handsToPatch = pseudoObj.playerBCards;
        } else {
          handsToPatch = pseudoObj.playerACards;
        }
        changeAnons(handsToPatch);
        io_server
          .to(opponent)
          .emit("player-played", { currentGame: pseudoObj, drawnCard });
      } else {
        io_server.to(player).emit("player-played", "invalid");
      }
    });

    socket.on("place-wild-card", (data) => {
      // serious kefel kod ahead, couldnt shake it..
      let hand = data.hand;
      let card = data.card;

      let player, opponent, playerCards, drawnCardOpponent;

      if (socket.id == game.playerA) {
        player = game.playerA;
        opponent = game.playerB;
        playerCards = currentGame.playerACards;
        drawnCard = wildCardA;
        drawnCardOpponent = wildCardB;
        currentGame.player = "a";
      }
      if (socket.id == game.playerB) {
        player = game.playerB;
        opponent = game.playerA;
        playerCards = currentGame.playerBCards;
        drawnCard = wildCardB;
        drawnCardOpponent = wildCardA;
        currentGame.player = "b";
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
      if (currentGame.player == "a") {
        currentGame.playerAPlayedWildCard = true;
        // currentGame.playerAFlipReady = true;
      }
      if (currentGame.player == "b") {
        currentGame.playerBPlayedWildCard = true;
        // currentGame.playerBFlipReady = true;
      }
      playerCards[hand].splice(card, 1, drawnCard);

      currentGame.cardsLeft = rishPok.deck.length;

      let pseudoObj = JSON.parse(JSON.stringify(currentGame));

      if (pseudoObj.player == "a") {
        handsToPatch = pseudoObj.playerBCards;
      } else {
        handsToPatch = pseudoObj.playerACards;
      }
      changeAnons(handsToPatch);

      io_server.to(player).emit("player-played-wild-card", {
        currentGame: pseudoObj,
        drawnCard: null,
      });

      if (currentGame.player == "a") {
        currentGame.player = "b";
      } else if (currentGame.player == "b") {
        currentGame.player = "a";
      }

      pseudoObj = JSON.parse(JSON.stringify(currentGame));
      if (pseudoObj.player == "a") {
        handsToPatch = pseudoObj.playerBCards;
      } else {
        handsToPatch = pseudoObj.playerACards;
      }
      changeAnons(handsToPatch);

      io_server.to(opponent).emit("player-played-wild-card", {
        currentGame: pseudoObj,
        drawnCard: drawnCardOpponent,
      });
    });

    socket.on("client-ready-to-flip", () => {
      let player, opponent, opponentFlipReady;
      if (socket.id == game.playerA) {
        currentGame.playerAFlipReady = true;
        // currentGame.playerAPlayedWildCard = true;
        opponentFlipReady = currentGame.playerBFlipReady;
        player = game.playerA;
        opponent = game.playerB;
      } else {
        currentGame.playerBFlipReady = true;
        // currentGame.playerBPlayedWildCard = true;
        opponentFlipReady = currentGame.playerAFlipReady;
        player = game.playerB;
        opponent = game.playerA;
      }
      if (opponentFlipReady) {
        for (let i = 0; i < 5; i++) {
          game.winArr.push(
            comparePokerHands(
              currentGame.playerBCards[i],
              currentGame.playerACards[i]
            )
          );
        }
        game.resolution = countOnesAndMinusOnes(game.winArr);
        currentGame.player = "a";
        io_server.to(game.playerA).emit("start-flippin", {
          currentGame,
          socketWinArr: game.winArr,
        });
        currentGame.player = "b";
        io_server.to(game.playerB).emit("start-flippin", {
          currentGame,
          socketWinArr: game.winArr,
        });
        ////////////////////////////////
        ////////////////////////////////
      } else {
        io_server.to(opponent).emit("opponent-flip-ready", true);
        io_server.to(player).emit("opponent-flip-ready", false);
      }
    });

    socket.on("chat-message", (msg, senderId) => {
      io_server.emit("chat-message", msg, senderId);
    });

    socket.on("quit", () => {
      let gameOver = {
        msg: "opponent-quit, you won!",
        type: 1, // type: opponent-quit
      };
      if (socket.id == game.playerA) {
        game.winner = game.playerB;
      } else {
        game.winner = game.playerA;
      }

      // io_server.to(game.winner).emit("opponent-quit");
      io_server.to(game.winner).emit("game-ver", gameOver);
    });

    socket.on("game-over-show-winner", () => {
      let winMsg = "you win!";
      let loseMsg = "you lose!";
      let tieMsg = "It's a tie";
      let gameOverType = 0;
      if (game.resolution != 0) {
        let loser;

        if (game.resolution == 1) {
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
