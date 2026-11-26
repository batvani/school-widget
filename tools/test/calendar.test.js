// Tests for the calendar page (calendar/index.html) in Chromium, served as GitHub Pages would
// serve it (with the files tools/holidays.js builds): the grade and city from the link, the
// right feed for the class, Apple / Google / copy, and nothing loaded from anywhere else.
// node tools/test/calendar.test.js
const fs = require("fs"), path = require("path"), os = require("os"), assert = require("assert");
const { chromium } = require("playwright");
const H = require("../holidays");
const ROOT = path.join(__dirname, "../.."), P = (...a) => path.join(ROOT, ...a);
const SITE = "https://batvani.github.io/school-widget/";

const { test, finish } = require("./harness");

(async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "cal-"));
  H.build(JSON.parse(fs.readFileSync(P("holidays/list.json"), "utf8")), out);
  fs.copyFileSync(P("calendar/index.html"), path.join(out, "calendar/index.html"));
  const browser = await chromium.launch();
  // the page on a given day (the class is worked out from the school year now)
  async function open(query, day = "2026-11-23T12:00:00") {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } }), page = await ctx.newPage(), requests = [];
    page.on("request", r => requests.push(r.url()));
    await ctx.route("**/*", route => {
      const u = route.request().url();
      if (!u.startsWith(SITE)) return route.abort();
      let f = path.join(out, decodeURIComponent(new URL(u).pathname.replace("/school-widget/", "")));
      if (f.endsWith("/")) f += "index.html";
      return fs.existsSync(f) ? route.fulfill({ body: fs.readFileSync(f), contentType: f.endsWith(".html") ? "text/html; charset=utf-8" : "application/json" }) : route.fulfill({ status: 404, body: "" });
    });
    await page.addInitScript(d => {
      const T = new Date(d).getTime(), D = Date;
      window.Date = class extends D { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } };
      window.__copied = []; Object.defineProperty(navigator, "clipboard", { value: { writeText: t => { window.__copied.push(t); return Promise.resolve(); } } });
    }, day);
    await page.goto(SITE + "calendar/" + query); await page.waitForTimeout(200);
    const href = s => page.$eval(s, e => e.getAttribute("href")).catch(() => null);
    return { page, ctx, requests, href };
  }

  await test("from the app: grade 8 and Варна filled in → the feed of the class of 2031 with Варна", async () => {
    const o = await open("?grade=8&city=" + encodeURIComponent("Варна"));
    assert.strictEqual(await o.page.$eval("#g", e => e.value), "8");
    assert.strictEqual(await o.page.$eval("#c", e => e.value), "Варна");
    assert.strictEqual(await o.href("#apple"), "webcal://batvani.github.io/school-widget/calendar/feeds/2031-varna.ics");
    assert.strictEqual(await o.href("#google"), "https://calendar.google.com/calendar/r?cid=" + encodeURIComponent("webcal://batvani.github.io/school-widget/calendar/feeds/2031-varna.ics"));
    await o.page.click("#copy");
    assert.deepStrictEqual(await o.page.evaluate(() => window.__copied), [SITE + "calendar/feeds/2031-varna.ics"]);
    assert(o.requests.every(u => u.startsWith(SITE)), o.requests.join(" "));
    await o.ctx.close();
  });
  await test("no grade yet: no buttons until one is picked; no city = the plain feed", async () => {
    const o = await open("");
    assert.strictEqual(await o.href("#apple"), null);
    await o.page.selectOption("#g", "12");
    assert.strictEqual(await o.href("#apple"), "webcal://batvani.github.io/school-widget/calendar/feeds/2027.ics");
    await o.ctx.close();
  });
  await test("next school year: the same grade is the next class (the feed follows the class)", async () => {
    const o = await open("?grade=8", "2027-09-20T12:00:00");
    assert.strictEqual(await o.href("#apple"), "webcal://batvani.github.io/school-widget/calendar/feeds/2032.ics");
    await o.ctx.close();
  });
  await test("English; an unknown city is ignored", async () => {
    const o = await open("?lang=en&grade=3&city=Atlantis");
    assert.strictEqual(await o.page.$eval("#c", e => e.value), "");
    assert(/Add to Apple Calendar/.test(await o.page.textContent("#apple")));
    await o.ctx.close();
  });
  await test("the feeds.json can't load: says so", async () => {
    fs.renameSync(path.join(out, "calendar/feeds.json"), path.join(out, "calendar/feeds.x"));
    const o = await open("?grade=8");
    assert(/не се зареди/.test(await o.page.textContent("main")));
    fs.renameSync(path.join(out, "calendar/feeds.x"), path.join(out, "calendar/feeds.json"));
    await o.ctx.close();
  });

  await browser.close();
  fs.rmSync(out, { recursive: true });
  finish();
})().catch(e => { console.error(e); process.exit(1); });
