// Tests for the self-update from GitHub releases, with a fake network (run.js opts.net).
// Plain node: node tools/test/update.test.js
const fs = require("fs"), path = require("path"), assert = require("assert");
const run = require("../preview/run");
const ROOT = path.join(__dirname, "..", "..");
const SRC = fs.readFileSync(path.join(ROOT, "school-widget.js"), "utf8");
const VER = SRC.match(/\nconst VERSION = "([^"]+)";/)[1];
// releases newer than this one: V(k) raises the patch number by k; BETA is the next minor's first beta
const V = k => VER.replace(/^(\d+\.\d+\.)(\d+).*$/, (_, a, b) => a + (+b + k));
const BETA = VER.replace(/^(\d+)\.(\d+)\..*$/, (_, a, b) => `${a}.${+b + 1}.0-beta.1`);
const OWN = "/icloud/School Widget.js", STATE = "/docs/school-widget/state.json", DATAF = "/docs/school-widget/data.json", SETF = "/docs/school-widget/settings.json";
const DAY1 = "2026-11-05T10:20", DAY2 = "2026-11-06T10:20";
const GH = "https://github.com/batvani/school-widget/releases/", API = "https://api.github.com/repos/batvani/school-widget/releases?per_page=10";
const LATEST = GH + "latest/download/version.json", rel = (v, f) => `${GH}download/v${v}/${f}`;

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 4).join("\n       ")); }
}
// FNV-1a 64 over UTF-8 with \n line endings, and the size, as tools/release.js computes them
function fp(text) {
  let h = 0xcbf29ce484222325n;
  for (const b of Buffer.from(text.replace(/\r\n?/g, "\n"), "utf8")) { h ^= BigInt(b); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; }
  return h.toString(16).padStart(16, "0");
}
const size = text => Buffer.byteLength(text.replace(/\r\n?/g, "\n"), "utf8");
// a release of this script with another version number
const make = (v, edit = s => s) => edit(SRC.replace(`// Version ${VER} —`, `// Version ${v} —`).replace(`\nconst VERSION = "${VER}";`, `\nconst VERSION = "${v}";`));
const vjson = (v, code, history = []) => JSON.stringify({ version: v, schema: 1, file: "school-widget.js", fingerprint: fp(code), size: size(code),
  notes: { bg: "ново", en: "new" }, history: history.map(([hv, hc]) => ({ version: hv, fingerprint: fp(hc), tag: "v" + hv })) });
// a fake GitHub: { "stable/version.json": text, "stable/school-widget.js": text, "beta/…": … }. Stable is the
// latest release, beta a newer pre-release; each version.json's history (vjson's third argument) are
// older releases, whose own version.json is there too (the script looks up its own). Counts requests.
function net(map) {
  const rels = {}; // version → { "version.json": text, "school-widget.js": text }, pre
  for (const ch of ["stable", "beta"]) {
    const j = map[ch + "/version.json"]; if (j == null) continue;
    let v; try { v = JSON.parse(j); } catch (e) { continue; }
    if (typeof v.version !== "string") continue;
    rels[v.version] = { "version.json": j, "school-widget.js": map[ch + "/school-widget.js"], pre: ch === "beta" };
    for (const h of v.history || []) if (!rels[h.version]) rels[h.version] = { "version.json": JSON.stringify({ version: h.version, fingerprint: h.fingerprint }), pre: false };
  }
  const n = url => {
    if (/\/holidays\.json$/.test(url)) return null; // the daily holidays download (data.test), not part of updating
    n.calls.push(url);
    if (url === LATEST) return map["stable/version.json"] == null ? null : map["stable/version.json"];
    if (url === API) return JSON.stringify(Object.entries(rels).map(([v, r]) => ({ tag_name: "v" + v, prerelease: r.pre, draft: false })));
    const m = url.match(/\/releases\/download\/v([^/]+)\/(.+)$/);
    return m && rels[m[1]] && rels[m[1]][m[2]] != null ? rels[m[1]][m[2]] : null;
  };
  n.calls = [];
  return n;
}
const base = () => ({ [OWN]: SRC, [SETF]: JSON.stringify({ language: "bg", remindMinutes: 0 }) });
const state = r => JSON.parse(r.files[STATE] || "{}");
const h = x => JSON.stringify(x, (k, v) => v instanceof Date ? "D" + v.toISOString() : v);

(async () => {
  const NEW = make(`${V(1)}`), OLDREL = [[VER, SRC]];

  console.log("versions");
  await test("cmpVersion: semver with pre-releases", async () => {
    let A; await run(DAY1, "small", { expose: o => A = o });
    const order = ["1.4.9", "1.5.0-beta.1", "1.5.0-beta.2", "1.5.0-beta.10", "1.5.0-rc.1", "1.5.0", "1.5.1", "1.10.0", "2.0.0"];
    for (let i = 0; i < order.length; i++) for (let j = 0; j < order.length; j++)
      assert.strictEqual(A.cmpVersion(order[i], order[j]), Math.sign(i - j), `${order[i]} vs ${order[j]}`);
    assert.strictEqual(A.codeSize("а\r\nb"), 4);
  });

  console.log("check and install");
  await test("no update: nothing installed, nothing logged, the same widget", async () => {
    const n = net({ "stable/version.json": vjson(VER, SRC) });
    const off = await run(DAY1, "medium", { files: base() });
    const r = await run(DAY1, "medium", { files: base(), net: n });
    assert.strictEqual(r.files[OWN], SRC);
    assert.deepStrictEqual(r.logs, []);
    assert.strictEqual(h(r.widget), h(off.widget));
    assert.strictEqual(state(r).latest, VER);
    assert(!state(r).autoPaused);
    assert.deepStrictEqual(n.calls, [LATEST]);
  });
  await test("at most once a day; again the next day", async () => {
    const n = net({ "stable/version.json": vjson(VER, SRC) });
    const r1 = await run(DAY1, "small", { files: base(), net: n });
    const r2 = await run("2026-11-05T15:00", "small", { files: r1.files, net: n });
    assert.strictEqual(n.calls.length, 1);
    await run(DAY2, "small", { files: r2.files, net: n });
    assert.strictEqual(n.calls.length, 2);
  });
  let installed;
  await test("update installed by a widget run; timetable and settings untouched", async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const before = await run(DAY1, "medium", { files: base() });
    const r = await run(DAY1, "medium", { files: base(), net: n });
    assert.strictEqual(r.files[OWN], NEW);
    assert.strictEqual(r.files[`/docs/school-widget/backups/${VER}.js.txt`], SRC);
    assert.strictEqual(r.files[DATAF], before.files[DATAF]);
    assert.strictEqual(r.files[SETF], before.files[SETF]);
    assert.strictEqual(h(r.widget), h(before.widget), "the widget of this run is the same");
    const st = state(r);
    assert.deepStrictEqual(st.pendingVerify, { version: `${V(1)}`, backup: `/docs/school-widget/backups/${VER}.js.txt`, from: VER });
    assert.strictEqual(st.justUpdated, `${V(1)}`);
    assert.deepStrictEqual(r.logs, []);
    installed = r.files;
  });
  await test("the new version's first good run confirms it", async () => {
    const r = await run(DAY1, "small", { src: NEW, files: installed });
    assert.strictEqual(state(r).pendingVerify, null);
    assert.strictEqual(r.files[OWN], NEW);
  });
  await test("auto-update off: checks, doesn't install; Обнови (manual) installs", async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const files = Object.assign(base(), { [SETF]: JSON.stringify({ autoUpdate: false }) });
    let A;
    const r = await run(DAY1, "small", { files, net: n, expose: o => A = o });
    assert.strictEqual(r.files[OWN], SRC);
    assert.strictEqual(state(r).latest, `${V(1)}`);
    assert.deepStrictEqual(await A.installUpdate({ manual: true }), { ok: true, version: `${V(1)}` });
    assert.strictEqual(r.files[OWN], NEW);
  });
  await test("in the app: checked and installed before the menu opens", async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const r = await run(DAY1, "medium", { files: base(), net: n, app: true, query: { view: "today" } });
    assert.strictEqual(r.files[OWN], NEW);
    assert(r.html);
  });

  console.log("refused");
  await test("a hand-edited file pauses auto-update; Обнови все пак resumes", async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const files = Object.assign(base(), { [OWN]: SRC + "\n// my change\n" });
    let A;
    const r = await run(DAY1, "small", { files, net: n, expose: o => A = o });
    assert.strictEqual(state(r).autoPaused, "edited");
    assert.strictEqual(r.files[OWN], SRC + "\n// my change\n");
    await A.resumeUpdates();
    assert.strictEqual(state(r).autoPaused, false);
    // the next day's check doesn't pause it again, and it installs
    const r2 = await run(DAY2, "small", { files: r.files, net: n });
    assert.strictEqual(r2.files[OWN], NEW);
  });
  await test("this file's own release is looked up once per version: released → not paused; not released → paused; offline → unchanged", async () => {
    const files = () => Object.assign(base(), { [SETF]: JSON.stringify({ language: "bg", remindMinutes: 0, autoUpdate: false }) });
    // released: V(1) is out, this version's own release says this file's fingerprint
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const r1 = await run(DAY1, "small", { files: files(), net: n });
    assert(!state(r1).autoPaused);
    assert.deepStrictEqual(state(r1).ownRelease, { version: VER, fingerprint: fp(SRC) });
    assert(n.calls.includes(rel(VER, "version.json")));
    n.calls.length = 0;
    await run(DAY2, "small", { files: r1.files, net: n });
    assert.deepStrictEqual(n.calls, [LATEST], "the second day: only latest (own release remembered)");
    // not released (a copy from the PC): its version has no release → paused as edited
    const r2 = await run(DAY1, "small", { files: files(), net: net({ "stable/version.json": vjson(`${V(1)}`, NEW), "stable/school-widget.js": NEW }) });
    assert.strictEqual(state(r2).autoPaused, "edited");
    // the own lookup fails without a 404 (offline halfway): nothing decided
    const flaky = url => { flaky.calls.push(url); if (url === LATEST) return vjson(`${V(1)}`, NEW); throw new Error("The network connection was lost."); };
    flaky.calls = [];
    const r3 = await run(DAY1, "small", { files: files(), net: flaky });
    assert(!state(r3).autoPaused);
    assert(!state(r3).ownRelease);
  });
  await test("bad size, bad fingerprint, a syntax error, an HTML page, a wrong version, no id line: refused", async () => {
    const BROKEN = make(`${V(1)}`, s => s.replace("async function main() {", "async function main() { (("));
    const cases = {
      "wrong size": [Object.assign(JSON.parse(vjson(`${V(1)}`, NEW, OLDREL)), { size: 5 }), NEW],
      "wrong fingerprint": [Object.assign(JSON.parse(vjson(`${V(1)}`, NEW, OLDREL)), { fingerprint: "0000000000000000" }), NEW],
      "does not compile": [JSON.parse(vjson(`${V(1)}`, BROKEN, OLDREL)), BROKEN],
      "no id line": [JSON.parse(vjson(`${V(1)}`, NEW, OLDREL)), "<!DOCTYPE html><html><body>404: Not Found</body></html>"],
      "wrong version": [JSON.parse(vjson(`${V(1)}`, make(`${V(2)}`), OLDREL)), make(`${V(2)}`)],
      "no id line ": [JSON.parse(vjson(`${V(1)}`, NEW.replace("// id: uchilishte-widget; schema: 1\n", "\n"), OLDREL)), NEW.replace("// id: uchilishte-widget; schema: 1\n", "\n")]
    };
    for (const [reason, [vj, code]] of Object.entries(cases)) {
      let A;
      const n = net({ "stable/version.json": JSON.stringify(vj), "stable/school-widget.js": code });
      const r = await run(DAY1, "small", { files: base(), net: n, expose: o => A = o });
      assert.strictEqual(r.files[OWN], SRC, reason);
      assert.strictEqual(state(r).pendingVerify, undefined, reason);
      assert.strictEqual((await A.installUpdate({ manual: true })).reason, reason.trim());
      assert.deepStrictEqual(r.logs, [], reason);
    }
  });

  console.log("rollback");
  await test("a new version that fails on its first run goes back by itself; that version is skipped", async () => {
    const BAD = make(`${V(1)}`, s => s.replace("\n  loadTimetable();\n  if (!config.runsInWidget)", "\n  loadTimetable(); throw new Error(\"boom\");\n  if (!config.runsInWidget)"));
    const n = net({ "stable/version.json": vjson(`${V(1)}`, BAD, OLDREL), "stable/school-widget.js": BAD });
    const r1 = await run(DAY1, "small", { files: base(), net: n });
    assert.strictEqual(r1.files[OWN], BAD);
    const r2 = await run(DAY1, "small", { src: BAD, files: r1.files });
    assert.strictEqual(r2.files[OWN], SRC, "back to the backup");
    const st = state(r2);
    assert.deepStrictEqual(st.badVersions, [`${V(1)}`]);
    assert.strictEqual(st.pendingVerify, null);
    assert.strictEqual(st.rolledBack.from, `${V(1)}`);
    assert(r2.logs.some(l => l.includes("went back to " + VER)));
    assert(r2.widget, "the error widget this once");
    // the old version runs again and doesn't reinstall the release VER+1, not even the next day
    const r3 = await run(DAY2, "small", { files: r2.files, net: n });
    assert.strictEqual(r3.files[OWN], SRC);
    // a fixed the release VER+2 installs
    const FIX = make(`${V(2)}`);
    const n2 = net({ "stable/version.json": vjson(`${V(2)}`, FIX, [...OLDREL, [`${V(1)}`, BAD]]), "stable/school-widget.js": FIX });
    const r4 = await run("2026-11-07T10:20", "small", { files: r3.files, net: n2 });
    assert.strictEqual(r4.files[OWN], FIX);
  });
  await test("Предишна версия: back to the backup, paused until a newer release", async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const r1 = await run(DAY1, "small", { files: base(), net: n });
    let A;
    const r2 = await run(DAY1, "medium", { src: NEW, files: r1.files, app: true, query: { view: "today" }, expose: o => A = o });
    assert.deepStrictEqual(await A.previousVersion(), { ok: true, version: VER });
    assert.strictEqual(r2.files[OWN], SRC);
    assert.strictEqual(state(r2).autoPaused, "rollback");
    const r3 = await run(DAY2, "small", { files: r2.files, net: n });
    assert.strictEqual(r3.files[OWN], SRC, `doesn't jump straight back to ${V(1)}`);
    const N2 = make(`${V(2)}`);
    const r4 = await run("2026-11-07T10:20", "small", { files: r3.files, net: net({ "stable/version.json": vjson(`${V(2)}`, N2, [...OLDREL, [`${V(1)}`, NEW]]), "stable/school-widget.js": N2 }) });
    assert.strictEqual(r4.files[OWN], N2);
  });
  await test("backups: the last 3", async () => {
    let files = base(), code = SRC;
    const hist = [[VER, SRC]]; // every release so far, as version.json keeps them
    for (const [i, v] of [`${V(1)}`, `${V(2)}`, `${V(3)}`, `${V(4)}`, `${V(5)}`].entries()) {
      const next = make(v);
      const r = await run(`2026-11-${String(10 + i * 2).padStart(2, "0")}T10:20`, "small", { src: code, files, net: net({ "stable/version.json": vjson(v, next, hist), "stable/school-widget.js": next }) });
      assert.strictEqual(r.files[OWN], next, v);
      files = r.files; code = next; hist.push([v, next]);
    }
    const b = Object.keys(files).filter(f => f.startsWith("/docs/school-widget/backups/")).sort();
    assert.deepStrictEqual(b, [`${V(2)}`, `${V(3)}`, `${V(4)}`].map(v => `/docs/school-widget/backups/${v}.js.txt`).sort()); // sorted as text: 1.8.10 before 1.8.8
  });

  console.log("widget runs that can't write, channels, offline");
  await test("a widget run that can't write the script: pendingInstall, done at the next app run", async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const r1 = await run(DAY1, "small", { files: base(), net: n, readOnly: [OWN] });
    assert.strictEqual(r1.files[OWN], SRC);
    assert.strictEqual(state(r1).pendingInstall, `${V(1)}`);
    assert.deepStrictEqual(r1.logs, []);
    const r2 = await run(DAY1, "medium", { files: r1.files, net: n, app: true, query: { view: "today" } });
    assert.strictEqual(r2.files[OWN], NEW);
    assert.strictEqual(state(r2).pendingInstall, false);
  });
  await test("beta ↔ stable: beta reads the beta branch; back to stable offers the older version only on request", async () => {
    const B = make(`${BETA}`);
    const n = net({ "stable/version.json": vjson(VER, SRC), "beta/version.json": vjson(`${BETA}`, B, OLDREL), "beta/school-widget.js": B, "stable/school-widget.js": SRC });
    const files = Object.assign(base(), { [SETF]: JSON.stringify({ channel: "beta" }) });
    const r1 = await run(DAY1, "small", { files, net: n });
    assert.strictEqual(r1.files[OWN], B);
    assert(n.calls.includes(API) && !n.calls.includes(LATEST), "beta reads the releases list, never latest");
    assert(n.calls.includes(rel(BETA, "school-widget.js")));
    let A;
    const r2 = await run(DAY1, "medium", { src: B, files: r1.files, net: n, app: true, query: { view: "today" }, expose: o => A = o });
    const sw = await A.switchChannel("stable");
    assert.deepStrictEqual(sw, { channel: "stable", latest: VER, back: true });
    assert.strictEqual(JSON.parse(r2.files[SETF]).channel, "stable");
    assert.strictEqual((await A.installUpdate()).reason, "not newer", "no downgrade by itself");
    assert.strictEqual(r2.files[OWN], B);
    assert.deepStrictEqual(await A.installUpdate({ downgrade: true }), { ok: true, version: VER });
    assert.strictEqual(r2.files[OWN], SRC);
  });
  await test("offline is silent: no logs, no settings writes, the same widget and refresh date", async () => {
    const r0 = await run(DAY1, "large", { files: base() });
    const r = await run(DAY1, "large", { files: base(), net: () => { throw new Error("offline"); } });
    assert.deepStrictEqual(r.logs, []);
    assert.strictEqual(r.files[SETF], base()[SETF]);
    assert.strictEqual(h(r.widget), h(r0.widget));
    assert.strictEqual(state(r).lastCheck, undefined, "an offline check doesn't count as the day's check");
  });

  console.log("Settings → Версия and the menu");
  // taps the card's buttons in order (the page navigates to school-widget://update?a=…); returns the run
  const tap = (acts, o = {}) => run(DAY1, "medium", Object.assign({ app: true, query: { view: "today", tab: "t4" },
    onPresent: async wv => { for (const [a, v] of acts) wv.shouldAllowRequest({ url: `school-widget://update?a=${a}${v ? "&v=" + v : ""}` }); } }, o))
    .then(r => Object.assign(r, { evals: r.evals.filter(js => js.startsWith("setVer(")) })); // only the card redraws
  const card = js => JSON.parse(js.slice("setVer(".length, -1));
  await test("the card offline: the version, never checked, the switch; no channel, no Предишна версия", async () => {
    const r = await run(DAY1, "medium", { files: base(), app: true, query: { view: "today", tab: "t4" } });
    assert(r.html.includes('id="vnum">' + VER + "<"));
    assert(r.html.includes("Още не е проверявано"));
    assert(r.html.includes('id="autoUpdate"'));
    assert(r.html.includes('<div id="chan" hidden>'));
    assert(!r.html.includes('data-a="previous"'));
  });
  await test(`Провери сега → Налична е ${V(1)} + what's new + Обнови; Обнови installs; a second tap says restart`, async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const files = Object.assign(base(), { [SETF]: JSON.stringify({ autoUpdate: false }) });
    const r = await tap([["check"], ["install"], ["install"]], { files, net: n });
    assert.strictEqual(r.evals.length, 3);
    const [c1, c2, c3] = r.evals.map(card);
    assert(c1.includes(`Налична е ${V(1)}`) && c1.includes('data-a="install"') && c1.includes("ново"), c1);
    assert(c2.includes(`инсталирана е ${V(1)}`), c2);
    assert(c3.includes("Кодът вече е сменен"), c3);
    assert.strictEqual(r.files[OWN], NEW);
    assert(c2.includes('data-a="previous"'), "a backup now exists");
  });
  await test("offline: Провери сега says so", async () => {
    const r = await tap([["check"]], { files: base() });
    assert(card(r.evals[0]).includes("Няма връзка с GitHub"));
  });
  await test(`after the update: \"Обновено до ${V(1)}\" once (card and menu), then gone`, async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const r1 = await run(DAY1, "small", { files: base(), net: n });
    const m = await run(DAY1, "medium", { src: NEW, files: r1.files, app: true });
    assert(m.alerts[0].message.includes(`Обновено до ${V(1)}`), m.alerts[0].message);
    const r2 = await run(DAY1, "medium", { src: NEW, files: m.files, app: true, query: { view: "today", tab: "t4" } });
    assert(r2.html.includes(`Обновено до ${V(1)}`));
    assert.strictEqual(state(r2).justUpdated, null, "cleared after it was shown");
    const r3 = await run(DAY1, "medium", { src: NEW, files: r2.files, app: true, query: { view: "today", tab: "t4" } });
    assert(!r3.html.includes("Обновено до"));
  });
  await test("hand-edited: the paused message and Обнови все пак (installs)", async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const files = Object.assign(base(), { [OWN]: SRC + "\n// mine\n" });
    const r1 = await run(DAY1, "small", { files, net: n });
    const r = await tap([["force"]], { files: r1.files, net: n });
    assert(r.html.includes("променян ръчно") && r.html.includes('data-a="force"'));
    assert.strictEqual(r.files[OWN], NEW);
  });
  await test("Предишна версия from the card; the channel: beta and back, with Върни се към … (stable)", async () => {
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const r1 = await run(DAY1, "small", { files: base(), net: n });
    const r2 = await tap([["previous"]], { src: NEW, files: r1.files });
    assert(card(r2.evals[0]).includes("Върната е " + VER));
    assert.strictEqual(r2.files[OWN], SRC);
    const B = make(`${BETA}`);
    const n2 = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "beta/version.json": vjson(`${BETA}`, B, OLDREL), "beta/school-widget.js": B, "stable/school-widget.js": NEW });
    const r3 = await tap([["channel", "beta"]], { src: B, files: Object.assign(base(), { [OWN]: B }), net: n2 });
    assert.strictEqual(JSON.parse(r3.files[SETF]).channel, "beta");
    assert(card(r3.evals[0]).includes("Канал: beta") && card(r3.evals[0]).includes('<div id="chan">'));
    const r4 = await tap([["channel", "stable"], ["downgrade"]], { src: B, files: r3.files, net: n2 });
    const c = card(r4.evals[0]);
    assert(c.includes(`Върни се към ${V(1)} (stable)`) && c.includes("по-нова от stable"), c);
    assert.strictEqual(r4.files[OWN], NEW);
  });
  await test("Parameter update=off / channel=beta; settings keep only stable or beta", async () => {
    let A;
    const n = net({ "stable/version.json": vjson(`${V(1)}`, NEW, OLDREL), "stable/school-widget.js": NEW });
    const r = await run(DAY1, "small", { files: base(), net: n, param: "update=off" });
    assert.strictEqual(r.files[OWN], SRC);
    const b = await run(DAY1, "small", { files: base(), net: net({}), param: "channel=beta" });
    assert(b.files[STATE] === undefined || !state(b).lastCheck);
    const sv = await run(DAY1, "medium", { files: base(), app: true, query: { view: "today", tab: "t4" }, onPresent: wv =>
      wv.shouldAllowRequest({ url: "school-widget://save?d=" + encodeURIComponent(JSON.stringify({ channel: "nightly", autoUpdate: 0 })) }) });
    const saved = JSON.parse(sv.files[SETF]);
    assert.strictEqual(saved.channel, "stable");
    assert.strictEqual(saved.autoUpdate, false);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
