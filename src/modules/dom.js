// Player board elements
export const realPlayerBoardEl = document.querySelector("#real-player-board");
export const computerPlayerBoardEl = document.querySelector("#computer-board");

//const rotateBtn = document.querySelector(".rotate-btn");

import { realPlayer } from "./players.js";

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

// Display the winner
export function displayWinner(winner) {
  if (winner.isComputer) {
    realPlayerBoardEl.classList.remove("disable");
    computerPlayerBoardEl.classList.remove("transparent");

    computerPlayerBoardEl.classList.add("disable");
    realPlayerBoardEl.classList.add("transparent");
    console.log("Computer won!");
  } else {
    realPlayerBoardEl.classList.remove("transparent");
    computerPlayerBoardEl.classList.remove("disable");

    realPlayerBoardEl.classList.add("disable");
    computerPlayerBoardEl.classList.add("transparent");
    console.log("Real Player won!");
  }
}

// Get coordinates from the clicked cell
export function getCoordinates(cell) {
  const x = Number(cell.getAttribute("data-row"));
  const y = Number(cell.getAttribute("data-col"));

  return [x, y];
}

// Listen for player dropping a ship on the gameboard
// Then calculate coordinates of the ship that was dropped
export function setupPlayerShipDrop(callback) {
  realPlayerBoardEl.addEventListener("drop", (e) => {
    e.preventDefault();

    let coordinates = [];

    const cell = e.target;

    // Coordinates of the cell on the board where ship was dropped
    const row = Number(cell.getAttribute("data-row"));
    const col = Number(cell.getAttribute("data-col"));

    const shipData = e.dataTransfer.getData("shipID"); // Get the string of the ship that was dragged
    const shipEl = document.getElementById(shipData);
    const shipLength = Number(shipEl.getAttribute("data-length"));

    // Index of the ship segment that was clicked
    const offset = Number(e.dataTransfer.getData("offset"));

    const orientation = shipEl.getAttribute("data-orientation") || "horizontal";

    // Calculate coordinates of each each ship's segment
    for (let i = 0; i < shipLength; i++) {
      let x = row;
      let y = col;

      // Calculate segment positions so that the clicked ship segment aligns with the target cell on the board
      if (orientation === "horizontal") {
        y = col - offset + i;
      } else {
        x = row - offset + i;
      }
      coordinates.push([x, y]); // Store ships's coordinates
    }

    // Pass coordinates and length of each ship through callback for future use
    callback(coordinates, shipLength, shipEl);

    // Rerender the gameboard to update player's ship placements
    renderBoard(realPlayer.gameboard, realPlayerBoardEl);
  });
}

// Remove ship from side panel
export function shipRemoval(ship) {
  ship.style.maxHeight = "0";
  ship.style.opacity = "0";
  setTimeout(() => ship.remove(), 300);
}

function enableDragAndDrop() {
  // Get index of the ship's segment that the user clicked and is about to drag
  document.querySelectorAll("[id^='ship']").forEach((shipEl) => {
    let trackShipsSegment = 0;

    shipEl.addEventListener("mousedown", (e) => {
      shipEl.style.cursor = "pointer";
      const segment = e.target.closest(".cell");
      if (segment) {
        trackShipsSegment = Number(segment.getAttribute("data-index"));
      }
    });

    // Set drag data, to identify the dragged ship and the ship's segment offset
    shipEl.addEventListener("dragstart", (e) => {
      shipEl.style.cursor = "grab";
      e.dataTransfer.setData("offset", trackShipsSegment.toString());
      e.dataTransfer.setData("shipID", e.target.id);
    });

    shipEl.addEventListener("dragend", () => {
      shipEl.style.cursor = "pointer";
    });
  });

  // Allow drops on the gameboard
  realPlayerBoardEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
}

// Visually select the ship to drag
function highlightShipSelection() {
  document.querySelectorAll("[id^='ship']").forEach((shipEl) => {
    shipEl.addEventListener("mousedown", (e) => {
      const ship = e.target.closest("[id^='ship']");

      document.querySelectorAll(".highlightShip").forEach((el) => {
        el.classList.remove("highlightShip");
      });

      ship.classList.add("highlightShip");
    });
  });
}

highlightShipSelection();
enableDragAndDrop();

// Before dragging, create an option for user to change ship's orientation, and store its state for drag and drop
/* 
export function changeShipOrientation(shipID) {
  const ship = document.querySelector(`#${shipID}`);
  const shipWrapper = ship.parentElement;

  const notRotated = shipRotationState[shipID] ?? false; // If state is undefined/null default it to false
  const isRotated = !notRotated; // Toggle current rotation state

  shipRotationState[shipID] = isRotated; // Store rotation state of the ship

  // Rotate a ship with the button relative to it
  ship.style.transform = isRotated ? "rotate(-90deg)" : "rotate(0deg)";
} */
