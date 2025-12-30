import { Coordinates, WeightedCenter } from '../types/position.types';
import CoordinatesList from './CoordinatesList';

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

type QuadTreeElement = {
  coordinates: Coordinates;
  // The index of the element on the root QuadTree
  id: number;
};

export default class QuadTree {
  elements: QuadTreeElement[];
  children: Map<number, QuadTree>;
  readonly options: QuadTreeOptions;
  private childWidth: number;
  private center: Coordinates;
  private weightedCenter: WeightedCenter;
  private isMaxDepth: boolean;

  #weight: number;

  constructor(
    public readonly width: number,
    positions?: CoordinatesList,
    options: Partial<QuadTreeOptions> = {}
  ) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    if (positions) {
      this.addPositions(positions);
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

  push(element: QuadTreeElement) {
    if (
      this.isMaxDepth ||
      (!this.children &&
        (this.elements?.length || 0) < this.options.maxElementsPerQuad)
    ) {
      if (!this.elements) {
        this.elements = [element];
      } else {
        this.elements.push(element);
      }
    } else {
      if (!this.children) {
        this.split();
      }
      if (this.isMaxDepth) {
        this.elements.push(element);
      } else {
        this.addElementToZone(element);
      }
    }
  }

  addPositions(positions: CoordinatesList) {
    const addElements = () => {
      if (!this.elements) {
        this.elements = [];
      }
      const startIndex = this.elements.length;

      positions.forEach((x, y, index) =>
        this.elements.push({ coordinates: [x, y], id: startIndex + index })
      );
    };

    if (
      this.isMaxDepth ||
      (!this.children &&
        (this.elements?.length || 0) + positions.size <=
          this.options.maxElementsPerQuad)
    ) {
      addElements();
    } else {
      if (!this.children) {
        this.split();
      }
      if (this.isMaxDepth) {
        addElements();
      } else {
        positions.forEach((x, y, index) =>
          this.addElementToZone({ coordinates: [x, y], id: index })
        );
      }
    }
  }

  private getZoneAtPosition(
    position: Coordinates,
    createIfNotFound = false
  ): QuadTree {
    if (!this.children) {
      return null;
    }

    let zone: number;
    if (position[0] < this.center[0]) {
      zone = position[1] < this.center[1] ? 0 : 3;
    } else {
      zone = position[1] < this.center[1] ? 1 : 2;
    }

    if (!this.children.has(zone) && createIfNotFound) {
      this.children.set(
        zone,
        new QuadTree(this.childWidth, null, {
          ...this.options,
          position: this.getPositionForZone(zone),
          depth: this.options.depth + 1,
        })
      );
    }

    return this.children.get(zone);
  }

  private addElementToZone(element: QuadTreeElement) {
    // 1. Fine the appropriate zone
    const zone = this.getZoneAtPosition(element.coordinates, true);

    // 2. add the element to the found zone
    zone.push(element);
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

  getElementAt(x: number, y: number, radius = 10): number | null {
    if (this.elements) {
      let closestElement: { element: QuadTreeElement; distance: number };
      for (const element of this.elements) {
        const distance = Math.hypot(
          Math.abs(x - element.coordinates[0]),
          Math.abs(y - element.coordinates[1])
        );
        if (
          distance <= radius &&
          (!closestElement || closestElement.distance > distance)
        ) {
          closestElement = { element, distance };
        }
      }
      return closestElement?.element.id;
      // Get the element closest to the x/y, within the radius
    } else {
      if (this.children) {
        const child = this.getZoneAtPosition([x, y]);
        return child?.getElementAt(x, y, radius) ?? null;
      }

      return null;
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

    const zone = this.getZoneAtPosition(position, false);
    return zone.getZone(position);
  }

  getWeightedCenter(): WeightedCenter {
    if (!this.weightedCenter) {
      if (this.elements) {
        this.weightedCenter = {
          center: this.elements
            .reduce(
              (avg: Coordinates, { coordinates }) => [
                avg[0] + coordinates[0],
                avg[1] + coordinates[1],
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
