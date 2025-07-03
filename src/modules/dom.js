// Player board elements
export const realPlayerBoardEl = document.querySelector("#real-player-board");
export const computerPlayerBoardEl = document.querySelector("#computer-board");

import { computerPlayer, realPlayer } from "./players.js";
import { game } from "../app.js";

const sidePanel = document.querySelector(".playerShips");
const restartBtn = document.querySelector(".restart-btn");

const winnerMsg = document.querySelector(".winner-msg");
const realPlayerStatus = document.querySelector(".real-player-status");
const computerPlayerStatus = document.querySelector(".computer-player-status");
const realPlayerLabels = document.querySelectorAll(
  ".row-labels.real-label, .col-labels.real-label",
);
const computerPlayerLabels = document.querySelectorAll(
  ".row-labels.computer-label, .col-labels.computer-label",
);
const shipNames = [
  "Destroyer",
  "Submarine",
  "Cruiser",
  "Battleship",
  "Carrier",
];

let shipRotationState = {};

// Track the id of the ship that currently being dragged, and ship segment
// since dragover event can't access dataTransfer.getData() due to browser security restrictions
let currentDraggedShipId = null;
let currentSegmentOffset = 0;

// Render gameboard for both players
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

// Render side panel with ships
export function renderSidePanel() {
  sidePanel.innerHTML = "";

  const shipSizes = [2, 3, 3, 4, 5];

  shipSizes.forEach((size, i) => {
    const shipNum = i + 1;

    const shipWrapper = document.createElement("div");
    shipWrapper.classList.add("shipWrapper", `wrapper${shipNum}`);

    const shipEl = document.createElement("div");
    shipEl.id = `ship${shipNum}`;
    shipEl.setAttribute("draggable", true);
    shipEl.setAttribute("data-length", size);
    shipEl.setAttribute("data-orientation", "horizontal");

    const span = document.createElement("span");
    span.classList.add("shipName");
    span.textContent = shipNames[i];

    for (let i = 0; i < size; i++) {
      const segment = document.createElement("div");
      segment.classList.add("cell");
      segment.setAttribute("data-index", i);
      shipEl.appendChild(segment);
    }

    shipEl.appendChild(span);
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
      cell.classList.remove("hit");
      cell.classList.add("sunk");
      break;
  }
}

// Switch boards based on player's turn
export function switchBoard(player, placing = false) {
  const isComputer = player.isComputer;

  // Disable random/rotate buttons by default
  const randomBtn = document.querySelector(".random-btn");
  const rotateBtn = document.querySelector(".rotate-btn");
  const restartBtn = document.querySelector(".restart-btn");

  rotateBtn.classList.add("disable", "dim");
  restartBtn.classList.add("disable", "dim");

  // Update board and label visibility
  computerPlayerBoardEl.classList.toggle("disable", isComputer);
  computerPlayerBoardEl.classList.toggle("dim", isComputer && !placing);
  realPlayerBoardEl.classList.toggle("dim", !isComputer || placing);

  realPlayerLabels.forEach((label) =>
    label.classList.toggle("dim", !isComputer || placing),
  );
  computerPlayerLabels.forEach((label) =>
    label.classList.toggle("dim", isComputer && !placing),
  );

  // Reset status messages
  computerPlayerStatus.textContent = "";
  realPlayerStatus.textContent = "";

  // Players placing their ships (update status)
  if (placing) {
    if (isComputer) {
      computerPlayerStatus.textContent = "Computer is placing their ships...";
      computerPlayerBoardEl.classList.remove("dim");
      computerPlayerLabels.forEach((label) => label.classList.remove("dim"));
      randomBtn.classList.add("disable", "dim");
    } else {
      realPlayerStatus.textContent = "Place your ships on the board!";
      computerPlayerBoardEl.classList.add("disable", "dim");
      realPlayerBoardEl.classList.remove("dim");
      randomBtn.classList.remove("disable", "dim");
      rotateBtn.classList.remove("disable", "dim");
    }
  } else {
    // Players placed their ships (now attacking)
    if (isComputer) {
      realPlayerStatus.textContent = "Computer is attacking...";
    } else {
      computerPlayerStatus.textContent = "Attack the computer!";
    }
    restartBtn.classList.remove("disable", "dim");
  }
}

// Display the winner
export function displayWinner(winner) {
  const isComputer = winner.isComputer;

  computerPlayerBoardEl.classList.add("disable");

  const winnerBoard = isComputer ? computerPlayerBoardEl : realPlayerBoardEl;
  const loserBoard = isComputer ? realPlayerBoardEl : computerPlayerBoardEl;

  // Row-col labels
  const winnerLabels = isComputer ? computerPlayerLabels : realPlayerLabels;

  // Winner message
  winnerMsg.style.display = "block";
  winnerMsg.textContent = isComputer ? "Computer wins!" : "You win!";

  realPlayerStatus.textContent = "";
  computerPlayerStatus.textContent = "";

  winnerBoard.classList.remove("dim");
  loserBoard.classList.add("dim");

  winnerLabels.forEach((label) => label.classList.remove("dim"));

  winnerBoard.classList.add(isComputer ? "computer-shadow" : "player-shadow");
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
    document.querySelector(".restart-btn").classList.remove("disable", "dim");
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
  ship.style.maxWidth = "0";
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
function highlightShipSelection() {
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
  const shipName = document.querySelector(
    "[id^='ship'].highlightShip .shipName",
  );

  if (!selectedShip) return;

  const selectedShipID = selectedShip.id;

  const wasRotated = shipRotationState[selectedShipID] ?? false; // If state is undefined/null default it to false (horizontal)
  const isRotated = !wasRotated; // Toggle current rotation state

  shipRotationState[selectedShipID] = isRotated; // Store current rotation state of the ship

  if (isRotated) {
    selectedShip.setAttribute("data-orientation", "vertical");
    selectedShip.classList.add("rotated");
    shipName.style.transform = "rotate(-90deg)";
  } else {
    selectedShip.setAttribute("data-orientation", "horizontal");
    selectedShip.classList.remove("rotated");
    shipName.style.transform = "rotate(0deg)";
  }
}

function setupShipRotation() {
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

  btn.style.cursor = "default";
  document.querySelector(".restart-btn").classList.add("disable", "dim");
}

function setupRandomShipPlacement() {
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
  winnerMsg.style.display = "none";
  realPlayerBoardEl.classList.remove("player-shadow");
  computerPlayerBoardEl.classList.remove("computer-shadow");

  game.reset();

  shipRotationState = {};

  // Rerender the boards after reset
  renderBoard(realPlayer.gameboard, realPlayerBoardEl);
  renderBoard(computerPlayer.gameboard, computerPlayerBoardEl);

  renderSidePanel();

  highlightShipSelection();
  setupShipRotation();
  setupRandomShipPlacement();

  switchBoard(realPlayer, true); // Real player placing their ships
  game.startSetup();

  // Start with restart button being disabled
  document.querySelector(".restart-btn").classList.add("disable", "dim");
}

function setupPlayAgain() {
  restartBtn.addEventListener("click", handleRestart);
}

export function setupUI() {
  setupPlayAgain();

  // Render the game boards for 2 players
  renderBoard(realPlayer.gameboard, realPlayerBoardEl);
  renderBoard(computerPlayer.gameboard, computerPlayerBoardEl);

  renderSidePanel();

  highlightShipSelection();

  setupShipRotation();
  setupRandomShipPlacement();
}
