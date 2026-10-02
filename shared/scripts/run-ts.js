/**
 * Run a TypeScript script from shared/ without tsx: transpiles shared/ (and
 * food-data/, scripts/) to a temp dir and requires the script.
 *   node shared/scripts/run-ts.js shared/scripts/validate-foods.ts [args…]
 */
const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const os = require("os");
const root = path.resolve(__dirname, "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "f7-shared-"));
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { if (f !== "node_modules") walk(p); continue; }
    if (!p.endsWith(".ts")) continue;
    const js = ts.transpileModule(fs.readFileSync(p, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    const dest = path.join(out, path.relative(root, p)).replace(/\.ts$/, ".js");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, js);
  }
}
walk(root);
const script = path.resolve(process.argv[2]);
process.argv.splice(1, 2, script);
require(path.join(out, path.relative(root, script)).replace(/\.ts$/, ".js"));
