class Gameboard {
  constructor() {
    this.board = [];
    this.storeShip = new Map(); // Track each ship's coordinates within the board
    this.missedHits = []; // Store all of the coordinates of missed hits
  }

  // Create a 10x10 board
  createBoard() {
    for (let i = 0; i < 10; i++) {
      this.board[i] = new Array(10).fill("+");
    }
  }

  getBoard() {
    return this.board;
  }

  // Place ship on the board based on its coordinates
  placeShip(ship, coordinates) {
    if (ship.length !== coordinates.length) {
      throw new Error(
        "Ship length does not match the number of provided coordinates",
      );
    }

    coordinates.forEach(([x, y]) => {
      this.board[x][y] = "■"; // for visuals
      this.storeShip.set(`${x},${y}`, ship); // Map the coordinate on the board to its corresponding ship
    });
  }

  // Attack the ship and check if it was a hit or miss
  receiveAttack(x, y) {
    const ship = this.storeShip.get(`${x},${y}`);

    // If attack coordinates match with ship coordinates, then it was hit
    if (ship) {
      ship.hit();
    } else {
      this.missedHits.push([x, y]);
    }

    return ship;
  }

  // Check if all ships have been sunk
  allSunk() {
    const uniqueShips = new Set(this.storeShip.values()); // Store each ship in the set

    // Find if any ships have not been sunk yet
    for (const ship of uniqueShips) {
      if (!ship.isSunk()) return false;
    }
    return true;
  }
}

export { Gameboard };

/*
const ranX = generateRanNum(0, 9);
const ranY = generateRanNum(0, 9);

// Generate random number for computer attack
function generateRanNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
} */
