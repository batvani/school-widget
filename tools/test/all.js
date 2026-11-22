// Runs every tools/test/*.test.js one after another and sums them up (npm test).
// Each test file prints "N passed, M failed" as its last line and exits 1 on a failure.
// Usage: node tools/test/all.js [name …]   (e.g. node tools/test/all.js data update)
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const want = process.argv.slice(2);
const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".test.js")).filter(f => !want.length || want.includes(f.replace(".test.js", ""))).sort();
let passed = 0, failed = 0;
const bad = [];
for (const f of files) {
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/(\d+) passed, (\d+) failed\s*$/);
  if (m) { passed += +m[1]; failed += +m[2]; }
  if (r.status !== 0 || !m) { bad.push(f); if (!m) failed++; process.stdout.write(out.split("\n").filter(l => /FAIL|Error|error/.test(l)).slice(0, 20).join("\n") + "\n"); }
  console.log(`${r.status === 0 ? "ok  " : "FAIL"} ${f}${m ? `: ${m[1]} passed, ${m[2]} failed` : ": no result line"}`);
}
console.log(`\n${passed} passed, ${failed} failed${bad.length ? " (" + bad.join(", ") + ")" : ""}`);
process.exit(bad.length ? 1 : 0);
