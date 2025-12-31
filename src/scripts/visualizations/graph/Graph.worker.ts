/// <reference lib="webworker" />

import { TestNodeData } from '../../../test_data/graph_test_data';
import { WorkerGraphEvent, WorkerGraphInitEvent } from './Graph.types';
import Graph from './Graph.vis';
import 'scheduler-polyfill';

type WorkerGraphNodeData = { id: number };

let graph: Graph<TestNodeData>;
let tickTimeout;
let taskController: TaskController;

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
        nodes: e.data.nodes,
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
      console.log('config value');
      clearTimeout(tickTimeout);
      graph.setConfigValue(e.data.key, e.data.value);
      // if (!graph.isGenerating) {
      render();
      // }
      break;
    case 'reset':
      clearTimeout(tickTimeout);
      graph.reset();
      break;
    case 'fixNodePosition':
      graph.fixNodePosition(e.data.nodeIndex, e.data.x, e.data.y);
      // if (!graph.isGenerating) {
      render();
      // }
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

function init(e: WorkerGraphInitEvent<TestNodeData>) {
  if (graph) {
    throw new Error('Graph worker already initialized!');
  }

  graph = new Graph<TestNodeData>(
    e.dimensions,
    { ...e.config, allowWorker: false },
    {
      nodes: e.nodes,
      links: e.links,
    }
  );

  graph.on('stop', () => {
    notifyTick();
  });
}

let currentRenderId: number;
let lastRenderId = 0;
let raf: number;
const frameRate = 1000 / 120;

function render() {
  if (taskController && !taskController.signal.aborted) {
    taskController.abort('Redraw');
  }

  const generator = graph.generate();

  const renderId = lastRenderId++;
  currentRenderId = renderId;
  cancelAnimationFrame(raf);

  const animate = graph.config.animate;
  taskController = new TaskController({ priority: 'background' });
  if (animate) {
    let lastTick: number;

    const step = () => {
      scheduler
        .postTask(
          () => {
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
          },
          {
            signal: taskController.signal,
          }
        )
        .catch(reason => {
          console.log('ABORTED ANIMATION!');
        });
    };

    step();
  } else {
    const start = performance.now();

    scheduler
      .postTask(
        () => {
          while (!generator.next().done) {
            console.log('TICK');
          }
          notifyTick();
          notifyEnd();
          console.log('TIME', performance.now() - start);
        },
        {
          signal: taskController.signal,
        }
      )
      .catch(reason => {
        console.log('ABORTED!');
      });
  }
}
