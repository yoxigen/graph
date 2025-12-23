import { ControlsConfig } from '../../types/config.types';
import { GraphRenderConfig } from './Graph.types';

const graphRenderControls: ControlsConfig<GraphRenderConfig> = [
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
    key: 'animate',
    type: 'checkbox',
    label: 'Animate',
    defaultValue: true,
    isStructural: false,
  },
];

export default graphRenderControls;
