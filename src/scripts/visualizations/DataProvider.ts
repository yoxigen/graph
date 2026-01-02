import EventBus from '../utils/EventBus';

export default class DataProvider<
  TData,
  TEvents extends Record<string, any> = {}
> extends EventBus<TEvents & { change: TData }> {
  data: TData;

  constructor(data: TData) {
    super();

    this.data = data;
  }

  setData(data: TData) {
    this.data = data;
    this.emit('change', data as any);
  }
}
