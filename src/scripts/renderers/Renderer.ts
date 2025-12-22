import { ID } from '../types/general.types';
import { Coordinates, Dimensions } from '../types/position.types';

export type RendererOptions = {
  layers: string[];
};

export default abstract class Renderer {
  constructor(
    protected parentElement: HTMLElement,
    protected options: Partial<RendererOptions> = {}
  ) {}

  abstract clear(): void;
  abstract getSize(): Dimensions;
  abstract drawCircle(center: Coordinates, radius: number): void;
  abstract drawLine(from: Coordinates, to: Coordinates): void;
  abstract drawLines(positions: [Coordinates, Coordinates][]): void;
  abstract setLineColor(color: string): void;
  abstract setLineWidth(width: number): void;
  abstract setFillColor(fill: string): void;
}
