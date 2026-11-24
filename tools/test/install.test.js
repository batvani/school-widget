// Tests for the install page (install/index.html in Chromium, served as GitHub Pages would serve it).
// Without a timetable: the install steps (the Shortcut, the installer script, the code), the full AI
// prompt, the AI answer → QR box. With one (#z= from encode.py or the same in JS, #d=): the preview,
// Отвори в School Widget (read back with the script's own parseImport), "not installed yet" (copies
// it); a cut-off link, a newer format, English; nothing requested from anywhere else.
// node tools/test/install.test.js
const fs = require("fs"), path = require("path"), assert = require("assert"), { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const run = require("../preview/run");
const ROOT = path.join(__dirname, "../.."), P = (...a) => path.join(ROOT, ...a);
const link = t => "https://batvani.github.io/school-widget/install/#z=" + require("zlib").deflateRawSync(Buffer.from(JSON.stringify(t), "utf8"), { level: 9 }).toString("base64url");
const { T: TESTS, expected } = require(P("ai/tests/timetables"));
const FIX = JSON.parse(fs.readFileSync(P("tools/preview/fixtures/sample-2027.json"), "utf8"));
const SITE = "https://batvani.github.io/school-widget/", PAGE = SITE + "install/";
const SERVED = { "install/index.html": P("install/index.html"), "ai/prompt.txt": P("ai/prompt.txt"), "ai/prompt-en.txt": P("ai/prompt-en.txt"), "ai/install-script.js": P("ai/install-script.js"), "school-widget.js": P("school-widget.js") };
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
  // the page, with every jump, copy and QR link caught instead of done
  async function open(hash, more = "") {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } }), page = await ctx.newPage(), requests = [];
    page.on("request", r => requests.push(r.url()));
    await ctx.route("**/*", route => {
      const u = new URL(route.request().url());
      if (u.origin + "/" !== "https://batvani.github.io/") return route.abort();
      let f = u.pathname.replace("/school-widget/", ""); if (f === "install/") f = "install/index.html";
      return SERVED[f] ? route.fulfill({ body: fs.readFileSync(SERVED[f]), contentType: f.endsWith(".html") ? "text/html; charset=utf-8" : "text/plain; charset=utf-8" }) : route.fulfill({ status: 404, body: "" });
    });
    await page.addInitScript(() => {
      window.__went = []; window.__go = u => window.__went.push(u); window.__qrs = []; window.__qr = u => window.__qrs.push(u);
      window.__copied = []; Object.defineProperty(navigator, "clipboard", { value: { writeText: t => { window.__copied.push(t); return Promise.resolve(); } } });
    });
    await page.goto(PAGE + more + hash); await page.waitForTimeout(200);
    const went = () => page.evaluate(() => window.__went), copied = () => page.evaluate(() => window.__copied);
    return { page, ctx, requests, went, copied, text: s => page.$eval(s, e => e.textContent) };
  }
  const cases = TESTS.map(t => [`test ${t.n}`, expected(t)]).concat([["the user's timetable", FIX]]);
  const lengths = [];

  console.log("install page: a timetable in the link");
  await test("every test timetable: the preview; Отвори в School Widget → School Widget with it; nothing opens by itself", async () => {
    for (const [name, d] of cases) {
      const l = link(d); lengths.push([name, l.length]);
      const o = await open("#" + l.split("#")[1]);
      const days = Object.values(d.week).filter(x => x.some(c => c.name || c.groups)).length, n = Object.values(d.week).flat().filter(c => c.name || c.groups).length;
      assert.strictEqual(await o.text("h1"), `${d.meta.class} · Твоята програма`, name);
      assert.deepStrictEqual(await o.page.$$eval(".pv b", l => l.map(e => +e.textContent)), [days, n], name);
      assert.strictEqual(!!(await o.page.$(".pv + p.lead")), Object.values(d.week).flat().some(c => c.groups), name + ": the groups line");
      assert.deepStrictEqual(await o.went(), [], "nothing opens by itself (the user, 21 Nov)");
      await o.page.click("#open");
      const [u] = await o.went();
      assert(u.startsWith("https://open.scriptable.app/run/School%20Widget?data=school-widget%3Az%3A"), u);
      assert.deepStrictEqual(A.parseImport(u).data, d, name);
      assert.deepStrictEqual(o.requests, [PAGE], "no requests but the page itself, and the timetable after # never in one");
      await o.ctx.close();
    }
  });
  await test("not installed yet: copies school-widget:z:…, then the install steps say it's copied", async () => {
    const o = await open("#" + link(FIX).split("#")[1]);
    await o.page.click("#ci"); await o.page.waitForTimeout(100);
    const [c] = await o.copied();
    assert(c.startsWith("school-widget:z:"));
    assert.deepStrictEqual(A.parseImport(c).data, FIX);
    assert.deepStrictEqual(await o.went(), [PAGE + "?copied=1"]);
    await o.ctx.close();
    const s = await open("", "?copied=1");
    assert(/Програмата ти е копирана/.test(await s.text(".card.ok")));
    await s.ctx.close();
  });
  await test("a link from encode.py, and a #d= link, work the same", async () => {
    const f = path.join(TMP, "install-tt.json"); fs.writeFileSync(f, JSON.stringify(FIX));
    const py = execFileSync("python3", ["-I", P("ai/encode.py"), f], { encoding: "utf8" }).trim();
    const d = "#d=" + Buffer.from(JSON.stringify(FIX)).toString("base64url");
    for (const h of ["#" + py.split("#")[1], d]) {
      const o = await open(h);
      await o.page.click("#open");
      assert.deepStrictEqual(A.parseImport((await o.went())[0]).data, FIX);
      await o.ctx.close();
    }
  });
  await test("a cut-off link: says so, offers nothing that would open it", async () => {
    const o = await open("#z=" + link(FIX).split("#z=")[1].slice(0, 80));
    assert.strictEqual(await o.text(".err b"), "Линкът е повреден");
    assert(!(await o.page.$("#open")) && !(await o.page.$("#ci")));
    await o.ctx.close();
  });
  await test("a newer format still opens, with a note; English with ?lang=en", async () => {
    const d = JSON.parse(JSON.stringify(FIX)); d.meta.schema = 2;
    let o = await open("#" + link(d).split("#")[1]);
    assert.strictEqual(await o.text(".err b"), "Тази програма иска по-нов School Widget");
    assert(await o.page.$("#open"));
    await o.ctx.close();
    o = await open("#" + link(FIX).split("#")[1], "?lang=en");
    assert.strictEqual(await o.text("#open"), "Open in School Widget");
    assert.strictEqual(await o.page.evaluate(() => document.documentElement.lang), "en");
    await o.ctx.close();
  });

  console.log("install page: no timetable");
  await test("the steps: App Store, the Shortcut's iCloud link (the one instructions.js reads), Пусни го runs it", async () => {
    const o = await open("");
    assert.strictEqual(await o.page.$eval("#store", a => a.href), "https://apps.apple.com/app/scriptable/id1405459188");
    assert.strictEqual(await o.page.$eval("#add", a => a.href), require(P("tools/instructions.js")).shortcutLink());
    await o.page.click("#run");
    assert.deepStrictEqual(await o.went(), ["shortcuts://run-shortcut?name=School%20Widget%20Installer"]);
    assert(!(await o.page.$("#alt[open]")), "the other ways are folded");
    assert.strictEqual(await o.page.$eval("#code", a => a.href), SITE + "school-widget.js");
    await o.ctx.close();
  });
  await test("Копирай скрипта за инсталиране and Направи програма с AI copy the whole files (BG / EN); only this site is asked", async () => {
    for (const [more, prompt] of [["", "ai/prompt.txt"], ["?lang=en", "ai/prompt-en.txt"]]) {
      const o = await open("", more);
      await o.page.click("#alt summary"); await o.page.click("#cs"); await o.page.click("#ai");
      assert.deepStrictEqual(await o.copied(), [fs.readFileSync(P("ai/install-script.js"), "utf8"), fs.readFileSync(P(prompt), "utf8")]);
      assert(o.requests.every(u => u.startsWith(SITE)), o.requests.join(" "));
      await o.ctx.close();
    }
  });
  await test("the AI on a computer: its whole answer (or only the link) → a QR code of the link; no timetable → says so", async () => {
    const answer = "Ето програмата:\n```json\n" + JSON.stringify(FIX) + "\n```\n**Копирай целия този отговор → School Widget → Внеси програма → Постави.**";
    const o = await open("");
    await o.page.click("#pc summary");
    await o.page.fill("#ans", answer); await o.page.click("#mk"); await o.page.waitForTimeout(200);
    let [u] = await o.page.evaluate(() => window.__qrs);
    assert(u.startsWith(PAGE + "#z="), u);
    assert.deepStrictEqual(A.parseImport(u).data, FIX);
    assert(await o.page.$("#qr svg"), "a QR code");
    await o.page.fill("#ans", "линкът: " + link(FIX) + " готово"); await o.page.click("#mk"); await o.page.waitForTimeout(200);
    assert.strictEqual((await o.page.evaluate(() => window.__qrs))[1], link(FIX));
    await o.page.fill("#ans", "здрасти"); await o.page.click("#mk"); await o.page.waitForTimeout(100);
    assert(/няма програма/.test(await o.text("#qr")));
    await o.ctx.close();
  });
  await test("the page's QR code is the script's own (qrSvg copied word for word)", async () => {
    const fn = f => { const t = fs.readFileSync(P(f), "utf8"), a = t.indexOf("  // QR code (byte mode"), b = t.indexOf("\n  }\n", a); return t.slice(a, b); };
    assert.strictEqual(fn("install/index.html"), fn("school-widget.js"));
  });
  await browser.close();
  console.log("\nlink lengths: " + lengths.map(([n, l]) => `${n} ${l}`).join(", ") + (lengths.some(x => x[1] > 8000) ? "  WARNING: over 8 kB" : "  (all under 8 kB)"));
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
