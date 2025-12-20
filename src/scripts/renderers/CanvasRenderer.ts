import { ID } from '../types/general.types';
import { Coordinates, Dimensions } from '../types/position.types';
import Renderer, { RendererOptions } from './Renderer';

export default class CanvasRenderer extends Renderer {
  protected ctx: CanvasRenderingContext2D;
  private size: Dimensions = [0, 0];

  constructor(
    parentElement: HTMLElement,
    options: Partial<RendererOptions> = {}
  ) {
    super(parentElement, options);
    const rect = this.parentElement.getBoundingClientRect();
    this.size = [rect.width, rect.height];

    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.parentElement.appendChild(canvas);
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    this.ctx.clearRect(0, 0, ...this.size);
  }

  getSize(): Dimensions {
    return this.size;
  }

  drawCircle(center: Coordinates, radius: number) {
    this.ctx.beginPath();
    this.ctx.arc(...center, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawLine(from: Coordinates, to: Coordinates): void {
    this.ctx.beginPath();
    this.ctx.moveTo(...from);
    this.ctx.lineTo(...to);
    this.ctx.stroke();
  }
}
