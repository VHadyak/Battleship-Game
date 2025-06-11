import { realPlayer, computerPlayer } from "./players.js";
import { Ship } from "./ships.js";

// Player board elements
const realPlayerBoardEl = document.querySelector("#real-player-board");
const computerPlayerBoardEl = document.querySelector("#computer-board");

// Create UI gameboard for both players
function renderBoard(gameboard, boardElement) {
  const boardSize = 10;
  const board = gameboard.board;

  boardElement.innerHTML = ""; // Clear the board before rerendering

  for (let i = 0; i < boardSize; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    boardElement.appendChild(row);

    for (let j = 0; j < boardSize; j++) {
      const cell = document.createElement("div");
      cell.classList.add("column");

      // Set coordinate of the cell
      cell.setAttribute("data-row", i);
      cell.setAttribute("data-col", j);

      const value = board[i][j]; // Get value of the cell ("ship", "hit", or "miss")

      updateState(value, cell);
      row.appendChild(cell);
    }
  }
}

// Update the cell's appearance based on game state
function updateState(value, cell) {
  if (value === "■") {
    cell.classList.add("ship");
  } else if (value === "hit") {
    cell.classList.add("hit");
  } else if (value === "miss") {
    cell.classList.add("miss");
  }
}

placeShips(realPlayer);
placeShips(computerPlayer);

renderBoard(realPlayer.gameboard, realPlayerBoardEl);
renderBoard(computerPlayer.gameboard, computerPlayerBoardEl);

// console.table(realPlayer.gameboard.board);

// Hardcoded ship placements for testing
function placeShips(player) {
  let ship1 = new Ship(3);
  let ship2 = new Ship(3);
  let ship3 = new Ship(5);
  let ship4 = new Ship(4);
  let ship5 = new Ship(2);

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
}
