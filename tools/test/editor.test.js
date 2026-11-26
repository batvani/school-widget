// Tests for the import and the timetable editor: the real menu page in Chromium
// with the real script behind it (tools/preview/live.js), so every tap goes through the page's
// code, the school-widget://data link, dataAction, validateData and the saved files.
// node tools/test/editor.test.js (needs Playwright, like check.js)
const fs = require("fs"), path = require("path"), assert = require("assert");
const live = require("../preview/live");
const run = require("../preview/run");
const FIX = JSON.parse(fs.readFileSync(path.join(__dirname, "../preview/fixtures/sample-2027.json"), "utf8"));
const T = "2026-11-05T10:20", DATA = "/docs/school-widget/data.json", IMPF = "/icloud/school-widget-import.txt";
const clone = o => JSON.parse(JSON.stringify(o));
const saved = r => JSON.parse(r.files[DATA]);
const hist = r => Object.keys(r.files).filter(f => /\/school-widget\/history\/\d+\.json$/.test(f));
// an AI's answer: a split class, an unsure room
const IMP = clone(FIX);
IMP.week["1"][4] = { name: "ПП Информатика", room: "111?" };
IMP.week["2"][4] = { name: "Английски / Немски", room: "101 / 102", groups: [{ label: "Английски", name: "Английски език", room: "101" }, { label: "Немски", name: "Немски език", room: "102" }] };
const answer = "Ето програмата ти:\n```json\n" + JSON.stringify(IMP, null, 1) + "\n```\nКопирай я.";

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 5).join("\n       ")); }
}
const text = (p, sel) => p.$eval(sel, e => e.textContent);
const cell = (k, p) => `#ed [data-k="${k}"][data-p="${p}"]`;
async function editCell(page, settle, k, p, f) { await page.click(cell(k, p)); await f(); await page.click('[data-y="ok"]'); await settle(); }

(async () => {
  console.log("import");
  await test("from a link: the table, a fix, the group step, Запази → data.json, the Готово screen", async () => {
    let shown = {};
    const r = await live(T, { data: null, query: { data: "school-widget:j:" + JSON.stringify(IMP) } }, async (page, settle) => {
      await settle();
      shown.title = await text(page, "#ed h1");
      shown.marks = await page.$$eval("#ed .cell.w", l => l.length);
      await editCell(page, settle, 1, 4, () => page.fill("#cr", "111"));
      await page.click("#sv"); await settle();
      shown.step = await text(page, "#sh h2");
      await page.click('#sh [data-g] button[data-i="1"]'); await page.click('[data-y="ok"]'); await settle(300);
      shown.done = await page.evaluate(() => document.body.className);
    });
    assert.strictEqual(shown.title, "Провери програмата");
    assert(shown.marks >= 2, "the unsure room and the split class are marked");
    assert.strictEqual(shown.step, "Коя група си?");
    assert.strictEqual(shown.done, "done");
    const d = saved(r);
    assert.deepStrictEqual(d.week["1"][4], { name: "ПП Информатика", room: "111" });
    assert.deepStrictEqual(d.meta.groups, { "Английски|Немски": 1 });
    assert(d.meta.created && !d.meta.demo);
    assert.strictEqual(hist(r).length, 0, "nothing to keep from before (the demo)");
  });
  await test("the five ai/tests timetables: import, the group step if split, warnings confirmed, Запази → the same timetable", async () => {
    const { T: TESTS, expected } = require("../../ai/tests/timetables");
    for (const t of TESTS) {
      const e = expected(t);
      let steps = [];
      const r = await live(T, { data: null, query: { data: "school-widget:j:" + JSON.stringify(e) } }, async (page, settle) => {
        await settle();
        for (let i = 0; i < 4 && await page.evaluate(() => document.body.className) !== "done"; i++) {
          if (await page.$("#sh [data-g]")) { steps.push("group"); await page.click('#sh [data-g] button[data-i="0"]'); await page.click('[data-y="ok"]'); }
          else { steps.push(await text(page, "#sv")); await page.click("#sv"); }
          await settle(300);
        }
      });
      const d = saved(r), split = !!t.split;
      assert.deepStrictEqual(d.week, e.week, t.n);
      assert.deepStrictEqual(d.bells, e.bells, t.n);
      assert.strictEqual(d.meta.class, t.class);
      assert.deepStrictEqual(d.meta.groups || {}, split ? { "Английски|Немски": 0 } : {}, t.n);
      assert.deepStrictEqual(steps, split ? ["Запази", "group"] : ["Запази", "Запази все пак"], t.n + ": " + steps); // full names: the width warning asks once (Продължи in the group step counts as that)
    }
  });
  await test("a new install: only the landing page (no tabs, no demo) → Постави: a whole AI answer from the clipboard", async () => {
    let title, shown;
    const r = await live(T, { data: null, clipboard: answer, alerts: [-1] }, async (page, settle) => { // -1: no to the clipboard offer
      await settle();
      shown = await page.evaluate(() => ({ cls: document.body.className, tabs: !!document.querySelector(".tabs").offsetParent, today: !!document.getElementById("t1").offsetParent,
        main: [...document.querySelectorAll("#land .btn.main")].map(b => b.dataset.x), all: [...document.querySelectorAll("#land .btn")].map(b => b.dataset.x) }));
      await page.click('#land [data-x="paste"]'); await settle(300);
      title = await text(page, "#ed h1");
      await page.click("#sv"); await settle(); // the group step
      await page.click('#sh [data-g] button[data-i="0"]'); await page.click('[data-y="ok"]'); await settle(300);
    });
    assert.deepStrictEqual(shown, { cls: "land", tabs: false, today: false, main: ["paste", "scan"], all: ["paste", "scan", "file", "prompt", "blank"] });
    assert.strictEqual(title, "Провери програмата");
    assert.deepStrictEqual(saved(r).meta.groups, { "Английски|Немски": 0 }, "saved after the warnings were confirmed");
  });
  await test("Въведи я на ръка: an empty week; За теб (grade, city, the holidays calendar) on top, the details folded; Cancel goes back to the landing page", async () => {
    let cells, done = {}, back;
    await live(T, { data: null, query: { view: "1" } }, async (page, settle) => {
      await settle(); await page.click('#land [data-x="blank"]'); await settle(300);
      await page.click('[data-x="cancel"]'); await settle(300); back = await page.evaluate(() => document.body.className);
    });
    assert.strictEqual(back, "land");
    const r = await live(T, { data: null, query: { view: "1" } }, async (page, settle) => {
      await settle(); await page.click('#land [data-x="blank"]'); await settle(300);
      done.order = await page.$$eval("#ed h3", a => a.slice(0, 2).map(x => x.textContent));
      done.folded = await page.$eval("#det", e => !e.open);
      await page.selectOption("#ecity", "Варна"); await page.check("#ecal");
      cells = await page.$$eval("#ed .cell.empty", a => a.length);
      await editCell(page, settle, 1, 0, () => page.fill("#cn", "Математика")); await settle(300);
      await page.fill("#grade", "10"); await page.dispatchEvent("#grade", "change"); await settle(300); // a blank one has no grade yet
      for (let i = 0; i < 4 && await page.evaluate(() => document.body.className) !== "done"; i++) {
        if (await page.$("#sh [data-y=ok]")) await page.click("#sh [data-y=ok]"); else await page.click("#sv");
        await settle(300);
      }
      done.cls = await page.evaluate(() => document.body.className);
      if (done.cls !== "done") throw new Error("not saved: " + await page.evaluate(() => document.body.innerText.slice(0, 600)));
    });
    assert.strictEqual(cells, 7 * 5, "7 bells × Mon–Fri, all empty");
    assert.deepStrictEqual(done, { order: ["За теб", "Програмата"], folded: true, cls: "done" });
    assert.strictEqual(JSON.parse(r.files["/docs/school-widget/settings.json"]).city, "Варна");
    assert.deepStrictEqual(r.opened, ["https://batvani.github.io/school-widget/calendar/?grade=10&city=%D0%92%D0%B0%D1%80%D0%BD%D0%B0"]);
    assert.strictEqual(saved(r).week["1"][0].name, "Математика");
  });
  await test("an imported timetable that repeats the official days off keeps only its own; Сканирай QR код explains the Camera", async () => {
    const H = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "holidays", "list.json"), "utf8")).years[0].daysOff.find(e => isNaN(e[1]) && e[1] > e[0]);
    const d = Object.assign(clone(IMP), { daysOff: [[H[0], H[1], H[2]], ["2026-11-18", "Патронен празник"]] });
    let own, alert;
    const r = await live(T, { data: null, clipboard: "school-widget:j:" + JSON.stringify(d), alerts: [-1, 0] }, async (page, settle) => {
      await settle(); await page.click('#land [data-x="scan"]'); await settle();
      await page.click('#land [data-x="paste"]'); await settle(300);
      own = await page.$$eval('#det [data-x="off"]', a => a.length);
    });
    alert = r.alerts.find(a => /Камера/.test(a.message || ""));
    assert(alert, "the Camera steps");
    assert.strictEqual(own, 1, "only the patron's day is the school's own");
  });
  await test("Копирай промпта за AI copies the start prompt with the instructions' link", async () => {
    let msg;
    const r = await live(T, { data: null, query: { view: "1" } }, async (page, settle) => { await settle(); await page.click('[data-x="prompt"]'); await settle(); msg = await text(page, "#say"); });
    assert.strictEqual(r.copied.length, 1);
    assert(r.copied[0].includes("https://batvani.github.io/school-widget/ai/INSTRUCTIONS.md"));
    assert(/копиран/.test(msg));
  });
  await test("the clipboard with no timetable, an empty one, a newer schema: a message, nothing saved", async () => {
    for (const [clip, re] of [["здрасти", /не прилича на програма/], [null, /Клипбордът е празен/], ["school-widget:j:" + JSON.stringify(Object.assign(clone(IMP), { meta: { schema: 99 } })), /Първо обнови/]]) {
      let msg;
      const r = await live(T, { query: { view: "1", tab: "t2" }, clipboard: clip }, async (page, settle) => {
        await settle(); await page.click('#t2 [data-x="imp"]'); await page.click('#t2 [data-x="paste"]'); await settle(); msg = await text(page, "#say");
      });
      assert(re.test(msg), msg);
      assert.strictEqual(hist(r).length, 0);
    }
  });
  await test("От файл: a picked file", async () => {
    let title;
    await live(T, { query: { view: "1", tab: "t2" }, pick: "/icloud/Downloads/program.txt", files: { "/icloud/Downloads/program.txt": answer } }, async (page, settle) => {
      await settle(); await page.click('#t2 [data-x="imp"]'); await page.click('#t2 [data-x="file"]'); await settle(300); title = await text(page, "#ed h1");
    });
    assert.strictEqual(title, "Провери програмата");
  });
  await test("the import file next to the script: opened at start; Отказ deletes it and saves nothing", async () => {
    let title;
    const r = await live(T, { files: { [IMPF]: "school-widget:j:" + JSON.stringify(IMP) } }, async (page, settle) => {
      await settle(); title = await text(page, "#ed h1"); await page.click('[data-x="cancel"]'); await settle();
    });
    assert.strictEqual(title, "Провери програмата");
    assert(!(IMPF in r.files), "the import file is gone");
    assert.strictEqual(hist(r).length, 0, "the saved timetable is untouched");
  });
  await test("a broken import file: an alert offers to delete it", async () => {
    const r = await run(T, "medium", { app: true, files: { [IMPF]: '{"week": {"1": [' }, alerts: [0] });
    assert(/непълна или повредена/.test(r.alerts[0].message));
    assert(!(IMPF in r.files));
  });
  await test("a timetable from a newer schema at start: Първо обнови + Обнови", async () => {
    const r = await run(T, "medium", { app: true, query: { data: "school-widget:j:" + JSON.stringify({ meta: { schema: 9 }, week: {} }) } });
    assert(/Първо обнови School Widget/.test(r.alerts[0].message));
    assert.deepStrictEqual(r.alerts[0].actions, ["Обнови"]);
  });

  console.log("editing (Седмица → Промени програмата)");
  const edit = (drive, more = {}) => live(T, Object.assign({ data: FIX, query: { view: "1", tab: "t2" } }, more), async (page, settle) => { await settle(); await page.click('[data-x="edit"]'); await settle(); await drive(page, settle); });
  await test("a nickname for one cell; a rename of every cell; the old one goes to history/", async () => {
    const r = await edit(async (page, settle) => {
      await editCell(page, settle, 1, 0, () => page.fill("#cn", "Френската 2"));
      await editCell(page, settle, 2, 5, async () => { await page.fill("#cn", "Английски"); await page.click('#sc [data-v="all"]'); });
      await page.click("#sv"); await settle(); if (await page.$("#ed")) { await page.click("#sv").catch(() => { }); await settle(); }
    });
    const d = saved(r), n = Object.values(d.week).flat().map(e => e.name);
    assert.strictEqual(d.week["1"][0].name, "Френската 2");
    assert.strictEqual(d.week["1"][1].name, FIX.week["1"][1].name, "only that cell");
    assert(!n.includes("Английски език") && n.filter(x => x === "Английски").length === Object.values(FIX.week).flat().filter(e => e.name === "Английски език").length);
    assert(!("Английски език" in d.short), "the short name moved with the rename");
    assert.strictEqual(hist(r).length, 1);
  });
  await test("a free period; important; a subject's short name and no room", async () => {
    const r = await edit(async (page, settle) => {
      await editCell(page, settle, 3, 1, () => page.check("#cz"));
      await editCell(page, settle, 4, 0, () => page.check("#ci"));
      await page.click('[data-s="Гражданско образование"]'); await page.fill("#ss", "Гражданско"); await page.check("#sr"); await page.click('[data-y="ok"]'); await settle();
      await page.click("#sv"); await settle(); if (await page.$("#sv")) { await page.click("#sv").catch(() => { }); await settle(); }
    });
    const d = saved(r);
    assert.deepStrictEqual(d.week["3"][1], { name: "" });
    assert.strictEqual(d.week["4"][0].important, true);
    assert.strictEqual(d.short["Гражданско образование"], "Гражданско");
    assert(d.meta.noRoom.includes("Гражданско образование") && d.meta.noRoom.includes("ФВС"));
  });
  await test("bells: add one, remove it again; a day off of the school's; no official days listed; no last-day field (always the official one)", async () => {
    let bells, noLast, official;
    const r = await edit(async (page, settle) => {
      await page.click('[data-x="addBell"]'); await settle();
      bells = await page.$$eval("#ed .bell .n", l => l.length);
      await page.click('[data-x="bell"]'); await settle();
      await page.click('[data-x="addOff"]'); await page.fill("#fa", "2027-03-20"); await page.fill("#fn", "Патронен празник"); await page.click('[data-y="ok"]'); await settle();
      official = await page.$$eval("#ed .sw span", l => l.filter(x => /Гергьовден/.test(x.textContent)).length);
      noLast = !(await page.$("#last"));
      await page.click("#sv"); await settle(); if (await page.$("#sv")) { await page.click("#sv").catch(() => { }); await settle(); }
    });
    assert.strictEqual(bells, FIX.bells.length + 1);
    const d = saved(r);
    assert.deepStrictEqual(d.bells, FIX.bells);
    assert.deepStrictEqual(d.daysOff, [["2027-03-20", "Патронен празник"]]);
    assert.strictEqual(official, 0, "the official days off aren't listed");
    assert(!("notOff" in d));
    assert(noLast, "no last-day field");
    assert(!("lastDay" in d), "an old lastDay is dropped");
  });
  await test("an error blocks Запази (a bell that ends before it starts); nothing is written", async () => {
    let msg, chip;
    const r = await edit(async (page, settle) => {
      await page.fill('[data-b="0,1"]', "07:00"); await page.dispatchEvent('[data-b="0,1"]', "change"); await settle();
      chip = await text(page, "#ed .chip.e");
      await page.click("#sv"); await settle(); msg = await text(page, "#say");
    });
    assert(/грешки: 1/.test(chip));
    assert(/поправи грешките/.test(msg));
    assert.deepStrictEqual(saved(r), FIX);
    assert.strictEqual(hist(r).length, 0);
  });
  await test("the script checks again on save: a page that skips the check can't save a broken timetable", async () => {
    const bad = Object.assign(clone(FIX), { bells: [["09:00", "08:00"]] });
    const r = await live(T, { data: FIX, query: { view: "1" } }, async (page, settle) => {
      await settle(); await page.evaluate(d => { location.href = "school-widget://data?a=save&m=edit&d=" + encodeURIComponent(JSON.stringify(d)); }, bad); await settle();
    });
    assert.deepStrictEqual(saved(r), FIX);
  });
  const menu = (drive, more = {}) => live(T, Object.assign({ data: FIX, query: { view: "1", tab: "t2" } }, more), async (page, settle) => { await settle(); await drive(page, settle); });
  const H = n => ({ ["/docs/school-widget/history/" + n + ".json"]: JSON.stringify(Object.assign(clone(FIX), { short: { Математика: "М" + n } })) });
  await test("Предишни програми: restore one (that can be undone too), delete one, delete all", async () => {
    const files = Object.assign(H(1763000000000), H(1764000000000));
    let r = await menu(async (page, settle) => { await page.click('[data-x="hist"]'); await settle(300); }, { files, alerts: [1, 0] });
    assert.strictEqual(r.alerts[0].actions.length, 3, "two timetables and Изтрий всички");
    assert.strictEqual(saved(r).short.Математика, "М1763000000000", "the older one is back");
    assert.strictEqual(hist(r).length, 2, "the restored one left the list, the replaced one joined it");
    const hs = hist(r).map(f => JSON.parse(r.files[f]));
    assert(hs.some(x => JSON.stringify(x) === JSON.stringify(FIX)) && hs.some(x => x.short.Математика === "М1764000000000"));
    // back and forth: still 2, no copies
    const f2 = {}; hist(r).forEach(f => f2[f] = r.files[f]); f2[DATA] = r.files[DATA];
    r = await menu(async (page, settle) => { await page.click('[data-x="hist"]'); await settle(300); }, { files: f2, alerts: [0, 0] });
    assert.strictEqual(hist(r).length, 2, "no copies after restoring again");
    assert.strictEqual(new Set(hist(r).map(f => r.files[f])).size, 2);
    r = await menu(async (page, settle) => { await page.click('[data-x="hist"]'); await settle(300); }, { files, alerts: [0, 1] });
    assert.deepStrictEqual(saved(r), FIX); assert.strictEqual(hist(r).length, 1);
    r = await menu(async (page, settle) => { await page.click('[data-x="hist"]'); await settle(300); }, { files, alerts: [2, 0] });
    assert.deepStrictEqual(saved(r), FIX); assert.strictEqual(hist(r).length, 0);
  });
  await test("Отказ leaves the editor without saving", async () => {
    let cls;
    const r = await edit(async (page, settle) => {
      await editCell(page, settle, 1, 0, () => page.fill("#cn", "X"));
      await page.click('[data-x="cancel"]'); await settle(); cls = await page.evaluate(() => document.body.className);
    });
    assert.strictEqual(cls, "");
    assert.deepStrictEqual(saved(r), FIX);
  });
  await test("running the script opens the menu at once (no list to choose from); Програма has Внеси", async () => {
    const r = await run(T, "medium", { app: true });
    assert.strictEqual(r.alerts.length, 0, "no start sheet");
    assert(r.html && r.html.includes('data-x="imp"'));
  });

  await live.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(async e => { console.error(e); await live.close(); process.exit(1); });
