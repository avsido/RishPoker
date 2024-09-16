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
    upsert(updatedItem) {
        return this.upsertItems([updatedItem]);
    }
    update(updatedItem) {
        return this.updateItems([updatedItem]);
    }
    updateItems(updatedItems){
        return this.upsertItems(updatedItems,false);
    }
    upsertItems(updatedItems,deleteOriginal){
        const db = this.read();
        deleteOriginal = deleteOriginal ? true:false;
        updatedItems.forEach((updatedItem) => {
            let index = db.findIndex(item => item.id === updatedItem.id);
            if (index >= 0) {
                if (deleteOriginal){
                    db[index] = updatedItem;
                } else {
                    db[index] = Object.assign(db[index],updatedItem);    
                }
            } else {
                db.push(updatedItem);
            }
        })
        return this.write(db);
    }
}

module.exports = DB;
