import GraphNode from './GraphNode';

export type GraphLink<TNodeData = Object> = {
  source: GraphNode<TNodeData>;
  target: GraphNode;
};
