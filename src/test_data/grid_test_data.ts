import { createArray } from '../scripts/utils/array_utils';
import { GraphLinkData } from '../scripts/visualizations/graph/Graph.types';
import { TestNodeData } from './graph_test_data';

const gridSize = 20;
const total = gridSize ** 2;
const initPositions = false;
const width = 0.8;
const distance = width / (gridSize - 1);
const start = (1 - width) / 2;

const nodes: TestNodeData[] = createArray(total, id => ({
  id,
  ...(initPositions
    ? {
        x: start + distance * (id % gridSize),
        y: start + distance * (Math.ceil(id / gridSize) - 1),
      }
    : null),
}));
const links: GraphLinkData[] = [];

for (let i = 0; i < total; i++) {
  if ((i + 1) % gridSize) {
    links.push({ source: i, target: i + 1 });
  }
  if (i + gridSize < total) {
    links.push({ source: i, target: i + gridSize });
  }
}

const data = {
  nodes,
  links,
};

export default data;
