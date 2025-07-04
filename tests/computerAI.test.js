import { AIController } from "../src/modules/computerAI";
import { Ship } from "../src/modules/ships";
import { Player } from "../src/modules/players";

describe("AI Computer movements", () => {
  let computer;
  let computerShip;
  let ai;

  beforeEach(() => {
    computerShip = new Ship(5);
    computer = new Player(true);
    ai = new AIController(computer.gameboard);

    computer.gameboard.createBoard();
    computer.gameboard.placeShip(computerShip, [
      [9, 2],
      [9, 3],
      [9, 4],
      [9, 5],
      [9, 6],
    ]);
  });

  // Test if attack is untried and within board boundaries
  test("Check if the attack is within board boundaries and untried", () => {
    // If that coordinate hasn't been attacked yet, the attack is valid
    expect(ai.isValidAttack(9, 4)).toBe(true);

    // If the attack is beyond board boundary, the attack is invalid
    expect(ai.isValidAttack(10, 4)).toBe(false);

    computer.gameboard.receiveAttack(9, 4);

    // If that coordinate has been attacked already, the attack is invalid
    expect(ai.isValidAttack(9, 4)).toBe(false);
  });

  // Hunt Mode
  test("Attack randomly if not previous hits to the ship detected (hunt mode)", () => {
    const [x, y] = ai.huntShip();

    // Attack the random coordinate
    computer.gameboard.receiveAttack(x, y);

    // Confirm that random attack is within the board boundaries
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThan(computer.gameboard.boardSize);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThan(computer.gameboard.boardSize);

    // After random attack, the same coordinate should be invalid to attack
    expect(ai.isValidAttack(x, y)).toBe(false);
  });

  // Target Mode
  test("If there is a hit, attack adjacent cell (1 hit)", () => {
    // Before the target mode
    computer.gameboard.receiveAttack(9, 4);

    // Enter the target mode
    const [x, y] = ai.targetShip([9, 4]); // Return adjacent coordinate of the first hit
    computer.gameboard.receiveAttack(x, y); // Attack adjacent coordinate

    // Adjacent moves
    const directions = [
      [-1, 0], // up
      [1, 0], // down
      [0, -1], // left
      [0, 1], // right
    ];

    // Check if coordinates of targetShip() are adjacent to the hit (9, 4)
    const isAdjacentAttack = directions.some(([dx, dy]) => {
      return x === 9 + dx && y === 4 + dy;
    });

    expect(isAdjacentAttack).toBe(true);
  });

  test("Continue attacking forward after 2+ hits", () => {
    computer.gameboard.receiveAttack(9, 4);
    computer.gameboard.receiveAttack(9, 5);

    // Continue to attack forward
    const [x, y] = ai.findDirectionTarget(computerShip.hitPositions);
    computer.gameboard.receiveAttack(x, y);

    expect([x, y]).toEqual([9, 6]);
  });

  test("Switch attack to opposite direction after a miss that is beyond last hit", () => {
    computer.gameboard.receiveAttack(9, 5);
    computer.gameboard.receiveAttack(9, 6);

    // Forward attack misses (beyond last hit)
    computer.gameboard.receiveAttack(9, 7);

    // After a miss, AI should attack the the coordinate in the opposite direction
    const [x, y] = ai.findDirectionTarget(computerShip.hitPositions);
    computer.gameboard.receiveAttack(x, y);

    expect([x, y]).toEqual([9, 4]);
  });
});
