import { describe, test, expect } from '@jest/globals';
import QuadTree from '../QuadTree';

describe('QuadTree', () => {
  test('has zones when number of elements exceeds maxElementsPerZone', () => {
    const quadTree = new QuadTree(
      [100, 100],
      [{ position: [0, 0] }, { position: [51, 1] }],
      2
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
        { position: [0, 0] },
      ],
      2
    );

    expect(quadTree.children).toHaveLength(4);
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
        { position: [0, 0] },
      ],
      2
    );

    expect(quadTree.children).toHaveLength(4);
  });

  test('getWeightedCenter returns the center of elements if elements are available', () => {
    const quadTree = new QuadTree(
      [10, 10],
      [{ position: [2, 0] }, { position: [6, 0] }, { position: [1, 3] }],
      4
    );

    expect(quadTree.getWeightedCenter()).toEqual({ center: [3, 1], weight: 3 });
  });

  test('getWeightedCenter returns the center of children if children are available', () => {
    const quadTree = new QuadTree(
      [10, 10],
      [{ position: [2, 0] }, { position: [6, 0] }, { position: [1, 3] }],
      2
    );
    console.log('QUAD', quadTree);
    expect(quadTree.getWeightedCenter()).toEqual({ center: [3, 1], weight: 3 });
  });
});
