import { describe, test, expect } from '@jest/globals';
import QuadTree from '../QuadTree';
import { createArray } from '../array_utils';
import { Coordinates, Dimensions } from '../../types/position.types';

describe('QuadTree', () => {
  test('has zones when number of elements exceeds maxElementsPerZone', () => {
    const quadTree = new QuadTree(
      [100, 100],
      [{ position: [0, 0] }, { position: [51, 1] }],
      { maxElementsPerQuad: 2 }
    );

    expect(quadTree.children).toBeUndefined();
    expect(quadTree.elements).toHaveLength(2);
  });

  test('has zones when number of elements exceeds maxElementsPerZone', () => {
    const quadTree = new QuadTree(
      [100, 100],
      [
        { position: [0, 0] },
        { position: [51, 1] },
        { position: [52, 2] },
        { position: [60, 10] },
        { position: [90, 10] },
        { position: [10, 75] },
      ],
      { maxElementsPerQuad: 2 }
    );

    expect(quadTree.children.size).toBe(3);
  });

  test('has zones when number of elements exceeds maxElementsPerZone', () => {
    const quadTree = new QuadTree(
      [100, 100],
      [
        { position: [0, 0] },
        { position: [51, 1] },
        { position: [52, 2] },
        { position: [60, 10] },
        { position: [90, 10] },
        { position: [10, 75] },
      ],
      { maxElementsPerQuad: 2 }
    );

    expect(quadTree.children.size).toBe(3);
  });

  test('getWeightedCenter returns the center of elements if elements are available', () => {
    const quadTree = new QuadTree(
      [10, 10],
      [{ position: [2, 0] }, { position: [6, 0] }, { position: [1, 3] }],
      { maxElementsPerQuad: 4 }
    );

    expect(quadTree.getWeightedCenter()).toEqual({ center: [3, 1], weight: 3 });
  });

  test('getWeightedCenter returns the center of children if children are available', () => {
    const quadTree = new QuadTree(
      [10, 10],
      [{ position: [2, 0] }, { position: [6, 0] }, { position: [1, 3] }],
      { maxElementsPerQuad: 2 }
    );
    expect(quadTree.getWeightedCenter()).toEqual({ center: [3, 1], weight: 3 });
  });

  test('create a QuadTree with many positions', () => {
    const dimensions: Dimensions = [1000, 1000];

    const nodes = createArray(50000, () => ({
      position: [Math.random() * 1000, Math.random() * 1000] as Coordinates,
    }));

    const quadTree = new QuadTree(dimensions, nodes);
  });
});
