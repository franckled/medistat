import { chi2Upper, normalQuantile } from "../stats/special";
import { Calculator, CalcResult, parseNumericSeries } from "./types";

type SurvivalPoint = { time: number; survival: number };
type SurvivalEstimate = {
  label: string;
  n: number;
  events: number;
  censored: number;
  maxTime: number;
  points: SurvivalPoint[];
  median: number | null;
  lastEventTime: number;
  lastSurvival: number;
  lastCI: { low: number; high: number } | null;
};

function error(message: string): CalcResult {
  return { title: "", sections: [], interpretation: "", thesis: "", error: message };
}
function numberText(value: number, digits = 2): string {
  return value.toFixed(digits).replace(".", ",");
}
function pText(value: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 1) return "non calculable";
  return value < 0.001 ? "< 0,001" : numberText(value, 3);
}
function metric(label: string, value: string, highlight = false) {
  return { label, value, highlight };
}

function estimateSurvival(times: number[], events: number[], label: string): SurvivalEstimate {
  const eventCount = events.reduce((sum, event) => sum + event, 0);
  const censored = events.length - eventCount;
  const maxTime = Math.max(...times);
  const eventTimes = [...new Set(times.filter((time, i) => events[i] === 1))].sort((a, b) => a - b);
  let survival = 1;
  let greenwood = 0;
  let median: number | null = null;
  const points: SurvivalPoint[] = [];

  for (const time of eventTimes) {
    const atRisk = times.filter((observedTime) => observedTime >= time).length;
    const d = times.reduce((sum, observedTime, i) => sum + (observedTime === time && events[i] === 1 ? 1 : 0), 0);
    if (atRisk > 0 && d > 0) {
      survival *= 1 - d / atRisk;
      if (atRisk > d) greenwood += d / (atRisk * (atRisk - d));
      else greenwood = Infinity;
      points.push({ time, survival });
      if (median === null && survival <= 0.5) median = time;
    }
  }

  const last = points[points.length - 1];
  const lastCI = last && last.survival > 0 && last.survival < 1 && Number.isFinite(greenwood)
    ? (() => {
        const z = normalQuantile(0.975);
        const logLog = Math.log(-Math.log(last.survival));
        const standardError = Math.sqrt(greenwood) / Math.abs(Math.log(last.survival));
        return {
          low: Math.exp(-Math.exp(logLog + z * standardError)),
          high: Math.exp(-Math.exp(logLog - z * standardError)),
        };
      })()
    : null;

  return {
    label, n: times.length, events: eventCount, censored, maxTime, points,
    median, lastEventTime: last?.time ?? 0, lastSurvival: last?.survival ?? 1, lastCI,
  };
}

export const survie: Calculator[] = [
  {
    id: "survie-kaplan-meier-logrank",
    category: "survie",
    title: "Survie — Kaplan–Meier et log-rank",
    subtitle: "Courbes de survie et comparaison de deux groupes",
    icon: "Heartbeat",
    accent: "info",
    description: "Estime les courbes de survie par Kaplan–Meier à partir du temps de suivi et d’un indicateur d’événement, puis compare deux groupes indépendants par le test du log-rank. Une observation censurée contribue au temps à risque jusqu’à son dernier suivi connu.",
    source: "Kaplan–Meier et Greenwood : SAP HANA Cloud, Kaplan-Meier Survival Analysis (documentation 2026) ; test log-rank : Kleinbaum & Klein, Survival Analysis, McGill Biostatistics teaching notes. https://help.sap.com/docs/HANA_CLOUD_DATABASE/319d36de4fd64ac3afbf91b1fb3ce8de/kaplan-meier-survival-analysis-b1e7a3c.html",
    inputs: [
      {
        key: "timesA", label: "Groupe A — temps de suivi", type: "series",
        default: "2 3 4 6 7 8 10 12 15 18",
        placeholder: "2 3 4 6 7 8 10 12 ...",
        help: "Durée de suivi de chaque sujet, dans une même unité (par exemple mois). Valeurs strictement positives, séparées par des espaces ou des points-virgules.",
      },
      {
        key: "eventsA", label: "Groupe A — événement", type: "series",
        default: "1 1 0 1 1 0 1 0 1 0",
        placeholder: "1 1 0 1 1 0 1 0 ...",
        help: "Une valeur par temps : 1 = événement observé (par exemple décès) ; 0 = censure à droite. Les deux séries du groupe doivent être de même longueur.",
      },
      {
        key: "timesB", label: "Groupe B — temps de suivi", type: "series",
        default: "1 3 5 6 9 11 13 14 17 20",
        placeholder: "1 3 5 6 9 11 13 14 ...",
        help: "Utilisez la même unité que pour le groupe A.",
      },
      {
        key: "eventsB", label: "Groupe B — événement", type: "series",
        default: "0 1 0 1 0 1 0 1 0 1",
        placeholder: "0 1 0 1 0 1 0 1 ...",
        help: "1 = événement observé ; 0 = censure à droite. Les deux séries du groupe doivent être de même longueur.",
      },
    ],
    compute: (v) => {
      const timesA = parseNumericSeries(v.timesA ?? "");
      const eventsA = parseNumericSeries(v.eventsA ?? "");
      const timesB = parseNumericSeries(v.timesB ?? "");
      const eventsB = parseNumericSeries(v.eventsB ?? "");
      if (timesA === null || eventsA === null || timesB === null || eventsB === null) {
        return error("Une série contient une valeur non numérique. Utilisez uniquement des nombres.");
      }
      if (timesA.length < 2 || timesB.length < 2) return error("Chaque groupe doit comprendre au moins deux sujets.");
      if (timesA.length !== eventsA.length || timesB.length !== eventsB.length) {
        return error("Dans chaque groupe, renseignez exactement un indicateur d’événement pour chaque temps de suivi.");
      }
      if ([...timesA, ...timesB].some((time) => !Number.isFinite(time) || time <= 0)) {
        return error("Tous les temps de suivi doivent être strictement positifs et finis.");
      }
      if ([...eventsA, ...eventsB].some((event) => event !== 0 && event !== 1)) {
        return error("Les indicateurs d’événement doivent être 1 (événement) ou 0 (censure).");
      }
      if (!eventsA.includes(1) || !eventsB.includes(1)) {
        return error("Chaque groupe doit contenir au moins un événement pour estimer la courbe et effectuer le test du log-rank.");
      }

      const groupA = estimateSurvival(timesA, eventsA, "Groupe A");
      const groupB = estimateSurvival(timesB, eventsB, "Groupe B");
      const allEventTimes = [...new Set([
        ...timesA.filter((_, i) => eventsA[i] === 1),
        ...timesB.filter((_, i) => eventsB[i] === 1),
      ])].sort((a, b) => a - b);

      let observedMinusExpected = 0;
      let variance = 0;
      for (const time of allEventTimes) {
        const nA = timesA.filter((t) => t >= time).length;
        const nB = timesB.filter((t) => t >= time).length;
        const dA = timesA.reduce((sum, t, i) => sum + (t === time && eventsA[i] === 1 ? 1 : 0), 0);
        const dB = timesB.reduce((sum, t, i) => sum + (t === time && eventsB[i] === 1 ? 1 : 0), 0);
        const n = nA + nB;
        const d = dA + dB;
        if (n > 0) observedMinusExpected += dA - d * nA / n;
        if (n > 1) variance += (nA * nB * d * (n - d)) / (n * n * (n - 1));
      }
      if (!Number.isFinite(variance) || variance <= 0) {
        return error("Le test du log-rank n’est pas estimable avec cette distribution des événements et des censures.");
      }

      const chi2 = Math.pow(observedMinusExpected, 2) / variance;
      const p = chi2Upper(chi2, 1);
      const medianText = (group: SurvivalEstimate) => group.median === null ? "non atteinte pendant le suivi" : numberText(group.median) ;
      const latestText = (group: SurvivalEstimate) => {
        const estimate = numberText(group.lastSurvival * 100, 1) + " % à t = " + numberText(group.lastEventTime);
        if (!group.lastCI) return estimate + " (IC 95 % non estimable)";
        return estimate + " (IC 95 % " + numberText(group.lastCI.low * 100, 1) + "–" + numberText(group.lastCI.high * 100, 1) + " %)";
      };

      return {
        title: "Survie — Kaplan–Meier et log-rank",
        sections: [
          {
            heading: "Groupe A",
            metrics: [
              metric("Sujets", String(groupA.n)),
              metric("Événements observés", String(groupA.events)),
              metric("Observations censurées", String(groupA.censored)),
              metric("Médiane de survie", medianText(groupA), true),
              metric("Dernière estimation Kaplan–Meier", latestText(groupA)),
            ],
          },
          {
            heading: "Groupe B",
            metrics: [
              metric("Sujets", String(groupB.n)),
              metric("Événements observés", String(groupB.events)),
              metric("Observations censurées", String(groupB.censored)),
              metric("Médiane de survie", medianText(groupB), true),
              metric("Dernière estimation Kaplan–Meier", latestText(groupB)),
            ],
          },
          {
            heading: "Comparaison globale",
            metrics: [
              metric("Test du log-rank, χ² (1 ddl)", numberText(chi2, 3), true),
              metric("p bilatérale", "p = " + pText(p), true),
            ],
          },
        ],
        interpretation: "Kaplan–Meier estime la probabilité de rester sans événement en tenant compte de la censure à droite. Le test du log-rank compare globalement les distributions de survie sur la période de suivi ; il ne teste pas une différence à un temps isolé. Il peut être peu sensible si les courbes se croisent. Vérifiez les définitions de l’événement, la comparabilité des groupes, l’indépendance des observations et le caractère non informatif de la censure avant toute interprétation clinique.",
        thesis: "Les courbes de survie ont été estimées par Kaplan–Meier. Dans le groupe A, " + groupA.events + " événements ont été observés parmi " + groupA.n + " sujets ; la médiane de survie est " + medianText(groupA) + ". Dans le groupe B, " + groupB.events + " événements ont été observés parmi " + groupB.n + " sujets ; la médiane de survie est " + medianText(groupB) + ". La comparaison globale par test du log-rank donne χ²(1) = " + numberText(chi2, 3) + ", p = " + pText(p) + ". L’interprétation repose sur les hypothèses de la méthode, en particulier une censure non informative.",
        chart: {
          type: "survival",
          groups: [
            { label: "Groupe A", maxTime: groupA.maxTime, points: [{ time: 0, survival: 1 }, ...groupA.points] },
            { label: "Groupe B", maxTime: groupB.maxTime, points: [{ time: 0, survival: 1 }, ...groupB.points] },
          ],
        },
      };
    },
  },
];
