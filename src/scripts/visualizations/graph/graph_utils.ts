import type { Coordinates, Vector } from '../../types/position.types';
import { GraphLink } from './GraphLink';
import GraphNode from './GraphNode';

export function getGravityForce(
  node: GraphNode,
  centerOfGravity: Coordinates,
  gravity: number
): Vector {
  return [
    (centerOfGravity[0] - node.position[0]) * gravity,
    (centerOfGravity[1] - node.position[1]) * gravity,
  ] as Vector;
}

export function getForceBetweenNodes(
  { position: pos1 }: GraphNode,
  { position: pos2 }: GraphNode,
  charge: number,
  minDistanceSq = 0
): Vector {
  // 1. Calculate the difference vector
  let dx = pos1[0] - pos2[0];
  let dy = pos1[1] - pos2[1];

  // 2. Calculate distance squared first (cheaper than Math.sqrt)
  let distanceSq = dx * dx + dy * dy;

  // Guard against nodes being on top of each other
  if (distanceSq < minDistanceSq) {
    distanceSq = minDistanceSq;
  }

  // 3. Calculate distance and force magnitude
  const distance = Math.sqrt(distanceSq);

  // Formula: Force = Strength / distance squared
  // We then divide by distance again to normalize the vector
  const forceMag = charge / distanceSq;

  // 4. Return the force vector to be added to acceleration
  return [(dx / distance) * forceMag, (dy / distance) * forceMag];
}

export function getLinkForce(
  { source, target }: GraphLink,
  linkStrength: number,
  linkLength: number
): Vector {
  const dx = target.position[0] - source.position[0];
  const dy = target.position[1] - source.position[1];
  const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001; // Avoid division by zero

  // 2. Calculate the "displacement" from the rest length
  // positive = too far (pull), negative = too close (push)
  const diffAndStrength = (linkStrength * (distance - linkLength)) / distance;

  // 3. Calculate the force vector
  return [dx * diffAndStrength, dy * diffAndStrength] as Vector;
}
