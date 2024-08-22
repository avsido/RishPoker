const 
    DB = require('./DB'),
    crypto = require('crypto');

class MODEL_DB {
    db_name = null;
    constructor(db_name) {
        this.db_name = db_name;
        this.db = new DB(this.db_name);
    }
    read(){
        return this.db.read();
    }
    getOne(id){
        const 
            rows = this.read(),
            row = this.find(row => row.id === id);
        return row ? row:false;
    }
    find(fn){
        return this.read().find(fn);
    }
    upsert(data){
        return this.db.upsert(data);
    }
    randID() {
        return crypto.randomBytes(16).toString('hex');
    }
}


module.exports = MODEL_DB;