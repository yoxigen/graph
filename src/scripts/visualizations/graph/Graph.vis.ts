import { Coordinates, Vector } from '../../types/position.types';
import { createArray } from '../../utils/array_utils';
import EventBus from '../../utils/EventBus';
import {
  getForceBetweenNodes,
  getGravityForce,
  getLinkForce,
} from './graph_utils';
import type { GraphLink } from './GraphLink';
import GraphNode from './GraphNode';

export type GraphConfig = {
  charge: number;
  gravityForce: number;
  gravityCenter: Coordinates;
  minDistance: number;
  minEnergy: number;
  linkStrength: number;
  linkLength: number;
  friction: number;
  warmupIterations: number;
  alphaDecay: number;
  alphaMin: number;
  alphaTarget: number;
  randomizePositions: boolean;
};

const DEFAULT_OPTIONS: GraphConfig = {
  charge: 500,
  gravityForce: 0.01,
  minDistance: 10, // Prevents "infinite" force when nodes overlap
  minEnergy: 0.2,
  linkStrength: 0.1,
  linkLength: 20,
  friction: 0.05,
  warmupIterations: 0,
  gravityCenter: undefined,
  alphaMin: 0.001,
  alphaDecay: 1 - Math.pow(0.001, 1 / 300),
  alphaTarget: 0,
  randomizePositions: false,
};

export type GraphLinkData = {
  from: number;
  to: number;
};

export type GraphEvent<TNodeData> = {
  nodes: GraphNode<TNodeData>[];
  links: GraphLink<TNodeData>[];
};

export default class Graph<TNodeData> {
  nodes: GraphNode<TNodeData>[];
  links: GraphLink<TNodeData>[];
  config: GraphConfig;

  #isInit = false;

  constructor(
    { nodes, links }: { nodes: TNodeData[]; links?: GraphLinkData[] },
    config: Partial<GraphConfig> = {}
  ) {
    this.nodes = nodes.map(d => new GraphNode(d));
    this.links = (links ?? [])
      .map(({ from, to }) =>
        from >= this.nodes.length || to >= this.nodes.length
          ? null
          : {
              source: this.nodes[from],
              target: this.nodes[to],
            }
      )
      .filter(Boolean);
    this.config = Object.assign({}, DEFAULT_OPTIONS, config);
  }

  #init() {
    const angle = (Math.PI * 2) / this.nodes.length;
    if (this.config.randomizePositions) {
      // Initialize the nodes in the center of the graph and give each of them an initial random velocity, to kick things off
      this.nodes.forEach(node => {
        node.position = [
          this.config.gravityCenter[0] + (Math.random() - 0.5) * 2,
          this.config.gravityCenter[1] + (Math.random() - 0.5) * 2,
        ];
      });
    } else {
      this.nodes.forEach((node, i) => {
        node.position = [
          this.config.gravityCenter[0] +
            (this.config.minDistance + 1) * Math.cos(angle * i),
          this.config.gravityCenter[1] +
            (this.config.minDistance + 1) * Math.sin(angle * i),
        ];
      });
    }
    this.#isInit = true;
  }

  assignConfig(config: Partial<GraphConfig>) {
    this.config = Object.assign(this.config, config);
  }

  *generate(): Generator<number> {
    if (!this.#isInit) {
      this.#init();
    }

    let totalEnergy = Infinity;
    let count = 0;
    let alpha = 1;

    while (
      totalEnergy > this.config.minEnergy &&
      alpha >= this.config.alphaMin
    ) {
      totalEnergy = 0;

      this.updateForces(alpha);

      this.nodes.forEach(node => {
        node.updatePosition(alpha);
        console.log('NODE ENERGY', node.energy);
        if (node.energy > totalEnergy) {
          totalEnergy = node.energy;
        }
      });

      alpha += (this.config.alphaTarget - alpha) * this.config.alphaDecay;

      if (count >= this.config.warmupIterations) {
        yield totalEnergy;
      }

      count++;
    }
  }

  private updateForces(alpha: number) {
    // Nodes gravity and repulsion between each other:
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const gravityForce = getGravityForce(
        node,
        this.config.gravityCenter,
        this.config.gravityForce
      );
      node.addForce(gravityForce);

      for (let j = i + 1; j < this.nodes.length; j++) {
        const otherNode = this.nodes[j];

        const force = getForceBetweenNodes(
          node,
          otherNode,
          this.config.charge,
          this.config.minDistance
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
