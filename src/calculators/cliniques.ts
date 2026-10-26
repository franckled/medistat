import { Calculator, CalcResult, num } from "./types";

const yesNoOptions = [
  { label: "Non", value: "0" },
  { label: "Oui", value: "1" },
];
const sexOptions = [
  { label: "Homme", value: "male" },
  { label: "Femme", value: "female" },
];
const creatinineUnitOptions = [
  { label: "µmol/L", value: "umol" },
  { label: "mg/dL", value: "mg" },
];

function error(message: string): CalcResult {
  return { title: "", sections: [], interpretation: "", thesis: "", error: message };
}
function fmt(value: number, digits = 1): string {
  return value.toFixed(digits).replace(".", ",");
}
function item(label: string, value: string, highlight = false) {
  return { label, value, highlight };
}

export const cliniques: Calculator[] = [
  {
    id: "bsa-mosteller",
    category: "cliniques",
    title: "Surface corporelle — Mosteller",
    subtitle: "Surface corporelle en m²",
    icon: "Ruler",
    accent: "brandPrimary",
    description: "Estimation de la surface corporelle à partir de la taille et du poids. Le résultat ne remplace pas les règles spécifiques de prescription ni la vérification des unités.",
    source: "Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317:1098. Formule : √[taille (cm) × poids (kg) / 3600].",
    inputs: [
      { key: "height", label: "Taille", type: "number", unit: "cm", default: "170" },
      { key: "weight", label: "Poids", type: "number", unit: "kg", default: "70" },
    ],
    compute: (v) => {
      const height = num(v, "height");
      const weight = num(v, "weight");
      if (!Number.isFinite(height) || height < 30 || height > 250) return error("Renseignez une taille comprise entre 30 et 250 cm.");
      if (!Number.isFinite(weight) || weight <= 0 || weight > 350) return error("Renseignez un poids supérieur à 0 et inférieur ou égal à 350 kg.");
      const bsa = Math.sqrt((height * weight) / 3600);
      return {
        title: "Surface corporelle estimée",
        sections: [{ metrics: [item("Surface corporelle", fmt(bsa, 2) + " m²", true), item("Taille utilisée", fmt(height, 1) + " cm"), item("Poids utilisé", fmt(weight, 1) + " kg")] }],
        interpretation: "La formule de Mosteller fournit une estimation de la surface corporelle à partir de la taille et du poids.",
        thesis: "La surface corporelle a été estimée par la formule de Mosteller : √[taille (cm) × poids (kg) / 3600], soit " + fmt(bsa, 2) + " m².",
      };
    },
  },
  {
    id: "cockcroft-gault",
    category: "cliniques",
    title: "Clairance de la créatinine — Cockcroft–Gault",
    subtitle: "Estimation en mL/min",
    icon: "Drop",
    accent: "info",
    description: "Estimation de la clairance de la créatinine chez l’adulte. Le poids à utiliser dépend du contexte clinique ; cette estimation ne doit pas être convertie automatiquement en posologie.",
    source: "Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16:31–41. Limites et recommandations de transition vers les équations d’eDFG : National Kidney Foundation, page KDOQI Cockcroft–Gault (consultée le 26/10/2026).",
    inputs: [
      { key: "age", label: "Âge", type: "number", unit: "ans", default: "65" },
      { key: "weight", label: "Poids utilisé par la formule", type: "number", unit: "kg", default: "70" },
      { key: "creatinine", label: "Créatinine sérique", type: "number", default: "90" },
      { key: "unit", label: "Unité de créatinine", type: "select", default: "umol", options: creatinineUnitOptions },
      { key: "sex", label: "Sexe utilisé par la formule", type: "select", default: "male", options: sexOptions },
    ],
    compute: (v) => {
      const age = num(v, "age");
      const weight = num(v, "weight");
      const cr = num(v, "creatinine");
      const sex = v.sex;
      const unit = v.unit;
      if (!Number.isFinite(age) || age < 18 || age > 120) return error("Cette estimation est destinée aux adultes : âge compris entre 18 et 120 ans.");
      if (!Number.isFinite(weight) || weight <= 0 || weight > 350) return error("Renseignez un poids supérieur à 0 et inférieur ou égal à 350 kg.");
      if (!Number.isFinite(cr) || cr <= 0) return error("La créatinine doit être strictement positive.");
      if (sex !== "male" && sex !== "female") return error("Sélectionnez le sexe utilisé par la formule.");
      if (unit !== "mg" && unit !== "umol") return error("Sélectionnez une unité de créatinine.");
      const scr = unit === "umol" ? cr / 88.4 : cr;
      const clearance = ((140 - age) * weight) / (72 * scr) * (sex === "female" ? 0.85 : 1);
      if (!Number.isFinite(clearance) || clearance <= 0) return error("Impossible de calculer cette estimation avec les valeurs fournies.");
      return {
        title: "Clairance estimée — Cockcroft–Gault",
        sections: [{ metrics: [item("Clairance estimée", fmt(clearance, 1) + " mL/min", true), item("Créatinine convertie", fmt(scr, 2) + " mg/dL"), item("Poids introduit", fmt(weight, 1) + " kg")] }],
        interpretation: "Il s’agit d’une estimation de clairance, sensible au choix du poids, à l’état clinique et à la standardisation du dosage. Vérifiez la méthode recommandée pour la décision clinique concernée.",
        thesis: "La clairance de la créatinine a été estimée par Cockcroft–Gault à " + fmt(clearance, 1) + " mL/min, à partir d’un âge de " + fmt(age, 0) + " ans, d’un poids de " + fmt(weight, 1) + " kg et d’une créatinine de " + fmt(scr, 2) + " mg/dL.",
      };
    },
  },
  {
    id: "ckd-epi-2021",
    category: "cliniques",
    title: "DFG estimé — CKD-EPI 2021",
    subtitle: "Équation basée sur la créatinine, sans coefficient racial",
    icon: "Activity",
    accent: "brandSecondary",
    description: "Équation CKD-EPI 2021 pour estimer le débit de filtration glomérulaire chez l’adulte à partir de la créatinine standardisée, de l’âge et du sexe. Ce résultat est indexé à 1,73 m².",
    source: "National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK), eGFR Equations for Adults, équation CKD-EPI créatinine 2021 (consultée le 26/10/2026) : https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/glomerular-filtration-rate-equations/adults",
    inputs: [
      { key: "age", label: "Âge", type: "number", unit: "ans", default: "65" },
      { key: "creatinine", label: "Créatinine sérique standardisée", type: "number", default: "90" },
      { key: "unit", label: "Unité de créatinine", type: "select", default: "umol", options: creatinineUnitOptions },
      { key: "sex", label: "Sexe utilisé par l’équation", type: "select", default: "male", options: sexOptions },
    ],
    compute: (v) => {
      const age = num(v, "age");
      const cr = num(v, "creatinine");
      const sex = v.sex;
      const unit = v.unit;
      if (!Number.isFinite(age) || age < 18 || age > 120) return error("L’équation CKD-EPI 2021 présentée ici est prévue pour les adultes de 18 ans ou plus.");
      if (!Number.isFinite(cr) || cr <= 0) return error("La créatinine doit être strictement positive.");
      if (sex !== "male" && sex !== "female") return error("Sélectionnez le sexe utilisé par l’équation.");
      if (unit !== "mg" && unit !== "umol") return error("Sélectionnez une unité de créatinine.");
      const scr = unit === "umol" ? cr / 88.4 : cr;
      const female = sex === "female";
      const k = female ? 0.7 : 0.9;
      const alpha = female ? -0.241 : -0.302;
      const ratio = scr / k;
      const egfr = 142 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.2) * Math.pow(0.9938, age) * (female ? 1.012 : 1);
      if (!Number.isFinite(egfr) || egfr <= 0) return error("Impossible de calculer le DFG avec les valeurs fournies.");
      return {
        title: "DFG estimé — CKD-EPI 2021",
        sections: [{ metrics: [item("DFG estimé", fmt(egfr, 1) + " mL/min/1,73 m²", true), item("Créatinine utilisée", fmt(scr, 2) + " mg/dL"), item("Équation", "CKD-EPI créatinine 2021, sans coefficient racial")] }],
        interpretation: "Cette équation fournit une estimation et non une mesure directe. En cas de décision proche d’un seuil clinique, d’altération aiguë de la fonction rénale ou de déterminants non rénaux de la créatinine, une évaluation complémentaire peut être nécessaire ; l’équation combinant créatinine et cystatine C est plus précise dans certains contextes.",
        thesis: "Le débit de filtration glomérulaire estimé par l’équation CKD-EPI créatinine 2021 (sans coefficient racial) est de " + fmt(egfr, 1) + " mL/min/1,73 m².",
      };
    },
  },
  {
    id: "ecog",
    category: "cliniques",
    title: "Performance status — ECOG",
    subtitle: "Repère fonctionnel en oncologie",
    icon: "UserFocus",
    accent: "brandTertiary",
    description: "Sélectionnez le grade ECOG correspondant à l’état fonctionnel évalué cliniquement. Cette liste aide à documenter le score mais ne remplace pas l’évaluation de l’équipe soignante.",
    source: "ECOG-ACRIN Cancer Research Group, ECOG Performance Status Scale; Oken MM et al. Am J Clin Oncol. 1982;5:649–655. https://ecog-acrin.org/resources/ecog-performance-status/",
    inputs: [{
      key: "grade",
      label: "Grade ECOG",
      type: "select",
      default: "0",
      options: [
        { label: "0 — Activité normale", value: "0" },
        { label: "1 — Activité physique intense limitée", value: "1" },
        { label: "2 — Autonome, sans activité professionnelle", value: "2" },
        { label: "3 — Soins personnels limités", value: "3" },
        { label: "4 — Dépendance complète", value: "4" },
        { label: "5 — Décès", value: "5" },
      ],
    }],
    compute: (v) => {
      const labels: Record<string, string> = {
        "0": "Pleinement actif, sans restriction par rapport à l’activité antérieure à la maladie.",
        "1": "Limitation des activités physiques intenses, mais ambulatoire et capable d’un travail léger ou sédentaire.",
        "2": "Ambulatoire et capable de prendre soin de soi, mais incapable de travailler ; debout plus de 50 % du temps éveillé.",
        "3": "Capacité limitée aux soins personnels ; au lit ou au fauteuil plus de 50 % du temps éveillé.",
        "4": "Handicap complet ; incapable de prendre soin de soi, confiné au lit ou au fauteuil.",
        "5": "Décès.",
      };
      const grade = v.grade;
      if (!(grade in labels)) return error("Sélectionnez un grade ECOG valide.");
      const description = labels[grade];
      return {
        title: "Performance status — ECOG",
        sections: [{ metrics: [item("Grade ECOG", grade + " / 5", true), item("Description", description)] }],
        interpretation: "Le score ECOG est un repère clinique ordinal. Il doit être évalué et interprété dans son contexte, sans en déduire seul une indication thérapeutique.",
        thesis: "L’état fonctionnel a été documenté par le performance status ECOG, grade " + grade + " : " + description,
      };
    },
  },
  {
    id: "karnofsky",
    category: "cliniques",
    title: "Indice de Karnofsky",
    subtitle: "Autonomie et état fonctionnel",
    icon: "Gauge",
    accent: "brandPrimary",
    description: "Référence de documentation du niveau fonctionnel. Choisissez la valeur évaluée cliniquement ; l’application ne déduit pas le score à partir de symptômes.",
    source: "Karnofsky DA, Burchenal JH. The Clinical Evaluation of Chemotherapeutic Agents in Cancer. In: MacLeod CM, ed. Evaluation of Chemotherapeutic Agents. Columbia University Press; 1949.",
    inputs: [{
      key: "score",
      label: "Score de Karnofsky",
      type: "select",
      default: "100",
      options: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((n) => ({ label: String(n), value: String(n) })),
    }],
    compute: (v) => {
      const score = Number(v.score);
      const bands: [number, string][] = [
        [100, "Activité normale, aucun signe ni symptôme."],
        [90, "Activité normale possible ; signes ou symptômes mineurs."],
        [80, "Activité normale possible avec effort ; signes ou symptômes présents."],
        [70, "Prend soin de soi mais incapable d’une activité normale ou d’un travail."],
        [60, "Nécessite une aide occasionnelle mais peut prendre soin de la plupart de ses besoins."],
        [50, "Nécessite une aide importante et des soins médicaux fréquents."],
        [40, "Handicapé ; nécessite des soins et une assistance particuliers."],
        [30, "Handicap sévère ; hospitalisation indiquée, sans nécessité immédiate de réanimation."],
        [20, "Très malade ; traitement de soutien actif nécessaire."],
        [10, "Moribond ; processus fatal progressant rapidement."],
        [0, "Décès."],
      ];
      const entry = bands.find(([threshold]) => score === threshold);
      if (!entry) return error("Sélectionnez une valeur de Karnofsky comprise entre 0 et 100 par pas de 10.");
      return {
        title: "Indice de Karnofsky",
        sections: [{ metrics: [item("Score", score + " / 100", true), item("Description", entry[1])] }],
        interpretation: "Le Karnofsky est une échelle fonctionnelle. Le score doit être coté à partir de l’évaluation clinique et ne décide pas, à lui seul, d’un traitement.",
        thesis: "Le statut fonctionnel a été documenté par un indice de Karnofsky de " + score + "/100 : " + entry[1],
      };
    },
  },
  {
    id: "cha2ds2-vasc",
    category: "cliniques",
    title: "Score CHA₂DS₂-VASc",
    subtitle: "Facteurs de risque thromboembolique",
    icon: "Heart",
    accent: "brandSecondary",
    description: "Addition des facteurs cliniques du score CHA₂DS₂-VASc pour la documentation du risque thromboembolique en fibrillation atriale. Le score seul ne détermine pas le traitement.",
    source: "Lip GYH et al. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the euro heart survey on atrial fibrillation. Chest. 2010;137:263–272. À interpréter selon les recommandations en vigueur.",
    inputs: [
      { key: "chf", label: "Insuffisance cardiaque clinique (C)", type: "select", default: "0", options: yesNoOptions },
      { key: "htn", label: "Hypertension artérielle (H)", type: "select", default: "0", options: yesNoOptions },
      { key: "age", label: "Âge", type: "select", default: "under65", options: [{ label: "< 65 ans", value: "under65" }, { label: "65–74 ans", value: "65to74" }, { label: "≥ 75 ans", value: "75plus" }] },
      { key: "diabetes", label: "Diabète (D)", type: "select", default: "0", options: yesNoOptions },
      { key: "stroke", label: "AVC / AIT / thromboembolie antérieure (S₂)", type: "select", default: "0", options: yesNoOptions },
      { key: "vascular", label: "Maladie vasculaire (V)", type: "select", default: "0", options: yesNoOptions },
      { key: "female", label: "Sexe féminin (Sc)", type: "select", default: "0", options: yesNoOptions },
    ],
    compute: (v) => {
      const bool = (key: string) => v[key] === "1";
      if (!["under65", "65to74", "75plus"].includes(v.age)) return error("Sélectionnez une tranche d’âge valide.");
      const components = [
        { label: "Insuffisance cardiaque", value: bool("chf") ? 1 : 0 },
        { label: "Hypertension", value: bool("htn") ? 1 : 0 },
        { label: "Âge", value: v.age === "75plus" ? 2 : v.age === "65to74" ? 1 : 0 },
        { label: "Diabète", value: bool("diabetes") ? 1 : 0 },
        { label: "AVC/AIT/thromboembolie", value: bool("stroke") ? 2 : 0 },
        { label: "Maladie vasculaire", value: bool("vascular") ? 1 : 0 },
        { label: "Sexe féminin", value: bool("female") ? 1 : 0 },
      ];
      const score = components.reduce((sum, c) => sum + c.value, 0);
      return {
        title: "Score CHA₂DS₂-VASc",
        sections: [
          { heading: "Score total", metrics: [item("CHA₂DS₂-VASc", String(score), true)] },
          { heading: "Contribution des facteurs", metrics: components.map((c) => item(c.label, "+" + c.value)) },
        ],
        interpretation: "Le score total décrit le nombre de points selon les facteurs sélectionnés. Il ne fournit pas à lui seul une décision d’anticoagulation ; vérifiez les recommandations actuelles, les contre-indications et le contexte clinique.",
        thesis: "Le score CHA₂DS₂-VASc calculé à partir des facteurs renseignés est de " + score + ". La décision thérapeutique doit rester fondée sur une évaluation clinique complète et les recommandations actualisées.",
      };
    },
  },
  {
    id: "wells-ep",
    category: "cliniques",
    title: "Score de Wells — embolie pulmonaire",
    subtitle: "Estimation de probabilité clinique pré-test",
    icon: "Lungs",
    accent: "info",
    description: "Score de probabilité clinique pré-test en cas de suspicion d’embolie pulmonaire chez l’adulte. Il ne confirme ni n’exclut seul le diagnostic : suivre l’algorithme de prise en charge adapté.",
    source: "Wells PS et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism: increasing the models utility with the SimpliRED D-dimer. Thromb Haemost. 2000;83:416–420. Catégories à deux niveaux (≤ 4 PE improbable, > 4 PE probable) : recommandations AHA/ACC/ACCP/ACEP/CHEST et sociétés partenaires, guideline 2026.",
    inputs: [
      { key: "dvt", label: "Signes cliniques de TVP", type: "select", default: "0", options: yesNoOptions },
      { key: "alternative", label: "EP plus probable qu’un autre diagnostic", type: "select", default: "0", options: yesNoOptions },
      { key: "heart", label: "Fréquence cardiaque > 100/min", type: "select", default: "0", options: yesNoOptions },
      { key: "immobilization", label: "Immobilisation ≥ 3 jours ou chirurgie récente", type: "select", default: "0", options: yesNoOptions },
      { key: "previous", label: "TVP ou EP antérieure", type: "select", default: "0", options: yesNoOptions },
      { key: "hemoptysis", label: "Hémoptysie", type: "select", default: "0", options: yesNoOptions },
      { key: "cancer", label: "Cancer actif", type: "select", default: "0", options: yesNoOptions },
    ],
    compute: (v) => {
      const bool = (key: string) => v[key] === "1";
      const components = [
        { label: "Signes cliniques de TVP", value: bool("dvt") ? 3 : 0 },
        { label: "EP plus probable qu’un autre diagnostic", value: bool("alternative") ? 3 : 0 },
        { label: "Fréquence cardiaque > 100/min", value: bool("heart") ? 1.5 : 0 },
        { label: "Immobilisation ≥ 3 jours ou chirurgie récente", value: bool("immobilization") ? 1.5 : 0 },
        { label: "Antécédent TVP/EP", value: bool("previous") ? 1.5 : 0 },
        { label: "Hémoptysie", value: bool("hemoptysis") ? 1 : 0 },
        { label: "Cancer actif", value: bool("cancer") ? 1 : 0 },
      ];
      const score = components.reduce((sum, c) => sum + c.value, 0);
      const likelihood = score > 4 ? "EP probable (> 4 points)" : "EP improbable (≤ 4 points)";
      return {
        title: "Score de Wells — embolie pulmonaire",
        sections: [
          { heading: "Résultat", metrics: [item("Score de Wells", fmt(score, 1), true), item("Catégorie à deux niveaux", likelihood)] },
          { heading: "Contribution des items", metrics: components.map((c) => item(c.label, "+" + fmt(c.value, 1))) },
        ],
        interpretation: "Il s’agit d’une probabilité clinique pré-test. La catégorie doit être utilisée dans un parcours diagnostique validé (notamment stratégie D-dimères/imagerie selon le contexte) ; une urgence clinique nécessite une prise en charge immédiate.",
        thesis: "Le score de Wells pour embolie pulmonaire est de " + fmt(score, 1) + " points, correspondant à la catégorie « " + likelihood + " » selon la règle à deux niveaux. Ce score doit être intégré à l’algorithme diagnostique validé.",
      };
    },
  },
];
