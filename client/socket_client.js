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

io_client.on("create-online-game", function (data) {
  console.log("Received some_event from server:", data);
});

// export { io_client };
