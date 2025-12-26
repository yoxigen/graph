/// <reference lib="webworker" />

import { WorkerGraphEvent, WorkerGraphInitEvent } from './Graph.types';
import Graph from './Graph.vis';

type WorkerGraphNodeData = { id: number };

let graph: Graph<WorkerGraphNodeData>;
self['isGraphWorker'] = true;

self.onmessage = (e: MessageEvent<WorkerGraphEvent>) => {
  switch (e.data.type) {
    case 'init':
      init(e.data);
      break;
    case 'setData':
      graph.setData({
        links: e.data.links,
        nodes: new Array(e.data.nodesCount),
      });
      break;
    case 'configChange':
      graph.assignConfig(e.data.config);
      break;
    case 'start':
      start();
      break;
    case 'setConfigValue':
      graph.setConfigValue(e.data.key, e.data.value);
      break;
  }
};

function init(e: WorkerGraphInitEvent) {
  if (graph) {
    throw new Error('Graph worker already initialized!');
  }

  graph = new Graph(
    e.dimensions,
    { ...e.config, allowWorker: false },
    {
      nodes: new Array(e.nodesCount),
      links: e.links,
    }
  );

  graph.on('tick', () => {
    this.postMessage({
      type: 'tick',
      positions: graph.positions.copy().buffer,
    });
  });
  console.log('GRAPH', graph);
}

function start() {
  graph.start();
}
