import EventBus from './EventBus';

export default class Configurable<TConfig extends Object> extends EventBus<{
  change: Partial<TConfig>;
}> {
  readonly config: TConfig;

  constructor(private defaultConfig: TConfig, config: Partial<TConfig> = {}) {
    super();

    this.config = Object.assign({}, defaultConfig, config);
  }

  setConfigValue(
    key: keyof TConfig,
    value: TConfig[typeof key],
    notifyChange = true
  ): boolean {
    if (this.config[key] !== value) {
      const finalValue = value == null ? this.defaultConfig[key] : value;
      (this.config[key] as TConfig[typeof key]) = finalValue;
      if (notifyChange) {
        this.emit('change', {
          [key]: finalValue,
        } as Partial<TConfig>);
      }

      return true;
    }

    return false;
  }
}
