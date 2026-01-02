import EventBus from '../utils/EventBus';
import DataProvider from './DataProvider';

export default abstract class Visualization<
  TData,
  TEvents
> extends EventBus<TEvents> {
  protected dataProvider: DataProvider<TData>;

  constructor();
  constructor(data: TData);
  constructor(dataProvider: DataProvider<TData>);

  constructor(data?: DataProvider<TData> | TData) {
    super();

    if (data instanceof DataProvider) {
      this.dataProvider = data;
    } else {
      this.dataProvider = new DataProvider(data);
    }
  }

  get data(): TData {
    return this.dataProvider.data;
  }

  setData(data: TData) {
    this.dataProvider.setData(data);
  }
}
