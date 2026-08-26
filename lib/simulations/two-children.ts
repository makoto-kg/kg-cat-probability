import { createRNG, PRNG, randomInt } from "../rng";

export type Gender = "B" | "G"; // Boy, Girl
export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export interface Child {
  gender: Gender;
  day: DayOfWeek;
  dayIndex: number; // 0..6
}

export interface Family {
  child1: Child;
  child2: Child;
}

export interface TwoChildrenSimResult {
  acceptedTrials: number;
  bothBoysCount: number;
  bothBoysRate: number;
  theoreticalRate: number;
}

/**
 * Generates a random 2-child family.
 */
export function generateFamily(rng: PRNG = Math.random): Family {
  const g1: Gender = rng() < 0.5 ? "B" : "G";
  const d1 = randomInt(0, 6, rng);
  const g2: Gender = rng() < 0.5 ? "B" : "G";
  const d2 = randomInt(0, 6, rng);

  return {
    child1: { gender: g1, day: DAYS_OF_WEEK[d1], dayIndex: d1 },
    child2: { gender: g2, day: DAYS_OF_WEEK[d2], dayIndex: d2 },
  };
}

/**
 * Rejection sampling simulation for basic problem:
 * "Given at least one boy, what is the probability both are boys?" (Theoretical: 1/3)
 */
export function runBasicTwoChildrenSim(
  targetAccepted: number = 10000,
  rng: PRNG = createRNG(42)
): TwoChildrenSimResult {
  let accepted = 0;
  let bothBoys = 0;

  while (accepted < targetAccepted) {
    const fam = generateFamily(rng);
    const hasBoy = fam.child1.gender === "B" || fam.child2.gender === "B";
    if (hasBoy) {
      accepted++;
      if (fam.child1.gender === "B" && fam.child2.gender === "B") {
        bothBoys++;
      }
    }
  }

  return {
    acceptedTrials: accepted,
    bothBoysCount: bothBoys,
    bothBoysRate: bothBoys / accepted,
    theoreticalRate: 1 / 3,
  };
}

/**
 * Rejection sampling simulation for Tuesday Boy problem:
 * "Given at least one Tuesday boy, what is the probability both are boys?" (Theoretical: 13/27)
 */
export function runTuesdayBoySim(
  targetAccepted: number = 10000,
  targetDay: DayOfWeek = "Tue",
  rng: PRNG = createRNG(42)
): TwoChildrenSimResult {
  let accepted = 0;
  let bothBoys = 0;

  while (accepted < targetAccepted) {
    const fam = generateFamily(rng);
    const c1Matches = fam.child1.gender === "B" && fam.child1.day === targetDay;
    const c2Matches = fam.child2.gender === "B" && fam.child2.day === targetDay;

    if (c1Matches || c2Matches) {
      accepted++;
      if (fam.child1.gender === "B" && fam.child2.gender === "B") {
        bothBoys++;
      }
    }
  }

  return {
    acceptedTrials: accepted,
    bothBoysCount: bothBoys,
    bothBoysRate: bothBoys / accepted,
    theoreticalRate: 13 / 27,
  };
}

/**
 * Generates the 14x14 grid data for Tuesday Boy visual proof.
 */
export function generateTuesdayGridData(targetDayIndex: number = 2) {
  // 14 outcomes per child: 0..6 (Boy Sun..Sat), 7..13 (Girl Sun..Sat)
  const grid: {
    r: number;
    c: number;
    c1Gender: Gender;
    c1Day: number;
    c2Gender: Gender;
    c2Day: number;
    isAccepted: boolean;
    isBothBoys: boolean;
  }[][] = [];

  let acceptedCount = 0;
  let bothBoysCount = 0;

  for (let r = 0; r < 14; r++) {
    const row = [];
    const c1Gender: Gender = r < 7 ? "B" : "G";
    const c1Day = r % 7;

    for (let c = 0; c < 14; c++) {
      const c2Gender: Gender = c < 7 ? "B" : "G";
      const c2Day = c % 7;

      const isC1Target = c1Gender === "B" && c1Day === targetDayIndex;
      const isC2Target = c2Gender === "B" && c2Day === targetDayIndex;
      const isAccepted = isC1Target || isC2Target;
      const isBothBoys = isAccepted && c1Gender === "B" && c2Gender === "B";

      if (isAccepted) acceptedCount++;
      if (isBothBoys) bothBoysCount++;

      row.push({
        r,
        c,
        c1Gender,
        c1Day,
        c2Gender,
        c2Day,
        isAccepted,
        isBothBoys,
      });
    }
    grid.push(row);
  }

  return { grid, acceptedCount, bothBoysCount };
}
