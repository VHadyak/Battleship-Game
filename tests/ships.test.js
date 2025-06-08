import { Ship } from "../src/modules/ships.js";

describe("Ship that includes length, number of hits it takes, and whether the ship was sunk", () => {
  let ship;

  beforeEach(() => {
    // Ship length of 4
    ship = new Ship(4);
  });

  test("Ship tracks correct number of hits", () => {
    ship.hit();
    ship.hit();

    expect(ship.hits).toEqual(2);
  });

  test("Ship doesn't overcount the number of hits it took", () => {
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.hits).toEqual(4);
  });

  test("Ship sinks after correct number of hits", () => {
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(true);
  });
});
