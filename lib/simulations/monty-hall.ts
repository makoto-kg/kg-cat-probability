import { createRNG, PRNG, randomInt } from "../rng";

export interface MontyHallTrialResult {
  carDoor: number;
  initialChoice: number;
  revealedDoors: number[];
  finalChoice: number;
  switched: boolean;
  won: boolean;
}

export interface MontyHallBatchResult {
  numDoors: number;
  totalTrials: number;
  stayWins: number;
  switchWins: number;
  stayWinRate: number;
  switchWinRate: number;
  theoreticalStay: number;
  theoreticalSwitch: number;
}

/**
 * Executes a single Monty Hall trial.
 * @param numDoors Number of doors (3 or more)
 * @param shouldSwitch Whether the player switches doors
 * @param rng PRNG function
 */
export function simulateMontyHallSingle(
  numDoors: number = 3,
  shouldSwitch: boolean = true,
  rng: PRNG = Math.random
): MontyHallTrialResult {
  const carDoor = randomInt(0, numDoors - 1, rng);
  const initialChoice = randomInt(0, numDoors - 1, rng);

  // Host reveals (numDoors - 2) doors that are neither the car nor the initial choice
  const availableToReveal: number[] = [];
  for (let i = 0; i < numDoors; i++) {
    if (i !== initialChoice && i !== carDoor) {
      availableToReveal.push(i);
    }
  }

  // Shuffle available to reveal
  const revealedDoors: number[] = [];
  const revealCount = numDoors - 2;
  const pool = [...availableToReveal];
  while (revealedDoors.length < revealCount && pool.length > 0) {
    const idx = randomInt(0, pool.length - 1, rng);
    revealedDoors.push(pool.splice(idx, 1)[0]);
  }

  // If car was chosen initially, availableToReveal had (numDoors - 1) options, so 1 door remains unopened besides initialChoice.
  // If car was not chosen, carDoor was not in availableToReveal, so the unopened door is the carDoor!
  let remainingUnopened = -1;
  for (let i = 0; i < numDoors; i++) {
    if (i !== initialChoice && !revealedDoors.includes(i)) {
      remainingUnopened = i;
      break;
    }
  }

  const finalChoice = shouldSwitch ? remainingUnopened : initialChoice;
  const won = finalChoice === carDoor;

  return {
    carDoor,
    initialChoice,
    revealedDoors,
    finalChoice,
    switched: shouldSwitch,
    won,
  };
}

/**
 * Runs a fast batch simulation of Monty Hall.
 */
export function runMontyHallSim(
  trials: number = 10000,
  numDoors: number = 3,
  rng: PRNG = createRNG(42)
): MontyHallBatchResult {
  let stayWins = 0;
  let switchWins = 0;

  for (let i = 0; i < trials; i++) {
    const carDoor = randomInt(0, numDoors - 1, rng);
    const initialChoice = randomInt(0, numDoors - 1, rng);

    if (initialChoice === carDoor) {
      stayWins++;
    } else {
      // In Monty Hall with N doors and N-2 revealed, switching wins whenever initial pick was wrong
      switchWins++;
    }
  }

  return {
    numDoors,
    totalTrials: trials,
    stayWins,
    switchWins,
    stayWinRate: stayWins / trials,
    switchWinRate: switchWins / trials,
    theoreticalStay: 1 / numDoors,
    theoreticalSwitch: (numDoors - 1) / numDoors,
  };
}
