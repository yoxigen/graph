import { describe, test, expect } from '@jest/globals';
import QuadTree from '../QuadTree';
import { createArray } from '../array_utils';
import { Coordinates, Dimensions } from '../../types/position.types';
import GraphPositions from '../../visualizations/graph/Graph.positions';
import CoordinatesList from '../CoordinatesList';

describe('QuadTree', () => {
  test('has zones when number of elements exceeds maxElementsPerZone', () => {
    const quadTree = new QuadTree(
      100,
      new GraphPositions({
        positions: [
          [0, 0],
          [51, 1],
        ],
      }),
      { maxElementsPerQuad: 2 }
    );

    expect(quadTree.children).toBeUndefined();
    expect(quadTree.elements).toHaveLength(2);
  });

  test('has zones when number of elements exceeds maxElementsPerZone', () => {
    const quadTree = new QuadTree(
      100,
      new GraphPositions({
        positions: [
          [0, 0],
          [51, 1],
          [52, 2],
          [60, 10],
          [90, 10],
          [10, 75],
        ],
      }),
      { maxElementsPerQuad: 2 }
    );

    expect(quadTree.children.size).toBe(3);
  });

  test('has zones when number of elements exceeds maxElementsPerZone', () => {
    const quadTree = new QuadTree(
      100,
      new GraphPositions({
        positions: [
          [0, 0],
          [51, 1],
          [52, 2],
          [60, 10],
          [90, 10],
          [10, 75],
        ],
      }),
      { maxElementsPerQuad: 2 }
    );

    expect(quadTree.children.size).toBe(3);
  });

  test('getWeightedCenter returns the center of elements if elements are available', () => {
    const quadTree = new QuadTree(
      10,
      new GraphPositions({
        positions: [
          [2, 0],
          [6, 0],
          [1, 3],
        ],
      }),
      { maxElementsPerQuad: 4 }
    );

    expect(quadTree.getWeightedCenter()).toEqual({ center: [3, 1], weight: 3 });
  });

  test('getWeightedCenter returns the center of children if children are available', () => {
    const quadTree = new QuadTree(
      10,
      new GraphPositions({
        positions: [
          [2, 0],
          [6, 0],
          [1, 3],
        ],
      }),
      { maxElementsPerQuad: 2 }
    );
    expect(quadTree.getWeightedCenter()).toEqual({ center: [3, 1], weight: 3 });
  });

  test('finds an element at position', () => {
    const quadTree = new QuadTree(
      100,
      new GraphPositions({
        positions: [
          [0, 0],
          [51, 1],
          [52, 2],
          [60, 10],
          [90, 10],
          [10, 75],
        ],
      }),
      { maxElementsPerQuad: 2 }
    );
    const result = quadTree.findElementAt(62, 11, 10)?.id;
    expect(result).toEqual(3);
  });

  test("finds an element at position even when the position is not in the element's quad", () => {
    const quadTree = new QuadTree(
      100,
      new GraphPositions({
        positions: [
          [0, 0],
          [51, 1],
          [30, 48],
          [60, 10],
          [90, 10],
          [10, 75],
        ],
      }),
      { maxElementsPerQuad: 2 }
    );
    const result = quadTree.findElementAt(31, 52, 10).id;
    expect(result).toEqual(2);
  });
});
