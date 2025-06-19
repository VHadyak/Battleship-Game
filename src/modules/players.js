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

  player.gameboard.placeShip(ship1, [
    [0, 0],
    [0, 1],
    [0, 2],
  ]);

  player.gameboard.placeShip(ship2, [
    [2, 2],
    [3, 2],
    [4, 2],
  ]);
}

placeShips(realPlayer);
placeShips(computerPlayer);

realPlayer.gameboard.receiveAttack(2, 0);
realPlayer.gameboard.receiveAttack(3, 0);
realPlayer.gameboard.receiveAttack(4, 0);
realPlayer.gameboard.receiveAttack(2, 4);
realPlayer.gameboard.receiveAttack(3, 4);
realPlayer.gameboard.receiveAttack(4, 4);
realPlayer.gameboard.receiveAttack(1, 4);

realPlayer.gameboard.receiveAttack(0, 4);
realPlayer.gameboard.receiveAttack(1, 0);
realPlayer.gameboard.receiveAttack(1, 1);
realPlayer.gameboard.receiveAttack(2, 1);
realPlayer.gameboard.receiveAttack(3, 1);

realPlayer.gameboard.receiveAttack(4, 1);
realPlayer.gameboard.receiveAttack(0, 3);
realPlayer.gameboard.receiveAttack(1, 3);
realPlayer.gameboard.receiveAttack(2, 3);
realPlayer.gameboard.receiveAttack(3, 3);
realPlayer.gameboard.receiveAttack(4, 3);
