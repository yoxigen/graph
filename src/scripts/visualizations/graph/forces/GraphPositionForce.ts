import { ValueOrFunction } from '../../../types/general.types';
import CoordinatesList from '../../../utils/CoordinatesList';
import { IGraphForce } from '../Graph.types';

export type GraphPositionForceConfig<TNodeData = {}> = {
  x: ValueOrFunction<number, TNodeData>;
  y: ValueOrFunction<number, TNodeData>;
  strength: number;
};

const DEFAULT_CONFIG: GraphPositionForceConfig = {
  x: 0,
  y: 0,
  strength: 0.1,
};

export default class GraphPositionForce<TNodeData = {}> implements IGraphForce {
  config: GraphPositionForceConfig;

  private nodesForceX: number[] | number;
  private nodesForceY: number[] | number;

  constructor(
    public readonly nodes: TNodeData[],
    config: Partial<GraphPositionForceConfig>
  ) {
    this.config = Object.assign({}, DEFAULT_CONFIG, config);

    if (this.config.x instanceof Function) {
      this.nodesForceX = nodes.map(this.config.x);
    }
    if (this.config.y instanceof Function) {
      this.nodesForceY = nodes.map(this.config.y);
    }
  }

  apply(positions: CoordinatesList, velocities: CoordinatesList) {
    const getX = this.nodesForceX
      ? (i: number) => this.nodesForceX[i]
      : () => this.config.x;
    const getY = this.nodesForceY
      ? (i: number) => this.nodesForceX[i]
      : () => this.config.y;

    for (let i = 0; i < positions.size; i++) {
      velocities.setX(
        i,
        velocities.getX(i) +
          (getX(i) - positions.getX(i)) * this.config.strength
      );

      velocities.setY(
        i,
        velocities.getY(i) +
          (getY(i) - positions.getY(i)) * this.config.strength
      );
    }
  }
}
