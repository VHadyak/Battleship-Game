import {
  switchBoard,
  getCoordinates,
  updateCellState,
  realPlayerBoardEl,
  computerPlayerBoardEl,
} from "./dom.js";

export class Game {
  constructor(realPlayer, computerPlayer) {
    this.player1 = realPlayer;
    this.player2 = computerPlayer;
    this.currentPlayer = realPlayer;
    this.opponent = computerPlayer;
    this.computerInterval = null;
    this.lastHit = null; // Track the last hit of the ship
    this.nextTarget = null; // Get the next target of the attack
  }

  // Reflect the player's move visually
  processMoveResult(cell, boardElement) {
    this.handleCellState(this.opponent, cell);
    this.handleSunkShip(this.opponent, cell, boardElement);
  }

  handlePlayerMove(cell) {
    const [x, y] = getCoordinates(cell);

    this.opponent.gameboard.receiveAttack(x, y);
    this.processMoveResult(cell, computerPlayerBoardEl);
    this.switchTurn(); // Give turn to the computer

    clearInterval(this.computerInterval); // Clear any existing intervals

    // Set up an interval simulating computer's thinking
    this.computerInterval = setInterval(() => this.handleComputerMove(), 6000);
  }

  handleComputerMove() {
    const [x, y] = this.computerAttacks(); // Get coordinate of the computer attack
    const cell = realPlayerBoardEl.querySelector(
      `[data-row="${x}"][data-col="${y}"]`,
    );

    this.processMoveResult(cell, realPlayerBoardEl);
    this.switchTurn(); // Give turn back to the real player

    // Reset interval completely after computer has attacked
    clearInterval(this.computerInterval);
    this.computerInterval = null;
  }

  computerAttacks() {
    let coordinate;

    // If next target is known after 2+ hits, update the coordinate
    if (this.nextTarget) {
      coordinate = this.nextTarget;
      this.nextTarget = null;
    } else if (this.lastHit) {
      // Target adjacent cells after first hit was detected
      coordinate = this.targetShip(this.lastHit);
    } else {
      // Hunt for the ships randomly if no hit was detected
      coordinate = this.huntShip(this.opponent.gameboard);
    }

    const [x, y] = coordinate;
    const keyCoordinate = `${x},${y}`;
    const ship = this.opponent.gameboard.storeShip.get(keyCoordinate);

    this.opponent.gameboard.receiveAttack(x, y);

    if (ship && !ship.isSunk()) {
      // Predict the direction for ship attack, if at least 2 hits have been registered to the ship
      if (ship.hitPositions.length >= 2) {
        this.nextTarget = this.findDirectionTarget(ship.hitPositions);
      }
      this.lastHit = [x, y];
    } else {
      // If no hit detected during the attack (sunk or miss), reset the hit state
      this.lastHit = null;
      this.nextTarget = null;
    }

    return [x, y];
  }

  // Generate a random coordinate
  getRanCoordinate(min, max) {
    const x = Math.floor(Math.random() * (max - min + 1) + min);
    const y = Math.floor(Math.random() * (max - min + 1) + min);

    return [x, y];
  }

  // Use 'Target and Hunt' strategy for computer's attack
  // Randomly search for a ship to hit
  huntShip(oppGameboard) {
    let coordinate;

    while (true) {
      coordinate = this.getRanCoordinate(0, 4);

      // Check if previous attack coordinate is in the Set
      // If not, break out the loop and return the new coordinate
      if (!oppGameboard.trackAttacks.has(`${coordinate[0]},${coordinate[1]}`)) {
        break;
      }
    }
    return coordinate;
  }

  // Attack neighbor cells if last attack was a hit
  targetShip(coordinate) {
    const [x, y] = coordinate;

    // Possible moves from the computer
    const directions = [
      [-1, 0], // up
      [1, 0], // down
      [0, -1], // left
      [0, 1], // right
    ];

    for (const [dx, dy] of directions) {
      const sx = x + dx;
      const sy = y + dy;

      // Check if it's valid to attack
      if (this.isValidAttack(sx, sy)) {
        return [sx, sy];
      }
    }

    // Fallback to a random attack if no adjacent cells can be targeted
    return this.huntShip(this.opponent.gameboard);
  }

  // Predict the ship's orientation for computer to attack the ship
  findDirectionTarget(hitCoordinates) {
    const [x1, y1] = hitCoordinates[0]; // First hit
    const [x2, y2] = hitCoordinates[1]; // Second hit

    let dx = 0;
    let dy = 0;

    if (x1 === x2) {
      dy = y2 > y1 ? 1 : -1; // Horizontal ship (dy = 1 move right)
    } else if (y1 === y2) {
      dx = x2 > x1 ? 1 : -1; // Vertical ship (dx = 1 move down)
    }

    const [lastX, lastY] = hitCoordinates[hitCoordinates.length - 1]; // Last hit
    const [firstX, firstY] = hitCoordinates[0]; // First hit

    // Move in the direction based on the most recent hit
    const forwardX = lastX + dx;
    const forwardY = lastY + dy;

    // Move backwards from the first hit in the opposite direction,
    // Use case if forward direction is blocked ('miss' cell / edge of board)
    const backX = firstX - dx;
    const backY = firstY - dy;

    // Return updated coordinates if the attack is possible
    if (this.isValidAttack(forwardX, forwardY)) {
      return [forwardX, forwardY];
    }

    if (this.isValidAttack(backX, backY)) {
      return [backX, backY];
    }
  }

  // Check if attack is within the boundaries and hasn't been attempted yet
  isValidAttack(x, y) {
    return (
      x >= 0 &&
      x <= 4 &&
      y >= 0 &&
      y <= 4 &&
      !this.opponent.gameboard.trackAttacks.has(`${x},${y}`)
    );
  }

  switchTurn() {
    this.currentPlayer =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;

    this.opponent =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;

    switchBoard(this.currentPlayer);
  }

  // Mark the ship that has been sunk
  handleSunkShip(targetPlayer, cell, boardElement) {
    const [x, y] = getCoordinates(cell);
    const targetShip = targetPlayer.gameboard.storeShip.get(`${x},${y}`);

    if (!targetShip || !targetShip.isSunk()) return;

    for (const [coordinates, ship] of targetPlayer.gameboard.storeShip) {
      if (ship === targetShip && ship.isSunk()) {
        // Get coordinates of each cell within the sunk ship
        const [shipX, shipY] = coordinates.split(",").map((num) => Number(num));

        // Set each cell of the sunk ship to value = "sunk"
        targetPlayer.gameboard.board[shipX][shipY] = "sunk";

        // Get each cell of the sunk ship
        const cellShip = boardElement.querySelector(
          `[data-row="${shipX}"][data-col="${shipY}"]`,
        );

        // Mark it visually as sunk based on "sunk" value
        if (cellShip) this.handleCellState(targetPlayer, cellShip);
      }
    }
  }

  // Retrieve the cell's state after player's move
  handleCellState(player, cell) {
    const [x, y] = getCoordinates(cell);
    const value = player.gameboard.board[x][y];

    updateCellState(value, cell);
  }
}
