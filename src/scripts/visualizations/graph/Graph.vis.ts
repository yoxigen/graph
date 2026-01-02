import {
  Coordinates,
  Dimensions,
  Vector,
  WeightedCenter,
} from '../../types/position.types';
import CoordinatesList from '../../utils/CoordinatesList';
import { getDistanceBetweenCoordinates } from '../../utils/position_utils';
import QuadTree from '../../utils/QuadTree';
import DataProvider from '../DataProvider';
import Visualization from '../Visualization';
import GraphPositions from './Graph.positions';
import {
  GraphConfig,
  GraphData,
  MessageEventFromWorker,
  WorkerGraphInitEvent,
  WorkerGraphSetConfigValueEvent,
  WorkerGraphSetDataEvent,
  WorkerGraphFixNodePositionEvent,
} from './Graph.types';
import {
  getForceBetweenNodes,
  getGravityForce,
  getLinkForce,
} from './graph_utils';
import GraphDataProvider from './GraphDataProvider';
import GraphLinks from './GraphLinks';

export default class Graph<
  TNodeData extends Object,
  TLinkData
> extends Visualization<
  GraphData<TNodeData>,
  {
    configChange: Partial<GraphConfig>;
    dataChange: GraphData<TNodeData>;
    reset: void;
    tick: void;
    start: void;
    stop: void;
  }
> {
  config: GraphConfig;
  isGenerating: boolean;
  positions: GraphPositions;
  velocities: CoordinatesList;

  private links: GraphLinks<TLinkData>;

  /**
   * Keys are node indexes
   */
  fixedPositions: Map<number, Coordinates> = new Map();

  private isInit = false;
  private alpha: number;
  quadTree: QuadTree;
  gravityCenter: Coordinates;
  private worker: Worker;
  private isWorker = false;

  static defaultConfig: GraphConfig = {
    charge: 500,
    gravityForce: 0.01,
    minDistance: 12, // Prevents "infinite" force when nodes overlap
    minEnergy: 0.2,
    linkStrength: 0.1,
    linkLength: 20,
    friction: 0.4,
    warmupIterations: 0,
    gravityCenter: [0.5, 0.5],
    alphaMin: 0,
    alphaDecay: 0.017,
    randomizePositions: false,
    minQuadSize: 3,
    theta: 1,
    useQuadtree: false,
    allowWorker: true,
    animate: true,
  };

  constructor(
    public size: Dimensions,
    config: Partial<GraphConfig> = {},
    data?:
      | GraphDataProvider<TNodeData, TLinkData>
      | GraphData<TNodeData, TLinkData>
  ) {
    super(data instanceof DataProvider ? data : new DataProvider(data));

    this.config = Object.assign({}, Graph.defaultConfig, config);
    this.#setGravityCenter();
    this.dataProvider.on('change', data => this.onDataChange(data));
    // this.dataProvider.on('add', e => {
    //   console.log('ADD', e);
    //   this.data.nodes.push(...e);
    //   this.onDataChange(this.data);
    // });
    this.isWorker = self['isGraphWorker'];
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
    this.fixedPositions = new Map();
    this.quadTree = null;
    this.worker?.postMessage({ type: 'reset' });
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

  private onDataChange(data: GraphData<TNodeData, TLinkData>) {
    this.links = new GraphLinks<TLinkData>(data.links, {
      linkLength: this.config.linkLength,
      linkStrength: this.config.linkStrength,
    });
    this.alpha = 1;
    this.isInit = false;
    this.quadTree = null;
    this.worker?.postMessage({
      type: 'setData',
      links: data.links,
      nodes: data.nodes,
    } as WorkerGraphSetDataEvent<TNodeData>);

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

  selectNodeAt(x: number, y: number): { index: number; data: TNodeData } {
    this.createQuadTree();
    const nodeIndex = this.quadTree.findElementAt(x, y, 10)?.id;
    if (nodeIndex != null) {
      return { data: this.data.nodes[nodeIndex], index: nodeIndex };
    }
  }

  fixNodePosition(nodeIndex: number, x: number, y: number) {
    if (this.worker) {
      this.worker.postMessage({
        type: 'fixNodePosition',
        nodeIndex,
        x,
        y,
      } as WorkerGraphFixNodePositionEvent);
    } else {
      this.fixedPositions.set(nodeIndex, [x, y]);
      this.positions.set(nodeIndex, x, y);
      this.velocities.set(nodeIndex, 0, 0);
      this.alpha = 1;
    }
  }

  unfixAllNodePositions() {
    if (this.worker) {
      this.worker.postMessage({
        type: 'unfixAllNodePositions',
      });
    } else {
      this.fixedPositions.clear();
      this.alpha = 1;
    }
  }

  unfixNodePosition(nodeIndex: number) {
    if (this.worker) {
      this.worker.postMessage({
        type: 'unfixNodePosition',
        nodeIndex,
      });
    } else {
      this.fixedPositions.delete(nodeIndex);
      this.alpha = 1;
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
        nodes: this.data.nodes,
      } as WorkerGraphInitEvent<TNodeData>);

      this.worker.onmessage = (e: MessageEvent<MessageEventFromWorker>) =>
        this.onWorkerMessage(e);
    }
  }

  private onWorkerMessage(e: MessageEvent<MessageEventFromWorker>) {
    switch (e.data.type) {
      case 'tick':
        this.positions = new GraphPositions(e.data.positions);
        this.emit('tick', null);
        break;
      case 'end':
        console.log('END-------');
        this.isGenerating = false;
        break;
    }
  }

  start() {
    if (!this.isWorker && !this.isGenerating) {
      //this.isGenerating = true;
      this.initWorker();
      console.log('start---');
      this.worker.postMessage({ type: 'start' });
    }
  }

  *generate(): Generator<number> {
    this.emit('start', null);
    this.isGenerating = true;
    if (!this.isWorker) {
      this.initWorker();
      this.worker.postMessage({ type: 'start' });
      return;
    }

    const velocityDecay = 1 - this.config.friction;
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
        const velocityX =
          this.velocities.getX(nodeIndex) * this.alpha * velocityDecay;
        const velocityY =
          this.velocities.getY(nodeIndex) * this.alpha * velocityDecay;

        this.velocities.set(nodeIndex, velocityX, velocityY);
        if (!this.fixedPositions.has(nodeIndex)) {
          this.positions.addVector(nodeIndex, velocityX, velocityY);

          const nodeEnergy = Math.hypot(velocityX, velocityY);

          if (nodeEnergy > totalEnergy) {
            totalEnergy = nodeEnergy;
          }
        }
      }

      this.alpha +=
        (this.config.alphaMin - this.alpha) * this.config.alphaDecay;

      if (!allowWarmup || count >= this.config.warmupIterations) {
        this.emit('tick', null);
        yield totalEnergy;
      }
      count++;
    }

    this.isGenerating = false;
    this.velocities.fill(0);
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
          yield { center: el.coordinates, weight: 1 };
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

    this.velocities.addVector(nodeIndex, ...force);
  }

  private subtractForce(nodeIndex: number, force: Vector) {
    if (!force) {
      return;
    }

    this.velocities.subtractVector(nodeIndex, ...force);
  }

  private createQuadTree() {
    this.quadTree = new QuadTree(Math.max(...this.size), this.positions, {
      minChildWidth: this.config.minQuadSize,
    });
  }

  private updateForces() {
    let count = 0;

    if (this.config.useQuadtree) {
      this.createQuadTree();
    }

    // Nodes gravity and repulsion between each other:
    for (let i = 0; i < this.nodesCount; i++) {
      const isFixed = this.fixedPositions.has(i);
      const nodePosition = this.positions.get(i);

      if (!isFixed) {
        const gravityForce = getGravityForce(
          nodePosition,
          this.gravityCenter,
          this.config.gravityForce
        );
        this.addForce(i, gravityForce);
      }
      if (this.config.useQuadtree) {
        if (!isFixed) {
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
        }
      } else {
        for (let j = i + 1; j < this.nodesCount; j++) {
          const force = getForceBetweenNodes(
            nodePosition,
            this.positions.get(j),
            this.config.charge,
            this.config.minDistance
          );
          if (!isFixed) {
            this.addForce(i, force);
          }
          if (!this.fixedPositions.has(j)) {
            this.subtractForce(j, force);
          }
          count++;
        }
      }
    }

    const linksGen = this.links.getForceBetweenLinks(this.positions);
    for (const { sourceForce, targetForce, source, target } of linksGen) {
      if (!this.fixedPositions.has(source)) {
        this.addForce(source, sourceForce);
      }
      if (!this.fixedPositions.has(target)) {
        this.subtractForce(target, targetForce);
      }
    }
    // Links:
    // this.data.links.forEach(link => {
    //   const force = getLinkForce(
    //     this.positions.get(link.source),
    //     this.positions.get(link.target),
    //     this.config.linkStrength,
    //     this.config.linkLength
    //   );
    //   if (!this.fixedPositions.has(link.source)) {
    //     this.addForce(link.source, force);
    //   }
    //   if (!this.fixedPositions.has(link.target)) {
    //     this.subtractForce(link.target, force);
    //   }
    // });
  }
}
