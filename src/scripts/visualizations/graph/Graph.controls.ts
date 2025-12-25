import { ControlsConfig } from '../../types/config.types';
import { GraphConfig } from './Graph.types';

const graphControls: ControlsConfig<GraphConfig> = [
  {
    key: 'charge',
    type: 'range',
    label: 'Charge',
    attr: {
      min: 0,
      max: 1500,
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
  {
    key: 'minEnergy',
    type: 'range',
    label: 'Minumum energy',
    attr: {
      min: 0,
      max: 10,
      step: 0.01,
    },
    defaultValue: 0.2,
    isStructural: true,
  },
  {
    key: 'linkLength',
    type: 'range',
    label: 'Link length',
    attr: {
      min: 2,
      max: 100,
      step: 1,
    },
    defaultValue: 15,
    isStructural: true,
  },
  {
    key: 'warmupIterations',
    type: 'range',
    label: 'Warmup iterations',
    attr: {
      min: 0,
      max: 150,
      step: 1,
    },
    defaultValue: 0,
    isStructural: true,
  },
  {
    key: 'randomizePositions',
    type: 'checkbox',
    label: 'Randomize positions',
    defaultValue: false,
  },
  {
    key: 'useQuadtree',
    type: 'checkbox',
    label: 'Use quadtree',
    defaultValue: true,
  },
  {
    key: 'minQuadSize',
    type: 'range',
    label: 'Min quad size',
    attr: {
      min: 0,
      max: 50,
      step: 1,
    },
    defaultValue: 1,
    isStructural: true,
    show: ({ useQuadtree }) => useQuadtree,
  },
  {
    key: 'theta',
    type: 'range',
    label: 'Theta',
    attr: {
      min: 0,
      max: 2,
      step: 0.01,
      snap: '1',
    },
    defaultValue: 1,
    isStructural: true,
    show: ({ useQuadtree }) => useQuadtree,
  },
];

export default graphControls;
