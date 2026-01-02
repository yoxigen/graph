import DataProvider from '../DataProvider';
import { GraphData, GraphNodeData } from './Graph.types';

export default class GraphDataProvider<
  TNodeData,
  TLinkData = Object
> extends DataProvider<
  GraphData<TNodeData, TLinkData>,
  {
    add: GraphData<TNodeData>['nodes'];
    remove: { removedIndexes: number[] };
  }
> {
  constructor(data: GraphData<TNodeData, TLinkData>) {
    super(data);
  }

  add(...nodes: GraphNodeData<TNodeData>[]) {
    this.data.nodes.push(...nodes);
    this.emit('add', nodes);
  }

  remove(...nodeIndexes: number[]) {
    const indexesSet = new Set(
      nodeIndexes.filter(index => index < this.data.nodes.length)
    );
    if (!indexesSet.size) {
      return;
    }

    const indexesToRemove = Array.from(indexesSet).sort();
    for (let index = indexesToRemove.length - 1; index >= 0; index--) {
      this.data.nodes.splice(index, 1);
    }

    this.emit('remove', { removedIndexes: indexesToRemove });
  }
}
