import cases from 'jest-in-case';

import { runSimulatedAnnealing, SimulatedAnnealingArgs } from './index';

/**
 * Utility used for writing test cases with jest-in-case.
 */
export type TestObject<T = unknown, S = unknown> = {
  /**
   * Input arguments/data for a test case.
   */
  input: T;

  /**
   * Expected output for a test case.
   */
  output: S;
};

/**
 * Returns a deep copy of nested arrays.
 *
 * Copy the original groups so we can mutate the array with function scope,
 * producing 0 side-effects.
 */
const copyState = (state: number[][]): number[][] => {
  const result: number[][] = state.reduce(
    (accumulator: number[][], group: number[]) => {
      accumulator.push([...group]);
      return accumulator;
    },
    []
  );

  return result;
};

/**
 * Returns an integer between the given range.
 */
const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a 2-tuple of random numbers, each one being unique, meaning the
 * first element and second element cannot be the same.
 */
const generateUniqueRandomNumbers = (
  min: number,
  max: number
): [number, number] => {
  const randomGroupOne: number = generateRandomNumber(min, max);
  let randomGroupTwo: number = randomGroupOne;

  while (randomGroupOne === randomGroupTwo) {
    randomGroupTwo = generateRandomNumber(min, max);
  }

  return [randomGroupOne, randomGroupTwo];
};

/**
 * Returns the permutated groups after making a small permutation (ie: swapping
 * elements 2 random arrays).
 *
 * @param groups 2-D array of groups.
 * @returns Groups with a small permutation.
 */
const generateNewState = (groups: number[][]): number[][] => {
  const numGroups: number = groups.length;

  // If there are no groups populated return an empty array.
  if (!numGroups) return groups;

  // g1 represents the index of the first group to swap from...
  const [g1, g2]: [number, number] = generateUniqueRandomNumbers(
    0,
    numGroups - 1
  );

  const groupSize: number = groups[0]?.length;

  // i1 represents the index of the first element within group 1 to swap...
  const i1: number = generateRandomNumber(0, groupSize - 1);
  const i2: number = generateRandomNumber(0, groupSize - 1);

  // Copy the original groups so we can mutate the array with function scope,
  // producing 0 side-effects.
  const result: number[][] = copyState(groups);

  // Execute the swap.
  const temp: number = result[g1][i1];
  result[g1][i1] = result[g2][i2];
  result[g2][i2] = temp;

  return result;
};

/**
 * Returns the cost (in other words the cost function).
 */
const getCost = (state: number[][]): number => {
  // All the evens want to be together and all the odds want to be together.
  const preferences = {
    1: { 1: 2, 2: 0, 3: 2, 4: 0, 5: 2, 6: 0, 7: 2, 8: 0 },
    2: { 1: 0, 2: 2, 3: 0, 4: 2, 5: 0, 6: 2, 7: 0, 8: 2 },
    3: { 1: 2, 2: 0, 3: 2, 4: 0, 5: 2, 6: 0, 7: 2, 8: 0 },
    4: { 1: 0, 2: 2, 3: 0, 4: 2, 5: 0, 6: 2, 7: 0, 8: 2 },
    5: { 1: 2, 2: 0, 3: 2, 4: 0, 5: 2, 6: 0, 7: 2, 8: 0 },
    6: { 1: 0, 2: 2, 3: 0, 4: 2, 5: 0, 6: 2, 7: 0, 8: 2 },
    7: { 1: 2, 2: 0, 3: 2, 4: 0, 5: 2, 6: 0, 7: 2, 8: 0 },
    8: { 1: 0, 2: 2, 3: 0, 4: 2, 5: 0, 6: 2, 7: 0, 8: 2 },
  };

  const cost: number = state.reduce((accumulator: number, group: number[]) => {
    let groupQualityScore = 0;

    for (let i = 0; i < group.length - 1; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore b/c not sure why Typescript is complaining.
        groupQualityScore += preferences[group[i]][group[j]];
      }
    }

    return accumulator - (groupQualityScore ? Math.log(groupQualityScore) : 0);
  }, 0);

  return cost;
};

cases(
  'runSimulatedAnnealing()',
  ({
    input,
    output,
  }: TestObject<SimulatedAnnealingArgs<number[][]>, number[][]>) => {
    const actualResult: number[][] = runSimulatedAnnealing(input);

    // Ensure that both the group elements and the groups themselves are sorted.
    actualResult.forEach((group) => group.sort());
    actualResult.sort();

    // console.log(actualResult);

    expect(actualResult).toEqual(output);
  },
  {
    '4-elements.': {
      input: {
        copyState,
        generateNewState,
        getCost,
        initialState: [
          [1, 4],
          [2, 3],
        ],
      },
      output: [
        [1, 3],
        [2, 4],
      ],
    },

    '8-elements.': {
      input: {
        copyState,
        generateNewState,
        getCost,
        initialState: [
          [1, 2, 3, 4],
          [5, 6, 7, 8],
        ],
      },
      output: [
        [1, 3, 5, 7],
        [2, 4, 6, 8],
      ],
    },
  }
);
