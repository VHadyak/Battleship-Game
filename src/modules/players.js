import { Gameboard } from "./gameboard.js";

class Player {
  constructor(isComputer = false) {
    this.gameboard = new Gameboard();
    this.isComputer = isComputer;
  }
}

const realPlayer = new Player();
const computerPlayer = new Player(true);

// Initialize the boards for both players
realPlayer.gameboard.createBoard();
computerPlayer.gameboard.createBoard();

// Player's Board:
console.table(realPlayer.gameboard.board);

// Computer's Board:
console.table(computerPlayer.gameboard.board);
