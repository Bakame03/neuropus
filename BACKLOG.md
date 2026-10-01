# Backlog

Incréments ordonnés jusqu'au premier jalon (régression linéaire → perceptron
multicouche). Chaque incrément est livrable seul et tient en une ou deux
sessions. Statuts : `à faire`, `en cours`, `fait`.

Découpage adopté le 2026-10-01 sur délégation (D-013).

| ID | Objectif | Dépend de | Statut |
|---|---|---|---|
| INC-00 | Cadrage : fichiers de suivi et découpage | — | fait |
| INC-01 | Prototype jetable Python + numpy dans le navigateur | — | fait |
| INC-02 | Socle technique du dépôt | INC-01 | à faire |
| INC-03 | Schéma de données validé et migré | INC-02 | à faire |
| INC-04 | Format de contenu, validateur, deux notions d'exemple | INC-01, INC-03 | à faire |
| INC-05 | Import du contenu en base | INC-04 | à faire |
| INC-06 | Comptes et apprenants | INC-03 | à faire |
| INC-07 | Moteur de graphe : prérequis et déblocage | INC-05 | à faire |
| INC-08 | Exécuteur Python de production | INC-01, INC-02 | à faire |
| INC-09 | Correction des exercices de code avec diagnostics | INC-04, INC-08 | à faire |
| INC-10 | Correction des exercices numériques | INC-04 | à faire |
| INC-11 | Parcours d'une leçon de bout en bout | INC-06, INC-09, INC-10 | à faire |
| INC-12 | État de maîtrise et interface d'état d'apprentissage | INC-07, INC-11 | à faire |
| INC-13 | Ordonnanceur de révisions FSRS | INC-12 | à faire |
| INC-14 | Session de révision | INC-13 | à faire |
| INC-15 | Diagnostic d'entrée adaptatif | INC-12 | à faire |
| INC-16 | Vue de l'arbre de notions | INC-12 | à faire |
| INC-17 | Mise en ligne | INC-14, INC-15, INC-16 | à faire |

Le contenu rédigé par Aldo avance en parallèle dès que INC-04 est livré.

---

## INC-00 — Cadrage

**Objectif :** poser la mémoire externe du projet et faire valider le plan.

- [x] `CLAUDE.md`, `BACKLOG.md`, `PROGRESS.md`, `DECISIONS.md` créés.
- [x] Découpage adopté (délégation D-013).
- [x] D-011 (authentification) tranchée.

## INC-01 — Prototype jetable Python + numpy dans le navigateur

**Objectif :** savoir, chiffres à l'appui, si l'exécution côté navigateur est
viable. Risque numéro un du projet. Code dans `prototypes/`, jeté ensuite.

- [x] Une page charge Pyodide dans un Web Worker et exécute une descente de
      gradient numpy saisie dans une zone de texte.
- [x] Mesuré et consigné dans `PROGRESS.md` : poids téléchargé, temps du
      premier chargement, temps avec cache, temps d'import de numpy, mémoire.
      *(Mesuré sur serveur local : le temps de téléchargement réel est
      estimé, pas mesuré.)*
- [x] La page reste réactive pendant l'exécution (preuve : une animation ou
      un compteur continue de tourner).
- [x] Une boucle infinie est interrompue en moins de 5 secondes sans
      recharger la page, et l'exécuteur est réutilisable ensuite.
- [x] `stdout` et les traces d'erreur Python sont récupérés proprement.
- [x] Une batterie de tests écrite en Python s'exécute contre le code de
      l'apprenant et renvoie un résultat structuré par test.
- [x] Un diagnostic nommé est démontré : un gradient au signe inversé produit
      le message correspondant, pas un simple échec.
- [x] Testé sur Firefox et Chromium ; les contraintes d'en-têtes HTTP
      éventuelles (isolation d'origine) sont identifiées.
- [x] Verdict écrit dans D-006 : viable, viable sous conditions, ou plan B.
- [ ] **Non couvert, reporté à INC-17 :** essai sur machine modeste, Safari,
      mobile et connexion lente réelle.

## INC-02 — Socle technique

**Objectif :** un dépôt où `api` et `web` démarrent, se parlent et sont testés.

- [ ] Monorepo avec `apps/api` (NestJS), `apps/web` (React + Vite),
      `packages/content`.
- [ ] PostgreSQL local accessible, première migration vide appliquée.
- [ ] Une route de santé de l'API répond et vérifie la connexion à la base ;
      le front l'affiche.
- [ ] Lint, formatage et tests se lancent par une commande chacun.
- [ ] CI qui exécute lint et tests à chaque push.
- [ ] Section « Commandes utiles » de `CLAUDE.md` remplie.

## INC-03 — Schéma de données

**Objectif :** un schéma relationnel validé par Aldo, puis migré.

- [ ] Document de schéma écrit et expliqué à Aldo : notion, prérequis, leçon, exercice,
      tentative, état de maîtrise, planning de révision, apprenant, compte.
- [ ] Migration appliquée ; contraintes d'intégrité testées (pas d'arête vers
      une notion inexistante, pas de prérequis d'une notion envers elle-même).
- [ ] La règle de versionnement du contenu (D-003) est décidée et consignée.

## INC-04 — Format de contenu et deux notions d'exemple

**Objectif :** qu'Aldo puisse rédiger le reste du catalogue seul.

- [ ] Format de fichiers défini et documenté : notion (slug, titre,
      prérequis), leçon (Markdown + LaTeX), exercice de code (énoncé,
      squelette, solution, tests, diagnostics), exercice numérique (énoncé,
      réponse attendue, tolérance, diagnostics).
- [ ] Un validateur en ligne de commande rejette avec un message clair : slug
      dupliqué, prérequis inconnu, cycle dans le graphe, champ manquant.
- [ ] Tests unitaires du validateur, dont la détection de cycle.
- [ ] Deux notions complètes rédigées : une notion de maths à exercices
      numériques (produit scalaire) et une notion à exercices de code
      (descente de gradient), chacune avec leçon, exercices et diagnostics.
- [ ] Guide d'auteur : comment ajouter une notion, pas à pas.

## INC-05 — Import du contenu en base

**Objectif :** une commande synchronise `content/` vers PostgreSQL.

- [ ] L'import est idempotent : deux exécutions de suite ne changent rien.
- [ ] Modifier, ajouter ou retirer un fichier se reflète en base selon la
      règle de versionnement décidée à INC-03.
- [ ] Un contenu invalide fait échouer l'import sans modifier la base.
- [ ] Tests d'intégration sur une base de test.

## INC-06 — Comptes et apprenants

**Objectif :** un apprenant s'inscrit, se connecte, se déconnecte.

- [ ] Inscription, connexion, déconnexion par email + mot de passe (D-011).
- [ ] `Apprenant` et `Compte` sont deux entités distinctes.
- [ ] Les routes de progression refusent un visiteur non authentifié.
- [ ] Tests : mot de passe jamais stocké ni renvoyé en clair, session
      invalide rejetée, email dupliqué refusé.

## INC-07 — Moteur de graphe

**Objectif :** savoir, pour un apprenant, quelles notions sont ouvertes.

- [ ] Fonctions pures, sans base ni NestJS : notions débloquées, prérequis
      manquants d'une notion, ordre topologique, ancêtres et descendants.
- [ ] Tests unitaires : graphe vide, chaîne, losange, notion sans prérequis,
      cycle rejeté.
- [ ] Route API : liste des notions avec leur statut pour l'apprenant
      connecté (verrouillée, ouverte, maîtrisée).

## INC-08 — Exécuteur Python de production

**Objectif :** la version propre de ce que INC-01 a prouvé.

- [ ] Composant d'exécution dans `apps/web` : chargement, exécution, délai
      maximal, interruption à deux niveaux (D-014), redémarrage du worker.
- [ ] Le worker démarre dès l'ouverture de la leçon, pas au premier clic.
- [ ] Pyodide et numpy servis depuis notre domaine, en-têtes COOP/COEP (D-015).
- [ ] Éditeur de code avec coloration Python.
- [ ] États visibles par l'apprenant : chargement, prêt, en cours, interrompu,
      erreur.
- [ ] Tests automatisés de l'exécuteur, dont le délai maximal.

## INC-09 — Correction des exercices de code

**Objectif :** un retour qui nomme l'erreur conceptuelle.

- [ ] La batterie de tests d'un exercice s'exécute contre le code soumis et
      produit un résultat par test.
- [ ] Les diagnostics sont évalués dans un ordre défini ; le premier qui
      correspond fournit le message affiché.
- [ ] Sans diagnostic correspondant, le retour indique le test en échec et
      l'écart observé, sans inventer de cause.
- [ ] La CI vérifie que chaque solution de référence passe ses tests et que
      chaque diagnostic se déclenche sur un exemple fautif fourni.
- [ ] La solution de référence n'est jamais envoyée au navigateur.
- [ ] Une fonction attendue mais absente produit un message clair en français,
      pas une erreur Python brute.
- [ ] Les erreurs Python les plus fréquentes chez un débutant sont
      accompagnées d'une explication en français.

## INC-10 — Correction des exercices numériques

**Objectif :** corriger un scalaire ou un vecteur saisi.

- [ ] Fonction pure de correction : tolérance absolue et relative, vecteurs
      de mauvaise dimension, saisie non numérique, virgule française acceptée.
- [ ] Diagnostics par valeur attendue d'une erreur fréquente (par exemple la
      réponse obtenue en oubliant un carré).
- [ ] Tests unitaires de tous ces cas.

## INC-11 — Parcours d'une leçon

**Objectif :** un apprenant suit une notion du début à la fin.

- [ ] Rendu de la leçon : Markdown, formules LaTeX, blocs de code.
- [ ] Enchaînement leçon puis exercices, avec retour après chaque soumission.
- [ ] Chaque tentative est enregistrée intégralement : réponse ou code
      soumis, résultat par test, diagnostic déclenché, date.
- [ ] Une notion verrouillée n'est pas accessible, y compris par URL directe.
- [ ] Test de bout en bout sur les deux notions d'exemple.

## INC-12 — État de maîtrise et interface d'état d'apprentissage

**Objectif :** décider quand une notion est maîtrisée et exposer cet état.

- [ ] Règle de maîtrise définie, consignée dans `DECISIONS.md`, écrite en fonction pure, testée.
- [ ] Maîtriser une notion débloque ses successeurs (vérifié par test).
- [ ] Module `learner-state` : point de lecture unique de la maîtrise, de
      l'historique des tentatives et du résumé d'une session (D-008).
- [ ] Le front et le moteur de graphe ne lisent l'état que par ce module.

## INC-13 — Ordonnanceur FSRS

**Objectif :** calculer quand chaque notion doit revenir.

- [ ] Règle de conversion d'une tentative en note FSRS, pure et testée.
- [ ] Après une tentative, la prochaine échéance est calculée et stockée.
- [ ] Fonction « révisions dues à la date D », testée avec une horloge
      injectée (aucun appel direct à l'heure système dans la logique).
- [ ] Tests : première révision, révision réussie, oubli, révision en retard.

## INC-14 — Session de révision

**Objectif :** l'apprenant fait ses révisions du jour.

- [ ] File des révisions dues, sous forme d'exercices, jamais de cartes.
- [ ] L'exercice proposé varie d'une révision à l'autre quand la notion en a
      plusieurs.
- [ ] Le résultat met à jour le planning et l'état de maîtrise.
- [ ] Indication honnête de la charge : nombre de révisions dues aujourd'hui.

## INC-15 — Diagnostic d'entrée adaptatif

**Objectif :** placer un nouvel apprenant dans le graphe.

- [ ] Algorithme de choix de la prochaine notion à tester, exploitant le
      graphe (réussir une notion valide ses prérequis, échouer invalide ses
      successeurs), en fonction pure testée.
- [ ] Le test s'arrête dès que le placement est déterminé, avec une borne
      maximale sur le nombre d'exercices.
- [ ] Le résultat initialise l'état de maîtrise et le planning de révision.
- [ ] Un débutant complet peut passer le diagnostic et commencer aux racines.

## INC-16 — Vue de l'arbre

**Objectif :** l'apprenant voit le graphe et sa position.

- [ ] Affichage du graphe avec les trois états (verrouillée, ouverte,
      maîtrisée) et les révisions dues.
- [ ] Cliquer une notion verrouillée montre les prérequis manquants.
- [ ] Lisible avec 30 notions sur un écran d'ordinateur portable.

## INC-17 — Mise en ligne

**Objectif :** une instance publique utilisable.

- [ ] Hébergement choisi et consigné dans `DECISIONS.md`.
- [ ] Déploiement reproductible, migrations et import du contenu inclus.
- [ ] HTTPS, sauvegarde de la base, en-têtes requis par l'exécuteur Python.
- [ ] Parcours complet vérifié sur l'instance en ligne.
- [ ] Exécuteur Python essayé sur machine modeste, Safari, mobile et
      connexion lente (reste de INC-01).

---

## Après le premier jalon (non découpé)

Tuteur conversationnel, parcours suivants jusqu'aux transformers, exercices à
expression symbolique, re-vérification des tentatives côté serveur, mobile,
social, paiement.
