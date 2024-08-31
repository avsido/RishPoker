const 
    DB = require('./db'),
    crypto = require('crypto');

class MODEL_DB {
    static db_name = 'db';
    static _dbInstance = false;
    static db(){
        if (!this._dbInstance){
            this._dbInstance = new DB(this.db_name);
        }
        return this._dbInstance;
    }
    static read(){
        return this.db().read();
    }
    static getOne(id){
        const 
            rows = this.read(),
            row = this.find(row => row.id === id);
        return row ? row:false;
    }
    static find(fn){
        return this.read().find(fn);
    }
    static upsert(data){
        return this.db().upsert(data);
    }
    static randID() {
        return crypto.randomBytes(16).toString('hex');
    }
}


module.exports = MODEL_DB;
