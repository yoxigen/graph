import { Coordinates, Vector } from '../types/position.types';
import { createArray } from './array_utils';

export default class CoordinatesList {
  private values: Float16Array;
  size: number;

  constructor(size?: number);
  constructor(values: Coordinates[]);
  constructor(buffer: ArrayBuffer);
  constructor(coordinatesList: CoordinatesList);
  constructor(v: number | Coordinates[] | ArrayBuffer | CoordinatesList) {
    if (v instanceof CoordinatesList) {
      this.values = v.values;
      this.size = v.size;
    } else if (v instanceof Array) {
      this.values = new Float16Array(v.length * 2);
      v.forEach((pos, i) => this.set(i, pos[0], pos[1]));
      this.size = v.length;
    } else if (v instanceof ArrayBuffer) {
      this.values = new Float16Array(v);
      this.size = v.byteLength / 4;
    } else {
      this.size = v;
      this.values = new Float16Array(this.size * 2);
    }
  }

  get buffer(): ArrayBufferLike {
    return this.values.buffer;
  }
  copy(): Float16Array {
    return new Float16Array(this.values);
  }

  getX(index: number): number {
    return this.values[index * 2];
  }

  setX(index: number, value: number) {
    this.values[index * 2] = value;
  }

  getY(index: number): number {
    return this.values[index * 2 + 1];
  }

  setY(index: number, value: number) {
    this.values[index * 2 + 1] = value;
  }

  get(index: number): Coordinates {
    return [this.getX(index), this.getY(index)];
  }

  set(index: number, x: number, y: number) {
    this.setX(index, x);
    this.setY(index, y);
  }

  addVector(index: number, x: number, y: number) {
    this.values[index * 2] += x;
    this.values[index * 2 + 1] += y;
  }

  addX(index: number, value: number) {
    this.values[index * 2] += value;
  }

  addY(index: number, value: number) {
    this.values[index * 2 + 1] += value;
  }

  subtractX(index: number, value: number) {
    this.values[index * 2] -= value;
  }

  subtractY(index: number, value: number) {
    this.values[index * 2 + 1] -= value;
  }

  subtractVector(index: number, x: number, y: number) {
    this.values[index * 2] -= x;
    this.values[index * 2 + 1] -= y;
  }

  toCoordinates(): Coordinates[] {
    return createArray(this.size, i => this.get(i));
  }

  forEach(callback: (x: number, y: number, index: number) => any) {
    for (let i = 0; i < this.values.length; i += 2) {
      callback(this.values[i], this.values[i + 1], i / 2);
    }
  }

  fill(value: number) {
    this.values.fill(value);
  }
}
