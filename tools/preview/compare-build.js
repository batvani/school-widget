// Proves the squashed release copy (tools/release.js) shows the same menu as the readable file: the real
// menu page in Chromium (live.js) is rendered from both and the screenshots are compared byte for byte
// (PNG of the full page, 375 × 812 @2x), Dark and Light, Bulgarian and English, Today at several moments,
// every tab, the editor, share, version and landing screens. Page errors must be the same (none) too.
// Usage: node tools/preview/compare-build.js [--quick]   (exit 1 on any difference)
const fs = require("fs"), path = require("path");
const live = require("./live");
const { squash } = require("../release");
const READABLE = fs.readFileSync(path.join(__dirname, "..", "..", "school-widget.js"), "utf8");
const FIX = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "sample-2027.json"), "utf8"));
const copy = o => JSON.parse(JSON.stringify(o));
const SQUASHED = squash(READABLE);
const T0 = "2026-11-05T10:20";

function screens() {
  const L = [], add = (name, opts, drive, when) => L.push({ name, opts, drive: drive || (async () => { }), when });
  const IMP = copy(FIX);
  IMP.week["1"][4] = { name: "ПП Информатика", room: "111?" };
  IMP.week["2"][4] = { name: "Английски / Немски", room: "101 / 102", groups: [{ label: "Английски", name: "Английски език", room: "101" }, { label: "Немски", name: "Немски език", room: "102" }] };
  IMP.week["3"][5] = { name: "Физическо възпитание и спорт" };
  const imp = { data: null, query: { data: "school-widget:j:" + JSON.stringify(IMP) } }, edit = { data: FIX, query: { view: "1", tab: "t2" } };
  // Today at several moments, every tab, both languages, themes in settings
  for (const lang of ["bg", "en"]) for (const th of [undefined, "light", "dark"]) for (const tab of ["t1", "t2", "t3", "t4"])
    add(`${lang} ${th || "auto"} ${tab}`, { settings: { language: lang, theme: th }, query: { view: "today", tab } });
  for (const t of ["2026-11-05T15:00", "2026-12-28T10:00", "2026-11-05T10:47", "2026-11-07T11:00", "2026-11-05T07:00", "2027-07-10T10:00", "2026-11-09T12:55"])
    for (const lang of ["bg", "en"]) { add(`today ${t} ${lang}`, { settings: { language: lang }, query: { view: "today" } }, null, t); add(`week ${t} ${lang}`, { settings: { language: lang }, query: { view: "today", tab: "t2" } }, null, t); add(`off ${t} ${lang}`, { settings: { language: lang }, query: { view: "today", tab: "t3" } }, null, t); }
  add("link colors off", { settings: { linkColors: false }, query: { view: "today" } });
  add("link outlines on", { settings: { linkOutlines: true, linkBox: "room" }, query: { view: "today" } });
  // taps in Settings (the page script), the version card
  add("settings: tap language en", { query: { view: "today", tab: "t4" } }, async (p, s) => { await p.click('#language button:nth-child(2)'); await s(); });
  add("settings: toggle", { query: { view: "today", tab: "t4" } }, async (p, s) => { await p.click('#showReason'); await s(); });
  add("settings: five taps on version", { query: { view: "today", tab: "t4" } }, async (p, s) => { for (let i = 0; i < 5; i++) await p.click("#vnum").catch(() => { }); await s(); });
  add("settings: tab clicks", { query: { view: "today" } }, async (p, s) => { for (const b of await p.$$(".tabs button")) { await b.click(); await s(); } await p.click(".tabs button:nth-child(4)"); await s(); });
  // the editor, share, landing
  add("landing (no timetable)", { data: null, query: { view: "1" } });
  add("import", imp);
  add("editor cell", imp, async (p, s) => { await p.click('[data-k="1"][data-p="4"]'); await s(); });
  add("editor groups", imp, async (p, s) => { await p.click("#sv"); await s(); });
  add("editor done", imp, async (p, s) => {
    await p.click('[data-k="1"][data-p="4"]'); await p.fill("#cr", "111"); await p.click('[data-y="ok"]'); await s();
    await p.click("#sv"); await s(); await p.click('#sh [data-g] button[data-i="0"]'); await p.click('[data-y="ok"]'); await s(300);
  });
  add("edit mode", edit, async (p, s) => { await p.click('[data-x="edit"]'); await s(); });
  add("edit subject", edit, async (p, s) => { await p.click('[data-x="edit"]'); await p.click('[data-s="Гражданско образование"]'); await s(); });
  add("share", edit, async (p, s) => { await p.click('[data-x="share"]'); await s(); });
  add("share qr", edit, async (p, s) => { await p.click('[data-x="share"]'); await p.click('#sh [data-x="qr"]'); await s(400); });
  const OLD = copy(FIX); OLD.meta.created = "2026-11-10T08:00:00.000Z";
  const NEW = copy(OLD); delete NEW.short; delete NEW.tiny; NEW.meta = { schema: 1, class: "11б", grade: 11, source: "ai" };
  NEW.week["1"][3] = { name: "Френски език", room: "506" };
  add("new year merge", { data: OLD, query: { data: "school-widget:j:" + JSON.stringify(NEW) } }, null, "2027-09-07T10:00");
  add("new year week", { data: OLD, query: { view: "1", tab: "t2" } }, null, "2027-09-07T10:00");
  return process.argv.includes("--quick") ? L.filter((_, i) => i % 5 === 0) : L;
}

(async () => {
  let bad = 0, n = 0;
  const list = screens();
  for (const scheme of ["dark", "light"]) for (const s of list) {
    const shot = async src => {
      let png = null; const errors = [];
      await live(s.when || T0, Object.assign({}, s.opts, { src }), async (page, settle) => {
        page.on("pageerror", e => errors.push(String(e.message)));
        await settle(); await s.drive(page, settle); await settle(); png = await page.screenshot({ fullPage: true });
      }, { scheme });
      return { png, errors };
    };
    const a = await shot(READABLE), b = await shot(SQUASHED);
    n++;
    const same = a.png.equals(b.png) && a.errors.join() === b.errors.join();
    if (!same) { bad++; console.log(`DIFFERENT ${scheme} ${s.name}${a.errors.join() !== b.errors.join() ? ` (errors: ${a.errors} | ${b.errors})` : ""}`); const d = path.join(__dirname, "out"); fs.mkdirSync(d, { recursive: true }); const f = `${d}/cmp-${scheme}-${s.name.replace(/\W+/g, "_")}`; fs.writeFileSync(f + "-readable.png", a.png); fs.writeFileSync(f + "-squashed.png", b.png); }
  }
  await live.close();
  console.log(`${n} screens compared (readable vs squashed), ${bad} different`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
