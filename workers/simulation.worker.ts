import { runMontyHallSim } from "../lib/simulations/monty-hall";
import { runBirthdaySim } from "../lib/simulations/birthday";
import { computeBaseRateBreakdown } from "../lib/simulations/base-rate";
import { runDiceDuelSim, DieName } from "../lib/simulations/nontransitive-dice";
import { runBasicTwoChildrenSim, runTuesdayBoySim } from "../lib/simulations/two-children";
import { runParrondoEnsemble } from "../lib/simulations/parrondo";
import { createRNG } from "../lib/rng";

export interface WorkerRequest {
  id: string;
  topic:
    | "monty-hall"
    | "birthday"
    | "base-rate"
    | "nontransitive-dice"
    | "two-children"
    | "parrondo";
  params: Record<string, unknown>;
  trials?: number;
  seed?: number;
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, topic, params, trials = 10000, seed } = e.data;
  const rng = createRNG(seed ?? Date.now());

  try {
    let result: unknown;
    switch (topic) {
      case "monty-hall": {
        const numDoors = (params.numDoors as number) || 3;
        result = runMontyHallSim(trials, numDoors, rng);
        break;
      }
      case "birthday": {
        const numPeople = (params.numPeople as number) || 23;
        result = runBirthdaySim(trials, numPeople, rng);
        break;
      }
      case "base-rate": {
        const prevalence = (params.prevalence as number) ?? 0.001;
        const sensitivity = (params.sensitivity as number) ?? 0.99;
        const specificity = (params.specificity as number) ?? 0.99;
        const populationSize = (params.populationSize as number) ?? 10000;
        result = computeBaseRateBreakdown({
          prevalence,
          sensitivity,
          specificity,
          populationSize,
        });
        break;
      }
      case "nontransitive-dice": {
        const die1 = params.die1 as DieName;
        const die2 = params.die2 as DieName;
        result = runDiceDuelSim(die1, die2, trials, rng);
        break;
      }
      case "two-children": {
        const mode = params.mode as "basic" | "tuesday";
        if (mode === "tuesday") {
          result = runTuesdayBoySim(trials, "Tue", rng);
        } else {
          result = runBasicTwoChildrenSim(trials, rng);
        }
        break;
      }
      case "parrondo": {
        const steps = (params.steps as number) || 500;
        const numPaths = Math.min(trials, 1000);
        result = runParrondoEnsemble(numPaths, steps, { epsilon: 0.005 }, rng);
        break;
      }
      default:
        throw new Error(`Unknown topic: ${topic}`);
    }

    self.postMessage({ id, success: true, result } as WorkerResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ id, success: false, error: message } as WorkerResponse);
  }
};
