// Serveur statique du prototype. Deux ports :
//   8000 : sans en-têtes d'isolation (cas d'un hébergement quelconque)
//   8001 : avec COOP/COEP, ce qui active SharedArrayBuffer dans le navigateur
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".py": "text/plain; charset=utf-8",
  ".zip": "application/zip",
  ".whl": "application/zip",
};

// /pyodide/* est cherché dans le paquet npm puis dans vendor/ (roue numpy).
function candidates(path) {
  if (path.startsWith("/pyodide/")) {
    const rest = path.slice("/pyodide/".length);
    return [join(root, "node_modules/pyodide", rest), join(root, "vendor", rest)];
  }
  if (path.startsWith("/exercice/")) return [join(root, path)];
  return [join(root, "web", path === "/" ? "index.html" : path)];
}

function serve(port, isolated) {
  createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    for (const file of candidates(path)) {
      if (!file.startsWith(root)) break;
      try {
        const body = await readFile(file);
        const headers = {
          "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
          "Cache-Control": path.startsWith("/pyodide/") ? "public, max-age=3600" : "no-store",
        };
        if (isolated) {
          headers["Cross-Origin-Opener-Policy"] = "same-origin";
          headers["Cross-Origin-Embedder-Policy"] = "require-corp";
        }
        res.writeHead(200, headers).end(body);
        return;
      } catch {}
    }
    res.writeHead(404).end("introuvable");
  }).listen(port, () =>
    console.log(`http://localhost:${port} (${isolated ? "isolé" : "non isolé"})`),
  );
}

serve(8000, false);
serve(8001, true);
