import "./styles/styles.css";

import {
  realPlayerBoardEl,
  computerPlayerBoardEl,
  renderBoard,
} from "./modules/dom.js";

import { realPlayer, computerPlayer } from "./modules/players.js";
import { Game } from "./modules/game.js";

// Render the game boards for 2 players
renderBoard(realPlayer.gameboard, realPlayerBoardEl);
renderBoard(computerPlayer.gameboard, computerPlayerBoardEl);

const game = new Game();

// Handle cell clicks on the game boards and assign it to game logic
[realPlayerBoardEl, computerPlayerBoardEl].forEach((board) => {
  board.addEventListener("click", (e) => {
    const cell = e.target;

    if (cell.classList.contains("column")) {
      game.handlePlayerMove(cell);
    }
  });
});
