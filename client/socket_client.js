// import { io } from "socket.io-client";

const io_client = io.connect("http://localhost:8080");

io_client.on("connect", function () {
  console.log("client connected to server");
});

io_client.on("disconnect", function () {
  console.log("client disconnected from server");
});

// io_client.on("test-event", function () {
//   console.log("im in client test event");
// });

io_client.on("server-created-online-game", function (pin) {
  console.log("in client manager >> PIN received from server:", pin);
});

io_client.on();

// export { io_client };
