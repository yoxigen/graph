import {
  Coordinates,
  Dimensions,
  WeightedCenter,
} from '../types/position.types';
import GraphPositions from '../visualizations/graph/Graph.positions';

export type QuadTreeOptions = {
  maxElementsPerQuad: number;
  position: Coordinates;
  depth: number;
  minChildWidth: number;
};

const DEFAULT_OPTIONS: QuadTreeOptions = {
  maxElementsPerQuad: 4,
  position: [0, 0],
  depth: 0,
  minChildWidth: 1,
};

export default class QuadTree {
  elements: Coordinates[];
  children: Map<number, QuadTree>;
  readonly width: number;
  readonly options: QuadTreeOptions;
  private childWidth: number;
  private center: Coordinates;
  private weightedCenter: WeightedCenter;
  private isMaxDepth: boolean;

  #weight: number;

  constructor(
    dimensions: Dimensions,
    positions?: GraphPositions,
    options: Partial<QuadTreeOptions> = {}
  ) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.width = Math.max(...dimensions);

    if (positions) {
      this.add(...positions.toCoordinates());
    }
  }

  get weight(): number {
    if (this.#weight == null) {
      if (this.elements) {
        this.#weight = this.elements.length;
      } else if (this.children) {
        this.#weight = 0;
        this.children.forEach(child => (this.#weight += child.weight));
      } else {
        this.#weight = 0;
      }
    }

    return this.#weight;
  }

  add(...coordinates: Coordinates[]) {
    if (
      this.isMaxDepth ||
      (!this.children &&
        (this.elements?.length || 0) + coordinates.length <=
          this.options.maxElementsPerQuad)
    ) {
      this.elements = this.elements
        ? this.elements.concat(coordinates)
        : coordinates;
    } else {
      if (!this.children) {
        this.split();
      }
      if (this.isMaxDepth) {
        this.elements = this.elements
          ? this.elements.concat(coordinates)
          : coordinates;
      } else {
        coordinates.forEach(element => this.addElementToZone(element));
      }
    }
  }

  private getZoneAtPosition(position: Coordinates): QuadTree {
    if (!this.children) {
      return null;
    }

    let zone: number;
    if (position[0] < this.center[0]) {
      zone = position[1] < this.center[1] ? 0 : 3;
    } else {
      zone = position[1] < this.center[1] ? 1 : 2;
    }

    if (!this.children.has(zone)) {
      this.children.set(
        zone,
        new QuadTree([this.childWidth, this.childWidth], null, {
          ...this.options,
          position: this.getPositionForZone(zone),
          depth: this.options.depth + 1,
        })
      );
    }

    return this.children.get(zone);
  }

  private addElementToZone(element: Coordinates) {
    // 1. Fine the appropriate zone
    const zone = this.getZoneAtPosition(element);

    // 2. add the element to the found zone
    zone.add(element);
  }

  private split() {
    this.childWidth = this.width / 2;
    if (this.childWidth < this.options.minChildWidth) {
      this.isMaxDepth = true;
    } else {
      this.center = this.options.position.map(
        v => v + this.childWidth
      ) as Coordinates;

      this.children = new Map();

      if (this.elements) {
        this.elements.forEach(element => this.addElementToZone(element));
        this.elements = null;
      }
    }
  }

  private getPositionForZone(zoneIndex: number): Coordinates {
    switch (zoneIndex) {
      case 0:
        return this.options.position;
      case 1:
        return [this.center[0], this.options.position[1]];
      case 2:
        return [this.center[0], this.center[1]];
      case 3:
        return [this.options.position[0], this.center[1]];
      default:
        throw new Error(`Invalid zone index, ${zoneIndex}.`);
    }
  }

  /**
   * Gets the innermost zone that contains the specified position
   * @param position
   * @returns
   */
  getZone(position: Coordinates): QuadTree {
    if (!this.children) {
      return this;
    }

    const zone = this.getZoneAtPosition(position);
    return zone.getZone(position);
  }

  getWeightedCenter(): WeightedCenter {
    if (!this.weightedCenter) {
      if (this.elements) {
        this.weightedCenter = {
          center: this.elements
            .reduce(
              (avg: Coordinates, element: Coordinates) => [
                avg[0] + element[0],
                avg[1] + element[1],
              ],
              [0, 0]
            )
            .map(v => v / this.elements.length) as Coordinates,
          weight: this.elements.length,
        };
      } else {
        let wc: WeightedCenter = { center: [0, 0], weight: 0 };

        if (this.children) {
          this.children.forEach(child => {
            const { center: childCenter, weight: childWeight } =
              child.getWeightedCenter();
            if (childWeight) {
              wc = {
                weight: wc.weight + childWeight,
                center: [
                  wc.center[0] + childCenter[0] * childWeight,
                  wc.center[1] + childCenter[1] * childWeight,
                ],
              };
            }
          });

          this.weightedCenter = {
            center: [wc.center[0] / wc.weight, wc.center[1] / wc.weight],
            weight: wc.weight,
          };
        } else {
          this.weightedCenter = wc;
        }
      }
    }
    return this.weightedCenter;
  }
}
