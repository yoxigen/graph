import { ColorValue } from '../types/color.types';
import { createArray } from '../utils/array_utils';

export function getHSLColors({
  count,
  lightness = 0.5,
  saturation = 1,
  hueStart = 0,
  hueEnd,
}: {
  count: number;
  hueStart?: number;
  hueEnd?: number;
  lightness?: number;
  saturation?: number;
}): ColorValue[] {
  const hueStep = Math.floor(
    Math.abs(hueEnd ?? hueStart + 360 - hueStart) / count
  );
  return createArray(
    count,
    i =>
      `hsl(${(hueStart + i * hueStep) % 360},${saturation * 100}%,${
        lightness * 100
      }%)`
  );
}
