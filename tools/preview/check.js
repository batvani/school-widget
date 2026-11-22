// Opens out/final-<lang>[-light].html in headless Chromium and reports, per widget:
//   - widgets whose content overflows the widget,
//   - text that would be cut off ("…"),
//   - the smallest font size used, per widget family,
//   - two text boxes in the same widget that overlap or are closer than 4 pt,
// and saves one PNG per scenario to out/<lang>-<dark|light>-scenario-<n>.png.
// Usage: node final.js bg && node check.js bg      (MODE=light node final.js bg && MODE=light node check.js bg)
// Text boxes are measured as the text itself (width) × one font size (height), centred on the
// line, so the normal space above and below a line doesn't count as a gap. Two texts that are 3 pt
// or more apart and belong to one phrase ("15" + "мин" on a line, the "стая" label over its room
// number) are not reported.
const path = require("path");
const { chromium } = require("playwright");

const lang = process.argv[2] || "bg";
const mode = process.env.MODE === "light" ? "light" : "dark";
// PAGE=variants checks out/variants-<lang>.html (the medium widget's extra layouts) instead of final-<lang>.html
const page = process.env.PAGE || "final";
const file = path.join(__dirname, "out", `${page}-${lang}${mode === "light" ? "-light" : ""}.html`);
const MIN_GAP = 4, INLINE_GAP = 3;

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto("file://" + file);
  const res = await pg.evaluate(({ MIN_GAP, INLINE_GAP }) => {
    const scen = [...document.querySelectorAll("h2")].map(h => h.textContent);
    const rows = [...document.querySelectorAll(".r")];
    const out = { overflow: [], cut: [], minFont: {}, near: [], edge: {} };
    rows.forEach((row, si) => {
      [...row.querySelectorAll(".wid")].forEach(w => {
        const fam = w.dataset.fam;
        const where = `${scen[si]} / ${fam}`;
        const oh = w.scrollHeight - w.clientHeight, ow = w.scrollWidth - w.clientWidth;
        if (oh > 1 || ow > 1) out.overflow.push(`${where}: +${oh} high, +${ow} wide`);
        const wr = w.getBoundingClientRect();
        const boxes = [];
        w.querySelectorAll(".t").forEach(t => {
          if (!t.textContent.trim()) return;
          if (t.scrollWidth > t.clientWidth + 0.5 || t.scrollHeight > t.clientHeight + 1) out.cut.push(`${where}: "${t.textContent}"`);
          const fs = parseFloat(getComputedStyle(t).fontSize);
          if (!(fam in out.minFont) || fs < out.minFont[fam].fs) out.minFont[fam] = { fs, text: t.textContent, where: scen[si] };
          const rg = document.createRange(); rg.selectNodeContents(t);
          const r = rg.getBoundingClientRect(), tr = t.getBoundingClientRect();
          const cy = (tr.top + tr.bottom) / 2;
          // clip to the box the text is allowed to use (it may be cut)
          const left = Math.max(r.left, tr.left), right = Math.min(r.right, tr.right);
          boxes.push({ t, text: t.textContent, l: left, r: right, top: cy - fs / 2, bot: cy + fs / 2 });
          if (!w.classList.contains("lock")) {
            const e = Math.min(left - wr.left, wr.right - right, cy - fs / 2 - wr.top, wr.bottom - (cy + fs / 2));
            if (!(fam in out.edge) || e < out.edge[fam].e) out.edge[fam] = { e: Math.round(e * 10) / 10, text: t.textContent, where: scen[si] };
          }
        });
        for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i], c = boxes[j];
          const dx = Math.max(c.l - a.r, a.l - c.r), dy = Math.max(c.top - a.bot, a.top - c.bot);
          const gap = Math.max(dx, dy);
          if (gap >= MIN_GAP) continue;
          // one phrase: the two texts share an ancestor at most 3 levels up
          let p = a.t, phrase = false;
          for (let k = 0; k < 3 && p; k++) { p = p.parentElement; if (p && p.contains(c.t)) { phrase = true; break; } }
          if (phrase && gap >= INLINE_GAP) continue;
          out.near.push(`${where}: "${a.text}" ↔ "${c.text}" ${gap < 0 ? "overlap" : "gap"} ${Math.round(gap * 10) / 10} pt`);
        }
      });
    });
    return { out, n: rows.length };
  }, { MIN_GAP, INLINE_GAP });

  const o = res.out;
  console.log(`== ${lang} ${mode} (${path.basename(file)}) ==`);
  console.log("widgets overflowing:", o.overflow.length ? "\n  " + o.overflow.join("\n  ") : "none");
  console.log("text that would be cut off:", o.cut.length ? "\n  " + o.cut.join("\n  ") : "none");
  console.log("smallest font size per family:");
  for (const [f, v] of Object.entries(o.minFont)) console.log(`  ${f.padEnd(22)} ${String(v.fs).padStart(5)} pt  "${v.text}" (${v.where})`);
  console.log("closest text to the widget edge (Home Screen):");
  for (const [f, v] of Object.entries(o.edge)) console.log(`  ${f.padEnd(22)} ${String(v.e).padStart(5)} pt  "${v.text}" (${v.where})`);
  console.log(`text boxes closer than ${MIN_GAP} pt or overlapping:`, o.near.length ? "\n  " + o.near.join("\n  ") : "none");

  for (let i = 0; i < res.n; i++)
    await pg.locator(".r").nth(i).screenshot({ path: path.join(__dirname, "out", `${page === "final" ? "" : page + "-"}${lang}-${mode}-scenario-${i}.png`) });
  console.log(`saved ${res.n} scenario PNGs to tools/preview/out/${page === "final" ? "" : page + "-"}${lang}-${mode}-scenario-*.png`);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
