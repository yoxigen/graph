/// <reference lib="webworker" />

import { WorkerGraphEvent, WorkerGraphInitEvent } from './Graph.types';
import Graph from './Graph.vis';

type WorkerGraphNodeData = { id: number };

let graph: Graph<WorkerGraphNodeData>;
let tickTimeout;

self['isGraphWorker'] = true;

self.onmessage = (e: MessageEvent<WorkerGraphEvent>) => {
  switch (e.data.type) {
    case 'init':
      init(e.data);
      break;
    case 'setData':
      clearTimeout(tickTimeout);
      graph.setData({
        links: e.data.links,
        nodes: new Array(e.data.nodesCount),
      });
      if (!graph.isGenerating) {
        render();
      }
      break;
    case 'configChange':
      clearTimeout(tickTimeout);
      graph.assignConfig(e.data.config);
      if (!graph.isGenerating) {
        render();
      }
      break;
    case 'start':
      render();
      break;
    case 'setConfigValue':
      clearTimeout(tickTimeout);
      graph.setConfigValue(e.data.key, e.data.value);
      if (!graph.isGenerating) {
        render();
      }
      break;
    case 'reset':
      clearTimeout(tickTimeout);
      graph.reset();
      break;
    case 'fixNodePosition':
      graph.fixNodePosition(e.data.nodeIndex, e.data.x, e.data.y);
      if (!graph.isGenerating) {
        render();
      }
      break;
    case 'unfixNodePosition':
      graph.unfixNodePosition(e.data.nodeIndex);
      if (!graph.isGenerating) {
        render();
      }
      break;
  }
};

function notifyTick() {
  this.postMessage({
    type: 'tick',
    positions: graph.positions.buffer,
  });
}

function notifyEnd() {
  this.postMessage({
    type: 'end',
  });
}

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

  graph.on('stop', () => {
    notifyTick();
  });
  console.log('GRAPH', graph);
}

let currentRenderId: number;
let lastRenderId = 0;
let raf: number;
const frameRate = 1000 / 120;

function render() {
  const generator = graph.generate();

  const renderId = lastRenderId++;
  currentRenderId = renderId;
  cancelAnimationFrame(raf);

  const animate = true;
  if (animate) {
    let lastTick: number;

    const step = () => {
      if (renderId !== currentRenderId) {
        // Not in the current render loop, exit
        return;
      }
      const result = generator.next();
      const now = performance.now();
      if (!lastTick || now - lastTick >= frameRate) {
        notifyTick();
      } else {
        console.log('NOT NOTIFYING');
      }
      lastTick = now;

      if (!result.done) {
        tickTimeout = setTimeout(step, frameRate);
      } else {
        notifyEnd();
        currentRenderId = null;
        raf = null;
      }
    };

    step();
  } else {
    const start = performance.now();

    while (!generator.next().done);
    notifyTick();
    notifyEnd();
    console.log('TIME', performance.now() - start);
  }
}
