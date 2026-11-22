// Tests for the AI side: ai/INSTRUCTIONS.md is current and short enough, the
// example passes the script's own checks, encode.py makes links the script reads back,
// and the tiny install script (under the mock) saves the timetable, downloads School Widget and
// opens it, after which School Widget opens the import.
// node tools/test/ai.test.js
const fs = require("fs"), path = require("path"), assert = require("assert"), { execFileSync } = require("child_process");
const run = require("../preview/run");
const instructions = require("../instructions");
const ROOT = path.join(__dirname, "..", "..");
const P = (...a) => path.join(ROOT, ...a);
const SRC = fs.readFileSync(P("school-widget.js"), "utf8");
const EX = JSON.parse(fs.readFileSync(P("ai/example.json"), "utf8"));
const FIX = JSON.parse(fs.readFileSync(P("tools/preview/fixtures/sample-2027.json"), "utf8"));
const INSTALLER = fs.readFileSync(P("ai/install-script.js"), "utf8");
const RAWJS = "https://batvani.github.io/school-widget/school-widget.js";
const T = "2026-11-05T10:20", ME = "/icloud/Инсталатор.js", SW = "/icloud/School Widget.js", IMPF = "/icloud/uchilishte-import.txt";
const filled = d => INSTALLER.replace("const TIMETABLE = null;", "const TIMETABLE = " + JSON.stringify(d) + ";");

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 5).join("\n       ")); }
}

(async () => {
  let A;
  await run(T, "small", { expose: o => A = o });
  console.log("instructions");
  await test("ai/INSTRUCTIONS.md and ai/example.json are current (node tools/instructions.js)", async () => {
    assert.deepStrictEqual(await instructions.stale(), []);
  });
  await test("short enough to paste, version line first, no placeholder or missing part left", async () => {
    const t = fs.readFileSync(P("ai/INSTRUCTIONS.md"), "utf8");
    assert(t.length < instructions.MAX_CHARS, t.length);
    assert(/^Uchilishte instructions v1 \(\d+ \w+ \d{4}\)\n/.test(t));
    assert(!/\{\{|<!--/.test(t));
    assert(t.includes("const TIMETABLE = null;") && t.includes("Постави от AI"));
    assert(!fs.existsSync(P("install/index.html")) ? !t.includes("install/#z=") : true, "no link to an install page that isn't there");
  });
  await test("the start prompt links the instructions on GitHub Pages, in BG and EN", async () => {
    const s = fs.readFileSync(P("ai/START.md"), "utf8");
    assert.strictEqual((s.match(/https:\/\/batvani\.github\.io\/school-widget\/ai\/INSTRUCTIONS\.md/g) || []).length, 2);
    assert(s.includes("Uchilishte instructions"));
  });
  await test("the example passes validateData with no errors or warnings, and keeps both groups", async () => {
    const v = A.validateData(A.migrate(EX));
    assert.deepStrictEqual(v.errors, []);
    assert.deepStrictEqual([...new Set(v.warnings.map(w => w.code))], ["no_pick"]); // the person picks their group in School Widget
    assert(!EX.meta.demo && !EX.meta.groups && EX.meta.source === "ai");
  });
  await test("schema.json: valid JSON; the example has only its keys", async () => {
    const s = JSON.parse(fs.readFileSync(P("ai/schema.json"), "utf8"));
    for (const k of Object.keys(EX)) assert(k in s.properties, k);
    for (const k of Object.keys(EX.meta)) assert(k in s.properties.meta.properties, "meta." + k);
  });

  console.log("encode");
  await test("encode.py makes #z= links that the script reads back to the same timetable", async () => {
    const tmp = path.join(process.env.CLAUDE_JOB_DIR || require("os").tmpdir(), "tt.json");
    fs.writeFileSync(tmp, JSON.stringify(FIX));
    const py = execFileSync("python3", ["-I", P("ai/encode.py"), tmp], { encoding: "utf8" }).trim();
    // zlib builds may compress differently: compare what the script reads, not the bytes
    assert(py.startsWith("https://batvani.github.io/school-widget/install/#z="));
    assert.deepStrictEqual(A.parseImport(py).data, FIX);
    assert(py.length < 2500, `link ${py.length} characters`);
  });

  console.log("install script");
  await test("not there yet: saves the import file, downloads School Widget, opens it; School Widget opens the import", async () => {
    const r = await run(T, "small", { src: filled(EX), filename: ME, app: true, alerts: [0, 0], net: u => u === RAWJS ? SRC : null });
    assert.strictEqual(r.files[SW], SRC);
    assert.strictEqual(r.files[IMPF], "uchilishte:j:" + JSON.stringify(EX));
    assert.deepStrictEqual(r.opened, ["scriptable:///run/School%20Widget"]);
    assert.deepStrictEqual(r.alerts.map(a => a.title), ["Инсталиране на School Widget", "Готово"]);
    // then School Widget runs (opened by the link) and opens "Провери програмата" with it
    const files = Object.fromEntries(Object.entries(r.files).filter(([k]) => k.startsWith("/icloud/")));
    const s = await run(T, "medium", { app: true, data: null, files });
    assert(s.html && s.html.includes('class="ed"') && s.html.includes(JSON.stringify(EX.meta.class)));
  });
  await test("School Widget already there: never overwritten, nothing downloaded", async () => {
    let asked = 0;
    const r = await run(T, "small", { src: filled(EX), filename: ME, app: true, alerts: [0, 0], files: { [SW]: "// mine" }, net: () => { asked++; return SRC; } });
    assert.strictEqual(r.files[SW], "// mine");
    assert.strictEqual(asked, 0);
    assert(IMPF in r.files);
  });
  await test("offline, a download that isn't School Widget, no timetable, Отказ: says so, opens nothing", async () => {
    for (const [o, title] of [[{}, "Няма интернет"], [{ net: () => "<html>404</html>" }, "Не стана"]]) {
      const r = await run(T, "small", Object.assign({ src: filled(EX), filename: ME, app: true, alerts: [0, 0] }, o));
      assert.strictEqual(r.alerts[1].title, title);
      assert(!(SW in r.files) && !r.opened.length);
    }
    let r = await run(T, "small", { src: INSTALLER, filename: ME, app: true });
    assert.strictEqual(r.alerts[0].title, "Няма програма");
    r = await run(T, "small", { src: filled(EX), filename: ME, app: true, alerts: [-1] });
    assert(!(IMPF in r.files) && !r.opened.length);
  });

  console.log("ai/tests");
  const { score } = require("../../ai/tests/compare"), { T: TESTS, expected } = require("../../ai/tests/timetables");
  await test("compare.js: a perfect answer scores every cell; a wrong room, bells and a teacher name are caught", async () => {
    for (const t of TESTS) {
      const e = expected(t), r = score(A, t.n, "Ето:\n```json\n" + JSON.stringify(e) + "\n```");
      assert.strictEqual(r.right, r.cells, t.n + ": " + r.wrong.join("; "));
      assert(r.bells && !r.notes.some(x => /errors|class|grade|TEACHER/.test(x)), r.notes.join("; "));
    }
    const e = expected(TESTS[0]);
    e.week["1"][0].room = "205"; e.bells[0][1] = "08:45"; e.meta.class = "9б Петрова";
    const r = score(A, 1, JSON.stringify(e));
    assert.strictEqual(r.right, r.cells - 1);
    assert.deepStrictEqual(r.wrong, ["Пн1: БЕЛ 204 ≠ БЕЛ 205"]);
    assert(!r.bells && r.notes.some(x => x.startsWith("TEACHER NAMES: Петрова")));
  });
  await test("the expected timetables import in School Widget: no errors, and each one is drawn", async () => {
    for (const t of TESTS) {
      assert.deepStrictEqual(A.validateData(A.migrate(expected(t))).errors, [], t.n);
      assert(fs.existsSync(P("ai/tests/pictures", t.n + (t.style === "photo" ? ".jpg" : ".png"))), "run node ai/tests/make.js");
      assert.deepStrictEqual(JSON.parse(fs.readFileSync(P("ai/tests/expected", t.n + ".json"), "utf8")), JSON.parse(JSON.stringify(expected(t))), "expected/ is out of date: run make.js");
    }
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
