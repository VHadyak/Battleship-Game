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
  }

  processMoveResult(cell, boardElement) {
    // Reflect the player's move visually
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

    // If last attack hit the ship, target the neighbor cells
    if (this.lastHit) {
      coordinate = this.targetAndHunt(this.lastHit);
    } else {
      // If last attack is a miss, attack the cell randomly
      coordinate = this.generateUniqueRanCoordinate(this.opponent.gameboard);
    }

    const [x, y] = coordinate;
    const keyCoordinate = `${x},${y}`;
    const ship = this.opponent.gameboard.storeShip.get(keyCoordinate);

    this.opponent.gameboard.receiveAttack(x, y);

    if (ship && !ship.isSunk()) {
      this.lastHit = [x, y];
    } else {
      this.lastHit = null;
    }

    return [x, y];
  }

  // Get random coordinate
  getRanCoordinate(min, max) {
    const x = Math.floor(Math.random() * (max - min + 1) + min);
    const y = Math.floor(Math.random() * (max - min + 1) + min);

    return [x, y];
  }

  // Generate radom coordinate that hasn't been attacked yet
  generateUniqueRanCoordinate(oppGameboard) {
    let coordinate;

    while (true) {
      coordinate = this.getRanCoordinate(0, 9);

      // Check if previous attack coordinate is in the Set
      // If not, break out the loop and return the new coordinate
      if (!oppGameboard.hits.has(`${coordinate[0]},${coordinate[1]}`)) {
        break;
      }
    }
    return coordinate;
  }

  // Use 'Target and Hunt' strategy for computer's attack
  // Attack neighbor cells if last attack was a hit
  targetAndHunt([x, y]) {
    // Possible moves from the computer
    const directions = [
      [-1, 0], // up
      [1, 0], // down
      [0, -1], // left
      [0, 1], // right
    ];

    // Add some unpredictability in which direction the cell will be attacked
    const mixed = directions.sort(() => Math.random() - 0.5);

    for (const [dx, dy] of mixed) {
      const sx = x + dx;
      const sy = y + dy;

      // Stay within the boundaries of the board
      if (sx >= 0 && sx <= 9 && sy >= 0 && sy <= 9) {
        const coordinateKey = `${sx},${sy}`;

        // If this position hasn't been attacked yet, return that adjacent position
        if (!this.opponent.gameboard.hits.has(coordinateKey)) {
          return [sx, sy];
        }
      }
    }

    // Fallback to a random attack if no adjacent cells can be targeted
    return this.generateUniqueRanCoordinate(oppGameboard);
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

  // Based on the cell state, mark it visually on the gameboard
  handleCellState(player, cell) {
    const [x, y] = getCoordinates(cell);
    const value = player.gameboard.board[x][y];

    updateCellState(value, cell);
  }
}
