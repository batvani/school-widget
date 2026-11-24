// Tests for sharing and a new school year: the real menu page in Chromium with the
// real script behind it (tools/preview/live.js). Share: the link (read back with parseImport), the QR
// code (read back with jsQR when it is there: JSQR=<path to jsQR.js>, or tools/preview/node_modules/jsqr),
// the file; a shared import; the new-school-year card; the merge with the old timetable.
// node tools/test/share.test.js
const fs = require("fs"), path = require("path"), assert = require("assert");
const live = require("../preview/live");
const FIX = JSON.parse(fs.readFileSync(path.join(__dirname, "../preview/fixtures/sample-2027.json"), "utf8"));
const T = "2026-11-05T10:20", DATA = "/docs/school-widget/data.json", STATE = "/docs/school-widget/state.json";
const clone = o => JSON.parse(JSON.stringify(o));
const saved = r => JSON.parse(r.files[DATA]);
const text = (p, sel) => p.$eval(sel, e => e.textContent);
const JSQR = [process.env.JSQR, path.join(__dirname, "../preview/node_modules/jsqr/dist/jsQR.js")].find(f => f && fs.existsSync(f));

// the person's own timetable: the user's, plus a split class with "Немски" picked, imported in Nov 2026
const OLD = clone(FIX);
OLD.week["2"][4] = { name: "Английски / Немски", room: "101 / 102", groups: [{ label: "Английски", name: "Английски език", room: "101" }, { label: "Немски", name: "Немски език", room: "102", important: true }] };
Object.assign(OLD.meta, { groups: { "Английски|Немски": 1 }, created: "2026-11-10T08:00:00.000Z", source: "ai" });
OLD.daysOff = [["2026-12-08", "Патронен празник"]];
// what classmates should get
const SHARED = clone(OLD);
delete SHARED.meta.groups; delete SHARED.meta.created; SHARED.meta.source = "shared";
Object.values(SHARED.week).forEach(d => d.forEach(e => { delete e.important; (e.groups || []).forEach(g => { delete g.important; }); }));

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 5).join("\n       ")); }
}
const program = { view: "1", tab: "t2" };

(async () => {
  let A;
  console.log("share");
  await test("the tab is called Програма; Сподели → Изпрати линк: the share sheet gets the install link with both groups, no picks, no important classes", async () => {
    let tab, what;
    const r = await live(T, { data: OLD, query: program, expose: o => A = o }, async (page, settle) => {
      await settle();
      tab = await text(page, '.tabs [data-t="t2"]');
      await page.click('[data-x="share"]'); await settle();
      what = await text(page, "#sh .shw");
      await page.click('#sh [data-x="link"]'); await settle(300);
    });
    assert.strictEqual(tab, "Програма");
    assert(what.includes("И двете групи") && what.includes("✕ Твоите важни"), what);
    assert.strictEqual(r.shared.length, 1);
    const [u] = r.shared[0];
    assert(u.startsWith("https://batvani.github.io/school-widget/install/#z="), u.slice(0, 80));
    assert.deepStrictEqual(A.parseImport(u).data, SHARED);
    assert(!u.includes("important") && A.parseImport(u).data.week["2"][4].groups.length === 2);
    console.log(`       link: ${u.length} characters`);
  });
  await test("Покажи QR код: a QR code of the same link" + (JSQR ? " (read back with jsQR)" : " (jsQR not found: only drawn, not read back)"), async () => {
    let got = null, svg = false, link = null;
    const r = await live(T, { data: OLD, query: program }, async (page, settle) => {
      await settle();
      await page.click('[data-x="share"]'); await page.click('#sh [data-x="link"]'); await settle(300); // the link to compare with
      await page.click('#sh .btns [data-y="no"]'); // Затвори
      await page.click('[data-x="share"]'); await page.click('#sh [data-x="qr"]'); await settle(300);
      svg = !!(await page.$("#sh svg.qr"));
      if (JSQR) {
        // jsQR has a typo for version 23 (alignment 74; the standard says 78)
        await page.addScriptTag({ content: fs.readFileSync(JSQR, "utf8").replace("[6, 30, 54, 74, 102]", "[6, 30, 54, 78, 102]") });
        got = await page.evaluate(async () => {
          const s = document.querySelector("#sh svg.qr"), n = s.viewBox.baseVal.width, k = 4, img = new Image();
          const x = s.outerHTML.replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" width="${n * k}" height="${n * k}" `);
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(x))); await img.decode();
          const c = document.createElement("canvas"); c.width = c.height = n * k; const g = c.getContext("2d"); g.drawImage(img, 0, 0);
          const q = jsQR(g.getImageData(0, 0, n * k, n * k).data, n * k, n * k); return q && q.data;
        });
      }
    });
    link = r.shared[0][0];
    assert(svg, "the QR code is drawn");
    if (JSQR) assert.strictEqual(got, link);
  });
  await test("Запази като файл: <class>-timetable.json with the shared timetable", async () => {
    const r = await live(T, { data: OLD, query: program }, async (page, settle) => {
      await settle(); await page.click('[data-x="share"]'); await page.click('#sh [data-x="export"]'); await settle(300);
    });
    assert.strictEqual(r.exported.length, 1);
    assert.strictEqual(r.exported[0][0], "11б-timetable.json");
    assert.deepStrictEqual(JSON.parse(r.exported[0][1]), SHARED);
  });
  await test("the demo has nothing to share", async () => {
    let n;
    await live(T, { data: null, query: program }, async (page, settle) => { await settle(); n = (await page.$$('[data-x="share"]')).length; });
    assert.strictEqual(n, 0);
  });
  await test("a classmate imports the shared link: the note, then the group step; their important classes start empty", async () => {
    let note, step;
    const u = await (async () => { let x; await live(T, { data: OLD, query: program }, async (page, settle) => { await settle(); await page.click('[data-x="share"]'); await page.click('#sh [data-x="link"]'); await settle(300); }).then(r => { x = r.shared[0][0]; }); return x; })();
    const r = await live(T, { data: null, query: { data: "school-widget:z:" + u.split("#z=")[1] } }, async (page, settle) => {
      await settle();
      note = await text(page, "#ed .note2");
      await page.click("#sv"); await settle();
      step = await text(page, "#sh h2");
      await page.click('#sh [data-g] button[data-i="0"]'); await page.click('[data-y="ok"]'); await settle(300);
    });
    assert(note.startsWith("Споделена програма. Провери си групите."), note);
    assert.strictEqual(step, "Коя група си?");
    const d = saved(r);
    assert.deepStrictEqual(d.meta.groups, { "Английски|Немски": 0 });
    assert(!JSON.stringify(d.week).includes("important"));
    assert.strictEqual(d.meta.source, "shared");
  });

  console.log("a new school year");
  await test("the card is on Програма from 1 September (not on 31 August); Не сега hides it for this school year", async () => {
    const card = async (t, files) => { let n, r; r = await live(t, { data: OLD, files, query: program }, async (page, settle) => { await settle(); n = await page.$$eval("#t2 .wc .wt1", l => l.map(e => e.textContent)); }); return [n, r]; };
    assert.deepStrictEqual((await card("2027-08-31T10:00"))[0], []);
    assert.deepStrictEqual((await card("2027-09-01T10:00"))[0], ["Нова учебна година"]);
    const r = await live("2027-09-01T10:00", { data: OLD, query: program }, async (page, settle) => { await settle(); await page.click('#t2 .wc [data-x="later"]'); await settle(300); });
    assert.strictEqual(JSON.parse(r.files[STATE]).newYearLater, 2027);
    assert.deepStrictEqual((await card("2027-09-02T10:00", { [STATE]: r.files[STATE] }))[0], []);
    assert.deepStrictEqual((await card("2028-09-01T10:00", { [STATE]: r.files[STATE] }))[0], ["Нова учебна година"], "again the next year");
  });
  await test("Копирай промпта с моите имена: the start prompt, then the names (short, very short, no room) and the group", async () => {
    const r = await live("2027-09-01T10:00", { data: OLD, query: program }, async (page, settle) => { await settle(); await page.click('#t2 .wc [data-x="names"]'); await settle(300); });
    const c = r.copied[0];
    assert(c.startsWith("Здравей! Искам да настроя уиджета"), c.slice(0, 60));
    assert(c.includes("ai/INSTRUCTIONS.md"));
    for (const x of ["Моите имена от досегашната програма", "- Френски език: кратко „Френски“", "- ФВС: без стая", "- Френската", "Моята група: Немски (от „Английски / Немски“)"]) assert(c.includes(x), x + "\n" + c);
  });
  await test("the new timetable: changes outlined and listed, names / important / group kept, a missing nickname placed, В кой клас си сега? → grade 12", async () => {
    // the AI's answer in September: no short names, no important classes, the photo's names, two classes swapped,
    // the split's groups in the other order
    const NEW = clone(OLD);
    delete NEW.short; delete NEW.tiny; delete NEW.icons; delete NEW.daysOff;
    NEW.meta = { schema: 1, class: "11б", grade: 11, source: "ai" };
    Object.values(NEW.week).forEach(d => d.forEach(e => { delete e.important; (e.groups || []).forEach(g => { delete g.important; }); }));
    NEW.week["1"][3] = { name: "Френски език", room: "506" }; NEW.week["3"][0] = { name: "Френски език", room: "712" }; // the nickname „Френската“ before
    // (Ср 1 and Ср 2 are swapped below, so the class that was „Френската“ on Wednesday is now Ср 2)
    NEW.week["2"][4].groups.reverse();
    const a = NEW.week["3"][0], b = NEW.week["3"][1]; NEW.week["3"][0] = b; NEW.week["3"][1] = a;
    let seen = {};
    const r = await live("2027-09-07T10:00", { data: OLD, query: { data: "school-widget:j:" + JSON.stringify(NEW) } }, async (page, settle) => {
      await settle();
      seen.blue = await page.$$eval("#ed .cell.n", l => l.map(e => e.dataset.k + "," + e.dataset.p));
      seen.list = await page.$$eval("#ed .chg p", l => l.map(e => e.textContent));
      seen.gone = await text(page, "#ed p.note2");
      await page.click('#ed [data-x="pick"]'); await settle();
      await page.click('#ed [data-k="1"][data-p="3"]'); await settle();
      await page.click('#ed [data-k="3"][data-p="1"]'); await settle();
      await page.click('#ed [data-x="pickDone"]'); await settle();
      seen.goneAfter = (await page.$$("#ed p.note2 [data-x=pick]")).length;
      await page.click("#sv"); await settle();
      seen.step = await text(page, "#sh h2");
      seen.grade = await text(page, "#gv");
      seen.hol = await text(page, "#sh .note2");
      await page.click('#sh [data-z="1"]'); seen.max = await text(page, "#gv"); // 12 is the most
      await page.click('#sh [data-z="-1"]'); await page.click('#sh [data-z="1"]'); // 11, then 12 again
      await page.click('[data-y="ok"]'); await settle(400);
    });
    const swapped = a.name !== b.name || a.room !== b.room;
    assert(seen.blue.includes("1,3") && (!swapped || (seen.blue.includes("3,0") && seen.blue.includes("3,1"))), seen.blue);
    assert(seen.list.some(x => x.startsWith("Пн 4: Френски език 506") && x.includes("беше Френската 506")), seen.list.join(" | "));
    assert(seen.gone.startsWith("„Френската“ го няма в новата програма (беше Пн 4, Ср 1)"), seen.gone);
    assert.strictEqual(seen.goneAfter, 0, "placed, so no longer asked");
    assert.strictEqual(seen.step, "В кой клас си сега?");
    assert.strictEqual(seen.grade, "12", "last year's 11 + 1");
    assert.strictEqual(seen.max, "12");
    assert(seen.hol.includes("2027/28"), seen.hol); // that year's official days off aren't published (in the mock's holidays.json) yet
    const d = saved(r);
    assert.deepStrictEqual(d.short, FIX.short);
    assert.deepStrictEqual(d.tiny, FIX.tiny);
    assert.deepStrictEqual(d.week["1"][3], { name: "Френската", room: "506", important: true }, "the nickname back, red like before");
    assert.deepStrictEqual(d.week["3"][1], { name: "Френската", room: "712", important: true });
    assert.deepStrictEqual(d.meta.groups, { "Английски|Немски": 0 }, "Немски, now first");
    assert.strictEqual(d.meta.grade, 12);
    assert.strictEqual(d.meta.schoolYear, "2027-28");
    assert(!d.daysOff, "last year's days off of the school are not carried into a new year");
    // the subjects important everywhere before are important everywhere now
    const all = {}, hot = {};
    Object.values(FIX.week).flat().forEach(e => { if (e.name) { all[e.name] = (all[e.name] || 0) + 1; if (e.important) hot[e.name] = (hot[e.name] || 0) + 1; } });
    for (const e of Object.values(d.week).flat()) if (e.name && !e.groups && hot[e.name] === all[e.name]) assert(e.important, e.name);
  });
  await test("a new term in the same school year: no grade question; the school's own days off kept", async () => {
    const NEW = clone(SHARED); delete NEW.daysOff; NEW.meta.source = "ai";
    let step = null;
    const r = await live("2027-02-08T10:00", { data: OLD, query: { data: "school-widget:j:" + JSON.stringify(NEW) } }, async (page, settle) => {
      await settle();
      for (let i = 0; i < 3 && await page.evaluate(() => document.body.className) === "ed"; i++) {
        if (await page.$("#sh h2")) { step = await text(page, "#sh h2"); await page.click('[data-y="ok"]'); } else await page.click("#sv");
        await settle(300);
      }
    });
    assert.strictEqual(step, null, "nothing to ask: the group pick is kept");
    const d = saved(r);
    assert.deepStrictEqual(d.daysOff, OLD.daysOff);
    assert.strictEqual(d.meta.grade, 11);
    assert.deepStrictEqual(d.meta.groups, OLD.meta.groups);
  });
  await live.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
