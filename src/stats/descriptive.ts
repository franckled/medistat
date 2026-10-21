// Descriptive statistics helpers over numeric arrays.

export function mean(a: number[]): number {
  return a.reduce((s, v) => s + v, 0) / a.length;
}

/** Sample variance (n-1). */
export function variance(a: number[]): number {
  if (a.length < 2) return 0;
  const m = mean(a);
  return a.reduce((s, v) => s + (v - m) * (v - m), 0) / (a.length - 1);
}

export function sd(a: number[]): number {
  return Math.sqrt(variance(a));
}

export function median(a: number[]): number {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  const mid = Math.floor(n / 2);
  return n % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Linear-interpolation quantile (type 7, matches R default). */
export function quantile(a: number[], q: number): number {
  const s = [...a].sort((x, y) => x - y);
  const pos = (s.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (s[base + 1] !== undefined) {
    return s[base] + rest * (s[base + 1] - s[base]);
  }
  return s[base];
}

/** Sample skewness (g1, bias-adjusted G1). */
export function skewness(a: number[]): number {
  const n = a.length;
  const m = mean(a);
  const s = sd(a);
  if (s === 0 || n < 3) return 0;
  const g1 =
    a.reduce((acc, v) => acc + Math.pow((v - m) / s, 3), 0) / n;
  return (Math.sqrt(n * (n - 1)) / (n - 2)) * g1;
}

/** Sample excess kurtosis (G2, bias-adjusted). */
export function kurtosis(a: number[]): number {
  const n = a.length;
  const m = mean(a);
  const s = sd(a);
  if (s === 0 || n < 4) return 0;
  const m4 =
    a.reduce((acc, v) => acc + Math.pow((v - m) / s, 4), 0) / n;
  return (
    ((n - 1) / ((n - 2) * (n - 3))) * ((n + 1) * m4 - 3 * (n - 1)) + 0
  );
}

/** Ranks with ties averaged. Returns ranks aligned to the input order. */
export function rankAverage(a: number[]): number[] {
  const indexed = a.map((v, i) => ({ v, i }));
  indexed.sort((x, y) => x.v - y.v);
  const ranks = new Array(a.length).fill(0);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length - 1 && indexed[j + 1].v === indexed[i].v) j++;
    const avg = (i + j) / 2 + 1; // 1-based average rank
    for (let k = i; k <= j; k++) ranks[indexed[k].i] = avg;
    i = j + 1;
  }
  return ranks;
}

/** Tie correction sum: sum(t^3 - t) over tie groups. */
export function tieCorrection(a: number[]): number {
  const sorted = [...a].sort((x, y) => x - y);
  let sum = 0;
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length - 1 && sorted[j + 1] === sorted[i]) j++;
    const t = j - i + 1;
    if (t > 1) sum += t * t * t - t;
    i = j + 1;
  }
  return sum;
}

/** Round to a fixed number of decimals, returning a number. */
export function round(v: number, d = 3): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

/** Format a p-value in a thesis-friendly way. */
export function fmtP(p: number): string {
  if (!isFinite(p)) return "—";
  if (p < 0.0001) return "p < 0,0001";
  return "p = " + p.toFixed(4).replace(".", ",");
}

/** Format a number with a fixed number of decimals and a comma separator (French). */
export function fmt(v: number, d = 3): string {
  if (!isFinite(v)) return "—";
  return round(v, d).toFixed(d).replace(".", ",");
}
