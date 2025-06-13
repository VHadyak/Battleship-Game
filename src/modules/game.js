import { realPlayer, computerPlayer } from "./players.js";
import { realPlayerBoardEl, computerPlayerBoardEl } from "./dom.js";

export class Game {
  constructor() {
    this.player1 = realPlayer;
    this.player2 = computerPlayer;
    this.currentPlayer = realPlayer;
    this.opponent = computerPlayer;
  }

  handlePlayerMove(cell) {
    this.switchTurn();
  }

  switchTurn() {
    this.currentPlayer =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;

    this.opponent =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;

    this.switchBoard();
  }

  switchBoard() {
    if (this.currentPlayer.isComputer) {
      realPlayerBoardEl.classList.remove("disable");
      computerPlayerBoardEl.classList.add("disable");
    } else {
      computerPlayerBoardEl.classList.remove("disable");
      realPlayerBoardEl.classList.add("disable");
    }
  }
}
