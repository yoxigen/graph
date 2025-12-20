import { Coordinates, Vector } from '../../types/position.types';
import { mapCoordinates, mapVector } from '../../utils/position_utils';

const frameRate = 0.016; // 1/60
const frSq = frameRate ** 2;
const FRICTION = 0.97;
const INITIAL_SPEED = 1;

export default class GraphNode<TData = Object> {
  radius: number = 10;
  position: Coordinates;
  velocity: Vector;
  energy: number;

  constructor(public readonly data: TData) {}

  private updateEnergy() {
    this.energy = this.velocity[0] ** 2 + this.velocity[1] ** 2;
  }

  stop() {
    this.velocity = [0, 0];
  }

  setVelocity(velocity: Vector) {
    this.velocity = velocity;
    this.updateEnergy();
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
  updatePosition(friction = 0) {
    const frictionMultiply = 1 - friction;

    const velocity: Vector = mapVector(
      this.velocity,
      v => v * frictionMultiply
    );
    this.position = [
      this.position[0] + velocity[0],
      this.position[1] + velocity[1],
    ];
    this.velocity = velocity;
    this.updateEnergy();
  }
}
