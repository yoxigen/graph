import { Coordinates, Dimensions } from '../types/position.types';
import EventBus from '../utils/EventBus';

export type RendererOptions = {
  isFixedSize: boolean;
};

export default abstract class Renderer extends EventBus<{
  resize: Dimensions;
}> {
  element: HTMLElement;
  protected size: Dimensions = [0, 0];

  private isResizeFirstTime = true;
  private removeOnResizeListener: Function;

  constructor(
    protected parentElement: HTMLElement,
    protected options: Partial<RendererOptions> = {}
  ) {
    super();

    const rect = this.parentElement.getBoundingClientRect();
    this.size = [rect.width, rect.height];
    this.setOnResize();
  }

  getSize(): Dimensions {
    return this.size;
  }

  abstract clear(): void;
  abstract drawCircle(center: Coordinates, radius: number): void;
  abstract drawLine(from: Coordinates, to: Coordinates): void;
  abstract drawLines(positions: [Coordinates, Coordinates][]): void;
  abstract setLineColor(color: string): void;
  abstract setLineWidth(width: number): void;
  abstract setFillColor(fill: string): void;

  private setOnResize() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (!this.isResizeFirstTime) {
          if (!this.options.isFixedSize) {
            this.emit(
              'resize',
              (this.size = [entry.contentRect.width, entry.contentRect.height])
            );
          }
        }
        this.isResizeFirstTime = false;
      }
    });
    this.removeOnResizeListener = () => resizeObserver.disconnect();
    resizeObserver.observe(this.parentElement);
  }
}
