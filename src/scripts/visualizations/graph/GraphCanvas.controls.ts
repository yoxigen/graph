import { TestNodeData } from '../../../test_data/graph_test_data';
import { ControlsConfig } from '../../types/config.types';
import { GraphRenderConfig } from './Graph.types';

const graphRenderControls: ControlsConfig<GraphRenderConfig<TestNodeData>> = [
  {
    key: 'nodeRadius',
    type: 'range',
    label: 'Node radius',
    attr: {
      min: 1,
      max: 50,
      step: 0.5,
    },
    defaultValue: 5,
    isStructural: true,
  },
  {
    key: 'linkColor',
    type: 'color',
    label: 'Link color',
  },
  {
    key: 'fixNodesOnDrag',
    type: 'checkbox',
    label: 'Fix nodes on drag',
    defaultValue: true,
  },
];

export default graphRenderControls;
