# THOTIS — plan de renommage technique

Ce document décrit l'ordre recommandé pour renommer l'application après récupération du projet Expo complet. Il ne déclenche aucune modification technique à lui seul.

## Phase 1 — sécuriser le projet
- Récupérer le code source Expo complet, les fichiers package et le lockfile, la configuration Expo dynamique éventuelle, les fichiers EAS et Codemagic.
- Confirmer le dépôt et la branche qui alimentent les builds de production.
- Créer une branche de rebranding et vérifier qu'un build de référence peut être reproduit.
- Conserver les certificats, profils, secrets et identifiants de signature hors du dépôt.

## Phase 2 — appliquer le nom affiché
- Définir le nom visible officiel : THOTIS.
- Mettre à jour le nom Expo (expo.name), les libellés d'application, les métadonnées d'interface et les titres de partage/export qui désignent l'application.
- Garder un slug technique simple : thotis.
- Rechercher les anciennes occurrences de MediStat, MediStat+, frontend et le slug Emergent, puis distinguer les références visibles des identifiants techniques nécessaires.

## Phase 3 — intégrer l'icône
- Exporter le concept SVG en PNG de haute résolution et dans les formats adaptatifs nécessaires.
- Tester le rendu sur fond clair/sombre et en très petite taille.
- Mettre à jour les chemins icon, android.adaptiveIcon.foregroundImage et web.favicon selon la configuration réelle du projet.
- Vérifier le splash screen, les captures des stores et les éventuelles icônes de notification.
- Ne pas utiliser le SVG directement là où la chaîne de build attend un PNG.

## Phase 4 — identifiants de publication
- Ne pas changer automatiquement ios.bundleIdentifier ni android.package.
- Si l'application publiée doit être mise à jour, conserver les identifiants existants afin de préserver la continuité de distribution et les données associées.
- Si THOTIS devient une application distincte, décider explicitement de nouveaux identifiants et traiter séparément les fiches de store, signatures et migrations.

## Phase 5 — vérification
- Installer les dépendances avec le gestionnaire correspondant au lockfile.
- Lancer lint, TypeScript, tests unitaires et tests des calculateurs.
- Exécuter expo-doctor et vérifier les versions compatibles.
- Produire des builds iOS et Android de test via la chaîne de CI.
- Contrôler l'absence d'appels réseau inattendus et le fonctionnement hors ligne.
- Vérifier le nom, l'icône, les exports PDF/partage et les métadonnées dans les builds.
- Ne publier qu'après validation des résultats statistiques, de l'identité et des fiches de stores.

## Critères d'acceptation
- Le nom THOTIS est cohérent dans l'application, les exports et les métadonnées visibles.
- Les icônes sont lisibles aux tailles réelles et intégrées à la configuration native.
- Aucun identifiant de production n'a été modifié sans décision explicite.
- Les tests passent et les deux plateformes sont compilées avec succès.
- La confidentialité et le mode hors ligne restent conformes au cahier des charges.
