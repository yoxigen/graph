import { Coordinates } from '../../../types/position.types';
import Configurable from '../../../utils/Configurable';
import CoordinatesList from '../../../utils/CoordinatesList';
import GraphPositions from '../Graph.positions';

export default abstract class GraphForce<
  TConfig = {}
> extends Configurable<TConfig> {
  constructor(defaultConfig: TConfig, config: Partial<TConfig> = {}) {
    super(defaultConfig, config);
  }

  abstract apply(
    positions: GraphPositions,
    velocities: CoordinatesList,
    fixedPositions: Map<number, Coordinates>
  ): void;
}
