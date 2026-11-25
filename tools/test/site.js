// The site as GitHub Pages serves it (pages.yml), for the page tests: every request to
// https://batvani.github.io/school-widget/… is answered from the repo; anything else is refused and
// recorded. open(url) → { page, ctx, requests, errors, went(), copied(), qrs() }: jumps (window.__go),
// copies (navigator.clipboard) and QR links (window.__qr) are caught instead of done.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "../.."), P = (...a) => path.join(ROOT, ...a);
const SITE = "https://batvani.github.io/school-widget/";
// served path → repo file (keep in step with pages.yml)
const LANDING = ["index.html", "demo.js", "widgets.js", "widgets.css", "page.js"];
function file(p) {
  if (p === "" || p === "index.html") return P("landing/index.html");
  if (LANDING.includes(p)) return P("landing", p);
  if (p === "install/" || p === "install/index.html") return P("install/index.html");
  if (/^ai\/(prompt(-en)?\.txt|install-script\.js|INSTRUCTIONS\.md)$/.test(p)) return P(p);
  if (p === "school-widget.js") return P("school-widget.js");
  return null;
}
const TYPES = { html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8", css: "text/css; charset=utf-8" };

async function open(browser, url, o = {}) {
  const ctx = await browser.newContext({ viewport: o.viewport || { width: 375, height: 812 }, colorScheme: o.colorScheme || "dark",
    reducedMotion: o.reducedMotion || "no-preference", hasTouch: !!o.touch, isMobile: !!o.touch });
  const page = await ctx.newPage(), requests = [], errors = [], outside = [];
  page.on("request", r => requests.push(r.url()));
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await ctx.route("**/*", route => {
    const u = new URL(route.request().url());
    if (!u.href.startsWith(SITE)) { outside.push(u.href); return route.abort(); }
    const f = file(decodeURIComponent(u.pathname.slice("/school-widget/".length)));
    if (!f || !fs.existsSync(f)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: fs.readFileSync(f), contentType: TYPES[f.split(".").pop()] || "text/plain; charset=utf-8" });
  });
  await page.addInitScript(() => {
    window.__went = []; window.__go = u => window.__went.push(u); window.__qrs = []; window.__qr = u => window.__qrs.push(u);
    window.__copied = []; Object.defineProperty(navigator, "clipboard", { value: { writeText: t => { window.__copied.push(t); return Promise.resolve(); } } });
  });
  if (o.init) await page.addInitScript(o.init);
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(o.wait == null ? 300 : o.wait);
  return {
    page, ctx, requests, errors, outside,
    went: () => page.evaluate(() => window.__went), copied: () => page.evaluate(() => window.__copied), qrs: () => page.evaluate(() => window.__qrs),
    text: s => page.$eval(s, e => e.textContent.trim()), close: () => ctx.close()
  };
}
module.exports = { SITE, ROOT, P, open, file, LANDING };
