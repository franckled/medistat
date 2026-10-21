import { fmt } from "@/src/stats/descriptive";
import {
  Calculator,
  CONFIDENCE_OPTIONS,
  num,
  zForConfidence,
} from "./types";

/** Wilson score interval for a proportion. Returns [low, high] in 0..1. */
export function wilson(x: number, n: number, z: number): [number, number] {
  if (n === 0) return [0, 0];
  const p = x / n;
  const denom = 1 + (z * z) / n;
  const center = p + (z * z) / (2 * n);
  const half = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(center - half) / denom, (center + half) / denom];
}

function pctCI(x: number, n: number, z: number): string {
  const [lo, hi] = wilson(x, n, z);
  return `${fmt(lo * 100, 1)} – ${fmt(hi * 100, 1)} %`;
}

function errR(msg: string) {
  return { title: "", sections: [], interpretation: "", thesis: "", error: msg };
}

export const epidemiologie: Calculator[] = [
  {
    id: "ic-proportion",
    category: "epidemiologie",
    title: "Intervalle de confiance d'une proportion",
    subtitle: "IC de Wald et de Wilson",
    icon: "ChartBar",
    accent: "info",
    description:
      "Calcule l'intervalle de confiance d'une proportion observée (nombre d'événements sur un effectif total).",
    inputs: [
      { key: "x", label: "Nombre d'événements", type: "number", default: "40" },
      { key: "n", label: "Effectif total", type: "number", default: "200" },
      {
        key: "conf",
        label: "Niveau de confiance",
        type: "select",
        default: "95",
        options: CONFIDENCE_OPTIONS,
      },
    ],
    compute: (v) => {
      const x = num(v, "x");
      const n = num(v, "n");
      const conf = num(v, "conf") || 95;
      if (isNaN(x) || isNaN(n) || n <= 0 || x < 0 || x > n) {
        return errR("Le nombre d'événements doit être compris entre 0 et l'effectif total.");
      }
      const z = zForConfidence(conf);
      const p = x / n;
      const waldHalf = z * Math.sqrt((p * (1 - p)) / n);
      const waldLo = Math.max(0, p - waldHalf);
      const waldHi = Math.min(1, p + waldHalf);
      const [wLo, wHi] = wilson(x, n, z);
      return {
        title: "Intervalle de confiance d'une proportion",
        sections: [
          {
            metrics: [
              { label: "Proportion p", value: fmt(p * 100, 1) + " %", highlight: true },
              { label: `IC ${conf} % (Wilson)`, value: `${fmt(wLo * 100, 1)} – ${fmt(wHi * 100, 1)} %`, highlight: true },
              { label: `IC ${conf} % (Wald)`, value: `${fmt(waldLo * 100, 1)} – ${fmt(waldHi * 100, 1)} %` },
              { label: "Valeur z", value: fmt(z, 3) },
            ],
          },
        ],
        chart: { type: "ci", center: p * 100, low: wLo * 100, high: wHi * 100, label: "Proportion (%)" },
        interpretation: `La proportion observée est de ${fmt(p * 100, 1)} % (IC ${conf} % : ${fmt(
          wLo * 100,
          1,
        )} – ${fmt(wHi * 100, 1)} %).`,
        thesis: `La proportion observée était de ${fmt(p * 100, 1)} % (${x}/${n}), avec un intervalle de confiance à ${conf} % de [${fmt(
          wLo * 100,
          1,
        )} ; ${fmt(wHi * 100, 1)}] % (méthode de Wilson).`,
      };
    },
  },
  {
    id: "test-diagnostique",
    category: "epidemiologie",
    title: "Performance d'un test diagnostique",
    subtitle: "Se, Sp, VPP, VPN, exactitude",
    icon: "TestTube",
    accent: "info",
    description:
      "À partir d'un tableau 2×2 (vrais/faux positifs et négatifs), calcule la sensibilité, la spécificité, les valeurs prédictives, l'exactitude et les rapports de vraisemblance.",
    inputs: [
      { key: "vp", label: "Vrais positifs (VP)", type: "number", default: "80" },
      { key: "fp", label: "Faux positifs (FP)", type: "number", default: "10" },
      { key: "fn", label: "Faux négatifs (FN)", type: "number", default: "20" },
      { key: "vn", label: "Vrais négatifs (VN)", type: "number", default: "190" },
      {
        key: "conf",
        label: "Niveau de confiance",
        type: "select",
        default: "95",
        options: CONFIDENCE_OPTIONS,
      },
    ],
    compute: (v) => {
      const vp = num(v, "vp");
      const fp = num(v, "fp");
      const fn = num(v, "fn");
      const vn = num(v, "vn");
      const conf = num(v, "conf") || 95;
      if ([vp, fp, fn, vn].some((x) => isNaN(x) || x < 0)) {
        return errR("Renseignez les 4 cases du tableau 2×2 (valeurs ≥ 0).");
      }
      const z = zForConfidence(conf);
      const total = vp + fp + fn + vn;
      if (total === 0) return errR("Le tableau ne peut pas être vide.");
      const se = vp / (vp + fn);
      const sp = vn / (vn + fp);
      const vpp = vp / (vp + fp);
      const vpn = vn / (vn + fn);
      const acc = (vp + vn) / total;
      const prev = (vp + fn) / total;
      const lrPlus = sp < 1 ? se / (1 - sp) : Infinity;
      const lrMinus = sp > 0 ? (1 - se) / sp : Infinity;
      const youden = se + sp - 1;
      return {
        title: "Performance d'un test diagnostique",
        sections: [
          {
            heading: "Indices principaux",
            metrics: [
              { label: "Sensibilité", value: fmt(se * 100, 1) + " %", highlight: true },
              { label: `IC ${conf} %`, value: pctCI(vp, vp + fn, z) },
              { label: "Spécificité", value: fmt(sp * 100, 1) + " %", highlight: true },
              { label: `IC ${conf} %`, value: pctCI(vn, vn + fp, z) },
            ],
          },
          {
            heading: "Valeurs prédictives",
            metrics: [
              { label: "VPP", value: fmt(vpp * 100, 1) + " %" },
              { label: `IC ${conf} %`, value: pctCI(vp, vp + fp, z) },
              { label: "VPN", value: fmt(vpn * 100, 1) + " %" },
              { label: `IC ${conf} %`, value: pctCI(vn, vn + fn, z) },
            ],
          },
          {
            heading: "Indices globaux",
            metrics: [
              { label: "Exactitude (accuracy)", value: fmt(acc * 100, 1) + " %" },
              { label: "Prévalence", value: fmt(prev * 100, 1) + " %" },
              { label: "Rapport de vraisemblance +", value: fmt(lrPlus, 2) },
              { label: "Rapport de vraisemblance −", value: fmt(lrMinus, 2) },
              { label: "Indice de Youden", value: fmt(youden, 3) },
            ],
          },
        ],
        interpretation: `Sensibilité ${fmt(se * 100, 1)} %, spécificité ${fmt(
          sp * 100,
          1,
        )} %, VPP ${fmt(vpp * 100, 1)} %, VPN ${fmt(vpn * 100, 1)} % (prévalence ${fmt(prev * 100, 1)} %).`,
        thesis: `Les performances du test ont été évaluées sur ${total} sujets. La sensibilité était de ${fmt(
          se * 100,
          1,
        )} % (IC ${conf} % : ${pctCI(vp, vp + fn, z)}) et la spécificité de ${fmt(
          sp * 100,
          1,
        )} % (IC ${conf} % : ${pctCI(vn, vn + fp, z)}). Les valeurs prédictives positive et négative étaient respectivement de ${fmt(
          vpp * 100,
          1,
        )} % et ${fmt(vpn * 100, 1)} % (prévalence ${fmt(prev * 100, 1)} %). L'exactitude globale était de ${fmt(
          acc * 100,
          1,
        )} % ; les rapports de vraisemblance positif et négatif étaient de ${fmt(lrPlus, 2)} et ${fmt(lrMinus, 2)}.`,
      };
    },
  },
];
