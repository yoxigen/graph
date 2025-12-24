import testData, { TestData } from '../../test_data/graph_test_data';
import EventBus from '../utils/EventBus';

class DataControls extends EventBus<{
  data: TestData;
}> {
  private currentData: string;
  private dataSelectEl: HTMLSelectElement;

  constructor() {
    super();
    this.dataSelectEl = document.querySelector('#test_data');
    this.dataSelectEl.addEventListener('change', () => {
      this.setData(this.dataSelectEl.value);
    });
    this.init();
  }

  setData(dataId: string, notifyChange = true) {
    if (dataId !== this.currentData) {
      this.currentData = dataId;
      this.dataSelectEl.value = dataId;
      if (notifyChange) {
        this.emit(
          'data',
          testData.find(({ id }) => id === dataId)
        );
      }
    }
  }

  init() {
    testData.forEach(({ name, id }) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name;
      this.dataSelectEl.appendChild(option);
    });
  }
}

const dataControls = new DataControls();
export default dataControls;
