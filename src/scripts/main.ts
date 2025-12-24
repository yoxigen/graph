import Graph from './visualizations/graph/Graph.vis';
import GraphCanvas from './visualizations/graph/GraphCanvas';
import testData, { TestData } from '../test_data/graph_test_data';
import GraphNode from './visualizations/graph/GraphNode';
import { getHSLColors } from './color/hsl_color';
import EditorControls from './config/EditorControls';
import graphControls from './visualizations/graph/Graph.controls';
import { GraphConfig } from './visualizations/graph/Graph.types';
import dataControls from './config/DataControls';
import routing from './utils/routing';

window.addEventListener('load', main);

function main() {
  const rect = document.querySelector('#graph').getBoundingClientRect();
  const { data: routingData, config: routingConfig } = routing.state;
  let data: TestData;
  const graph = new Graph([rect.width, rect.height], routingConfig);

  routing.on('data', data => dataControls.setData(data));
  routing.on('config', config => {
    graph.assignConfig(config);
  });

  let groupsMap = new Map();

  const controls = new EditorControls<GraphConfig>(graphControls, graph.config);
  controls.on('input', ({ control, value }) => {
    graph.setConfigValue(control.key, value);
    controls.config = graph.config;
  });

  controls.on('change', ({ control, value }) => {
    routing.navigate({ config: graph.config });
  });

  dataControls.on('data', ({ id, data }) => {
    routing.navigate({ data: id, config: graph.config });
    graph.setData(data);

    groupsMap = new Map();
    data.nodes.forEach(node => {
      if (!groupsMap.has(node.group)) {
        groupsMap.set(node.group, groupsMap.size);
      }
    });
  });

  if (routingData) {
    dataControls.setData(routingData);
  } else {
    dataControls.setData(testData[0].id);
  }

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
    animate: true,
  });
  canvasGraph.render();

  document
    .querySelector('#reset_btn')
    .addEventListener('click', () => graph.reset());
}
