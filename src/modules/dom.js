// Player board elements
export const realPlayerBoardEl = document.querySelector("#real-player-board");
export const computerPlayerBoardEl = document.querySelector("#computer-board");

// Create UI gameboard for both players
export function renderBoard(gameboard, boardElement) {
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

      updateCellState(value, cell);
      row.appendChild(cell);
    }
  }
}

// Update the cell's appearance based on game state
export function updateCellState(value, cell) {
  switch (value) {
    case "■":
      cell.classList.add("ship");
      break;
    case "hit":
      cell.classList.add("hit");
      break;
    case "miss":
      cell.classList.add("miss");
      break;
    case "sunk":
      cell.classList.add("sunk");
      break;
  }
}

// Switch boards based on player's turn
export function switchBoard(player) {
  if (player.isComputer) {
    realPlayerBoardEl.classList.add("transparent");
    computerPlayerBoardEl.classList.add("disable");
  } else {
    computerPlayerBoardEl.classList.remove("disable");
    realPlayerBoardEl.classList.remove("transparent");
    realPlayerBoardEl.classList.add("disable");
  }
}

// Get coordinates from the clicked cell
export function getCoordinates(cell) {
  const x = Number(cell.getAttribute("data-row"));
  const y = Number(cell.getAttribute("data-col"));

  return [x, y];
}
