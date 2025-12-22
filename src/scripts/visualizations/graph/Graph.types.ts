import { ID, ValueOrFunction } from '../../types/general.types';
import { GraphLinkData } from './Graph.vis';
import { GraphLink } from './GraphLink';
import GraphNode from './GraphNode';

export type GraphRenderConfig<TNodeData = Object> = {
  nodeRadius: number;
  linkWidth: number;
  linkColor: string;
  warmupIterations: number;
  animate: boolean;
  nodeColor: ValueOrFunction<string, GraphNode<TNodeData>>;
};

export const GRAPH_RENDER_CONFIG_DEFAULTS: GraphRenderConfig = {
  nodeRadius: 5,
  linkWidth: 1.5,
  linkColor: 'red',
  warmupIterations: 50,
  animate: true,
  nodeColor: 'black',
};

export type GraphData<TNodeData = Object> = {
  nodes: TNodeData[];
  links?: GraphLinkData[];
};
