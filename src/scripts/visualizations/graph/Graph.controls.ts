import { ControlsConfig } from '../../types/config.types';
import { GraphConfig } from './Graph.types';

const graphControls: ControlsConfig<GraphConfig> = [
  {
    key: 'charge',
    type: 'range',
    label: 'Charge',
    attr: {
      min: 0,
      max: 300,
      step: 1,
    },
    defaultValue: 30,
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
    key: 'autoLinkStrength',
    type: 'checkbox',
    label: 'Auto link strength',
    defaultValue: true,
  },
  {
    key: 'linkStrength',
    type: 'range',
    label: 'Link strength',
    attr: {
      min: 0.01,
      max: 1,
      step: 0.01,
    },
    show: ({ autoLinkStrength }) => !autoLinkStrength,
    defaultValue: 1,
    isStructural: true,
  },
  {
    key: 'alphaMin',
    type: 'range',
    label: 'Minimum alpha',
    attr: {
      min: 0,
      max: 0.9,
      step: 0.001,
    },
    defaultValue: 0.001,
    isStructural: true,
  },
  {
    key: 'friction',
    type: 'range',
    label: 'Friction',
    attr: {
      min: 0,
      max: 0.9,
      step: 0.01,
    },
    defaultValue: 0.4,
    isStructural: true,
  },
  {
    key: 'minDistance',
    type: 'range',
    label: 'Min distance',
    description:
      'The smallest distance between two nodes to use when calculating the force between them',
    attr: {
      min: 0,
      max: 200,
      step: 1,
    },
    defaultValue: 10,
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
  {
    key: 'animate',
    type: 'checkbox',
    label: 'Animate',
    defaultValue: true,
    isStructural: false,
  },
];

export default graphControls;
