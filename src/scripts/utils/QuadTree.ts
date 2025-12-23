import { Coordinates, Dimensions } from '../types/position.types';
import { createArray } from './array_utils';
import { getCenter } from './position_utils';

export interface QuadTreeElement {
  position: Coordinates;
}

export default class QuadTree {
  elements: QuadTreeElement[];
  children: QuadTree[];

  private center: Coordinates;

  constructor(
    public readonly size: Dimensions,
    elements?: QuadTreeElement[],
    public readonly maxElementsPerQuad = 4
  ) {
    if (elements) {
      this.add(...elements);
    }
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
      return this;
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
    this.center = getCenter(this.size);
    this.children = createArray(
      4,
      () => new QuadTree(this.center, null, this.maxElementsPerQuad)
    );
    if (this.elements) {
      this.elements.forEach(element => this.addElementToZone(element));
      this.elements = null;
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
}
