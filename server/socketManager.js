// socketManager.js
const socketIo = require('socket.io');

let io;

function startServer(server) {
    io = socketIo(server);
    // Your socket setup logic here
    io.on('connection', (socket) => {
        console.log('a user connected');
    });
}

function getIo() {
    if (!io) {
        throw new Error("Socket.io instance not initialized!");
    }
    return io;
}

module.exports = {
    startServer,
    getIo,
};

