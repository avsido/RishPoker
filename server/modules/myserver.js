const fs = require("fs"),
      path = require("path"),
      Users = require("../modules/users"),
      Matches = require("../modules/matches");

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
      const loggedUser = Users.login(req.query);

      if (!loggedUser) {
        return res.status(401).json({ message: "Login failed" });
      }

      req.session.current_user = loggedUser;
      req.session.save((err) => {
        if (err) {
          return res.status(500).send({ message: "Session save error" });
        }
        res.json(loggedUser);
      });
    });

   app.get("/register", (req, res) => {
      const loggedUser = Users.register(req.query),
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
          match = Matches.create(current_user.id, req.params.pot),
          hostRoom = "match-" + match.id + "-user-" + current_user.id,
          socket = this.sockets[req.session.id];
      res.send(match.pin);
      // console.log(current_user.username + " - host listening to channel:" + hostRoom);
      socket.join(hostRoom);
    });

    app.get("/join/:pin", (req, res) => {
      let current_user = req.session.current_user,
          match = Matches.start(req),
          guestRoom = "match-" + match.id + "-user-" + match.guest.id,
          socket = this.sockets[req.session.id];
      socket.join(guestRoom);
      // console.log(current_user.username + " - guest listening to channel:" + guestRoom);
      this.emitMatch(match, req, res, "game-start");
    });

    app.get("/place_card/:match_id/:cardcol", (req, res) => {
      let match = Matches.placeCard(req);
      this.emitMatch(match, req, res);
    });

    app.get("/place_bet/:match_id/:amount", (req, res) => {
      let match = Matches.placeBet(req);
      this.emitMatch(match, req, res);
    });

    app.get("/leave/:match_id", (req, res) => {
      let match = Matches.leave(req);
      let current_user = req.session.current_user,
        opponentRole = current_user.id == match.host ? "guest" : "host",
        opponentId = match[opponentRole],
        opponentRoom = "match-" + match.id + "-user-" + opponentId;
      let opponent = Users.getOne(opponentId);

      this.io
        .to(opponentRoom)
        .emit("player-left", { matchId: match.id, current_user: opponent });

      res.send(true);
    });
  }
  emitMatch(match, req, res, event) {
    let response = false;
    if (match) {
      delete match.guest.password;
      delete match.host.password;
      event = typeof event == "string" ? event : "player-played";
      let 
        guestRoom = "match-" + match.id + "-user-" + match.guest.id,
        guestMatch = Matches.formatForRole(match,'guest'),
        hostRoom = "match-" + match.id + "-user-" + match.host.id,
        hostMatch = Matches.formatForRole(match,'host');
      this.io.to(guestRoom).emit(event, guestMatch);
      this.io.to(hostRoom).emit(event, hostMatch);
      response = true;
    }
    res.send(response);
  }
  start() {
    this.io.on("connection", (socket) => {
      let session_id = socket.handshake.session.id;
      this.sockets[session_id] = socket;
      console.log('socket connection ' + socket.id);
    });
    this.server.listen(8080, () => {
      console.log("RainManPoker Server running on port 8080...");
    });
  }
}

module.exports = myserver;
