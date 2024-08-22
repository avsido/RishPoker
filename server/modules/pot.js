const USERS = require("./users"),
  MODEL_DB = require("./model_db.js"),
  crypto = require("crypto");

class POT {
  startingPot = 200;
  id = null;
  players = {};
  randID() {
    return crypto.randomBytes(16).toString("hex");
  }
  constructor(hostId, guestId) {
    this.pots = new MODEL_DB("pots");
    this.id = this.randID();
    const users = new USERS(),
      potShare = this.startingPot / 2;
    users.updateBalance(hostId, 0 - potShare);
    users.updateBalance(guestId, 0 - potShare);
    const pot = {
      id: this.id,
      host: hostId,
      guest: guestId,
      credit: this.startingPot,
    };
    this.pots.upsert(pot);
  }
  read() {
    return this.pots.find((pot) => pot.id === this.id);
  }
  conclude(winArr) {
    let ratio = 1;
    ratioArr = [];
    ratioArr[0] = [];

    ratioArr[0][1] = 50;
    ratioArr[0][1] = 50;
    ratioArr[3][1] = 70;
    ratioArr[4][0] = 90;

    if (winArr.length == 5) {
      [1, 1, 1, 1, 1];
      //0/0 = 50%
      //1/0 = 55%
      //2/1 = 60%
      //3/2 = 65%
      //4/1 = 85%
      //4/0 = 90%
      //5/0 = 100%
      // -1 is Player A
      // +1 is Player B
    }
    ratio = ratioArr[aWins][bWins];

    const //[player1, player2] = pot.players,
      player1Share = pot.pot * ratio,
      player2Share = pot.pot * (1 - ratio),
      potsArr = this.db.read();
    this.users.updateBalance(player1.id, player1Share);
    this.users.updateBalance(player2.id, player2Share);
    this.pots.write(potsArr.filter((m) => m.id !== this.id));
  }
  call() {}
  bet(amount) {
    //ADD VALIDATION HERE. No more than pot limit. No more than player credit.
  }
  quit() {}
}

module.exports = POT;
