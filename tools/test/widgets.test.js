// Tests for the landing page's widget copies (landing/widgets.js + widgets.css): hand-made HTML that
// must look exactly like School Widget. Each copy is compared with the real script rendered by the
// preview mock (tools/preview/mock.js) for the same demo timetable (landing/demo.js), language "en",
// at the same moments, Dark and Light: every visible text (its words, box and colour) and every
// picture (rings) must be where the script puts it. Both pages use one font for the comparison, so
// a text's box also checks its size and weight. Then: in-place updates (what the page's running
// clock does), the full-screen menu copy, Reduce Motion.
// node tools/test/widgets.test.js     DUMP=<kind> prints what the script shows (texts: words, box, colour; pictures' boxes)
const fs = require("fs"), assert = require("assert");
const { chromium } = require("playwright");
const run = require("../preview/run"), M = require("../preview/mock");
const { P } = require("./site");
const D = require(P("landing/demo.js"));
const TOL_X = 4, TOL_Y = 5; // pt; the copies are Apple's 155 pt tall, the mock's small/medium 152
const KINDS = { small: "small", medium: "medium", large: "large", lockRect: "accessoryRectangular", lockRound: "accessoryCircular", lockInline: "accessoryInline" };
const SAME = { "Коледна ваканция": "Christmas break" }; // the holiday's name: Bulgarian in the official list, English on the page
const hm = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const MOMENTS = [450, 490, 530, 550, 640, 720, 785, 820, 900].concat(Object.values(D.MOMENTS)).filter((m, i, a) => a.indexOf(m) === i).sort((a, b) => a - b);

const { test, finish } = require("./harness");
const FONT = "<style>*{font-family:Arial,'Liberation Sans',sans-serif!important;letter-spacing:0!important}body{margin:0;background:#3a4a5c}.wid,.wid div{box-sizing:border-box}.box{display:inline-block;margin:20px}</style>";
// visible texts and pictures inside each .box, relative to the widget's top-left corner
const READ = () => [...document.querySelectorAll(".box")].map(b => {
  const w = b.firstElementChild, r0 = w.getBoundingClientRect();
  const vis = e => { for (let x = e; x && x !== b; x = x.parentElement) { const s = getComputedStyle(x); if (s.opacity === "0" || s.visibility === "hidden" || s.display === "none") return false; } const c = getComputedStyle(e).color; return !/rgba\(.*, 0\)$/.test(c) && c !== "transparent"; };
  const box = e => { const r = e.getBoundingClientRect(); return [r.left - r0.left, r.top - r0.top, r.width, r.height].map(v => Math.round(v * 10) / 10); };
  const texts = [...w.querySelectorAll(".t")].filter(e => e.textContent.trim() && vis(e)).map(e => {
    const rg = document.createRange(); rg.selectNodeContents(e); const r = rg.getBoundingClientRect();
    return { s: e.textContent.trim(), x: r.left - r0.left, y: r.top - r0.top, w: r.width, h: r.height, c: getComputedStyle(e).color };
  });
  // the script's pictures: rings, tints and lines are drawn images (a stack's background or an image)
  const mockPics = [...w.querySelectorAll("div")].filter(d => /url\("?data:image\/svg/.test(d.style.backgroundImage) || (d.children.length === 1 && d.firstElementChild.tagName === "svg")).map(box);
  const pics = [...w.querySelectorAll("[data-img]")].map(box);
  return { size: [r0.width, r0.height].map(Math.round), texts, pics: w.classList.contains("wid") ? mockPics : pics };
});
const rgba = c => (c.match(/[\d.]+/g) || []).map(Number).concat([1]).slice(0, 4);
function same(a, b, where) {
  const fail = m => { throw new Error(where + ": " + m); };
  const ka = a.texts.map(t => SAME[t.s] || t.s).sort().join(" | "), kb = b.texts.map(t => t.s).sort().join(" | ");
  if (ka !== kb) fail(`texts differ\n         script: ${ka}\n         copy:   ${kb}`);
  const left = [...b.texts];
  for (const t of a.texts) {
    const i = left.findIndex(u => u.s === (SAME[t.s] || t.s) && Math.abs(u.y - t.y) <= TOL_Y && Math.abs(u.x - t.x) <= TOL_X);
    if (i < 0) { const u = left.find(u => u.s === (SAME[t.s] || t.s)); fail(`"${t.s}" at ${[t.x, t.y].map(Math.round)}, copy at ${u ? [u.x, u.y].map(Math.round) : "?"}`); }
    const u = left.splice(i, 1)[0];
    if (!SAME[t.s] && Math.abs(u.w - t.w) > TOL_X) fail(`"${t.s}" is ${Math.round(u.w)} wide, the script's ${Math.round(t.w)} (size or weight)`);
    const ca = rgba(t.c), cb = rgba(u.c);
    if (ca.slice(0, 3).some((v, k) => Math.abs(v - cb[k]) > 10) || Math.abs(ca[3] - cb[3]) > 0.07) fail(`"${t.s}" colour ${u.c}, the script's ${t.c}`);
  }
  if (a.pics.length !== b.pics.length) fail(`${b.pics.length} pictures (rings), the script ${a.pics.length}: ${JSON.stringify(a.pics)}`);
  for (const p of a.pics) if (!b.pics.some(q => p.every((v, k) => Math.abs(v - q[k]) <= (k % 2 ? TOL_Y : TOL_X)))) fail(`no picture at ${JSON.stringify(p)} (copy: ${JSON.stringify(b.pics)})`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  const lib = ["demo.js", "widgets.js"].map(f => fs.existsSync(P("landing", f)) ? `<script>${fs.readFileSync(P("landing", f), "utf8")}</script>` : "").join("")
    + (fs.existsSync(P("landing/widgets.css")) ? `<style>${fs.readFileSync(P("landing/widgets.css"), "utf8")}</style>` : "");
  async function copies(list) { // [[kind, min, mode]] → READ
    await page.setContent(`<html><head><meta charset="utf-8">${lib}${FONT}</head><body></body></html>`);
    return page.evaluate(list => {
      document.body.innerHTML = list.map(([k, m, mode]) => `<div class="box">${window.SW.html(k, m, { mode })}</div>`).join("");
      return new Promise(r => requestAnimationFrame(() => r()));
    }, list).then(() => page.evaluate(READ));
  }
  async function script(list) {
    let h = "";
    for (const [k, m, mode] of list) {
      process.env.MODE = mode;
      const r = await run(D.DEMO_DATE + "T" + hm(m), KINDS[k], { data: D.DEMO, settings: { language: "en" } });
      h += `<div class="box">${M.renderWidget(r.widget, KINDS[k])}</div>`;
    }
    await page.setContent(`<html><head><meta charset="utf-8">${FONT}</head><body>${h}</body></html>`);
    return page.evaluate(READ);
  }

  console.log("widget copies = the script, at every moment");
  for (const kind of Object.keys(KINDS)) for (const mode of kind.startsWith("lock") ? ["dark"] : ["dark", "light"]) {
    await test(`${kind}, ${mode}: ${MOMENTS.map(hm).join(" ")}`, async () => {
      const list = MOMENTS.map(m => [kind, m, mode]), a = await script(list);
      if (process.env.DUMP === kind) a.forEach((x, i) => console.log(hm(MOMENTS[i]), JSON.stringify(x)));
      assert(fs.existsSync(P("landing/widgets.js")), "no landing/widgets.js yet");
      const b = await copies(list);
      assert.deepStrictEqual(errors, []);
      a.forEach((x, i) => {
        const where = `${kind} ${mode} ${hm(MOMENTS[i])}`;
        const [w, h] = b[i].size, [mw, mh] = x.size;
        assert(Math.abs(w - mw) <= 1 && Math.abs(h - mh) <= 4, `${where}: size ${w}×${h}, the script's ${mw}×${mh}`);
        same(x, b[i], where);
      });
    });
  }

  console.log("on the page");
  await test("mount + update(min) changes the widget in place and ends up the same as html(min)", async () => {
    await page.setContent(`<html><head><meta charset="utf-8">${lib}${FONT}</head><body><div class="box" id="a"></div><div class="box" id="b"></div></body></html>`);
    const r = await page.evaluate(async () => {
      const out = [];
      for (const k of ["small", "medium", "large", "lockRect", "lockRound", "lockInline"]) {
        const a = document.getElementById("a"), b = document.getElementById("b");
        const h = window.SW.mount(a, k, { min: 450, mode: "dark" }), root = a.firstElementChild;
        for (const m of [490, 530, 550, 785, 820]) h.update(m);
        h.setMode("light"); h.setMode("dark");
        b.innerHTML = window.SW.html(k, 820, { mode: "dark" });
        await new Promise(r => setTimeout(r, 900));
        out.push([k, a.firstElementChild === root, a.firstElementChild.dataset.min, a.innerText.replace(/\s+/g, " ").trim() === b.innerText.replace(/\s+/g, " ").trim()]);
      }
      return out;
    });
    for (const [k, kept, min, sameText] of r) {
      assert(kept, k + ": the widget was rebuilt, not updated (restarts its animations)");
      assert.strictEqual(min, "820", k + ": data-min");
      assert(sameText, k + ": after updates it doesn't read like html(820)");
    }
  });
  await test("SW.state(min): before / class / break / after, with the period, name, room and minutes left", async () => {
    await page.setContent(`<html><head>${lib}</head><body></body></html>`);
    const s = await page.evaluate(() => [450, 550, 640, 900].map(m => window.SW.state(m)));
    assert.deepStrictEqual(s.map(x => x.kind), ["before", "class", "break", "after"]);
    assert.deepStrictEqual([s[1].period, s[1].name, s[1].room, s[1].left], [2, "English", "208", 30]); // 09:10, until 09:40
    assert.deepStrictEqual([s[2].next.period, s[2].next.name, s[2].left], [4, "Biology", 15]); // 10:40, Biology at 10:55
  });
  await test("the full-screen menu copy: Today / Timetable / Days off / Settings; Today = Thursday's classes; ticks don't re-animate it", async () => {
    await page.setContent(`<html><head><meta charset="utf-8">${lib}</head><body><div id="m" style="width:300px;height:620px"></div></body></html>`);
    const r = await page.evaluate(async () => {
      const el = document.getElementById("m"), h = window.SW.mountMenu(el, { tab: "today", min: 550, mode: "dark" });
      const tabs = [...el.querySelectorAll("[data-tab]")].map(b => b.dataset.tab);
      const view = el.querySelector(".mview"); view.__mark = 1;
      for (let m = 551; m < 560; m++) h.update(m);
      await new Promise(r => setTimeout(r, 300));
      const kept = el.querySelector(".mview") === view && view.getAnimations().every(a => a.playState !== "running");
      const today = el.querySelector(".mview").innerText;
      h.setTab("timetable"); const changed = el.querySelector(".mview").innerText !== today;
      return { tabs, kept, today, changed };
    });
    assert.deepStrictEqual(r.tabs, ["today", "timetable", "daysoff", "settings"]);
    assert(r.kept, "the clock's ticks rebuilt or re-animated the menu's view (preview 3's bug)");
    for (const c of D.DEMO.week[4]) assert(r.today.includes(c.name), "Today misses " + c.name);
    assert(r.changed, "Timetable shows something else than Today");
  });
  await test("Reduce Motion: no transitions or animations in the copies", async () => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" }), p = await ctx.newPage();
    await p.setContent(`<html><head><meta charset="utf-8">${lib}</head><body><div id="a"></div></body></html>`);
    const n = await p.evaluate(async () => {
      const h = window.SW.mount(document.getElementById("a"), "large", { min: 540, mode: "dark" }); h.update(560);
      await new Promise(r => setTimeout(r, 50));
      return document.getAnimations().length;
    });
    assert.strictEqual(n, 0);
    await ctx.close();
  });
  await browser.close();
  finish();
})().catch(e => { console.error(e); process.exit(1); });
