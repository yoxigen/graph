import miserables from '../test_data/miserables.json';
import essays from '../test_data/essays.json';
import simple from '../test_data/simple';
import tree from '../test_data/tree_test_data';
import grid from '../test_data/grid_test_data';
import central from '../test_data/central_test_data';
import chain from '../test_data/chain_test_data';
import collision from '../test_data/collision_test_data';
import { ID } from '../scripts/types/general.types';
import {
  GraphData,
  GraphLinkData,
} from '../scripts/visualizations/graph/Graph.types';

export type TestNodeData = {
  id: ID;
  group?: string | number;
  level?: number;
  radius?: number;
};
export type TestData = {
  id: string;
  name: string;
  data: GraphData<TestNodeData>;
};

const testData: TestData[] = [
  { id: 'les_miserables', name: 'Les Miserables', data: miserables },
  { id: 'essays', name: 'Essays', data: essays },
  { id: 'simple', name: 'Simple data', data: simple },
  { id: 'tree', name: 'Tree', data: tree },
  { id: 'grid', name: 'Grid', data: grid },
  { id: 'central', name: 'Central', data: central },
  { id: 'chain', name: 'Chain', data: chain },
  { id: 'collision', name: 'Collision', data: collision },
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
