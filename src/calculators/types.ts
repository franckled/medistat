// Shared types for the calculator engine.

export type CategoryId =
  | "echantillonnage"
  | "epidemiologie"
  | "normalite"
  | "comparaisons";

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
  icon: string; // phosphor icon name
  accent: "brandPrimary" | "brandSecondary" | "brandTertiary" | "info";
  description: string;
  inputs: InputField[];
  compute: (v: Record<string, string>) => CalcResult;
};

export type Category = {
  id: CategoryId;
  label: string;
  icon: string;
  accent: "brandPrimary" | "brandSecondary" | "brandTertiary" | "info";
};

// ---- Parsing helpers used by compute functions ----

export function num(v: Record<string, string>, key: string): number {
  const raw = (v[key] ?? "").toString().trim().replace(",", ".");
  return raw === "" ? NaN : Number(raw);
}

export function series(v: Record<string, string>, key: string): number[] {
  const raw = (v[key] ?? "").toString().trim();
  if (!raw) return [];
  return raw
    .split(/[\s,;]+/)
    .map((s) => Number(s.replace(",", ".")))
    .filter((n) => !isNaN(n));
}

/** z value for a two-sided confidence level given in percent (e.g. 95). */
export function zForConfidence(pct: number): number {
  const alpha = 1 - pct / 100;
  return zTwoSided(alpha);
}

import { normalQuantile } from "@/src/stats/special";

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
