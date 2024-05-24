let myServer = require("./my_server.js");
let myApi = require("./my_api.js");

let actions = {
  "/start_game": myApi.startGame,
  "/place_card": myApi.placeCard,
  "/computer_go_on": myApi.computerGoOn,
  "/butt_replace_wild_card": myApi.buttReplaceWildCard,
  "/flip_computer_cards": myApi.flipComputerCards, // TBC
  "/check_win": myApi.checkWin, // TBC
  "/reset": myApi.reset,
};
myServer.startServer(actions);
