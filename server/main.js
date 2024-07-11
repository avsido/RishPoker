/*
  main server utility, stores acceptable actions, mostly for single mode, but also for side menu
*/

let myServer = require("./my_server.js");
let myApi = require("./my_api.js");

let actions = {
  "/start_game_vs_computer": myApi.startGameVSComputer,
  "/start_game_vs_remote_player": myApi.startGameVSRemotePlayer,
  "/quit": myApi.quit,
  "/place_card": myApi.placeCard,
  "/computer_go_on": myApi.computerGoOn,
  "/butt_replace_wild_card": myApi.buttReplaceWildCard,
  "/flip_player_b_cards": myApi.flipPlayerBCards,
  "/check_win": myApi.checkWin,
  "/get_menu_items": myApi.getMenuItems,
  "/get_info": myApi.getInfo,
  "/get_rules": myApi.getRules,
  "/get_about_us_info": myApi.getAboutUsInfo,
  "/log_in": myApi.logIn, // TBC
  "/log_out": myApi.logOut, // TBC
  "/register": myApi.register, // TBC
  "/reset": myApi.reset, // re-evaluate if needed
};
myServer.startServer(actions);
