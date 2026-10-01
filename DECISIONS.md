# Décisions

Une entrée par décision structurante. Statuts : **Validé** (tranché par Aldo),
**Proposé** (recommandation de Claude en attente de validation),
**Provisoire** (dépend d'un résultat à venir), **Ouvert** (non tranché).

---

## D-001 — PostgreSQL comme base de données

- **Statut :** Validé (imposé par le brief), 2026-10-01
- **Problème :** stocker le graphe de notions, la progression et le planning.
- **Options :** PostgreSQL ; MongoDB (connu d'Aldo) ; base graphe (Neo4j).
- **Choix :** PostgreSQL.
- **Pourquoi :** les données sont relationnelles (apprenant × notion ×
  exercice × tentative), avec des contraintes d'intégrité fortes. Le graphe
  tient en une table d'arêtes ; à 30 ou même 500 notions, il se charge en
  mémoire et se parcourt en TypeScript, sans requête de graphe spécialisée.
- **Ce qu'on perd :** rien de notable à cette échelle. Une base graphe
  n'apporterait de valeur qu'avec des dizaines de milliers de nœuds.

## D-002 — Front en React + Vite, SPA

- **Statut :** Validé par Aldo, 2026-10-01
- **Problème :** choisir le front.
- **Options :** React + Vite (SPA) ; Next.js ; SvelteKit.
- **Choix :** React + Vite, application monopage, TypeScript.
- **Pourquoi :** l'application est derrière une connexion et centrée sur
  Pyodide dans un Web Worker, donc le rendu serveur n'apporte rien. NestJS
  reste l'unique backend. Écosystème le plus riche pour l'éditeur de code
  (CodeMirror), KaTeX et la visualisation de graphe.
- **Ce qu'on perd :** pas de pages de leçons indexables par les moteurs de
  recherche. Si le référencement devient un objectif, il faudra un site
  vitrine séparé ou un pré-rendu.

## D-003 — Le contenu vit dans des fichiers versionnés

- **Statut :** Validé par Aldo, 2026-10-01
- **Problème :** où Aldo rédige-t-il notions, leçons et exercices ?
- **Options :** fichiers dans Git importés en base ; back-office en base.
- **Choix :** fichiers Markdown + YAML + `.py` dans `content/`, validés par un
  schéma, importés en base par une commande.
- **Pourquoi :** rédaction dans l'éditeur, historique et revue par diff, et la
  CI peut vérifier que chaque solution de référence passe ses propres tests.
  Pas de back-office à construire.
- **Ce qu'on perd :** un non-développeur ne peut pas contribuer sans Git.
  Modifier un exercice en production passe par un déploiement.
- **Conséquence à traiter (INC-05) :** les tentatives et l'état de maîtrise
  référencent des exercices qui peuvent changer. Il faut une règle de
  versionnement du contenu (que devient l'historique quand un exercice est
  réécrit ou supprimé ?).

## D-004 — Deux types d'exercice : code et réponse numérique

- **Statut :** Validé par Aldo, 2026-10-01
- **Problème :** comment répondre à un exercice de maths pur sans QCM ?
- **Options :** tout en code ; code + numérique ; code + numérique +
  expression symbolique.
- **Choix :** code Python corrigé par tests, et saisie d'un scalaire ou d'un
  vecteur vérifiée avec tolérance, avec diagnostics d'erreurs fréquentes.
- **Pourquoi :** une révision espacée doit pouvoir durer 30 secondes ; pas de
  parseur d'expressions à écrire.
- **Ce qu'on perd :** impossible de demander « donne la dérivée de f » sous
  forme d'expression. Contournement : demander sa valeur en un point. Le type
  symbolique peut s'ajouter plus tard, le modèle d'exercice doit donc être
  extensible par type.

## D-005 — Public cible : débutant en tout, Python enseigné depuis zéro

- **Statut :** Validé par Aldo, 2026-10-01
- **Problème :** le brief disait « débutant » sans préciser si la
  programmation est un prérequis.
- **Options :** Python de base en prérequis affiché + numpy dans le graphe ;
  Python depuis zéro dans le graphe ; parcours maths sans code.
- **Choix :** Python depuis zéro, comme notions racines du graphe.
- **Pourquoi :** décision produit d'Aldo : la plateforme ne suppose rien.
- **Ce qu'on perd :** le périmètre de contenu du premier jalon grossit
  d'environ 8 à 10 notions (variables, conditions, boucles, fonctions, listes,
  tableaux numpy, opérations vectorisées…), soit 25 à 30 notions au lieu des
  15 à 20 du brief. C'est du travail de rédaction en plus pour Aldo, sur un
  terrain où de bonnes ressources francophones existent déjà.
- **Aucun impact sur le moteur :** ce sont des notions comme les autres. Le
  diagnostic d'entrée (INC-15) permet à ceux qui savent coder de les sauter.

## D-006 — Exécution Python dans le navigateur : Pyodide

- **Statut :** Confirmé par le prototype INC-01, 2026-10-01
- **Problème :** exécuter Python et numpy côté client, sans serveur.
- **Options :** Pyodide (CPython compilé en WebAssembly, numpy inclus) ;
  MicroPython ou RustPython en WASM (légers mais sans numpy) ; exécution
  serveur en conteneur isolé (plan B).
- **Choix :** Pyodide 314.0.7 (Python 3.14, numpy 2.4.6) dans un Web Worker.
- **Pourquoi :** seul candidat WebAssembly qui fournit numpy. Le prototype
  montre que tout ce dont le produit a besoin fonctionne sur Chromium et
  Firefox : exécution non bloquante, capture de la sortie et des erreurs avec
  numéro de ligne, tests écrits en Python, diagnostics nommés, interruption
  d'une boucle infinie, réutilisation de l'exécuteur ensuite.
- **Chiffres (machine de dev 8 cœurs, serveur local) :** 8,2 Mo à télécharger
  (compression brotli), 3,4 à 3,8 s de démarrage, 45 Mo de mémoire au repos,
  correction d'un exercice en 5 à 70 ms.
- **Ce qu'on perd / limites constatées :**
  - Le démarrage de ~3,5 s se paie à **chaque** chargement de page : le cache
    HTTP évite le téléchargement mais pas l'initialisation de Python. Parade :
    démarrer le worker dès l'ouverture de la leçon, pendant la lecture.
  - 8,2 Mo au premier accès : environ 7 s sur une connexion à 10 Mbit/s
    (estimation calculée, non mesurée).
  - Les messages d'erreur Python sont en anglais (« invalid syntax »). Pour
    un débutant francophone il faudra une couche de traduction des erreurs
    les plus fréquentes (prévu en INC-09).
- **Non testé :** machine modeste, Safari, mobile, connexion lente réelle.
  Le plan B (exécution serveur) reste donc documenté mais n'est pas activé.

## D-007 — Répétition espacée : FSRS

- **Statut :** Décidé par Claude sur délégation (D-013), 2026-10-01
- **Problème :** planifier les révisions des notions.
- **Options :** SM-2 (algorithme historique d'Anki) ; FSRS.
- **Choix :** FSRS via la bibliothèque `ts-fsrs`.
- **Pourquoi :** SM-2 ajuste un seul « facteur de facilité » par règles fixes.
  FSRS modélise trois grandeurs par élément (difficulté, stabilité,
  probabilité de rappel) et planifie pour atteindre un taux de rétention
  cible. Pour une même rétention il demande moins de révisions, et il gère
  bien les révisions en retard, cas fréquent chez un apprenant irrégulier.
  `ts-fsrs` existe, donc pas d'algorithme à réimplémenter.
- **Ce qu'on perd / limites à connaître :**
  - Les paramètres par défaut de FSRS ont été ajustés sur des données de
    cartes mémoire, pas sur des exercices de code. Ils seront approximatifs
    tant qu'on n'aura pas nos propres données pour les réajuster.
  - FSRS attend une note à quatre niveaux (oublié, difficile, correct,
    facile). Il faut définir comment la déduire d'une tentative (réussite au
    premier essai, nombre d'essais, usage d'un indice). C'est une règle
    métier à concevoir et tester en INC-13.
  - Plus opaque que SM-2 : plus difficile d'expliquer à l'apprenant pourquoi
    une notion revient tel jour.
- **Unité planifiée :** la notion, avec tirage d'un exercice parmi ceux
  de la notion à chaque révision.

## D-008 — L'état d'apprentissage est exposé par une interface unique

- **Statut :** Décidé par Claude sur délégation (D-013), 2026-10-01
- **Problème :** le futur tuteur aura besoin de la leçon suivie, des
  exercices réussis et ratés, du code soumis, de la maîtrise des notions
  voisines. Sans précaution, ces données seront éparpillées.
- **Choix :** un module `learner-state` qui est le seul point de
  lecture de l'état d'un apprenant (maîtrise par notion, historique des
  tentatives, résumé d'une session). Le front, l'ordonnanceur et plus tard le
  tuteur passent tous par lui.
- **Pourquoi :** le tuteur devient un consommateur de plus, pas une refonte.
- **Ce qu'on perd :** une couche d'indirection dès le début.
- **Conséquence :** toute tentative est conservée intégralement (code soumis,
  résultat de chaque test, diagnostic déclenché), pas seulement réussi/raté.

## D-009 — ORM : Prisma

- **Statut :** Décidé par Claude sur délégation (D-013), 2026-10-01
- **Options :** Prisma ; TypeORM (intégration NestJS historique) ; Drizzle.
- **Choix :** Prisma.
- **Pourquoi :** schéma lisible dans un seul fichier, migrations générées,
  types sûrs. Le graphe étant chargé en mémoire (D-001), on n'a pas besoin de
  requêtes récursives complexes.
- **Ce qu'on perd :** moins de contrôle sur le SQL généré ; le SQL brut reste
  possible ponctuellement.

## D-010 — Monorepo npm workspaces

- **Statut :** Décidé par Claude sur délégation (D-013), 2026-10-01
- **Choix :** un seul dépôt, `apps/api`, `apps/web`,
  `packages/content`, géré par npm workspaces (npm est déjà installé).
- **Pourquoi :** le schéma du format de contenu et les types d'API sont
  partagés entre front, back et validateur.
- **Ce qu'on perd :** npm workspaces est plus lent et moins strict que pnpm.
  Migration possible plus tard sans impact sur le code.

## D-011 — Authentification : email + mot de passe

- **Statut :** Décidé par Claude sur délégation (D-013), 2026-10-01
- **Options :** email + mot de passe ; OAuth GitHub/Google ; lien magique.
- **Choix :** email + mot de passe géré dans NestJS, cookie de session
  httpOnly, hachage argon2. Compte obligatoire pour le premier jalon.
- **Pourquoi :** le public est débutant en tout (D-005), donc sans compte
  GitHub ; aucune dépendance à un fournisseur ni à un service d'envoi
  d'emails pour démarrer.
- **Ce qu'on perd :** pas de réinitialisation de mot de passe tant qu'il n'y
  a pas d'envoi d'emails ; pas d'essai sans inscription.
- **Porte laissée ouverte :** le modèle sépare `Apprenant` (porteur de la
  progression) de `Compte` (moyen de connexion). OAuth et le diagnostic passé
  avant inscription pourront s'ajouter sans migration lourde.

## D-012 — La correction s'exécute dans le navigateur, sans vérification serveur

- **Statut :** Décidé par Claude sur délégation (D-013), 2026-10-01
- **Problème :** le code tourne dans le navigateur, donc les tests et les
  diagnostics y sont envoyés. Un apprenant peut les lire, et le serveur
  reçoit un résultat qu'il ne peut pas vérifier.
- **Options :** (a) faire confiance au client ; (b) retour immédiat côté
  client et re-vérification asynchrone côté serveur ; (c) correction
  entièrement côté serveur.
- **Choix :** (a). La solution de référence n'est jamais envoyée au
  navigateur ; le code soumis est conservé avec chaque tentative.
- **Pourquoi :** sans classement ni certificat, tricher ne lèse que le
  tricheur, et (b) ou (c) imposent un serveur d'exécution isolé que le
  prototype a justement rendu inutile. Conserver le code permet de passer à
  (b) plus tard sans changer le modèle.
- **Ce qu'on perd :** aucune garantie d'intégrité de la progression.
  **À revoir impérativement avant tout certificat, classement ou paiement.**

## D-013 — Délégation des décisions à Claude

- **Statut :** Tranché par Aldo, 2026-10-01
- **Choix :** Claude décide à la place d'Aldo, puis rend compte de ce qui a
  été fait et pourquoi. Aldo se réserve une seule action : les commits.
- **Conséquences :** Claude ne commite jamais ; à la fin de chaque incrément
  il indique quoi commiter et propose le message. Les décisions sont
  consignées ici avec la mention « sur délégation ». La règle « signaler les
  décisions irréversibles avant de les prendre » reste en vigueur : une
  décision irréversible (suppression de données, publication, dépense) est
  annoncée avant, pas après.
- **Ce qu'on perd :** Aldo découvre certaines décisions après coup. Parade :
  chaque entrée dit ce qu'on perd et reste réversible tant que c'est possible.

## D-014 — Arrêt d'un code qui ne rend pas la main : deux niveaux

- **Statut :** Décidé par Claude sur délégation (D-013), 2026-10-01
- **Problème :** un débutant écrira des boucles infinies.
- **Constat du prototype :**
  - Interruption par tampon partagé (`SharedArrayBuffer`) : arrêt immédiat,
    worker conservé, mais exige que le site soit servi avec les en-têtes
    d'isolation d'origine (COOP/COEP), et ne fonctionne pas pendant un calcul
    long à l'intérieur de numpy.
  - Tuer le worker et en recréer un : marche toujours, mais coûte 3 à 3,6 s
    de redémarrage.
- **Choix :** les deux. Tampon partagé d'abord ; si le code ne s'arrête pas
  en 1 s, tuer et recréer le worker.
- **Ce qu'on perd :** les en-têtes COOP/COEP interdisent de charger des
  ressources tierces qui ne les autorisent pas explicitement (polices,
  scripts, images, iframes d'un autre domaine). D'où D-015.

## D-015 — Pyodide et toutes les ressources sont servis depuis notre domaine

- **Statut :** Décidé par Claude sur délégation (D-013), 2026-10-01
- **Options :** charger Pyodide depuis le CDN public ; l'héberger nous-mêmes.
- **Choix :** auto-hébergement de Pyodide, de numpy, des polices et de KaTeX.
- **Pourquoi :** compatible avec l'isolation d'origine (D-014), version
  figée, pas de dépendance à la disponibilité d'un tiers.
- **Ce qu'on perd :** 16 Mo de fichiers statiques à servir et à mettre à jour
  nous-mêmes ; pas de cache partagé avec d'autres sites.
