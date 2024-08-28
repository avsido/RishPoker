const MODEL_DB = require("./model_db.js"),
      crypto = require("crypto");

class Users extends MODEL_DB {
  static db_name = 'users';
  static login(params) {
    let { username, password } = params,
      hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex"),
      user = this.find(
        (user) => user.username === username && user.password === hashedPassword
      );
    if (!user) {
      return false;
    }

    delete user.password;
    return user;
  }
  static register(params) {
    let { username, password } = params,
      exists = this.find((user) => user.username === username),
      initialCredit = 10000,
      id = this.randID(),
      hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex"),
      user = {
        id,
        username,
        password: hashedPassword,
        credit: initialCredit,
      };
    if (exists) {
      return false;
    }
    this.upsert(user);
    delete user.password;

    return user;
  }
  static updateBalance(userId, offset) {
    let user = this.getOne(userId);
    user.credit += offset;
    this.upsert(user);
    return user;
  }
  static quit() {}
}

module.exports = Users;