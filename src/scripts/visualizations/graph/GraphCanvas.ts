import { getHSLColors } from '../../color/hsl_color';
import CanvasRenderer from '../../renderers/CanvasRenderer';
import { ColorValue } from '../../types/color.types';
import { getValue } from '../../utils/config_utils';
import { groupDimension } from '../../utils/data_utils';
import {
  GRAPH_RENDER_CONFIG_DEFAULTS,
  GraphData,
  GraphRenderConfig,
} from './Graph.types';
import Graph from './Graph.vis';

let lastRenderId = 0;

export default class GraphCanvas<TNodeData> {
  renderer: CanvasRenderer;
  config: GraphRenderConfig<TNodeData>;

  private raf: number;
  private currentRenderId: number;
  private getNodeColor: (nodeData: TNodeData) => ColorValue;

  constructor(
    public graph: Graph<TNodeData>,
    parentElement: HTMLElement,
    config: Partial<GraphRenderConfig<TNodeData>> = {}
  ) {
    this.renderer = new CanvasRenderer(parentElement);
    this.config = Object.assign({}, GRAPH_RENDER_CONFIG_DEFAULTS, config);
    this.setNodeColors();

    graph.on('configChange', () => {
      if (!graph.isGenerating) {
        this.render();
      }
    });

    graph.on('dataChange', (data: GraphData<TNodeData>) => {
      this.setNodeColors();
      this.render();
    });

    graph.on('reset', () => this.render());

    if (graph.data) {
      this.render();
    }
  }

  private setNodeColors() {
    if (this.config.nodeColorDimension && this.graph.data) {
      const nodeColorsMap = groupDimension(
        this.graph.data.nodes,
        this.config.nodeColorDimension
      );
      const colors = getHSLColors({
        count: nodeColorsMap.size,
        hueStart: 190,
        lightness: 0.45,
      });

      this.getNodeColor = node =>
        colors[nodeColorsMap.get(node[this.config.nodeColorDimension])];
    } else {
      this.getNodeColor = () => this.config.nodeColor ?? 'black';
    }
  }

  setConfigValue(
    key: keyof GraphRenderConfig,
    value: GraphRenderConfig[typeof key]
  ) {
    if (this.config[key] !== value) {
      (this.config[key] as GraphRenderConfig[typeof key]) = value;
      this.draw();
    }
  }

  render() {
    const renderId = lastRenderId++;
    this.currentRenderId = renderId;
    cancelAnimationFrame(this.raf);

    const generator = this.graph.generate();

    if (this.config.animate) {
      const step = () => {
        if (renderId !== this.currentRenderId) {
          // Not in the current render loop, exit
          return;
        }
        const result = generator.next();
        this.draw();
        if (!result.done) {
          this.raf = requestAnimationFrame(step);
        } else {
          console.log('DONE');
          this.currentRenderId = null;
          this.raf = null;
        }
      };

      step();
    } else {
      const start = performance.now();

      while (!generator.next().done);
      this.draw();
      console.log('TIME', performance.now() - start);
    }
  }

  private draw() {
    this.renderer.clear();
    this.renderer.setLineColor(this.config.linkColor);
    this.renderer.setLineWidth(this.config.linkWidth);

    this.renderer.drawLines(
      this.graph.data.links.map(link => [
        this.graph.positions.get(link.source),
        this.graph.positions.get(link.target),
      ])
    );
    this.graph.data.nodes.forEach((node, i) =>
      this.renderer.drawCircle(
        this.graph.positions.get(i),
        this.config.nodeRadius,
        this.getNodeColor(node)
      )
    );
  }
}
