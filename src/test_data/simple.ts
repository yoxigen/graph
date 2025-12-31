import { createArray } from '../scripts/utils/array_utils';

const nodeCount = 1000;
const groupCount = 10;

const nodes = createArray(nodeCount, id => ({
  id,
  group: Math.floor(Math.random() * groupCount),
  name: id.toString(),
}));

const data = {
  nodes,
  links: createArray(Math.floor(Math.random() * 200), () => {
    const source = Math.floor(Math.random() * (nodeCount - 1));
    let target = Math.floor(Math.random() * (nodeCount - 1));
    if (target === source) {
      target = (target + 1) % nodeCount;
    }

    return { source, target };
  }),
};

export default data;
