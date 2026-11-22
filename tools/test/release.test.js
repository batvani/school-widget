// Tests for tools/release.js: the release checks, version.json and the notes, and that the script
// accepts what release.js makes (a real install through the script's own code, from a fake GitHub).
// Plain node: node tools/test/release.test.js
const fs = require("fs"), path = require("path"), assert = require("assert");
const run = require("../preview/run");
const { build, fnv, size, notesFor } = require("../release");
const ROOT = path.join(__dirname, "..", "..");
const SRC = fs.readFileSync(path.join(ROOT, "school-widget.js"), "utf8");
const CL = fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8");
const VER = SRC.match(/\nconst VERSION = "([^"]+)";/)[1];
const OWN = "/icloud/School Widget.js", STATE = "/docs/uchilishte/state.json";
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
    assert.strictEqual(v.holidays, A.HOLIDAYS.schoolYear);
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
  await test("the script installs what release.js makes; the version it replaces counts as unedited", async () => {
    const NEW = make(`${NEXT}`), v = build({ src: NEW, changelog: withNotes(`${NEXT}`) }).versionJson;
    const map = { [GH + "latest/download/version.json"]: JSON.stringify(v), [`${GH}download/v${NEXT}/school-widget.js`]: NEW,
      [`${GH}download/v${VER}/version.json`]: JSON.stringify(build().versionJson) };
    const r = await run("2026-11-05T10:20", "small", { files: { [OWN]: SRC }, net: url => map[url] || null });
    const st = JSON.parse(r.files[STATE]);
    assert.strictEqual(r.files[OWN], NEW, JSON.stringify(st));
    assert(!st.autoPaused);
    assert.strictEqual(st.justUpdated, `${NEXT}`);
  });
  await test("notes come from the version's own section", async () => {
    assert.deepStrictEqual(notesFor(withNotes(`${NEXT}`), `${NEXT}`), { bg: "тест", en: "test" });
    assert(notesFor(CL, VER).bg.length > 20 && CL.includes("Накратко: " + notesFor(CL, VER).bg));
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
