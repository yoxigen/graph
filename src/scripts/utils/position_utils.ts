import {
  BoundingRect,
  Coordinates,
  Dimensions,
  Vector,
} from '../types/position.types';

export function mapVector(
  vector: Vector,
  mapper: (v: number) => number
): Vector {
  return vector.map(mapper) as Vector;
}

export function mapCoordinates(
  coordinates: Coordinates,
  mapper: (v: number, i: number) => number
): Coordinates {
  return coordinates.map(mapper) as Coordinates;
}

export function getCenter(dimensions: Dimensions): Coordinates {
  return dimensions.map(v => v / 2) as Coordinates;
}

export function getBoundingRectForCoordinates(
  coordinates: ReadonlyArray<Coordinates>
): BoundingRect {
  if (coordinates.length === 0) {
    throw new Error("Can't get bounding rect, no coordinates specified.");
  }

  if (coordinates.length === 1) {
    return {
      top: coordinates[0][1],
      bottom: coordinates[0][1],
      left: coordinates[0][0],
      right: coordinates[0][0],
      width: 0,
      height: 0,
    };
  }
  const sides = coordinates.reduce(
    (box, point) => ({
      top: Math.min(box.top, point[1]),
      bottom: Math.max(box.bottom, point[1]),
      left: Math.min(box.left, point[0]),
      right: Math.max(box.right, point[0]),
    }),
    {
      top: Infinity,
      left: Infinity,
      bottom: -Infinity,
      right: -Infinity,
    }
  );

  return {
    ...sides,
    width: sides.right - sides.left,
    height: sides.bottom - sides.top,
  };
}

export function getDistanceBetweenCoordinates(
  c1: Coordinates,
  c2: Coordinates
): number {
  return Math.hypot(c2[0] - c1[0], c2[1] - c1[1]);
}
