import { loadPyodide } from "/pyodide/pyodide.mjs";

let py;

async function init(interruptBuffer) {
  const t = {};
  let s = performance.now();
  // packageBaseUrl doit être absolue, sinon le chargement de numpy échoue.
  const base = new URL("/pyodide/", self.location).href;
  py = await loadPyodide({ indexURL: base, packageBaseUrl: base });
  t.loadPyodide = performance.now() - s;

  s = performance.now();
  await py.loadPackage("numpy");
  t.loadNumpy = performance.now() - s;

  s = performance.now();
  py.runPython("import numpy");
  t.importNumpy = performance.now() - s;

  const harness = await (await fetch("/harness.py")).text();
  py.runPython(harness);
  if (interruptBuffer) py.setInterruptBuffer(interruptBuffer);
  postMessage({ type: "ready", timings: t });
}

function call(name, ...args) {
  const fn = py.globals.get(name);
  try {
    return JSON.parse(fn(...args));
  } finally {
    fn.destroy();
  }
}

onmessage = async ({ data }) => {
  if (data.type === "init") {
    // Une erreur dans un gestionnaire asynchrone n'atteint pas worker.onerror :
    // sans ce message, le fil principal attendrait indéfiniment.
    return init(data.interruptBuffer).catch((e) => postMessage({ type: "boot-error", detail: String(e) }));
  }
  const s = performance.now();
  let result;
  try {
    result = data.type === "grade" ? call("grade", data.code, data.tests) : call("run", data.code);
  } catch (e) {
    const interrupted = String(e).includes("KeyboardInterrupt");
    result = { statut: interrupted ? "interrompu" : "erreur-interne", detail: String(e) };
  }
  result.dureeMs = performance.now() - s;
  // Taille du tas WebAssembly : la mémoire réellement réservée par Python.
  result.tasWasmMo = Math.round(py._module.HEAPU8.length / 1e6);
  postMessage({ type: "result", id: data.id, result });
};
