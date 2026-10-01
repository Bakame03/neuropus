// Mesures automatisées du prototype. Lancer : node measure.mjs
// (démarre le serveur lui-même). Résultats dans results.json.
import { chromium, firefox } from "playwright";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { brotliCompressSync, gzipSync } from "node:zlib";
import "./server.mjs";

const read = (f) => readFile(new URL(f, import.meta.url), "utf8");
const tests = await read("./exercice/tests.py");
const solution = await read("./exercice/solution.py");
const squelette = await read("./exercice/squelette.py");
const variante = (ligne) => solution.replace("w = w - lr * gradient", ligne);

const SOUMISSIONS = {
  solution,
  squelette,
  signeInverse: variante("w = w + lr * gradient"),
  moyenneOubliee: solution.replace("(2 / n) * ", "2 * "),
  facteur2Oublie: solution.replace("(2 / n) * ", "(1 / n) * "),
  erreurInconnue: variante("w = w - lr * gradient + 0.01"),
  fonctionAbsente: "x = 1\n",
};

async function poids() {
  const files = [
    "node_modules/pyodide/pyodide.mjs",
    "node_modules/pyodide/pyodide.asm.mjs",
    "node_modules/pyodide/pyodide.asm.wasm",
    "node_modules/pyodide/python_stdlib.zip",
    "node_modules/pyodide/pyodide-lock.json",
    ...(await readdir(new URL("./vendor/", import.meta.url))).map((f) => `vendor/${f}`),
  ];
  const rows = [];
  for (const f of files) {
    const buf = await readFile(new URL(f, import.meta.url));
    rows.push({
      fichier: f.split("/").pop(),
      brutKo: Math.round(buf.length / 1024),
      gzipKo: Math.round(gzipSync(buf).length / 1024),
      brotliKo: Math.round(brotliCompressSync(buf).length / 1024),
    });
  }
  const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
  rows.push({ fichier: "TOTAL", brutKo: sum("brutKo"), gzipKo: sum("gzipKo"), brotliKo: sum("brotliKo") });
  return rows;
}

async function scenario(browserType, port) {
  const browser = await browserType.launch();
  const page = await (await browser.newContext()).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const url = `http://localhost:${port}/`;
  const r = { navigateur: browserType.name(), port };
  const boot = () => page.evaluate(() => window.proto.runner.boot());
  const exec = (message, opts) =>
    page.evaluate(([m, o]) => window.proto.runner.exec(m, o), [message, opts ?? {}]);

  await page.goto(url);
  r.isolationOrigine = await page.evaluate(() => self.crossOriginIsolated);
  r.demarrageFroid = await boot();
  await page.reload();
  r.demarrageAvecCache = await boot();

  r.correction = {};
  for (const [nom, code] of Object.entries(SOUMISSIONS)) {
    const res = await exec({ type: "grade", code, tests });
    r.correction[nom] = {
      statut: res.statut,
      diagnostic: res.diagnostic?.id ?? null,
      echecs: res.tests?.filter((t) => !t.reussi).map((t) => `${t.nom} : ${t.message}`),
      dureeMs: Math.round(res.dureeMs),
    };
  }

  r.stdout = await exec({ type: "run", code: "print('bonjour')\nprint(1 + 1)" });
  r.erreurSyntaxe = await exec({ type: "run", code: "x = 1\ndef f(:\n  pass" });
  r.erreurExecution = await exec({ type: "run", code: "a = 1\nb = 0\nprint(a / b)" });

  // Réactivité : ~3 s de calcul Python pendant qu'on compte les images affichées.
  r.reactivite = await page.evaluate(async () => {
    const stop = window.proto.watchFrames();
    const res = await window.proto.runner.exec(
      { type: "run", code: "import time\nt = time.time()\nn = 0\nwhile time.time() - t < 3:\n    n += 1" },
      { timeoutMs: 10000 },
    );
    return { ...stop(), dureePythonMs: Math.round(res.dureeMs) };
  });

  const boucle = { type: "run", code: "while True:\n    pass" };
  r.boucleInfinie = await exec(boucle, { timeoutMs: 2000 });
  r.reutilisableApres = (await exec({ type: "run", code: "print('encore là')" })).stdout;
  r.boucleInfinieTerminate = await exec(boucle, { timeoutMs: 2000, mode: "terminate" });
  r.reutilisableApresTerminate = (await exec({ type: "run", code: "print('encore là')" })).stdout;

  // Boucle dans du code C de numpy : ne consulte pas le tampon d'interruption.
  r.calculNumpyLong = await exec(
    { type: "run", code: "import numpy as np\na = np.ones((1500, 1500))\nfor _ in range(1):\n    np.linalg.matrix_power(a, 2 ** 40)" },
    { timeoutMs: 2000 },
  );

  r.tasWasmMoApresCorrections = r.stdout.tasWasmMo;
  // Alloue ~400 Mo de tableaux pour voir comment le tas grossit et si ça plante.
  r.grosseAllocation = await exec(
    { type: "run", code: "import numpy as np\na = np.ones((50_000_000,))\nprint(a.nbytes // 10**6, 'Mo')" },
    { timeoutMs: 10000 },
  );

  r.erreursPage = errors;
  await browser.close();
  return r;
}

const results = { date: new Date().toISOString(), poids: await poids(), scenarios: [] };
for (const type of [chromium, firefox]) {
  for (const port of [8000, 8001]) {
    try {
      results.scenarios.push(await scenario(type, port));
    } catch (e) {
      results.scenarios.push({ navigateur: type.name(), port, plantage: String(e) });
    }
  }
}
await writeFile(new URL("./results.json", import.meta.url), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
process.exit(0);
