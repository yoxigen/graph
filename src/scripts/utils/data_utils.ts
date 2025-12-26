export function groupDimension<
  TData extends Object,
  TDimension extends keyof TData
>(data: TData[], dimension: TDimension): Map<TData[TDimension], number> {
  const dimensionMap = new Map();
  data.forEach(d => {
    const value = d[dimension];
    if (!dimensionMap.has(value)) {
      dimensionMap.set(value, dimensionMap.size);
    }
  });

  return dimensionMap;
}
