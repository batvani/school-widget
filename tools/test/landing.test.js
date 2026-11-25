// Tests for the landing page (landing/index.html + page.js, served at the site root as GitHub Pages
// would serve it): the sections, the install steps (App Store, the Shortcut's iCloud link, Run it,
// progress remembered), a timetable handed over by install/ (#install&z=…), the AI prompt and the
// installer script copied whole, the AI-on-a-computer QR box, the Try it slider and Light/Dark, the
// running day, Reduce Motion, the phone's ☰ list and Install bar, nothing cut off, nothing too small,
// nothing asked from anywhere else; and that hand-opened links (docs, the AI's last lines) point here.
// node tools/test/landing.test.js
const fs = require("fs"), assert = require("assert");
const { chromium } = require("playwright");
const run = require("../preview/run");
const { SITE, P, open } = require("./site");
const FIX = JSON.parse(fs.readFileSync(P("tools/preview/fixtures/sample-2027.json"), "utf8"));
const zlink = t => "z=" + require("zlib").deflateRawSync(Buffer.from(JSON.stringify(t), "utf8"), { level: 9 }).toString("base64url");
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 860 };
const SECTIONS = ["widgets", "try", "menu", "holidays", "timetable", "computer", "install", "help"];

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 5).join("\n       ")); }
}

(async () => {
  let A;
  await run("2026-11-05T10:20", "small", { expose: o => A = o });
  const browser = await chromium.launch();
  const at = (o, sel) => o.page.$eval(sel, e => e.scrollIntoView({ block: "start" }));
  const mins = o => o.page.$$eval("[data-w] .sw", l => l.map(e => +e.dataset.min));

  console.log("landing page");
  await test("loads with no errors, English, every section, nothing asked from anywhere else", async () => {
    for (const viewport of [PHONE, DESK]) {
      const o = await open(browser, SITE, { viewport, wait: 800 });
      assert.deepStrictEqual(o.errors, []);
      assert.deepStrictEqual(o.outside, []);
      assert.strictEqual(await o.page.evaluate(() => document.documentElement.lang), "en");
      for (const id of SECTIONS) assert(await o.page.$("#" + id), "no #" + id);
      assert(/Content-Security-Policy" content="default-src 'none';/.test(fs.readFileSync(P("landing/index.html"), "utf8")));
      assert((await o.page.$$("[data-w] .sw")).length >= 6, "the widget copies (hero, sizes, Try it)");
      await o.close();
    }
  });
  await test("no sideways scrolling, nothing cut off (…), no page text under 13 px; phone and desktop, Dark and Light", async () => {
    for (const viewport of [PHONE, { width: 320, height: 640 }, DESK]) for (const colorScheme of ["dark", "light"]) {
      const o = await open(browser, SITE, { viewport, colorScheme, wait: 800 });
      const r = await o.page.evaluate(() => {
        const out = { wide: document.documentElement.scrollWidth - innerWidth, cut: [], small: [] };
        for (const e of document.querySelectorAll("body *")) {
          if (e.closest(".sw, .mphone, svg, [aria-hidden=true]") || !e.offsetParent) continue;
          const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
          if (!own) continue;
          const s = getComputedStyle(e);
          if (parseFloat(s.fontSize) < 13) out.small.push(e.textContent.trim().slice(0, 40) + " " + s.fontSize);
          if (e.scrollWidth > e.clientWidth + 1 && s.overflow !== "visible") out.cut.push(e.textContent.trim().slice(0, 40));
        }
        return out;
      });
      const where = `${viewport.width}×${viewport.height} ${colorScheme}`;
      assert(r.wide <= 0, `${where}: ${r.wide} px wider than the screen`);
      assert.deepStrictEqual(r.cut, [], where + ": cut off");
      assert.deepStrictEqual(r.small, [], where + ": under 13 px");
      await o.close();
    }
  });
  await test("follows the phone's Light / Dark", async () => {
    const lum = async colorScheme => {
      const o = await open(browser, SITE, { colorScheme });
      const c = await o.page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      await o.close();
      const [r, g, b] = c.match(/\d+/g).map(Number); return (r + g + b) / 765;
    };
    assert((await lum("dark")) < 0.15);
    assert((await lum("light")) > 0.85);
  });

  console.log("install");
  await test("three steps: App Store, the Shortcut's iCloud link (the one instructions.js reads), Run it runs it; progress bar; remembered", async () => {
    const o = await open(browser, SITE + "#install");
    assert.strictEqual(await o.page.$eval("#store", a => a.href), "https://apps.apple.com/app/scriptable/id1405459188");
    assert.strictEqual(await o.page.$eval("#add", a => a.href), require(P("tools/instructions.js")).shortcutLink());
    assert(/^https:\/\/www\.icloud\.com\/shortcuts\/[0-9a-f]{32}$/.test(require(P("tools/instructions.js")).shortcutLink()));
    assert.strictEqual((await o.page.$$("#install .step")).length, 3);
    await o.page.$$eval("#store, #add", l => l.forEach(a => a.addEventListener("click", e => e.preventDefault())));
    await o.page.click("#store"); await o.page.click("#add"); await o.page.click("#run");
    assert.deepStrictEqual(await o.went(), ["shortcuts://run-shortcut?name=School%20Widget%20Installer"]);
    assert.strictEqual(await o.page.$eval("#progress", e => e.dataset.done), "3");
    assert.strictEqual((await o.page.$$("#install .step.done")).length, 3);
    await o.page.reload(); await o.page.waitForTimeout(300);
    assert.strictEqual(await o.page.$eval("#progress", e => e.dataset.done), "3", "remembered after coming back from Shortcuts");
    assert(!(await o.page.$("#alt[open]")), "the other ways are folded");
    assert.strictEqual(await o.page.$eval("#code", a => a.href), SITE + "school-widget.js");
    await o.close();
  });
  await test("#install scrolls there; every #link on the page scrolls smoothly to an existing section", async () => {
    const o = await open(browser, SITE + "#install", { viewport: PHONE, wait: 900 });
    const top = await o.page.$eval("#install", e => e.getBoundingClientRect().top);
    assert(Math.abs(top) < 120, "#install at " + top);
    assert.strictEqual(await o.page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "smooth");
    const bad = await o.page.$$eval("a[href^='#']", l => l.map(a => a.getAttribute("href")).filter(h => h.length > 1 && !document.getElementById(h.slice(1))));
    assert.deepStrictEqual(bad, []);
    await o.close();
  });
  await test("the installer script and the AI prompt (English) are copied whole; only this site is asked", async () => {
    const o = await open(browser, SITE, { wait: 600 });
    await at(o, "#install"); await o.page.click("#alt summary"); await o.page.click("#cs");
    await at(o, "#timetable"); await o.page.click("#ai"); await o.page.waitForTimeout(100);
    assert.deepStrictEqual(await o.copied(), [fs.readFileSync(P("ai/install-script.js"), "utf8"), fs.readFileSync(P("ai/prompt-en.txt"), "utf8")]);
    assert(o.requests.every(u => u.startsWith(SITE)), o.requests.join(" "));
    await o.close();
  });
  await test("a timetable from install/ (#install&z=… / &d=…): Copy your timetable + Open in School Widget on top of the steps", async () => {
    for (const h of [zlink(FIX), "d=" + Buffer.from(JSON.stringify(FIX)).toString("base64url")]) {
      const o = await open(browser, SITE + "#install&" + h, { wait: 900 });
      assert(await o.page.$eval("#tt", e => !e.hidden && e.offsetHeight > 0), "the timetable card shows");
      assert(await o.page.$eval("#tt", e => e.compareDocumentPosition(document.querySelector("#install .step")) & Node.DOCUMENT_POSITION_FOLLOWING), "above the steps");
      await o.page.click("#ttCopy"); await o.page.waitForTimeout(100);
      const [c] = await o.copied();
      assert(c.startsWith("school-widget:" + h[0] + ":"), c.slice(0, 30));
      assert.deepStrictEqual(A.parseImport(c).data, FIX);
      await o.page.click("#ttOpen");
      const [u] = await o.went();
      assert(u.startsWith("https://open.scriptable.app/run/School%20Widget?data=school-widget%3A" + h[0] + "%3A"), u.slice(0, 90));
      assert.deepStrictEqual(A.parseImport(u).data, FIX);
      assert(o.requests.every(r => !r.includes(h.slice(2, 30))), "the timetable is never sent");
      await o.close();
    }
    const o = await open(browser, SITE + "#install");
    assert(await o.page.$eval("#tt", e => e.hidden || !e.offsetHeight), "no timetable, no card");
    await o.close();
  });
  await test("the AI on a computer (#computer): its whole answer (or only the link) → a QR code of install/#z=…; no timetable → says so", async () => {
    const answer = "Here it is:\n```json\n" + JSON.stringify(FIX) + "\n```\n**Copy this whole answer → School Widget → Paste.**";
    const o = await open(browser, SITE + "#computer");
    const sum = await o.page.$("#computer summary"); if (sum && !(await o.page.$("#computer[open]"))) await sum.click();
    await o.page.fill("#ans", answer); await o.page.click("#mk"); await o.page.waitForTimeout(300);
    const [u] = await o.qrs();
    assert(u.startsWith(SITE + "install/#z="), u);
    assert.deepStrictEqual(A.parseImport(u).data, FIX);
    assert(await o.page.$("#qr svg"), "a QR code");
    const l = SITE + "install/#" + zlink(FIX);
    await o.page.fill("#ans", "the link: " + l + " done"); await o.page.click("#mk"); await o.page.waitForTimeout(200);
    assert.strictEqual((await o.qrs())[1], l);
    await o.page.fill("#ans", "hello"); await o.page.click("#mk"); await o.page.waitForTimeout(100);
    assert(/no timetable/i.test(await o.text("#qr")), await o.text("#qr"));
    await o.close();
  });
  await test("the page's QR code is the script's own (qrSvg copied word for word)", async () => {
    const fn = f => { const t = fs.readFileSync(P(f), "utf8"), a = t.indexOf("  // QR code (byte mode"), b = t.indexOf("\n  }\n", a); assert(a > 0, f + ": no qrSvg"); return t.slice(a, b); };
    assert.strictEqual(fn("landing/page.js"), fn("school-widget.js"));
  });

  console.log("the demo day");
  await test("the day runs by itself; the slider moves every widget; it carries on ~1.5 s after letting go", async () => {
    const o = await open(browser, SITE, { viewport: DESK, wait: 300 });
    const a = await mins(o); await o.page.waitForTimeout(1600); const b = await mins(o);
    assert(a.length && b.every((m, i) => m !== a[i]), "the day doesn't run by itself: " + a + " / " + b);
    await at(o, "#try");
    await o.page.$eval("#slider", e => { e.value = 600; e.dispatchEvent(new Event("input", { bubbles: true })); });
    await o.page.waitForTimeout(100);
    assert((await mins(o)).every(m => m === 600), "every widget at 10:00: " + await mins(o));
    assert(/10:00/.test(await o.text("[data-clock]")));
    await o.page.waitForTimeout(800);
    assert((await mins(o)).every(m => m === 600), "holds while just let go");
    await o.page.waitForTimeout(2200);
    assert((await mins(o)).every(m => m > 600), "carries on after ~1.5 s (the user: the countdown mustn't stop)");
    await o.close();
  });
  await test("shortcut buttons jump the day; Dark / Light switches the demo widgets", async () => {
    const o = await open(browser, SITE, { viewport: DESK, colorScheme: "dark" });
    await at(o, "#try");
    const marks = await o.page.$$eval("#try [data-at]", l => l.map(b => +b.dataset.at));
    assert(marks.length >= 4, "Before school, In class, Break, After school");
    await o.page.click(`#try [data-at="${marks[1]}"]`); await o.page.waitForTimeout(1400);
    assert((await mins(o)).every(m => Math.abs(m - marks[1]) <= 2), "glided to " + marks[1] + ": " + await mins(o));
    await o.page.click("#lt"); await o.page.waitForTimeout(100);
    assert((await o.page.$$eval("[data-w] .sw:not([data-kind^=lock])", l => l.map(e => e.dataset.mode))).every(m => m === "light"));
    await o.page.click("#dk"); await o.page.waitForTimeout(100);
    assert((await o.page.$$eval("[data-w] .sw:not([data-kind^=lock])", l => l.map(e => e.dataset.mode))).every(m => m === "dark"));
    await o.close();
  });
  await test("size tabs Small / Medium / Large / Lock Screen show that size", async () => {
    const o = await open(browser, SITE, { viewport: PHONE });
    for (const [s, kind] of [["large", "large"], ["lock", "lockRect"], ["small", "small"], ["medium", "medium"]]) {
      await o.page.click(`#sizes [data-s=${s}]`); await o.page.waitForTimeout(700);
      const shown = await o.page.$$eval("#sizeStage .sw", l => l.filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e.closest("[data-w]")).visibility !== "hidden" && +getComputedStyle(e.closest("[data-w]")).opacity > 0.5).map(e => e.dataset.kind));
      assert(shown.includes(kind), s + ": " + shown);
      assert.strictEqual(await o.page.$eval(`#sizes [data-s=${s}]`, b => b.getAttribute("aria-selected")), "true");
    }
    await o.close();
  });
  await test("tapping a widget goes to the menu section (like the real widget opens the menu); menu tabs switch the view", async () => {
    const o = await open(browser, SITE, { viewport: DESK, wait: 600 });
    await o.page.click(".hero [data-w]"); await o.page.waitForTimeout(1200);
    const top = await o.page.$eval("#menu", e => e.getBoundingClientRect().top);
    assert(Math.abs(top) < 140, "#menu at " + top);
    const t0 = await o.text("#menu .mview");
    await o.page.click("#menu [data-tab=daysoff]"); await o.page.waitForTimeout(400);
    assert.notStrictEqual(await o.text("#menu .mview"), t0);
    await o.close();
  });
  await test("Reduce Motion: the day stands still, nothing animates", async () => {
    const o = await open(browser, SITE, { viewport: DESK, reducedMotion: "reduce", wait: 300 });
    const a = await mins(o); await o.page.waitForTimeout(1600);
    assert.deepStrictEqual(await mins(o), a);
    await at(o, "#menu"); await o.page.waitForTimeout(300);
    assert.strictEqual(await o.page.evaluate(() => document.getAnimations().filter(x => x.playState === "running").length), 0);
    await o.close();
  });

  console.log("on a phone");
  await test("☰ opens the list of sections below the bar (the first one not hidden), a tap goes there and closes it", async () => {
    for (const y of [0, 30, 2000]) {
      const o = await open(browser, SITE, { viewport: PHONE, touch: true });
      await o.page.evaluate(y => scrollTo(0, y), y); await o.page.waitForTimeout(300);
      await o.page.tap("#mb"); await o.page.waitForTimeout(500);
      const r = await o.page.evaluate(() => {
        const nav = document.querySelector("nav").getBoundingClientRect(), a = document.querySelector("#sheet a").getBoundingClientRect();
        return { nav: nav.bottom, first: a.top, h: a.height };
      });
      assert(r.first >= r.nav - 1 && r.h > 30, `scrolled ${y}: first item at ${r.first}, bar ends at ${r.nav}`);
      assert.strictEqual(await o.page.$eval("#mb", b => b.getAttribute("aria-expanded")), "true");
      await o.page.tap("#sheet a[href='#holidays']"); await o.page.waitForTimeout(1200);
      assert(Math.abs(await o.page.$eval("#holidays", e => e.getBoundingClientRect().top)) < 120);
      assert.strictEqual(await o.page.$eval("#mb", b => b.getAttribute("aria-expanded")), "false");
      await o.close();
    }
  });
  await test("the Install bar: hidden on the first screen, on Try it and on Install; shown elsewhere; never flickers", async () => {
    const o = await open(browser, SITE, { viewport: PHONE, touch: true, wait: 600 });
    const shown = () => o.page.$eval("#bar", b => b.classList.contains("show"));
    const want = { widgets: true, try: false, menu: true, holidays: true, timetable: true, install: false };
    assert.strictEqual(await shown(), false, "first screen");
    for (const [id, w] of Object.entries(want)) {
      await o.page.$eval("#" + id, e => scrollTo({ top: e.offsetTop + e.offsetHeight / 3, behavior: "instant" })); await o.page.waitForTimeout(500);
      const seen = [];
      for (let i = 0; i < 8; i++) { seen.push(await shown()); await o.page.mouse.wheel(0, i % 2 ? -40 : 40); await o.page.waitForTimeout(90); }
      assert(seen.every(s => s === w), `${id}: ${seen.join(" ")} (want ${w})`);
    }
    await o.close();
  });

  console.log("links that people open by hand point here");
  await test("docs and the AI's last lines: #install / #computer, not install/ (install/ only for #z= links)", async () => {
    const files = ["README.md", "ai/START.md", "CONTRIBUTING.md", "shortcut/STEPS.md", "ai/INSTRUCTIONS.md", "ai/prompt.txt", "ai/prompt-en.txt", "tools/ai/INSTRUCTIONS.template.md"];
    for (const f of files) {
      const t = fs.readFileSync(P(f), "utf8");
      const bad = [...t.matchAll(/(?:batvani\.github\.io\/school-widget\/|\{\{PAGES\}\})install\b/g)].map(m => t.slice(m.index, m.index + m[0].length + 12))
        .filter(m => !/install\/(#|")/.test(m)); // install/#z=… links and encode.py's page="…install/" are automatic
      assert.deepStrictEqual(bad, [], f);
    }
    const ins = fs.readFileSync(P("ai/INSTRUCTIONS.md"), "utf8");
    assert(ins.includes("https://batvani.github.io/school-widget/#install") && ins.includes("https://batvani.github.io/school-widget/#computer"));
    assert(fs.readFileSync(P(".github/workflows/pages.yml"), "utf8").includes("landing/"), "pages.yml publishes the landing page");
  });
  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
