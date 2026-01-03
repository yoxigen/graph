import { Vector } from '../../types/position.types';
import CoordinatesList from '../../utils/CoordinatesList';
import GraphPositions from './Graph.positions';
import { GraphLinkData } from './Graph.types';

export type GraphLinksConfig = {
  linkLength: number;
  autoLinkStrength: boolean;
  linkStrength: number;
};

const DEFAULT_CONFIG: GraphLinksConfig = {
  linkLength: 30,
  autoLinkStrength: true,
  linkStrength: 1,
};

export default class GraphLinks<TLinkData = {}> {
  private strengths: number[];
  private bias: number[];
  config: GraphLinksConfig;

  constructor(
    public readonly data: Array<TLinkData & GraphLinkData>,
    config: Partial<GraphLinksConfig>
  ) {
    this.setConfig(config);
    this.init();
  }

  setConfig(config: Partial<GraphLinksConfig>) {
    this.config = Object.assign({}, DEFAULT_CONFIG, config);
    this.init();
  }

  private init() {
    const linkCountPerNode = new Map<number, number>();
    for (let i = 0, link: GraphLinkData; i < this.data.length; i++) {
      link = this.data[i];
      const sourceCount = linkCountPerNode.get(link.source);
      const targetCount = linkCountPerNode.get(link.target);

      linkCountPerNode.set(link.source, sourceCount ? sourceCount + 1 : 1);
      linkCountPerNode.set(link.target, targetCount ? targetCount + 1 : 1);
    }
    this.strengths = this.data.map((link, i) =>
      this.config.autoLinkStrength
        ? 1 /
          Math.min(
            linkCountPerNode.get(link.source),
            linkCountPerNode.get(link.target)
          )
        : this.config.linkStrength
    );

    this.bias = this.data.map((link, i) => {
      const sourceCount = linkCountPerNode.get(link.source);
      return sourceCount / (sourceCount + linkCountPerNode.get(link.target));
    });
  }

  addForceBetweenLinks(
    positions: GraphPositions,
    velocities: CoordinatesList,
    alpha: number
  ) {
    for (let k = 0; k < 1; k++) {
      for (let i = 0, link: GraphLinkData; i < this.data.length; i++) {
        link = this.data[i];
        const sourcePosition = positions.get(link.source);
        const targetPosition = positions.get(link.target);

        const dx =
          targetPosition[0] +
          velocities.getX(link.target) -
          sourcePosition[0] -
          velocities.getX(link.source);
        const dy =
          targetPosition[1] +
          velocities.getY(link.target) -
          sourcePosition[1] -
          velocities.getY(link.source);
        const distance = Math.hypot(dx, dy) || 0.0001; // Avoid division by zero

        // 2. Calculate the "displacement" from the rest length
        // positive = too far (pull), negative = too close (push)
        const diffAndStrength =
          (this.strengths[i] * (distance - this.config.linkLength)) / distance;

        const bias = this.bias[i];
        const sourceBias = 1 - bias;

        velocities.addVector(
          link.source,
          dx * diffAndStrength * sourceBias,
          dy * diffAndStrength * sourceBias
        );
        velocities.subtractVector(
          link.target,
          dx * diffAndStrength * bias,
          dy * diffAndStrength * bias
        );
      }
    }
  }
}
