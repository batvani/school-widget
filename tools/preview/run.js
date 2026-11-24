// Runs ../../school-widget.js under the Scriptable mock: logic checks (reminders,
// Parameter parsing, settings round-trip) + a quick preview in out/. Usage: node run.js [en]
// The timetable: by default the user's timetable fixture (fixtures/sample.json, schema 0) is put into
// the mock's data file, so every render uses it whatever the built-in DATA is.
//   DATA_FILE=<path> node …   another timetable file (any schema)
//   DATA_FILE=builtin node …  no data file: the script uses (or adopts) its built-in DATA
// run(time, family, opts): opts.app, opts.param, opts.query, opts.settings, opts.onPresent, and
//   opts.src      another script's text instead of ../../school-widget.js
//   opts.data     the data file's content (object or text); null = no data file (overrides DATA_FILE)
//   opts.holidays the downloaded holidays.json (object or text; default holidays/list.json); null = none yet
//   opts.files    more mock files { path: text } ("/docs/…" = FileManager.local, "/icloud/…" = iCloud)
//   opts.net      url => text (or a Promise) for Request; without it every request fails (offline)
//   opts.expose   called by the script with its internals (validateData, parseImport, …) before main()
//   opts.alerts   [index, …]: what the user taps in each Alert, in order (default: cancel, -1)
//   result.calendar: the calendars read (by name; "*" = the list, to find one by its identifier)
//   result.evals: the JavaScript the script sent to its WebView (e.g. setVer(…) after a Версия button)
//   opts.readOnly [path, …]: writing these throws (iOS not letting a widget write the script)
//   opts.WebView  a WebView class instead of the mock's (live.js: a real Chromium page)
//   opts.filename the script's own path (module.filename; default /icloud/School Widget.js)
//   opts.mtime data.json's modification date (FileManager.modificationDate); opts.clipboard the clipboard's text (Pasteboard); opts.pick a file path DocumentPicker returns (none: cancelled)
//   opts.calPick  the calendar picked in iOS's calendar picker (none: cancelled); opts.name Script.name()
const fs = require("fs");
const path = require("path");
const M = require("./mock");
const SRC = fs.readFileSync(path.join(__dirname, "..", "..", "school-widget.js"), "utf8");
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "fixtures", "sample.json");
const DATA_TEXT = DATA_FILE === "builtin" ? null : fs.readFileSync(DATA_FILE, "utf8");
// the official days off as the phone keeps them after a download (opts.holidays: another text, or null = none)
const HOLIDAYS_TEXT = fs.readFileSync(path.join(__dirname, "..", "..", "holidays", "list.json"), "utf8");

// A file store shared by FileManager.local() (/docs) and FileManager.iCloud() (/icloud).
function makeFS(files, dirs, readOnly = [], mtime = null) {
  const parent = p => p.slice(0, p.lastIndexOf("/"));
  const fm = root => ({
    documentsDirectory: () => root,
    joinPath: (a, b) => a.replace(/\/$/, "") + "/" + b,
    fileExists: p => p in files || dirs.has(p),
    isDirectory: p => dirs.has(p),
    createDirectory: (p, deep) => { if (!deep && !dirs.has(parent(p))) throw new Error("no folder " + parent(p)); for (let q = p; q && q !== root; q = parent(q)) dirs.add(q); },
    listContents: p => [...Object.keys(files), ...dirs].filter(q => parent(q) === p).map(q => q.slice(p.length + 1)),
    readString: p => { if (!(p in files)) throw new Error("no file " + p); return files[p]; },
    writeString: (p, s) => { if (readOnly.includes(p)) throw new Error("not allowed to write " + p); if (!dirs.has(parent(p)) && parent(p) !== root) throw new Error("no folder " + parent(p)); files[p] = String(s); },
    copy: (a, b) => { // a file or a whole folder
      if (a in files) files[b] = files[a];
      for (const d of [...dirs]) if (d === a || d.startsWith(a + "/")) dirs.add(b + d.slice(a.length));
      for (const f of Object.keys(files)) if (f.startsWith(a + "/")) files[b + f.slice(a.length)] = files[f];
    },
    remove: p => { delete files[p]; for (const d of [...dirs]) if (d === p || d.startsWith(p + "/")) dirs.delete(d); for (const f of Object.keys(files)) if (f.startsWith(p + "/")) delete files[f]; },
    isFileStoredIniCloud: p => p.startsWith("/icloud/"),
    downloadFileFromiCloud: async () => { },
    modificationDate: p => p in files ? (mtime ? new Date(mtime) : null) : null,
    fileName: (p, ext) => { const n = p.slice(p.lastIndexOf("/") + 1); return ext ? n : n.replace(/\.[^.]*$/, ""); }
  });
  return { local: () => fm("/docs"), iCloud: () => fm("/icloud") };
}

const d = (s) => new Date(s);
const CAL = {
  "Off-School": [
    { title: "Патронен празник", startDate: d("2026-11-20T00:00"), endDate: d("2026-11-21T00:00"), isAllDay: true },
    { title: "Коледна ваканция", startDate: d("2026-12-24T00:00"), endDate: d("2027-01-03T23:59:59"), isAllDay: true }
  ],
  "Контролни": [
    { title: "Контролно по химия", startDate: d("2026-11-05T00:00"), endDate: d("2026-11-06T00:00"), isAllDay: true },
    { title: "Тест", startDate: d("2026-11-06T09:50"), endDate: d("2026-11-06T10:35"), isAllDay: false }
  ]
};

let LANG = null;
async function run(nowStr, family, opts = {}) {
  opts.settings = opts.settings || (LANG ? { language: LANG } : undefined);
  let src = SRC.replace("const TEST_NOW = null;", `const TEST_NOW = ${JSON.stringify(nowStr)};`);
  if (opts.src) src = opts.src.replace("const TEST_NOW = null;", `const TEST_NOW = ${JSON.stringify(nowStr)};`);
  let calendar = [], widget = null, logs = [], html = null, scheduled = [], alerts = [], evals = [], copied = [], opened = [], shared = [], exported = [];
  const files = Object.assign({}, opts.files || {}), dirs = new Set();
  for (const f of Object.keys(files)) for (let q = f.slice(0, f.lastIndexOf("/")); q.split("/").length > 2; q = q.slice(0, q.lastIndexOf("/"))) dirs.add(q);
  const data = "data" in opts ? opts.data : DATA_TEXT;
  if (data != null && !("/docs/school-widget/data.json" in files)) {
    dirs.add("/docs/school-widget");
    files["/docs/school-widget/data.json"] = typeof data === "string" ? data : JSON.stringify(data);
  }
  const hol = "holidays" in opts ? opts.holidays : HOLIDAYS_TEXT;
  if (hol != null && !("/docs/school-widget/holidays.json" in files)) {
    dirs.add("/docs/school-widget");
    files["/docs/school-widget/holidays.json"] = typeof hol === "string" ? hol : JSON.stringify(hol);
  }
  const taps = (opts.alerts || []).slice();
  const g = {
    ...M,
    console: { log: (...a) => logs.push(a.join(" ")), error: (...a) => logs.push("ERR " + a.join(" ")) },
    config: { runsInWidget: !opts.app, widgetFamily: family, runsInApp: !!opts.app },
    args: { widgetParameter: opts.param || null, queryParameters: opts.query || {} },
    Script: { setWidget: w => widget = w, complete: () => { }, name: () => opts.name || "School Widget" },
    URLScheme: { forRunningScript: () => "scriptable:///run/%D0%A3%D1%87%D0%B8%D0%BB%D0%B8%D1%89%D0%B5" },
    FileManager: makeFS(files, dirs, opts.readOnly, opts.mtime),
    module: { filename: opts.filename || "/icloud/School Widget.js" },
    Safari: { open: u => opened.push(u), openInApp: async u => opened.push(u) },
    __TEST__: opts.expose,
    Request: class {
      constructor(url) { this.url = url; this.method = "GET"; this.headers = {}; this.timeoutInterval = 60; }
      async loadString() {
        if (!opts.net) throw new Error("The Internet connection appears to be offline. (mock)");
        const r = await opts.net(this.url);
        if (r == null) throw new Error("404 " + this.url);
        return r;
      }
      async loadJSON() { return JSON.parse(await this.loadString()); }
    },
    Calendar: {
      forEventsByTitle: async n => { calendar.push(n); if (!CAL[n]) throw new Error("No calendar named " + n); return { title: n, identifier: "id:" + n }; },
      forEvents: async () => calendar.push("*") && Object.keys(CAL).map(n => ({ title: n, identifier: "id:" + n })),
      presentPicker: async () => { if (!opts.calPick || !CAL[opts.calPick]) throw new Error("cancelled (mock)"); return [{ title: opts.calPick, identifier: "id:" + opts.calPick }]; }
    },
    CalendarEvent: { between: async (a, b, cals) => cals.flatMap(c => CAL[c.title]).filter(e => e.startDate < b && e.endDate > a) },
    Notification: class { static async allPending() { return []; } static async removePending() { } schedule() { scheduled.push(this); } setTriggerDate(t) { this.trigger = t; } },
    WebView: opts.WebView || class { async loadHTML(h) { html = h; } async present() { if (opts.onPresent) await opts.onPresent(this); } async evaluateJavaScript(js) { evals.push(js); return null; } },
    Pasteboard: { pasteString: () => opts.clipboard == null ? null : opts.clipboard, copyString: t => copied.push(t) },
    DocumentPicker: { open: async () => { if (!opts.pick) throw new Error("cancelled (mock)"); return [opts.pick]; }, exportString: async (t, name) => { exported.push([name, t]); return [name]; } },
    ShareSheet: { present: async items => { shared.push(items); return { completed: true }; } },
    Timer: { schedule: (ms, rep, cb) => setTimeout(cb, 5) },
    Device: { screenSize: () => ({ width: 375, height: 812 }), screenScale: () => 3 }, // the user's iPhone (large widget 352 pt tall)
    Alert: class {
      constructor() { this.actions = []; }
      addAction(t) { this.actions.push(t); } addDestructiveAction(t) { this.actions.push(t); } addCancelAction(t) { this.cancel = t; } addTextField() { }
      async presentSheet() { return this.tap(); } async presentAlert() { return this.tap(); }
      tap() { const i = taps.length ? taps.shift() : -1; alerts.push({ title: this.title, message: this.message, actions: this.actions, tapped: i }); return i; }
    }
  };
  if (opts.settings) files["/docs/school-widget/settings.json"] = JSON.stringify(opts.settings);
  const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
  const fn = new AsyncFunction(...Object.keys(g), src);
  await fn(...Object.values(g));
  return { widget, logs, html, scheduled, files, alerts, evals, copied, opened, shared, exported, calendar };
}

module.exports = run;
// required by final.js / variants.js / views.js: only run()
if (require.main !== module) return;
LANG = process.argv[2] || null;
(async () => {
  fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
  const times = [
    ["2026-11-05T10:20", "Чт 10:20 — ПП Физика (контролно)"],
    ["2026-11-05T10:47", "Чт 10:47 — междучасие"],
    ["2026-11-05T07:35", "Чт 07:35 — преди училище"],
    ["2026-11-05T13:10", "Чт 13:10 — последен час"],
    ["2026-11-05T15:00", "Чт 15:00 — след часовете"],
    ["2026-11-11T12:50", "Ср 12:50 — ФВС, без стая"],
    ["2026-11-07T11:00", "Сб — уикенд"],
    ["2026-11-02T09:00", "Пн 2 ное — есенна ваканция"],
    ["2026-11-20T09:00", "Пт 20 ное — от календара"],
    ["2027-07-10T10:00", "Юли — ваканция"]
  ];
  const fams = ["small", "medium", "large", "accessoryRectangular", "accessoryCircular", "accessoryInline"];
  let out = `<html><head><meta charset="utf-8"><style>body{background:#3a4a5c;font-family:-apple-system,Arial;color:#fff;padding:20px}
  .sc{margin-bottom:28px}.sc h2{font-size:15px;margin:0 0 8px}.r{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
  .wid,.wid div{box-sizing:border-box}.wid{overflow:hidden;color:#fff;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif}
  .lock{outline:1px dashed rgba(255,255,255,.3)}</style></head><body>`;
  for (const [t, label] of times) {
    out += `<div class="sc"><h2>${label}</h2><div class="r">`;
    for (const f of fams) {
      const r = await run(t, f);
      if (!r.widget) throw new Error("no widget " + t + f);
      if (r.logs.some(l => l.startsWith("ERR"))) console.log(t, f, r.logs);
      out += M.renderWidget(r.widget, f);
      if (f === "medium") console.log(label.padEnd(30), "refresh→", r.widget.refreshAfterDate.toTimeString().slice(0, 5), r.widget.refreshAfterDate.toDateString().slice(4, 10));
    }
    out += `</div></div>`;
  }
  fs.writeFileSync(path.join(__dirname, "out", `preview-${LANG || "bg"}${process.env.MODE === "light" ? "-light" : ""}.html`), out + "</body></html>");

  // tap view
  const v = await run("2026-11-05T10:20", "medium", { app: true, query: { view: "today" } });
  fs.writeFileSync(path.join(__dirname, "out", `dayweek-${LANG || "bg"}.html`), v.html);
  // settings round-trip: page "navigates" to the save link, Scriptable stores it
  const sv = await run("2026-11-05T10:20", "medium", { app: true, query: { view: "today", tab: "t4" }, onPresent: wv => {
    const ok = wv.shouldAllowRequest({ url: "school-widget://save?d=" + encodeURIComponent(JSON.stringify({ language: "en", remindMinutes: 5, countdown: false, offCalendar: "" })) });
    console.log("intercepted save link (should be false):", ok, "| normal load allowed:", wv.shouldAllowRequest({ url: "about:blank" }));
  } });
  console.log("saved settings:", sv.files["/docs/school-widget/settings.json"]);
  console.log("reminders after save:", sv.scheduled.length, sv.scheduled[0] && sv.scheduled[0].body);
  // reminders
  const rm = await run("2026-11-05T10:20", "medium", { settings: { remindMinutes: 5 } });
  console.log("reminders scheduled:", rm.scheduled.length, rm.scheduled.slice(0, 3).map(n => `${n.trigger.toTimeString().slice(0, 5)} ${n.title} | ${n.body}`));
  // param parsing
  const pp = await run("2026-11-05T10:20", "large", { param: "Off-School; ваканция=не; контролни=не" });
  console.log("param run logs:", pp.logs);
  // the medium widget's layout key: "day" / "list" (also in Bulgarian); anything else = the default
  const shape = async param => { const w = (await run("2026-11-05T10:20", "medium", { param })).widget; return `${w.children.length} parts, padding ${w.padding.join("/")}`; };
  for (const p of ["", "layout=day", "изглед=ден", "layout=list", "вид=списък", "layout=foo"]) console.log(`layout param "${p}":`, await shape(p));
  const bad = await run("2026-11-05T10:20", "small", { param: "Липсващ" });
  console.log("missing calendar logs:", bad.logs);
})().catch(e => { console.error(e); process.exit(1); });
