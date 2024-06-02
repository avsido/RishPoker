// socketManager.js
const socketIo = require('socket.io');

let io;

function startServer(server) {
    io = socketIo(server);
    // Your socket setup logic here
    io.on('connection', (socket) => {
        console.log('a user connected');
    });

    io.on('create-online-game', (socket) => {
        let random_pin = "3453";
        // This will map a PIN to a game-iniator
        waitingGames[random_pin] = socket;
        console.log('a user connected');
    });

    io.on('join-online-game', (socket, data) => {
        let pin_to_look_for = data.pin;

        // is there a game with this PIN that is waiting for a game? 
        if (onlineGames.hasOwnProperty(pin_to_look_for)) {
            player_a = waitingGames[pin_to_look_for]; // this is a socket
            player_b = socket; // this is also a socket
            OnlineGame(player_a, player_b);
        }
        console.log('a user c2onnected');
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

