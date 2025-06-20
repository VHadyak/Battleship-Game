import { Ship } from "./ships.js";

const ships = [new Ship(3), new Ship(3), new Ship(2), new Ship(4), new Ship(5)];

export class PlaceShips {
  constructor(player) {
    this.ships = ships;
    this.currentPlayer = player;
    this.board = player.gameboard.board;
    this.boardSize = player.gameboard.boardSize;
  }

  placeComputerShips() {
    for (const ship of this.ships) {
      let placed = false;

      while (!placed) {
        const isHorizontal = Math.random() < 0.5; // Randomly choose ship's orientation
        const [x, y] = this.getStartingPoint(ship.length, isHorizontal); // Create starting point for each ship
        const coordinates = this.getShipCoordinates(
          x,
          y,
          ship.length,
          isHorizontal,
        );

        // Place a ship if the placement is valid within the board
        if (this.validPlacement(coordinates)) {
          this.placeShipOnBoard(ship, coordinates);
          placed = true;
        }
      }
    }
  }

  // Place each ship with its coordinates on the gameboard
  placeShipOnBoard(ship, coordinates) {
    this.currentPlayer.gameboard.placeShip(ship, coordinates);
  }

  // Check if the cells are not occupied and not adjacent to ships
  validPlacement(coordinates) {
    return coordinates.every(([x, y]) => {
      if (!this.inBounds(x, y) && this.board[x][y] === "■") return false; // Current cell is occupied, invalidate placement

      const adjacentOffset = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];

      // Avoid adjacent ship placements (at least 1 cell gap in-between the ships, no diagonal gaps)
      for (const [dx, dy] of adjacentOffset) {
        // Adjacent cell coordinates
        const sx = x + dx;
        const sy = y + dy;

        // If adjacent ship detected, invalidate placement
        if (this.inBounds(sx, sy) && this.board[sx][sy] === "■") {
          return false;
        }
      }
      return true;
    });
  }

  // Check for ship coordinates to be within the board boundaries
  inBounds(x, y) {
    return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize;
  }

  getShipCoordinates(x, y, shipSize, isHorizontal) {
    const coords = [];

    // If orientation is horizontal, increment y-coordinate
    // If orientation is vertical, increment x-coordinate
    for (let i = 0; i < shipSize; i++) {
      coords.push(isHorizontal ? [x, y + i] : [x + i, y]);
    }

    return coords;
  }

  // For each ship generate random starting coordinate
  getStartingPoint(shipSize, isHorizontal) {
    const maxX = isHorizontal
      ? this.boardSize // Horizontal: x can be anywhere
      : this.boardSize - shipSize; // Vertical: x must have the room to fit the ship downward

    const maxY = isHorizontal
      ? this.boardSize - shipSize // Horizontal: y must have the room to fit the ship rightward
      : this.boardSize; // Vertical: y can be anywhere

    const shipX = Math.floor(Math.random() * maxX);
    const shipY = Math.floor(Math.random() * maxY);

    return [shipX, shipY];
  }
}
