// Include Socket.IO library
var io = require("socket.io-client");

// Connect to the server
var socket = io.connect("http://localhost:8080");

// Listen for 'connect' event
socket.on("connect", function () {
  console.log("Connected to server");
});

// Listen for 'message' event from server
socket.on("some_event", function (data) {
  console.log("Received some_event from server:", data);
});
