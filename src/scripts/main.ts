import { ID } from './types/general.types';
import { createArray } from './utils/array_utils';
import Graph from './visualizations/graph/Graph.vis';
import GraphCanvas from './visualizations/graph/GraphCanvas';
import miserables from '../test_data/miserables.json';

interface NodeData {
  id: ID;
  color: string;
  name: string;
}

window.addEventListener('load', main);

function main() {
  const data: NodeData[] = createArray(300, id => ({
    id,
    color: 'blue',
    name: id.toString(),
  }));

  const rect = document.querySelector('#graph').getBoundingClientRect();

  const nodeIndexes = new Map<string, number>();
  miserables.nodes.forEach(({ id }, i) => nodeIndexes.set(id, i));

  const graph = new Graph(
    {
      nodes: miserables.nodes,
      links: miserables.links.map(link => ({
        from: nodeIndexes.get(link.source),
        to: nodeIndexes.get(link.target),
      })),
    },
    {
      gravityCenter: [rect.width / 2, rect.height / 2],
      gravityForce: 0.001,
      charge: 800,
      // warmupIterations: 20,
    }
  );

  const canvasGraph = new GraphCanvas(graph, document.querySelector('#graph'), {
    linkColor: '#a9a9a9',
    linkWidth: 1,
    nodeRadius: 4,
  });
  canvasGraph.render();
}
