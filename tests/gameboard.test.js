import { Gameboard } from "../src/modules/gameboard.js";
import { Ship } from "../src/modules/ships.js";

describe("Gameboard with ships", () => {
  let coordinate1;
  let coordinate2;

  let board1;

  let ship1;
  let ship2;

  beforeEach(() => {
    coordinate1 = [
      [0, 0],
      [0, 1],
      [0, 2],
    ];
    coordinate2 = [
      [3, 2],
      [2, 2],
    ];

    ship1 = new Ship(3);
    ship2 = new Ship(2);

    board1 = new Gameboard();
    board1.createBoard();

    // Place a ship with coordinates
    board1.placeShip(ship1, coordinate1);
    board1.placeShip(ship2, coordinate2);
  });

  test("Check if the attack hit the ship based on the coordinates", () => {
    expect(board1.receiveAttack(0, 1)).toBeDefined(); // Attack hit the ship
    expect(board1.receiveAttack(2, 3)).toBeUndefined(); // Attack didn't hit the ship
  });

  test("Track the missed hits during the attack", () => {
    board1.receiveAttack(3, 5);
    board1.receiveAttack(9, 9);
    board1.receiveAttack(5, 2);

    expect(board1.missedHits.length).toEqual(3);
  });

  test("Check if one of the ships has been sunk during the attack", () => {
    board1.receiveAttack(3, 2);
    board1.receiveAttack(2, 2);

    expect(ship2.isSunk()).toBe(true);
  });

  test("Test if all the ships have been sunk", () => {
    board1.receiveAttack(0, 0);
    board1.receiveAttack(0, 1);
    board1.receiveAttack(0, 2);
    board1.receiveAttack(3, 2);
    board1.receiveAttack(2, 2);

    expect(board1.allSunk()).toBe(true);
  });
});
