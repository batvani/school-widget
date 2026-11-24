// Tests for the timetable data: validation, migration, groups, every transport format, inflate,
// the fingerprint, and adoption of a timetable typed into the code. node tools/test/data.test.js
const fs = require("fs"), path = require("path"), zlib = require("zlib"), assert = require("assert");
const run = require("../preview/run");
const ROOT = path.join(__dirname, "..", "..");
const FIX = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/preview/fixtures/sample.json"), "utf8"));
const SRC = fs.readFileSync(path.join(ROOT, "school-widget.js"), "utf8");
const T0 = "2026-11-05T10:20";
// The script with another built-in DATA (the shipped one is the demo, which is never adopted)
const withData = (d, src = SRC) => { const a = src.indexOf("const DATA = {"), b = src.indexOf("\n};\n", a);
  return src.slice(0, a) + "const DATA = " + JSON.stringify(d, null, 2) + ";" + src.slice(b + 3); };
const OWN = withData(FIX); // as if the user's timetable were typed into the code

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 3).join("\n       ")); }
}
// The script's internals, through the __TEST__ hook (a widget run, offline, with the fixture)
async function api(opts = {}) {
  let x;
  await run(opts.time || T0, "medium", Object.assign({ expose: o => x = o }, opts));
  return x;
}
const clone = o => JSON.parse(JSON.stringify(o));
const v1 = d => Object.assign({ meta: { schema: 1 } }, clone(d));
const codes = list => list.map(i => i.code);
const b64url = buf => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
// FNV-1a 64 with BigInt, as reference
function fnvRef(text) {
  let h = 0xcbf29ce484222325n;
  for (const b of Buffer.from(text.replace(/\r\n?/g, "\n"), "utf8")) { h ^= BigInt(b); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; }
  return h.toString(16).padStart(16, "0");
}

(async () => {
  const A = await api();

  console.log("validation");
  await test("the fixture, 8periods and the built-in DATA have no errors", () => {
    for (const d of [FIX, JSON.parse(fs.readFileSync(path.join(ROOT, "tools/preview/fixtures/8periods.json"), "utf8")), A.DATA]) {
      const r = A.validateData(A.migrate(d));
      assert.deepStrictEqual(r.errors, []);
    }
  });
  await test("the fixture's warnings: ФВС's missing room, and no grade", () => {
    const r = A.validateData(A.migrate(FIX));
    assert.deepStrictEqual([...new Set(codes(r.warnings))].sort(), ["no_grade", "no_room"]);
    assert(r.warnings.filter(w => w.code === "no_room").every(w => w.text.bg.includes("ФВС")));
    const n = A.validateData(A.migrate(Object.assign(clone(FIX), { meta: { schema: 1, grade: 10, noRoom: ["ФВС"] } })));
    assert.deepStrictEqual(n.warnings, []);
  });
  await test("8 periods: warning too_many (limit 7)", () => {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/preview/fixtures/8periods.json"), "utf8"));
    assert(codes(A.validateData(A.migrate(d)).warnings).includes("too_many"));
  });
  await test("every error", () => {
    const err = (mut, code) => {
      const d = v1(FIX); mut(d);
      const c = codes(A.validateData(d).errors);
      assert(c.includes(code), `${code} expected, got ${JSON.stringify(c)}`);
    };
    assert.deepStrictEqual(codes(A.validateData(null).errors), ["not_object"]);
    assert.deepStrictEqual(codes(A.validateData([1]).errors), ["not_object"]);
    err(d => delete d.meta, "schema_missing");
    err(d => d.meta.schema = 99, "schema_newer");
    err(d => d.bells = [], "bells");
    err(d => d.bells = new Array(11).fill(["08:00", "08:45"]), "bells");
    err(d => d.bells[0] = ["8:00", "08:45"], "bell_format");
    err(d => d.bells[0] = ["08:00"], "bell_format");
    err(d => d.bells[0] = ["08:50", "08:45"], "bell_order");
    err(d => d.bells[1] = ["08:40", "09:40"], "bell_overlap");
    err(d => delete d.week, "week");
    err(d => d.week["7"] = [], "week_day");
    err(d => d.week["2"] = "x", "week_day");
    err(d => d.week["1"].push({ name: "X", room: "1" }), "day_long");
    err(d => d.week = { "1": [] }, "no_days");
    err(d => d.week["1"][0] = "Математика", "cell");
    err(d => d.week["1"][0].teacher = "Иванова", "cell_key");
    err(d => delete d.week["1"][0].name, "cell_name");
    err(d => d.week["1"][0].room = 506, "cell_room");
    err(d => d.week["1"][0].important = "yes", "cell_important");
    err(d => d.week["1"][0].groups = [{ label: "А", name: "x" }], "groups");
    err(d => d.week["1"][0].groups = [{ label: "А", name: "x" }, { name: "y" }], "group");
    err(d => d.short = { a: 1 }, "map");
    err(d => d.tiny = [], "map");
    err(d => d.daysOff.push("2027-02-30"), "days_off");
    err(d => d.daysOff.push(["2027-03-05", "2027-03-01"]), "days_off");
    err(d => d.daysOff = "2027-01-01", "days_off");
    err(d => d.notOff = ["2027-13-01"], "not_off");
    err(d => d.meta.groups = { "А|Б": "1" }, "meta_groups");
    err(d => d.meta.noRoom = "ФВС", "meta_noroom");
  });
  await test("no lastDay but a grade: no error, last day from HOLIDAYS or 30 June", () => {
    const d = v1(FIX); delete d.lastDay; d.meta.grade = 10;
    assert.deepStrictEqual(A.validateData(d).errors, []);
    assert.strictEqual(A.lastDayFor(d), "2027-07-02");
  });
  await test("every warning", () => {
    const warn = (mut, code, time) => {
      const d = v1(FIX); d.meta.noRoom = ["ФВС"]; mut(d);
      const r = A.validateData(d);
      assert.deepStrictEqual(r.errors, []);
      assert(codes(r.warnings).includes(code), `${code} expected, got ${JSON.stringify(codes(r.warnings))}`);
    };
    warn(d => delete d.meta.grade, "no_grade");
    warn(d => d.week["1"][0].room = "", "no_room");
    warn(d => delete d.week["1"][0].room, "no_room");
    warn(d => d.week["1"][0].room = "?", "question");
    warn(d => d.week["1"][0].name = "Гражданско образование и още нещо", "too_wide");
    warn(d => { d.bells.push(["14:35", "15:20"]); d.week["1"].push({ name: "ИТ", room: "1" }); }, "too_many");
    warn(d => d.week["6"] = [{ name: "" }], "day_empty");
    warn(d => d.short["Математика"] = "Френски", "same_short");
    warn(d => d.week["1"][2].groups = [{ label: "Английски", name: "Английски език", room: "506" }, { label: "Немски", name: "Немски език", room: "507" }], "no_pick");
  });
  await test("messages exist in both languages", () => {
    const d = v1(FIX); d.week["1"][0].room = 506; d.bells[0] = ["x", "y"];
    for (const i of A.validateData(d).errors) assert(i.text.bg && i.text.en && i.where !== undefined);
  });
  await test("short names that fit are not warned about (every fixture name)", () => {
    const d = v1(FIX); d.meta.noRoom = ["ФВС"];
    assert(!codes(A.validateData(d).warnings).includes("too_wide"));
  });

  console.log("migration and groups");
  await test("schema 0 → 1: meta added, nothing else changed", () => {
    const m = A.migrate(FIX);
    assert.deepStrictEqual(m.meta, { schema: 1, source: "adopted" });
    const { meta, ...rest } = m;
    assert.deepStrictEqual(rest, FIX);
    assert(!("meta" in FIX), "migrate must not change its input");
  });
  await test("the grade is a whole number 1–12 or dropped (the editor's page shows it; shared files are not trusted)", () => {
    const g = x => { const d = v1(FIX); d.meta.grade = x; return A.migrate(d).meta.grade; };
    assert.strictEqual(g(11), 11); assert.strictEqual(g("11"), 11);
    for (const bad of ['<img src=x onerror="alert(1)">', 0, 13, 10.5, "", null, {}]) assert.strictEqual(g(bad), undefined, JSON.stringify(bad));
  });
  await test("schema 1 stays as it is", () => {
    const d = v1(FIX); d.meta.class = "11б";
    assert.deepStrictEqual(A.migrate(d), d);
  });
  await test("groups resolve to the pick; without a pick, the entry's own name", () => {
    const d = v1(FIX);
    d.week["1"][2] = { name: "Английски език", room: "506", groups: [
      { label: "Английски", name: "Английски език", room: "506" }, { label: "Немски", name: "Немски език", room: "507", important: true }] };
    assert.deepStrictEqual(A.resolveGroups(d).week["1"][2], { name: "Английски език", room: "506" });
    d.meta.groups = { "Английски|Немски": 1 };
    assert.deepStrictEqual(A.resolveGroups(d).week["1"][2], { name: "Немски език", room: "507", important: true });
    assert(Array.isArray(d.week["1"][2].groups), "resolveGroups must not change its input");
    d.meta.groups = { "Английски|Немски": 0 };
    assert.deepStrictEqual(A.resolveGroups(d).week["1"][2], { name: "Английски език", room: "506" });
  });

  console.log("transport");
  const D = v1(FIX), J = JSON.stringify(D);
  const Z = "school-widget:z:" + b64url(zlib.deflateRawSync(Buffer.from(J), { level: 9 }));
  const Dd = "school-widget:d:" + b64url(Buffer.from(J));
  const same = r => { assert(!r.error, JSON.stringify(r.error)); assert.deepStrictEqual(r.data, D); };
  await test("school-widget:z:, :d:, :j:", () => { same(A.parseImport(Z)); same(A.parseImport(Dd)); same(A.parseImport("school-widget:j:" + J));
    same(A.parseImport("uchilishte:j:" + J)); same(A.parseImport("uchilishte:z:" + Z.slice(16))); }); // from before 1.8.5
  await test("links: #z=, #d=, ?data=", () => {
    same(A.parseImport("https://batvani.github.io/school-widget/install/#z=" + Z.slice(16)));
    same(A.parseImport("https://batvani.github.io/school-widget/install/#d=" + Dd.slice(16)));
    same(A.parseImport("https://open.scriptable.app/run/%D0%A3?data=" + encodeURIComponent(Z)));
    same(A.parseImport("Ето линка:\nhttps://batvani.github.io/school-widget/install/#z=" + Z.slice(16) + "\nНатисни го."));
  });
  await test("raw JSON, a ```json block, JSON inside an AI answer, the prefix inside text", () => {
    same(A.parseImport(J));
    same(A.parseImport("Готово! Ето програмата:\n```json\n" + JSON.stringify(D, null, 2) + "\n```\nКопирай я."));
    same(A.parseImport("Бележка {не е JSON} и после " + J + " край {"));
    same(A.parseImport("Копирай това: " + Z + " и натисни линка."));
  });
  await test("broken inputs give an error, never throw", () => {
    for (const bad of ["", "   ", Z.slice(0, Z.length - 40), "school-widget:z:!!!!", "school-widget:d:" + b64url(Buffer.from(J.slice(0, 100))),
      "school-widget:j:{\"bells\":", J.slice(0, -1), "<!DOCTYPE html><html><body><h1>404</h1></body></html>", "[1,2,3]", "просто текст", null, undefined]) {
      const r = A.parseImport(bad);
      assert(r.error && r.error.bg && r.error.en && !r.data, "should fail: " + String(bad).slice(0, 40));
    }
  });

  console.log("inflate, base64, UTF-8, fingerprint");
  await test("inflate matches zlib (stored, fixed, dynamic; many sizes)", () => {
    const texts = ["", "a", "абв", J, J.repeat(5), "x".repeat(70000), Array.from({ length: 3000 }, (_, i) => String.fromCharCode(32 + (i * 7919) % 1100)).join("")];
    for (const t of texts) for (const o of [{ level: 0 }, { level: 1 }, { level: 9 }, { strategy: zlib.constants.Z_FIXED }, { strategy: zlib.constants.Z_HUFFMAN_ONLY }]) {
      const out = A.inflateRaw([...zlib.deflateRawSync(Buffer.from(t), o)]);
      assert.strictEqual(A.utf8decode(out), t);
    }
  });
  await test("inflate rejects truncated and garbage data", () => {
    const z = [...zlib.deflateRawSync(Buffer.from(J))];
    assert.throws(() => A.inflateRaw(z.slice(0, z.length >> 1)));
    assert.throws(() => A.inflateRaw([0xff, 0xff, 0xff]));
  });
  await test("base64 and UTF-8 round trips match Node", () => {
    for (const t of ["", "a", "ab", "abc", "Училище 🎓", J]) {
      const b = [...Buffer.from(t)];
      assert.deepStrictEqual(A.utf8encode(t), b);
      assert.deepStrictEqual(A.b64decode(b64url(Buffer.from(t))), b);
      assert.deepStrictEqual(A.b64decode(Buffer.from(t).toString("base64")), b);
    }
  });
  await test("fingerprint = FNV-1a 64 (BigInt reference), \\r\\n normalised", () => {
    for (const t of ["", "a", "foobar", "Училище\r\nред", SRC]) assert.strictEqual(A.fingerprint(t), fnvRef(t));
    assert.strictEqual(A.fingerprint(""), "cbf29ce484222325");
    assert.strictEqual(A.fingerprint("a"), "af63dc4c8601ec8c");
    assert.strictEqual(A.fingerprint("x\r\ny"), A.fingerprint("x\ny"));
  });

  console.log("loading and adoption");
  const DATAFILE = "/docs/school-widget/data.json", STATE = "/docs/school-widget/state.json";
  await test("the demo DATA (shipped) is shown but never adopted, and never asks", async () => {
    let x;
    assert.strictEqual(A.DATA.meta.demo, true);
    const r = await run(T0, "small", { data: null, expose: o => x = o });
    assert.strictEqual(r.files[DATAFILE], undefined);
    assert.strictEqual(x.TINFO.source, "builtin");
    assert.deepStrictEqual(r.logs, []);
    const app = await run(T0, "medium", { data: null, app: true, query: { view: "today" } });
    assert.deepStrictEqual(app.alerts, []);
    assert.deepStrictEqual(A.validateData(A.migrate(A.DATA)).errors, []);
  });
  await test("no data file: the built-in DATA is never saved, even one that isn't a demo; no questions", async () => {
    let x;
    const r = await run(T0, "small", { src: OWN, data: null, expose: o => x = o });
    assert.strictEqual(r.files[DATAFILE], undefined);
    assert.strictEqual(x.TINFO.source, "builtin");
    assert.deepStrictEqual(r.logs, []);
    const app = await run(T0, "medium", { src: OWN, data: null, app: true, query: { view: "today" } });
    assert.deepStrictEqual(app.alerts, []);
  });
  await test("broken data file: falls back to the built-in DATA, logs once, the app offers Възстанови", async () => {
    let x;
    const w = await run(T0, "small", { src: OWN, data: "{ broken", expose: o => x = o });
    assert.strictEqual(x.TINFO.source, "broken");
    assert.strictEqual(x.tt().week["1"][0].name, "Френски език");
    assert.strictEqual(w.logs.length, 1);
    const w2 = await run(T0, "small", { src: OWN, files: clone(w.files) });
    assert.strictEqual(w2.logs.length, 0, "logged only once");
    assert(w2.widget);
    // with a good timetable in history/: the app restores it
    const good = v1(FIX); good.week["1"][0].room = "777";
    const files = Object.assign(clone(w.files), { "/docs/school-widget/history/1700000000000.json": JSON.stringify(good) });
    const app = await run(T0, "medium", { src: OWN, files, app: true, query: { view: "today" }, alerts: [0] });
    assert.strictEqual(app.alerts.length, 1);
    assert.strictEqual(app.alerts[0].actions[0], "Възстанови");
    assert.strictEqual(JSON.parse(app.files[DATAFILE]).week["1"][0].room, "777");
    // an invalid (but parseable) file counts as broken too
    let y;
    await run(T0, "small", { data: JSON.stringify({ meta: { schema: 1 }, bells: [] }), expose: o => y = o });
    assert.strictEqual(y.TINFO.source, "broken");
  });
  await test("a timetable from a newer schema is not used", async () => {
    let x;
    await run(T0, "small", { data: JSON.stringify(Object.assign(v1(FIX), { meta: { schema: 2 } })), expose: o => x = o });
    assert.strictEqual(x.TINFO.source, "broken");
  });
  await test("history keeps the last 5", async () => {
    // saveTimetable runs inside the script's mock files; each run returns them
    let files = (await run(T0, "small", {})).files;
    for (let i = 0; i < 7; i++) {
      files = (await run(T0, "small", { files, expose: o => o.saveTimetable(Object.assign(v1(FIX), { lastDay: `2027-06-${10 + i}` })) })).files;
      await new Promise(r => setTimeout(r, 2)); // distinct Date.now() names
    }
    const hist = Object.keys(files).filter(f => f.startsWith("/docs/school-widget/history/"));
    assert.strictEqual(hist.length, 5);
    assert.strictEqual(JSON.parse(files["/docs/school-widget/data.json"]).lastDay, "2027-06-16");
  });
  await test("days off: HOLIDAYS + the timetable's daysOff − notOff", async () => {
    let x;
    const d = v1(FIX); d.daysOff = [["2026-11-20", "Патронен празник"]]; d.notOff = ["2026-09-22"];
    await run(T0, "small", { data: d, expose: o => x = o });
    // OFF is filled by main(), after the hook: look at it after the run
    assert.strictEqual(x.OFF.get("2026-11-20"), "Патронен празник");
    assert(!x.OFF.has("2026-09-22"));
    assert.strictEqual(x.OFF.get("2026-12-28"), "Коледна ваканция");
  });

  await test("holidays.json: grade-limited days off and the last day per grade", async () => {
    const off = async grade => { let x; const d = v1(FIX); delete d.daysOff; if (grade) { delete d.lastDay; d.meta.grade = grade; } // no grade: its own lastDay (one is needed)
      await run(T0, "small", { data: d, expose: o => x = o }); return x; };
    const g11 = await off(11), g12 = await off(12), none = await off(0);
    assert.strictEqual(g11.OFF.get("2027-04-05"), "Пролетна ваканция");
    assert.strictEqual(g11.OFF.get("2027-05-05"), "Великденска ваканция");
    assert.strictEqual(g11.OFF.get("2027-04-30"), "Великденска ваканция");
    assert(!g12.OFF.has("2027-04-05") && !g12.OFF.has("2027-05-05"), "12th grade: school days");
    assert.strictEqual(g12.OFF.get("2027-04-08"), "Пролетна ваканция");
    assert.strictEqual(g12.OFF.get("2027-04-30"), "Велики петък");
    assert.strictEqual(none.OFF.get("2027-05-05"), "Великденска ваканция", "no grade: counts");
    assert.strictEqual(g11.tt().lastDay, "2027-07-02");
    assert.strictEqual(g12.tt().lastDay, "2027-05-13");
    assert.strictEqual(none.tt().lastDay, "2027-06-30", "no grade: 30 June");
    for (const [k, v] of Object.entries(g11.hol().lastDay)) assert(/^\d+(-\d+)?$/.test(k) && /^2027-\d\d-\d\d$/.test(v), k);
  });

  await test("holidays.json: city days only for that city; exam entries are days off like before", async () => {
    const H = JSON.parse(fs.readFileSync(path.join(ROOT, "holidays/list.json"), "utf8"));
    H.years[0].daysOff.unshift(["2026-11-10", "Грипна ваканция", { city: "Варна" }]);
    const off = async settings => { let x; await run(T0, "small", { holidays: H, settings, expose: o => x = o }); return x.OFF; };
    assert.strictEqual((await off({ city: "Варна" })).get("2026-11-10"), "Грипна ваканция");
    assert(!(await off({ city: "Бургас" })).has("2026-11-10"));
    assert(!(await off(undefined)).has("2026-11-10"), "no city: no city days");
    assert.strictEqual((await off(undefined)).get("2027-06-18"), "НВО по БЕЛ");
  });
  await test("holidays.json: none yet → no official days off, 30 June; downloaded in the app and kept", async () => {
    let x; const d = v1(FIX); delete d.lastDay; delete d.daysOff; d.meta.grade = 10;
    await run(T0, "small", { data: d, holidays: null, expose: o => x = o });
    assert(!x.OFF.has("2027-01-31")); // (Коледна ваканция is also in the mock's Off-School calendar)
    assert.strictEqual(x.tt().lastDay, "2027-06-30");
    assert.strictEqual(x.hol().missing, "none");
    const LIST = fs.readFileSync(path.join(ROOT, "holidays/list.json"), "utf8"), asked = [];
    const r = await run(T0, "small", { data: d, holidays: null, expose: o => x = o, net: u => { asked.push(u); return /holidays\.json$/.test(u) ? LIST : null; } });
    assert(asked.includes("https://batvani.github.io/school-widget/holidays.json"));
    assert.strictEqual(x.OFF.get("2027-01-31"), "Междусрочна ваканция", "a widget with none downloads them first");
    assert.strictEqual(x.tt().lastDay, "2027-07-02");
    assert.deepStrictEqual(JSON.parse(r.files["/docs/school-widget/holidays.json"]), JSON.parse(LIST));
    // a fresh copy: a widget doesn't ask again; a broken download never replaces it
    const st = JSON.stringify({ holChecked: new Date(T0).toISOString() });
    asked.length = 0;
    await run(T0, "small", { data: d, files: { "/docs/school-widget/state.json": st }, net: u => { asked.push(u); return null; } });
    assert(!asked.some(u => /holidays/.test(u)));
    const r2 = await run("2026-11-07T10:20", "small", { data: d, app: true, files: { "/docs/school-widget/state.json": st }, net: u => /holidays/.test(u) ? "{\"years\":5}" : null });
    assert.deepStrictEqual(JSON.parse(r2.files["/docs/school-widget/holidays.json"]), JSON.parse(LIST));
  });
  await test("Почивни → Добави ваканциите в календара си: the calendar page with the grade, the city, English", async () => {
    const d = v1(FIX); d.meta.grade = 8;
    const r = await run(T0, "medium", { app: true, data: d, query: { view: "today", tab: "t3" }, settings: { city: "Варна", language: "en" },
      onPresent: async wv => { wv.shouldAllowRequest({ url: "school-widget://data?a=cal" }); await new Promise(r => setTimeout(r, 50)); } });
    assert(/data-x="cal"/.test(r.html));
    assert.deepStrictEqual(r.opened, ["https://batvani.github.io/school-widget/calendar/?grade=8&city=%D0%92%D0%B0%D1%80%D0%BD%D0%B0&lang=en"]);
  });
  await test("1.8.5: an install with the old Bulgarian file names is copied to school-widget/ (the old files stay, for a rollback)", async () => {
    const old = { "/docs/uchilishte/data.json": JSON.stringify(FIX), "/docs/uchilishte-settings.json": JSON.stringify({ language: "en", offCalendarId: "" }),
      "/docs/uchilishte/state.json": JSON.stringify({ backups: ["/docs/uchilishte/backups/1.8.0.js.txt"] }), "/docs/uchilishte/backups/1.8.0.js.txt": "// 1.8.0", "/docs/uchilishte/history/1.json": "{}" };
    const r = await run(T0, "medium", { data: null, holidays: null, files: old });
    for (const f of ["data.json", "backups/1.8.0.js.txt", "history/1.json"]) assert.strictEqual(r.files["/docs/school-widget/" + f], old["/docs/uchilishte/" + f], f);
    assert.strictEqual(JSON.parse(r.files["/docs/school-widget/settings.json"]).language, "en");
    assert.deepStrictEqual(JSON.parse(r.files["/docs/school-widget/state.json"]).backups, ["/docs/school-widget/backups/1.8.0.js.txt"]);
    for (const f of Object.keys(old)) assert.strictEqual(r.files[f], old[f], "kept: " + f);
    assert(r.widget, "the widget renders from the copied timetable");
  });
  await test("a new install: no calendar is read, no update check, the setup page (not the menu); the name is checked", async () => {
    const urls = [];
    const w = await run(T0, "medium", { data: null, net: u => { urls.push(u); return null; } });
    assert.deepStrictEqual(w.calendar, []);
    assert.deepStrictEqual(urls.filter(u => !/holidays\.json/.test(u)), [], "no update check before the first timetable");
    assert.strictEqual(JSON.parse(w.files["/docs/school-widget/settings.json"] || "{}").offCalendar, undefined, "no settings written for a new install");
    const app = await run(T0, "medium", { data: null, app: true, name: "Uchilishte" });
    assert(/data-x="blank"/.test(app.html) && /data-x="paste"/.test(app.html), "the setup card");
    assert.strictEqual(app.alerts.length, 0, "no menu");
    assert(/class="note2">Скриптът се казва „Uchilishte“/.test(app.html));
    assert(!/class="note2">Скриптът се казва/.test((await run(T0, "medium", { data: null, app: true, name: "School Widget" })).html));
  });
  await test("an install from before 1.8.5 (a timetable, no settings): its Off-School and Контролни calendars stay", async () => {
    const w = await run(T0, "medium", {});
    const st = JSON.parse(w.files["/docs/school-widget/settings.json"]);
    assert.deepStrictEqual([st.offCalendar, st.testsCalendar], ["Off-School", "Контролни"]);
    assert.deepStrictEqual(w.calendar, ["Off-School", "Контролни"]);
  });
  await test("Settings → a calendar: iOS's picker, saved by identifier (found even if renamed); another / none", async () => {
    const tap = u => async wv => { wv.shouldAllowRequest({ url: u }); await new Promise(r => setTimeout(r, 50)); };
    const r = await run(T0, "medium", { app: true, query: { view: "today", tab: "t4" }, settings: { language: "bg", offCalendarId: "" }, calPick: "Контролни", onPresent: tap("school-widget://cal?k=testsCalendar") });
    const st = JSON.parse(r.files["/docs/school-widget/settings.json"]);
    assert.deepStrictEqual([st.testsCalendar, st.testsCalendarId], ["Контролни", "id:Контролни"]);
    assert(r.evals.some(e => e === 'setCal("testsCalendar","Контролни","id:Контролни")'), r.evals.join(" | "));
    // read by identifier: the saved name no longer matches
    const w = await run(T0, "medium", { settings: { offCalendarId: "", testsCalendar: "Old name", testsCalendarId: "id:Контролни" } });
    assert.deepStrictEqual(w.calendar, ["*"]);
    // a settings file from before 1.8.5 without calendar names: the old defaults
    assert.deepStrictEqual((await run(T0, "medium", { settings: { language: "bg" } })).calendar, ["Off-School", "Контролни"]);
    assert(!w.logs.some(l => /not found/.test(l)), w.logs.join("\n"));
    // one is set: the sheet first (1 = no calendar)
    const off = await run(T0, "medium", { app: true, query: { view: "today", tab: "t4" }, settings: { offCalendarId: "", testsCalendar: "Контролни", testsCalendarId: "id:Контролни" }, alerts: [1], onPresent: tap("school-widget://cal?k=testsCalendar") });
    const st2 = JSON.parse(off.files["/docs/school-widget/settings.json"]);
    assert.deepStrictEqual([st2.testsCalendar, st2.testsCalendarId], ["", ""]);
    // a Parameter's calendar=… is by name, whatever was picked
    const p = await run(T0, "medium", { param: "calendar=Off-School", settings: { offCalendar: "X", offCalendarId: "id:X", testsCalendar: "", testsCalendarId: "" } });
    assert.deepStrictEqual(p.calendar, ["Off-School"]);
  });
  await test("a timetable on the clipboard at the first start: offered; yes → the import editor, no → the setup page", async () => {
    const clip = "school-widget:j:" + JSON.stringify(v1(FIX));
    const yes = await run(T0, "medium", { data: null, app: true, clipboard: clip, alerts: [0] });
    assert(/Програма в клипборда/.test(yes.alerts[0].title) && /"mode":"import"/.test(yes.html));
    const no = await run(T0, "medium", { data: null, app: true, clipboard: clip, alerts: [-1] });
    assert(/data-x="blank"/.test(no.html));
    const junk = await run(T0, "medium", { data: null, app: true, clipboard: "здрасти" });
    assert.strictEqual(junk.alerts.length, 0, "anything else on the clipboard: nothing asked");
  });
  await test("the city picker in Settings: the cities in holidays.json", async () => {
    const h = JSON.parse(fs.readFileSync(path.join(ROOT, "holidays/list.json"), "utf8"));
    h.years[0].daysOff.unshift(["2026-11-05", "Грипна ваканция", { city: "Варна" }]);
    const r = await run(T0, "medium", { app: true, holidays: h, query: { view: "today", tab: "t4" }, settings: { city: "Варна" } });
    assert(/<select id="city"><option value="">Не е избран<\/option>.*<option value="Варна">/.test(r.html));
  });
  await test("Направи я с AI: the full prompt from the website (BG / EN); offline the short one with the link", async () => {
    const tap = async wv => { wv.shouldAllowRequest({ url: "school-widget://data?a=prompt" }); await new Promise(r => setTimeout(r, 50)); };
    const full = { "https://batvani.github.io/school-widget/ai/prompt.txt": "Здравей!\n\n---\n\nSchool Widget instructions v1 …", "https://batvani.github.io/school-widget/ai/prompt-en.txt": "Hi!\n\n---\n\nSchool Widget instructions v1 …" };
    for (const lang of ["bg", "en"]) {
      const r = await run(T0, "medium", { data: null, app: true, settings: { language: lang }, net: u => full[u] || null, onPresent: tap });
      assert.deepStrictEqual(r.copied, [full["https://batvani.github.io/school-widget/ai/" + (lang === "en" ? "prompt-en.txt" : "prompt.txt")]], lang);
    }
    const off = await run(T0, "medium", { data: null, app: true, onPresent: tap });
    assert(off.copied[0].includes("https://batvani.github.io/school-widget/ai/INSTRUCTIONS.md"));
  });
  await test("holidays.json: a school year that isn't published yet", async () => {
    let x; await run("2027-09-20T10:20", "small", { expose: o => x = o });
    assert.strictEqual(x.hol().missing, "year");
    assert.strictEqual(x.hol().schoolYear, "2027-28");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
