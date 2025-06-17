export class Ship {
  constructor(length) {
    this.length = length;
    this.hits = 0;
    this.hitPositions = [];
  }

  hit(x, y) {
    if (this.hits < this.length) {
      this.hits += 1;
      this.hitPositions.push([x, y]);
    }
  }

  isSunk() {
    return this.hits >= this.length;
  }
}
