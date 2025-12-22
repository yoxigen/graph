import { ControlsConfig } from '../../types/config.types';
import { GraphConfig } from './Graph.types';

const graphControls: ControlsConfig<GraphConfig> = [
  {
    key: 'charge',
    type: 'range',
    label: 'Charge',
    attr: {
      min: 0,
      max: 15000,
      step: 50,
    },
    defaultValue: 500,
    isStructural: true,
  },
  {
    key: 'gravityForce',
    type: 'range',
    label: 'Central gravity',
    attr: {
      min: 0,
      max: 0.1,
      step: 0.001,
    },
    defaultValue: 0.01,
    isStructural: true,
  },
];

export default graphControls;
