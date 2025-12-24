export type Coordinates = [number, number];
export type Vector = [number, number]; // [x,y]
export type Dimensions = [number, number];
export interface BoundingRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}
export type WeightedCenter = { center: Coordinates; weight: number };
