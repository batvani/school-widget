// Makes ai/INSTRUCTIONS.md and ai/example.json from tools/ai/INSTRUCTIONS.template.md
// and the script itself: the name limits measured with the script's own emWidth / fitSize /
// nameSpots, the official days off from HOLIDAYS, the demo timetable as the example, and
// ai/encode.py and ai/install-script.js inline, and the Shortcut's iCloud link from install/index.html.
// Usage: node tools/instructions.js [--check]   (--check: exit 1 if the files are out of date;
// the tests and the release workflow run it)
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const run = require("./preview/run");
const P = (...a) => path.join(ROOT, ...a);
const MAX_CHARS = 15000; // so it can be pasted into a chat
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fd = s => `${+s.slice(8)} ${MON[+s.slice(5, 7) - 1]} ${s.slice(0, 4)}`;

// the longest word of Cyrillic letters ("Баааа…") that keeps its size / that still fits, per place
function limits(A) {
  const word = n => "Б" + "а".repeat(n - 1), most = (s, size) => { let n = 1; while (A.fitSize(word(n + 1), s.size, s.w, s.bold) >= size) n++; return n; };
  const sp = A.nameSpots(), short = sp.filter(s => s.use === "short"), full = sp.find(s => s.use === "full");
  const keep = Math.min(...short.map(s => most(s, s.size))), fit = Math.min(...short.map(s => most(s, s.min)));
  return [
    `- **Short name** (small, medium, the large widget's top, the Lock Screen): **up to ${keep} letters** keeps full size everywhere; ${fit} is the most that fits. A space or a dot counts about half a letter. Examples: "Математика" (10) is fine, "ПП Инф." fits, "Гражданско образование" needs a short name ("Гражд. обр.").`,
    `- **Displayed name** (the large widget's list): up to ${most(full, full.size)} letters in full; longer names show the short name there. So a long displayed name is fine if its short name fits.`,
    `- **Tiny name**: only if the short name is over ${keep} letters; up to ${Math.max(4, keep - 2)} letters (one medium layout uses it).`
  ].join("\n");
}
function holidays(H) {
  const lines = H.daysOff.map(e => Array.isArray(e) ? e : [e]).map(e => {
    const b = /^\d{4}-\d\d-\d\d$/.test(e[1]) ? e[1] : null, n = e.slice(1).find(x => typeof x === "string" && !/^\d{4}-/.test(x)) || "", g = e.find(x => x && x.grades);
    return `- ${fd(e[0])}${b ? " – " + fd(b) : ""}: ${n}${g ? ` (grades ${g.grades.replace("-", "–")} only)` : ""}`;
  });
  return lines.join("\n") + "\nLast day of school, by grade: " + Object.entries(H.lastDay).map(([k, v]) => `${k.replace("-", "–")}: ${fd(v)}`).join("; ") + ".";
}
// the demo, as an AI should give it: no demo flag, no group pick, no icons
function example(DATA) {
  const d = JSON.parse(JSON.stringify(DATA));
  delete d.meta.demo; delete d.meta.groups; delete d.icons; delete d.holidayIcons;
  d.meta.source = "ai"; d.meta.instructions = "1";
  // one key per line, one day per line
  const body = Object.entries(d).map(([k, v]) => k === "week"
    ? `  "week": {\n${Object.entries(v).map(([n, l]) => `    "${n}": ${JSON.stringify(l)}`).join(",\n")}\n  }`
    : `  "${k}": ${JSON.stringify(v)}`).join(",\n");
  return { d, text: `{\n${body}\n}` };
}
// the Shortcut's iCloud link: install/index.html is its one place
function shortcutLink() {
  const m = fs.readFileSync(P("install/index.html"), "utf8").match(/var SHORTCUT_LINK = "(https:\/\/www\.icloud\.com\/shortcuts\/[0-9a-f]{32})";/);
  if (!m) throw new Error("install/index.html: no SHORTCUT_LINK with a Shortcut's iCloud link");
  return m[1];
}
// The full prompt (ai/prompt.txt, -en): a few lines, then the whole instructions, so it works with an AI
// that can't open links (a school account). The app's "Направи я с AI" and the install page copy it.
const PROMPT = {
  bg: "Здравей! Искам да настроя уиджета „School Widget“ с моята училищна програма (снимката е приложена).\nСледвай инструкциите по-долу, стъпка по стъпка. Първо ми напиши реда с версията им.",
  en: "Hi! I want to set up the “School Widget” widget with my school timetable (the photo is attached).\nFollow the instructions below, step by step. First write me their version line."
};
async function make() {
  let A;
  await run("2026-11-05T10:20", "small", { expose: o => A = o });
  const ex = example(A.DATA);
  let t = fs.readFileSync(P("tools/ai/INSTRUCTIONS.template.md"), "utf8");
  const fill = { LIMITS: limits(A), YEAR: A.hol().schoolYear.replace("-", "/"), HOLIDAYS: holidays(A.hol()), EXAMPLE: ex.text,
    ENCODE_PY: fs.readFileSync(P("ai/encode.py"), "utf8").trim(),
    PAGES: "https://batvani.github.io/school-widget/", README: "https://github.com/batvani/school-widget#readme" };
  t = t.replace(/\{\{(\w+)\}\}/g, (m, k) => { if (!(k in fill)) throw new Error("unknown placeholder " + m); return fill[k]; });
  t = t.replace(/\n{3,}/g, "\n\n");
  if (t.length > MAX_CHARS) throw new Error(`ai/INSTRUCTIONS.md would be ${t.length} characters, over ${MAX_CHARS}`);
  return { "ai/INSTRUCTIONS.md": t, "ai/example.json": JSON.stringify(ex.d, null, 2) + "\n",
    "ai/prompt.txt": PROMPT.bg + "\n\n---\n\n" + t, "ai/prompt-en.txt": PROMPT.en + "\n\n---\n\n" + t };
}
// the files that are out of date (empty: all current)
async function stale() { const f = await make(); return Object.keys(f).filter(n => !fs.existsSync(P(n)) || fs.readFileSync(P(n), "utf8") !== f[n]); }
module.exports = { make, stale, shortcutLink, MAX_CHARS };
if (require.main === module) (async () => {
  if (process.argv.includes("--check")) { const s = await stale(); if (s.length) { console.error("out of date: " + s.join(", ") + " (run node tools/instructions.js)"); process.exit(1); } console.log("ai/ is current"); return; }
  const f = await make();
  for (const [n, body] of Object.entries(f)) fs.writeFileSync(P(n), body);
  console.log(`ai/INSTRUCTIONS.md: ${f["ai/INSTRUCTIONS.md"].length} characters; ai/example.json`);
})().catch(e => { console.error(e.message); process.exit(1); });
