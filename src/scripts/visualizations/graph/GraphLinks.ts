import { Vector } from '../../types/position.types';
import GraphPositions from './Graph.positions';
import { GraphLinkData } from './Graph.types';

export default class GraphLinks<TLinkData = {}> {
  private strengths: number[];
  private bias: number[];

  constructor(
    public readonly data: Array<TLinkData & GraphLinkData>,
    public readonly config: { linkLength: number; linkStrength: number }
  ) {
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
    this.strengths = this.data.map(
      (link, i) =>
        1 /
        Math.min(
          linkCountPerNode.get(link.source),
          linkCountPerNode.get(link.target)
        )
    );

    this.bias = this.data.map((link, i) => {
      const sourceCount = linkCountPerNode.get(link.source);
      return sourceCount / (sourceCount + linkCountPerNode.get(link.target));
    });
  }

  *getForceBetweenLinks(positions: GraphPositions): Generator<{
    sourceForce: Vector;
    targetForce: Vector;
    source: number;
    target: number;
  }> {
    for (let i = 0, link: GraphLinkData; i < this.data.length; i++) {
      link = this.data[i];
      const sourcePosition = positions.get(link.source);
      const targetPosition = positions.get(link.target);

      const dx = targetPosition[0] - sourcePosition[0];
      const dy = targetPosition[1] - sourcePosition[1];
      const distance = Math.hypot(dx, dy) || 0.0001; // Avoid division by zero

      // 2. Calculate the "displacement" from the rest length
      // positive = too far (pull), negative = too close (push)
      const diffAndStrength =
        (this.strengths[i] * (distance - this.config.linkLength)) / distance;

      const bias = this.bias[i];
      const sourceBias = 1 - bias;

      // 3. Calculate the force vector
      yield {
        sourceForce: [
          dx * diffAndStrength * sourceBias,
          dy * diffAndStrength * sourceBias,
        ],
        targetForce: [dx * diffAndStrength * bias, dy * diffAndStrength * bias],
        source: link.source,
        target: link.target,
      };
    }
  }
}
