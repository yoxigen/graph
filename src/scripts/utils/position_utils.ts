import { Coordinates, Vector } from '../types/position.types';

export function mapVector(
  vector: Vector,
  mapper: (v: number) => number
): Vector {
  return vector.map(mapper) as Vector;
}

export function mapCoordinates(
  coordinates: Coordinates,
  mapper: (v: number) => number
): Coordinates {
  return coordinates.map(mapper) as Coordinates;
}
