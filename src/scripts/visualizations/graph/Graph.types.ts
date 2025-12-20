export type GraphRenderConfig = {
  nodeRadius: number;
  linkWidth: number;
  linkColor: string;
  warmupIterations: number;
  animate: boolean;
};

export const GRAPH_RENDER_CONFIG_DEFAULTS: GraphRenderConfig = {
  nodeRadius: 5,
  linkWidth: 1.5,
  linkColor: 'red',
  warmupIterations: 50,
  animate: true,
};
