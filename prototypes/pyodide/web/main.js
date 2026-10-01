// Pilote du worker Python. Deux façons d'arrêter un code qui ne rend pas la main :
//  - "buffer"    : SharedArrayBuffer + KeyboardInterrupt (exige l'isolation d'origine)
//  - "terminate" : tuer le worker et en recréer un (marche partout, coûte un rechargement)
class Runner {
  constructor() {
    this.canInterrupt = self.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined";
    this.nextId = 1;
  }

  boot() {
    const s = performance.now();
    this.worker = new Worker("/worker.js", { type: "module" });
    this.interruptBuffer = this.canInterrupt ? new Uint8Array(new SharedArrayBuffer(1)) : null;
    return new Promise((resolve, reject) => {
      this.worker.onerror = (e) => reject(new Error(e.message));
      this.worker.onmessage = ({ data }) => {
        if (data.type === "ready") {
          resolve({ ...data.timings, total: performance.now() - s });
        } else if (data.type === "boot-error") {
          reject(new Error(data.detail));
        } else if (data.type === "result") {
          this.pending?.(data);
        }
      };
      this.worker.postMessage({ type: "init", interruptBuffer: this.interruptBuffer });
    });
  }

  // mode : "buffer" ou "terminate". Renvoie le résultat et la façon dont ça s'est fini.
  async exec(message, { timeoutMs = 5000, mode = this.canInterrupt ? "buffer" : "terminate" } = {}) {
    const id = this.nextId++;
    const s = performance.now();
    if (this.interruptBuffer) this.interruptBuffer[0] = 0;
    const answer = new Promise((resolve) => {
      this.pending = (data) => data.id === id && resolve(data.result);
    });
    this.worker.postMessage({ ...message, id });

    const timeout = (ms) => new Promise((r) => setTimeout(() => r(null), ms));
    let result = await Promise.race([answer, timeout(timeoutMs)]);
    let arret = "normal";

    if (!result && mode === "buffer" && this.interruptBuffer) {
      this.interruptBuffer[0] = 2; // SIGINT : lève KeyboardInterrupt côté Python
      result = await Promise.race([answer, timeout(1000)]);
      arret = "buffer";
    }
    if (!result) {
      // Dernier recours : le code ne rend pas la main même à une interruption.
      this.worker.terminate();
      const reboot = await this.boot();
      result = { statut: "interrompu", redemarrageMs: reboot.total };
      arret = "terminate";
    }
    return { ...result, arret, totalMs: performance.now() - s };
  }
}

// Mesure la réactivité du fil principal : plus grand écart entre deux images.
function watchFrames() {
  let last = performance.now();
  let maxGap = 0;
  let frames = 0;
  let on = true;
  const tick = (now) => {
    maxGap = Math.max(maxGap, now - last);
    last = now;
    frames++;
    if (on) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return () => {
    on = false;
    return { frames, maxGapMs: maxGap };
  };
}

const runner = new Runner();
window.proto = { runner, watchFrames };

// Interface manuelle minimale.
const $ = (id) => document.getElementById(id);
const out = $("out");
let counter = 0;
setInterval(() => ($("counter").textContent = ++counter), 100);

(async () => {
  if (new URLSearchParams(location.search).has("manuel")) {
    $("code").value = await (await fetch("/exercice/squelette.py")).text();
    const tests = await (await fetch("/exercice/tests.py")).text();
    out.textContent = "Chargement de Python…";
    const t = await runner.boot();
    out.textContent = `Prêt en ${Math.round(t.total)} ms. Isolation d'origine : ${self.crossOriginIsolated}`;
    $("run").onclick = async () => {
      out.textContent = "Exécution…";
      out.textContent = JSON.stringify(await runner.exec({ type: "run", code: $("code").value }), null, 2);
    };
    $("grade").onclick = async () => {
      out.textContent = "Correction…";
      out.textContent = JSON.stringify(
        await runner.exec({ type: "grade", code: $("code").value, tests }),
        null,
        2,
      );
    };
  }
})();
