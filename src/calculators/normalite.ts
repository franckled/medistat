import {
  fmt,
  fmtP,
  kurtosis,
  mean,
  median,
  quantile,
  sd,
  skewness,
  variance,
} from "@/src/stats/descriptive";
import { chi2Upper, fUpper } from "@/src/stats/special";
import { Calculator, num, series } from "./types";

function errR(msg: string) {
  return { title: "", sections: [], interpretation: "", thesis: "", error: msg };
}

export const normalite: Calculator[] = [
  {
    id: "normalite",
    category: "normalite",
    title: "Critères de normalité",
    subtitle: "Asymétrie, aplatissement, test d'Agostino-Pearson",
    icon: "Waveform",
    accent: "brandTertiary",
    description:
      "À partir d'une série de mesures, évalue la normalité de la distribution via l'asymétrie (skewness), l'aplatissement (kurtosis) et le test omnibus de D'Agostino-Pearson.",
    inputs: [
      {
        key: "data",
        label: "Série de mesures",
        type: "series",
        placeholder: "12,4 13,1 11,8 14,2 12,9 ...",
        help: "Séparez les valeurs par des espaces, virgules ou points-virgules.",
      },
    ],
    compute: (v) => {
      const a = series(v, "data");
      const n = a.length;
      if (n < 8) return errR("Renseignez au moins 8 valeurs pour le test de normalité.");
      const m = mean(a);
      const s = sd(a);
      const g1 = skewness(a);
      const g2 = kurtosis(a);
      const ses = Math.sqrt((6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3)));
      const sek = 2 * ses * Math.sqrt((n * n - 1) / ((n - 3) * (n + 5)));
      const zSkew = g1 / ses;
      const zKurt = g2 / sek;
      const k2 = zSkew * zSkew + zKurt * zKurt;
      const p = chi2Upper(k2, 2);
      const normal = p >= 0.05;
      return {
        title: "Critères de normalité",
        sections: [
          {
            heading: "Résumé de la série",
            metrics: [
              { label: "Effectif n", value: String(n) },
              { label: "Moyenne", value: fmt(m, 3) },
              { label: "Écart-type", value: fmt(s, 3) },
              { label: "Médiane", value: fmt(median(a), 3) },
              { label: "Q1 – Q3", value: `${fmt(quantile(a, 0.25), 2)} – ${fmt(quantile(a, 0.75), 2)}` },
              { label: "Min – Max", value: `${fmt(Math.min(...a), 2)} – ${fmt(Math.max(...a), 2)}` },
            ],
          },
          {
            heading: "Forme de la distribution",
            metrics: [
              { label: "Asymétrie (skewness)", value: fmt(g1, 3) },
              { label: "z asymétrie", value: fmt(zSkew, 2) + (Math.abs(zSkew) > 1.96 ? " ⚠︎" : "") },
              { label: "Aplatissement (kurtosis)", value: fmt(g2, 3) },
              { label: "z aplatissement", value: fmt(zKurt, 2) + (Math.abs(zKurt) > 1.96 ? " ⚠︎" : "") },
            ],
          },
          {
            heading: "Test de D'Agostino-Pearson",
            metrics: [
              { label: "Statistique K²", value: fmt(k2, 3) },
              { label: "Valeur p", value: fmtP(p), highlight: true, tone: normal ? "success" : "warning" },
              {
                label: "Conclusion",
                value: normal ? "Compatible avec la normalité" : "Écart à la normalité",
                tone: normal ? "success" : "warning",
              },
            ],
          },
        ],
        interpretation: normal
          ? `La distribution est compatible avec une loi normale (K² = ${fmt(k2, 2)}, ${fmtP(p)}). Les tests paramétriques sont utilisables.`
          : `La distribution s'écarte significativement de la normalité (K² = ${fmt(k2, 2)}, ${fmtP(p)}). Préférez des tests non paramétriques.`,
        thesis: `La normalité de la distribution (n = ${n}) a été évaluée par le test de D'Agostino-Pearson. L'asymétrie était de ${fmt(
          g1,
          2,
        )} et l'aplatissement de ${fmt(g2, 2)}. Le test omnibus donnait K² = ${fmt(k2, 2)} (${fmtP(
          p,
        )}), ce qui ${normal ? "ne permet pas de rejeter" : "conduit à rejeter"} l'hypothèse de normalité.`,
      };
    },
  },
  {
    id: "levene",
    category: "normalite",
    title: "Test de Levene (égalité des variances)",
    subtitle: "Homogénéité des variances de 2 groupes",
    icon: "Equals",
    accent: "brandTertiary",
    description:
      "Teste l'égalité des variances entre deux groupes (test de Levene, centrage par la moyenne, ou Brown-Forsythe par la médiane).",
    inputs: [
      { key: "g1", label: "Groupe 1", type: "series", placeholder: "10 12 11 13 ..." },
      { key: "g2", label: "Groupe 2", type: "series", placeholder: "9 14 8 15 ..." },
      {
        key: "center",
        label: "Centrage",
        type: "select",
        default: "median",
        options: [
          { label: "Médiane (Brown-Forsythe, robuste)", value: "median" },
          { label: "Moyenne (Levene classique)", value: "mean" },
        ],
      },
    ],
    compute: (v) => {
      const g1 = series(v, "g1");
      const g2 = series(v, "g2");
      const center = v["center"] || "median";
      if (g1.length < 2 || g2.length < 2) {
        return errR("Chaque groupe doit contenir au moins 2 valeurs.");
      }
      const groups = [g1, g2];
      const centers = groups.map((g) => (center === "median" ? median(g) : mean(g)));
      // Z_ij = |x_ij - center_i|
      const z = groups.map((g, i) => g.map((x) => Math.abs(x - centers[i])));
      const N = g1.length + g2.length;
      const k = 2;
      const zAll = z.flat();
      const zbar = mean(zAll);
      const zbarGroup = z.map((zi) => mean(zi));
      let numer = 0;
      z.forEach((zi, i) => {
        numer += zi.length * Math.pow(zbarGroup[i] - zbar, 2);
      });
      let denom = 0;
      z.forEach((zi, i) => {
        zi.forEach((zij) => {
          denom += Math.pow(zij - zbarGroup[i], 2);
        });
      });
      const W = ((N - k) / (k - 1)) * (numer / denom);
      const df1 = k - 1;
      const df2 = N - k;
      const p = fUpper(W, df1, df2);
      const equal = p >= 0.05;
      return {
        title: "Test de Levene",
        sections: [
          {
            heading: "Variances observées",
            metrics: [
              { label: "Variance groupe 1", value: fmt(variance(g1), 3) },
              { label: "Variance groupe 2", value: fmt(variance(g2), 3) },
              { label: "Rapport des variances", value: fmt(Math.max(variance(g1), variance(g2)) / Math.min(variance(g1), variance(g2)), 2) },
            ],
          },
          {
            heading: `Statistique de test (${center === "median" ? "Brown-Forsythe" : "Levene"})`,
            metrics: [
              { label: "Statistique W (F)", value: fmt(W, 3) },
              { label: "ddl", value: `${df1} ; ${df2}` },
              { label: "Valeur p", value: fmtP(p), highlight: true, tone: equal ? "success" : "warning" },
              {
                label: "Conclusion",
                value: equal ? "Variances homogènes" : "Variances hétérogènes",
                tone: equal ? "success" : "warning",
              },
            ],
          },
        ],
        interpretation: equal
          ? `Les variances peuvent être considérées comme égales (W = ${fmt(W, 2)}, ${fmtP(p)}). Un test t de Student classique est approprié.`
          : `Les variances diffèrent significativement (W = ${fmt(W, 2)}, ${fmtP(p)}). Utilisez un test t de Welch.`,
        thesis: `L'homogénéité des variances a été vérifiée par le test de Levene (centrage par ${
          center === "median" ? "la médiane, variante de Brown-Forsythe" : "la moyenne"
        }). La statistique était W(${df1} ; ${df2}) = ${fmt(W, 2)} (${fmtP(
          p,
        )}), ${equal ? "compatible avec l'égalité des variances" : "indiquant une hétérogénéité des variances"}.`,
      };
    },
  },
];
