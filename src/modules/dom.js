// Player board elements
export const realPlayerBoardEl = document.querySelector("#real-player-board");
export const computerPlayerBoardEl = document.querySelector("#computer-board");

import { computerPlayer, realPlayer } from "./players.js";
import { game } from "../app.js";

const sidePanel = document.querySelector(".playerShips");
const restartBtn = document.querySelector(".restart-btn");

let shipRotationState = {};

// Track the id of the ship that currently being dragged, and ship segment
// since dragover event can't access dataTransfer.getData() due to browser security restrictions
let currentDraggedShipId = null;
let currentSegmentOffset = 0;

// Render gameboard for both players
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

// Render side panel with ships
export function renderSidePanel() {
  sidePanel.innerHTML = "";

  const shipSizes = [2];

  shipSizes.forEach((size, i) => {
    const shipNum = i + 1;

    const shipWrapper = document.createElement("div");
    shipWrapper.classList.add("shipWrapper", `wrapper${shipNum}`);

    const shipEl = document.createElement("div");
    shipEl.id = `ship${shipNum}`;
    shipEl.setAttribute("draggable", true);
    shipEl.setAttribute("data-length", size);
    shipEl.setAttribute("data-orientation", "horizontal");

    for (let i = 0; i < size; i++) {
      const segment = document.createElement("div");
      segment.classList.add("cell");
      segment.setAttribute("data-index", i);
      shipEl.appendChild(segment);
    }

    shipWrapper.appendChild(shipEl);
    sidePanel.appendChild(shipWrapper);
  });

  // Enable it after side panel has rendered
  enableShipDragging();
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
  if (winner.isComputer || !winner.isComputer) {
    realPlayerBoardEl.classList.add("transparent");
    computerPlayerBoardEl.classList.add("transparent");
  }

  if (winner.isComputer) {
    console.log("Computer won");
  } else {
    console.log("Player won");
  }
}

// Get coordinates from the clicked cell
export function getCoordinates(cell) {
  const x = Number(cell.getAttribute("data-row"));
  const y = Number(cell.getAttribute("data-col"));

  return [x, y];
}

// HANDLE DRAG AND DROP API
export function setupPlayerShipDrop(callback, isValidPlacement) {
  // Listen for player dropping a ship on the gameboard
  // Then calculate coordinates of the ship that was dropped
  realPlayerBoardEl.addEventListener("drop", (e) => {
    e.preventDefault();

    const { row, col, shipEl, offset, shipLength } = getShipData(e);
    const coordinates = computeShipPlacement(row, col, shipEl, offset);

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

    hoverShipPlacementEffect(e, isValidPlacement);
  });

  // Remove hovers when drag leaves the board
  realPlayerBoardEl.addEventListener("dragleave", () => {
    document.querySelectorAll(".hovered").forEach((cell) => {
      cell.classList.remove("hovered", "invalid");
    });
  });
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
      // ! Use these when dragover event is not able to access this data through e.dataTransfer.getData()
      currentDraggedShipId = shipEl.id;
      currentSegmentOffset = trackShipsSegment;

      // Store it in dataTransfer if no fallback is required
      e.dataTransfer.setData("offset", trackShipsSegment.toString());
      e.dataTransfer.setData("shipID", shipEl.id);
    });
  });
}

// Remove ship from side panel after drag and drop
export function shipRemoval(ship) {
  ship.style.maxHeight = "0";
  ship.style.opacity = "0";
  setTimeout(() => ship.remove(), 300);
}

// Get data from the ship that was dropped
function getShipData(e) {
  const cell = e.target;

  // Coordinates of the cell on the board where ship was dropped
  const row = Number(cell.getAttribute("data-row"));
  const col = Number(cell.getAttribute("data-col"));

  // Get the string of the ship that was dragged
  const shipId = e.dataTransfer.getData("shipID");

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
function computeShipPlacement(row, col, shipEl, offset) {
  const orientation = shipEl.getAttribute("data-orientation");
  const shipSize = Number(shipEl.getAttribute("data-length"));
  const isHorizontal = orientation === "horizontal";

  // Offset correction to align grabbed ship segment with the drop cell
  // ... to ensure ship starts at precise board coordinates
  const x = isHorizontal ? row : row - offset;
  const y = isHorizontal ? col - offset : col;

  // Get ship coordinates from corrected starting position
  return game.playerShipPlacer.getShipCoordinates(x, y, shipSize, isHorizontal);
}

// Visually show hover effect for potential ship placement on the gameboard
function hoverShipPlacementEffect(e, isValidPlacement) {
  const { row, col, shipEl, offset } = getShipData(e);
  const coordinates = computeShipPlacement(row, col, shipEl, offset);
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
export function highlightShipSelection() {
  document.querySelectorAll("[id^='ship']").forEach((shipEl) => {
    shipEl.addEventListener("mousedown", (e) => {
      const ship = e.target.closest("[id^='ship']");

      // Remove each highlighter before processing the new one
      document.querySelectorAll(".highlightShip").forEach((el) => {
        el.classList.remove("highlightShip");
      });

      ship.classList.add("highlightShip");
    });
  });
}

// HANDLE SHIP ROTATION
function handleShipRotation() {
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
}

export function setupShipRotation() {
  const rotateBtn = document.querySelector(".rotate-btn");

  // Remove old listeners via clone
  const newRotateBtn = rotateBtn.cloneNode(true);
  rotateBtn.parentNode.replaceChild(newRotateBtn, rotateBtn);

  newRotateBtn.addEventListener("click", handleShipRotation);
}

// HANDLE SHIP PLACEMENT RANDOMIZATION
function handleRandomShipPlacement(ships, btn) {
  if (game.playerShipPlacer.allPlaced()) return;
  realPlayer.gameboard.resetBoard();

  // Randomize placement
  game.playerShipPlacer.placeComputerShips();

  // Remove ships from the side panel
  ships.forEach((ship) => shipRemoval(ship));

  // Rerender player's gameboard after placement
  renderBoard(realPlayer.gameboard, realPlayerBoardEl);

  btn.disabled = true;
  btn.style.cursor = "default";
}

export function setupRandomShipPlacement() {
  const ships = document.querySelectorAll(".shipWrapper");
  const randomBtn = document.querySelector(".random-btn");

  const newRandomBtn = randomBtn.cloneNode(true);
  randomBtn.parentNode.replaceChild(newRandomBtn, randomBtn);

  newRandomBtn.addEventListener("click", () =>
    handleRandomShipPlacement(ships, newRandomBtn),
  );
}

// HANDLE RESTART
function handleRestart() {
  restartBtn.style.display = "none";

  switchBoard(computerPlayer);
  game.reset();

  shipRotationState = {};

  // Rerender the boards after reset
  renderBoard(realPlayer.gameboard, realPlayerBoardEl);
  renderBoard(computerPlayer.gameboard, computerPlayerBoardEl);

  realPlayerBoardEl.classList.remove("transparent", "disable");
  computerPlayerBoardEl.classList.remove("transparent", "disable");

  renderSidePanel();

  highlightShipSelection();
  setupShipRotation();
  setupRandomShipPlacement();

  game.startSetup();
}

export function setupPlayAgainBtn() {
  restartBtn.style.display = "flex";
  restartBtn.addEventListener("click", handleRestart);
}

export function setupUI() {
  // Render the game boards for 2 players
  renderBoard(realPlayer.gameboard, realPlayerBoardEl);
  renderBoard(computerPlayer.gameboard, computerPlayerBoardEl);

  renderSidePanel();
  highlightShipSelection();
  setupShipRotation();
  setupRandomShipPlacement();
}
