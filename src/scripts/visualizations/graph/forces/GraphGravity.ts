import { Coordinates } from '../../../types/position.types';
import CoordinatesList from '../../../utils/CoordinatesList';
import { IGraphForce } from '../Graph.types';

export default class GraphGravity implements IGraphForce {
  constructor(
    public readonly center: Coordinates,
    public readonly strength = 1
  ) {}

  apply(
    positions: CoordinatesList,
    forces: CoordinatesList,
    fixedPositions: Map<number, Coordinates>
  ) {
    let totalX = 0;
    let totalY = 0;
    positions.forEach((x, y, i) => {
      if (!fixedPositions.has(i)) {
        totalX += x;
        totalY += y;
      }
    });

    const xStrength =
      this.strength *
      (totalX / (positions.size - fixedPositions.size) - this.center[0]);
    const yStrength =
      this.strength *
      (totalY / (positions.size - fixedPositions.size) - this.center[1]);

    for (let i = 0; i < positions.size; i++) {
      if (!fixedPositions.has(i)) {
        console.log('SET', i);
        positions.set(
          i,
          positions.getX(i) - xStrength,
          positions.getY(i) - yStrength
        );
      }
    }
  }
}
