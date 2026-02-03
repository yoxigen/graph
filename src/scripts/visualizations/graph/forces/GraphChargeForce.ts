import {
  Coordinates,
  Dimensions,
  Vector,
  WeightedCenter,
} from '../../../types/position.types';
import CoordinatesList from '../../../utils/CoordinatesList';
import { getDistanceBetweenCoordinates } from '../../../utils/position_utils';
import QuadTree from '../../../utils/QuadTree';
import GraphForce from './GraphForce';

export type GraphChargeForceConfig = {
  charge: number;
  useQuadTree: boolean;
  theta: number;
  minDistance: number;
  minQuadSize: number;
};

const DEFAULT_CONFIG: GraphChargeForceConfig = {
  charge: 30,
  useQuadTree: true,
  theta: 1,
  minDistance: 12,
  minQuadSize: 0,
};

export default class GraphChargeForce extends GraphForce<GraphChargeForceConfig> {
  quadTree: QuadTree;

  constructor(
    public readonly size: Dimensions,
    config: Partial<GraphChargeForceConfig>
  ) {
    super(DEFAULT_CONFIG, config);
  }

  apply(
    positions: CoordinatesList,
    velocities: CoordinatesList,
    fixedPositions: Map<number, Coordinates>
  ) {
    if (this.config.useQuadTree) {
      this.quadTree = new QuadTree(Math.max(...this.size), positions, {
        minChildWidth: this.config.minQuadSize,
      });
    }

    for (let i = 0; i < positions.size; i++) {
      const isFixed = fixedPositions.has(i);
      const nodePosition = positions.get(i);

      if (this.config.useQuadTree) {
        if (!isFixed) {
          const generateWeightedCenters = this.generateForceCoordinates(
            nodePosition,
            this.quadTree
          );
          for (const { center, weight } of generateWeightedCenters) {
            const force = this.getForceBetweenNodes(
              nodePosition,
              center,
              this.config.charge * weight,
              this.config.minDistance
            );
            velocities.addVector(i, ...force);
          }
        }
      } else {
        for (let j = i + 1; j < positions.size; j++) {
          const force = this.getForceBetweenNodes(
            nodePosition,
            positions.get(j),
            this.config.charge,
            this.config.minDistance
          );
          if (!isFixed) {
            velocities.addVector(i, ...force);
          }
          if (!fixedPositions.has(j)) {
            velocities.subtractVector(j, ...force);
          }
        }
      }
    }
  }

  private getForceBetweenNodes(
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

  /**
   * Get the weighted positions of forces, relative to the given position p
   * @param p
   * @param quadTree
   */
  private *generateForceCoordinates(
    p: Coordinates,
    quadTree: QuadTree
  ): Generator<WeightedCenter> {
    const wc = quadTree.getWeightedCenter();
    if (
      quadTree.width / getDistanceBetweenCoordinates(wc.center, p) <
      this.config.theta
    ) {
      // Long distance, use the weighed center
      yield wc;
    } else {
      // quadtree is near, get its inner forces
      if (quadTree.elements) {
        for (const el of quadTree.elements) {
          yield { center: el.coordinates, weight: 1 };
        }
      } else {
        for (const child of quadTree.children.values()) {
          if (child.weight) {
            yield* this.generateForceCoordinates(p, child);
          }
        }
      }
    }
  }
}
