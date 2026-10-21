export type CourseChart =
  | "normal"
  | "ci"
  | "compare"
  | "casTemoins"
  | "cohorte"
  | "pvalue"
  | "power"
  | "regression";

export type CourseSection = { heading?: string; paragraphs: string[] };

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: "brandPrimary" | "brandSecondary" | "brandTertiary" | "info";
  chart?: CourseChart;
  sections: CourseSection[];
};

export const COURSES: Course[] = [
  {
    id: "intervalles-confiance",
    title: "Les intervalles de confiance",
    subtitle: "Estimer une valeur avec sa marge d'incertitude",
    icon: "ChartBar",
    accent: "info",
    chart: "ci",
    sections: [
      {
        paragraphs: [
          "Un intervalle de confiance (IC) fournit une fourchette de valeurs plausibles pour un paramètre inconnu de la population (une moyenne, une proportion…), à partir des données d'un échantillon.",
          "Un IC à 95 % signifie que si l'on répétait l'étude un grand nombre de fois, environ 95 % des intervalles calculés contiendraient la vraie valeur. Ce n'est donc pas « 95 % de chance que la vraie valeur soit dans l'intervalle », mais une propriété de la méthode.",
        ],
      },
      {
        heading: "Comment le lire",
        paragraphs: [
          "Le point central est l'estimation ponctuelle (ce que l'on a observé). Les bornes traduisent l'incertitude : plus l'échantillon est grand, plus l'intervalle est étroit et l'estimation précise.",
          "Formule usuelle : estimation ± z × erreur-standard. Pour 95 %, z ≈ 1,96 ; pour 99 %, z ≈ 2,58.",
        ],
      },
      {
        heading: "En pratique",
        paragraphs: [
          "Si l'IC d'une différence contient 0 (ou l'IC d'un rapport contient 1), le résultat n'est pas significatif au seuil correspondant.",
        ],
      },
    ],
  },
  {
    id: "comparaison-statistique",
    title: "La comparaison statistique",
    subtitle: "Tests d'hypothèse, risque α et valeur p",
    icon: "ArrowsLeftRight",
    accent: "brandSecondary",
    chart: "compare",
    sections: [
      {
        paragraphs: [
          "Comparer deux groupes revient à confronter deux hypothèses : l'hypothèse nulle (H0 : « aucune différence ») et l'hypothèse alternative (H1 : « il existe une différence »).",
          "Le test calcule la probabilité (la valeur p) d'observer une différence au moins aussi grande que celle mesurée si H0 était vraie.",
        ],
      },
      {
        heading: "Interpréter la valeur p",
        paragraphs: [
          "Si p < 0,05 (seuil α usuel), on rejette H0 : la différence est dite « statistiquement significative ».",
          "Une différence significative n'est pas forcément cliniquement importante : regardez toujours la taille de l'effet et son intervalle de confiance.",
        ],
      },
      {
        heading: "Les deux risques d'erreur",
        paragraphs: [
          "Risque α (première espèce) : conclure à tort à une différence qui n'existe pas (faux positif).",
          "Risque β (seconde espèce) : ne pas détecter une différence réelle (faux négatif). La puissance vaut 1 − β : c'est la capacité du test à mettre en évidence une différence existante.",
        ],
      },
    ],
  },
  {
    id: "etudes-cas-temoins",
    title: "Les études cas-témoins",
    subtitle: "Partir de la maladie pour remonter à l'exposition",
    icon: "MagnifyingGlass",
    accent: "brandSecondary",
    chart: "casTemoins",
    sections: [
      {
        paragraphs: [
          "Dans une étude cas-témoins, on sélectionne des sujets selon leur statut vis-à-vis de la maladie : les « cas » (malades) et les « témoins » (non malades), puis on recherche rétrospectivement leur exposition passée.",
          "C'est une étude rétrospective, particulièrement adaptée aux maladies rares ou à long temps de latence.",
        ],
      },
      {
        heading: "Mesure d'association",
        paragraphs: [
          "On ne peut pas calculer d'incidence ni de risque relatif : la mesure adaptée est l'odds ratio (rapport des cotes d'exposition).",
          "Un OR > 1 suggère que l'exposition est associée à un sur-risque de maladie ; un OR < 1 à un effet protecteur.",
        ],
      },
      {
        heading: "Forces et limites",
        paragraphs: [
          "Avantages : rapide, peu coûteuse, efficace pour les maladies rares, permet d'étudier plusieurs expositions.",
          "Limites : sensible aux biais de sélection et de mémorisation, ne permet pas d'estimer directement l'incidence.",
        ],
      },
    ],
  },
  {
    id: "etudes-cohorte",
    title: "Les études de cohorte",
    subtitle: "Partir de l'exposition pour suivre la survenue",
    icon: "UsersThree",
    accent: "brandPrimary",
    chart: "cohorte",
    sections: [
      {
        paragraphs: [
          "Dans une étude de cohorte, on part de sujets indemnes de la maladie, classés selon leur exposition (exposés / non-exposés), puis on les suit dans le temps pour observer la survenue de l'événement.",
          "C'est une étude le plus souvent prospective, qui respecte la chronologie « cause → effet ».",
        ],
      },
      {
        heading: "Mesures d'association",
        paragraphs: [
          "On peut calculer les incidences dans chaque groupe, puis le risque relatif (RR = incidence chez les exposés / incidence chez les non-exposés).",
          "Un RR > 1 traduit un facteur de risque, un RR < 1 un facteur protecteur.",
        ],
      },
      {
        heading: "Forces et limites",
        paragraphs: [
          "Avantages : chronologie établie, estimation directe de l'incidence et du risque relatif, plusieurs événements étudiables.",
          "Limites : coûteuse et longue, mal adaptée aux maladies rares, exposée aux perdus de vue.",
        ],
      },
    ],
  },
  {
    id: "valeur-p",
    title: "La valeur p",
    subtitle: "Ce qu'elle dit… et ce qu'elle ne dit pas",
    icon: "Percent",
    accent: "brandSecondary",
    chart: "pvalue",
    sections: [
      {
        paragraphs: [
          "La valeur p est la probabilité d'observer un résultat au moins aussi extrême que celui mesuré, si l'hypothèse nulle (H0 : « pas de différence ») était vraie.",
          "Sur le schéma, elle correspond à l'aire sous la courbe de H0 située au-delà de la statistique observée (dans les deux sens pour un test bilatéral).",
        ],
      },
      {
        heading: "Le seuil α",
        paragraphs: [
          "Avant l'analyse, on fixe un seuil α (le plus souvent 5 %). Si p < α, on rejette H0 : le résultat est dit « statistiquement significatif ». Si p ≥ α, on ne peut pas rejeter H0 — ce qui ne prouve pas l'absence de différence.",
          "Une valeur p n'est pas binaire : p = 0,049 et p = 0,051 traduisent des niveaux de preuve très proches. Rapportez toujours la valeur exacte (p = 0,032) plutôt que « p < 0,05 » ou « NS ».",
        ],
      },
      {
        heading: "Les pièges à éviter",
        paragraphs: [
          "p n'est pas la probabilité que H0 soit vraie, ni la probabilité que le résultat soit dû au hasard.",
          "Un p très petit ne signifie pas un effet important : avec un grand échantillon, une différence minime devient significative. Associez toujours p à la taille de l'effet et à son intervalle de confiance.",
          "Multiplier les tests augmente le risque de faux positifs : avec 20 tests à α = 5 %, on attend en moyenne un résultat significatif par hasard (d'où les corrections type Bonferroni).",
        ],
      },
    ],
  },
  {
    id: "puissance",
    title: "La puissance statistique",
    subtitle: "Détecter une différence qui existe vraiment",
    icon: "Lightning",
    accent: "brandPrimary",
    chart: "power",
    sections: [
      {
        paragraphs: [
          "La puissance est la probabilité qu'un test détecte une différence réelle. Elle vaut 1 − β, où β est le risque de seconde espèce (conclure à tort à l'absence de différence : faux négatif).",
          "Sur le schéma, la courbe H0 représente la distribution attendue sans effet, la courbe H1 celle avec l'effet recherché. Le seuil de décision (fixé par α) délimite les zones α, β et 1 − β.",
        ],
      },
      {
        heading: "Les quatre leviers",
        paragraphs: [
          "La puissance augmente avec : la taille de l'échantillon (n), la taille de l'effet recherché (Δ), le seuil α choisi (plus α est grand, plus la puissance augmente… au prix de plus de faux positifs), et diminue avec la variabilité des données (σ).",
          "Ces quatre grandeurs sont liées : fixer trois d'entre elles détermine la quatrième. C'est le principe du calcul de taille d'échantillon a priori.",
        ],
      },
      {
        heading: "En pratique",
        paragraphs: [
          "On vise classiquement une puissance de 80 % (β = 20 %) ou 90 %. Une étude sous-dimensionnée risque de « rater » un effet pourtant réel : un résultat non significatif y est peu informatif.",
          "Dans une thèse, le calcul d'effectif doit être justifié avant l'inclusion : hypothèse sur l'effet attendu (littérature, étude pilote), α, puissance, et pertes de vue anticipées.",
        ],
      },
    ],
  },
  {
    id: "regression",
    title: "La régression",
    subtitle: "Modéliser une relation entre variables",
    icon: "TrendUp",
    accent: "info",
    chart: "regression",
    sections: [
      {
        paragraphs: [
          "La régression linéaire simple modélise la relation entre une variable à expliquer y (quantitative) et une variable explicative x par une droite : y = a + b·x.",
          "La pente b indique de combien y varie en moyenne lorsque x augmente d'une unité ; a est l'ordonnée à l'origine. La droite est ajustée par la méthode des moindres carrés : elle minimise la somme des carrés des résidus (écarts verticaux entre les points et la droite).",
        ],
      },
      {
        heading: "Lire les résultats",
        paragraphs: [
          "Le coefficient de détermination R² (entre 0 et 1) mesure la part de la variabilité de y expliquée par le modèle. Le coefficient de corrélation r en est la racine (avec le signe de la pente).",
          "Chaque coefficient est accompagné d'un intervalle de confiance et d'une valeur p (test de nullité : b = 0 signifie « pas de relation linéaire »).",
        ],
      },
      {
        heading: "Régressions multiple et logistique",
        paragraphs: [
          "La régression multiple intègre plusieurs variables explicatives ; elle permet d'ajuster l'effet d'un facteur sur les autres (facteurs de confusion) et d'obtenir un coefficient « ajusté ».",
          "Lorsque y est binaire (malade / non malade), on utilise la régression logistique : les coefficients s'interprètent en odds ratios ajustés, très utilisés en épidémiologie clinique.",
        ],
      },
      {
        heading: "Conditions d'application",
        paragraphs: [
          "Linéarité de la relation, indépendance des observations, normalité et variance constante des résidus. Vérifiez-les sur le nuage de points et les graphiques de résidus ; méfiez-vous des valeurs extrêmes qui « tirent » la droite.",
        ],
      },
    ],
  },
];
