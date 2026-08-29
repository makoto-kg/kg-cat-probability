import { createRNG, PRNG } from "../rng";

export interface BaseRateParams {
  prevalence: number; // e.g. 0.001 (0.1%)
  sensitivity: number; // e.g. 0.99 (99%)
  specificity: number; // e.g. 0.99 (99%)
  populationSize?: number; // default 10,000 (100x100)
}

export interface BaseRateBreakdown {
  populationSize: number;
  totalSick: number;
  totalHealthy: number;
  truePositives: number;
  falseNegatives: number;
  falsePositives: number;
  trueNegatives: number;
  totalPositives: number;
  totalNegatives: number;
  ppv: number; // Positive Predictive Value P(Sick | Positive)
  npv: number; // Negative Predictive Value P(Healthy | Negative)
  theoreticalPPV: number;
}

export type PersonCategory = "TP" | "FP" | "FN" | "TN";

export interface SingleInspectionResult {
  id: number;
  isSick: boolean;
  testResult: "positive" | "negative";
  category: PersonCategory;
}

export interface InspectionBatchResult {
  count: number;
  tp: number; // 真陽性
  fp: number; // 偽陽性（誤診）
  tn: number; // 真陰性
  fn: number; // 偽陰性（見逃し）
  positives: number;
  negatives: number;
  ppv: number;
  lastCat?: SingleInspectionResult;
}

export interface GridPerson {
  id: number;
  isSick: boolean;
  testPositive: boolean;
  category: PersonCategory;
  gridX: number; // 0..99
  gridY: number; // 0..99
  quadrantX: number;
  quadrantY: number;
}

/**
 * Calculates theoretical PPV (Positive Predictive Value).
 */
export function calculateTheoreticalPPV(
  prevalence: number,
  sensitivity: number,
  specificity: number
): number {
  const pSick = prevalence;
  const pHealthy = 1 - prevalence;
  const pPosGivenSick = sensitivity;
  const pPosGivenHealthy = 1 - specificity;

  const pTruePos = pSick * pPosGivenSick;
  const pFalsePos = pHealthy * pPosGivenHealthy;
  const totalPos = pTruePos + pFalsePos;

  if (totalPos === 0) return 0;
  return pTruePos / totalPos;
}

/**
 * Computes exact population counts and PPV for given parameters.
 */
export function computeBaseRateBreakdown(params: BaseRateParams): BaseRateBreakdown {
  const populationSize = params.populationSize ?? 10000;
  const { prevalence, sensitivity, specificity } = params;

  const totalSick = Math.round(populationSize * prevalence);
  const totalHealthy = populationSize - totalSick;

  const truePositives = Math.round(totalSick * sensitivity);
  const falseNegatives = totalSick - truePositives;

  const falsePositives = Math.round(totalHealthy * (1 - specificity));
  const trueNegatives = totalHealthy - falsePositives;

  const totalPositives = truePositives + falsePositives;
  const totalNegatives = falseNegatives + trueNegatives;

  const ppv = totalPositives > 0 ? truePositives / totalPositives : 0;
  const npv = totalNegatives > 0 ? trueNegatives / totalNegatives : 0;
  const theoreticalPPV = calculateTheoreticalPPV(prevalence, sensitivity, specificity);

  return {
    populationSize,
    totalSick,
    totalHealthy,
    truePositives,
    falseNegatives,
    falsePositives,
    trueNegatives,
    totalPositives,
    totalNegatives,
    ppv,
    npv,
    theoreticalPPV,
  };
}

/**
 * Generates 10,000 grid points for interactive visualizer.
 */
export function generateBaseRateGrid(
  params: BaseRateParams,
  rng: PRNG = createRNG(42)
): { persons: GridPerson[]; breakdown: BaseRateBreakdown } {
  const breakdown = computeBaseRateBreakdown(params);
  const total = breakdown.populationSize;
  const cols = Math.floor(Math.sqrt(total)); // 100

  const persons: GridPerson[] = [];

  const counts = {
    TP: breakdown.truePositives,
    FP: breakdown.falsePositives,
    FN: breakdown.falseNegatives,
    TN: breakdown.trueNegatives,
  };

  const pool: PersonCategory[] = [
    ...Array(counts.TP).fill("TP"),
    ...Array(counts.FP).fill("FP"),
    ...Array(counts.FN).fill("FN"),
    ...Array(counts.TN).fill("TN"),
  ];

  // Shuffle pool to distribute randomly in initial grid
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Assign coordinates for 4-quadrant layout
  // Top-Left: TP, Top-Right: FP, Bottom-Left: FN, Bottom-Right: TN
  const quadrantCounters = { TP: 0, FP: 0, FN: 0, TN: 0 };

  for (let i = 0; i < total; i++) {
    const category = pool[i];
    const isSick = category === "TP" || category === "FN";
    const testPositive = category === "TP" || category === "FP";

    const gridX = i % cols;
    const gridY = Math.floor(i / cols);

    const qIdx = quadrantCounters[category]++;
    let quadrantX = 0;
    let quadrantY = 0;

    const qCols = 40;
    if (category === "TP") {
      quadrantX = 5 + (qIdx % 20);
      quadrantY = 5 + Math.floor(qIdx / 20);
    } else if (category === "FP") {
      quadrantX = 35 + (qIdx % qCols);
      quadrantY = 5 + Math.floor(qIdx / qCols);
    } else if (category === "FN") {
      quadrantX = 5 + (qIdx % 20);
      quadrantY = 45 + Math.floor(qIdx / 20);
    } else {
      quadrantX = 35 + (qIdx % 60);
      quadrantY = 45 + Math.floor(qIdx / 60);
    }

    persons.push({
      id: i,
      isSick,
      testPositive,
      category,
      gridX,
      gridY,
      quadrantX,
      quadrantY,
    });
  }

  return { persons, breakdown };
}

/**
 * Simulates testing one or more cats with given parameters.
 */
export function simulateInspectionBatch(
  count: number,
  params: BaseRateParams,
  rng: PRNG = Math.random
): InspectionBatchResult {
  const { prevalence, sensitivity, specificity } = params;
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  let lastCat: SingleInspectionResult | undefined;

  for (let i = 0; i < count; i++) {
    const isSick = rng() < prevalence;
    let testResult: "positive" | "negative";

    if (isSick) {
      testResult = rng() < sensitivity ? "positive" : "negative";
    } else {
      testResult = rng() < 1 - specificity ? "positive" : "negative";
    }

    let category: PersonCategory;
    if (isSick && testResult === "positive") {
      category = "TP";
      tp++;
    } else if (!isSick && testResult === "positive") {
      category = "FP";
      fp++;
    } else if (!isSick && testResult === "negative") {
      category = "TN";
      tn++;
    } else {
      category = "FN";
      fn++;
    }

    if (i === count - 1) {
      lastCat = {
        id: Math.floor(rng() * 10000) + 1,
        isSick,
        testResult,
        category,
      };
    }
  }

  const positives = tp + fp;
  const negatives = tn + fn;
  const ppv = positives > 0 ? tp / positives : 0;

  return {
    count,
    tp,
    fp,
    tn,
    fn,
    positives,
    negatives,
    ppv,
    lastCat,
  };
}
