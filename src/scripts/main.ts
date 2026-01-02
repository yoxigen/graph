import Graph from './visualizations/graph/Graph.vis';
import GraphCanvas from './visualizations/graph/GraphCanvas';
import testData, { TestNodeData } from '../test_data/graph_test_data';
import './components/components';
import EditorControls from './config/EditorControls';
import graphControls from './visualizations/graph/Graph.controls';
import {
  GraphConfig,
  GraphRenderConfig,
} from './visualizations/graph/Graph.types';
import dataControls from './config/DataControls';
import routing from './utils/routing';
import graphRenderControls from './visualizations/graph/GraphCanvas.controls';
import GraphDataProvider from './visualizations/graph/GraphDataProvider';

window.addEventListener('load', main);

function main() {
  const rect = document.querySelector('#graph').getBoundingClientRect();
  const dataProvider = new GraphDataProvider<TestNodeData>({
    nodes: [],
    links: [],
  });

  const { data: routingData, config: routingConfig } = routing.state;
  const graph = new Graph<TestNodeData>(
    [rect.width, rect.height],
    routingConfig,
    dataProvider
  );

  const canvasGraph = new GraphCanvas<TestNodeData>(
    graph,
    document.querySelector('#graph'),
    {
      nodeColorDimension: 'group',
    }
  );

  canvasGraph.on('click', e => {
    dataProvider.add({
      x: e.x,
      y: e.y,
      id: +new Date(),
    });
  });

  routing.on('data', data => dataControls.setData(data));
  routing.on('config', config => {
    graph.assignConfig(config);
  });

  initConfigControls();

  document
    .querySelector('#reset_btn')
    .addEventListener('click', () => graph.reset());

  document
    .querySelector('#unfix_btn')
    .addEventListener('click', () => graph.unfixAllNodePositions());

  function initConfigControls() {
    const controls = new EditorControls<GraphConfig>(
      document.querySelector('#graph_controls'),
      graphControls,
      graph.config
    );

    const renderControls = new EditorControls<GraphRenderConfig<TestNodeData>>(
      document.querySelector('#render_controls'),
      graphRenderControls,
      canvasGraph.config
    );

    controls.on('input', ({ control, value }) => {
      graph.setConfigValue(control.key, value);
      controls.config = graph.config;
    });

    controls.on('change', () => {
      routing.navigate({ config: graph.config });
    });

    renderControls.on('input', ({ control, value }) => {
      canvasGraph.setConfigValue(control.key, value);
      renderControls.config = canvasGraph.config;
    });

    dataControls.on('data', ({ id, data }) => {
      routing.navigate({ data: id, config: graph.config });
      dataProvider.setData(data);
    });

    if (routingData) {
      dataControls.setData(routingData);
    } else {
      dataControls.setData(testData[0].id);
    }
  }
}
