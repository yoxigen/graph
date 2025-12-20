export type ID = string | number;
export type ValueOrFunction<TValue, TParams> =
  | TValue
  | ((params: TParams) => TValue);
