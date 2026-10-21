// Decision-tree assistant to help choose the right statistical test.

export type Answer = {
  label: string;
  hint?: string;
  next: string; // node id, or "rec:<recommendationId>"
};

export type QuestionNode = {
  id: string;
  question: string;
  help?: string;
  answers: Answer[];
};

export type Recommendation = {
  id: string;
  test: string;
  why: string;
  calcId?: string; // links to a calculator
};

export const START_NODE = "objectif";

export const NODES: Record<string, QuestionNode> = {
  objectif: {
    id: "objectif",
    question: "Quel est votre objectif ?",
    help: "Choisissez ce que vous cherchez à faire avec vos données.",
    answers: [
      { label: "Calculer une taille d'échantillon", hint: "Combien de sujets inclure ?", next: "taille" },
      { label: "Estimer / décrire", hint: "Intervalle de confiance, test diagnostique", next: "estimer" },
      { label: "Comparer des groupes", hint: "Rechercher une différence", next: "comparer" },
      { label: "Vérifier des conditions", hint: "Normalité, égalité des variances", next: "conditions" },
    ],
  },
  taille: {
    id: "taille",
    question: "Pour quel type d'étude calculez-vous l'effectif ?",
    answers: [
      { label: "Estimer une proportion", hint: "Une seule proportion avec précision", next: "rec:sample-proportion" },
      { label: "Étude cas-témoins", hint: "Détecter un odds ratio", next: "rec:sample-cas-temoins" },
      { label: "Étude de cohorte", hint: "Comparer deux incidences", next: "rec:sample-cohorte" },
    ],
  },
  estimer: {
    id: "estimer",
    question: "Que souhaitez-vous estimer ?",
    answers: [
      { label: "L'intervalle de confiance d'une proportion", next: "rec:ic-proportion" },
      { label: "La performance d'un test diagnostique", hint: "Sensibilité, spécificité…", next: "rec:test-diagnostique" },
    ],
  },
  conditions: {
    id: "conditions",
    question: "Quelle condition voulez-vous vérifier ?",
    answers: [
      { label: "La normalité d'une distribution", next: "rec:normalite" },
      { label: "L'égalité des variances (Levene)", next: "rec:levene" },
    ],
  },
  comparer: {
    id: "comparer",
    question: "Quelle est la nature des données à comparer ?",
    help: "Qualitatives = catégories (oui/non, guéri/non). Quantitatives = mesures chiffrées.",
    answers: [
      { label: "Qualitatives (catégories)", hint: "Pourcentages, effectifs", next: "qual-appariement" },
      { label: "Quantitatives (mesures)", hint: "Poids, tension, âge…", next: "quant-appariement" },
    ],
  },
  "qual-appariement": {
    id: "qual-appariement",
    question: "Les groupes sont-ils indépendants ou appariés ?",
    help: "Appariés = mêmes sujets mesurés deux fois, ou sujets couplés.",
    answers: [
      { label: "Indépendants", next: "qual-indep" },
      { label: "Appariés", hint: "Avant / après chez les mêmes sujets", next: "rec:mcnemar" },
    ],
  },
  "qual-indep": {
    id: "qual-indep",
    question: "Comment se présentent vos données qualitatives ?",
    answers: [
      { label: "Deux proportions à comparer", hint: "45/100 vs 30/100", next: "rec:deux-prop" },
      { label: "Un tableau croisé d'effectifs", hint: "Tableau 2×2", next: "rec:chi2" },
    ],
  },
  "quant-appariement": {
    id: "quant-appariement",
    question: "Les groupes sont-ils indépendants ou appariés ?",
    answers: [
      { label: "Indépendants", hint: "Deux groupes distincts ou plus", next: "quant-nb-groupes" },
      { label: "Appariés", hint: "Avant / après", next: "rec:apparie" },
    ],
  },
  "quant-nb-groupes": {
    id: "quant-nb-groupes",
    question: "Combien de groupes comparez-vous ?",
    answers: [
      { label: "Deux groupes", next: "quant-indep-normal" },
      { label: "Trois groupes ou plus", hint: "ANOVA / Kruskal-Wallis", next: "quant-multi-normal" },
    ],
  },
  "quant-multi-normal": {
    id: "quant-multi-normal",
    question: "Les données suivent-elles une loi normale avec des variances homogènes ?",
    help: "Vérifiez-le avec les calculateurs de normalité et de Levene si vous avez un doute.",
    answers: [
      { label: "Oui (ou grands échantillons)", next: "rec:anova" },
      { label: "Non (ou petits échantillons)", next: "rec:kruskal" },
    ],
  },
  "quant-indep-normal": {
    id: "quant-indep-normal",
    question: "Les données suivent-elles une loi normale ?",
    help: "Vérifiez-le avec le calculateur de normalité si vous avez un doute.",
    answers: [
      { label: "Oui (ou grand échantillon)", next: "rec:student" },
      { label: "Non (ou petit échantillon)", next: "rec:mannwhitney" },
    ],
  },
};

export const RECOMMENDATIONS: Record<string, Recommendation> = {
  "sample-proportion": {
    id: "sample-proportion",
    test: "Calcul d'effectif — Proportion",
    why: "Vous estimez une proportion avec une précision fixée : la taille d'échantillon se calcule via n = z²·p·(1−p)/d².",
    calcId: "sample-proportion",
  },
  "sample-cas-temoins": {
    id: "sample-cas-temoins",
    test: "Calcul d'effectif — Cas-témoins",
    why: "Pour détecter un odds ratio dans une étude cas-témoins, l'effectif dépend de l'exposition chez les témoins, de l'OR, de α et de la puissance.",
    calcId: "sample-cas-temoins",
  },
  "sample-cohorte": {
    id: "sample-cohorte",
    test: "Calcul d'effectif — Cohorte",
    why: "Comparer deux incidences suppose de fixer les deux proportions attendues, α et la puissance.",
    calcId: "sample-cohorte",
  },
  "ic-proportion": {
    id: "ic-proportion",
    test: "Intervalle de confiance d'une proportion",
    why: "Vous décrivez une proportion observée et souhaitez sa marge d'incertitude (méthode de Wilson recommandée).",
    calcId: "ic-proportion",
  },
  "test-diagnostique": {
    id: "test-diagnostique",
    test: "Performance d'un test diagnostique",
    why: "À partir d'un tableau 2×2, on obtient sensibilité, spécificité, valeurs prédictives et exactitude.",
    calcId: "test-diagnostique",
  },
  normalite: {
    id: "normalite",
    test: "Critères de normalité",
    why: "Le test de D'Agostino-Pearson, l'asymétrie et l'aplatissement permettent de juger la normalité d'une distribution.",
    calcId: "normalite",
  },
  levene: {
    id: "levene",
    test: "Test de Levene",
    why: "Il vérifie l'égalité des variances entre groupes, condition d'un test t de Student classique.",
    calcId: "levene",
  },
  mcnemar: {
    id: "mcnemar",
    test: "Test de McNemar",
    why: "Données qualitatives binaires appariées : le test s'appuie sur les paires discordantes.",
    calcId: "comp-mcnemar",
  },
  "deux-prop": {
    id: "deux-prop",
    test: "Comparaison de 2 proportions (test z)",
    why: "Deux proportions indépendantes se comparent par un test z, avec IC de la différence, RR et OR.",
    calcId: "comp-2-proportions",
  },
  chi2: {
    id: "chi2",
    test: "Test du Chi² / test exact de Fisher",
    why: "Un tableau croisé se teste par le Chi² ; si un effectif théorique est < 5, on utilise le test exact de Fisher.",
    calcId: "comp-qualitatif",
  },
  apparie: {
    id: "apparie",
    test: "Test t apparié / Wilcoxon signé",
    why: "Mesures quantitatives appariées : test t sur les différences si elles sont normales, sinon test de Wilcoxon signé.",
    calcId: "comp-quant-apparie",
  },
  student: {
    id: "student",
    test: "Test t de Student (ou de Welch)",
    why: "Données quantitatives normales et indépendantes : test t de Student si les variances sont égales, de Welch sinon.",
    calcId: "comp-quant-indep",
  },
  mannwhitney: {
    id: "mannwhitney",
    test: "Test de Mann-Whitney",
    why: "Données non normales ou petits échantillons indépendants : le test non paramétrique de Mann-Whitney est adapté.",
    calcId: "comp-quant-indep",
  },
  anova: {
    id: "anova",
    test: "ANOVA à un facteur",
    why: "Trois groupes indépendants ou plus, données normales et variances homogènes : l'analyse de variance teste l'égalité des moyennes, puis les comparaisons 2 à 2 (Bonferroni) précisent quels groupes diffèrent.",
    calcId: "comp-multi-groupes",
  },
  kruskal: {
    id: "kruskal",
    test: "Test de Kruskal-Wallis",
    why: "Trois groupes indépendants ou plus, données non normales ou petits effectifs : le test de Kruskal-Wallis compare les rangs, complété par le test de Dunn (Bonferroni) pour les comparaisons 2 à 2.",
    calcId: "comp-multi-groupes",
  },
};
