import { Coordinates } from './position.types';

export type ControlType =
  | 'range'
  | 'checkbox'
  | 'color'
  | 'hue'
  | 'group'
  | 'select'
  | 'number'
  | 'text';

export type GroupValue = 'minimized' | null | undefined;
export type PrimitiveValue =
  | string
  | number
  | boolean
  | GroupValue
  | Coordinates;

export type ConfigFunction<
  TConfig = Record<string, PrimitiveValue>,
  TReturn = PrimitiveValue
> = (config: TConfig) => TReturn;

export type ConfigValueOrFunction<TConfig, TValue = PrimitiveValue> =
  | TValue
  | ConfigFunction<TConfig, TValue>;

export interface ControlConfig<TConfig = Record<string, PrimitiveValue>> {
  key: keyof TConfig;
  label: ConfigValueOrFunction<TConfig, string>;
  type: ControlType;
  defaultValue?: ConfigValueOrFunction<TConfig>;
  displayValue?: ConfigFunction<TConfig>;
  attr?: {
    [key: string]: ConfigValueOrFunction<TConfig>;
  };
  /** Structural means that changes in this control's value affect the structure of the visualization and
   * the method `resetStructure` should be called. Step count may also be recalculated.
   */
  isStructural?: boolean;
  description?: string;
  show?: ConfigFunction<TConfig>;
  children?: ControlsConfig<TConfig>;
  isDisabled?: ConfigFunction<TConfig>;
  options?: Array<string | { label: string; value: string }>;
}

export type ControlsConfig<T = Record<string, PrimitiveValue>> = Array<
  ControlConfig<T>
>;
