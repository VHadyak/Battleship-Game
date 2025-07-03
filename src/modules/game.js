import {
  renderBoard,
  switchBoard,
  displayWinner,
  getCoordinates,
  updateCellState,
  realPlayerBoardEl,
  computerPlayerBoardEl,
  setupPlayAgain,
} from "./dom.js";

import { AIController } from "./computerAI.js";
import { PlaceShips } from "./shipPlacement.js";

export class Game {
  constructor(realPlayer, computerPlayer) {
    this.player1 = realPlayer;
    this.player2 = computerPlayer;
    this.currentPlayer = realPlayer;
    this.opponent = computerPlayer;
    this.turnInterval = null;
    this.waitForPlayerInterval = null;
    this.gameOver = false;

    this.playerShipPlacer = new PlaceShips(this.player1);
    this.computerShipPlacer = new PlaceShips(this.player2);

    this.AI = new AIController(this.player1.gameboard); // Computer's AI
  }

  // Player must place ships first before the computer can
  startSetup() {
    // Player's ship placements (drag and drop)
    this.playerShipPlacer.placePlayerShips();

    // Wait for real player to place all their ships
    this.waitForPlayerInterval = setInterval(() => {
      if (this.playerShipPlacer.allPlaced()) {
        clearInterval(this.waitForPlayerInterval);
        switchBoard(this.player2, true); // Optional

        // Computer done placing ships
        setTimeout(() => {
          // Computer's ship placements
          this.computerShipPlacer.placeComputerShips();

          // Rerender computer's board (with ships) and switch to real player for their first attack move
          renderBoard(this.player2.gameboard, computerPlayerBoardEl);
          switchBoard(this.player1);
        }, 5000);
      }
    }, 1000);
  }

  // Reflect the player's move visually
  processMoveResult(cell, boardElement) {
    this.handleCellState(cell);
    this.handleSunkShip(this.opponent, cell, boardElement);

    // If there is a winner, end game
    if (this.isWinner()) {
      this.endGame();
    }
  }

  handlePlayerMove(cell) {
    const [x, y] = getCoordinates(cell);

    this.opponent.gameboard.receiveAttack(x, y);

    if (this.gameOver) return;

    this.processMoveResult(cell, computerPlayerBoardEl);
    this.switchTurn(); // Give turn to the computer

    clearInterval(this.turnInterval); // Clear any existing intervals

    // Set up an interval simulating computer's thinking
    this.turnInterval = setInterval(() => this.handleComputerMove(), 2000);
  }

  handleComputerMove() {
    const [x, y] = this.AI.computerAttacks(); // Get coordinate of the computer attack
    const cell = realPlayerBoardEl.querySelector(
      `[data-row="${x}"][data-col="${y}"]`,
    );

    if (this.gameOver) return;

    this.processMoveResult(cell, realPlayerBoardEl);
    this.switchTurn(); // Give turn back to the real player

    // Reset interval completely after computer has attacked
    clearInterval(this.turnInterval);
    this.turnInterval = null;
  }

  switchTurn() {
    if (!this.isWinner()) {
      this.currentPlayer =
        this.currentPlayer === this.player1 ? this.player2 : this.player1;

      this.opponent =
        this.currentPlayer === this.player1 ? this.player2 : this.player1;

      switchBoard(this.currentPlayer);
    }
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
        if (cellShip) this.handleCellState(cellShip);
      }
    }
  }

  // Retrieve the cell's state after player's move
  handleCellState(cell) {
    const [x, y] = getCoordinates(cell);
    const value = this.opponent.gameboard.board[x][y];

    updateCellState(value, cell);
  }

  // Check if there is a winner
  isWinner() {
    return this.opponent.gameboard.allSunk();
  }

  // End the game after the winner was found
  endGame() {
    this.gameOver = true;
    clearInterval(this.turnInterval);
    this.turnInterval = null;

    displayWinner(this.currentPlayer);
  }

  // Full reset of the game
  reset() {
    this.gameOver = false;
    this.currentPlayer = this.player1;
    this.opponent = this.player2;

    if (this.turnInterval) clearInterval(this.turnInterval);
    if (this.waitForPlayerInterval) clearInterval(this.waitForPlayerInterval);

    this.turnInterval = null;
    this.waitForPlayerInterval = null;

    this.player1.gameboard.resetBoard();
    this.player2.gameboard.resetBoard();

    this.playerShipPlacer = new PlaceShips(this.player1);
    this.computerShipPlacer = new PlaceShips(this.player2);

    this.AI = new AIController(this.player1.gameboard);
  }
}
