# neuropus — source de vérité

Plateforme web d'apprentissage du Machine Learning en français, des maths de
base aux transformers, par la pratique.

## Règles de session (permanentes)

1. Au début de CHAQUE session : relire `CLAUDE.md`, `BACKLOG.md`,
   `PROGRESS.md`, `DECISIONS.md`, puis dire en une phrase où on en est.
2. Si une demande contredit ces fichiers, le signaler avant d'agir.
3. Un incrément à la fois, avec ses tests, un commit par incrément. **Claude
   ne commite jamais** : il indique quoi commiter et propose le message, Aldo
   commite (D-013).
4. Jamais de données factices qui simulent une fonctionnalité absente. Si ce
   n'est pas implémenté, le dire.
5. Claude décide à la place d'Aldo et rend compte après coup : ce qui a été
   fait et pourquoi (D-013). Exception : une décision irréversible est
   signalée avant d'être prise.
6. Signaler directement tout risque technique ou produit, même s'il contredit
   le brief.
7. Mettre à jour `BACKLOG.md`, `PROGRESS.md` et `DECISIONS.md` à la fin de
   chaque incrément, sans attendre qu'on le demande.

## Rôle des fichiers de suivi

| Fichier | Contenu | Fréquence de changement |
|---|---|---|
| `CLAUDE.md` | Vision, stack, conventions, commandes | Rarement |
| `BACKLOG.md` | Incréments ordonnés, critères d'acceptation, statut | À chaque incrément |
| `PROGRESS.md` | Journal daté : fait, testé, en suspens, pièges | À chaque incrément |
| `DECISIONS.md` | Choix structurants et leurs raisons | À chaque décision |

## L'auteur

Aldo Alex Nganji. Développeur backend (NestJS, TypeScript, Python, MongoDB,
SQL, Git, Linux), étudiant en BUT Informatique. Expliquer les décisions
d'architecture, pas la syntaxe. Pas de boîte noire.

## Vision

Une plateforme web qui amène un débutant des maths de base jusqu'aux
transformers, par la pratique. Le modèle mental est Duolingo pour la rigueur
de la progression et la régularité, pas pour le ton infantilisant.

Pourquoi l'existant échoue :

- Brilliant gamifie bien mais s'arrête à l'intuition, on ne sait pas entraîner
  un modèle après.
- Kaggle Learn et Hugging Face sont solides mais secs, sans progression ni
  rétention, taux d'abandon énorme.
- DataCamp et Coursera sont scolaires et exigent une autonomie que les
  débutants n'ont pas.

Le mur réel est mathématique, pas algorithmique. Les gens décrochent sur
l'algèbre linéaire et les dérivées, pas sur la syntaxe Python.

Langue : français d'abord, interface et contenu. C'est l'angle différenciant.

**Public cible (tranché le 2026-10-01, voir D-005) : débutant en tout**, y
compris en programmation. Python est enseigné depuis zéro dans le graphe.

## Les quatre piliers

1. **Arbre de dépendances, pas des cours isolés.** Chaque notion déclare ses
   prérequis. Une leçon ne s'ouvre que si ses prérequis sont maîtrisés. Le
   graphe est la structure centrale du produit, pas une table des matières.
2. **Exécution de code dans le navigateur, corrigée automatiquement.** Pas de
   QCM. L'apprenant implémente une descente de gradient, le code tourne, et le
   retour lui dit où est l'erreur conceptuelle, pas seulement que c'est faux.
3. **Répétition espacée sur les maths et le code.** Les notions reviennent
   avant l'oubli, sous forme d'exercices, pas de cartes à retourner.
4. **Diagnostic d'entrée.** Un test adaptatif place l'apprenant dans le graphe
   au lieu de le faire recommencer à zéro.

## Le tuteur conversationnel (plus tard, à anticiper)

Après chaque session, l'apprenant pourra discuter de ce qu'il vient de faire.
Pas de RAG au début : le contexte du tuteur est construit à partir de la
session (leçon suivie, exercices réussis et ratés, code soumis, état de
maîtrise des notions voisines). Le RAG viendra quand le catalogue sera gros.
Format : texte, rendu LaTeX et blocs de code. Voix hors périmètre.

Règles du tuteur : il ne donne jamais la solution d'un exercice non résolu, il
questionne pour faire reformuler, il corrige explicitement une compréhension
fausse au lieu de valider par politesse.

**Conséquence dès maintenant :** l'architecture expose l'état d'apprentissage
derrière une interface propre (voir D-008), pour ne pas tout refactorer.

## Périmètre du premier jalon

Un seul parcours : de la régression linéaire au perceptron multicouche, avec
ses prérequis mathématiques (vecteurs, produit scalaire, dérivée partielle,
gradient) et, depuis D-005, ses prérequis Python et numpy.

Le brief initial visait 15 à 20 notions. Avec Python depuis zéro, la cible
réaliste est 25 à 30 notions (voir D-005).

Hors périmètre : transformers, social, paiement, mobile, tuteur
conversationnel. Rien n'est écrit pour ces sujets, mais aucune porte n'est
fermée dans l'architecture.

## Répartition du travail

Aldo rédige la pédagogie et le contenu. Claude construit le moteur, le format
de contenu, et deux notions complètes en exemple.

## Correction automatique

Chaque exercice de code a : un énoncé, un squelette, une solution de
référence, une batterie de tests, et des diagnostics d'erreurs fréquentes. Le
retour nomme l'erreur quand c'est possible (« ton gradient a le signe
inversé »), pas seulement « test échoué ».

Deux types d'exercice (D-004) : code Python, et réponse numérique (scalaire ou
vecteur) vérifiée avec tolérance, elle aussi avec diagnostics.

## Modèle de données attendu

Notion, prérequis, leçon, exercice, tentative, état de maîtrise par apprenant,
planning de révision. Le schéma est écrit et expliqué à l'incrément INC-03.

## Stack

| Couche | Choix | Statut | Décision |
|---|---|---|---|
| Backend | NestJS + TypeScript | Imposé | — |
| Base | PostgreSQL | Imposé | D-001 |
| Front | React + Vite, SPA, TypeScript | Validé | D-002 |
| Contenu | Fichiers Markdown/YAML/.py dans Git, importés en base | Validé | D-003 |
| Python navigateur | Pyodide dans un Web Worker, auto-hébergé | Confirmé par INC-01 | D-006, D-014, D-015 |
| Répétition espacée | FSRS (bibliothèque `ts-fsrs`) | Décidé | D-007 |
| ORM | Prisma | Décidé | D-009 |
| Dépôt | Monorepo npm workspaces | Décidé | D-010 |
| Authentification | Email + mot de passe, cookie de session | Décidé | D-011 |
| Correction | Dans le navigateur, sans vérification serveur | Décidé, à revoir avant tout certificat | D-012 |

Structure cible du dépôt (créée à INC-02, pas avant) :

```
apps/api/          NestJS
apps/web/          React + Vite
packages/content/  schéma et validateur du format de contenu (partagé)
content/           notions, leçons, exercices rédigés par Aldo
prototypes/        code jetable (INC-01), jamais importé par apps/
```

## Conventions de code

- TypeScript strict partout, pas de `any` non justifié.
- La logique métier (graphe, ordonnanceur, correction, maîtrise) vit dans des
  fonctions et classes pures, sans dépendance à NestJS ni à la base, testées
  unitairement. Les modules NestJS ne font que brancher.
- Identifiants de code en anglais ; textes d'interface, contenu et
  documentation en français.
- Une notion est désignée par un slug stable (`produit-scalaire`), jamais par
  un identifiant numérique dans le contenu.
- Messages de commit en français, préfixés par l'identifiant d'incrément :
  `INC-04 : format de contenu et validateur`.

## Commandes utiles

Pas encore de code applicatif : cette section sera remplie à INC-02 (lancer,
tester, migrer, importer le contenu).

Prototype jetable (voir `prototypes/pyodide/README.md`) :

```bash
cd prototypes/pyodide
node server.mjs     # http://localhost:8001/?manuel
node measure.mjs    # mesures Chromium + Firefox, écrit results.json
```

Environnement constaté le 2026-10-01 : Node 22.22 et npm 9.2 installés ; ni
Docker, ni PostgreSQL, ni pnpm. PostgreSQL (ou Docker) est à installer avant
INC-02.
