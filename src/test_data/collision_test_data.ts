import { GraphLinkData } from '../scripts/visualizations/graph/Graph.types';
import { TestNodeData } from './graph_test_data';

const nodes: TestNodeData[] = [
  { id: 0, radius: 10 },
  { id: 1, radius: 20 },
];
const links: GraphLinkData[] = [];

const data = {
  nodes,
  links,
};

export default data;
