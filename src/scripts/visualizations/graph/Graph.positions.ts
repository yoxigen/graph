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
            options.gravityCenter[0] + (Math.random() - 0.5) * 80,
            options.gravityCenter[1] + (Math.random() - 0.5) * 80
          );
        }
      } else {
        const angle = (Math.PI * 2) / this.size;
        for (let i = 0; i < this.size; i++) {
          this.set(
            i,
            options.gravityCenter[0] + 50 * Math.cos(angle * i),
            options.gravityCenter[1] + 50 * Math.sin(angle * i)
          );
        }
      }
    }
  }
}
