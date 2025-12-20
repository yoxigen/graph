import Renderer from '../../renderers/Renderer';
import { Coordinates, Vector } from '../../types/position.types';
import { createArray } from '../../utils/array_utils';
import {
  getForceBetweenNodes,
  getGravityForce,
  getLinkForce,
} from './graph_utils';
import type { GraphLink } from './GraphLink';
import GraphNode from './GraphNode';

export type GraphConfig = {
  charge: number;
  centerGravity: number;
  minDistance: number;
  minEnergy: number;
  linkStrength: number;
  linkLength: number;
  friction: number;
};

const DEFAULT_OPTIONS: GraphConfig = {
  charge: 400,
  centerGravity: 0.01,
  minDistance: 6, // Prevents "infinite" force when nodes overlap
  minEnergy: 0.1,
  linkStrength: 0.1,
  linkLength: 10,
  friction: 0.04,
};

export type GraphLinkData = {
  from: number;
  to: number;
};

export default class Graph<TNodeData> {
  nodes: GraphNode<TNodeData>[];
  links: GraphLink<TNodeData>[];
  config: GraphConfig;

  constructor(
    { nodes, links }: { nodes: TNodeData[]; links?: GraphLinkData[] },
    config: Partial<GraphConfig> = {}
  ) {
    this.nodes = nodes.map(d => new GraphNode(d));
    this.links = (links ?? []).map(({ from, to }) => ({
      source: this.nodes[from],
      target: this.nodes[to],
    }));
    this.config = Object.assign({}, DEFAULT_OPTIONS, config);
  }

  render(renderer: Renderer) {
    const generator = this.generate(renderer);
    const step = () => {
      if (!generator.next().done) {
        requestAnimationFrame(step);
      } else {
        console.log('DONE');
      }
    };

    step();
  }

  *generate(renderer: Renderer): Generator<void> {
    const center = renderer.getSize().map(v => v / 2) as Coordinates;

    this.nodes.forEach(node => {
      node.position = center;
      node.velocity = createArray(2, () => (Math.random() - 0.5) * 2) as Vector;
    });

    let totalEnergy = Infinity;
    while (totalEnergy > this.config.minEnergy) {
      totalEnergy = 0;
      renderer.clear();
      this.updateForces(center);

      this.nodes.forEach(node => {
        node.updatePosition(this.config.friction);
        renderer.drawCircle(node.position, 5);
        totalEnergy += node.energy;
      });

      this.links.forEach(link =>
        renderer.drawLine(link.source.position, link.target.position)
      );

      if (totalEnergy > this.config.minEnergy) {
        yield;
      }
    }
  }

  private updateForces(center: Coordinates) {
    const minDistanceSq = this.config.minDistance ** 2;
    // Nodes gravity and repulsion between each other:
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const gravityForce = getGravityForce(
        node,
        center,
        this.config.centerGravity
      );
      node.addForce(gravityForce);

      for (let j = i + 1; j < this.nodes.length; j++) {
        const otherNode = this.nodes[j];

        const force = getForceBetweenNodes(
          node,
          otherNode,
          this.config.charge,
          minDistanceSq
        );
        node.addForce(force);
        otherNode.subtractForce(force);
      }
    }

    // Links:
    this.links.forEach(link => {
      const force = getLinkForce(
        link,
        this.config.linkStrength,
        this.config.linkLength
      );
      link.source.addForce(force);
      link.target.subtractForce(force);
    });
  }
}
