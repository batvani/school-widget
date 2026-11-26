// Renders the medium widget's three layouts side by side (the default, layout=day and layout=list,
// set in the widget's Parameter) at the same moments as final.js, plus a few that are tight for the
// new layouts, into out/variants-<lang>.html (…-light.html with MODE=light).
// Usage: node variants.js [bg|en]; EXTRA="box=room;outline=on" adds Parameter text; then PAGE=variants node check.js [bg|en].
const { gallery } = require("./gallery");
const lang = process.argv[2] || "bg";
const extra = process.env.EXTRA || "";
const cells = [["", "medium"], ["layout=day", "mediumDay"], ["layout=list", "mediumList"]]
  .map(([layout, as]) => ({ family: "medium", as, param: [layout, extra].filter(Boolean).join(";") }));
gallery(`variants-${lang}${process.env.MODE === "light" ? "-light" : ""}.html`, require("./scenarios").variants, cells, { lang })
  .catch(e => { console.error(e); process.exit(1); });
