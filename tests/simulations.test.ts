import { describe, it, expect } from "vitest";
import { runMontyHallSim, simulateMontyHallSingle } from "@/lib/simulations/monty-hall";
import {
  runBirthdaySim,
  theoreticalBirthdayProbability,
  calculatePairs,
} from "@/lib/simulations/birthday";
import {
  computeBaseRateBreakdown,
  calculateTheoreticalPPV,
  simulateInspectionBatch,
} from "@/lib/simulations/base-rate";
import { computeSimpsonSummary, BERKELEY_1973_DATA } from "@/lib/simulations/simpson";
import {
  analyzeMatchup,
  getCounterPick,
  runDiceDuelSim,
} from "@/lib/simulations/nontransitive-dice";
import {
  runBasicTwoChildrenSim,
  runTuesdayBoySim,
  generateTuesdayGridData,
} from "@/lib/simulations/two-children";
import { runParrondoEnsemble } from "@/lib/simulations/parrondo";
import { createRNG } from "@/lib/rng";

describe("5-1. Monty Hall Simulation", () => {
  it("should converge to switch ≈ 2/3 and stay ≈ 1/3 (100,000 trials)", () => {
    const res = runMontyHallSim(100000, 3, createRNG(12345));
    expect(res.switchWinRate).toBeCloseTo(2 / 3, 2);
    expect(res.stayWinRate).toBeCloseTo(1 / 3, 2);
    expect(res.switchWinRate + res.stayWinRate).toBeCloseTo(1, 4);
  });

  it("should support N doors (e.g. 100 doors)", () => {
    const res = runMontyHallSim(10000, 100, createRNG(54321));
    expect(res.switchWinRate).toBeCloseTo(99 / 100, 2);
    expect(res.stayWinRate).toBeCloseTo(1 / 100, 2);
  });

  it("single trial returns valid structure", () => {
    const single = simulateMontyHallSingle(3, true, createRNG(99));
    expect(single.revealedDoors.length).toBe(1);
    expect(single.revealedDoors[0]).not.toBe(single.initialChoice);
    expect(single.revealedDoors[0]).not.toBe(single.carDoor);
  });
});

describe("5-2. Birthday Paradox Simulation", () => {
  it("computes exact theoretical probabilities and pairs", () => {
    expect(calculatePairs(23)).toBe(253);
    expect(theoreticalBirthdayProbability(23)).toBeCloseTo(0.5073, 3);
    expect(theoreticalBirthdayProbability(70)).toBeCloseTo(0.9992, 3);
  });

  it("converges in Monte Carlo simulation (20,000 trials for n=23)", () => {
    const res = runBirthdaySim(20000, 23, createRNG(777));
    expect(res.collisionRate).toBeCloseTo(0.5073, 1);
  });
});

describe("5-3. Base Rate Fallacy Simulation", () => {
  it("computes PPV ≈ 9.02% for prevalence=0.1%, sensitivity=99%, specificity=99%", () => {
    const ppv = calculateTheoreticalPPV(0.001, 0.99, 0.99);
    expect(ppv).toBeCloseTo(0.09016, 4); // ≈ 9.02%

    const breakdown = computeBaseRateBreakdown({
      prevalence: 0.001,
      sensitivity: 0.99,
      specificity: 0.99,
      populationSize: 10000,
    });
    expect(breakdown.totalSick).toBe(10);
    expect(breakdown.totalHealthy).toBe(9990);
    expect(breakdown.truePositives).toBe(10);
    expect(breakdown.falsePositives).toBe(100);
    expect(breakdown.ppv).toBeCloseTo(0.0909, 2);
  });

  it("simulates batch inspections correctly categorizing TP, FP, TN, FN", () => {
    const batch = simulateInspectionBatch(
      10000,
      { prevalence: 0.001, sensitivity: 0.99, specificity: 0.99 },
      createRNG(12345)
    );
    expect(batch.count).toBe(10000);
    expect(batch.tp + batch.fp + batch.tn + batch.fn).toBe(10000);
    expect(batch.positives).toBe(batch.tp + batch.fp);
    expect(batch.negatives).toBe(batch.tn + batch.fn);
    expect(batch.lastCat).toBeDefined();
  });
});

describe("5-4. Simpson's Paradox", () => {
  it("shows female rate higher in 4 out of 6 departments, yet lower overall", () => {
    const summary = computeSimpsonSummary(BERKELEY_1973_DATA);
    expect(summary.departmentsWhereFemaleLeads).toEqual(["A", "B", "D", "F"]);
    expect(summary.departmentsWhereFemaleLeads.length).toBe(4);

    // Overall aggregate rates
    expect(summary.overallMaleRate).toBeGreaterThan(summary.overallFemaleRate);
    expect(summary.overallMaleRate).toBeCloseTo(0.445, 2);
    expect(summary.overallFemaleRate).toBeCloseTo(0.304, 2);
  });
});

describe("5-5. Nontransitive Dice (Efron's Dice)", () => {
  it("verifies A>B, B>C, C>D, D>A all equal 24/36 = 2/3", () => {
    const ab = analyzeMatchup("A", "B");
    expect(ab.die1Wins).toBe(24);
    expect(ab.die1WinRate).toBeCloseTo(2 / 3, 4);

    const bc = analyzeMatchup("B", "C");
    expect(bc.die1Wins).toBe(24);
    expect(bc.die1WinRate).toBeCloseTo(2 / 3, 4);

    const cd = analyzeMatchup("C", "D");
    expect(cd.die1Wins).toBe(24);
    expect(cd.die1WinRate).toBeCloseTo(2 / 3, 4);

    const da = analyzeMatchup("D", "A");
    expect(da.die1Wins).toBe(24);
    expect(da.die1WinRate).toBeCloseTo(2 / 3, 4);
  });

  it("verifies counter-pick logic", () => {
    expect(getCounterPick("A")).toBe("D");
    expect(getCounterPick("B")).toBe("A");
    expect(getCounterPick("C")).toBe("B");
    expect(getCounterPick("D")).toBe("C");
  });

  it("simulates dice duels with convergence", () => {
    const duel = runDiceDuelSim("A", "B", 10000, createRNG(42));
    expect(duel.die1WinRate).toBeCloseTo(2 / 3, 1);
  });
});

describe("5-6. Two Children Paradox", () => {
  it("basic version converges to 1/3 (≈ 0.333)", () => {
    const res = runBasicTwoChildrenSim(20000, createRNG(42));
    expect(res.bothBoysRate).toBeCloseTo(1 / 3, 1);
  });

  it("Tuesday boy version grid has 27 accepted and 13 both boys (13/27 ≈ 0.4815)", () => {
    const gridData = generateTuesdayGridData(2);
    expect(gridData.acceptedCount).toBe(27);
    expect(gridData.bothBoysCount).toBe(13);
    expect(13 / 27).toBeCloseTo(0.4815, 3);
  });

  it("Tuesday boy simulation converges to 13/27", () => {
    const sim = runTuesdayBoySim(20000, "Tue", createRNG(42));
    expect(sim.bothBoysRate).toBeCloseTo(13 / 27, 1);
  });
});

describe("5-7. Parrondo's Paradox", () => {
  it("proves A and B lose separately, but alternating ABAB gains capital", () => {
    const res = runParrondoEnsemble(200, 300, { epsilon: 0.005 }, createRNG(12345));
    expect(res.finalCapital.A).toBeLessThan(0); // A loses
    expect(res.finalCapital.B).toBeLessThan(0); // B loses
    expect(res.finalCapital.ABAB).toBeGreaterThan(0); // ABAB wins!
  });
});
