// Renders every widget size (Home + Lock Screen) at 16 moments (class, break, before/after
// school, weekend, holidays…) into out/final-<lang>.html (out/final-<lang>-light.html with MODE=light).
// Usage: node final.js [bg|en]; MODE=light for Light Mode. Lock Screen widgets are always rendered in dark mode.
const fs = require("fs"), path = require("path");
const M = require("./mock");
const run = require("./run");
const LANGX = process.argv[2] || "bg";
const BASE = process.env.MODE === "light" ? "light" : "dark", OTHER = BASE === "light" ? "dark" : "light";
(async () => {
  fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
  const times = require("./scenarios").final;
  let out = `<html><head><meta charset="utf-8"><style>body{background:#3a4a5c;font-family:-apple-system,Arial;color:#fff;padding:20px}
  h2{font-size:15px;margin:20px 0 8px;color:#dfe6ee}.r{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
  .wid,.wid div{box-sizing:border-box}.lock{outline:1px dashed rgba(255,255,255,.35)}.wid{overflow:hidden;color:#fff;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif}</style></head><body>`;
  for (const [t, label] of times) {
    out += `<h2>${label}</h2><div class="r">`;
    for (const [mode, fam] of [[BASE,"small"],[BASE,"medium"],[BASE,"large"],[OTHER,"small"],["dark","accessoryRectangular"],["dark","accessoryCircular"],["dark","accessoryInline"]]) {
      process.env.MODE = mode;
      const r = await run(t, fam, { settings: { language: LANGX }, param: process.env.EXTRA || "" });
      out += M.renderWidget(r.widget, fam);
    }
    out += `</div>`;
  }
  fs.writeFileSync(path.join(__dirname, "out", `final-${LANGX}${BASE === "light" ? "-light" : ""}.html`), out + "</body></html>");
})().catch(e => { console.error(e); process.exit(1); });
