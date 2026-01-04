import { createArray } from '../scripts/utils/array_utils';
import { GraphLinkData } from '../scripts/visualizations/graph/Graph.types';
import { TestNodeData } from './graph_test_data';

const count = 130;

const nodes: TestNodeData[] = createArray(count + 1, id => ({
  id,
  group: id ? 1 : 0,
}));
const links: GraphLinkData[] = createArray(count, i => ({
  source: 0,
  target: i + 1,
}));

const data = {
  nodes,
  links,
};

export default data;
