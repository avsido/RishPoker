let myServer = require("./my_server.js");
let myApi = require("./my_api.js");

let actions = {
  "/start_game_vs_computer": myApi.startGameVSComputer,
  "/start_game_vs_remote_player": myApi.startGameVSRemotePlayer,
  "/place_card": myApi.placeCard,
  "/computer_go_on": myApi.computerGoOn,
  "/butt_replace_wild_card": myApi.buttReplaceWildCard,
  "/flip_computer_cards": myApi.flipComputerCards,
  "/check_win": myApi.checkWin,
  "/send_menu_items": myApi.sendMenuItems,
  "/get_info": myApi.getInfo, // TBC
  "/get_rules": myApi.getRules, // TBC
  "/log_in": myApi.logIn, // TBC
  "/log_out": myApi.logOut, // TBC
  "/register": myApi.register, // TBC
  "/reset": myApi.reset, // re-evaluate if needed
};
myServer.startServer(actions);
