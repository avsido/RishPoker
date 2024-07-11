const { Server } = require("socket.io");
const { LocalStorage } = require("node-localstorage");
const comparePokerHands = require("./comparePokerHands");
const generatePIN = require("./generatePin");
const isValidCardPlacement = require("./isValidCardPlacement");
const giveAnonCardName = require("./giveAnonCardName");
const RishPokMulti = require("./RishPokMulti");

const localStorage = new LocalStorage("./scratch");

let twoToTango; // a counter that if reches 2, will prompt the final sequence aka the 'animation'
let io_server;
let pendingGames = {}; // stores potential game when a user prompts the server for a PIN number
let games; // overall obj for all games that ever took place. yet to have made substantial use of this. prolly be more relevant with users db.
let game; // the 'mirror' of the
let currentGame; // starts as 'mirror' for double-mode game Class on creation and serves as game-data-transferer in a game.

let rishPok; // import game Class

let drawnCard;
let wildCardA;
let wildCardB;

if (localStorage.getItem("games")) {
  games = JSON.parse(localStorage.getItem("games"));
} else {
  games = {};
}

function startServer(server) {
  // CORS Policy suisance:
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
      twoToTango = 0;
      game = {};
      io_server.emit("game-request-response", pin);
    });

    socket.on("join-online-game", (pin) => {
      // client pasted PIN and wants to join a pending game
      if (
        !pendingGames[pin] ||
        (game.hasOwnProperty("occupied") && game.occupied)
      ) {
        io_server.to(socket.id).emit("game-start", "invalid");
      } else {
        // if valid PIN - a game instance is created and data is sent to the players:
        twoToTango = 0;
        game.playerA = pendingGames[pin]; //socketID for player A
        game.playerB = socket.id; //socketID for player B
        game.occupied = true; // does the game have 2 players yet? if so, allow no-one else in
        game.winArr = [];
        game.winner = null;
        games[pin] = game;

        localStorage.setItem("games", JSON.stringify(games));

        rishPok = new RishPokMulti(); //create new instance of multi
        currentGame = {}; //initialize data obj to be sent over and over to clients
        currentGame.gameMode = rishPok.gameMode;
        currentGame.playerACards = rishPok.playerACards;
        currentGame.playerBCards = rishPok.playerBCards;

        let wildCards = rishPok.getWildCards(); // reserving 2 last cards in deck
        wildCardA = wildCards[0];
        wildCardB = wildCards[1];

        drawnCard = rishPok.drawCard();

        currentGame.cardsLeft = rishPok.deck.length;

        currentGame.player = "a";
        // send data with currentGame.player as 'a' to be rendered correctly

        io_server.to(game.playerA).emit("game-start", {
          currentGame,
          drawnCard,
        });
        // then send data with currentGame.player as 'b' to be rendered correctly

        currentGame.player = "b";
        io_server.to(game.playerB).emit("game-start", {
          currentGame,
          drawnCard: null,
        });
        // behaviour of switching players between "a" and "b" will repeat itself throughout server responses handling
      }
    });

    socket.on("place-card", (i) => {
      // takes i (hand) from client, and checks if the hand can take a card
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
        /*
          pseudoObj is used to create a 'mirror' of currentGame with the difference that 
          it allows us to sent the fifth card of each hand as Anonymous without tempering with actual currentGame data
        */
        if (pseudoObj.player == "a") {
          /* 
            handsToPatch - basically the opponent cards to be sent to giveAnonCardName func to temper with the names of the fifth card
            of each OPPONENT hand, in order to render them upside-down for client
          */
          // create pseudo obj for player A:
          handsToPatch = pseudoObj.playerBCards;
        } else {
          handsToPatch = pseudoObj.playerACards;
        }
        giveAnonCardName(handsToPatch);
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
        if (currentGame.player == "a") {
          currentGame.player = "b";
        } else if (currentGame.player == "b") {
          currentGame.player = "a";
        }
        // create pseudo obj for player B:
        pseudoObj = JSON.parse(JSON.stringify(currentGame));
        if (pseudoObj.player == "a") {
          handsToPatch = pseudoObj.playerBCards;
        } else {
          handsToPatch = pseudoObj.playerACards;
        }
        giveAnonCardName(handsToPatch);
        io_server
          .to(opponent)
          .emit("player-played", { currentGame: pseudoObj, drawnCard });
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

      playerCards[hand].splice(card, 1, drawnCard);

      currentGame.cardsLeft = rishPok.deck.length;

      let pseudoObj = JSON.parse(JSON.stringify(currentGame));

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
      giveAnonCardName(handsToPatch);

      io_server.to(opponent).emit("player-played-wild-card", {
        currentGame: pseudoObj,
        drawnCard: drawnCardOpponent,
      });

      twoToTango += 1;
      if (twoToTango == 2) {
        // if both players are 'ready' end players involvement in game and start final sequence aka the 'animation'
        return emitFinalSequence(); // bellow..
      } else {
        io_server.to(opponent).emit("opponent-flip-ready");
      }
    });

    socket.on("client-ready-to-flip", () => {
      // this event is taken a player either plays the 'Wild Card' or clicks the 'PASS' butt
      let player, opponent;
      if (socket.id == game.playerA) {
        player = game.playerA;
        opponent = game.playerB;
      } else {
        player = game.playerB;
        opponent = game.playerA;
      }
      twoToTango += 1;
      if (twoToTango == 2) {
        // if both players are 'ready' end players involvement in game and start final sequence aka the 'animation'
        emitFinalSequence(); // bellow..
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

    socket.on("game-over-show-winner", () => {
      // this event is taken after all final-sequence animation is done, prompting the server to send final winner message
      let winMsg = "you win!";
      let loseMsg = "you lose!";
      let tieMsg = "It's a tie";
      let gameOverType = 0; // type: game-over
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

function emitFinalSequence() {
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
}

module.exports = {
  startServer,
  getIo,
};
