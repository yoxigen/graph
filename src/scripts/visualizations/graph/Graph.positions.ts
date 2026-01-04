import { Coordinates } from '../../types/position.types';
import CoordinatesList from '../../utils/CoordinatesList';

export type GraphPositionsOptions = {
  randomizeInitialPositions: boolean;
  gravityCenter: Coordinates;
} & (
  | {
      positions: Coordinates[];
      size: null;
    }
  | { positions: null; size: number }
);

const goldenRatio = (1 + Math.sqrt(5)) / 2;
const PHYLLOTAXIS_THETA = (2 * Math.PI) / goldenRatio;

const DEFAULT_GRAPH_POSITIONS_OPTIONS: GraphPositionsOptions = {
  randomizeInitialPositions: false,
  gravityCenter: [0, 0],
  positions: null,
  size: 0,
};

export default class GraphPositions extends CoordinatesList {
  constructor(buffer: ArrayBuffer);
  constructor(options: Partial<GraphPositionsOptions>);

  constructor(v: ArrayBuffer | Partial<GraphPositionsOptions> = {}) {
    if (v instanceof ArrayBuffer) {
      super(v);
    } else {
      super(v.positions?.length ?? v.size);
      this.init(Object.assign({}, DEFAULT_GRAPH_POSITIONS_OPTIONS, v));
    }
  }

  init(options: GraphPositionsOptions) {
    if (options.positions) {
      options.positions.forEach((pos, i) => this.set(i, pos[0], pos[1]));
    } else {
      if (options.randomizeInitialPositions) {
        // Initialize the nodes in the center of the graph and give each of them an initial random velocity, to kick things off
        for (let i = 0; i < this.size; i++) {
          this.set(
            i,
            options.gravityCenter[0] +
              Math.cos(Math.random() * Math.PI * 2) * Math.random() * 200,
            options.gravityCenter[1] +
              Math.sin(Math.random() * Math.PI * 2) * Math.random() * 200
          );
        }
      } else {
        const isPhyllotaxis = true;
        if (isPhyllotaxis) {
          this.setPhyllotaxisPositions(this.size, {
            center: options.gravityCenter,
            radius: 10,
          });
        } else {
          const angle = (Math.PI * 2) / this.size;
          for (let i = 0; i < this.size; i++) {
            this.set(
              i,
              options.gravityCenter[0] + 150 * Math.cos(angle * i),
              options.gravityCenter[1] + 150 * Math.sin(angle * i)
            );
          }
        }
      }
    }
  }

  private setPhyllotaxisPositions(
    n: number,
    { radius = 1, center: [cx, cy] = [0, 0], thetaOffset = 1.49 } = {}
  ) {
    for (let i = 0; i < n; i++) {
      const scaledTheta = PHYLLOTAXIS_THETA * i;
      const scaledRadius = radius * Math.sqrt(scaledTheta + thetaOffset);

      this.set(
        i,
        Math.cos(scaledTheta) * scaledRadius + cx,
        Math.sin(scaledTheta) * scaledRadius + cy
      );
    }
  }
}
