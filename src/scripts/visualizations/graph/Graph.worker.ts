/// <reference lib="webworker" />

import { Dimensions } from '../../types/position.types';
import { createArray } from '../../utils/array_utils';
import { GraphConfig, GraphMessageType } from './Graph.types';
import Graph from './Graph.vis';

export type WorkerGraphOptions = {
  links: ArrayBuffer;
  nodesCount: number;
  dimensions: Dimensions;
  config: GraphConfig;
};

export type WorkerGraphEvent = {
  type: 'init';
  options: WorkerGraphOptions;
};

type WorkerGraphNodeData = { id: number };

let graph: Graph<WorkerGraphNodeData>;

self.onmessage = (e: MessageEvent<WorkerGraphEvent>) => {
  switch (e.data.type) {
    case 'init':
      init(e.data.options);
      break;
    default:
      throw new Error(`Invalid message type, "${e.data.type}!"`);
  }
};

function init(options: WorkerGraphOptions) {
  const nodes = createArray(options.nodesCount, id => ({
    id,
  }));

  graph = new Graph(options.dimensions, options.config, { nodes, links: [] });
  console.log('GRAPH', graph);
}
