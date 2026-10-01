# Prototype jetable : Python + numpy dans le navigateur (INC-01)

Code jetable. Rien ici ne doit être importé par `apps/`. Sert à mesurer si
Pyodide est viable ; le verdict est dans `DECISIONS.md` (D-006) et les
chiffres dans `PROGRESS.md`.

## Lancer

```bash
npm install
npx playwright install chromium firefox   # seulement pour les mesures
mkdir -p vendor && curl -fL -o vendor/numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl \
  https://cdn.jsdelivr.net/pyodide/v314.0.7/full/numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl

node server.mjs      # essai à la main : http://localhost:8001/?manuel
node measure.mjs     # mesures automatisées, écrit results.json
```

Port 8000 : sans isolation d'origine. Port 8001 : avec les en-têtes COOP/COEP.

## Fichiers

- `web/worker.js` : charge Pyodide et numpy, exécute et corrige.
- `web/harness.py` : exécution du code de l'apprenant, tests, diagnostics.
- `web/main.js` : pilote du worker, délai maximal, interruption.
- `exercice/` : squelette, solution, tests et diagnostics d'une descente de gradient.
- `measure.mjs` : scénarios Playwright sur Chromium et Firefox.
- `results.json` : dernières mesures.
