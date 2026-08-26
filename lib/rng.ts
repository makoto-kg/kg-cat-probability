/**
 * Mulberry32: A simple, fast, high-quality 32-bit PRNG.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PRNG = () => number;

export function createRNG(seed?: number): PRNG {
  const s = seed !== undefined ? seed : Math.floor(Math.random() * 0xffffffff);
  return mulberry32(s);
}

export function randomInt(min: number, max: number, rng: PRNG = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function shuffle<T>(array: T[], rng: PRNG = Math.random): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sample<T>(array: readonly T[], rng: PRNG = Math.random): T {
  const index = Math.floor(rng() * array.length);
  return array[index];
}
