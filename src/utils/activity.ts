import { storage } from "@/src/utils/storage";
import type { CalcResult } from "@/src/calculators/types";

const FAVORITES_KEY = "thotis.favorites.v1";
const RECENT_CALCULATORS_KEY = "thotis.recent-calculators.v1";
const HISTORY_ENABLED_KEY = "thotis.result-history-enabled.v1";
const RESULTS_KEY = "thotis.saved-results.v1";

export type SavedCalculationResult = {
  id: string;
  calculatorId: string;
  calculatorTitle: string;
  savedAt: string;
  result: CalcResult;
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await storage.getItem(key, JSON.stringify(fallback));
  if (typeof raw !== "string") return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

async function writeJson<T>(key: string, value: T): Promise<boolean> {
  return storage.setItem(key, JSON.stringify(value));
}

export async function getFavoriteIds(): Promise<string[]> {
  const values = await readJson<unknown>(FAVORITES_KEY, []);
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === "string") : [];
}

export async function toggleFavorite(calculatorId: string): Promise<string[]> {
  const current = await getFavoriteIds();
  const next = current.includes(calculatorId) ? current.filter((id) => id !== calculatorId) : [calculatorId, ...current];
  await writeJson(FAVORITES_KEY, next);
  return next;
}

export async function getRecentCalculatorIds(): Promise<string[]> {
  const values = await readJson<unknown>(RECENT_CALCULATORS_KEY, []);
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === "string").slice(0, 8) : [];
}

export async function recordCalculatorUse(calculatorId: string): Promise<void> {
  const current = await getRecentCalculatorIds();
  await writeJson(RECENT_CALCULATORS_KEY, [calculatorId, ...current.filter((id) => id !== calculatorId)].slice(0, 8));
}

export async function isResultHistoryEnabled(): Promise<boolean> {
  return (await storage.getItem<boolean>(HISTORY_ENABLED_KEY, false)) === true;
}

export async function setResultHistoryEnabled(enabled: boolean): Promise<void> {
  await storage.setItem(HISTORY_ENABLED_KEY, enabled);
}

export async function getSavedResults(): Promise<SavedCalculationResult[]> {
  const values = await readJson<unknown>(RESULTS_KEY, []);
  if (!Array.isArray(values)) return [];
  return values.filter((value): value is SavedCalculationResult => {
    if (!value || typeof value !== "object") return false;
    const candidate = value as Partial<SavedCalculationResult>;
    return typeof candidate.id === "string" && typeof candidate.calculatorId === "string" && typeof candidate.calculatorTitle === "string" && typeof candidate.savedAt === "string" && !!candidate.result && typeof candidate.result === "object";
  }).slice(0, 25);
}

export async function saveCalculationResult(calculatorId: string, calculatorTitle: string, result: CalcResult): Promise<void> {
  if (!(await isResultHistoryEnabled()) || result.error) return;
  const previous = await getSavedResults();
  const entry: SavedCalculationResult = {
    id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
    calculatorId,
    calculatorTitle,
    savedAt: new Date().toISOString(),
    result,
  };
  await writeJson(RESULTS_KEY, [entry, ...previous].slice(0, 25));
}

export async function removeSavedResult(id: string): Promise<void> {
  const previous = await getSavedResults();
  await writeJson(RESULTS_KEY, previous.filter((entry) => entry.id !== id));
}

export async function clearSavedResults(): Promise<void> {
  await writeJson(RESULTS_KEY, []);
}
