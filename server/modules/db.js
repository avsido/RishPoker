const 
    fs = require('fs'),
    path = require('path');

class DB {
    db_path = '../DB';
    file_path = '';
    constructor(file_path) {
        this.file_path = path.join(__dirname, '..', 'DB', file_path + '.json');
        if (!fs.existsSync(this.file_path)) {
            fs.writeFileSync(this.file_path, JSON.stringify([]));
        }
    }
    read() {
        const data = fs.readFileSync(this.file_path);
        return JSON.parse(data);
    }
    write(data) {
        return fs.writeFileSync(this.file_path, JSON.stringify(data, null, 2));
    }
    upsert(json_data) {
        const 
            db = this.read(),
            index = db.findIndex(item => item.id === json_data.id);
        if (index >= 0) {
            db[index] = json_data;
        } else {
            db.push(json_data);
        }
        return this.write(db);
    }
}

module.exports = DB;
