import {
  fmt,
  fmtP,
  mean,
  rankAverage,
  sd,
  tieCorrection,
  variance,
} from "@/src/stats/descriptive";
import {
  chi2Upper,
  fUpper,
  lgamma,
  tTwoSided,
  zTwoSidedP,
} from "@/src/stats/special";
import {
  Calculator,
  CONFIDENCE_OPTIONS,
  num,
  ResultSection,
  series,
  zForConfidence,
} from "./types";

function errR(msg: string) {
  return { title: "", sections: [], interpretation: "", thesis: "", error: msg };
}

const logFact = (n: number) => lgamma(n + 1);

/** Two-tailed Fisher exact p-value for a 2×2 table. */
function fisherExact(a: number, b: number, c: number, d: number): number {
  const r1 = a + b;
  const r2 = c + d;
  const c1 = a + c;
  const n = a + b + c + d;
  const constLog =
    logFact(r1) + logFact(r2) + logFact(c1) + logFact(b + d) - logFact(n);
  const logP = (aa: number) => {
    const bb = r1 - aa;
    const cc = c1 - aa;
    const dd = r2 - cc;
    if (bb < 0 || cc < 0 || dd < 0) return -Infinity;
    return constLog - logFact(aa) - logFact(bb) - logFact(cc) - logFact(dd);
  };
  const pObs = logP(a);
  const aMin = Math.max(0, c1 - r2);
  const aMax = Math.min(r1, c1);
  let p = 0;
  for (let aa = aMin; aa <= aMax; aa++) {
    const lp = logP(aa);
    if (lp <= pObs + 1e-7) p += Math.exp(lp);
  }
  return Math.min(1, p);
}

export const comparaisons: Calculator[] = [
  {
    id: "comp-2-proportions",
    category: "comparaisons",
    title: "Comparaison de 2 proportions",
    subtitle: "Test z, risque relatif et odds ratio",
    icon: "Divide",
    accent: "brandSecondary",
    description:
      "Compare deux proportions indépendantes (test z), avec l'intervalle de confiance de la différence, le risque relatif et l'odds ratio.",
    inputs: [
      { key: "x1", label: "Événements groupe 1", type: "number", default: "45" },
      { key: "n1", label: "Effectif groupe 1", type: "number", default: "100" },
      { key: "x2", label: "Événements groupe 2", type: "number", default: "30" },
      { key: "n2", label: "Effectif groupe 2", type: "number", default: "100" },
      { key: "conf", label: "Niveau de confiance", type: "select", default: "95", options: CONFIDENCE_OPTIONS },
    ],
    compute: (v) => {
      const x1 = num(v, "x1");
      const n1 = num(v, "n1");
      const x2 = num(v, "x2");
      const n2 = num(v, "n2");
      const conf = num(v, "conf") || 95;
      if ([x1, n1, x2, n2].some((x) => isNaN(x)) || x1 > n1 || x2 > n2 || n1 <= 0 || n2 <= 0) {
        return errR("Vérifiez les effectifs (0 ≤ événements ≤ effectif).");
      }
      const z = zForConfidence(conf);
      const p1 = x1 / n1;
      const p2 = x2 / n2;
      const diff = p1 - p2;
      const pPool = (x1 + x2) / (n1 + n2);
      const seP = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
      const zStat = diff / seP;
      const pVal = zTwoSidedP(zStat);
      const seDiff = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
      const lo = diff - z * seDiff;
      const hi = diff + z * seDiff;
      const rr = p2 > 0 ? p1 / p2 : Infinity;
      const or = x1 < n1 && x2 > 0 ? (x1 * (n2 - x2)) / (x2 * (n1 - x1)) : Infinity;
      const sig = pVal < 0.05;
      return {
        title: "Comparaison de 2 proportions",
        sections: [
          {
            metrics: [
              { label: "Proportion 1", value: fmt(p1 * 100, 1) + " %" },
              { label: "Proportion 2", value: fmt(p2 * 100, 1) + " %" },
              { label: "Différence", value: fmt(diff * 100, 1) + " %", highlight: true },
              { label: `IC ${conf} % différence`, value: `${fmt(lo * 100, 1)} – ${fmt(hi * 100, 1)} %` },
              { label: "Statistique z", value: fmt(zStat, 3) },
              { label: "Valeur p", value: fmtP(pVal), highlight: true, tone: sig ? "success" : "neutral" },
              { label: "Risque relatif", value: fmt(rr, 2) },
              { label: "Odds ratio", value: fmt(or, 2) },
            ],
          },
        ],
        chart: { type: "ci", center: diff * 100, low: lo * 100, high: hi * 100, label: "Différence (points de %)" },
        interpretation: sig
          ? `La différence de ${fmt(diff * 100, 1)} points est statistiquement significative (${fmtP(pVal)}).`
          : `La différence de ${fmt(diff * 100, 1)} points n'est pas statistiquement significative (${fmtP(pVal)}).`,
        thesis: `Les proportions comparées étaient de ${fmt(p1 * 100, 1)} % (${x1}/${n1}) et ${fmt(
          p2 * 100,
          1,
        )} % (${x2}/${n2}). La différence était de ${fmt(diff * 100, 1)} points de pourcentage (IC ${conf} % : [${fmt(
          lo * 100,
          1,
        )} ; ${fmt(hi * 100, 1)}]), avec un test z donnant ${fmtP(pVal)}. Le risque relatif était de ${fmt(
          rr,
          2,
        )} et l'odds ratio de ${fmt(or, 2)}.`,
      };
    },
  },
  {
    id: "comp-qualitatif",
    category: "comparaisons",
    title: "Comparaison qualitative (Chi² / Fisher)",
    subtitle: "Tableau de contingence 2×2",
    icon: "GridFour",
    accent: "brandSecondary",
    description:
      "Teste l'association entre deux variables qualitatives sur un tableau 2×2 : test du Chi² (avec correction de Yates) et test exact de Fisher (non paramétrique).",
    inputs: [
      { key: "a", label: "Case a (ligne 1, col. 1)", type: "number", default: "30" },
      { key: "b", label: "Case b (ligne 1, col. 2)", type: "number", default: "10" },
      { key: "c", label: "Case c (ligne 2, col. 1)", type: "number", default: "15" },
      { key: "d", label: "Case d (ligne 2, col. 2)", type: "number", default: "45" },
    ],
    compute: (v) => {
      const a = num(v, "a");
      const b = num(v, "b");
      const c = num(v, "c");
      const d = num(v, "d");
      if ([a, b, c, d].some((x) => isNaN(x) || x < 0)) {
        return errR("Renseignez les 4 cases du tableau (valeurs ≥ 0).");
      }
      const n = a + b + c + d;
      if (n === 0) return errR("Le tableau ne peut pas être vide.");
      const r1 = a + b, r2 = c + d, c1 = a + c, c2 = b + d;
      const exp = [
        (r1 * c1) / n,
        (r1 * c2) / n,
        (r2 * c1) / n,
        (r2 * c2) / n,
      ];
      const minExp = Math.min(...exp);
      const chi2 = (n * Math.pow(a * d - b * c, 2)) / (r1 * r2 * c1 * c2);
      const chi2Yates =
        (n * Math.pow(Math.abs(a * d - b * c) - n / 2, 2)) / (r1 * r2 * c1 * c2);
      const pChi = chi2Upper(chi2, 1);
      const pYates = chi2Upper(chi2Yates, 1);
      const pFisher = fisherExact(a, b, c, d);
      const useFisher = minExp < 5;
      const pRef = useFisher ? pFisher : pYates;
      const sig = pRef < 0.05;
      return {
        title: "Comparaison qualitative (Chi² / Fisher)",
        sections: [
          {
            heading: "Effectif attendu minimal",
            metrics: [
              { label: "Effectif attendu min.", value: fmt(minExp, 2), tone: minExp < 5 ? "warning" : "neutral" },
              {
                label: "Test recommandé",
                value: useFisher ? "Fisher (effectif < 5)" : "Chi² de Pearson",
                highlight: true,
              },
            ],
          },
          {
            heading: "Résultats des tests",
            metrics: [
              { label: "Chi² de Pearson", value: fmt(chi2, 3) },
              { label: "p (Chi²)", value: fmtP(pChi) },
              { label: "Chi² corrigé (Yates)", value: fmt(chi2Yates, 3) },
              { label: "p (Yates)", value: fmtP(pYates) },
              { label: "p exact de Fisher (bilatéral)", value: fmtP(pFisher), highlight: true, tone: sig ? "success" : "neutral" },
            ],
          },
        ],
        interpretation: sig
          ? `L'association est statistiquement significative (${useFisher ? "Fisher" : "Chi²"}, ${fmtP(pRef)}).`
          : `Aucune association significative n'est mise en évidence (${useFisher ? "Fisher" : "Chi²"}, ${fmtP(pRef)}).`,
        thesis: `L'association entre les deux variables qualitatives a été testée sur un tableau 2×2. ${
          useFisher
            ? `En raison d'un effectif théorique inférieur à 5, le test exact de Fisher a été utilisé : ${fmtP(pFisher)}.`
            : `Le test du Chi² de Pearson donnait χ²(1) = ${fmt(chi2, 2)} (${fmtP(pChi)}) ; avec la correction de Yates : ${fmtP(pYates)}.`
        } La différence était ${sig ? "statistiquement significative" : "non significative"} au seuil de 5 %.`,
      };
    },
  },
  {
    id: "comp-quant-indep",
    category: "comparaisons",
    title: "Comparaison quantitative — groupes indépendants",
    subtitle: "Student, Welch et Mann-Whitney",
    icon: "ArrowsLeftRight",
    accent: "brandSecondary",
    description:
      "Compare deux groupes indépendants de mesures quantitatives : test t de Student (variances égales), t de Welch (variances inégales) et test non paramétrique de Mann-Whitney.",
    inputs: [
      { key: "g1", label: "Groupe 1", type: "series", placeholder: "5,2 6,1 4,8 ..." },
      { key: "g2", label: "Groupe 2", type: "series", placeholder: "7,3 6,9 8,1 ..." },
    ],
    compute: (v) => {
      const g1 = series(v, "g1");
      const g2 = series(v, "g2");
      if (g1.length < 2 || g2.length < 2) {
        return errR("Chaque groupe doit contenir au moins 2 valeurs.");
      }
      const n1 = g1.length, n2 = g2.length;
      const m1 = mean(g1), m2 = mean(g2);
      const s1 = sd(g1), s2 = sd(g2);
      const v1 = variance(g1), v2 = variance(g2);
      // Student pooled
      const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
      const tStud = (m1 - m2) / Math.sqrt(sp2 * (1 / n1 + 1 / n2));
      const dfStud = n1 + n2 - 2;
      const pStud = tTwoSided(tStud, dfStud);
      // Welch
      const seW = Math.sqrt(v1 / n1 + v2 / n2);
      const tW = (m1 - m2) / seW;
      const dfW =
        Math.pow(v1 / n1 + v2 / n2, 2) /
        (Math.pow(v1 / n1, 2) / (n1 - 1) + Math.pow(v2 / n2, 2) / (n2 - 1));
      const pW = tTwoSided(tW, dfW);
      // Mann-Whitney
      const combined = [...g1, ...g2];
      const ranks = rankAverage(combined);
      const R1 = ranks.slice(0, n1).reduce((s, r) => s + r, 0);
      const U1 = R1 - (n1 * (n1 + 1)) / 2;
      const N = n1 + n2;
      const muU = (n1 * n2) / 2;
      const tie = tieCorrection(combined);
      const sigmaU = Math.sqrt(
        ((n1 * n2) / 12) * (N + 1 - tie / (N * (N - 1))),
      );
      const zU = (U1 - muU - Math.sign(U1 - muU) * 0.5) / sigmaU;
      const pU = zTwoSidedP(zU);
      const sig = pStud < 0.05;
      return {
        title: "Comparaison quantitative — groupes indépendants",
        sections: [
          {
            heading: "Statistiques descriptives",
            metrics: [
              { label: "Groupe 1 (moy. ± ÉT)", value: `${fmt(m1, 2)} ± ${fmt(s1, 2)} (n=${n1})` },
              { label: "Groupe 2 (moy. ± ÉT)", value: `${fmt(m2, 2)} ± ${fmt(s2, 2)} (n=${n2})` },
              { label: "Différence des moyennes", value: fmt(m1 - m2, 3), highlight: true },
            ],
          },
          {
            heading: "Tests paramétriques",
            metrics: [
              { label: "t de Student", value: `${fmt(tStud, 3)} (ddl ${dfStud})` },
              { label: "p (Student)", value: fmtP(pStud), highlight: true, tone: sig ? "success" : "neutral" },
              { label: "t de Welch", value: `${fmt(tW, 3)} (ddl ${fmt(dfW, 1)})` },
              { label: "p (Welch)", value: fmtP(pW) },
            ],
          },
          {
            heading: "Test non paramétrique",
            metrics: [
              { label: "U de Mann-Whitney", value: fmt(U1, 1) },
              { label: "z", value: fmt(zU, 3) },
              { label: "p (Mann-Whitney)", value: fmtP(pU) },
            ],
          },
        ],
        chart: { type: "compare", m1, sd1: s1, m2, sd2: s2, label1: "Groupe 1", label2: "Groupe 2" },
        interpretation: sig
          ? `Les moyennes diffèrent significativement (t de Student, ${fmtP(pStud)}). Vérifiez normalité et égalité des variances pour choisir Student vs Welch.`
          : `Aucune différence significative entre les moyennes (t de Student, ${fmtP(pStud)}).`,
        thesis: `Les deux groupes indépendants (n = ${n1} et ${n2}) présentaient des moyennes de ${fmt(
          m1,
          2,
        )} ± ${fmt(s1, 2)} et ${fmt(m2, 2)} ± ${fmt(s2, 2)}. Le test t de Student donnait t(${dfStud}) = ${fmt(
          tStud,
          2,
        )} (${fmtP(pStud)}) ; le test t de Welch : t(${fmt(dfW, 1)}) = ${fmt(tW, 2)} (${fmtP(
          pW,
        )}). Le test non paramétrique de Mann-Whitney confirmait ce résultat (${fmtP(pU)}).`,
      };
    },
  },
  {
    id: "comp-multi-groupes",
    category: "comparaisons",
    title: "Comparaison de 3 groupes ou plus",
    subtitle: "ANOVA à un facteur et Kruskal-Wallis",
    icon: "ChartBar",
    accent: "brandSecondary",
    description:
      "Compare 3 à 6 groupes indépendants de mesures quantitatives : analyse de variance (ANOVA) à un facteur, test non paramétrique de Kruskal-Wallis, et comparaisons 2 à 2 avec correction de Bonferroni si le test global est significatif.",
    inputs: [
      { key: "g1", label: "Groupe 1", type: "series", placeholder: "5,2 6,1 4,8 ..." },
      { key: "g2", label: "Groupe 2", type: "series", placeholder: "7,3 6,9 8,1 ..." },
      { key: "g3", label: "Groupe 3", type: "series", placeholder: "6,0 5,5 6,8 ..." },
      { key: "g4", label: "Groupe 4 (facultatif)", type: "series", placeholder: "..." },
      { key: "g5", label: "Groupe 5 (facultatif)", type: "series", placeholder: "..." },
      { key: "g6", label: "Groupe 6 (facultatif)", type: "series", placeholder: "..." },
    ],
    compute: (v) => {
      const groups = ["g1", "g2", "g3", "g4", "g5", "g6"]
        .map((k, i) => ({ label: `Groupe ${i + 1}`, data: series(v, k) }))
        .filter((g) => g.data.length > 0);
      if (groups.length < 3) {
        return errR("Renseignez au moins 3 groupes.");
      }
      if (groups.some((g) => g.data.length < 2)) {
        return errR("Chaque groupe doit contenir au moins 2 valeurs.");
      }
      const k = groups.length;
      const all = groups.flatMap((g) => g.data);
      const N = all.length;
      const grand = mean(all);
      const means = groups.map((g) => mean(g.data));
      const sds = groups.map((g) => sd(g.data));
      const ns = groups.map((g) => g.data.length);
      // ANOVA
      const ssb = groups.reduce((s, g, i) => s + ns[i] * Math.pow(means[i] - grand, 2), 0);
      const ssw = groups.reduce((s, g) => s + (g.data.length - 1) * variance(g.data), 0);
      const sst = ssb + ssw;
      const dfB = k - 1;
      const dfW = N - k;
      const msb = ssb / dfB;
      const msw = ssw / dfW;
      const F = msw > 0 ? msb / msw : Infinity;
      const pF = msw > 0 ? fUpper(F, dfB, dfW) : 0;
      const eta2 = sst > 0 ? ssb / sst : 0;
      // Kruskal-Wallis
      const ranks = rankAverage(all);
      const rankSums: number[] = [];
      let offset = 0;
      groups.forEach((g) => {
        rankSums.push(ranks.slice(offset, offset + g.data.length).reduce((s, r) => s + r, 0));
        offset += g.data.length;
      });
      const hRaw =
        (12 / (N * (N + 1))) * rankSums.reduce((s, R, i) => s + (R * R) / ns[i], 0) - 3 * (N + 1);
      const tie = tieCorrection(all);
      const tieFactor = 1 - tie / (N * N * N - N);
      const H = tieFactor > 0 ? hRaw / tieFactor : hRaw;
      const pH = chi2Upper(H, dfB);
      const sigF = pF < 0.05;
      const sigH = pH < 0.05;
      // Post-hoc (Bonferroni)
      const pairs: { label: string; diff: number; p: number }[] = [];
      const m = (k * (k - 1)) / 2;
      const useT = sigF;
      if (sigF || sigH) {
        const dunnVar = (N * (N + 1)) / 12 - tie / (12 * (N - 1));
        for (let i = 0; i < k; i++) {
          for (let j = i + 1; j < k; j++) {
            const diff = means[i] - means[j];
            let p: number;
            if (useT) {
              const t = diff / Math.sqrt(msw * (1 / ns[i] + 1 / ns[j]));
              p = tTwoSided(t, dfW);
            } else {
              const z =
                (rankSums[i] / ns[i] - rankSums[j] / ns[j]) /
                Math.sqrt(dunnVar * (1 / ns[i] + 1 / ns[j]));
              p = zTwoSidedP(z);
            }
            pairs.push({ label: `${groups[i].label} vs ${groups[j].label}`, diff, p: Math.min(1, p * m) });
          }
        }
      }
      const sigPairs = pairs.filter((p) => p.p < 0.05);
      const sections: ResultSection[] = [
        {
          heading: "Statistiques descriptives",
          metrics: groups.map((g, i) => ({
            label: `${g.label} (moy. ± ÉT)`,
            value: `${fmt(means[i], 2)} ± ${fmt(sds[i], 2)} (n=${ns[i]})`,
          })),
        },
        {
          heading: "ANOVA à un facteur",
          metrics: [
            { label: "F", value: `${fmt(F, 3)} (ddl ${dfB} ; ${dfW})` },
            { label: "p (ANOVA)", value: fmtP(pF), highlight: true, tone: sigF ? ("success" as const) : ("neutral" as const) },
            { label: "η² (taille d'effet)", value: fmt(eta2, 3) },
          ],
        },
        {
          heading: "Test de Kruskal-Wallis",
          metrics: [
            { label: "H (corrigé ex-æquo)", value: `${fmt(H, 3)} (ddl ${dfB})` },
            { label: "p (Kruskal-Wallis)", value: fmtP(pH), highlight: true, tone: sigH ? ("success" as const) : ("neutral" as const) },
          ],
        },
      ];
      if (pairs.length) {
        sections.push({
          heading: `Post-hoc ${useT ? "(t, Bonferroni)" : "(Dunn, Bonferroni)"}`,
          metrics: pairs.map((p) => ({
            label: p.label,
            value: `Δ = ${fmt(p.diff, 2)} · ${fmtP(p.p)}`,
            highlight: false,
            tone: p.p < 0.05 ? ("success" as const) : ("neutral" as const),
          })),
        });
      }
      const descr = groups
        .map((g, i) => `${fmt(means[i], 2)} ± ${fmt(sds[i], 2)} (n = ${ns[i]})`)
        .join(", ");
      return {
        title: "Comparaison de 3 groupes ou plus",
        sections,
        chart: {
          type: "groups",
          groups: groups.map((g, i) => ({ label: `G${i + 1}`, mean: means[i], sd: sds[i] })),
        },
        interpretation: sigF
          ? `Au moins un groupe diffère des autres (ANOVA, ${fmtP(pF)}).${
              sigPairs.length
                ? ` Différences post-hoc significatives : ${sigPairs.map((p) => p.label).join(" ; ")}.`
                : " Aucune paire ne reste significative après correction de Bonferroni."
            }`
          : sigH
            ? `L'ANOVA n'est pas significative (${fmtP(pF)}) mais Kruskal-Wallis l'est (${fmtP(pH)}) : vérifiez la normalité et l'homogénéité des variances.`
            : `Aucune différence significative entre les ${k} groupes (ANOVA ${fmtP(pF)} ; Kruskal-Wallis ${fmtP(pH)}).`,
        thesis: `Les ${k} groupes indépendants présentaient des moyennes de ${descr}. L'analyse de variance à un facteur donnait F(${dfB} ; ${dfW}) = ${fmt(
          F,
          2,
        )} (${fmtP(pF)} ; η² = ${fmt(eta2, 2)}). Le test non paramétrique de Kruskal-Wallis donnait H(${dfB}) = ${fmt(
          H,
          2,
        )} (${fmtP(pH)}).${
          pairs.length
            ? ` Les comparaisons 2 à 2 (${useT ? "tests t" : "test de Dunn"} avec correction de Bonferroni) ${
                sigPairs.length
                  ? `montraient une différence significative pour : ${sigPairs
                      .map((p) => `${p.label} (${fmtP(p.p)})`)
                      .join(", ")}.`
                  : "ne mettaient en évidence aucune différence significative."
              }`
            : ""
        }`,
      };
    },
  },
  {
    id: "comp-quant-apparie",
    category: "comparaisons",
    title: "Comparaison quantitative — groupes appariés",
    subtitle: "t apparié et Wilcoxon signé",
    icon: "LinkSimple",
    accent: "brandSecondary",
    description:
      "Compare deux séries appariées (avant/après, sujets couplés) : test t apparié et test des rangs signés de Wilcoxon (non paramétrique). Les deux séries doivent avoir la même longueur.",
    inputs: [
      { key: "g1", label: "Série 1 (avant)", type: "series", placeholder: "120 132 128 ..." },
      { key: "g2", label: "Série 2 (après)", type: "series", placeholder: "115 128 120 ..." },
    ],
    compute: (v) => {
      const g1 = series(v, "g1");
      const g2 = series(v, "g2");
      if (g1.length < 2 || g1.length !== g2.length) {
        return errR("Les deux séries doivent avoir la même longueur (≥ 2 paires).");
      }
      const d = g1.map((x, i) => x - g2[i]);
      const n = d.length;
      const md = mean(d);
      const sdd = sd(d);
      const t = md / (sdd / Math.sqrt(n));
      const df = n - 1;
      const pT = tTwoSided(t, df);
      // Wilcoxon signed rank
      const nonZero = d.filter((x) => x !== 0);
      const absd = nonZero.map((x) => Math.abs(x));
      const ranks = rankAverage(absd);
      let wPlus = 0;
      nonZero.forEach((x, i) => {
        if (x > 0) wPlus += ranks[i];
      });
      const nr = nonZero.length;
      const muW = (nr * (nr + 1)) / 4;
      const tie = tieCorrection(absd);
      const sigmaW = Math.sqrt(
        (nr * (nr + 1) * (2 * nr + 1)) / 24 - tie / 48,
      );
      const zW = (wPlus - muW - Math.sign(wPlus - muW) * 0.5) / sigmaW;
      const pW = zTwoSidedP(zW);
      const sig = pT < 0.05;
      return {
        title: "Comparaison quantitative — groupes appariés",
        sections: [
          {
            heading: "Différences (série 1 − série 2)",
            metrics: [
              { label: "Nombre de paires", value: String(n) },
              { label: "Différence moyenne", value: fmt(md, 3), highlight: true },
              { label: "Écart-type des différences", value: fmt(sdd, 3) },
            ],
          },
          {
            heading: "Test t apparié",
            metrics: [
              { label: "t", value: `${fmt(t, 3)} (ddl ${df})` },
              { label: "p (t apparié)", value: fmtP(pT), highlight: true, tone: sig ? "success" : "neutral" },
            ],
          },
          {
            heading: "Test de Wilcoxon signé",
            metrics: [
              { label: "W+", value: fmt(wPlus, 1) },
              { label: "z", value: fmt(zW, 3) },
              { label: "p (Wilcoxon)", value: fmtP(pW) },
            ],
          },
        ],
        interpretation: sig
          ? `La différence moyenne de ${fmt(md, 2)} est significative (t apparié, ${fmtP(pT)}).`
          : `La différence moyenne de ${fmt(md, 2)} n'est pas significative (t apparié, ${fmtP(pT)}).`,
        thesis: `La comparaison de ${n} mesures appariées montrait une différence moyenne de ${fmt(
          md,
          2,
        )} ± ${fmt(sdd, 2)}. Le test t apparié donnait t(${df}) = ${fmt(t, 2)} (${fmtP(
          pT,
        )}) ; le test des rangs signés de Wilcoxon confirmait ce résultat (${fmtP(pW)}).`,
      };
    },
  },
  {
    id: "comp-mcnemar",
    category: "comparaisons",
    title: "Comparaison qualitative appariée (McNemar)",
    subtitle: "Données appariées, variable binaire",
    icon: "ArrowsClockwise",
    accent: "brandSecondary",
    description:
      "Teste le changement d'une variable qualitative binaire sur des données appariées (ex. avant/après chez les mêmes sujets) à partir des paires discordantes.",
    inputs: [
      { key: "b", label: "Discordants b (+ puis −)", type: "number", default: "25" },
      { key: "c", label: "Discordants c (− puis +)", type: "number", default: "10" },
    ],
    compute: (v) => {
      const b = num(v, "b");
      const c = num(v, "c");
      if ([b, c].some((x) => isNaN(x) || x < 0)) {
        return errR("Renseignez les effectifs discordants b et c (≥ 0).");
      }
      const disc = b + c;
      if (disc === 0) return errR("Il faut au moins une paire discordante.");
      const chi2 = Math.pow(Math.abs(b - c) - 1, 2) / disc;
      const pChi = chi2Upper(chi2, 1);
      // Exact binomial (two-sided) for small discordant counts
      let pExact = 0;
      const kMin = Math.min(b, c);
      for (let i = 0; i <= kMin; i++) {
        pExact += Math.exp(
          lgamma(disc + 1) - lgamma(i + 1) - lgamma(disc - i + 1),
        ) * Math.pow(0.5, disc);
      }
      pExact = Math.min(1, 2 * pExact);
      const useExact = disc < 25;
      const pRef = useExact ? pExact : pChi;
      const sig = pRef < 0.05;
      return {
        title: "Comparaison qualitative appariée (McNemar)",
        sections: [
          {
            metrics: [
              { label: "Paires discordantes (b + c)", value: String(disc) },
              { label: "Chi² de McNemar (corrigé)", value: fmt(chi2, 3) },
              { label: "p (Chi²)", value: fmtP(pChi) },
              { label: "p exact (binomial)", value: fmtP(pExact), highlight: true, tone: sig ? "success" : "neutral" },
              {
                label: "Test recommandé",
                value: useExact ? "Binomial exact (b+c < 25)" : "Chi² de McNemar",
              },
            ],
          },
        ],
        interpretation: sig
          ? `Le changement est statistiquement significatif (McNemar, ${fmtP(pRef)}).`
          : `Aucun changement significatif n'est mis en évidence (McNemar, ${fmtP(pRef)}).`,
        thesis: `Le test de McNemar a été appliqué aux ${disc} paires discordantes (b = ${b}, c = ${c}). ${
          useExact
            ? `Le test binomial exact donnait ${fmtP(pExact)}.`
            : `La statistique de McNemar corrigée était χ²(1) = ${fmt(chi2, 2)} (${fmtP(pChi)}).`
        } Le changement était ${sig ? "statistiquement significatif" : "non significatif"} au seuil de 5 %.`,
      };
    },
  },
];
