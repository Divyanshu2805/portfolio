/** Helpers that turn a loop clock `t` (ms) into UI state. All pure. */

/** Characters of `text` typed so far, starting at `start`, `perChar` ms each. */
export function typed(text: string, t: number, start: number, perChar = 45) {
  if (t < start) return "";
  return text.slice(0, Math.floor((t - start) / perChar) + 1);
}

/** Words of `text` streamed so far. */
export function streamed(text: string, t: number, start: number, perWord = 70) {
  if (t < start) return "";
  const words = text.split(/(?<=\s)/);
  return words.slice(0, Math.floor((t - start) / perWord) + 1).join("");
}

/** Number of `times` already passed. */
export function passed(times: number[], t: number) {
  let n = 0;
  for (const time of times) if (t >= time) n++;
  return n;
}

/** 0..1 progress of t through [from, to]. */
export function progress(t: number, from: number, to: number) {
  return Math.min(1, Math.max(0, (t - from) / (to - from)));
}

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/** Deterministic pseudo-random 0..1 from an integer, for fake telemetry. */
export function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
