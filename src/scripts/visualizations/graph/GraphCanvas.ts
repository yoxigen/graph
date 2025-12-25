import CanvasRenderer from '../../renderers/CanvasRenderer';
import { getValue } from '../../utils/config_utils';
import { GRAPH_RENDER_CONFIG_DEFAULTS, GraphRenderConfig } from './Graph.types';
import Graph from './Graph.vis';

let lastRenderId = 0;

export default class GraphCanvas<TNodeData> {
  renderer: CanvasRenderer;
  config: GraphRenderConfig;

  private raf: number;
  private currentRenderId: number;

  constructor(
    public graph: Graph<TNodeData>,
    parentElement: HTMLElement,
    config: Partial<GraphRenderConfig> = {}
  ) {
    this.renderer = new CanvasRenderer(parentElement);
    this.config = Object.assign({}, GRAPH_RENDER_CONFIG_DEFAULTS, config);
    this.renderer.setLineColor(this.config.linkColor);
    this.renderer.setLineWidth(this.config.linkWidth);

    graph.on('configChange', () => {
      console.log('GENENEN', graph.isGenerating);
      if (!graph.isGenerating) {
        this.render();
      }
    });

    graph.on('dataChange', () => {
      console.log('Data Change!');
      this.render();
    });
  }

  setConfigValue(
    key: keyof GraphRenderConfig,
    value: GraphRenderConfig[typeof key]
  ) {
    if (this.config[key] !== value) {
      (this.config[key] as GraphRenderConfig[typeof key]) = value;
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
          console.warn(
            `renderId ${renderId} is not this.currentRenderId = ${this.currentRenderId}`
          );
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
    }
  }

  private draw() {
    this.renderer.clear();

    this.renderer.drawLines(
      this.graph.links.map(link => [link.source.position, link.target.position])
    );
    this.graph.nodes.forEach(node =>
      this.renderer.drawCircle(
        node.position,
        this.config.nodeRadius,
        getValue(this.config.nodeColor, node)
      )
    );
  }
}
