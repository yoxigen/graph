import {
  Coordinates,
  Dimensions,
  WeightedCenter,
} from '../../types/position.types';
import EventBus from '../../utils/EventBus';
import {
  getDistanceBetweenCoordinates,
  mapCoordinates,
} from '../../utils/position_utils';
import QuadTree from '../../utils/QuadTree';
import { GraphConfig, GraphData } from './Graph.types';
import {
  getForceBetweenNodes,
  getGravityForce,
  getLinkForce,
} from './graph_utils';
import type { GraphLink } from './GraphLink';
import GraphNode from './GraphNode';

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
  quadTree: QuadTree;
  gravityCenter: Coordinates;

  static defaultConfig: GraphConfig = {
    charge: 500,
    gravityForce: 0.01,
    minDistance: 12, // Prevents "infinite" force when nodes overlap
    minEnergy: 0.2,
    linkStrength: 0.1,
    linkLength: 20,
    friction: 0.05,
    warmupIterations: 0,
    gravityCenter: [0.5, 0.5],
    alphaMin: 0.001,
    alphaDecay: 0.017,
    alphaTarget: 0,
    randomizePositions: false,
    theta: 1,
    useQuadtree: false,
  };

  constructor(
    public size: Dimensions,
    config: Partial<GraphConfig> = {},
    data?: GraphData<TNodeData>
  ) {
    super();

    this.config = Object.assign({}, Graph.defaultConfig, config);
    this.#setGravityCenter();
    if (data) {
      this.setData(data);
    }
  }

  #setGravityCenter() {
    this.gravityCenter = [
      this.size[0] * this.config.gravityCenter[0],
      this.size[1] * this.config.gravityCenter[1],
    ];
  }

  reset() {
    this.alpha = 1;
    this.isInit = false;
    this.quadTree = null;
    this.emit('dataChange', null);
  }

  #init() {
    if (this.config.randomizePositions) {
      // Initialize the nodes in the center of the graph and give each of them an initial random velocity, to kick things off
      this.nodes.forEach(node => {
        node.position = [
          this.gravityCenter[0] + (Math.random() - 0.5) * 10,
          this.gravityCenter[1] + (Math.random() - 0.5) * 10,
        ];
      });
    } else {
      const angle = (Math.PI * 2) / this.nodes.length;
      this.nodes.forEach((node, i) => {
        node.position = [
          this.gravityCenter[0] + 50 * Math.cos(angle * i),
          this.gravityCenter[1] + 50 * Math.sin(angle * i),
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
    this.quadTree = null;

    if (isDataChange) {
      this.emit('dataChange', null);
    }
  }

  setConfigValue(
    key: keyof GraphConfig,
    value: GraphConfig[typeof key],
    notifyChange = true
  ): boolean {
    if (this.config[key] !== value) {
      (this.config[key] as GraphConfig[typeof key]) = value;
      if (key === 'gravityCenter') {
        this.#setGravityCenter();
      }

      if (notifyChange) {
        this.alpha = 0;
        this.isGenerating = false;
        this.emit('configChange', {
          [key]: value,
        });
        this.alpha = 1;
      }

      return true;
    }

    return false;
  }

  assignConfig(config: Partial<GraphConfig>) {
    let changed = false;
    const changedConfig: Partial<GraphConfig> = {};

    for (const key in config) {
      const valueChanged = this.setConfigValue(
        key as keyof GraphConfig,
        config[key],
        false
      );
      changed = changed || valueChanged;
      if (valueChanged) {
        changedConfig[key] = config[key];
      }
    }

    if (changed) {
      this.isGenerating = false;
      this.emit('configChange', changedConfig);
      this.alpha = 1;
    }
  }

  *generate(): Generator<number> {
    this.isGenerating = true;
    const allowWarmup = !this.isInit;

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

      if (!allowWarmup || count >= this.config.warmupIterations) {
        yield totalEnergy;
      }
      count++;
    }

    console.log('TICKS', count);
    this.isGenerating = false;
  }

  /**
   * Get the weighted positions of forces, relative to the given position p
   * @param p
   * @param quadTree
   */
  private *generateForceCoordinates(
    p: Coordinates,
    quadTree: QuadTree
  ): Generator<WeightedCenter> {
    const wc = quadTree.getWeightedCenter();
    if (
      quadTree.dimensions[0] / getDistanceBetweenCoordinates(wc.center, p) <
      this.config.theta
    ) {
      // Long distance, use the weighed center
      yield wc;
    } else {
      // quadtree is near, get its inner forces
      if (quadTree.elements) {
        for (const el of quadTree.elements) {
          yield { center: el.position, weight: 1 };
        }
      } else {
        for (const child of quadTree.children) {
          if (child.weight) {
            yield* this.generateForceCoordinates(p, child);
          }
        }
      }
    }
  }

  private updateForces() {
    let count = 0;
    let complexity = 0;

    if (this.config.useQuadtree) {
      this.quadTree = new QuadTree(this.size, this.nodes);
    }

    // Nodes gravity and repulsion between each other:
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const gravityForce = getGravityForce(
        node,
        this.gravityCenter,
        this.config.gravityForce
      );
      node.addForce(gravityForce);

      if (this.config.useQuadtree) {
        const generateWeightedCenters = this.generateForceCoordinates(
          node.position,
          this.quadTree
        );
        for (const { center, weight } of generateWeightedCenters) {
          complexity++;
          const force = getForceBetweenNodes(
            node,
            { position: center },
            this.config.charge * weight,
            this.config.minDistance
          );
          node.addForce(force);
          count++;
        }
      } else {
        for (let j = i + 1; j < this.nodes.length; j++) {
          complexity++;
          const otherNode = this.nodes[j];

          const force = getForceBetweenNodes(
            node,
            otherNode,
            this.config.charge,
            this.config.minDistance
          );
          node.addForce(force);
          otherNode.subtractForce(force);
          count++;
        }
      }
    }

    console.log('complexity', complexity);
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
