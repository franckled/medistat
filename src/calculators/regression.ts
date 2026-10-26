import { fmt } from "../stats/descriptive";
import { normalQuantile, tQuantile, tTwoSided } from "../stats/special";
import { Calculator, CalcResult, parseNumericSeries } from "./types";

function error(message: string): CalcResult {
  return { title: "", sections: [], interpretation: "", thesis: "", error: message };
}

function numberText(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return value === Infinity ? "∞" : value === -Infinity ? "−∞" : "non calculable";
  return fmt(value, digits);
}

function pText(value: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 1) return "non calculable";
  if (value < 0.001) return "< 0,001";
  return fmt(value, 3);
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pearson(x: number[], y: number[]): number {
  const mx = mean(x);
  const my = mean(y);
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : NaN;
}

function rank(values: number[]): number[] {
  const ordered = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(values.length);
  let start = 0;
  while (start < ordered.length) {
    let end = start + 1;
    while (end < ordered.length && ordered[end].value === ordered[start].value) end++;
    const averageRank = ((start + 1) + end) / 2;
    for (let i = start; i < end; i++) ranks[ordered[i].index] = averageRank;
    start = end;
  }
  return ranks;
}

function correlationPValue(r: number, n: number): number {
  if (!Number.isFinite(r)) return NaN;
  if (Math.abs(r) >= 1) return 0;
  const statistic = r * Math.sqrt((n - 2) / Math.max(1e-30, 1 - r * r));
  return tTwoSided(statistic, n - 2);
}

function metric(label: string, value: string, highlight = false) {
  return { label, value, highlight };
}

export const regression: Calculator[] = [
  {
    id: "regression-correlation",
    category: "comparaisons",
    title: "Corrélation et régression linéaire",
    subtitle: "Pearson, Spearman, droite de régression et IC 95 %",
    icon: "Graph",
    accent: "brandSecondary",
    description: "Analyse deux séries quantitatives appariées observation par observation. La régression estime une droite des moindres carrés ; Pearson quantifie l’association linéaire et Spearman l’association monotone sur les rangs. Les résultats ne démontrent pas une causalité.",
    source: "NIST/SEMATECH e-Handbook of Statistical Methods, régression linéaire et ajustement par moindres carrés : https://www.itl.nist.gov/div898/handbook/",
    inputs: [
      {
        key: "x",
        label: "Variable X (explicative)",
        type: "series",
        default: "1 2 3 4 5 6 7 8",
        placeholder: "1 2 3 4 5 ...",
        help: "Une valeur par observation. Séparez les valeurs par des espaces ou des points-virgules. La virgule décimale est acceptée si les valeurs sont séparées par un espace ou un point-virgule.",
      },
      {
        key: "y",
        label: "Variable Y (réponse)",
        type: "series",
        default: "1,2 2,4 2,9 4,1 4,8 5,7 6,9 7,5",
        placeholder: "1,2 2,4 3,1 4,6 ...",
        help: "Même nombre de valeurs que X, dans le même ordre. N’utilisez pas les identifiants ou noms de patients comme valeurs numériques.",
      },
    ],
    compute: (v) => {
      const x = parseNumericSeries(v.x ?? "");
      const y = parseNumericSeries(v.y ?? "");
      if (x === null || y === null) return error("Une valeur de X ou de Y n’est pas numérique. Vérifiez les séparateurs et les décimales.");
      if (x.length < 3 || y.length < 3) return error("Renseignez au moins trois paires de valeurs numériques.");
      if (x.length !== y.length) return error("Les séries X et Y doivent contenir exactement le même nombre de valeurs.");
      if (x.some((value) => !Number.isFinite(value)) || y.some((value) => !Number.isFinite(value))) {
        return error("Les séries doivent contenir uniquement des valeurs finies.");
      }

      const n = x.length;
      const mx = mean(x);
      const my = mean(y);
      let sxx = 0;
      let syy = 0;
      let sxy = 0;
      for (let i = 0; i < n; i++) {
        const dx = x[i] - mx;
        const dy = y[i] - my;
        sxx += dx * dx;
        syy += dy * dy;
        sxy += dx * dy;
      }
      if (sxx <= 0) return error("La variable X doit varier : toutes les valeurs sont identiques.");
      if (syy <= 0) return error("La variable Y doit varier pour calculer une corrélation.");

      const slope = sxy / sxx;
      const intercept = my - slope * mx;
      const r = Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
      const rSquared = r * r;
      const fitted = x.map((value) => intercept + slope * value);
      const residualSumSquares = y.reduce((sum, value, i) => sum + Math.pow(value - fitted[i], 2), 0);
      const residualSd = Math.sqrt(residualSumSquares / (n - 2));
      const slopeSe = Math.sqrt((residualSumSquares / (n - 2)) / sxx);
      const tCritical = tQuantile(0.975, n - 2);
      const slopeLow = slope - tCritical * slopeSe;
      const slopeHigh = slope + tCritical * slopeSe;
      const slopeP = slopeSe === 0 ? 0 : tTwoSided(slope / slopeSe, n - 2);

      const rho = pearson(rank(x), rank(y));
      const rhoP = correlationPValue(rho, n);
      let rLow = NaN;
      let rHigh = NaN;
      if (n >= 4 && Math.abs(r) < 1) {
        const fisher = 0.5 * Math.log((1 + r) / (1 - r));
        const margin = normalQuantile(0.975) / Math.sqrt(n - 3);
        rLow = Math.tanh(fisher - margin);
        rHigh = Math.tanh(fisher + margin);
      } else if (Math.abs(r) === 1) {
        rLow = r;
        rHigh = r;
      }

      const rCI = Number.isFinite(rLow) && Number.isFinite(rHigh)
        ? "[" + numberText(rLow, 3) + " ; " + numberText(rHigh, 3) + "]"
        : "non estimable (n < 4)";

      return {
        title: "Corrélation et régression linéaire",
        sections: [
          {
            heading: "Régression linéaire de Y sur X",
            metrics: [
              metric("Nombre de paires (n)", String(n)),
              metric("Pente estimée β₁", numberText(slope, 4), true),
              metric("Ordonnée à l’origine β₀", numberText(intercept, 4)),
              metric("Équation estimée", "Ŷ = " + numberText(intercept, 3) + " + " + numberText(slope, 3) + " × X"),
              metric("IC 95 % de la pente", "[" + numberText(slopeLow, 4) + " ; " + numberText(slopeHigh, 4) + "]"),
              metric("Erreur-type résiduelle", numberText(residualSd, 4)),
              metric("Test de la pente (Student, ddl = " + (n - 2) + ")", "p = " + pText(slopeP)),
            ],
          },
          {
            heading: "Corrélations",
            metrics: [
              metric("Pearson r", numberText(r, 4), true),
              metric("IC 95 % de r (Fisher)", rCI),
              metric("p bilatérale pour Pearson", "p = " + pText(correlationPValue(r, n))),
              metric("Spearman ρ", numberText(rho, 4), true),
              metric("p approximative pour Spearman", "p ≈ " + pText(rhoP)),
              metric("Coefficient de détermination R²", numberText(rSquared, 4)),
            ],
          },
        ],
        interpretation: "La pente décrit la variation moyenne estimée de Y pour une unité supplémentaire de X dans le modèle linéaire. Pearson mesure l’association linéaire ; Spearman l’association monotone. Les tests et intervalles du modèle linéaire supposent des observations indépendantes et, pour l’inférence exacte en petit échantillon, des résidus approximativement normaux et une variance constante. Le p de Spearman est une approximation asymptotique. Une association n’établit pas une causalité.",
        thesis: "Sur " + n + " paires d’observations, la régression linéaire de Y sur X donne une pente β₁ = " + numberText(slope, 4) + " (IC 95 % [" + numberText(slopeLow, 4) + " ; " + numberText(slopeHigh, 4) + "], p = " + pText(slopeP) + "), avec R² = " + numberText(rSquared, 4) + ". La corrélation de Pearson est r = " + numberText(r, 4) + " (IC 95 % " + rCI + ", p = " + pText(correlationPValue(r, n)) + ") et la corrélation de Spearman ρ = " + numberText(rho, 4) + " (p approximative = " + pText(rhoP) + "). Ces résultats décrivent une association statistique et ne suffisent pas à établir une causalité.",
        chart: { type: "regression", points: x.map((value, i) => ({ x: value, y: y[i] })), slope, intercept },
      };
    },
  },
];
