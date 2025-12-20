import CanvasRenderer from './renderers/CanvasRenderer';
import { ID } from './types/general.types';
import { createArray } from './utils/array_utils';
import Graph from './visualizations/graph/Graph.vis';

interface NodeData {
  id: ID;
  color: string;
  name: string;
}

window.addEventListener('load', main);

function main() {
  const data: NodeData[] = createArray(23, id => ({
    id,
    color: 'blue',
    name: id.toString(),
  }));

  const renderer = new CanvasRenderer(document.querySelector('#graph'), {
    layers: ['links', 'nodes'],
  });

  const graph = new Graph({
    nodes: data,
    links: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 10 },
      { from: 0, to: 11 },
      { from: 0, to: 3 },
      { from: 1, to: 2 },
      { from: 1, to: 9 },
      { from: 4, to: 5 },
      { from: 8, to: 7 },
      { from: 8, to: 13 },
      { from: 8, to: 22 },
      { from: 8, to: 15 },
    ],
  });

  graph.render(renderer);
}
