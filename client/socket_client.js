const io_client = io.connect("/");
app.game = null;
let gamePotObj = null;

let gameOverActive = false; // while game still on, this should be false.

io_client.on("connect", function () {
  console.log("client connected to server");
});
io_client.on("disconnect", function () {
  console.log("client disconnected from server");
});
io_client.on("game-start", (currentGame) => {
  console.log(currentGame);
  let message = currentGame.turn == "player" ? "You start" : "Opponent starts";
  cleanElement(divMain);
  Dice.roll(currentGame.dice.player, "dice1");
  Dice.roll(currentGame.dice.opponent, "dice2",message,()=>{
    setTimeout(() => {
      if (soundOn) openingSound.play();
      app.game = new game(currentGame);
    }, 2500);
  });
});

io_client.on("player-played", (currentGame) => {
  console.log(currentGame);
  app.game.update(currentGame);
});

io_client.on("player-left", (data) => {
  //console.log(window.userBox);
  ({ matchId, current_user } = data);
  //console.log(data);
  app.user = current_user;

  app.game.resolveAfterOpponentQuit(matchId);
});


/*
function createDiceElement(diceId, sides) {
  let diceDiv = document.createElement("div");
  diceDiv.id = diceId;
  if (diceId == "dice2") {
    diceDiv.style.top = "100px";
  }

  diceDiv.className = "dice dice-one";

  sides.forEach((side) => {
    let sideDiv = document.createElement("div");
    sideDiv.id = side.id;
    sideDiv.className = side.class;

    side.dots.forEach((dotClass) => {
      let dotDiv = document.createElement("div");
      dotDiv.className = `dot ${dotClass}`;
      sideDiv.appendChild(dotDiv);
    });

    diceDiv.appendChild(sideDiv);
  });

  return diceDiv;
}

function rollOnTheDice(digit, diceId, msg = null, callback) {
  // Check if the dice container already exists
  let gameDiv = document.querySelector(".game");
  if (!gameDiv) {
    // Create elements if they do not exist
    gameDiv = document.createElement("div");
    gameDiv.className = "game";

    gameDiv.classList.add("rotate");

    let containerDiv = document.createElement("div");
    containerDiv.className = "container";
    gameDiv.appendChild(containerDiv);
    document.body.appendChild(gameDiv);
  }

  let starterMsg = document.createElement("h1");
  starterMsg.className = "starterMsg break-line";
  starterMsg.innerHTML = msg ? msg : "";

  setTimeout(() => {
    gameDiv.appendChild(starterMsg);
    if (typeof callback == "function") {
      callback();
    }
  }, 2500);

  // Create dice if not already present
  let diceDiv = document.getElementById(diceId);

  if (!diceDiv) {
    const sides = [
      { id: `${diceId}-side-one`, class: "side one", dots: ["one-1"] },
      { id: `${diceId}-side-two`, class: "side two", dots: ["two-1", "two-2"] },
      {
        id: `${diceId}-side-three`,
        class: "side three",
        dots: ["three-1", "three-2", "three-3"],
      },
      {
        id: `${diceId}-side-four`,
        class: "side four",
        dots: ["four-1", "four-2", "four-3", "four-4"],
      },
      {
        id: `${diceId}-side-five`,
        class: "side five",
        dots: ["five-1", "five-2", "five-3", "five-4", "five-5"],
      },
      {
        id: `${diceId}-side-six`,
        class: "side six",
        dots: ["six-1", "six-2", "six-3", "six-4", "six-5", "six-6"],
      },
    ];

    diceDiv = createDiceElement(diceId, sides);
    gameDiv.querySelector(".container").appendChild(diceDiv);
  }

  // JavaScript to handle dice rolling
  function performDiceRoll() {
    if (digit === 1) {
      diceDiv.classList.add("show-same");
      setTimeout(() => {
        diceDiv.classList.remove("show-same");
      }, 250);
    } else {
      // Remove all show-* classes with a small delay to trigger CSS transition
      for (let i = 1; i <= 6; i++) {
        diceDiv.classList.remove("show-" + i);
      }

      setTimeout(() => {
        diceDiv.classList.add("show-" + digit);
      }, 50); // Adjust this delay as needed
    }
  }

  function removeDice() {
    if (document.body.contains(gameDiv)) {
      cleanElement(gameDiv);
      document.body.removeChild(gameDiv);
    }
  }

  performDiceRoll();

  setTimeout(removeDice, 5000);
}

*/