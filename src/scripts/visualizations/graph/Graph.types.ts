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
  alphaTarget: number;
  randomizePositions: boolean;
  useQuadtree: boolean;
  theta: number;
  minQuadSize: number;
  allowWorker: boolean;
};

export type GraphMessageType = 'init' | 'config';

export type WorkerGraphSetConfigValueEvent<TKey extends keyof GraphConfig> = {
  type: 'setConfigValue';
  key: TKey;
  value: GraphConfig[TKey];
};

export type WorkerGraphInitEvent = {
  type: 'init';
  links: GraphLinkData[];
  nodesCount: number;
  dimensions: Dimensions;
  config: GraphConfig;
};

export type WorkerGraphSetDataEvent = {
  type: 'setData';
  links: GraphLinkData[];
  nodesCount: number;
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

export type WorkerGraphEvent =
  | WorkerGraphInitEvent
  | WorkerGraphConfigChangeEvent
  | WorkerGraphSetConfigValueEvent<any>
  | WorkerGraphSetDataEvent
  | WorkerGraphStartEvent
  | WorkerGraphResetEvent;

export type GraphTickEvent = {
  type: 'tick';
  positions: ArrayBuffer;
};

export type GraphEndEvent = {
  type: 'end';
};

export type MessageEventFromWorker = GraphTickEvent | GraphEndEvent;
