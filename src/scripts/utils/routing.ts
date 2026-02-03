import testData from '../../test_data/graph_test_data';
import { PrimitiveValue } from '../types/config.types';
import { GraphConfig } from '../visualizations/graph/Graph.types';
import Graph from '../visualizations/graph/Graph';
import {
  deserializeConfig,
  serializeConfig,
} from './config_serialization_utils';
import EventBus from './EventBus';

export interface StateData {
  data?: string;
  config?: string;
}

class Routing extends EventBus<{
  data: string;
  config: Record<string, PrimitiveValue>;
}> {
  #popStateListener: (this: Window, ev: PopStateEvent) => any;
  #currentData: string;
  #currentConfig: string;

  constructor() {
    super();

    const onPopState = (this.#popStateListener = ({
      state,
    }: {
      state: any;
    }) => {
      this.#updateFromState(state ?? {});
    });

    window.addEventListener('popstate', onPopState);
    this.init();
  }

  get state(): { data?: string; config: GraphConfig } {
    return {
      data: this.#currentData,
      config: this.#currentConfig
        ? deserializeConfig(Graph.defaultConfig, this.#currentConfig)
        : undefined,
    };
  }

  #updateFromState(state: StateData) {
    const { config, data } = state;
    if (data !== this.#currentData) {
      this.#currentData = data;
      this.emit('data', data);
    }

    if (config && config !== this.#currentConfig) {
      this.#currentConfig = config;
      this.emit('config', deserializeConfig(Graph.defaultConfig, config));
    }
  }

  init() {
    if (history.state?.data || history.state?.config) {
      this.#updateFromState(history.state);
    } else {
      const queryParams = new URLSearchParams(document.location.search);
      this.#updateFromState({
        data: queryParams.get('data'),
        config: queryParams.get('config'),
      });
    }
  }

  destroy() {
    window.removeEventListener('popstate', this.#popStateListener);
  }

  navigate({
    data,
    config,
    replaceState = false,
  }: { data?: string; config?: GraphConfig; replaceState?: boolean } = {}) {
    const configQuery = serializeConfig(config ?? {}, Graph.defaultConfig);
    const setHistoryState = (
      replaceState ? history.replaceState : history.pushState
    ).bind(history);

    const urlParams = new URLSearchParams();
    if (data ?? this.#currentData) {
      urlParams.set('data', data ?? this.#currentData);
      if (data) {
        this.#currentData = data;
      }
    }

    if (configQuery) {
      urlParams.set('config', configQuery);
    }

    setHistoryState(
      {
        data: data ?? this.#currentData,
        config: configQuery,
      },
      data,
      '?' + urlParams.toString()
    );
  }
}

const routing = new Routing();
export default routing;
