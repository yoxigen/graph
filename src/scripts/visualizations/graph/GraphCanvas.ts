import { getHSLColors } from '../../color/hsl_color';
import CanvasRenderer from '../../renderers/CanvasRenderer';
import { ColorValue } from '../../types/color.types';
import { groupDimension } from '../../utils/data_utils';
import EventBus from '../../utils/EventBus';
import {
  GRAPH_RENDER_CONFIG_DEFAULTS,
  GraphData,
  GraphRenderConfig,
} from './Graph.types';
import Graph from './Graph.vis';

export default class GraphCanvas<TNodeData, TLinkData> extends EventBus<{
  click: { x: number; y: number; node?: TNodeData | null };
}> {
  renderer: CanvasRenderer;
  config: GraphRenderConfig<TNodeData>;

  private raf: number;
  private getNodeColor: (nodeData: TNodeData) => ColorValue;
  private selectedNodeIndex: number;

  constructor(
    public graph: Graph<TNodeData, TLinkData>,
    parentElement: HTMLElement,
    config: Partial<GraphRenderConfig<TNodeData>> = {}
  ) {
    super();

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
    graph.on('tick', () => {
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => this.draw());
    });

    if (graph.data) {
      this.render();
    }

    const onMouseMove = (e: MouseEvent) => {
      graph.fixNodePosition(this.selectedNodeIndex!, e.x, e.y);
    };

    this.renderer.element.addEventListener('pointerup', () => {
      this.renderer.element.removeEventListener('pointermove', onMouseMove);
      if (!this.config.fixNodesOnDrag) {
        graph.unfixNodePosition(this.selectedNodeIndex);
      }
      this.selectedNodeIndex = null;
    });
    this.renderer.element.addEventListener('pointerdown', e => {
      const position = graph.selectNodeAt(e.x, e.y);
      if (position) {
        if (e.ctrlKey) {
          graph.unfixNodePosition(position.index);
        } else {
          this.selectedNodeIndex = position.index;
          this.renderer.element.addEventListener('pointermove', onMouseMove);
        }
      } else {
        this.emit('click', { x: e.x, y: e.y });
      }
    });
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
    if (!this.graph.isGenerating) {
      this.graph.start();
    }
  }

  private draw() {
    this.renderer.clear();
    this.renderer.setLineColor(this.config.linkColor);
    this.renderer.setLineWidth(this.config.linkWidth);

    this.graph.data.links.forEach(link => {
      this.renderer.drawLine(
        this.graph.positions.get(link.source),
        this.graph.positions.get(link.target)
      );
    });

    this.renderer.setLineWidth(3);
    this.graph.data.nodes.forEach((node, i) => {
      this.renderer.setLineColor(
        i === this.selectedNodeIndex ? 'black' : 'white'
      );

      const position = this.graph.positions.get(i);
      this.renderer.drawCircle(
        position,
        //Math.max(node.radius ?? this.config.nodeRadius),
        this.config.nodeRadius,
        this.getNodeColor(node),
        true
      );
    });
  }
}
