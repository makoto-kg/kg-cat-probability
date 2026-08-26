import { createRNG, PRNG, randomInt } from "../rng";

export interface BirthdayTrialResult {
  numPeople: number;
  birthdays: number[]; // day of year 0..364
  hasCollision: boolean;
  collisionDays: number[];
  collisionIndices: number[];
  pairCount: number; // n * (n - 1) / 2
}

export interface BirthdayBatchResult {
  numPeople: number;
  totalTrials: number;
  collisionCount: number;
  collisionRate: number;
  theoreticalRate: number;
  pairCount: number;
}

/**
 * Calculates exact theoretical probability of at least one shared birthday among N people (365 days).
 */
export function theoreticalBirthdayProbability(n: number): number {
  if (n <= 1) return 0;
  if (n >= 365) return 1;

  let noCollisionProb = 1.0;
  for (let i = 0; i < n; i++) {
    noCollisionProb *= (365 - i) / 365;
  }
  return 1 - noCollisionProb;
}

/**
 * Calculates number of pairs nC2.
 */
export function calculatePairs(n: number): number {
  return (n * (n - 1)) / 2;
}

/**
 * Runs a single birthday trial with N people.
 */
export function simulateBirthdaySingle(
  numPeople: number = 23,
  rng: PRNG = Math.random
): BirthdayTrialResult {
  const birthdays: number[] = [];
  const counts = new Map<number, number[]>();

  for (let i = 0; i < numPeople; i++) {
    const day = randomInt(0, 364, rng);
    birthdays.push(day);
    const existing = counts.get(day) || [];
    existing.push(i);
    counts.set(day, existing);
  }

  const collisionDays: number[] = [];
  const collisionIndices: number[] = [];

  counts.forEach((indices, day) => {
    if (indices.length > 1) {
      collisionDays.push(day);
      collisionIndices.push(...indices);
    }
  });

  return {
    numPeople,
    birthdays,
    hasCollision: collisionDays.length > 0,
    collisionDays,
    collisionIndices,
    pairCount: calculatePairs(numPeople),
  };
}

/**
 * Runs batch simulation for birthday paradox.
 */
export function runBirthdaySim(
  trials: number = 10000,
  numPeople: number = 23,
  rng: PRNG = createRNG(42)
): BirthdayBatchResult {
  let collisions = 0;

  for (let t = 0; t < trials; t++) {
    const seen = new Uint8Array(365);
    let hit = false;
    for (let i = 0; i < numPeople; i++) {
      const day = randomInt(0, 364, rng);
      if (seen[day] === 1) {
        hit = true;
        break;
      }
      seen[day] = 1;
    }
    if (hit) collisions++;
  }

  return {
    numPeople,
    totalTrials: trials,
    collisionCount: collisions,
    collisionRate: collisions / trials,
    theoreticalRate: theoreticalBirthdayProbability(numPeople),
    pairCount: calculatePairs(numPeople),
  };
}
