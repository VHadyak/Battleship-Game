import { Gameboard } from "./gameboard.js";

export class Player {
  constructor(isComputer = false) {
    this.gameboard = new Gameboard();
    this.isComputer = isComputer;
  }
}

export const realPlayer = new Player();
export const computerPlayer = new Player(true);

// Initialize the boards for both players
realPlayer.gameboard.createBoard();
computerPlayer.gameboard.createBoard();
