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

export function getForceBetweenNodes(
  pos1: Coordinates,
  pos2: Coordinates,
  charge: number,
  minDistance = 0
): Vector {
  let dx = pos1[0] - pos2[0];
  let dy = pos1[1] - pos2[1];

  const distance = Math.max(minDistance, Math.hypot(dx, dy));

  // Formula: Force = Strength / distance squared
  // We then divide by distance again to normalize the vector
  const forceMag = charge / distance ** 2;

  // Make sure nodes don't get "stuck" together
  if (dx === 0 && dy === 0) {
    dx = Math.random() * 0.02;
    dy = Math.random() * 0.02;
  }

  return [dx * forceMag, dy * forceMag];
}
