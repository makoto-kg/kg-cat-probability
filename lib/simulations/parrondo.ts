import { createRNG, PRNG } from "../rng";

export interface ParrondoConfig {
  epsilon?: number; // default 0.005
  pA?: number; // 0.5 - epsilon
  pB_bad?: number; // 0.1 - epsilon (when capital % 3 === 0)
  pB_good?: number; // 0.75 - epsilon (when capital % 3 !== 0)
}

export interface TrajectoryPoint {
  step: number;
  capitalA: number;
  capitalB: number;
  capitalABAB: number;
  capitalRandom: number;
}

export interface ParrondoSimResult {
  steps: number;
  trajectories: TrajectoryPoint[];
  finalCapital: {
    A: number;
    B: number;
    ABAB: number;
    Random: number;
  };
}

function mod3(n: number): number {
  return ((n % 3) + 3) % 3;
}

export function playParrondoGameA(capital: number, config: ParrondoConfig, rng: PRNG): number {
  const eps = config.epsilon ?? 0.005;
  const pWin = (config.pA ?? 0.5) - eps;
  return rng() < pWin ? capital + 1 : capital - 1;
}

export function playParrondoGameB(capital: number, config: ParrondoConfig, rng: PRNG): number {
  const eps = config.epsilon ?? 0.005;
  const state = mod3(capital);
  const isMultipleOf3 = state === 0;
  const pWin = isMultipleOf3 ? (config.pB_bad ?? 0.1) - eps : (config.pB_good ?? 0.75) - eps;
  return rng() < pWin ? capital + 1 : capital - 1;
}

export function runParrondoSim(
  steps: number = 500,
  config: ParrondoConfig = { epsilon: 0.005 },
  rng: PRNG = createRNG(42)
): ParrondoSimResult {
  let capA = 0;
  let capB = 0;
  let capABAB = 0;
  let capRandom = 0;

  const trajectories: TrajectoryPoint[] = [
    { step: 0, capitalA: 0, capitalB: 0, capitalABAB: 0, capitalRandom: 0 },
  ];

  for (let s = 1; s <= steps; s++) {
    capA = playParrondoGameA(capA, config, rng);
    capB = playParrondoGameB(capB, config, rng);

    // Alternating (AABB or ABAB) - AABB is standard in literature (Game A twice, Game B twice)
    // Both AABB and ABAB produce positive drift
    if (s % 2 === 1) {
      capABAB = playParrondoGameA(capABAB, config, rng);
    } else {
      capABAB = playParrondoGameB(capABAB, config, rng);
    }

    if (rng() < 0.5) {
      capRandom = playParrondoGameA(capRandom, config, rng);
    } else {
      capRandom = playParrondoGameB(capRandom, config, rng);
    }

    if (steps <= 200 || s % Math.ceil(steps / 200) === 0 || s === steps) {
      trajectories.push({
        step: s,
        capitalA: capA,
        capitalB: capB,
        capitalABAB: capABAB,
        capitalRandom: capRandom,
      });
    }
  }

  return {
    steps,
    trajectories,
    finalCapital: {
      A: capA,
      B: capB,
      ABAB: capABAB,
      Random: capRandom,
    },
  };
}

export function runParrondoEnsemble(
  numPaths: number = 500,
  steps: number = 500,
  config: ParrondoConfig = { epsilon: 0.005 },
  rng: PRNG = createRNG(42)
): ParrondoSimResult {
  const sampleRate = steps <= 200 ? 1 : Math.ceil(steps / 200);

  const stepIndices: number[] = [0];
  for (let s = 1; s <= steps; s++) {
    if (s % sampleRate === 0 || s === steps) {
      stepIndices.push(s);
    }
  }

  const sums = stepIndices.map((s) => ({
    step: s,
    capitalA: 0,
    capitalB: 0,
    capitalABAB: 0,
    capitalRandom: 0,
  }));

  for (let p = 0; p < numPaths; p++) {
    let capA = 0;
    let capB = 0;
    let capABAB = 0;
    let capRandom = 0;
    let sumIdx = 1;

    for (let s = 1; s <= steps; s++) {
      capA = playParrondoGameA(capA, config, rng);
      capB = playParrondoGameB(capB, config, rng);

      // AABB pattern (2 of A, 2 of B) or ABAB
      if (s % 4 === 1 || s % 4 === 2) {
        capABAB = playParrondoGameA(capABAB, config, rng);
      } else {
        capABAB = playParrondoGameB(capABAB, config, rng);
      }

      if (rng() < 0.5) {
        capRandom = playParrondoGameA(capRandom, config, rng);
      } else {
        capRandom = playParrondoGameB(capRandom, config, rng);
      }

      if (s === stepIndices[sumIdx]) {
        sums[sumIdx].capitalA += capA;
        sums[sumIdx].capitalB += capB;
        sums[sumIdx].capitalABAB += capABAB;
        sums[sumIdx].capitalRandom += capRandom;
        sumIdx++;
      }
    }
  }

  const trajectories = sums.map((item) => ({
    step: item.step,
    capitalA: item.step === 0 ? 0 : Math.round((item.capitalA / numPaths) * 10) / 10,
    capitalB: item.step === 0 ? 0 : Math.round((item.capitalB / numPaths) * 10) / 10,
    capitalABAB: item.step === 0 ? 0 : Math.round((item.capitalABAB / numPaths) * 10) / 10,
    capitalRandom: item.step === 0 ? 0 : Math.round((item.capitalRandom / numPaths) * 10) / 10,
  }));

  const final = trajectories[trajectories.length - 1];

  return {
    steps,
    trajectories,
    finalCapital: {
      A: final.capitalA,
      B: final.capitalB,
      ABAB: final.capitalABAB,
      Random: final.capitalRandom,
    },
  };
}
