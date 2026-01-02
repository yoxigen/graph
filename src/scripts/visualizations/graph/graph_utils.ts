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
  const vectorForce = forceMag / distance;

  // Make sure nodes don't get "stuck" together
  if (dx === 0 && dy === 0) {
    dx = Math.random() * 0.02;
    dy = Math.random() * 0.02;
  }

  return [dx * vectorForce, dy * vectorForce];
}

export function getLinkForce(
  sourceCoordinates: Coordinates,
  targetCoordinates: Coordinates,
  linkStrength: number,
  linkLength: number
): Vector {
  const dx = targetCoordinates[0] - sourceCoordinates[0];
  const dy = targetCoordinates[1] - sourceCoordinates[1];
  const distance = Math.hypot(dx, dy) || 0.0001; // Avoid division by zero

  // 2. Calculate the "displacement" from the rest length
  // positive = too far (pull), negative = too close (push)
  const diffAndStrength = (linkStrength * (distance - linkLength)) / distance;

  // 3. Calculate the force vector
  return [dx * diffAndStrength, dy * diffAndStrength] as Vector;
}
