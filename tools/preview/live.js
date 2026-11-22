// The menu page live in Chromium, with the real script behind it (run.js under the mock): the
// page's uchilishte:// links go to the script's shouldAllowRequest, and the script's loadHTML /
// evaluateJavaScript go to the page. Used by tools/test/editor.test.js and editor.js (renders).
// live(time, runOpts, drive, { scheme }) → run()'s result; drive(page, settle) taps the page.
const run = require("./run");
const { chromium } = require("playwright");
let browser = null;
async function live(time, opts, drive, o = {}) {
  browser = browser || await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, colorScheme: o.scheme || "dark" });
  let wv = null, pending = Promise.resolve(), presented = false;
  page.on("request", r => { if (r.url().startsWith("uchilishte://") && wv && wv.shouldAllowRequest) pending = pending.then(() => wv.shouldAllowRequest({ url: r.url() })); });
  const settle = async (ms = 120) => { await page.waitForTimeout(ms); await pending; await page.waitForTimeout(30); };
  class WebView {
    constructor() { wv = this; }
    async loadHTML(h) { this.html = h; await page.setContent(h); }
    async present() {
      if (presented) return; // only the first page is driven; later ones close at once
      presented = true;
      try { await drive(page, settle); } catch (e) { this.error = e; }
      await settle();
    }
    async evaluateJavaScript(js) { try { return await page.evaluate(js); } catch (e) { return null; } }
  }
  let view = null;
  const r = await run(time, "medium", Object.assign({}, opts, { app: true, WebView: class extends WebView { constructor() { super(); view = this; } } }));
  await page.close();
  if (view && view.error) throw view.error;
  return r;
}
live.close = async () => { if (browser) await browser.close(); browser = null; };
module.exports = live;
