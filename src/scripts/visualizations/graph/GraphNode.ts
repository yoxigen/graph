import { Coordinates, Vector } from '../../types/position.types';
import { mapVector } from '../../utils/position_utils';

export default class GraphNode<TData = Object> {
  radius: number = 10;
  position: Coordinates;
  velocity: Vector = [0, 0];
  #energy: number;

  constructor(public readonly data: TData) {}

  get energy(): number {
    return this.#energy;
  }

  addForce(force: Vector) {
    this.velocity[0] += force[0];
    this.velocity[1] += force[1];
  }

  subtractForce(force: Vector) {
    this.velocity[0] -= force[0];
    this.velocity[1] -= force[1];
  }

  /**
   * Uses the previous position, the current position and the force to update the position of the Node
   */
  updatePosition(alpha = 1) {
    const velocity: Vector = mapVector(this.velocity, v => v * alpha);
    this.position = [
      this.position[0] + velocity[0],
      this.position[1] + velocity[1],
    ];
    this.velocity = velocity;
    this.#energy = Math.hypot(...velocity);
  }
}
