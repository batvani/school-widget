// Tests for the import and the timetable editor: the real menu page in Chromium
// with the real script behind it (tools/preview/live.js), so every tap goes through the page's
// code, the uchilishte://data link, dataAction, validateData and the saved files.
// node tools/test/editor.test.js (needs Playwright, like check.js)
const fs = require("fs"), path = require("path"), assert = require("assert");
const live = require("../preview/live");
const run = require("../preview/run");
const FIX = JSON.parse(fs.readFileSync(path.join(__dirname, "../preview/fixtures/sample-2027.json"), "utf8"));
const T = "2026-11-05T10:20", DATA = "/docs/uchilishte/data.json", IMPF = "/icloud/uchilishte-import.txt";
const clone = o => JSON.parse(JSON.stringify(o));
const saved = r => JSON.parse(r.files[DATA]);
const hist = r => Object.keys(r.files).filter(f => /\/uchilishte\/history\/\d+\.json$/.test(f));
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
    const r = await live(T, { data: null, query: { data: "uchilishte:j:" + JSON.stringify(IMP) } }, async (page, settle) => {
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
      const r = await live(T, { data: null, query: { data: "uchilishte:j:" + JSON.stringify(e) } }, async (page, settle) => {
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
  await test("Постави от AI on the demo's welcome card: a whole AI answer from the clipboard", async () => {
    let title;
    const r = await live(T, { data: null, query: { view: "1" }, clipboard: answer }, async (page, settle) => {
      await settle();
      await page.click('.wc [data-x="imp"]'); await page.click('.wc [data-x="paste"]'); await settle(300);
      title = await text(page, "#ed h1");
      await page.click("#sv"); await settle(); // the group step
      await page.click('#sh [data-g] button[data-i="0"]'); await page.click('[data-y="ok"]'); await settle(300);
    });
    assert.strictEqual(title, "Провери програмата");
    assert.deepStrictEqual(saved(r).meta.groups, { "Английски|Немски": 0 }, "saved after the warnings were confirmed");
  });
  await test("Копирай промпта за AI copies the start prompt with the instructions' link", async () => {
    let msg;
    const r = await live(T, { data: null, query: { view: "1" } }, async (page, settle) => { await settle(); await page.click('[data-x="prompt"]'); await settle(); msg = await text(page, "#say"); });
    assert.strictEqual(r.copied.length, 1);
    assert(r.copied[0].includes("https://batvani.github.io/school-widget/ai/INSTRUCTIONS.md"));
    assert(/копиран/.test(msg));
  });
  await test("the clipboard with no timetable, an empty one, a newer schema: a message, nothing saved", async () => {
    for (const [clip, re] of [["здрасти", /не прилича на програма/], [null, /Клипбордът е празен/], ["uchilishte:j:" + JSON.stringify(Object.assign(clone(IMP), { meta: { schema: 99 } })), /Първо обнови/]]) {
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
    const r = await live(T, { files: { [IMPF]: "uchilishte:j:" + JSON.stringify(IMP) } }, async (page, settle) => {
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
    const r = await run(T, "medium", { app: true, query: { data: "uchilishte:j:" + JSON.stringify({ meta: { schema: 9 }, week: {} }) } });
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
  await test("bells: add one, remove it again; a day off of the school's; an official day studied; the last day", async () => {
    let bells;
    const r = await edit(async (page, settle) => {
      await page.click('[data-x="addBell"]'); await settle();
      bells = await page.$$eval("#ed .bell .n", l => l.length);
      await page.click('[data-x="bell"]'); await settle();
      await page.click('[data-x="addOff"]'); await page.fill("#fa", "2027-03-20"); await page.fill("#fn", "Патронен празник"); await page.click('[data-y="ok"]'); await settle();
      const i = await page.$$eval("#ed .sw span", l => l.findIndex(x => /Гергьовден/.test(x.textContent)));
      await page.$$eval("#ed .sw input", (l, i) => l[i].click(), i); await settle();
      await page.fill("#last", "2027-06-30"); await page.dispatchEvent("#last", "change"); await settle();
      await page.click("#sv"); await settle(); if (await page.$("#sv")) { await page.click("#sv").catch(() => { }); await settle(); }
    });
    assert.strictEqual(bells, FIX.bells.length + 1);
    const d = saved(r);
    assert.deepStrictEqual(d.bells, FIX.bells);
    assert.deepStrictEqual(d.daysOff, [["2027-03-20", "Патронен празник"]]);
    assert.deepStrictEqual(d.notOff, ["2027-05-06"]);
    assert.strictEqual(d.lastDay, "2027-06-30");
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
      await settle(); await page.evaluate(d => { location.href = "uchilishte://data?a=save&m=edit&d=" + encodeURIComponent(JSON.stringify(d)); }, bad); await settle();
    });
    assert.deepStrictEqual(saved(r), FIX);
  });
  await test("Върни предишна: back to a timetable from history/, and that can be undone too", async () => {
    const old = Object.assign(clone(FIX), { lastDay: "2027-06-30" });
    const r = await edit(async (page, settle) => {
      await page.click('[data-x="undo"]'); await page.click("#sh [data-h]"); await settle(300);
    }, { files: { "/docs/uchilishte/history/1763000000000.json": JSON.stringify(old) } });
    assert.deepStrictEqual(saved(r), old);
    assert.strictEqual(hist(r).length, 2, "the replaced one is in the history");
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
  await test("the app menu has Внеси програма", async () => {
    const r = await run(T, "medium", { app: true });
    assert(r.alerts[0].actions.includes("Внеси програма"));
  });

  await live.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(async e => { console.error(e); await live.close(); process.exit(1); });
