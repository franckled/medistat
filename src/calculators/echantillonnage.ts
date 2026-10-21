import { fmt } from "@/src/stats/descriptive";
import { normalQuantile } from "@/src/stats/special";
import {
  Calculator,
  CONFIDENCE_OPTIONS,
  num,
  zForConfidence,
} from "./types";

const zBeta = (powerPct: number) => normalQuantile(powerPct / 100);

export const echantillonnage: Calculator[] = [
  {
    id: "sample-proportion",
    category: "echantillonnage",
    title: "Sujets nécessaires — Proportion",
    subtitle: "Estimer une proportion avec une précision donnée",
    icon: "Percent",
    accent: "brandPrimary",
    description:
      "Calcule le nombre de sujets nécessaires pour estimer une proportion attendue avec une précision (demi-largeur de l'intervalle de confiance) fixée.",
    inputs: [
      {
        key: "p",
        label: "Proportion attendue p",
        type: "number",
        unit: "%",
        default: "50",
        help: "Valeur estimée a priori. 50 % maximise l'effectif (cas le plus prudent).",
      },
      {
        key: "d",
        label: "Précision souhaitée (± d)",
        type: "number",
        unit: "%",
        default: "5",
        help: "Demi-largeur de l'intervalle de confiance.",
      },
      {
        key: "conf",
        label: "Niveau de confiance",
        type: "select",
        default: "95",
        options: CONFIDENCE_OPTIONS,
      },
      {
        key: "N",
        label: "Taille de la population (optionnel)",
        type: "number",
        help: "Laisser vide si la population est très grande / inconnue.",
      },
    ],
    compute: (v) => {
      const p = num(v, "p") / 100;
      const d = num(v, "d") / 100;
      const conf = num(v, "conf") || 95;
      const N = num(v, "N");
      if (isNaN(p) || isNaN(d) || d <= 0 || p < 0 || p > 1) {
        return err("Renseignez une proportion (0–100 %) et une précision > 0.");
      }
      const z = zForConfidence(conf);
      let n = (z * z * p * (1 - p)) / (d * d);
      let nAdj = n;
      if (!isNaN(N) && N > 0) {
        nAdj = n / (1 + (n - 1) / N);
      }
      const nCeil = Math.ceil(nAdj);
      return {
        title: "Sujets nécessaires — Proportion",
        sections: [
          {
            metrics: [
              { label: "Effectif nécessaire n", value: String(nCeil), highlight: true },
              { label: "Effectif brut (pop. infinie)", value: String(Math.ceil(n)) },
              { label: "Valeur z", value: fmt(z, 3) },
              { label: "Proportion p", value: fmt(p * 100, 1) + " %" },
              { label: "Précision ±d", value: fmt(d * 100, 1) + " %" },
            ],
          },
        ],
        interpretation: `Pour estimer une proportion attendue à ${fmt(
          p * 100,
          1,
        )} % avec une précision de ± ${fmt(d * 100, 1)} % au niveau de confiance de ${conf} %, il faut inclure ${nCeil} sujets.`,
        thesis: `Le nombre de sujets nécessaires a été calculé pour estimer une proportion attendue de ${fmt(
          p * 100,
          1,
        )} % avec une précision de ± ${fmt(d * 100, 1)} % (intervalle de confiance à ${conf} %). En appliquant la formule n = z²·p·(1−p)/d², l'effectif requis est de ${nCeil} sujets${
          !isNaN(N) && N > 0 ? ` (après correction pour une population finie de ${N} sujets)` : ""
        }.`,
      };
    },
  },
  {
    id: "sample-cas-temoins",
    category: "echantillonnage",
    title: "Sujets nécessaires — Cas-témoins",
    subtitle: "Détecter un odds ratio donné",
    icon: "MagnifyingGlass",
    accent: "brandPrimary",
    description:
      "Calcule le nombre de cas et de témoins nécessaires pour mettre en évidence un odds ratio attendu, à partir de la fréquence d'exposition chez les témoins.",
    inputs: [
      {
        key: "p0",
        label: "Exposition chez les témoins p0",
        type: "number",
        unit: "%",
        default: "20",
      },
      { key: "or", label: "Odds ratio attendu (OR)", type: "number", default: "2" },
      { key: "alpha", label: "Risque α", type: "number", unit: "%", default: "5" },
      { key: "power", label: "Puissance (1−β)", type: "number", unit: "%", default: "80" },
      {
        key: "ratio",
        label: "Témoins par cas",
        type: "number",
        default: "1",
        help: "Nombre de témoins pour chaque cas (c).",
      },
    ],
    compute: (v) => {
      const p0 = num(v, "p0") / 100;
      const or = num(v, "or");
      const alpha = num(v, "alpha") / 100;
      const power = num(v, "power");
      const c = num(v, "ratio") || 1;
      if (isNaN(p0) || isNaN(or) || or <= 0 || p0 <= 0 || p0 >= 1) {
        return err("Vérifiez la fréquence d'exposition (0–100 %) et l'OR (> 0).");
      }
      const p1 = (or * p0) / (1 + p0 * (or - 1));
      const za = normalQuantile(1 - alpha / 2);
      const zb = zBeta(power);
      const pbar = (p1 + c * p0) / (1 + c);
      const term1 = za * Math.sqrt((1 + 1 / c) * pbar * (1 - pbar));
      const term2 = zb * Math.sqrt(p1 * (1 - p1) + (p0 * (1 - p0)) / c);
      const nCases = Math.ceil(
        Math.pow(term1 + term2, 2) / Math.pow(p1 - p0, 2),
      );
      const nControls = Math.ceil(c * nCases);
      return {
        title: "Sujets nécessaires — Cas-témoins",
        sections: [
          {
            metrics: [
              { label: "Cas nécessaires", value: String(nCases), highlight: true },
              { label: "Témoins nécessaires", value: String(nControls), highlight: true },
              { label: "Total", value: String(nCases + nControls) },
              { label: "Exposition attendue chez les cas p1", value: fmt(p1 * 100, 1) + " %" },
            ],
          },
        ],
        interpretation: `Pour détecter un OR de ${fmt(or, 2)} (α = ${fmt(
          alpha * 100,
          0,
        )} %, puissance ${fmt(power, 0)} %), il faut ${nCases} cas et ${nControls} témoins.`,
        thesis: `Le nombre de sujets nécessaires a été estimé pour mettre en évidence un odds ratio de ${fmt(
          or,
          2,
        )}, avec une fréquence d'exposition de ${fmt(p0 * 100, 1)} % chez les témoins, un risque de première espèce α de ${fmt(
          alpha * 100,
          0,
        )} % (bilatéral) et une puissance de ${fmt(power, 0)} %. Avec un ratio de ${c} témoin(s) par cas, l'étude doit inclure ${nCases} cas et ${nControls} témoins (soit ${nCases + nControls} sujets au total).`,
      };
    },
  },
  {
    id: "sample-cohorte",
    category: "echantillonnage",
    title: "Sujets nécessaires — Cohorte",
    subtitle: "Comparer deux incidences",
    icon: "UsersThree",
    accent: "brandPrimary",
    description:
      "Calcule le nombre de sujets par groupe pour comparer l'incidence d'un événement entre exposés et non-exposés dans une étude de cohorte.",
    inputs: [
      { key: "p1", label: "Incidence chez les exposés p1", type: "number", unit: "%", default: "30" },
      { key: "p2", label: "Incidence chez les non-exposés p2", type: "number", unit: "%", default: "15" },
      { key: "alpha", label: "Risque α", type: "number", unit: "%", default: "5" },
      { key: "power", label: "Puissance (1−β)", type: "number", unit: "%", default: "80" },
      {
        key: "ratio",
        label: "Non-exposés par exposé",
        type: "number",
        default: "1",
        help: "Rapport k entre non-exposés et exposés.",
      },
    ],
    compute: (v) => {
      const p1 = num(v, "p1") / 100;
      const p2 = num(v, "p2") / 100;
      const alpha = num(v, "alpha") / 100;
      const power = num(v, "power");
      const k = num(v, "ratio") || 1;
      if (isNaN(p1) || isNaN(p2) || p1 === p2 || p1 <= 0 || p2 <= 0) {
        return err("Renseignez deux incidences différentes (0–100 %).");
      }
      const za = normalQuantile(1 - alpha / 2);
      const zb = zBeta(power);
      const pbar = (p1 + k * p2) / (1 + k);
      const term1 = za * Math.sqrt((1 + 1 / k) * pbar * (1 - pbar));
      const term2 = zb * Math.sqrt(p1 * (1 - p1) + (p2 * (1 - p2)) / k);
      const n1 = Math.ceil(Math.pow(term1 + term2, 2) / Math.pow(p1 - p2, 2));
      const n2 = Math.ceil(k * n1);
      const rr = p1 / p2;
      return {
        title: "Sujets nécessaires — Cohorte",
        sections: [
          {
            metrics: [
              { label: "Exposés nécessaires", value: String(n1), highlight: true },
              { label: "Non-exposés nécessaires", value: String(n2), highlight: true },
              { label: "Total", value: String(n1 + n2) },
              { label: "Risque relatif attendu", value: fmt(rr, 2) },
            ],
          },
        ],
        interpretation: `Pour comparer des incidences de ${fmt(p1 * 100, 1)} % et ${fmt(
          p2 * 100,
          1,
        )} % (α = ${fmt(alpha * 100, 0)} %, puissance ${fmt(power, 0)} %), il faut ${n1} exposés et ${n2} non-exposés.`,
        thesis: `L'effectif nécessaire a été calculé pour comparer une incidence de ${fmt(
          p1 * 100,
          1,
        )} % chez les exposés à ${fmt(p2 * 100, 1)} % chez les non-exposés (risque relatif de ${fmt(
          rr,
          2,
        )}), avec un risque α de ${fmt(alpha * 100, 0)} % (bilatéral) et une puissance de ${fmt(
          power,
          0,
        )} %. L'étude de cohorte doit inclure ${n1} sujets exposés et ${n2} non-exposés (soit ${n1 + n2} sujets au total).`,
      };
    },
  },
];

function err(msg: string) {
  return { title: "", sections: [], interpretation: "", thesis: "", error: msg };
}
