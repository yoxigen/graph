import { Coordinates, Dimensions } from '../../types/position.types';

export type GraphRenderConfig<TNodeData = Object> = {
  nodeRadius: number;
  linkWidth: number;
  linkColor: string;
  warmupIterations: number;
  animate: boolean;
  nodeColor?: string;
  nodeColorDimension?: keyof TNodeData;
};

export const GRAPH_RENDER_CONFIG_DEFAULTS: GraphRenderConfig = {
  nodeRadius: 4,
  linkWidth: 1,
  linkColor: '#a9a9a9',
  warmupIterations: 50,
  animate: true,
  nodeColor: 'black',
  nodeColorDimension: null,
};

export type GraphLinkData = {
  source: number;
  target: number;
};

export type GraphData<TNodeData = Object> = {
  nodes: TNodeData[];
  links?: GraphLinkData[];
};

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
  randomizePositions: boolean;
  useQuadtree: boolean;
  theta: number;
  minQuadSize: number;
  allowWorker: boolean;
  animate: boolean;
  isTree: boolean;
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
