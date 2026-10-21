# PRD — MediStat

## Problem statement (original, FR)
Application mobile médicale de statistiques biomédicales pour étudiants/médecins. Pas de compte. Copyright « Dr Franck LE DUFF ». Trois piliers : (1) rappels des méthodes statistiques (IC, comparaison, études cas-témoins & cohorte) avec explications graphiques ; (2) calculs (échantillonnage : proportion / cas-témoins / cohorte ; épidémiologie : IC d'une proportion, Se/Sp/VPP/VPN/valeurs globales ; normalité + test de Levene ; comparaisons : 2 proportions, qualitatif paramétrique/non-paramétrique, apparié, quantitatif indépendant/apparié) ; (3) aide au choix de la bonne méthode. Résultats exportables/copiables pour une thèse. App ludique, colorée, icônes explicites.

## User choices
- Calculs entièrement côté client (hors ligne)
- Assistant = arbre de décision guidé
- Export : copier + partager + PDF
- Style coloré vif et ludique
- Copyright « © Dr Franck LE DUFF » affiché

## Architecture
- **Frontend**: Expo Router (SDK 57), React Native. Nunito font, Phosphor icons, react-native-svg charts, expo-clipboard / expo-print / expo-sharing for exports. Theme in `src/theme.ts` (Mint/Rose/Amber playful light).
- **Stats engine** (pure TS, `src/stats/`): special functions (erf, lgamma, incomplete beta/gamma, normal/t/chi²/F CDFs & quantiles) + descriptive helpers.
- **Calculators** (`src/calculators/`): declarative registry (12 calculators) with `compute()` returning metrics + interpretation + thesis text (+ optional chart).
- **Content** (`src/content/`): courses data + decision-tree assistant graph.
- **Backend**: FastAPI template present but unused (app is fully client-side).

## Navigation
Bottom tabs: Accueil / Cours / Calculs / Assistant. Stack: `/calculator/[id]`, `/apropos`.

## Implemented (2026-06)
- Home hub with hero, color-coded section cards, À propos link, copyright footer.
- Cours: accordion cards with SVG illustrations (bell curve + CI, two-distribution comparison, case-control & cohort schematic diagrams).
- Calculs: category chips + calculator cards → detail form (KeyboardAwareScrollView) → ResultCard with Copier / Partager / Exporter PDF + thesis-ready text.
  - Échantillonnage: proportion, cas-témoins, cohorte.
  - Épidémiologie: IC d'une proportion (Wald + Wilson), test diagnostique (Se, Sp, VPP, VPN, exactitude, prévalence, LR+/-, Youden, IC de Wilson).
  - Normalité & variances: critères de normalité (asymétrie/aplatissement + D'Agostino-Pearson), test de Levene / Brown-Forsythe.
  - Comparaisons: 2 proportions (z, IC, RR, OR), qualitatif Chi²/Yates/Fisher, quantitatif indépendant (Student/Welch/Mann-Whitney), quantitatif apparié (t apparié/Wilcoxon), qualitatif apparié (McNemar exact/χ²).
  - Comparaisons k ≥ 3 groupes (comp-multi-groupes): ANOVA à un facteur (F, ddl, p, η²), Kruskal-Wallis (H corrigé ex-æquo), post-hoc Bonferroni (t si ANOVA sig., Dunn si seul KW sig.), graphique moyennes ± ÉT. Validé contre SciPy.
- Cours supplémentaires (2026-06): valeur p (aires bilatérales), puissance (H0/H1, α, β, 1−β), régression (nuage + droite + résidu).
- Assistant: guided decision-tree wizard → recommendation with "Ouvrir le calculateur" (inclut branche « Combien de groupes ? » → ANOVA / Kruskal-Wallis).
- À propos screen with disclaimer + copyright.
- Numeric correctness validated by testing agent (test-diagnostique, ic-proportion, sample-proportion, comp-2-proportions).

## Backlog
- P1: dark mode; save/history of computed results.
- P2: Shapiro-Wilk, calculateur de régression linéaire simple, forest plot, share result as image.

## Next tasks
- Await user feedback / feature requests.
