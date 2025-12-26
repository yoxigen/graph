import {
  Coordinates,
  Dimensions,
  Vector,
  WeightedCenter,
} from '../../types/position.types';
import CoordinatesList from '../../utils/CoordinatesList';
import EventBus from '../../utils/EventBus';
import { getDistanceBetweenCoordinates } from '../../utils/position_utils';
import QuadTree from '../../utils/QuadTree';
import GraphPositions from './Graph.positions';
import {
  GraphConfig,
  GraphData,
  GraphTickEvent,
  WorkerGraphInitEvent,
  WorkerGraphSetConfigValueEvent,
  WorkerGraphSetDataEvent,
} from './Graph.types';
import {
  getForceBetweenNodes,
  getGravityForce,
  getLinkForce,
} from './graph_utils';

export default class Graph<TNodeData> extends EventBus<{
  configChange: Partial<GraphConfig>;
  dataChange: GraphData<TNodeData>;
  reset: void;
  tick: void;
  start: void;
  stop: void;
}> {
  data: GraphData<TNodeData>;
  config: GraphConfig;
  isGenerating: boolean;
  positions: GraphPositions;
  velocities: CoordinatesList;

  private isInit = false;
  private alpha: number;
  quadTree: QuadTree;
  gravityCenter: Coordinates;
  private worker: Worker;

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
    minQuadSize: 3,
    theta: 1,
    useQuadtree: false,
    allowWorker: true,
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

  get nodesCount(): number {
    return this.data?.nodes.length ?? 0;
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
    this.emit('reset', null);
  }

  private initPositions() {
    this.positions = new GraphPositions({
      size: this.nodesCount,
      randomizeInitialPositions: this.config.randomizePositions,
      gravityCenter: this.gravityCenter,
    });
    this.velocities = new CoordinatesList(this.nodesCount);
    this.isInit = true;
  }

  setData(data: GraphData<TNodeData>) {
    this.data = data;

    this.alpha = 1;
    this.isInit = false;
    this.quadTree = null;
    this.worker?.postMessage({
      type: 'setData',
      links: data.links,
      nodesCount: data.nodes.length,
    } as WorkerGraphSetDataEvent);
    this.emit('dataChange', data);
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
        this.alpha = 1;
        this.worker?.postMessage({
          type: 'setConfigValue',
          key,
          value,
        } as WorkerGraphSetConfigValueEvent<typeof key>);
        this.emit('configChange', {
          [key]: value,
        });
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
      this.alpha = 1;
      this.emit('configChange', changedConfig);
    }
  }

  private initWorker() {
    if (!this.worker) {
      this.worker = new Worker(new URL('./Graph.worker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.postMessage({
        type: 'init',
        config: this.config,
        dimensions: this.size,
        links: this.data.links,
        nodesCount: this.nodesCount,
      } as WorkerGraphInitEvent);

      this.worker.onmessage = (e: MessageEvent<GraphTickEvent>) =>
        this.onWorkerMessage(e);
    }
  }

  private onWorkerMessage(e: MessageEvent<GraphTickEvent>) {
    if (e.data.type === 'tick') {
      this.positions = new GraphPositions(e.data.positions);
      this.emit('tick', null);
    }
  }

  start() {
    if (this.isGenerating) {
      return;
    }

    this.emit('start', null);
    if (this.config.allowWorker && !self['isGraphWorker']) {
      this.initWorker();
      this.worker.postMessage({ type: 'start' });
      return;
    }

    this.isGenerating = true;
    const allowWarmup = !this.isInit;

    if (!this.isInit) {
      this.initPositions();
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

      for (let nodeIndex = 0; nodeIndex < this.nodesCount; nodeIndex++) {
        const velocityX = this.velocities.getX(nodeIndex) * this.alpha;
        const velocityY = this.velocities.getY(nodeIndex) * this.alpha;

        this.velocities.set(nodeIndex, velocityX, velocityY);

        this.positions.set(
          nodeIndex,
          this.positions.getX(nodeIndex) + velocityX,
          this.positions.getY(nodeIndex) + velocityY
        );

        const nodeEnergy = Math.hypot(velocityX, velocityY);

        if (nodeEnergy > totalEnergy) {
          totalEnergy = nodeEnergy;
        }
      }

      this.alpha +=
        (this.config.alphaTarget - this.alpha) * this.config.alphaDecay;

      if (!allowWarmup || count >= this.config.warmupIterations) {
        this.emit('tick', null);
      }
      count++;
    }

    this.isGenerating = false;
    this.emit('stop', null);
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
      quadTree.width / getDistanceBetweenCoordinates(wc.center, p) <
      this.config.theta
    ) {
      // Long distance, use the weighed center
      yield wc;
    } else {
      // quadtree is near, get its inner forces
      if (quadTree.elements) {
        for (const el of quadTree.elements) {
          yield { center: el, weight: 1 };
        }
      } else {
        for (const child of quadTree.children.values()) {
          if (child.weight) {
            yield* this.generateForceCoordinates(p, child);
          }
        }
      }
    }
  }

  private addForce(nodeIndex: number, force: Vector) {
    if (!force) {
      return;
    }

    this.velocities.set(
      nodeIndex,
      this.velocities.getX(nodeIndex) + force[0],
      this.velocities.getY(nodeIndex) + force[1]
    );
  }

  private subtractForce(nodeIndex: number, force: Vector) {
    if (!force) {
      return;
    }

    this.velocities.set(
      nodeIndex,
      this.velocities.getX(nodeIndex) - force[0],
      this.velocities.getY(nodeIndex) - force[1]
    );
  }

  private updateForces() {
    let count = 0;

    if (this.config.useQuadtree) {
      this.quadTree = new QuadTree(this.size, this.positions);
    }

    // Nodes gravity and repulsion between each other:
    for (let i = 0; i < this.nodesCount; i++) {
      const nodePosition = this.positions.get(i);

      const gravityForce = getGravityForce(
        nodePosition,
        this.gravityCenter,
        this.config.gravityForce
      );
      this.addForce(i, gravityForce);
      if (this.config.useQuadtree) {
        const generateWeightedCenters = this.generateForceCoordinates(
          nodePosition,
          this.quadTree
        );
        for (const { center, weight } of generateWeightedCenters) {
          const force = getForceBetweenNodes(
            nodePosition,
            center,
            this.config.charge * weight,
            this.config.minDistance
          );
          this.addForce(i, force);
          count++;
        }
      } else {
        for (let j = i + 1; j < this.nodesCount; j++) {
          const force = getForceBetweenNodes(
            nodePosition,
            this.positions.get(j),
            this.config.charge,
            this.config.minDistance
          );
          this.addForce(i, force);
          this.subtractForce(j, force);
          count++;
        }
      }
    }

    // Links:
    this.data.links.forEach(link => {
      const force = getLinkForce(
        this.positions.get(link.source),
        this.positions.get(link.target),
        this.config.linkStrength,
        this.config.linkLength
      );
      this.addForce(link.source, force);
      this.subtractForce(link.target, force);
    });
  }
}
