// Renders every widget size (Home + Lock Screen) at 16 moments (class, break, before/after
// school, weekend, holidays…) into out/final-<lang>.html (out/final-<lang>-light.html with MODE=light).
// Usage: node final.js [bg|en]; MODE=light for Light Mode; EXTRA="box=room;outline=on" adds Parameter text.
// Lock Screen widgets are always rendered in dark mode. Then: node check.js [bg|en].
const { gallery } = require("./gallery");
const lang = process.argv[2] || "bg";
const base = process.env.MODE === "light" ? "light" : "dark", other = base === "light" ? "dark" : "light";
const param = process.env.EXTRA || "";
const cells = [[base, "small"], [base, "medium"], [base, "large"], [other, "small"], ["dark", "accessoryRectangular"], ["dark", "accessoryCircular"], ["dark", "accessoryInline"]]
  .map(([mode, family]) => ({ mode, family, param }));
gallery(`final-${lang}${base === "light" ? "-light" : ""}.html`, require("./scenarios").final, cells, { lang, extraCss: ".lock{outline:1px dashed rgba(255,255,255,.35)}" })
  .catch(e => { console.error(e); process.exit(1); });
