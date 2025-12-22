import { Coordinates, Vector } from '../../types/position.types';
import { createArray } from '../../utils/array_utils';
import EventBus from '../../utils/EventBus';
import { GraphData } from './Graph.types';
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
  minDistance: 12, // Prevents "infinite" force when nodes overlap
  minEnergy: 0.2,
  linkStrength: 0.1,
  linkLength: 20,
  friction: 0.05,
  warmupIterations: 0,
  gravityCenter: undefined,
  alphaMin: 0.001,
  alphaDecay: 1 - Math.pow(0.001, 1 / 400),
  alphaTarget: 0,
  randomizePositions: false,
};

export type GraphLinkData = {
  from: number;
  to: number;
};

export default class Graph<TNodeData> extends EventBus<{
  configChange: Partial<GraphConfig>;
  dataChange: void;
}> {
  nodes: GraphNode<TNodeData>[];
  links: GraphLink<TNodeData>[];
  config: GraphConfig;
  isGenerating: boolean;

  private isInit = false;
  private alpha: number;

  constructor(data: GraphData<TNodeData>, config: Partial<GraphConfig> = {}) {
    super();

    this.setData(data);
    this.config = Object.assign({}, DEFAULT_OPTIONS, config);
  }

  #init() {
    if (this.config.randomizePositions) {
      // Initialize the nodes in the center of the graph and give each of them an initial random velocity, to kick things off
      this.nodes.forEach(node => {
        node.position = [
          this.config.gravityCenter[0] + (Math.random() - 0.5) * 2,
          this.config.gravityCenter[1] + (Math.random() - 0.5) * 2,
        ];
      });
    } else {
      const angle = (Math.PI * 2) / this.nodes.length;
      this.nodes.forEach((node, i) => {
        node.position = [
          this.config.gravityCenter[0] + 10 * Math.cos(angle * i),
          this.config.gravityCenter[1] + 10 * Math.sin(angle * i),
        ];
      });
    }
    this.isInit = true;
  }

  setData({ nodes, links }: GraphData<TNodeData>) {
    const isDataChange = !!this.nodes;

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

    this.alpha = 1;
    this.isInit = false;

    if (isDataChange) {
      this.emit('dataChange', null);
    }
  }

  setConfigValue(key: keyof GraphConfig, value: GraphConfig[typeof key]) {
    if (this.config[key] !== value) {
      (this.config[key] as GraphConfig[typeof key]) = value;
      this.alpha = 1;
      this.emit('configChange', {
        [key]: value,
      });
    }
  }

  assignConfig(config: Partial<GraphConfig>) {
    this.config = Object.assign(this.config, config);
  }

  *generate(): Generator<number> {
    this.isGenerating = true;

    if (!this.isInit) {
      this.#init();
    }

    let totalEnergy = Infinity;
    let count = 0;
    this.alpha = 1;

    while (
      totalEnergy > this.config.minEnergy &&
      this.alpha >= this.config.alphaMin
    ) {
      totalEnergy = 0;

      this.updateForces();

      this.nodes.forEach(node => {
        node.updatePosition(this.alpha);
        if (node.energy > totalEnergy) {
          totalEnergy = node.energy;
        }
      });

      this.alpha +=
        (this.config.alphaTarget - this.alpha) * this.config.alphaDecay;

      if (count >= this.config.warmupIterations) {
        yield totalEnergy;
      }

      count++;
    }

    this.isGenerating = false;
  }

  private updateForces() {
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
