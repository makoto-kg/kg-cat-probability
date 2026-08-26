import { createRNG, PRNG, sample } from "../rng";

export type DieName = "A" | "B" | "C" | "D";

export const EFRON_DICE: Record<DieName, readonly number[]> = {
  A: [4, 4, 4, 4, 0, 0],
  B: [3, 3, 3, 3, 3, 3],
  C: [6, 6, 2, 2, 2, 2],
  D: [5, 5, 5, 1, 1, 1],
} as const;

export const DIE_COLORS: Record<DieName, { bg: string; text: string; name: string }> = {
  A: { bg: "#ef4444", text: "#fee2e2", name: "赤ダイス (A)" },
  B: { bg: "#3b82f6", text: "#dbeafe", name: "青ダイス (B)" },
  C: { bg: "#10b981", text: "#d1fae5", name: "緑ダイス (C)" },
  D: { bg: "#f59e0b", text: "#fef3c7", name: "黄ダイス (D)" },
};

export interface MatchupMatrixCell {
  die1Value: number;
  die2Value: number;
  winner: 1 | 2 | 0; // 1: die1 wins, 2: die2 wins, 0: tie
}

export interface MatchupAnalysis {
  die1: DieName;
  die2: DieName;
  matrix: MatchupMatrixCell[][]; // 6x6
  die1Wins: number;
  die2Wins: number;
  ties: number;
  die1WinRate: number;
  die2WinRate: number;
}

/**
 * Computes exact 6x6 matrix and win rates for two dice.
 */
export function analyzeMatchup(die1: DieName, die2: DieName): MatchupAnalysis {
  const faces1 = EFRON_DICE[die1];
  const faces2 = EFRON_DICE[die2];

  let die1Wins = 0;
  let die2Wins = 0;
  let ties = 0;

  const matrix: MatchupMatrixCell[][] = [];

  for (let i = 0; i < 6; i++) {
    const row: MatchupMatrixCell[] = [];
    for (let j = 0; j < 6; j++) {
      const v1 = faces1[i];
      const v2 = faces2[j];
      let winner: 1 | 2 | 0 = 0;
      if (v1 > v2) {
        winner = 1;
        die1Wins++;
      } else if (v2 > v1) {
        winner = 2;
        die2Wins++;
      } else {
        ties++;
      }
      row.push({ die1Value: v1, die2Value: v2, winner });
    }
    matrix.push(row);
  }

  const total = 36;
  return {
    die1,
    die2,
    matrix,
    die1Wins,
    die2Wins,
    ties,
    die1WinRate: die1Wins / total,
    die2WinRate: die2Wins / total,
  };
}

/**
 * Returns the winning counter-die against player's pick.
 * A < D, B < A, C < B, D < C
 */
export function getCounterPick(playerPick: DieName): DieName {
  switch (playerPick) {
    case "A":
      return "D";
    case "B":
      return "A";
    case "C":
      return "B";
    case "D":
      return "C";
  }
}

/**
 * Rolls a die once.
 */
export function rollDie(die: DieName, rng: PRNG = Math.random): number {
  return sample(EFRON_DICE[die], rng);
}

/**
 * Simulates N duels between two dice.
 */
export function runDiceDuelSim(
  die1: DieName,
  die2: DieName,
  trials: number = 10000,
  rng: PRNG = createRNG(42)
): {
  die1Wins: number;
  die2Wins: number;
  ties: number;
  die1WinRate: number;
  die2WinRate: number;
} {
  let die1Wins = 0;
  let die2Wins = 0;
  let ties = 0;

  for (let i = 0; i < trials; i++) {
    const r1 = rollDie(die1, rng);
    const r2 = rollDie(die2, rng);
    if (r1 > r2) die1Wins++;
    else if (r2 > r1) die2Wins++;
    else ties++;
  }

  return {
    die1Wins,
    die2Wins,
    ties,
    die1WinRate: die1Wins / trials,
    die2WinRate: die2Wins / trials,
  };
}
