import { Ship } from "./ships.js";
import {
  setupPlayerShipDrop,
  shipRemoval,
  enableBoard,
  switchBoard,
} from "./dom.js";
import { realPlayer, computerPlayer } from "./players.js";

export class PlaceShips {
  constructor(player) {
    this.computerShips = [
      //new Ship(3),
      //new Ship(3),
      new Ship(2),
      new Ship(4),
      //new Ship(5),
    ];
    this.currentPlayer = player;
    this.board = player.gameboard.board;
    this.boardSize = player.gameboard.boardSize;
    this.computerInterval = null;
  }

  placePlayerShips() {
    // Listen for player's ship drop events
    setupPlayerShipDrop((coordinates, shipLength, shipEl) => {
      // If placement is valid, create and place a ship
      if (this.validPlacement(coordinates)) {
        const ship = new Ship(shipLength);
        this.placeShipOnBoard(ship, coordinates);

        // Remove ships from side panel only if the placement is valid
        shipRemoval(shipEl);
      }
    }, this.validPlacement.bind(this)); // Pass validPlacement method for hover use in DOM
  }

  placeComputerShips() {
    for (const ship of this.computerShips) {
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

    // If player finished placing ships, now its computer's turn
    if (this.allPlaced()) {
      this.computerInterval = setInterval(() => {
        console.log("Computer strategically placing ships");
        // When computer placing ships, disable the board and set ready state to false
        switchBoard(computerPlayer, false);
      }, 1000);

      setTimeout(() => {
        clearInterval(this.computerInterval);
        this.computerInterval = null;
        // After computer finished placing ships, switch boards so real player goes first
        switchBoard(this.currentPlayer);
      }, 5000);
    }
  }

  // Check if the cells are not occupied and not adjacent to ships
  validPlacement(coordinates) {
    return coordinates.every(([x, y]) => {
      if (!this.inBounds(x, y) || this.board[x][y] === "■") return false; // Current cell is occupied, invalidate placement

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

  // Check if all player ships haven been placed
  allPlaced() {
    const requiredShips = 2;
    const placedShips = new Set(realPlayer.gameboard.storeShip.values()).size;
    return placedShips === requiredShips;
  }
}
