import { ValueOrFunction } from '../../../types/general.types';
import Configurable from '../../../utils/Configurable';
import CoordinatesList from '../../../utils/CoordinatesList';
import { IGraphForce } from '../Graph.types';

export type GraphCollideForceConfig<TNodeData = {}> = {
  radius: ValueOrFunction<number, TNodeData>;
  strength: number;
};

const DEFAULT_CONFIG: GraphCollideForceConfig = {
  radius: 3,
  strength: 0.1,
};

export default class GraphCollideForce<TNodeData = {}>
  extends Configurable<GraphCollideForceConfig<TNodeData>>
  implements IGraphForce
{
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

  apply(positions: CoordinatesList, velocities: CoordinatesList) {
    for (let i = 0; i < positions.size - 1; i++) {
      const nodeX = positions.getX(i) + velocities.getX(i);
      const nodeY = positions.getY(i) + velocities.getY(i);

      for (let j = i + 1; j < positions.size; j++) {
        const otherNodeX = positions.getX(j) + velocities.getX(j);
        const otherNodeY = positions.getY(j) + velocities.getY(j);
        const dx = otherNodeX - nodeX;
        const dy = otherNodeY - nodeY;
        const totalRadiusDistance =
          this.getNodeRadius(i) + this.getNodeRadius(j);

        if (
          Math.abs(dx) < totalRadiusDistance &&
          Math.abs(dy) < totalRadiusDistance
        ) {
          console.log(
            'ADD VECTOR',
            (totalRadiusDistance - Math.abs(dx)) * this.config.strength,
            (totalRadiusDistance - Math.abs(dy)) * this.config.strength
          );
          velocities.addVector(
            i,
            (totalRadiusDistance - Math.abs(dx)) * this.config.strength,
            (totalRadiusDistance - Math.abs(dy)) * this.config.strength
          );
        }
      }
    }
  }
}
