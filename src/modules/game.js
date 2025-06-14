import { realPlayer, computerPlayer } from "./players.js";
import { switchBoard, getCoordinates, updateCellState } from "./dom.js";

export class Game {
  constructor() {
    this.player1 = realPlayer;
    this.player2 = computerPlayer;
    this.currentPlayer = realPlayer;
    this.opponent = computerPlayer;
    this.computerInterval = null;
  }

  handlePlayerMove(cell, boardElement) {
    const [x, y] = getCoordinates(cell);

    const targetPlayer =
      boardElement.id === "computer-board" ? this.player1 : this.player2;

    targetPlayer.gameboard.receiveAttack(x, y);

    this.getCellValue(targetPlayer, cell);
    this.handleSunkShip(targetPlayer, cell, boardElement);

    if (this.opponent.isComputer) {
      this.switchTurn(); // Switch to computer's turn
      clearInterval(this.computerInterval); // Clear any existing intervals

      // Set up an interval simulating computer's thinking
      this.computerInterval = setInterval(
        () => this.handleComputerTurn(),
        5000,
      );
    }
  }

  handleComputerTurn() {
    // Computer attacks
    if (!this.opponent.isComputer) {
      console.log("computer attacked");
      this.switchTurn(); // Give turn back to real player

      // Reset interval completely after computer has attacked
      clearInterval(this.computerInterval);
      this.computerInterval = null;
    }
  }

  switchTurn() {
    this.currentPlayer =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;

    this.opponent =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;

    switchBoard(this.currentPlayer);
  }

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
        if (cellShip) this.getCellValue(targetPlayer, cellShip);
      }
    }
  }

  getCellValue(player, cell) {
    const [x, y] = getCoordinates(cell);
    const value = player.gameboard.board[x][y];
    // Update cell state based on the values that are defined
    updateCellState(value, cell);
  }
}
