import testData from '../../test_data/graph_test_data';
import EventBus from '../utils/EventBus';
import { GraphData } from '../visualizations/graph/Graph.types';

class DataControls extends EventBus<{
  data: GraphData;
}> {
  constructor() {
    super();

    this.init();
  }

  init() {
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
}

const dataControls = new DataControls();
export default dataControls;
