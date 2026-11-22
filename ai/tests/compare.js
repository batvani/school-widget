// Scores the AIs' answers (results/<ai>-<n>.txt or .json: the whole last message, or only the
// timetable) against expected/<n>.json, reading each one with the script's own parseImport and
// validateData, the way School Widget would. Names are compared ignoring case, dots and spaces;
// short names are only checked for fitting (validateData's width warnings).
// node ai/tests/compare.js   → a table here and results/REPORT.md
const fs = require("fs"), path = require("path");
const run = require("../../tools/preview/run");
const { S, T, TEACHERS, DAYS } = require("./timetables");
// a usual abbreviation (БЕЛ, ФВС …) is the right subject, only a name choice: noted, not wrong
const ABBR = Object.fromEntries(Object.entries(S).map(([k, v]) => [k.toLowerCase(), v.toLowerCase()]));
const sameName = (exp, got) => norm(exp) === norm(got) || ABBR[norm(got)] === norm(exp);
const D = (...a) => path.join(__dirname, ...a);
const norm = s => String(s == null ? "" : s).toLowerCase().replace(/^ст(ая|\.)\s*/, "").replace(/[\s.,]+/g, " ").trim();

function score(A, n, text) {
  const exp = JSON.parse(fs.readFileSync(D("expected", n + ".json"), "utf8"));
  const out = { cells: 0, right: 0, bells: false, wrong: [], notes: [], abbr: new Set() };
  const p = A.parseImport(text);
  if (p.error || !p.data) { out.notes.push("not readable: " + (p.error || "no timetable")); return out; }
  const d = A.migrate(p.data), v = A.validateData(d);
  if (v.errors.length) out.notes.push("errors: " + v.errors.map(e => e.where ? `${e.code} ${e.where}` : e.code).join(", "));
  const wide = v.warnings.filter(w => w.code === "too_wide").length;
  if (wide) out.notes.push(`${wide} names too wide`);
  out.bells = JSON.stringify(d.bells) === JSON.stringify(exp.bells);
  if (!out.bells) out.notes.push("bells differ");
  if (norm(d.meta && d.meta.class) !== norm(exp.meta.class)) out.notes.push(`class ${d.meta && d.meta.class}`);
  if ((d.meta && d.meta.grade) !== exp.meta.grade) out.notes.push(`grade ${d.meta && d.meta.grade}`);
  const leak = TEACHERS.filter(t => text.includes(t.replace(/^.\. /, "")));
  if (leak.length) out.notes.push("TEACHER NAMES: " + leak.join(", "));
  for (const k of new Set([...Object.keys(exp.week), ...Object.keys(d.week || {})])) {
    const e = exp.week[k] || [], g = (d.week || {})[k] || [];
    for (let i = 0; i < Math.max(e.length, g.length); i++) {
      const a = e[i] || { name: "" }, b = g[i] || { name: "" }, where = DAYS[k - 1] + (i + 1);
      if (!a.name && !b.name) continue;
      out.cells++;
      const same = a.groups
        ? b.groups && b.groups.length === a.groups.length && a.groups.every(x => b.groups.some(y => sameName(x.name, y.name) && norm(y.room) === norm(x.room)))
        : !b.groups && sameName(a.name, b.name) && norm(a.room) === norm(b.room);
      for (const [x, y] of a.groups ? [] : [[a.name, b.name]]) if (same && norm(x) !== norm(y)) out.abbr.add(y);
      if (same) out.right++;
      else out.wrong.push(`${where}: ${a.name || "—"} ${a.room || ""} ≠ ${b.name || "—"} ${b.room || ""}`.replace(/\s+/g, " "));
    }
  }
  if (out.abbr.size) out.notes.push("kept abbreviations: " + [...out.abbr].join(", "));
  return out;
}

module.exports = { score };
if (require.main === module) (async () => {
  let A;
  await run("2026-11-05T10:20", "small", { expose: o => A = o });
  const dir = D("results"), files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^[\w.]+-\d\.(txt|json)$/.test(f)).sort() : [];
  if (!files.length) { console.log("No results yet: save each AI's last message as ai/tests/results/<ai>-<n>.txt (see answers.md)."); return; }
  const rows = [], detail = [];
  for (const f of files) {
    const [, ai, n] = f.match(/^(.+)-(\d)\./), r = score(A, n, fs.readFileSync(path.join(dir, f), "utf8"));
    rows.push(`| ${ai} | ${n} | ${r.right}/${r.cells} | ${r.bells ? "✓" : "✗"} | ${r.notes.join("; ") || "—"} |`);
    if (r.wrong.length) detail.push(`### ${ai}, test ${n}\n` + r.wrong.map(w => "- " + w).join("\n"));
  }
  const md = `# AI test results\n\n| AI | test | cells right | bells | notes |\n|---|---|---|---|---|\n${rows.join("\n")}\n\n${detail.join("\n\n")}\n`;
  fs.writeFileSync(path.join(dir, "REPORT.md"), md);
  console.log(md);
})().catch(e => { console.error(e); process.exit(1); });
