// Copies the pdfjs-dist worker into /public so Next.js serves it as a
// plain static file instead of trying to bundle/minify it as part of the
// JS graph (which breaks, since the worker is an ES module on its own).
const fs = require("fs");
const path = require("path");

const src = path.join(
  __dirname,
  "..",
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);
const destDir = path.join(__dirname, "..", "public");
const dest = path.join(destDir, "pdf.worker.min.mjs");

if (!fs.existsSync(src)) {
  console.warn("pdfjs-dist worker not found at", src, "- skipping copy.");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("Copied pdf.worker.min.mjs to /public");
