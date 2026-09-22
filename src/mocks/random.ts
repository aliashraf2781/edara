/**
 * Deterministic pseudo-randomness. Every seeded figure in the mock backend is
 * a pure function of a string key, so a reload — or a second browser — shows
 * exactly the same school, the same students and the same marks.
 */

export function hashString(input: string): number {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** mulberry32 — small, fast, and stable across engines. */
export function rng(seed: string): () => number {
  let state = hashString(seed)
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const pick = <T,>(random: () => number, rows: readonly T[]): T =>
  rows[Math.floor(random() * rows.length) % rows.length]

export const intBetween = (random: () => number, min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1))
