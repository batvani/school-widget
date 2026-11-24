// Strict regression check: runs the script for every widget family and layout at every 10 minutes
// of a school week plus holidays (both languages, Light and Dark Mode, many Parameter entries),
// and the menu, reminders and settings round-trip; writes one hash per case of the *whole* widget
// tree (fonts, colours, sizes, ring pictures, refresh date) to <out>/tree.txt. Two versions of the
// script render the same if the files are identical. Usage: node tree.js out/snap-x (npm run tree -- out/x)
const fs = require("fs"), crypto = require("crypto");
const run = require("./run");
const dir = process.argv[2] || "out"; fs.mkdirSync(dir, { recursive: true });
const hash = x => crypto.createHash("sha256").update(typeof x === "string" ? x : JSON.stringify(x, (k, v) => v instanceof Date ? "D" + v.toISOString() : v)).digest("hex").slice(0, 16);
(async () => {
  const times = [];
  for (const day of ["2026-11-05", "2026-11-06", "2026-11-09", "2026-11-10", "2026-11-11"])
    for (let m = 6 * 60 + 30; m <= 15 * 60; m += 10) times.push(`${day}T${String(m / 60 | 0).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  times.push("2026-11-07T11:00", "2026-11-08T20:00", "2026-11-02T09:00", "2026-11-20T09:00", "2026-11-19T16:00", "2026-12-21T09:00", "2026-12-23T15:00", "2026-12-28T10:00",
    "2027-01-03T12:00", "2027-04-06T10:00", "2027-05-19T10:00", "2027-06-30T09:00", "2027-06-30T16:00", "2027-07-10T10:00", "2026-09-22T10:00", "2027-03-03T08:30");
  const params = ["box=room", "outline=on", "color=off", "box=room;outline=on", "countdown=off;reason=off", "tests=off", "tap=off", "Липсващ", "theme=dark", "theme=light"];
  const fams = ["small", "medium", "large", "accessoryRectangular", "accessoryCircular", "accessoryInline"];
  const lines = [];
  const all = async (mode, lang, t, p) => {
    process.env.MODE = mode;
    for (const fam of fams) for (const lay of (fam === "medium" ? ["", "layout=day", "layout=list"] : [""])) {
      const r = await run(t, fam, { settings: { language: lang }, param: [p, lay].filter(Boolean).join(";") });
      lines.push(`${mode} ${lang} ${t} ${p || "-"} ${fam} ${lay || "-"} ${hash([r.widget, r.logs, r.scheduled.length])}`);
    }
  };
  for (const mode of ["dark", "light"]) for (const lang of ["bg", "en"]) for (const t of times) await all(mode, lang, t, "");
  const some = times.filter((_, i) => i % 3 === 0);
  for (const p of params) for (const t of some) await all("dark", "bg", t, p);
  for (const p of ["theme=dark", "theme=light", "box=room"]) for (const t of some) await all("light", "en", t, p);
  for (const t of some) for (const m of [5, 15]) {
    const r = await run(t, "medium", { settings: { remindMinutes: m } });
    lines.push(`reminders ${t} ${m} ${hash(r.scheduled.map(x => [x.identifier, x.title, x.body, x.trigger, x.threadIdentifier]))}`);
  }
  for (const mode of ["dark", "light"]) for (const t of ["2026-11-05T10:20", "2026-11-05T15:00", "2026-12-28T10:00", "2026-11-05T10:47", "2026-11-07T11:00", "2026-11-09T10:00", "2026-11-10T12:55", "2027-07-10T10:00", "2026-11-05T07:00"])
    for (const st of [undefined, { linkColors: false }, { linkOutlines: true }, { language: "en", theme: "light" }, { theme: "dark" }]) for (const q of [{ view: "today" }, { view: "today", tab: "t3" }, { view: "today", p: "lang=en" }]) {
      process.env.MODE = mode;
      lines.push(`menu ${mode} ${t} ${JSON.stringify(st || {})} ${JSON.stringify(q)} ${hash((await run(t, "medium", { app: true, query: q, settings: st })).html)}`);
    }
  const sv = await run("2026-11-05T10:20", "medium", { app: true, query: { view: "today", tab: "t4" }, onPresent: wv =>
    wv.shouldAllowRequest({ url: "school-widget://save?d=" + encodeURIComponent(JSON.stringify({ language: "en", remindMinutes: 5, countdown: false, offCalendar: "", theme: "x", linkBox: "q", junk: 1 })) }) });
  // only the settings file: the data folder (school-widget/) isn't part of this case
  lines.push(`settings ${hash([{ "/docs/school-widget/settings.json": sv.files["/docs/school-widget/settings.json"] }, sv.scheduled.length, sv.logs])}`);
  fs.writeFileSync(`${dir}/tree.txt`, lines.join("\n") + "\n");
  console.log(`${lines.length} cases → ${dir}/tree.txt`);
})().catch(e => { console.error(e); process.exit(1); });
