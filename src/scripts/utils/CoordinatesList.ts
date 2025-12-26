import { Coordinates } from '../types/position.types';
import { createArray } from './array_utils';

export default class CoordinatesList {
  private values: Float16Array;
  size: number;

  constructor(size?: number);
  constructor(values: Coordinates[]);
  constructor(buffer: ArrayBuffer);
  constructor(v: number | Coordinates[] | ArrayBuffer) {
    if (v instanceof Array) {
      this.values = new Float16Array(v.length * 2);
      v.forEach((pos, i) => this.set(i, pos[0], pos[1]));
    } else if (v instanceof ArrayBuffer) {
      this.values = new Float16Array(v);
    } else {
      this.size = v;
      this.values = new Float16Array(this.size * 2);
    }
  }

  copy(): Float16Array {
    return new Float16Array(this.values);
  }

  getX(index: number): number {
    return this.values[index * 2];
  }

  getY(index: number): number {
    return this.values[index * 2 + 1];
  }

  get(index: number): Coordinates {
    return [this.getX(index), this.getY(index)];
  }

  set(index: number, x: number, y: number) {
    this.values[index * 2] = x;
    this.values[index * 2 + 1] = y;
  }

  toCoordinates(): Coordinates[] {
    return createArray(this.size, i => this.get(i));
  }
}
