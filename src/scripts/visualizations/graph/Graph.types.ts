import { Coordinates, Dimensions } from '../../types/position.types';
import { GraphLink } from './GraphLink';
import { GraphLinksConfig } from './GraphLinks';

export type GraphRenderConfig<TNodeData = Object> = {
  nodeRadius: number;
  linkWidth: number;
  linkColor: string;
  warmupIterations: number;
  nodeColor?: string;
  nodeColorDimension?: keyof TNodeData;
  fixNodesOnDrag: boolean;
};

export const GRAPH_RENDER_CONFIG_DEFAULTS: GraphRenderConfig = {
  nodeRadius: 4,
  linkWidth: 0.5,
  linkColor: '#999999',
  warmupIterations: 50,
  nodeColor: 'black',
  nodeColorDimension: null,
  fixNodesOnDrag: true,
};

export type GraphLinkData = {
  source: number;
  target: number;
};

export type GraphNodeData<TData> = TData & {
  /**
   * Optional initial X position for the node
   */
  x?: number;

  /**
   * Optional initial Y position for the node
   */
  y?: number;
};

export type GraphData<
  TNodeData,
  TLinkData = Object,
  TNode = GraphNodeData<TNodeData>,
  TLink = TLinkData & GraphLinkData
> = {
  nodes: TNode[];
  links?: TLink[];
};

export type GraphConfig = GraphLinksConfig & {
  charge: number;
  gravityForce: number;
  gravityCenter: Coordinates;
  minDistance: number;
  minEnergy: number;
  friction: number;
  warmupIterations: number;
  alphaDecay: number;
  alphaMin: number;
  randomizePositions: boolean;
  useQuadtree: boolean;
  theta: number;
  minQuadSize: number;
  allowWorker: boolean;
  animate: boolean;
};

export type GraphMessageType = 'init' | 'config';

export type WorkerGraphSetConfigValueEvent<TKey extends keyof GraphConfig> = {
  type: 'setConfigValue';
  key: TKey;
  value: GraphConfig[TKey];
};

export type WorkerGraphInitEvent<TNodeData extends Object> = {
  type: 'init';
  links: GraphLinkData[];
  nodes: TNodeData[];
  dimensions: Dimensions;
  config: GraphConfig;
};

export type WorkerGraphSetDataEvent<TNodeData extends Object> = {
  type: 'setData';
  links: GraphLinkData[];
  nodes: TNodeData[];
};

export type WorkerGraphConfigChangeEvent = {
  type: 'configChange';
  config: Partial<GraphConfig>;
};

export type WorkerGraphStartEvent = {
  type: 'start';
};

export type WorkerGraphResetEvent = {
  type: 'reset';
};

export type WorkerGraphFixNodePositionEvent = {
  type: 'fixNodePosition';
  nodeIndex: number;
  x: number;
  y: number;
};

export type WorkerGraphUnfixNodePositionEvent = {
  type: 'unfixNodePosition';
  nodeIndex: number;
};

export type WorkerGraphUnfixAllNodePositionsEvent = {
  type: 'unfixAllNodePositions';
};

export type WorkerGraphEvent<TNodeData extends Object> =
  | WorkerGraphInitEvent<TNodeData>
  | WorkerGraphConfigChangeEvent
  | WorkerGraphSetConfigValueEvent<any>
  | WorkerGraphSetDataEvent<TNodeData>
  | WorkerGraphStartEvent
  | WorkerGraphResetEvent
  | WorkerGraphFixNodePositionEvent
  | WorkerGraphUnfixNodePositionEvent
  | WorkerGraphUnfixAllNodePositionsEvent;

export type GraphTickEvent = {
  type: 'tick';
  positions: ArrayBuffer;
};

export type GraphEndEvent = {
  type: 'end';
};

export type MessageEventFromWorker = GraphTickEvent | GraphEndEvent;
