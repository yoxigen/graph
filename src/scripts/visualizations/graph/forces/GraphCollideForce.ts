import { ValueOrFunction } from '../../../types/general.types';
import { Coordinates } from '../../../types/position.types';
import CoordinatesList from '../../../utils/CoordinatesList';
import GraphForce from './GraphForce';

export type GraphCollideForceConfig<TNodeData = {}> = {
  radius: ValueOrFunction<number, TNodeData>;
  collisionStrength: number;
};

const DEFAULT_CONFIG: GraphCollideForceConfig = {
  radius: 3,
  collisionStrength: 0.1,
};

export default class GraphCollideForce<TNodeData = {}> extends GraphForce<
  GraphCollideForceConfig<TNodeData>
> {
  constructor(
    nodes: TNodeData[],
    private nodesRadius?: Float16Array,
    config?: Partial<GraphCollideForceConfig<TNodeData>>
  ) {
    super(DEFAULT_CONFIG, config);

    const radius = this.config.radius;
    if (!this.nodesRadius && radius instanceof Function) {
      this.nodesRadius = new Float16Array(nodes.map(n => radius(n)));
    }
  }

  setNodesRadius(nodesRadius: Float16Array) {
    this.nodesRadius = nodesRadius;
  }
  private getNodeRadius(index: number): number {
    // @ts-ignore
    return this.nodesRadius?.[index] ?? this.config.radius;
  }

  apply(
    positions: CoordinatesList,
    velocities: CoordinatesList,
    fixedPositions: Map<number, Coordinates>
  ) {
    for (let k = 0; k < 10; k++) {
      for (let i = 0; i < positions.size - 1; i++) {
        const nodeX = positions.getX(i) + velocities.getX(i);
        const nodeY = positions.getY(i) + velocities.getY(i);

        for (let j = i + 1; j < positions.size; j++) {
          const otherNodeX = positions.getX(j) + velocities.getX(j);
          const otherNodeY = positions.getY(j) + velocities.getY(j);
          let dx = otherNodeX - nodeX || Math.random() * 0.001;
          let dy = otherNodeY - nodeY || Math.random() * 0.001;
          const totalRadiusDistance =
            this.getNodeRadius(i) + this.getNodeRadius(j);

          const distance = Math.hypot(dx, dy);

          if (distance < totalRadiusDistance) {
            const distanceIncreaseRatio = totalRadiusDistance / distance;
            if (fixedPositions.has(i)) {
              // set other node velocity
              // dx *= -1;
              // dy *= -1;
            }

            const changeDistanceX =
              dx * (distanceIncreaseRatio - 1) * this.config.collisionStrength;
            const changeDistanceY =
              dy * (distanceIncreaseRatio - 1) * this.config.collisionStrength;

            if (changeDistanceX) {
              if (fixedPositions.has(i)) {
                // node is to the right of other node
                velocities.addX(j, changeDistanceX);
              } else if (
                dx <= 0 &&
                !fixedPositions.has(i) &&
                !fixedPositions.has(j)
              ) {
                // node is to the left of other node
                velocities.addX(i, changeDistanceX);
              } else {
                velocities.subtractX(i, changeDistanceX);
              }
            }

            if (changeDistanceY) {
              if (fixedPositions.has(i)) {
                // node is to the right of other node
                velocities.addY(j, changeDistanceY);
              } else if (
                dy <= 0 &&
                !fixedPositions.has(i) &&
                !fixedPositions.has(j)
              ) {
                // node is to the left of other node
                velocities.addY(i, changeDistanceY);
              } else {
                velocities.subtractY(i, changeDistanceY);
              }
            }
          }
        }
      }
    }
  }
}
