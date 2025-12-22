import { ValueOrFunction } from '../types/general.types';

export function getValue<TValue, TParams>(
  valueOrFunction: ValueOrFunction<TValue, TParams>,
  params: TParams
): TValue {
  return valueOrFunction instanceof Function
    ? valueOrFunction(params)
    : valueOrFunction;
}
