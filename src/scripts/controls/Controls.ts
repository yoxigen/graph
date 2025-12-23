import testData from '../../test_data/graph_test_data';
import EventBus from '../utils/EventBus';
import { GraphData } from '../visualizations/graph/Graph.types';
import { GraphConfig } from '../visualizations/graph/Graph.vis';

type ControlsEvent<TControlKey extends keyof GraphConfig> = {
  control: TControlKey;
  value: GraphConfig[TControlKey];
};

class Controls extends EventBus<{
  input: ControlsEvent<keyof GraphConfig>;
  data: GraphData;
}> {
  constructor() {
    super();

    this.init();
  }

  init() {
    document.querySelector('#controls').addEventListener('input', e => {
      if (e.target instanceof HTMLInputElement) {
        const value = parseFloat(e.target.value);
        const control = e.target.id as keyof GraphConfig;
        this.emit('input', { control, value });
        this.setDisplayValue(control, value.toLocaleString());
      }
    });

    const dataSelect = document.querySelector(
      '#test_data'
    ) as HTMLSelectElement;
    testData.forEach(({ name }) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      dataSelect.appendChild(option);
    });
    dataSelect.value = testData[0].name;
    dataSelect.addEventListener('change', () => {
      this.emit(
        'data',
        testData.find(({ name }) => name === dataSelect.value)!.data
      );
    });
  }

  setValues(config: GraphConfig) {
    for (const key in config) {
      const input = document.querySelector('#' + key);
      if (input && input instanceof HTMLInputElement) {
        input.value = config[key].toString();
        this.setDisplayValue(key, input.value);
      }
    }
  }

  setDisplayValue(key: string, value: string) {
    document.querySelector(`#${key}_value`).textContent = value;
  }
}

const controls = new Controls();
export default controls;
