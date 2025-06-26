import "./styles/styles.css";

import {
  realPlayerBoardEl,
  computerPlayerBoardEl,
  renderBoard,
} from "./modules/dom.js";

import { realPlayer, computerPlayer } from "./modules/players.js";
import { Game } from "./modules/game.js";

export const game = new Game(realPlayer, computerPlayer);
game.startSetup();

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
