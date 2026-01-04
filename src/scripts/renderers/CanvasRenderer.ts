import { Coordinates, Dimensions } from '../types/position.types';
import Renderer, { RendererOptions } from './Renderer';

export default class CanvasRenderer extends Renderer {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;

  constructor(
    parentElement: HTMLElement,
    options: Partial<RendererOptions> = {}
  ) {
    super(parentElement, options);

    const canvas = (this.canvas = document.createElement('canvas'));
    this.parentElement.appendChild(canvas);
    this.ctx = canvas.getContext('2d');
    this.setCanvasSize(this.size);
    this.element = canvas;
    canvas.style.touchAction = 'none';
    this.on('resize', size => this.setCanvasSize(size));
  }

  private setCanvasSize(size: Dimensions) {
    const dpi = devicePixelRatio;
    this.canvas.width = size[0] * dpi;
    this.canvas.height = size[1] * dpi;
    this.canvas.style.setProperty('width', `${size[0]}px`);
    this.canvas.style.setProperty('height', `${size[1]}px`);
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  clear() {
    this.ctx.clearRect(0, 0, ...this.size);
  }

  drawCircle(
    center: Coordinates,
    radius: number,
    color?: string,
    stroke = false
  ) {
    if (color) {
      this.ctx.fillStyle = color;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(center[0] + radius, center[1]);
    this.ctx.arc(...center, radius, 0, Math.PI * 2);
    if (stroke) {
      this.ctx.stroke();
    }
    this.ctx.fill();
  }

  drawLine(from: Coordinates, to: Coordinates): void {
    this.ctx.beginPath();
    this.ctx.moveTo(...from);
    this.ctx.lineTo(...to);
    this.ctx.stroke();
  }

  drawLines(positions: [Coordinates, Coordinates][]): void {
    this.ctx.beginPath();
    for (const pair of positions) {
      this.ctx.moveTo(...pair[0]);
      this.ctx.lineTo(...pair[1]);
    }
    this.ctx.stroke();
  }

  drawText(position: Coordinates, text: string, font = '14px Arial') {
    this.ctx.font = font;
    this.ctx.fillText(text, position[0], position[1]);
  }

  setFillColor(fill: string): void {
    this.ctx.fillStyle = fill;
  }

  setLineColor(color: string): void {
    this.ctx.strokeStyle = color;
  }

  setLineWidth(width: number): void {
    this.ctx.lineWidth = width;
  }
}
