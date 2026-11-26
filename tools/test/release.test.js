// Tests for tools/release.js: the release checks, version.json and the notes, and that the script
// accepts what release.js makes (a real install through the script's own code, from a fake GitHub).
// Plain node: node tools/test/release.test.js
const fs = require("fs"), path = require("path"), assert = require("assert");
const run = require("../preview/run");
const { build, squash, fnv, size, notesFor } = require("../release");
const ROOT = path.join(__dirname, "..", "..");
const SRC = fs.readFileSync(path.join(ROOT, "school-widget.js"), "utf8");
const CL = fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8");
const VER = SRC.match(/\nconst VERSION = "([^"]+)";/)[1];
const OWN = "/icloud/School Widget.js", STATE = "/docs/school-widget/state.json";
const GH = "https://github.com/batvani/school-widget/releases/";
const make = v => SRC.replace(`// Version ${VER} —`, `// Version ${v} —`).replace(`\nconst VERSION = "${VER}";`, `\nconst VERSION = "${v}";`);
const NEXT = VER.replace(/\d+$/, n => +n + 1), ESC = v => v.replace(/\./g, "\\."); // the version after this one (the tests are about the next release)
const withNotes = v => CL.replace(new RegExp(`^(## ${ESC(VER)} )`, "m"), `## ${v.replace(/-.*/, "")} — 1 Dec 2026\nНакратко: тест\nIn short: test\n\n$1`);

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 4).join("\n       ")); }
}
const refused = (fn, re) => assert.throws(fn, e => re.test(e.message), re);

(async () => {
  let A;
  await run("2026-11-05T10:20", "small", { expose: o => A = o });
  await test("the fingerprint and size are the script's own (Cyrillic, CRLF, empty)", async () => {
    for (const t of [SRC, "", "a", "Училище\r\nстая 03\n", SRC.replace(/\n/g, "\r\n")]) {
      assert.strictEqual(fnv(t), A.fingerprint(t));
      assert.strictEqual(size(t), A.codeSize(t));
    }
  });
  await test("this script makes a valid version.json and the release text", async () => {
    const r = build({ tag: "v" + VER, shortcut: "https://www.icloud.com/shortcuts/0123456789abcdef0123456789abcdef" }), v = r.versionJson;
    assert.strictEqual(v.version, VER);
    assert.strictEqual(v.file, "school-widget.js");
    assert.strictEqual(v.schema, A.SCHEMA);
    assert(!("holidays" in v), "the holidays are downloaded, not part of a release (1.8.5)");
    assert.strictEqual(v.shortcut, "https://www.icloud.com/shortcuts/0123456789abcdef0123456789abcdef");
    assert(v.notes.bg && v.notes.en);
    assert.strictEqual(r.notesMd, `${v.notes.bg}\n\n${v.notes.en}\n`);
  });
  await test("refused: a tag that isn't the script's version, version line ≠ VERSION, no notes", async () => {
    refused(() => build({ tag: "v9.9.9" }), new RegExp(`the tag is v9\\.9\\.9, the script says ${ESC(VER)}`));
    refused(() => build({ src: SRC.replace(`// Version ${VER} —`, "// Version 9.9.9 —") }), /line 4 says 9\.9\.9/);
    refused(() => build({ src: make(`${NEXT}`) }), new RegExp(`no "## ${ESC(NEXT)}`));
    refused(() => build({ src: make(`${NEXT}`), changelog: CL.replace(new RegExp(`^(## ${ESC(VER)} )`, "m"), `## ${NEXT} — x\n- a\n\n$1`) }), /Накратко/);
    assert.strictEqual(build({ src: make(`${NEXT}`), changelog: withNotes(`${NEXT}`), tag: `v${NEXT}` }).versionJson.notes.en, "test");
  });
  await test("the script installs what release.js makes (the squashed copy); the version it replaces counts as unedited", async () => {
    const B = build({ src: make(`${NEXT}`), changelog: withNotes(`${NEXT}`) }), NEW = B.src, v = B.versionJson;
    assert(NEW.length < make(`${NEXT}`).length * 0.9, "squashed");
    const map = { [GH + "latest/download/version.json"]: JSON.stringify(v), [`${GH}download/v${NEXT}/school-widget.js`]: NEW,
      [`${GH}download/v${VER}/version.json`]: JSON.stringify(build().versionJson) };
    const r = await run("2026-11-05T10:20", "small", { src: build().src, files: { [OWN]: build().src }, net: url => map[url] || null }); // the installed copy is a squashed release too
    const st = JSON.parse(r.files[STATE]);
    assert.strictEqual(r.files[OWN], NEW, JSON.stringify(st));
    assert(!st.autoPaused);
    assert.strictEqual(st.justUpdated, `${NEXT}`);
  });
  const SQ = build().src;
  await test("the squashed copy keeps lines 1–5, `const VERSION` and `const TEST_NOW` as they are, and compiles", async () => {
    const a = SRC.split("\n"), b = SQ.split("\n");
    assert.deepStrictEqual(b.slice(0, 5), a.slice(0, 5));
    assert(/^\/\/ Version \S+ — /.test(b[3]) && /^\/\/ id: uchilishte-widget; schema: \d+/.test(b[4]));
    assert.strictEqual(b[5], `const VERSION = "${VER}";`);
    assert.strictEqual(b[6], "const TEST_NOW = null;");
    assert.strictEqual(SQ.match(/\nconst VERSION = /g).length, 1);
    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
    new AsyncFunction("config", "module", SQ); // compiles (not run)
    assert(SQ.length < SRC.length * 0.85, `squashed: ${SQ.length} of ${SRC.length}`);
  });
  await test("the squashed copy draws the same widgets (every family and layout, several moments, both languages and modes)", async () => {
    const crypto = require("crypto");
    const hash = x => crypto.createHash("sha256").update(JSON.stringify(x, (k, v) => v instanceof Date ? "D" + v.toISOString() : v)).digest("hex");
    let n = 0;
    for (const mode of ["dark", "light"]) for (const lang of ["bg", "en"]) for (const t of ["2026-11-05T08:35", "2026-11-05T10:20", "2026-11-05T10:47", "2026-11-05T15:00", "2026-11-07T11:00", "2026-12-28T10:00", "2027-07-10T10:00"])
      for (const fam of ["small", "medium", "large", "accessoryRectangular", "accessoryCircular", "accessoryInline"]) for (const lay of fam === "medium" ? ["", "layout=day", "layout=list"] : [""]) {
        process.env.MODE = mode;
        const o = { settings: { language: lang }, param: lay };
        const a = await run(t, fam, o), b = await run(t, fam, Object.assign({}, o, { src: SQ }));
        assert.strictEqual(hash([b.widget, b.logs, b.scheduled.length]), hash([a.widget, a.logs, a.scheduled.length]), `${mode} ${lang} ${t} ${fam} ${lay}`);
        n++;
      }
    process.env.MODE = "dark";
    assert(n > 200);
  });
  await test("the squashed copy's menu page looks the same in Chromium (pixel for pixel) and its script has no errors", async () => {
    const live = require("../preview/live");
    for (const scheme of ["dark", "light"]) for (const [lang, tab, t] of [["bg", "t1", "2026-11-05T10:20"], ["en", "t1", "2026-11-05T15:00"], ["bg", "t2", "2026-11-05T10:20"], ["en", "t3", "2026-12-28T10:00"], ["bg", "t4", "2026-11-05T10:20"], ["en", "t4", "2026-11-05T10:20"]]) {
      const shot = async src => { let png, err = []; await live(t, { src, settings: { language: lang }, query: { view: "today", tab } }, async (page, settle) => { page.on("pageerror", e => err.push(String(e))); await settle(); png = await page.screenshot({ fullPage: true }); }, { scheme }); return { png, err }; };
      const a = await shot(undefined), b = await shot(SQ);
      assert.deepStrictEqual(b.err, []);
      assert(a.png.equals(b.png), `${scheme} ${lang} ${tab} ${t}: the screenshots differ`);
    }
    await live.close();
  });
  await test("the squashed copy keeps the Cyrillic as UTF-8 text (no \\u escapes) and is smaller than the ASCII one", async () => {
    const src = fs.readFileSync(path.join(ROOT, "school-widget.js"), "utf8"), u = squash(src), a = squash(src, { charset: "ascii" });
    assert(/[а-яА-Я]/.test(u) && !/\\u04[0-9a-f]{2}/i.test(u), "Cyrillic should be plain text");
    assert(size(u) < size(a) - 20000, `utf8 ${size(u)} B should be well under ascii ${size(a)} B`);
  });
  await test("notes come from the version's own section", async () => {
    assert.deepStrictEqual(notesFor(withNotes(`${NEXT}`), `${NEXT}`), { bg: "тест", en: "test" });
    assert(notesFor(CL, VER).bg.length > 20 && CL.includes("Накратко: " + notesFor(CL, VER).bg));
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
