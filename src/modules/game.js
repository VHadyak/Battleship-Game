import { realPlayer, computerPlayer } from "./players.js";
import { switchBoard } from "./dom.js";

export class Game {
  constructor() {
    this.player1 = realPlayer;
    this.player2 = computerPlayer;
    this.currentPlayer = realPlayer;
    this.opponent = computerPlayer;
  }

  handlePlayerMove() {
    this.switchTurn();
  }

  switchTurn() {
    this.currentPlayer =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;

    this.opponent =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;

    switchBoard(this.currentPlayer);
  }
}
