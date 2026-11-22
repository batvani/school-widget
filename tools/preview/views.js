// Renders the full-screen menu (tap on the widget) at 4 moments into out/view-*.html.
const fs = require("fs"), path = require("path");
const run = require("./run");
(async () => {
  fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
  for (const [t, n] of [["2026-11-05T10:20", "class"], ["2026-11-05T15:00", "after"], ["2026-12-28T10:00", "xmas"], ["2026-11-05T10:47", "break"]]) {
    const r = await run(t, "medium", { app: true, query: { view: "today" } });
    fs.writeFileSync(path.join(__dirname, "out", `view-${n}.html`), r.html);
  }
})();
