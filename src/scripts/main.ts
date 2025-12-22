import { ID } from './types/general.types';
import Graph, { GraphLinkData } from './visualizations/graph/Graph.vis';
import GraphCanvas from './visualizations/graph/GraphCanvas';
import testData from '../test_data/graph_test_data';
import GraphNode from './visualizations/graph/GraphNode';
import { getHSLColors } from './color/hsl_color';
import controls from './controls/Controls';

window.addEventListener('load', main);

function main() {
  const rect = document.querySelector('#graph').getBoundingClientRect();
  const { data } = testData[0];

  const graph = new Graph(data, {
    gravityCenter: [rect.width / 2, rect.height / 2],
    gravityForce: 0.05,
    charge: 800,
    randomizePositions: true,
    linkLength: 15,
    // warmupIterations: 150,
  });

  const groupsMap = new Map();
  data.nodes.forEach(node => {
    if (!groupsMap.has(node.group)) {
      groupsMap.set(node.group, groupsMap.size);
    }
  });

  controls.setValues(graph.config);
  controls.on('input', ({ control, value }) =>
    graph.setConfigValue(control, value)
  );

  controls.on('data', data => graph.setData(data));
  const colors = getHSLColors({
    count: groupsMap.size,
    hueStart: 190,
    lightness: 0.45,
  });

  const canvasGraph = new GraphCanvas(graph, document.querySelector('#graph'), {
    linkColor: '#a9a9a9',
    linkWidth: 1,
    nodeRadius: 4,
    nodeColor: (node: GraphNode<typeof data.nodes[number]>) =>
      colors[groupsMap.get(node.data.group)],
    animate: false,
  });
  canvasGraph.render();
}
