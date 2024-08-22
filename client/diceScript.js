// Create elements
const gameDiv = document.createElement("div");
gameDiv.className = "game";

const containerDiv = document.createElement("div");
containerDiv.className = "container";

const diceDiv = document.createElement("div");
diceDiv.id = "dice1";
diceDiv.className = "dice dice-one";

// Create dice sides
const sides = [
  { id: "dice-one-side-one", class: "side one", dots: ["one-1"] },
  { id: "dice-one-side-two", class: "side two", dots: ["two-1", "two-2"] },
  {
    id: "dice-one-side-three",
    class: "side three",
    dots: ["three-1", "three-2", "three-3"],
  },
  {
    id: "dice-one-side-four",
    class: "side four",
    dots: ["four-1", "four-2", "four-3", "four-4"],
  },
  {
    id: "dice-one-side-five",
    class: "side five",
    dots: ["five-1", "five-2", "five-3", "five-4", "five-5"],
  },
  {
    id: "dice-one-side-six",
    class: "side six",
    dots: ["six-1", "six-2", "six-3", "six-4", "six-5", "six-6"],
  },
];

sides.forEach((side) => {
  const sideDiv = document.createElement("div");
  sideDiv.id = side.id;
  sideDiv.className = side.class;

  side.dots.forEach((dotClass) => {
    const dotDiv = document.createElement("div");
    dotDiv.className = `dot ${dotClass}`;
    sideDiv.appendChild(dotDiv);
  });

  diceDiv.appendChild(sideDiv);
});

// Create roll button
const rollDiv = document.createElement("div");
rollDiv.id = "roll";
rollDiv.className = "roll-button";

const rollButton = document.createElement("button");
rollButton.textContent = "Roll dice!";

rollDiv.appendChild(rollButton);

// Append elements to container
containerDiv.appendChild(diceDiv);
gameDiv.appendChild(containerDiv);
gameDiv.appendChild(rollDiv);

// Append to body
document.body.appendChild(gameDiv);

// JavaScript to handle dice rolling
let elDiceOne = document.getElementById("dice1");
let temp = 1;

function rollDice(diceOne) {
  if (diceOne === temp) {
    elDiceOne.classList.add("show-same");
    setTimeout(() => {
      elDiceOne.classList.remove("show-same");
    }, 250);
    return;
  }

  for (let i = 1; i <= 6; i++) {
    elDiceOne.classList.remove("show-" + i);
    if (diceOne === i) {
      elDiceOne.classList.add("show-" + i);
      // console.log(diceOne);
    }
  }
  temp = diceOne;
}
