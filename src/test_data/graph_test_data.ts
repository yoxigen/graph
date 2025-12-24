import miserables from '../test_data/miserables.json';
import essays from '../test_data/essays.json';
import simple from '../test_data/simple';
import { ID } from '../scripts/types/general.types';
import { GraphData } from '../scripts/visualizations/graph/Graph.types';
import { GraphLinkData } from '../scripts/visualizations/graph/Graph.vis';

export type TestData = {
  id: string;
  name: string;
  data: GraphData<{ id: ID; group: string | number }>;
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
    from: nodeIndexes.get(link.source),
    to: nodeIndexes.get(link.target),
  }));
}

export default testData;
