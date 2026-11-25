// Tests for install/ (install/index.html in Chromium, served as GitHub Pages would serve it): since
// the landing page, it only does automatic jobs, with nothing to type.
//   install/#z=… / #d=… (classmates' links, QR codes, the AI's answers): opens School Widget with the
//     timetable straight away; if School Widget doesn't open within ~2 s (the page is still on screen),
//     goes to the landing page's #install with the timetable (#install&z=…); one Open in School Widget
//     button for when iOS doesn't open it by itself
//   a cut-off link: says so, opens nothing
//   plain install/ (and old ?lang=en, ?copied=1 links): goes to the landing page's #install
// Small (it loads before School Widget opens), nothing asked from anywhere else.
// node tools/test/install.test.js
const fs = require("fs"), path = require("path"), assert = require("assert"), { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const run = require("../preview/run");
const { SITE, P, open } = require("./site");
const PAGE = SITE + "install/";
const link = t => PAGE + "#z=" + require("zlib").deflateRawSync(Buffer.from(JSON.stringify(t), "utf8"), { level: 9 }).toString("base64url");
const { T: TESTS, expected } = require(P("ai/tests/timetables"));
const FIX = JSON.parse(fs.readFileSync(P("tools/preview/fixtures/sample-2027.json"), "utf8"));
const TMP = process.env.CLAUDE_JOB_DIR ? path.join(process.env.CLAUDE_JOB_DIR, "tmp") : require("os").tmpdir();
const OPEN = "https://open.scriptable.app/run/School%20Widget?data=school-widget%3A";

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 5).join("\n       ")); }
}

(async () => {
  let A;
  await run("2026-11-05T10:20", "small", { expose: o => A = o });
  const browser = await chromium.launch();
  const hash = u => u.slice(u.indexOf("#"));
  const cases = TESTS.map(t => [`test ${t.n}`, expected(t)]).concat([["a made-up timetable", FIX]]);

  console.log("install/: a timetable in the link");
  await test("every test timetable: School Widget opens with it at once (read back with the script's own parseImport)", async () => {
    for (const [name, d] of cases) {
      const o = await open(browser, PAGE + hash(link(d)), { wait: 300 });
      const [u, ...rest] = await o.went();
      assert(u && u.startsWith(OPEN + "z%3A"), name + ": " + u);
      assert.deepStrictEqual(A.parseImport(u).data, d, name);
      assert.deepStrictEqual(rest, [], name + ": nothing else yet");
      assert.deepStrictEqual(o.outside, [], "nothing asked from anywhere else");
      assert(o.requests.every(r => r === PAGE || !r.includes("#")), "the timetable after # is never sent");
      assert.deepStrictEqual(o.errors, []);
      await o.close();
    }
  });
  await test("School Widget didn't open (still on screen after ~2 s): the landing page's #install, timetable carried along", async () => {
    const l = link(FIX), o = await open(browser, PAGE + hash(l), { wait: 2600 });
    const went = await o.went();
    assert.strictEqual(went.length, 2, went.join(" "));
    assert.strictEqual(went[1], SITE + "#install&" + hash(l).slice(1));
    assert.deepStrictEqual(A.parseImport(went[1]).data, FIX);
    await o.close();
  });
  await test("School Widget opened (the page went to the background): stays, no jump to the landing page", async () => {
    const o = await open(browser, PAGE + hash(link(FIX)), {
      wait: 2600, init: () => {
        let hidden = false; Object.defineProperty(document, "hidden", { get: () => hidden }); Object.defineProperty(document, "visibilityState", { get: () => hidden ? "hidden" : "visible" });
        const go = window.__go; window.__go = u => { go(u); if (/^https:\/\/open\.scriptable\.app\//.test(u)) { hidden = true; document.dispatchEvent(new Event("visibilitychange")); } };
      }
    });
    assert.strictEqual((await o.went()).length, 1);
    await o.close();
  });
  await test("one Open in School Widget button for when iOS doesn't open it by itself", async () => {
    const o = await open(browser, PAGE + hash(link(FIX)));
    assert.strictEqual(await o.text("#open"), "Open in School Widget");
    await o.page.click("#open");
    const w = await o.went();
    assert.strictEqual(w[w.length - 1], w[0]);
    await o.close();
  });
  await test("a link from encode.py, and a #d= link, work the same", async () => {
    const f = path.join(TMP, "install-tt.json"); fs.mkdirSync(TMP, { recursive: true }); fs.writeFileSync(f, JSON.stringify(FIX));
    const py = execFileSync("python3", ["-I", P("ai/encode.py"), f], { encoding: "utf8" }).trim();
    assert(py.startsWith(PAGE + "#z="), py.slice(0, 80));
    for (const h of [hash(py), "#d=" + Buffer.from(JSON.stringify(FIX)).toString("base64url")]) {
      const o = await open(browser, PAGE + h);
      const [u] = await o.went();
      assert.deepStrictEqual(A.parseImport(u).data, FIX);
      await o.close();
    }
  });
  await test("a cut-off link: says so, opens nothing, points to the landing page", async () => {
    const o = await open(browser, PAGE + "#z=" + hash(link(FIX)).slice(3, 83), { wait: 2600 });
    assert.deepStrictEqual(await o.went(), []);
    assert(/broken/i.test(await o.text("body")), await o.text("body"));
    assert(!(await o.page.$("#open")));
    assert(await o.page.$(`a[href="${SITE}#timetable"]`));
    await o.close();
  });

  console.log("install/: no timetable");
  await test("plain install/, ?lang=en and the old ?copied=1: the landing page's #install", async () => {
    for (const more of ["", "?lang=en", "?copied=1"]) {
      const o = await open(browser, PAGE + more);
      assert.deepStrictEqual(await o.went(), [SITE + "#install"], more);
      await o.close();
    }
  });
  await test("small, English, nothing to type, no design of its own", async () => {
    const t = fs.readFileSync(P("install/index.html"), "utf8");
    assert(t.length < 8000, t.length + " bytes");
    assert(/<html lang="en">/.test(t));
    assert(!/<input|<textarea|SHORTCUT_LINK|qrSvg/.test(t));
    assert(/Content-Security-Policy" content="default-src 'none';/.test(t));
  });
  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
