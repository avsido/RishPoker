const fs = require("fs");
const path = require("path");
const RishPokModule = require("../modules/RishPok");
(usersModule = require("../modules/users")),
  (matchesModule = require("../modules/matches")),
  (users = new usersModule()),
  (matches = new matchesModule());

class myserver {
  app = null;
  sockets = {};
  constructor(server, app, io) {
    this.app = app;
    this.server = server;
    this.io = io;

    // Serve the HTML page
    app.get("/home", (req, res) => {
      let indexPath = path.join(__dirname, "..", "client", "index.html");
      res.sendFile(indexPath);
    });

    app.get("/current_user", (req, res) => {
      if (req.session.current_user) {
        res.json(req.session.current_user);
      } else {
        res.send(false);
      }
    });

    app.get("/login", (req, res) => {
      const loggedUser = users.login(req.query),
        response = loggedUser ? loggedUser : "failed";
      req.session.current_user = loggedUser;
      req.session.save((err) => {
        if (err) {
          return res.status(500).send({ message: "Session save error" });
        }
        res.json(response);
      });
    });

    app.get("/register", (req, res) => {
      const loggedUser = users.register(req.query),
        response = loggedUser ? loggedUser : "failed";
      req.session.current_user = loggedUser;
      req.session.save((err) => {
        if (err) {
          return res.status(500).send({ message: "Session save error" });
        }
        res.json(response);
      });
    });

    app.get("/logout", (req, res) => {
      req.session.current_user = false;
      res.send(true);
    });

    app.get("/host/:pot", (req, res) => {
      let current_user = req.session.current_user,
        match = matches.create(current_user.id, req.params.pot),
        hostRoom = "match-" + match.id + "-user-" + current_user.id,
        socket = this.sockets[req.session.id];
      res.send(match.pin);
      socket.join(hostRoom);
    });

    app.get("/join/:pin", (req, res) => {
      let match = matches.start(req),
        guestRoom = "match-" + match.id + "-user-" + match.guest.id,
        socket = this.sockets[req.session.id];
      socket.join(guestRoom);
      this.emitMatch(match, req, res, "game-start");
    });

    app.get("/place_card/:match_id/:cardcol", (req, res) => {
      let match = matches.placeCard(req);
      this.emitMatch(match, req, res);
    });

    app.get("/place_bet/:match_id/:amount", (req, res) => {
      let match = matches.placeBet(req);
      this.emitMatch(match, req, res);
    });

    app.get("/leave/:match_id", (req, res) => {
      let match = matches.leave(req);
      let current_user = req.session.current_user,
        opponentRole = current_user.id == match.host ? "guest" : "host",
        opponentId = match[opponentRole],
        opponentRoom = "match-" + match.id + "-user-" + opponentId;
      let opponent = users.getOne(opponentId);

      this.io
        .to(opponentRoom)
        .emit("player-left", { matchId: match.id, current_user: opponent });

      res.send(true);
    });
  }

  emitMatchToPlayer(match, req, res, event, role) {
    let playerId = match[role].id,
      opponentRole = role == "guest" ? "host" : "guest",
      playerRoom = "match-" + match.id + "-user-" + playerId,
      playerMatch = {
        id: match.id,
        turn: match.turn == role ? "player" : "opponent",
        first: match.first == role ? "player" : "opponent",
        player: match[role],
        opponent: match[opponentRole],
        cards: {
          player: match.cards[role],
          opponent: match.cards[opponentRole],
          deck: match.cards.deck,
          drawn: match.cards.drawn
            ? match.turn == role
              ? match.cards.drawn
              : { name: "anon_card" }
            : match.cards.drawn,
        },
        pot: match.pot,
        cardsLeft: match.cardsLeft,
        bets: {
          player: match.bets[role],
          opponent: match.bets[opponentRole],
          checked: match.bets.checked
            ? role == match.bets.checked
              ? "player"
              : "opponent"
            : null,
        },
      };

    if (match.dice) {
      playerMatch.dice = {
        player: match.dice[role],
        opponent: match.dice[opponentRole],
      };
    }

    if (match.results) {
      playerMatch.results = [];
      playerMatch.cards.drawn = null;
      match.results.forEach((handResult, handIndex) => {
        playerMatch.results[handIndex] = {
          winner: handResult.winner == role ? "player" : "opponent",
          hands: {
            player: handResult.hands[role],
            opponent: handResult.hands[opponentRole],
          },
        };
      });
      playerMatch.share = match.share[role];
    } else {
      playerMatch.cards.opponent.forEach((cardCol, colIndex) => {
        if (cardCol[4]) {
          playerMatch.cards.opponent[colIndex][4] = { name: "anon_card" };
        }
      });
    }

    this.io.to(playerRoom).emit(event, playerMatch);
  }

  emitMatch(match, req, res, event) {
    if (match) {
      delete match.guest.password;
      delete match.host.password;
      event = typeof event == "string" ? event : "player-played";

      // Emit the match state to both players
      this.emitMatchToPlayer(match, req, res, event, "guest");
      this.emitMatchToPlayer(match, req, res, event, "host");

      res.send(true);
    } else {
      res.send(false);
    }
  }

  start() {
    this.io.on("connection", (socket) => {
      let session_id = socket.handshake.session.id;
      this.sockets[session_id] = socket;
    });
    this.server.listen(8080, () => {
      console.log("RainManPoker Server running on port 8080...");
    });
  }
}

module.exports = myserver;
