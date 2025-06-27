import "./styles/styles.css";

import {
  realPlayerBoardEl,
  computerPlayerBoardEl,
  renderBoard,
  setupUI,
} from "./modules/dom.js";

import { realPlayer, computerPlayer } from "./modules/players.js";
import { Game } from "./modules/game.js";

export const game = new Game(realPlayer, computerPlayer);

document.addEventListener("DOMContentLoaded", () => {
  setupUI();
  game.startSetup();

  computerPlayerBoardEl.addEventListener("click", (e) => {
    const cell = e.target.closest(".column");
    if (!cell) return;

    game.handlePlayerMove(cell);
  });
});
