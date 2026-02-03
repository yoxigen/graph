import { createArray } from '../scripts/utils/array_utils';
import { GraphLinkData } from '../scripts/visualizations/graph/Graph.types';
import { TestNodeData } from './graph_test_data';

const count = 20;
const minRadius = 2;
const maxRadius = 50;

const nodes: TestNodeData[] = [
  { id: 0, radius: 4, group: 1 },
  { id: 1, radius: 20, group: 2 },
  { id: 2, radius: 4, group: 1 },
  { id: 3, radius: 25, group: 2 },
  { id: 4, radius: 2, group: 1 },
  { id: 5, radius: 10, group: 3 },
  { id: 6, radius: 10, group: 3 },
  { id: 7, radius: 15, group: 3 },
  { id: 8, radius: 44, group: 1 },
  { id: 8, radius: 64, group: 1 },
  { id: 8, radius: 4, group: 1 },
  { id: 8, radius: 4, group: 1 },
  { id: 8, radius: 4, group: 1 },
];
const links: GraphLinkData[] = [];

const data = {
  nodes,
  links,
};

export default data;
