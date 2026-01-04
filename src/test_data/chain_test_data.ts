import { createArray } from '../scripts/utils/array_utils';
import { GraphLinkData } from '../scripts/visualizations/graph/Graph.types';
import { TestNodeData } from './graph_test_data';

const count = 100;

const nodes: TestNodeData[] = createArray(count, id => ({
  id,
}));
const links: GraphLinkData[] = createArray(count, i => ({
  source: i,
  target: (i + 1) % count,
}));

const data = {
  nodes,
  links,
};

export default data;
