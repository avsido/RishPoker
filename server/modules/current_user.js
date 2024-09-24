class CURRENT_USER {
    id = null;
    users = null;
    constructor(id, users) {
        this.id = id;
        this.users = users;
    }
    read() {
        const user = this.users.find((user) => user.id === this.id);
        delete user.password;
        return user;
    }
    updateBalance(offset) {
        this.users.updateBalance(this.id, offset);
    }
}
module.exports = CURRENT_USER;