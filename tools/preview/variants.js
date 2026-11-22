// Renders the medium widget's three layouts side by side — the default, layout=day and
// layout=list (set in the widget's Parameter) — at the same moments as final.js, plus a few
// that are tight for the new layouts, into out/variants-<lang>.html (…-light.html with MODE=light).
// Usage: node variants.js [bg|en]; then PAGE=variants node check.js [bg|en].
const fs = require("fs"), path = require("path");
const M = require("./mock");
const run = require("./run");
const LANGX = process.argv[2] || "bg";
const light = process.env.MODE === "light";
(async () => {
  fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
  const times = require("./scenarios").variants;
  let out = `<html><head><meta charset="utf-8"><style>body{background:#3a4a5c;font-family:-apple-system,Arial;color:#fff;padding:20px}
  h2{font-size:15px;margin:20px 0 8px;color:#dfe6ee}.r{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
  .wid,.wid div{box-sizing:border-box}.wid{overflow:hidden;color:#fff;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif}</style></head><body>`;
  for (const [t, label] of times) {
    out += `<h2>${label}</h2><div class="r">`;
    for (const [param, fam] of [["", "medium"], ["layout=day", "mediumDay"], ["layout=list", "mediumList"]]) {
      const r = await run(t, "medium", { settings: { language: LANGX }, param: [param, process.env.EXTRA].filter(Boolean).join(";") });
      if (r.logs.some(l => l.startsWith("ERR"))) console.log(t, fam, r.logs);
      out += M.renderWidget(r.widget, fam);
    }
    out += `</div>`;
  }
  fs.writeFileSync(path.join(__dirname, "out", `variants-${LANGX}${light ? "-light" : ""}.html`), out + "</body></html>");
})().catch(e => { console.error(e); process.exit(1); });
