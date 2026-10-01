# Journal

Une entrée datée par incrément, la plus récente en haut.

---

## 2026-10-01 — INC-01 Prototype Python + numpy dans le navigateur (fait)

**Verdict : Pyodide est viable. Le plan B (exécution serveur) n'est pas
nécessaire.** Détail dans D-006, D-014, D-015.

**Fait**

- Prototype dans `prototypes/pyodide/` : Pyodide 314.0.7 (Python 3.14,
  numpy 2.4.6) dans un Web Worker, harnais de correction en Python, un
  exercice de descente de gradient avec tests et quatre diagnostics.
- Script de mesure automatisé (`measure.mjs`) sur Chromium et Firefox, avec
  et sans isolation d'origine. Résultats bruts dans `results.json`.

**Testé (mesures réelles, machine de dev 8 cœurs, serveur local)**

| Mesure | Chromium | Firefox |
|---|---|---|
| Démarrage complet (Python + numpy prêts) | 3,4 à 3,8 s | 3,7 à 3,8 s |
| … dont chargement de Python | 2,4 s | 2,4 s |
| … dont chargement + import de numpy | 1,0 s | 1,1 s |
| Démarrage avec cache HTTP | 3,4 à 3,5 s | 3,6 à 3,7 s |
| Correction d'une soumission | 5 à 70 ms | 2 à 36 ms |
| Plus long gel de l'affichage pendant 3 s de calcul | 17 ms (1 image) | 17 ms |
| Arrêt d'une boucle infinie par tampon partagé | immédiat | immédiat |
| Arrêt en tuant le worker (redémarrage) | 3,0 à 3,5 s | 3,5 à 3,6 s |
| Mémoire Python au repos | 45 Mo | 45 Mo |
| Allocation d'un tableau de 400 Mo | réussie | réussie |

- Poids à télécharger : 16,1 Mo bruts, 8,2 Mo compressés en brotli.
- Diagnostics : les quatre erreurs fautives (w jamais mis à jour, signe
  inversé, moyenne oubliée, facteur 2 oublié) déclenchent chacune le bon
  message ; une erreur inconnue donne l'écart observé sans inventer de cause ;
  la solution de référence passe.
- Erreurs de syntaxe et d'exécution récupérées avec le numéro de ligne dans
  le code de l'apprenant ; `stdout` capturé.
- L'exécuteur reste utilisable après chaque interruption.

**En suspens**

- Non testé : machine modeste, Safari, mobile, connexion lente réelle.
  Reporté dans INC-17. Le temps de téléchargement (≈ 7 s à 10 Mbit/s) est une
  estimation calculée à partir du poids, pas une mesure.
- Aucun test unitaire : c'est un prototype jetable, validé par le script de
  mesure. Les tests arrivent avec la version de production (INC-08, INC-09).

**Pièges rencontrés**

- Le cache ne raccourcit pas le démarrage : les ~3,5 s sont l'initialisation
  de Python, pas le téléchargement. Il faut démarrer le worker en arrière-plan
  dès l'ouverture de la leçon.
- `packageBaseUrl` doit être une URL absolue, sinon `loadPackage("numpy")`
  échoue avec « Invalid base URL ».
- Une erreur dans un gestionnaire `onmessage` asynchrone du worker n'atteint
  pas `worker.onerror` : sans message d'erreur explicite, le fil principal
  attend indéfiniment (c'est ce qui a bloqué la première mesure 10 minutes).
- L'interruption par tampon partagé n'arrête pas un calcul long à
  l'intérieur de numpy : il faut le second niveau (tuer le worker).
- Les messages d'erreur Python sont en anglais ; une fonction attendue mais
  absente donne un `AttributeError` illisible pour un débutant. Deux critères
  ajoutés à INC-09.
- `performance.measureUserAgentSpecificMemory` est indisponible en mode sans
  affichage ; la mémoire est mesurée par la taille du tas WebAssembly.
- Le paquet npm `pyodide` ne contient pas numpy : la roue se télécharge à
  part (commande dans le README du prototype, dossier `vendor/` ignoré par Git).

---

## 2026-10-01 — INC-00 Cadrage (fait)

**Fait**

- Brief lu, questions d'architecture posées.
- Création de `CLAUDE.md`, `BACKLOG.md`, `PROGRESS.md`, `DECISIONS.md`.
- Découpage en 17 incréments proposé dans `BACKLOG.md`.
- Décisions tranchées par Aldo : front React + Vite (D-002), contenu en
  fichiers dans Git (D-003), exercices code + numérique (D-004), public
  débutant en tout avec Python depuis zéro (D-005).

**Testé**

- Rien : aucun code applicatif n'existe.

**En suspens**

- Rien. Aldo a délégué les décisions à Claude (D-013) : découpage adopté,
  D-007 à D-012 tranchées. Aldo fait les commits lui-même.

**Pièges et constats**

- D-005 fait passer le premier jalon de 15-20 à 25-30 notions : plus de
  contenu à rédiger, aucun impact sur le moteur.
- Machine de développement : Node 22.22 et npm 9.2 présents ; Docker,
  PostgreSQL et pnpm absents. À régler avant INC-02, sans effet sur INC-01.
