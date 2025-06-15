import "./styles/styles.css";

import {
  realPlayerBoardEl,
  computerPlayerBoardEl,
  renderBoard,
} from "./modules/dom.js";

import { realPlayer, computerPlayer } from "./modules/players.js";
import { Game } from "./modules/game.js";

const game = new Game(realPlayer, computerPlayer);

// Render the game boards for 2 players
renderBoard(realPlayer.gameboard, realPlayerBoardEl);
renderBoard(computerPlayer.gameboard, computerPlayerBoardEl);

// Handle cell clicks on the computer game board and assign it to game logic
computerPlayerBoardEl.addEventListener("click", (e) => {
  const cell = e.target;

  if (cell.classList.contains("column")) {
    game.handlePlayerMove(cell);
  }
});
