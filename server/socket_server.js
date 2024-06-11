const io = require("socket.io");
const { LocalStorage } = require("node-localstorage");
const RishPok = require("./RishPok");
const localStorage = new LocalStorage("./scratch");
let io_server;

let pendingGames = {};
let games;
let game = {};
let currentGame = {};
let rishPok;
let drawnCard;

if (localStorage.getItem("games")) {
  games = JSON.parse(localStorage.getItem("games"));
} else {
  games = {};
}

function startServer(server) {
  io_server = io(server);

  io_server.on("connect", (socket) => {
    socket.on("game-request-from-user", (msg) => {
      let pin = parseInt(localStorage.getItem("lastGamePIN")) + 1;
      pendingGames[pin + ""] = socket.id;
      localStorage.setItem("lastGamePIN", pin);
      io_server.emit("game-request-response", pin);
    });

    socket.on("join-online-game", (pin) => {
      if (!pendingGames[pin]) {
        io_server.emit("game-start", "invalid");
      } else {
        game.playerA = pendingGames[pin]; //socketID for player A
        game.playerB = socket.id; //socketID for player B

        game.winner = null;
        games[pin] = game;

        localStorage.setItem("games", JSON.stringify(games));

        rishPok = new RishPok();

        currentGame.playerACards = rishPok.playerACards;
        currentGame.playerBCards = rishPok.playerBCards;

        drawnCard = rishPok.drawCard();
        currentGame.cardsLeft = rishPok.deck.length;

        currentGame.player = "a";

        io_server
          .to(game.playerA)
          .emit("game-start", { currentGame, drawnCard });

        currentGame.player = "b";
        io_server
          .to(game.playerB)
          .emit("game-start", { currentGame, drawnCard: null });
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

        if (rishPok.deck.length == 1) {
          io_server
            .to(player)
            .emit("player-played", { currentGame, drawnCard });
          drawnCard = rishPok.drawCard();
        } else {
          io_server
            .to(player)
            .emit("player-played", { currentGame, drawnCard: null });
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (currentGame.player == "a") {
          currentGame.player = "b";
        } else if (currentGame.player == "b") {
          currentGame.player = "a";
        }

        io_server
          .to(opponent)
          .emit("player-played", { currentGame, drawnCard });
      } else {
        io_server.to(player).emit("player-played", "invalid");
      }
    });
  });

  io_server.on("disconnect", (socket) => {
    socket.on("disconnecting", (msg) => {
      console.log("User disconected " + msg);
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

function isValidCardPlacement(cardsToCheck, wantedHand) {
  if (isNaN(wantedHand)) {
    return false;
  }
  wantedHand = parseInt(wantedHand);

  if (!Number.isInteger(wantedHand)) {
    return false;
  }
  if (wantedHand < 0 || wantedHand > 4) {
    return false;
  }

  let temp = cardsToCheck[wantedHand].length;
  for (let i = 0; i < cardsToCheck.length; i++) {
    if (temp > cardsToCheck[i].length) {
      return false;
    }
  }
  return true;
}

// function changeAnons(cardsList) {
//   cardsList[i].pop();
//   cardsList[i].push({ name: "anon_card" });
// }
