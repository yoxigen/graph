import Graph from './visualizations/graph/Graph.vis';
import GraphCanvas from './visualizations/graph/GraphCanvas';
import testData from '../test_data/graph_test_data';
import GraphNode from './visualizations/graph/GraphNode';
import { getHSLColors } from './color/hsl_color';
import EditorControls from './config/EditorControls';
import graphControls from './visualizations/graph/Graph.controls';
import { GraphConfig } from './visualizations/graph/Graph.types';
import dataControls from './config/DataControls';

window.addEventListener('load', main);

function main() {
  const rect = document.querySelector('#graph').getBoundingClientRect();
  const { data } = testData[0];

  const graph = new Graph(data, [rect.width, rect.height], {
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

  const controls = new EditorControls<GraphConfig>(graphControls, graph.config);
  controls.on('input', ({ control, value }) => {
    graph.setConfigValue(control.key, value);
    controls.config = graph.config;
  });

  dataControls.on('data', data => graph.setData(data));
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
