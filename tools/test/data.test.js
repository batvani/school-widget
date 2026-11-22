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
  await test("the fixture's warnings: only ФВС's missing room", () => {
    const r = A.validateData(A.migrate(FIX));
    assert.deepStrictEqual([...new Set(codes(r.warnings))], ["no_room"]);
    assert(r.warnings.every(w => w.text.bg.includes("ФВС")));
    const n = A.validateData(A.migrate(Object.assign(clone(FIX), { meta: { schema: 1, noRoom: ["ФВС"] } })));
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
    err(d => d.lastDay = "30.06.2027", "last_day");
    err(d => delete d.lastDay, "no_last_day");
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
    warn(d => d.week["1"][0].room = "", "no_room");
    warn(d => delete d.week["1"][0].room, "no_room");
    warn(d => d.week["1"][0].room = "?", "question");
    warn(d => d.week["1"][0].name = "Гражданско образование и още нещо", "too_wide");
    warn(d => { d.bells.push(["14:35", "15:20"]); d.week["1"].push({ name: "ИТ", room: "1" }); }, "too_many");
    warn(d => d.lastDay = "2026-06-30", "last_day_past");
    warn(d => d.lastDay = "2028-06-30", "last_day_far");
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
  const Z = "uchilishte:z:" + b64url(zlib.deflateRawSync(Buffer.from(J), { level: 9 }));
  const Dd = "uchilishte:d:" + b64url(Buffer.from(J));
  const same = r => { assert(!r.error, JSON.stringify(r.error)); assert.deepStrictEqual(r.data, D); };
  await test("uchilishte:z:, :d:, :j:", () => { same(A.parseImport(Z)); same(A.parseImport(Dd)); same(A.parseImport("uchilishte:j:" + J)); });
  await test("links: #z=, #d=, ?data=", () => {
    same(A.parseImport("https://batvani.github.io/school-widget/install/#z=" + Z.slice(13)));
    same(A.parseImport("https://batvani.github.io/school-widget/install/#d=" + Dd.slice(13)));
    same(A.parseImport("https://open.scriptable.app/run/%D0%A3?data=" + encodeURIComponent(Z)));
    same(A.parseImport("Ето линка:\nhttps://batvani.github.io/school-widget/install/#z=" + Z.slice(13) + "\nНатисни го."));
  });
  await test("raw JSON, a ```json block, JSON inside an AI answer, the prefix inside text", () => {
    same(A.parseImport(J));
    same(A.parseImport("Готово! Ето програмата:\n```json\n" + JSON.stringify(D, null, 2) + "\n```\nКопирай я."));
    same(A.parseImport("Бележка {не е JSON} и после " + J + " край {"));
    same(A.parseImport("Копирай това: " + Z + " и натисни линка."));
  });
  await test("broken inputs give an error, never throw", () => {
    for (const bad of ["", "   ", Z.slice(0, Z.length - 40), "uchilishte:z:!!!!", "uchilishte:d:" + b64url(Buffer.from(J.slice(0, 100))),
      "uchilishte:j:{\"bells\":", J.slice(0, -1), "<!DOCTYPE html><html><body><h1>404</h1></body></html>", "[1,2,3]", "просто текст", null, undefined]) {
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
  await test("base64url and UTF-8 round trips match Node", () => {
    for (const t of ["", "a", "ab", "abc", "Училище 🎓", J]) {
      const b = [...Buffer.from(t)];
      assert.deepStrictEqual(A.utf8encode(t), b);
      assert.strictEqual(A.b64urlencode(b), b64url(Buffer.from(t)));
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
  const DATAFILE = "/docs/uchilishte/data.json", STATE = "/docs/uchilishte/state.json";
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
  await test("no data file: an own built-in DATA is adopted (widget run), no logs", async () => {
    let x;
    const r = await run(T0, "small", { src: OWN, data: null, expose: o => x = o });
    const saved = JSON.parse(r.files[DATAFILE]);
    assert.deepStrictEqual(saved, x.migrate(x.DATA));
    assert(JSON.parse(r.files[STATE]).builtinFp);
    assert.deepStrictEqual(r.logs, []);
  });
  await test("data file used; built-in DATA edited later → asked in the app, unchanged in widget runs", async () => {
    const first = await run(T0, "small", { src: OWN, data: null });
    const files = { [DATAFILE]: first.files[DATAFILE], [STATE]: first.files[STATE] };
    const ed = clone(FIX); ed.week["1"][0].room = "999";
    const edited = withData(ed);
    assert.strictEqual(FIX.week["1"][0].room, "506");
    let x;
    const w = await run(T0, "small", { src: edited, files: clone(files), expose: o => x = o });
    assert.strictEqual(x.tt().week["1"][0].room, "506");
    assert.strictEqual(x.TINFO.codeChanged, true);
    assert.deepStrictEqual(w.alerts, []);
    assert.strictEqual(w.files[DATAFILE], files[DATAFILE]);
    // in the app: "keep mine" (cancel) keeps the file and stops asking
    const keep = await run(T0, "medium", { src: edited, files: clone(files), app: true, query: { view: "today" } });
    assert.strictEqual(keep.alerts.length, 1);
    assert.strictEqual(keep.files[DATAFILE], files[DATAFILE]);
    const again = await run(T0, "medium", { src: edited, files: clone(keep.files), app: true, query: { view: "today" } });
    assert.strictEqual(again.alerts.length, 0);
    // "use it": the edited timetable is saved, the old one goes to history
    const use = await run(T0, "medium", { src: edited, files: clone(files), app: true, query: { view: "today" }, alerts: [0] });
    assert.strictEqual(JSON.parse(use.files[DATAFILE]).week["1"][0].room, "999");
    assert.strictEqual(Object.keys(use.files).filter(f => f.startsWith("/docs/uchilishte/history/")).length, 1);
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
    const files = Object.assign(clone(w.files), { "/docs/uchilishte/history/1700000000000.json": JSON.stringify(good) });
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
    const hist = Object.keys(files).filter(f => f.startsWith("/docs/uchilishte/history/"));
    assert.strictEqual(hist.length, 5);
    assert.strictEqual(JSON.parse(files["/docs/uchilishte/data.json"]).lastDay, "2027-06-16");
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

  await test("HOLIDAYS: grade-limited days off and the last day per grade", async () => {
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
    assert.strictEqual(none.tt().lastDay, FIX.lastDay);
    for (const [k, v] of Object.entries(g11.HOLIDAYS.lastDay)) assert(/^\d+(-\d+)?$/.test(k) && /^2027-\d\d-\d\d$/.test(v), k);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
