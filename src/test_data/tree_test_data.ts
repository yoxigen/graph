import { GraphLinkData } from '../scripts/visualizations/graph/Graph.types';
import { TestNodeData } from './graph_test_data';

const maxNodeChildCount = 9;
const levels = 3;

const nodes: TestNodeData[] = [
  {
    id: 0,
    level: 0,
  },
];

const links: GraphLinkData[] = [];

function addChildren(nodeIndex: number, level = 0) {
  const childCount = Math.ceil(Math.random() * maxNodeChildCount);
  for (let i = 0; i < childCount; i++) {
    const id = nodes.length;
    nodes.push({ id, level: level + 1, group: level + 1 });
    links.push({ source: nodeIndex, target: id });

    if (level < levels) {
      addChildren(id, level + 1);
    }
  }
}

addChildren(0);

const data = {
  nodes,
  links,
};

export default data;
