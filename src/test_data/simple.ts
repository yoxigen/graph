import { createArray } from '../scripts/utils/array_utils';

const nodes = createArray(1600, id => ({
  id,
  group: 1,
  name: id.toString(),
}));

const data = {
  nodes,
  links: [],
};

export default data;
