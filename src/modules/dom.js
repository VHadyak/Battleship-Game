// Player board elements
export const realPlayerBoardEl = document.querySelector("#real-player-board");
export const computerPlayerBoardEl = document.querySelector("#computer-board");
const shipDragPanel = document.querySelector(".playerShips");

import { realPlayer } from "./players.js";

const rotateBtn = document.querySelector(".rotate-btn");

let shipRotationState = {};

// Track the id of the ship that currently being dragged, and ship segment
// since dragover event can't access dataTransfer.getData() due to browser security restrictions
let currentDraggedShipId = null;
let currentSegmentOffset = 0;

// Create UI gameboard for both players
export function renderBoard(gameboard, boardElement) {
  const boardSize = 5;
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
export function switchBoard(player, playerReady = true) {
  if (player.isComputer) {
    realPlayerBoardEl.classList.add("transparent");
    computerPlayerBoardEl.classList.add("disable");
  } else {
    computerPlayerBoardEl.classList.remove("disable");
    computerPlayerBoardEl.classList.remove("transparent");
    realPlayerBoardEl.classList.remove("transparent");
    realPlayerBoardEl.classList.add("disable");
  }

  // Condition when computer places ships
  if (player.isComputer && !playerReady) {
    computerPlayerBoardEl.classList.add("transparent");
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
export function setupPlayerShipDrop(callback, isValidPlacement) {
  realPlayerBoardEl.addEventListener("drop", (e) => {
    e.preventDefault();

    const { row, col, shipEl, offset, shipLength } = getShipData(e);
    const coordinates = calcShipCoordinatesOnBoard(row, col, shipEl, offset);

    // Pass coordinates and length of each ship through callback for future use
    callback(coordinates, shipLength, shipEl);

    // Rerender the gameboard to update player's ship placements
    renderBoard(realPlayer.gameboard, realPlayerBoardEl);
  });

  // Allow drops on the gameboard
  realPlayerBoardEl.addEventListener("dragover", (e) => {
    e.preventDefault();

    // Reset highlighting and disable rotate button
    document.querySelectorAll(".highlightShip").forEach((el) => {
      el.classList.remove("highlightShip");
    });
    rotateBtn.classList.remove("enableRotate");

    hoverShipPlacementEffect(e, isValidPlacement);
  });

  // Remove hovers when drag leaves the board
  realPlayerBoardEl.addEventListener("dragleave", () => {
    document.querySelectorAll(".hovered").forEach((cell) => {
      cell.classList.remove("hovered", "invalid");
    });
  });
}

// Remove ship from side panel
export function shipRemoval(ship) {
  ship.style.maxHeight = "0";
  ship.style.opacity = "0";
  setTimeout(() => ship.remove(), 300);
}

function getShipData(e) {
  const cell = e.target;

  // Coordinates of the cell on the board where ship was dropped
  const row = Number(cell.getAttribute("data-row"));
  const col = Number(cell.getAttribute("data-col"));
  const shipId = e.dataTransfer.getData("shipID"); // Get the string of the ship that was dragged

  // Fallback to global variable if shipEl from dataTransfer is null
  const shipEl =
    document.getElementById(shipId) ??
    document.getElementById(currentDraggedShipId);

  const shipLength = Number(shipEl.getAttribute("data-length"));

  // Use dataTransfer offset if possible, fallback to global one
  const offsetData = e.dataTransfer.getData("offset");
  const offset = offsetData !== "" ? Number(offsetData) : currentSegmentOffset;

  return { row, col, shipEl, offset, shipLength };
}

// Calculate coordinates with offset for precised alignment on the board
function calcShipCoordinatesOnBoard(row, col, shipEl, offset) {
  const orientation = shipEl.getAttribute("data-orientation");
  const shipLength = Number(shipEl.getAttribute("data-length"));
  const coordinates = [];

  for (let i = 0; i < shipLength; i++) {
    let x = row;
    let y = col;

    // Calculate coordinates of each each ship's segment
    if (orientation === "horizontal") {
      y = col - offset + i;
    } else {
      x = row - offset + i;
    }
    coordinates.push([x, y]); // Store ships's coordinates
  }
  return coordinates;
}

function enableShipDragging() {
  // Get index of the ship's segment that the user clicked and is about to drag
  document.querySelectorAll("[id^='ship']").forEach((shipEl) => {
    let trackShipsSegment = 0;

    shipEl.addEventListener("mousedown", (e) => {
      const segment = e.target.closest(".cell");
      if (segment) {
        trackShipsSegment = Number(segment.getAttribute("data-index"));
      }
    });

    // Set drag data, to identify the dragged ship and the ship's segment offset
    shipEl.addEventListener("dragstart", (e) => {
      // ! Use these due to dragover event not able to access this data through e.dataTransfer.getData()
      currentDraggedShipId = shipEl.id;
      currentSegmentOffset = trackShipsSegment;

      // Store it in dataTransfer if no fallback is required
      e.dataTransfer.setData("offset", trackShipsSegment.toString());
      e.dataTransfer.setData("shipID", shipEl.id);
    });
  });
}

// Visually show hover effect for potential ship placement on the gameboard
function hoverShipPlacementEffect(e, isValidPlacement) {
  const { row, col, shipEl, offset } = getShipData(e);
  const coordinates = calcShipCoordinatesOnBoard(row, col, shipEl, offset);
  const isValid = isValidPlacement(coordinates);

  // Remove previous hover and invalid styling
  document.querySelectorAll(".hovered").forEach((cell) => {
    cell.classList.remove("hovered", "invalid");
  });

  coordinates.forEach(([x, y]) => {
    // Get the cell at current ship coordinate
    const cell = realPlayerBoardEl.querySelector(
      `[data-row="${x}"][data-col="${y}"]`,
    );

    if (cell) {
      cell.classList.add("hovered");
      // If placement of ship is invalid during hover, apply it visually
      if (!isValid) cell.classList.add("invalid");
    }
  });

  e.dataTransfer.dropEffect = isValid ? "move" : "none";
}

// Visually select the ship to drag
function highlightShipSelection() {
  document.querySelectorAll("[id^='ship']").forEach((shipEl) => {
    shipEl.addEventListener("mousedown", (e) => {
      const ship = e.target.closest("[id^='ship']");

      // Remove each highlighter before processing the new one
      document.querySelectorAll(".highlightShip").forEach((el) => {
        el.classList.remove("highlightShip");
      });

      ship.classList.add("highlightShip");
      rotateBtn.classList.add("enableRotate");
    });
  });
}

// Create an option for user to change ship's orientation, and store its state for drag and drop
function changeShipOrientation() {
  rotateBtn.addEventListener("click", () => {
    const selectedShip = document.querySelector("[id^='ship'].highlightShip");
    if (!selectedShip) return;

    const selectedShipID = selectedShip.id;

    const wasRotated = shipRotationState[selectedShipID] ?? false; // If state is undefined/null default it to false (horizontal)
    const isRotated = !wasRotated; // Toggle current rotation state

    shipRotationState[selectedShipID] = isRotated; // Store current rotation state of the ship

    if (isRotated) {
      selectedShip.setAttribute("data-orientation", "vertical");
      selectedShip.classList.add("rotated");
    } else {
      selectedShip.setAttribute("data-orientation", "horizontal");
      selectedShip.classList.remove("rotated");
    }
  });
}

highlightShipSelection();
changeShipOrientation();
enableShipDragging();
