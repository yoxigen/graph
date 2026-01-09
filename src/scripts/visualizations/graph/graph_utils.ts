import type { Coordinates, Vector } from '../../types/position.types';

export function getGravityForce(
  position: Coordinates,
  centerOfGravity: Coordinates,
  gravity: number
): Vector {
  return [
    (centerOfGravity[0] - position[0]) * gravity,
    (centerOfGravity[1] - position[1]) * gravity,
  ] as Vector;
}
