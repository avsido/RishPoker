// import { io } from "socket.io-client";

const io_client = io.connect("http://localhost:8080");

io_client.on("connect", function () {
  console.log("Connected to server");
});

io_client.on("disconnect", function () {
  console.log("Disconnected from server");
});

io_client.on("test-event", function () {
  console.log("im in client test event");
});

io_client.on("server-created-online-game", function (data) {
  console.log("Received PIN from server:", data.pin);
});

// export { io_client };
