// Include Socket.IO library
var io = io();

// Connect to the server
var io_client = io.connect("http://localhost:8080");

// Listen for 'connect' event
io_client.on("connect", function () {
  console.log("Connected to server");
});

// Listen for 'message' event from server
io_client.on("some_event", function (data) {
  console.log("Received some_event from server:", data);
});


export default io_client;

