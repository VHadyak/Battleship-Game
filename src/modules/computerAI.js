// AI logic for when computer attacks
export class AIController {
  constructor(gameboard) {
    this.boardSize = gameboard.boardSize;
    this.oppGameboard = gameboard;
    this.lastHit = null; // Track last hit of the ship
    this.nextTarget = null; // Track next target
    this.currTargetShip = null; // Track the attacked ship
  }

  // Check if attack is within the boundaries and hasn't been attempted yet
  isValidAttack(x, y) {
    return (
      x >= 0 &&
      x < this.boardSize &&
      y >= 0 &&
      y < this.boardSize &&
      !this.oppGameboard.trackAttacks.has(`${x},${y}`)
    );
  }

  // Computer attacks based on the data it gathered
  computerAttacks() {
    let coordinate;

    if (this.nextTarget) {
      // If next target is known after 2+ hits, target directional cell
      coordinate = this.nextTarget;
      this.nextTarget = null;
    } else if (this.lastHit) {
      // Target adjacent cells after first hit was detected
      coordinate = this.targetShip(this.lastHit);
    } else {
      // Hunt for the ships randomly if no hit was detected
      coordinate = this.huntShip();
    }

    const [x, y] = coordinate;
    const keyCoordinate = `${x},${y}`;
    const ship = this.oppGameboard.storeShip.get(keyCoordinate);

    this.oppGameboard.receiveAttack(x, y);
    this.updateAttackState(ship, x, y);

    return [x, y];
  }

  // Generate a random coordinate
  getRanCoordinate(min, max) {
    const x = Math.floor(Math.random() * (max - min + 1) + min);
    const y = Math.floor(Math.random() * (max - min + 1) + min);

    return [x, y];
  }

  // [!] Use 'Target and Hunt' strategy for computer's attack

  // Randomly search for a ship to hit
  huntShip() {
    let coordinate;

    while (true) {
      coordinate = this.getRanCoordinate(0, this.boardSize - 1);

      if (this.isValidAttack(coordinate[0], coordinate[1])) {
        break;
      }
    }
    return coordinate;
  }

  // Attack neighbor cells if last attack was a hit
  targetShip(coordinate) {
    const [x, y] = coordinate;

    // Possible moves from the computer
    const directions = [
      [-1, 0], // up
      [1, 0], // down
      [0, -1], // left
      [0, 1], // right
    ];

    // Mix up the direction to move
    const mix = directions.sort(() => Math.random() - 0.5);

    for (const [dx, dy] of mix) {
      const sx = x + dx;
      const sy = y + dy;

      // Check if it's valid to attack
      if (this.isValidAttack(sx, sy)) {
        return [sx, sy];
      }
    }

    // Fallback to a random attack if no adjacent cells can be targeted
    return this.huntShip();
  }

  // Predict the ship's direction for computer's attack (2+ hits to the same ship)
  findDirectionTarget(hitCoordinates) {
    const [x1, y1] = hitCoordinates[0]; // First hit
    const [x2, y2] = hitCoordinates[1]; // Second hit

    let dx = 0;
    let dy = 0;

    if (x1 === x2) {
      dy = y2 > y1 ? 1 : -1; // Horizontal ship (dy = 1 move right)
    } else if (y1 === y2) {
      dx = x2 > x1 ? 1 : -1; // Vertical ship (dx = 1 move down)
    }

    const [lastX, lastY] = hitCoordinates[hitCoordinates.length - 1]; // Last hit
    const [firstX, firstY] = hitCoordinates[0]; // First hit

    // Move in the direction based on the most recent hit
    const forwardX = lastX + dx;
    const forwardY = lastY + dy;

    // Move backwards from the first hit in the opposite direction,
    // Use case if forward direction is blocked ('miss' cell or edge of the board)
    const backX = firstX - dx;
    const backY = firstY - dy;

    // Return the next valid target for computer to attack
    if (this.isValidAttack(forwardX, forwardY)) {
      return [forwardX, forwardY];
    }

    if (this.isValidAttack(backX, backY)) {
      return [backX, backY];
    }
  }

  // Update target-tracking state after computer's attack
  updateAttackState(ship, x, y) {
    const isHit = ship && !ship.isSunk();

    // Check if the targeted ship has sunk
    const targetShipSunk = this.currTargetShip && this.currTargetShip.isSunk();

    // Check if previously attacked ship should continue being attacked
    const resumePrevAttack =
      this.currTargetShip &&
      !this.currTargetShip.isSunk() &&
      this.currTargetShip.hitPositions.length >= 2;

    if (isHit) {
      if (ship.hitPositions.length >= 2) {
        // If 2+ hits registered, predict the ship's direction for the next attack
        this.nextTarget = this.findDirectionTarget(ship.hitPositions);
      }
      this.lastHit = [x, y];
      this.currTargetShip = ship; // Save the currently attacked ship
    } else if (targetShipSunk) {
      // Reset all targeting state
      this.resetTargetState();
    } else if (resumePrevAttack) {
      // Continue to attack the ship from where it was last left off
      this.nextTarget = this.findDirectionTarget(
        this.currTargetShip.hitPositions,
      );
      this.lastHit = null;
    }
  }

  // Reset all target data if no valid ship left to continue attacking (sunk or miss)
  resetTargetState() {
    this.lastHit = null;
    this.nextTarget = null;
    this.currTargetShip = null;
  }
}
