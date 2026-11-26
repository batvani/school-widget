// Shared by final.js and variants.js: renders rows of widgets, one row per moment, into one HTML page
// in out/ (which it creates).
const fs = require("fs"), path = require("path");
const M = require("./mock");
const run = require("./run");
const OUT = path.join(__dirname, "out");
const CSS = `body{background:#3a4a5c;font-family:-apple-system,Arial;color:#fff;padding:20px}
  h2{font-size:15px;margin:20px 0 8px;color:#dfe6ee}.r{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
  .wid,.wid div{box-sizing:border-box}.wid{overflow:hidden;color:#fff;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif}`;
// scenarios: [[time, label]]; cells: [{ mode (MODE for the run, optional), family (what to run),
// as (the name drawn, default family), param (the widget's Parameter) }]
async function gallery(file, scenarios, cells, { lang, extraCss = "" }) {
  fs.mkdirSync(OUT, { recursive: true });
  let out = `<html><head><meta charset="utf-8"><style>${CSS}${extraCss}</style></head><body>`;
  for (const [t, label] of scenarios) {
    out += `<h2>${label}</h2><div class="r">`;
    for (const c of cells) {
      if (c.mode) process.env.MODE = c.mode;
      const r = await run(t, c.family, { settings: { language: lang }, param: c.param || "" });
      if (r.logs.some(l => l.startsWith("ERR"))) console.log(t, c.as || c.family, r.logs);
      out += M.renderWidget(r.widget, c.as || c.family);
    }
    out += `</div>`;
  }
  fs.writeFileSync(path.join(OUT, file), out + "</body></html>");
}
module.exports = { gallery, OUT };
