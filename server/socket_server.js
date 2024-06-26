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
let game = {};
let currentGame = {};
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

  io_server.on("connect", (socket) => {
    socket.on("game-request-from-user", (msg) => {
      let pin = generatePIN();
      pendingGames[pin + ""] = socket.id;
      io_server.emit("game-request-response", pin);
    });

    socket.on("join-online-game", (pin) => {
      if (!pendingGames[pin]) {
        io_server.emit("game-start", "invalid");
      } else {
        game.playerA = pendingGames[pin]; //socketID for player A
        game.playerB = socket.id; //socketID for player B
        game.playerAFlipReady = false;
        game.playerBFlipReady = false;
        game.winArr = [];
        game.winner = null;
        games[pin] = game;

        localStorage.setItem("games", JSON.stringify(games));

        rishPok = new RishPokMulti();

        game_mode = rishPok.gameMode;

        currentGame.playerACards = rishPok.playerACards;
        currentGame.playerBCards = rishPok.playerBCards;

        currentGame.playerAPlayedWildCard = rishPok.playerAPlayedWildCard;
        currentGame.playerBPlayedWildCard = rishPok.playerBPlayedWildCard;

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
      }
      if (currentGame.player == "b") {
        currentGame.playerBPlayedWildCard = true;
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
        game.playerAFlipReady = true;
        opponentFlipReady = game.playerBFlipReady;
        player = game.playerA;
        opponent = game.playerB;
      } else {
        game.playerBFlipReady = true;
        opponentFlipReady = game.playerAFlipReady;
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
      } else {
        io_server.to(opponent).emit("opponent-flip-ready", true);
        io_server.to(player).emit("opponent-flip-ready", false);
      }
    });

    socket.on("chat-message", (msg, senderId) => {
      io_server.emit("chat-message", msg, senderId);
    });

    socket.on("quit", () => {
      let winner;
      if (socket.id == game.playerA) {
        winner = game.playerB;
      } else {
        winner = game.playerA;
      }
      io_server.to(winner).emit("opponent-quit");
      game = {};
      currentGame = {};
      rishPok = {};
      drawnCard = {};
      wildCardA = {};
      wildCardB = {};
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
