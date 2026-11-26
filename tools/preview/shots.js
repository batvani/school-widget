// Screenshots of the full-screen pages, 375 × 812, Dark and Light Mode, into out/<set>-*.png and one
// overview sheet out/<set>-all.png per set. From the mock and Chromium: the phone is the real test.
//   editor   the timetable editor (import, a cell, groups, edit, a subject, done), live (live.js)
//   share    sharing and the new school year (Програма, Сподели, QR, a shared import, merge, grade), live
//   version  Settings → Версия in each update state
//   install  the landing page (phone, desktop) and install/ with a cut-off link, served as Pages would
//   readme   the README's picture img/widgets.png: every widget size, the built-in demo, during a class
//   hero     the README's pictures from the landing page (made-up demo, Dark Mode): img/hero.png (the iPhone) and img/tile-*.png
// Usage: node tools/preview/shots.js [editor|share|version|install|readme|hero …]   (none: all of them)
const fs = require("fs"), path = require("path"), zlib = require("zlib"), { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const run = require("./run"), live = require("./live");
const ROOT = path.join(__dirname, "../.."), OUT = path.join(__dirname, "out");
const FIX = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/sample-2027.json"), "utf8"));
const copy = x => JSON.parse(JSON.stringify(x)), T0 = "2026-11-05T10:20";
const imgData = f => "data:image/png;base64," + fs.readFileSync(f).toString("base64");

// one sheet: the screens side by side, Dark on top, Light below
async function sheet(b, set, shots) {
  const n = Math.max(...["dark", "light"].map(s => shots.filter(x => x[1] === s).length));
  const row = s => `<div style="display:flex;gap:12px;align-items:flex-start">${shots.filter(x => x[1] === s).map(x => `<figure style="margin:0"><img src="${imgData(x[2])}" width="375"><figcaption style="font:14px sans-serif;color:#ddd">${x[0]}</figcaption></figure>`).join("")}</div>`;
  const page = await b.newPage({ viewport: { width: n * 387 + 12, height: 1000 } });
  await page.setContent(`<body style="margin:12px;background:#555">${row("dark")}<br>${row("light")}</body>`);
  await page.screenshot({ path: path.join(OUT, `${set}-all.png`), fullPage: true });
  await page.close();
  console.log(`${set}: ${shots.length} → out/${set}-*.png, out/${set}-all.png`);
}
// screens of the real script behind a Chromium page: [name, run options, what to tap, time, full page]
async function liveSet(b, set, screens) {
  const shots = [];
  for (const scheme of ["dark", "light"]) for (const [name, opts, drive, when, full] of screens) {
    const f = path.join(OUT, `${set}-${name}-${scheme}.png`);
    await live(when || T0, copy(opts), async (page, settle) => { await settle(); await drive(page, settle); await page.screenshot({ path: f, fullPage: !!full }); }, { scheme });
    shots.push([name, scheme, f]);
  }
  await sheet(b, set, shots);
}

const SETS = {
  async editor(b) {
    // an imported timetable with things to look at: an unsure room, a split class, a long name
    const IMP = copy(FIX);
    IMP.week["1"][4] = { name: "ПП Информатика", room: "111?" };
    IMP.week["2"][4] = { name: "Английски / Немски", room: "101 / 102", groups: [{ label: "Английски", name: "Английски език", room: "101" }, { label: "Немски", name: "Немски език", room: "102" }] };
    IMP.week["3"][5] = { name: "Физическо възпитание и спорт" };
    const imp = { data: null, query: { data: "school-widget:j:" + JSON.stringify(IMP) } }, edit = { data: FIX, query: { view: "1", tab: "t2" } };
    await liveSet(b, "editor", [
      ["1-welcome", { data: null, query: { view: "1" } }, async () => { }],
      ["2-import", imp, async () => { }],
      ["3-cell", imp, async (p, settle) => { await p.click('[data-k="1"][data-p="4"]'); await settle(); }],
      ["4-groups", imp, async (p, settle) => { await p.click("#sv"); await settle(); }],
      ["5-edit", edit, async (p, settle) => { await p.click('[data-x="edit"]'); await settle(); }, null, true],
      ["6-subject", edit, async (p, settle) => { await p.click('[data-x="edit"]'); await p.click('[data-s="Гражданско образование"]'); await settle(); }],
      ["7-done", imp, async (p, settle) => {
        await p.click('[data-k="1"][data-p="4"]'); await p.fill("#cr", "111"); await p.click('[data-y="ok"]'); await settle();
        await p.click('[data-k="3"][data-p="5"]'); await p.fill("#cn", "ФВС"); await p.click('[data-y="ok"]'); await settle();
        await p.click("#sv"); await settle(); await p.click('#sh [data-g] button[data-i="0"]'); await p.click('[data-y="ok"]'); await settle(300);
      }]
    ]);
  },
  async share(b) {
    // the person's own timetable (imported Nov 2026) and the AI's answer next September: photo names, two classes swapped
    const OLD = copy(FIX); OLD.meta.created = "2026-11-10T08:00:00.000Z";
    const NEW = copy(OLD); delete NEW.short; delete NEW.tiny; NEW.meta = { schema: 1, class: "11б", grade: 11, source: "ai" };
    Object.values(NEW.week).forEach(d => d.forEach(e => { delete e.important; }));
    NEW.week["1"][3] = { name: "Френски език", room: "506" }; NEW.week["3"][0] = { name: "Френски език", room: "712" };
    const w = NEW.week["3"]; [w[0], w[1]] = [w[1], w[0]];
    const SH = copy(OLD); delete SH.meta.created; SH.meta.source = "shared"; Object.values(SH.week).forEach(d => d.forEach(e => { delete e.important; }));
    SH.week["2"][4] = { name: "Английски / Немски", room: "101 / 102", groups: [{ label: "Английски", name: "Английски език", room: "101" }, { label: "Немски", name: "Немски език", room: "102" }] };
    const SEPT = "2027-09-07T10:00", prog = { data: OLD, query: { view: "1", tab: "t2" } }, merge = { data: OLD, query: { data: "school-widget:j:" + JSON.stringify(NEW) } };
    await liveSet(b, "share", [
      ["1-program", prog, async () => { }, SEPT],
      ["2-share", prog, async (p, settle) => { await p.click('[data-x="share"]'); await settle(); }],
      ["3-qr", prog, async (p, settle) => { await p.click('[data-x="share"]'); await p.click('#sh [data-x="qr"]'); await settle(400); }],
      ["4-shared", { data: null, query: { data: "school-widget:j:" + JSON.stringify(SH) } }, async (p, settle) => { await p.click("#sv"); await settle(); }],
      ["5-merge", merge, async () => { }, SEPT, true],
      ["6-grade", merge, async (p, settle) => { await p.click('[data-x="drop"]'); await p.click("#sv"); await settle(); }, SEPT]
    ]);
  },
  async version(b) {
    const SRC = fs.readFileSync(path.join(ROOT, "school-widget.js"), "utf8"), VER = SRC.match(/\nconst VERSION = "([^"]+)";/)[1];
    const as = v => SRC.replace(`\nconst VERSION = "${VER}";`, `\nconst VERSION = "${v}";`);
    const CHECK = "2026-11-05T08:20:00.000Z", bk = [{ version: "1.4.7", file: "backups/1.4.7.js" }];
    const notes = { bg: "Големият уиджет показва и почивката. Поправена е стаята на ФВС.", en: "The large widget also shows the break. ФВС's room is fixed." };
    const st = (o, ch = "stable") => Object.assign({ lastCheck: CHECK, checkedChannel: ch, backups: bk }, o);
    const STATES = {
      "1-up-to-date": { st: st({ latest: VER }) },
      "2-update-available": { st: st({ latest: "9.0.0", notes }), set: { autoUpdate: false } },
      "3-just-updated": { src: as("9.0.0"), st: st({ latest: "9.0.0", notes, justUpdated: "9.0.0" }) },
      "4-paused-edited": { st: st({ latest: "9.0.0", notes, autoPaused: "edited" }) },
      "5-beta": { st: st({ latest: VER }, "beta"), set: { channel: "beta" } },
      "6-back-to-stable": { src: as("9.0.0"), st: st({ latest: VER }) }
    };
    const shots = [];
    for (const [name, c] of Object.entries(STATES)) {
      const files = { "/docs/school-widget/state.json": JSON.stringify(c.st), "/docs/school-widget/settings.json": JSON.stringify(Object.assign({ language: "bg" }, c.set)) };
      const r = await run(T0, "medium", { src: c.src, files, app: true, query: { view: "today", tab: "t4" } });
      for (const scheme of ["dark", "light"]) {
        const page = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, colorScheme: scheme });
        await page.setContent(r.html);
        await page.evaluate(() => { const h = document.getElementById("verh"); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 70); });
        const f = path.join(OUT, `version-${name}-${scheme}.png`);
        await page.screenshot({ path: f }); shots.push([name, scheme, f]); await page.close();
      }
    }
    await sheet(b, "version", shots);
  },
  async install(b) {
    // the landing page (phone + desktop) and install/ with a broken link, served as Pages would (tools/test/site.js)
    const { SITE, open } = require("../test/site");
    const hash = "z=" + zlib.deflateRawSync(Buffer.from(JSON.stringify(FIX), "utf8"), { level: 9 }).toString("base64url");
    const pages = [["1-landing-phone", SITE, { width: 375, height: 812 }, true], ["2-landing-desktop", SITE, { width: 1280, height: 800 }, true],
      ["3-install-broken", SITE + "install/#" + hash.slice(0, 40), { width: 375, height: 812 }, false]];
    const shots = [];
    for (const scheme of ["dark", "light"]) for (const [n, url, viewport, needsLanding] of pages) {
      if (needsLanding && !fs.existsSync(path.join(ROOT, "landing/index.html"))) { console.log(`install: ${n} skipped (no landing/index.html yet)`); continue; }
      const o = await open(b, url, { viewport, colorScheme: scheme, wait: 600 });
      const f = path.join(OUT, `install-${n}-${scheme}.png`);
      await o.page.screenshot({ path: f, fullPage: false }); shots.push([n, scheme, f]); await o.close();
    }
    if (shots.length) await sheet(b, "install", shots);
  },
  async hero(b) {
    // the landing page served as Pages would (tools/test/site.js), its pieces cut out at 2×; the demo timetable is made up
    const { SITE, open } = require("../test/site");
    // the wallpaper gradient makes big PNGs: the iPhone at 1.5× (under 300 kB), the small pictures at 1×
    const parts = [["hero", "#top .phone", 1.5], ["tile-widgets", "#tryStage", 1], ["tile-menu", "#menu .phone", 1], ["tile-calendar", ".cal", 1], ["tile-timetable", ".ways .way", 1]];
    for (const scale of [1.5, 1]) {
      const o = await open(b, SITE, { viewport: { width: 1280, height: 900 }, colorScheme: "dark", reducedMotion: "reduce", scale, wait: 1500 });
      for (const [n, sel] of parts.filter(x => x[2] === scale)) {
        const el = await o.page.$(sel);
        await el.scrollIntoViewIfNeeded(); await o.page.waitForTimeout(400);
        const f = path.join(ROOT, `img/${n}.png`);
        await el.screenshot({ path: f, omitBackground: n === "hero" });
        console.log(`hero: img/${n}.png ${(fs.statSync(f).size / 1024).toFixed(0)} kB`);
      }
      await o.close();
    }
  },
  async readme() {
    // the built-in demo, scenario 0 of check.js (during a class), Dark Mode
    const env = Object.assign({}, process.env, { DATA_FILE: "builtin" });
    for (const f of ["final.js", "check.js"]) execFileSync("node", [f, "bg"], { cwd: __dirname, env, stdio: "ignore" });
    fs.copyFileSync(path.join(OUT, "bg-dark-scenario-0.png"), path.join(ROOT, "img/widgets.png"));
    console.log("readme: img/widgets.png (rerun node tools/preview/check.js bg for your own timetable's PNGs)");
  }
};

(async () => {
  const want = process.argv.slice(2), bad = want.filter(n => !SETS[n]);
  if (bad.length) throw new Error(`unknown: ${bad.join(", ")} (one of ${Object.keys(SETS).join(", ")})`);
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  for (const n of want.length ? want : Object.keys(SETS)) await SETS[n](b);
  await b.close(); await live.close();
})().catch(e => { console.error(e); process.exit(1); });
