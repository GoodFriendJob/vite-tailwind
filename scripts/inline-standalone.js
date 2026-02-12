/**
 * Inlines style.css and app.js into standalone/index.html so the page works
 * when opened via file:// (double-click). Browsers block external CSS/JS on file:// (CORS).
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const standaloneDir = join(root, "standalone");

const htmlPath = join(standaloneDir, "index.html");
const cssPath = join(standaloneDir, "style.css");
const jsPath = join(standaloneDir, "app.js");

let html = readFileSync(htmlPath, "utf8");
const css = readFileSync(cssPath, "utf8");
const js = readFileSync(jsPath, "utf8");

// Replace <link ... href="./style.css"> with inline <style>
html = html.replace(
  /<link[^>]*href="\.\/style\.css"[^>]*>/i,
  `<style>${css}</style>`
);

// Replace <script ... src="./app.js"> with inline script (type=module so ESM bundle runs)
html = html.replace(
  /<script[^>]*src="\.\/app\.js"[^>]*>\s*<\/script>/i,
  `<script type="module">\n${js}\n</script>`
);

writeFileSync(htmlPath, html, "utf8");
console.log("Standalone index.html updated with inlined CSS and JS (file:// safe).");
