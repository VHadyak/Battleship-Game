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

  // Determine direction
  getDirection([x1, y1], [x2, y2]) {
    const dx = x2 - x1; // if -1 then upward movement, 1 then downward
    const dy = y2 - y1; // if -1 then leftward movement, 1 then rightward
    return [dx, dy];
  }

  // Next attack coordinate based on predicted direction
  getNextCoordinate([x, y], [dx, dy]) {
    return [x + dx, y + dy];
  }

  // Reverse direction
  reverseDirection([dx, dy]) {
    return [-dx, -dy];
  }

  // Predict the ship's direction for computer's attack (2+ hits to the same ship)
  findDirectionTarget(hitCoordinates) {
    if (hitCoordinates.length < 2) return null;

    // Fallback: sort coordinates if original order is ambiguous
    // (ex: if the first hit is in the middle of the ship)
    const sortedCoordinates = [...hitCoordinates].sort(([x1, y1], [x2, y2]) => {
      return x1 !== x2 ? x1 - x2 : y1 - y2;
    });

    const attackDirection = (hits) => {
      // First and last known hit
      const initialHit = hits[0];
      const lastHit = hits[hits.length - 1];

      // Get direction based on the first two hits
      let direction = this.getDirection(hits[0], hits[1]);

      // Attack forward from last known hit
      const [forwardX, forwardY] = this.getNextCoordinate(lastHit, direction);
      if (this.isValidAttack(forwardX, forwardY)) return [forwardX, forwardY];

      // Attack backward from initial hit if forward attack fails (miss cell or out of bounds)
      direction = this.reverseDirection(direction);
      const [backX, backY] = this.getNextCoordinate(initialHit, direction);
      if (this.isValidAttack(backX, backY)) return [backX, backY];

      return null; // Fallback if both directions fail
    };

    return (
      attackDirection(hitCoordinates) || attackDirection(sortedCoordinates)
    );
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
      this.lastHit = [x, y];
      this.currTargetShip = ship; // Save the currently attacked ship

      // If 2+ hits registered, predict the ship's orientation for the next attack
      if (this.currTargetShip.hitPositions.length >= 2) {
        this.nextTarget = this.findDirectionTarget(
          this.currTargetShip.hitPositions,
        );
      }
    } else if (resumePrevAttack) {
      // Missed, keep attacking the known ship based on previous hits
      this.nextTarget = this.findDirectionTarget(
        this.currTargetShip.hitPositions,
      );
      this.lastHit = null;
    }

    if (targetShipSunk) {
      // Reset all targeting state
      this.resetTargetState();
    }
  }

  // Reset all target data if no valid ship left to continue attacking (sunk or miss)
  resetTargetState() {
    this.lastHit = null;
    this.nextTarget = null;
    this.currTargetShip = null;
  }
}
