const io = require("socket.io");

let io_server;

function startServer(server) {
  io_server = io(server);

  io_server.on("connect", (socket) => {
    socket.on("create-online-game", (msg) => {
      console.log("User created online game!!");
      console.log(msg);
    });
    io_server.on("test-event", function (msg) {
      console.log(msg);
    });
  });

  io_server.on("disconnect", (socket) => {
    socket.on("disconnecting", (msg) => {
      console.log("User disconected");
      console.log(msg);
    });
  });

  /*
    io_server.on('create-online-game', (socket) => {
        console.log("I got a create-online-game event from a client!");
        let random_pin = "3453";
        // This will map a PIN to a game-iniator
        //waitingGames[random_pin] = socket;
    });

    io_server.on('join-online-game', (socket, data) => {
        let pin_to_look_for = data.pin;

        // is there a game with this PIN that is waiting for a game? 
        if (onlineGames.hasOwnProperty(pin_to_look_for)) {
            player_a = waitingGames[pin_to_look_for]; // this is a socket
            player_b = socket; // this is also a socket
            OnlineGame(player_a, player_b);
        }
        console.log('a user c2onnected');
    });
    */
}

function getIo() {
  if (!io_server) {
    throw new Error("Socket.io instance not initialized!");
  }
  return io_server;
}

module.exports = {
  startServer,
  getIo,
};
