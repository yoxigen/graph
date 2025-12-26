import miserables from '../test_data/miserables.json';
import essays from '../test_data/essays.json';
import simple from '../test_data/simple';
import { ID } from '../scripts/types/general.types';
import {
  GraphData,
  GraphLinkData,
} from '../scripts/visualizations/graph/Graph.types';

export type TestNodeData = { id: ID; group: string | number };
export type TestData = {
  id: string;
  name: string;
  data: GraphData<TestNodeData>;
};

const testData: TestData[] = [
  { id: 'les_miserables', name: 'Les Miserables', data: miserables },
  { id: 'essays', name: 'Essays', data: essays },
  { id: 'simple', name: 'Simple data', data: simple },
].map(({ id, name, data }) => ({
  id,
  name,
  data: { nodes: data.nodes, links: getLinksForNodes(data) },
}));

function getLinksForNodes({
  nodes,
  links,
}: {
  nodes: { id: ID }[];
  links: { source: ID; target: ID }[];
}): GraphLinkData[] {
  const nodeIndexes = new Map<ID, number>();
  nodes.forEach(({ id }, i) => nodeIndexes.set(id, i));
  return links.map(link => ({
    source: nodeIndexes.get(link.source),
    target: nodeIndexes.get(link.target),
  }));
}

export default testData;
