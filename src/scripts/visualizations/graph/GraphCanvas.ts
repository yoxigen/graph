import CanvasRenderer from '../../renderers/CanvasRenderer';
import { GRAPH_RENDER_CONFIG_DEFAULTS, GraphRenderConfig } from './Graph.types';
import Graph from './Graph.vis';

export default class GraphCanvas<TNodeData> {
  renderer: CanvasRenderer;
  config: GraphRenderConfig;

  constructor(
    public graph: Graph<TNodeData>,
    parentElement: HTMLElement,
    config: Partial<GraphRenderConfig> = {}
  ) {
    this.renderer = new CanvasRenderer(parentElement);
    this.config = Object.assign({}, GRAPH_RENDER_CONFIG_DEFAULTS, config);
    this.renderer.setLineColor(this.config.linkColor);
    this.renderer.setLineWidth(this.config.linkWidth);
  }

  render() {
    const generator = this.graph.generate();

    if (this.config.animate) {
      const step = () => {
        const result = generator.next();
        this.draw();
        if (!result.done) {
          requestAnimationFrame(step);
        } else {
          console.log('DONE');
        }
      };

      step();
    } else {
    }
  }

  private draw() {
    this.renderer.clear();

    this.renderer.drawLines(
      this.graph.links.map(link => [link.source.position, link.target.position])
    );
    this.graph.nodes.forEach(node =>
      this.renderer.drawCircle(node.position, this.config.nodeRadius)
    );
  }
}
