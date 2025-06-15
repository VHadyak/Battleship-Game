import { Gameboard } from "./gameboard.js";
import { Ship } from "./ships.js";
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

// For testing
function placeShips(player) {
  let ship1 = new Ship(3);
  let ship2 = new Ship(3);
  let ship3 = new Ship(5);
  let ship4 = new Ship(4);
  let ship5 = new Ship(2);
  let ship6 = new Ship(5);

  player.gameboard.placeShip(ship1, [
    [0, 0],
    [0, 1],
    [0, 2],
  ]);
  player.gameboard.placeShip(ship2, [
    [2, 1],
    [2, 2],
    [2, 3],
  ]);
  player.gameboard.placeShip(ship3, [
    [9, 9],
    [9, 8],
    [9, 7],
    [9, 6],
    [9, 5],
  ]);
  player.gameboard.placeShip(ship4, [
    [4, 5],
    [5, 5],
    [6, 5],
    [7, 5],
  ]);
  player.gameboard.placeShip(ship5, [
    [6, 1],
    [7, 1],
  ]);
  player.gameboard.placeShip(ship6, [
    [4, 4],
    [4, 3],
    [4, 2],
    [4, 1],
    [4, 0],
  ]);
  return { ship1, ship2, ship3, ship4, ship5, ship6 };
}

placeShips(realPlayer);
placeShips(computerPlayer);
