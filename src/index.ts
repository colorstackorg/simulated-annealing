type SimulatedAnnealingOptions = {
  /**
   * Constant that decreases the temperature with each iteration.
   * Used like this: temperature = temperature * coolingFactor
   */
  coolingFactor?: number;

  /**
   * Initial temperature that we start the system with. Defaults to 1.0.
   */
  initialTemperature?: number;

  /**
   * Minimum temperature that will dictate when the algorithm is is finished.
   * Defaults to 0.00001.
   */
  minimumTemperature?: number;

  /**
   * # of "random neighbors" to generate and try (calculate cost) with each
   * temperature.
   */
  swapsPerTemperature?: number;
};

export type SimulatedAnnealingArgs<T> = {
  /**
   * Returns a deeply copied state. We use this in order to ensure that we
   * don't produce any side-effects.
   */
  copyState: (state: T) => T;

  /**
   * Returns a "neighboring" solution/state. Should only make 1 "swap" or
   * "change" in the state. For example, swapping 2 values within an array.
   * This change must also be a "random" change in order for the algorithm
   * to work.
   */
  generateNewState: (state: T) => T;

  /**
   * Returns the total cost of the given state.
   */
  getCost: (state: T) => number;

  /**
   * Initial state to start off with.
   */
  initialState: T;

  /**
   * Configurable options for the simulated annealing algorithm, which control
   * the cooling schedule and time constraints of the algorithm.
   */
  options?: SimulatedAnnealingOptions;
};

/**
 * Returns the best state found after running the simulated annealing algorithm
 * on the initial state.
 *
 * The algorithm does this by minimizing the cost function after making random
 * permutations to each state.
 */
export function runSimulatedAnnealing<T>({
  copyState,
  generateNewState,
  getCost,
  initialState,
  options,
}: SimulatedAnnealingArgs<T>): T {
  const {
    coolingFactor = 0.99,
    initialTemperature = 1,
    minimumTemperature = 0.00001,
    swapsPerTemperature = 10,
  } = options ?? {};

  // Initialize the current state, cost and temperature.
  let currentState: T = copyState(initialState);
  let currentCost: number = getCost(initialState);
  let currentTemperature: number = initialTemperature;

  // Initialize the best state (which is what we're going to end up returning).
  // We track this because just in case we accept a worse solution later, we
  // still have the best state that we've ever found ready to return.
  let bestState: T = copyState(initialState);
  let bestCost: number = getCost(initialState);

  while (currentTemperature > minimumTemperature) {
    for (let i = 0; i < swapsPerTemperature; i += 1) {
      // The "neighboring" solution, only one thing should have changed between
      // the previous state and this state.
      const neighborState: T = generateNewState(currentState);

      // Calculate the neighboring state's cost.
      const neighborCost: number = getCost(neighborState);
      const changeInCost: number = neighborCost - currentCost;

      if (
        changeInCost < 0 ||
        Math.exp(-changeInCost / currentTemperature) > Math.random()
      ) {
        currentState = neighborState;
        currentCost = neighborCost;
      }

      if (neighborCost < bestCost) {
        bestState = neighborState;
        bestCost = neighborCost;
      }
    }

    currentTemperature *= coolingFactor;
  }

  return bestState;
}
