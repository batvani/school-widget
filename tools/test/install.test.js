// Tests for the install page: install/index.html in Chromium with links from
// encode.py (and the same in JS) for every test timetable; the preview; where each button goes
// (the Shortcut with the timetable, School Widget directly, the clipboard route), read back with
// the script's own parseImport; a cut-off link, no link, a newer format; no requests at all;
// the Shortcut's link in the page. node tools/test/install.test.js
const fs = require("fs"), path = require("path"), assert = require("assert"), { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const run = require("../preview/run");
const ROOT = path.join(__dirname, "../.."), P = (...a) => path.join(ROOT, ...a);
const link = t => "https://batvani.github.io/school-widget/install/#z=" + require("zlib").deflateRawSync(Buffer.from(JSON.stringify(t), "utf8"), { level: 9 }).toString("base64url");
const { T: TESTS, expected } = require(P("ai/tests/timetables"));
const FIX = JSON.parse(fs.readFileSync(P("tools/preview/fixtures/sample-2027.json"), "utf8"));
const PAGE = "file://" + P("install/index.html");
const TMP = process.env.CLAUDE_JOB_DIR ? path.join(process.env.CLAUDE_JOB_DIR, "tmp") : require("os").tmpdir();

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 5).join("\n       ")); }
}

(async () => {
  let A;
  await run("2026-11-05T10:20", "small", { expose: o => A = o });
  const browser = await chromium.launch();
  // the page, with every jump and copy caught instead of done
  async function open(hash, more = "") {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } }), page = await ctx.newPage(), requests = [];
    page.on("request", r => requests.push(r.url()));
    await page.addInitScript(() => {
      window.__went = []; window.__go = u => window.__went.push(u);
      window.__copied = []; Object.defineProperty(navigator, "clipboard", { value: { writeText: t => { window.__copied.push(t); return Promise.resolve(); } } });
    });
    await page.goto(PAGE + more + hash); await page.waitForTimeout(150);
    const went = () => page.evaluate(() => window.__went), copied = () => page.evaluate(() => window.__copied);
    return { page, ctx, requests, went, copied, text: s => page.$eval(s, e => e.textContent) };
  }
  const q = u => Object.fromEntries(new URL(u.replace(/^shortcuts:\/\//, "https://x/")).searchParams);
  const cases = TESTS.map(t => [`test ${t.n}`, expected(t)]).concat([["the user's timetable", FIX]]);
  const lengths = [];

  console.log("install page");
  await test("every test timetable: the preview, Инсталирай → the Shortcut with it, Вече имам → School Widget with it", async () => {
    for (const [name, d] of cases) {
      const l = link(d); lengths.push([name, l.length]);
      const o = await open("#" + l.split("#")[1]);
      const days = Object.values(d.week).filter(x => x.some(c => c.name)).length, n = Object.values(d.week).flat().filter(c => c.name).length;
      assert.strictEqual(await o.text("h1"), `${d.meta.class} · Твоята програма`, name);
      assert.deepStrictEqual(await o.page.$$eval(".pv b", l => l.map(e => +e.textContent)), [days, n], name);
      assert.strictEqual(!!(await o.page.$("p.lead + p.lead, .pv + p.lead")), Object.values(d.week).flat().some(c => c.groups), name + ": the groups line");
      assert.deepStrictEqual(await o.went(), [], "nothing opens by itself (the user, 21 Nov)");
      await o.page.click("#in");
      const [u] = await o.went(), p = q(u);
      assert(u.startsWith("shortcuts://run-shortcut?"), u);
      assert.deepStrictEqual([p.name, p.input], ["School Widget Installer", "text"]);
      assert.deepStrictEqual(A.parseImport(p.text).data, d, name);
      const have = await o.page.$eval("a.sec", a => a.href);
      assert(have.startsWith("https://open.scriptable.app/run/School%20Widget?data=uchilishte%3Az%3A"), have);
      assert.deepStrictEqual(A.parseImport(have).data, d, name);
      assert.deepStrictEqual(o.requests, [PAGE], "no requests but the page itself, and the timetable after # never in one");
      await o.ctx.close();
    }
  });
  await test("Копирай и пусни прекия път: copies uchilishte:z:…, then runs the Shortcut without input", async () => {
    const l = link(FIX), o = await open("#" + l.split("#")[1]);
    await o.page.click("#cp"); await o.page.waitForTimeout(800);
    const [c] = await o.copied();
    assert(c.startsWith("uchilishte:z:"));
    assert.deepStrictEqual(A.parseImport(c).data, FIX);
    assert.deepStrictEqual(await o.went(), ["shortcuts://run-shortcut?name=School%20Widget%20Installer"]);
    await o.ctx.close();
  });
  await test("a link from encode.py, and a #d= link, work the same", async () => {
    const f = path.join(TMP, "install-tt.json"); fs.writeFileSync(f, JSON.stringify(FIX));
    const py = execFileSync("python3", ["-I", P("ai/encode.py"), f], { encoding: "utf8" }).trim();
    const d = "#d=" + Buffer.from(JSON.stringify(FIX)).toString("base64url");
    for (const h of ["#" + py.split("#")[1], d]) {
      const o = await open(h);
      await o.page.click("#in");
      assert.deepStrictEqual(A.parseImport(q((await o.went())[0]).text).data, FIX);
      await o.ctx.close();
    }
  });
  await test("no timetable: Инсталирай от копираното runs the Shortcut without input", async () => {
    const o = await open("");
    assert.strictEqual(await o.text(".card b"), "В този линк няма програма");
    await o.page.click("#clip");
    assert.deepStrictEqual(await o.went(), ["shortcuts://run-shortcut?name=School%20Widget%20Installer"]);
    await o.ctx.close();
  });
  await test("a cut-off link: says so, offers nothing that would install it", async () => {
    const o = await open("#z=" + link(FIX).split("#z=")[1].slice(0, 80));
    assert.strictEqual(await o.text(".err b"), "Линкът е повреден");
    assert(!(await o.page.$("#in")) && !(await o.page.$("#cp")));
    await o.ctx.close();
  });
  await test("a newer format still installs, with a note; English with ?lang=en", async () => {
    const d = JSON.parse(JSON.stringify(FIX)); d.meta.schema = 2;
    let o = await open("#" + link(d).split("#")[1]);
    assert.strictEqual(await o.text(".err b"), "Тази програма иска по-нов School Widget");
    assert(await o.page.$("#in"));
    await o.ctx.close();
    o = await open("#" + link(FIX).split("#")[1], "?lang=en");
    assert.strictEqual(await o.text("#in"), "Install");
    assert.strictEqual(await o.page.evaluate(() => document.documentElement.lang), "en");
    await o.ctx.close();
  });
  await test("the Shortcut button opens the Shortcut's iCloud link, and instructions.js reads the same link", async () => {
    const want = require(P("tools/instructions.js")).shortcutLink();
    const o = await open("#" + link(FIX).split("#")[1]);
    assert(await o.page.$(`a[href="${want}"]`), "a button to " + want);
    await o.ctx.close();
  });
  await browser.close();
  console.log("\nlink lengths: " + lengths.map(([n, l]) => `${n} ${l}`).join(", ") + (lengths.some(x => x[1] > 8000) ? "  WARNING: over 8 kB" : "  (all under 8 kB)"));
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
