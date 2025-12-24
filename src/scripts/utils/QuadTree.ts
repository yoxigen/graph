import {
  Coordinates,
  Dimensions,
  WeightedCenter,
} from '../types/position.types';
import { createArray } from './array_utils';
import { getCenter } from './position_utils';

export interface QuadTreeElement {
  position: Coordinates;
}

export default class QuadTree {
  elements: QuadTreeElement[];
  children: QuadTree[];
  readonly dimensions: Dimensions;

  private center: Coordinates;
  private weightedCenter: WeightedCenter;
  #weight: number;

  constructor(
    dimensions: Dimensions,
    elements?: QuadTreeElement[],
    public readonly maxElementsPerQuad = 4,
    public readonly position: Coordinates = [0, 0], // The top-left corner of the Quad
    public readonly id = 0
  ) {
    const maxDimension = Math.max(...dimensions);
    this.dimensions = [maxDimension, maxDimension];

    if (elements) {
      this.add(...elements);
    }
  }

  get weight(): number {
    if (this.#weight == null) {
      this.#weight = this.elements
        ? this.elements.length
        : this.children
        ? this.children.reduce((total, child) => total + child.weight, 0)
        : 0;
    }

    return this.#weight;
  }

  add(...elements: QuadTreeElement[]) {
    if (
      !this.children &&
      (this.elements?.length || 0) + elements.length <= this.maxElementsPerQuad
    ) {
      this.elements = this.elements ? this.elements.concat(elements) : elements;
    } else {
      if (!this.children) {
        this.split();
      }
      elements.forEach(element => this.addElementToZone(element));
    }
  }

  private getZoneAtPosition(position: Coordinates): QuadTree {
    if (!this.children) {
      return null;
    }

    if (position[0] < this.center[0]) {
      return position[1] < this.center[1] ? this.children[0] : this.children[3];
    } else {
      return position[1] < this.center[1] ? this.children[1] : this.children[2];
    }
  }

  private addElementToZone(element: QuadTreeElement) {
    // 1. Fine the appropriate zone
    const zone = this.getZoneAtPosition(element.position);

    // 2. add the element to the found zone
    zone.add(element);
  }

  private split() {
    const halfSize = getCenter(this.dimensions);
    this.center = [
      this.position[0] + halfSize[0],
      this.position[1] + halfSize[1],
    ];

    this.children = createArray(
      4,
      i =>
        new QuadTree(
          halfSize,
          null,
          this.maxElementsPerQuad,
          this.getPositionForZone(i, halfSize),
          this.id + i + 1
        )
    );
    if (this.elements) {
      this.elements.forEach(element => this.addElementToZone(element));
      this.elements = null;
    }
  }

  private getPositionForZone(
    zoneIndex: number,
    halfSize: Dimensions
  ): Coordinates {
    switch (zoneIndex) {
      case 0:
        return this.position;
      case 1:
        return [this.position[0] + halfSize[0], this.position[1]];
      case 2:
        return [this.position[0] + halfSize[0], this.position[1] + halfSize[1]];
      case 3:
        return [this.position[0], this.position[1] + halfSize[1]];
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
              (avg: Coordinates, element: QuadTreeElement) => [
                avg[0] + element.position[0],
                avg[1] + element.position[1],
              ],
              [0, 0]
            )
            .map(v => v / this.elements.length) as Coordinates,
          weight: this.elements.length,
        };
      } else {
        if (!this.children) {
          return { center: [0, 0], weight: 0 };
        }
        const combined = this.children.reduce(
          (wc: WeightedCenter, child: QuadTree) => {
            const { center: childCenter, weight: childWeight } =
              child.getWeightedCenter();
            if (!childWeight) {
              return wc;
            }
            return {
              weight: wc.weight + childWeight,
              center: [
                wc.center[0] + childCenter[0] * childWeight,
                wc.center[1] + childCenter[1] * childWeight,
              ],
            };
          },
          { center: [0, 0], weight: 0 }
        );

        this.weightedCenter = {
          center: [
            combined.center[0] / combined.weight,
            combined.center[1] / combined.weight,
          ],
          weight: combined.weight,
        };
      }
    }
    return this.weightedCenter;
  }
}
