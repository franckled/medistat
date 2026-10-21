import { comparaisons } from "./comparaisons";
import { echantillonnage } from "./echantillonnage";
import { epidemiologie } from "./epidemiologie";
import { normalite } from "./normalite";
import { Calculator, Category } from "./types";

export const CATEGORIES: Category[] = [
  { id: "echantillonnage", label: "Échantillonnage", icon: "UsersThree", accent: "brandPrimary" },
  { id: "epidemiologie", label: "Épidémiologie", icon: "Pulse", accent: "info" },
  { id: "normalite", label: "Normalité & Variances", icon: "Waveform", accent: "brandTertiary" },
  { id: "comparaisons", label: "Comparaisons", icon: "ArrowsLeftRight", accent: "brandSecondary" },
];

export const CALCULATORS: Calculator[] = [
  ...echantillonnage,
  ...epidemiologie,
  ...normalite,
  ...comparaisons,
];

export function getCalculator(id: string): Calculator | undefined {
  return CALCULATORS.find((c) => c.id === id);
}

export function calculatorsByCategory(cat: string): Calculator[] {
  return CALCULATORS.filter((c) => c.category === cat);
}

export * from "./types";
