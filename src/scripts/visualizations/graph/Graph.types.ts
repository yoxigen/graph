import { ValueOrFunction } from '../../types/general.types';
import { Coordinates } from '../../types/position.types';

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
};

export type GraphMessageType = 'init' | 'config';
