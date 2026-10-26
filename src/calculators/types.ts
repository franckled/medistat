// Shared types for the calculator engine.

import { normalQuantile } from "../stats/special";

export type CategoryId =
  | "echantillonnage"
  | "epidemiologie"
  | "normalite"
  | "comparaisons"
  | "cliniques"
  | "survie";

export type InputType = "number" | "series" | "select";

export type InputField = {
  key: string;
  label: string;
  type: InputType;
  placeholder?: string;
  help?: string;
  default?: string;
  unit?: string;
  options?: { label: string; value: string }[];
};

export type ResultMetric = {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "neutral" | "success" | "warning" | "error";
};

export type ResultSection = {
  heading?: string;
  metrics: ResultMetric[];
};

export type ChartSpec =
  | { type: "ci"; center: number; low: number; high: number; label?: string }
  | {
      type: "compare";
      m1: number;
      sd1: number;
      m2: number;
      sd2: number;
      label1: string;
      label2: string;
    }
  | {
      type: "groups";
      groups: { label: string; mean: number; sd: number }[];
    }
  | {
      type: "regression";
      points: { x: number; y: number }[];
      slope: number;
      intercept: number;
    }
  | {
      type: "survival";
      groups: {
        label: string;
        maxTime: number;
        points: { time: number; survival: number }[];
      }[];
    };

export type CalcResult = {
  title: string;
  sections: ResultSection[];
  interpretation: string;
  thesis: string;
  chart?: ChartSpec;
  error?: string;
};

export type Calculator = {
  id: string;
  category: CategoryId;
  title: string;
  subtitle: string;
  icon: string;
  accent: "brandPrimary" | "brandSecondary" | "brandTertiary" | "info";
  description: string;
  source?: string;
  inputs: InputField[];
  compute: (v: Record<string, string>) => CalcResult;
};

export type Category = {
  id: CategoryId;
  label: string;
  icon: string;
  accent: "brandPrimary" | "brandSecondary" | "brandTertiary" | "info";
};

export function num(v: Record<string, string>, key: string): number {
  const raw = (v[key] ?? "").toString().trim().replace(",", ".");
  return raw === "" ? NaN : Number(raw);
}

/**
 * Parse numeric series without losing French decimal commas.
 * Prefer spaces/newlines or semicolons as separators: "12,4 13,1" or "12,4;13,1".
 * Compact "1,2,3" is accepted as a comma-separated list of integers.
 * Null means that at least one token is not a finite number.
 */
export function parseNumericSeries(raw: string): number[] | null {
  const input = raw.trim();
  if (!input) return [];
  let tokens: string[];
  if (/[;\s]/.test(input)) {
    tokens = input.split(/[;\s]+/).filter(Boolean);
  } else {
    const commaCount = (input.match(/,/g) ?? []).length;
    tokens = commaCount > 1 ? input.split(",") : [input];
  }
  const values = tokens.map((token) => Number(token.trim().replace(",", ".")));
  return values.length > 0 && values.every(Number.isFinite) ? values : null;
}

export function series(v: Record<string, string>, key: string): number[] {
  return parseNumericSeries((v[key] ?? "").toString()) ?? [];
}

/** z value for a two-sided confidence level given in percent (e.g. 95). */
export function zForConfidence(pct: number): number {
  const alpha = 1 - pct / 100;
  return zTwoSided(alpha);
}

export function zTwoSided(alpha: number): number {
  return normalQuantile(1 - alpha / 2);
}

export function zOneSided(alpha: number): number {
  return normalQuantile(1 - alpha);
}

export const CONFIDENCE_OPTIONS = [
  { label: "90 %", value: "90" },
  { label: "95 %", value: "95" },
  { label: "99 %", value: "99" },
];
