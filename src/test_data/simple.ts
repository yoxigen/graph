import { createArray } from '../scripts/utils/array_utils';

const nodeCount = 1000;
const linkedNodeCount = 500;
const unlinkedNodeCount = nodeCount - linkedNodeCount;

const groupCount = 10;

const linkedNodes = createArray(linkedNodeCount, id => ({
  id,
  group: 1,
  name: id.toString(),
}));

const unlinkedNodes = createArray(unlinkedNodeCount, id => ({
  id: linkedNodeCount + id,
  group: 0,
  name: id.toString(),
}));
const data = {
  nodes: linkedNodes.concat(unlinkedNodes),
  links: createArray(Math.floor(Math.random() * linkedNodeCount), () => {
    const source = Math.floor(Math.random() * (linkedNodeCount - 1));
    let target = Math.floor(Math.random() * (linkedNodeCount - 1));
    if (target === source) {
      target = (target + 1) % linkedNodeCount;
    }

    return { source, target };
  }),
};

export default data;
