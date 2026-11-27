// The landing page: everything that moves or reacts.
(function () {
  "use strict";
  var SHORTCUT_LINK = "https://www.icloud.com/shortcuts/554d0ac4d0b9403c8d8fd2f549fd5f68"; // the Shortcut's iCloud link (shortcut/STEPS.md; tools/instructions.js reads it here)

  /*QR*/ // a copy of qrSvg in school-widget.js (the landing test checks they match)
  // QR code (byte mode, error correction L, versions 1–40) as an SVG. After Project Nayuki's
  // QR Code generator (MIT License, https://www.nayuki.io/page/qr-code-generator-library).
  function qrSvg(text) {
    const ECC = [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30];
    const BLK = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25];
    const raw = v => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; };
    const cap = v => Math.floor(raw(v) / 8) - ECC[v] * BLK[v];
    const bytes = Array.from(new TextEncoder().encode(text));
    let v = 1;
    while (v <= 40 && 4 + (v < 10 ? 8 : 16) + bytes.length * 8 > cap(v) * 8) v++;
    if (v > 40) return "";
    const bits = [], put = (x, n) => { for (let i = n - 1; i >= 0; i--) bits.push((x >>> i) & 1); };
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
    const cw = cap(v);
    put(0, Math.min(4, cw * 8 - bits.length)); put(0, (8 - bits.length % 8) % 8);
    for (let p = 0xec; bits.length < cw * 8; p ^= 0xec ^ 0x11) put(p, 8);
    const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
    // Reed–Solomon over GF(256)
    const mul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z; };
    const deg = ECC[v], div = new Array(deg).fill(0); div[deg - 1] = 1;
    for (let i = 0, root = 1; i < deg; i++) { for (let j = 0; j < deg; j++) { div[j] = mul(div[j], root); if (j + 1 < deg) div[j] ^= div[j + 1]; } root = mul(root, 2); }
    const rem = dat => { const r = new Array(deg).fill(0); for (const b of dat) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= mul(c, f); }); } return r; };
    const nb = BLK[v], rc = Math.floor(raw(v) / 8), short = nb - rc % nb, sl = Math.floor(rc / nb), blocks = [];
    for (let i = 0, k = 0; i < nb; i++) { const d = data.slice(k, k + sl - deg + (i < short ? 0 : 1)); k += d.length; const e = rem(d); if (i < short) d.push(0); blocks.push(d.concat(e)); }
    const all = [];
    for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== sl - deg || j >= short) all.push(b[i]); });
    // the modules
    const n = v * 4 + 17, M = [...Array(n)].map(() => new Array(n).fill(false)), F = [...Array(n)].map(() => new Array(n).fill(false));
    const set = (x, y, on) => { M[y][x] = on; F[y][x] = true; };
    for (let i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    for (const [cx, cy] of [[3, 3], [n - 4, 3], [3, n - 4]]) for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < n && y >= 0 && y < n) set(x, y, d !== 2 && d !== 4);
    }
    if (v > 1) {
      const na = Math.floor(v / 7) + 2, step = Math.floor((v * 8 + na * 3 + 5) / (na * 4 - 4)) * 2, pos = [6];
      for (let p = n - 7; pos.length < na; p -= step) pos.splice(1, 0, p);
      pos.forEach((a, i) => pos.forEach((b, j) => {
        if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) return;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(a + dx, b + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }));
    }
    const format = mask => {
      const d = (1 << 3) | mask; let r = d; // error correction L = 01
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = ((d << 10) | r) ^ 0x5412, bit = i => ((b >>> i) & 1) === 1;
      for (let i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) set(n - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) set(8, n - 15 + i, bit(i));
      set(8, n - 8, true);
    };
    format(0);
    if (v >= 7) {
      let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
      const b = (v << 12) | r;
      for (let i = 0; i < 18; i++) { const on = ((b >>> i) & 1) === 1, a = n - 11 + i % 3, c = Math.floor(i / 3); set(a, c, on); set(c, a, on); }
    }
    for (let right = n - 1, i = 0; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < n; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, y = ((right + 1) & 2) === 0 ? n - 1 - vert : vert;
        if (!F[y][x] && i < all.length * 8) { M[y][x] = ((all[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
      }
    }
    const MASK = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
      (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
    const flip = k => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!F[y][x] && MASK[k](x, y)) M[y][x] = !M[y][x]; };
    // the mask with the lowest penalty (runs, 2×2 blocks, balance)
    const penalty = () => {
      let p = 0, dark = 0;
      for (let a = 0; a < n; a++) for (const row of [true, false]) {
        let run = 1;
        for (let b = 1; b <= n; b++) {
          const same = b < n && (row ? M[a][b] === M[a][b - 1] : M[b][a] === M[b - 1][a]);
          if (same) run++; else { if (run >= 5) p += run - 2; run = 1; }
        }
      }
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        if (M[y][x]) dark++;
        if (x < n - 1 && y < n - 1 && M[y][x] === M[y][x + 1] && M[y][x] === M[y + 1][x] && M[y][x] === M[y + 1][x + 1]) p += 3;
      }
      return p + Math.floor(Math.abs(dark * 20 - n * n * 10) / (n * n)) * 10;
    };
    let best = 0, low = Infinity;
    for (let k = 0; k < 8; k++) { flip(k); format(k); const p = penalty(); if (p < low) { low = p; best = k; } flip(k); }
    flip(best); format(best);
    let path = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (M[y][x]) path += `M${x + 4},${y + 4}h1v1h-1z`;
    return `<svg class="qr" viewBox="0 0 ${n + 8} ${n + 8}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
  }
  /*QR end*/

  // ───── helpers ─────
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var go = function (u) { (window.__go || function (x) { location.href = x; })(u); };
  var SITE = location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, ""); // …/school-widget/
  var SCRIPT_NAME = "School Widget", SHORTCUT_NAME = "School Widget Installer";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var dark = matchMedia("(prefers-color-scheme: dark)");
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };

  // ───── the demo day: one clock for every widget on the page ─────
  var RANGE = SW_DEMO.RANGE, M = SW_DEMO.MOMENTS;
  var T = M.inClass, mode = dark.matches ? "dark" : "light", modeSet = false;
  var holdUntil = 0, glide = null, mounts = [], menu = null;
  var hm = function (m, pad) { var h = Math.floor(m / 60); return (pad && h < 10 ? "0" : "") + h + ":" + String(m % 60).padStart(2, "0"); };

  function draw() {
    mounts.forEach(function (w) { w.update(T); });
    if (menu) menu.update(T);
    $$("[data-clock]").forEach(function (e) { e.textContent = hm(T, e.getAttribute("data-clock") === "pad"); });
    var sl = $("#slider");
    if (sl) { sl.value = T; sl.style.setProperty("--p", (T - RANGE[0]) / (RANGE[1] - RANGE[0]) * 100 + "%"); }
  }
  function setT(m) { m = Math.max(RANGE[0], Math.min(RANGE[1], Math.round(m))); if (m !== T) { T = m; draw(); } }
  function hold(ms) { holdUntil = Date.now() + ms; }
  function glideTo(m) {
    if (reduce.matches) { setT(m); hold(1500); return; }
    var from = T, t0 = performance.now(), len = Math.min(1000, 250 + Math.abs(m - from) * 2);
    glide = { m: m };
    (function step(now) {
      if (!glide || glide.m !== m) return;
      var k = Math.min(1, (now - t0) / len); k = 1 - Math.pow(1 - k, 3);
      setT(from + (m - from) * k);
      if (k < 1) requestAnimationFrame(step); else { glide = null; hold(1500); }
    })(t0);
    hold(len + 1500);
  }
  function setMode(m, user) {
    if (user) modeSet = true;
    mode = m;
    mounts.forEach(function (w) { if (w.kind.indexOf("lock") !== 0) w.setMode(m); });
    if (menu) menu.setMode(m);
    var d = $("#dk"), l = $("#lt");
    if (d) { d.setAttribute("aria-pressed", m === "dark"); l.setAttribute("aria-pressed", m === "light"); }
  }

  function boot() {
    $$("[data-w]").forEach(function (el) {
      var kind = el.getAttribute("data-w"), w = SW.mount(el, kind, { min: T, mode: mode });
      w.kind = kind; mounts.push(w);
      el.addEventListener("click", function () { jumpPrep($("#menu")); $("#menu").scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" }); });
    });
    var mm = $("[data-menu]");
    if (mm) {
      menu = SW.mountMenu(mm, { tab: "today", min: T, mode: mode });
      mm.addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) menu.setTab(b.getAttribute("data-tab")); });
    }
    setMode(mode);
    draw();
    // the day keeps running; touching the slider or a shortcut only moves it, and it carries on 1.5 s later
    if (!reduce.matches) setInterval(function () {
      if (document.hidden || Date.now() < holdUntil || glide) return;
      setT(T >= RANGE[1] ? RANGE[0] : T + 1);
    }, 700);
    var sl = $("#slider");
    sl.min = RANGE[0]; sl.max = RANGE[1];
    sl.addEventListener("input", function () { glide = null; T = +sl.value; hold(1500); draw(); });
    sl.addEventListener("pointerdown", function () { glide = null; hold(60000); });
    ["pointerup", "pointercancel", "blur"].forEach(function (ev) { sl.addEventListener(ev, function () { hold(1500); }); });
    $$("[data-at]").forEach(function (b) { b.addEventListener("click", function () { glideTo(+b.getAttribute("data-at")); }); });
    $("#dk").addEventListener("click", function () { setMode("dark", true); });
    $("#lt").addEventListener("click", function () { setMode("light", true); });
    dark.addEventListener("change", function () { if (!modeSet) setMode(dark.matches ? "dark" : "light"); });
  }

  // ───── scaling (phones and stages keep Apple's sizes, then shrink to fit) ─────
  function fit() {
    $$(".phone").forEach(function (p) { var k = p.clientWidth / 414; if (k) p.style.setProperty("--k", k); });
    $$(".fit").forEach(function (f) {
      var c = f.firstElementChild; if (!c) return;
      c.style.transform = ""; c.style.transformOrigin = "0 0";
      var w = c.offsetWidth, h = c.offsetHeight, p = f.parentElement, cs = getComputedStyle(p);
      var avail = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - (innerWidth < 821 ? 24 : 0);
      var k = Math.min(1, avail / w);
      if (!w || avail <= 0) return;
      c.style.transform = k < 1 ? "scale(" + k + ")" : "";
      f.style.width = w * k + "px"; f.style.height = h * k + "px";
    });
    pill();
  }

  // ───── widget sizes: tabs with a sliding highlight ─────
  var CAPS = {
    small: "<b>Small.</b> The class you are in, the minutes left and the room.",
    medium: "<b>Medium.</b> The same, plus the next three classes.",
    large: "<b>Large.</b> The whole day, with done classes dimmed and the days to the next break.",
    lock: "<b>Lock Screen.</b> A round, a rectangular and a one-line widget, always white."
  };
  function pill() {
    var on = $("#sizes [aria-selected=true]"), p = $("#sizes .pill");
    if (on && p && on.offsetWidth) { p.style.width = on.offsetWidth + "px"; p.style.transform = "translateX(" + on.offsetLeft + "px)"; }
  }
  function pickSize(s) {
    $$("#sizes [data-s]").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-s") === s ? "true" : "false"); b.tabIndex = b.getAttribute("data-s") === s ? 0 : -1; });
    $("#sizeStage .layers").setAttribute("data-on", s);
    $("#sizeCap").innerHTML = CAPS[s];
    pill();
  }
  function sizes() {
    $$("#sizes [data-s]").forEach(function (b) {
      b.addEventListener("click", function () { pickSize(b.getAttribute("data-s")); });
      b.addEventListener("keydown", function (e) {
        var l = $$("#sizes [data-s]"), i = l.indexOf(b), d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { var n = l[(i + d + l.length) % l.length]; pickSize(n.getAttribute("data-s")); n.focus(); e.preventDefault(); }
      });
    });
    pickSize("small");
  }

  // ───── the phone's ☰ list and the Install bar ─────
  function phoneBits() {
    var mb = $("#mb"), sheet = $("#sheet");
    var close = function () { sheet.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); };
    mb.addEventListener("click", function () {
      var o = sheet.classList.toggle("open"); mb.setAttribute("aria-expanded", o);
    });
    $$("#sheet a").forEach(function (a) { a.addEventListener("click", close); });
    addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    // one rule: shown when the hero buttons are above the screen and neither Try it nor Install is in the middle of it
    var bar = $("#bar"), ctas = $(".hero .ctas"), ticking = false;
    var over = function (id) { var r = document.getElementById(id).getBoundingClientRect(), y = innerHeight * 0.4; return r.top < y && r.bottom > y; };
    var update = function () {
      ticking = false;
      bar.classList.toggle("show", ctas.getBoundingClientRect().bottom < 0 && !over("try") && !over("install"));
    };
    var queue = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", queue, { passive: true }); addEventListener("resize", queue);
    update();
    // the bar at the top slides away while you scroll down and comes back when you scroll up
    var nav = $("nav"), lastY = scrollY;
    addEventListener("scroll", function () {
      var y = scrollY;
      if (!phone.matches || y < 60 || sheet.classList.contains("open") || performance.now() < jumping) { lastY = y; if (performance.now() >= jumping) nav.classList.toggle("away", false); return; }
      if (Math.abs(y - lastY) < 8) return;
      nav.classList.toggle("away", y > lastY); lastY = y;
    }, { passive: true });
    phone.addEventListener && phone.addEventListener("change", function () { nav.classList.toggle("away", false); });
    // a link to a section: going down, the bar hides and the section starts at the top; going up, the bar shows above it
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'), el = a && document.getElementById(a.getAttribute("href").slice(1));
      if (el) jumpPrep(el);
    }, true);
  }
  var phone = matchMedia("(max-width:820px)"), jumping = 0;
  function jumpPrep(el) {
    var nav = $("nav"), root = document.documentElement;
    if (!phone.matches) { root.style.scrollPaddingTop = ""; return; }
    var down = el.getBoundingClientRect().top > 0 && el.id !== "top";
    nav.classList.toggle("away", down);
    root.style.scrollPaddingTop = down ? "0px" : "";
    jumping = performance.now() + 1200; // the jump's own scrolling doesn't move the bar
  }

  // ───── install steps ─────
  function steps() {
    var KEY = "sw-install-done", steps = $$("#install .step"), prog = $("#progress"), label = $("#plabel");
    var done = Math.max(0, Math.min(3, parseInt(store.get(KEY), 10) || 0));
    function render() {
      steps.forEach(function (s, i) { s.classList.toggle("done", i < done); s.classList.toggle("cur", i === done); s.classList.toggle("later", i > done); });
      prog.setAttribute("data-done", done);
      label.textContent = done >= 3 ? "All three steps done" : "Step " + (done + 1) + " of 3";
    }
    function tick(i) { if (done <= i) { done = i + 1; store.set(KEY, done); render(); } }
    $("#store").addEventListener("click", function () { tick(0); });
    $("#add").addEventListener("click", function () { tick(1); });
    $("#run").addEventListener("click", function () {
      tick(2);
      go("shortcuts://run-shortcut?name=" + encodeURIComponent(SHORTCUT_NAME));
    });
    $("#add").href = SHORTCUT_LINK;
    render();
  }

  // ───── copy buttons: the files are fetched when the page opens (Safari copies only straight after a tap) ─────
  var texts = {};
  function load(key, path) {
    texts[key] = null;
    return fetch(SITE + path).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (t) { texts[key] = t; }, function () { texts[key] = false; });
  }
  function copy(t) { return navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject(new Error("no clipboard")); }
  // a short pop on success, a small shake on a failure (the classes are in index.html)
  function reply(b, how) { b.classList.remove("ok", "no"); void b.offsetWidth; b.classList.add(how); setTimeout(function () { b.classList.remove(how); }, 500); }
  function copyBtn(id, key, done) {
    var b = $("#" + id), label = b.textContent;
    var flash = function (s, how) { b.textContent = s; reply(b, how); setTimeout(function () { b.textContent = label; }, 2500); };
    b.addEventListener("click", function () {
      var t = texts[key];
      if (!t) { flash(t === null ? "Loading, tap again" : "Could not load. Check the internet", "no"); return; }
      copy(t).then(function () { flash(done, "ok"); }, function () { flash("Could not copy", "no"); });
    });
  }
  function copying() {
    load("script", "ai/install-script.js"); load("prompt", "ai/prompt-en.txt");
    copyBtn("cs", "script", "Copied. Paste it into Scriptable");
    copyBtn("ai", "prompt", "Copied. Paste it into your AI");
  }

  // ───── a timetable handed over by install/ (…/#install&z=… or &d=…) ─────
  function handover() {
    var m = location.hash.match(/[#&]([zd])=([A-Za-z0-9_\-]+)/);
    if (!m) return;
    var payload = "school-widget:" + m[1] + ":" + m[2], tt = $("#tt");
    tt.hidden = false;
    var flash = function (b, s, how) { var l = b.textContent; b.textContent = s; reply(b, how); setTimeout(function () { b.textContent = l; }, 2500); };
    $("#ttCopy").addEventListener("click", function () { var b = this; copy(payload).then(function () { flash(b, "Copied. Tap Paste in School Widget", "ok"); }, function () { flash(b, "Could not copy", "no"); }); });
    $("#ttOpen").addEventListener("click", function () { go("https://open.scriptable.app/run/" + encodeURIComponent(SCRIPT_NAME) + "?data=" + encodeURIComponent(payload)); });
  }

  // ───── the AI's answer → a QR code of install/#z=… ─────
  function b64u(a) { var s = ""; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function answerLink(text) {
    var base = SITE + "install/";
    var l = String(text).match(/https:\/\/\S+?\/install\/?#[zd]=[A-Za-z0-9_\-]+/);
    if (l) return Promise.resolve(l[0]);
    var j = String(text).match(/```(?:json)?\s*([\s\S]*?)```/), raw = j ? j[1] : String(text).slice(String(text).indexOf("{"), String(text).lastIndexOf("}") + 1), d;
    try { d = JSON.parse(raw); } catch (e) { return Promise.resolve(null); }
    if (!d || typeof d !== "object" || !d.week || !d.bells) return Promise.resolve(null);
    var bytes = new TextEncoder().encode(JSON.stringify(d));
    if (typeof CompressionStream !== "function") return Promise.resolve(base + "#d=" + b64u(bytes));
    return new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer()
      .then(function (z) { return base + "#z=" + b64u(new Uint8Array(z)); });
  }
  function qrBox() {
    $("#mk").addEventListener("click", function () {
      var out = $("#qr");
      answerLink($("#ans").value).then(function (u) {
        if (!u) { out.innerHTML = "<p>There is no timetable in that. Paste the AI's whole answer, or the link it gave you.</p>"; return; }
        if (window.__qr) window.__qr(u); // the tests read the link
        var svg = u.length <= 2000 && qrSvg(u);
        out.innerHTML = svg ? '<div class="qrbox">' + svg + "</div><p>Scan it with your iPhone's camera.</p>" : "<p>That timetable is too big for a QR code. Paste it into School Widget instead.</p>";
      });
    });
  }

  // ───── the month calendar (December 2026, made up) ─────
  function calendar() {
    var g = $("#cal"), h = "";
    ["M", "T", "W", "T", "F", "S", "S"].forEach(function (d) { h += '<div class="h" aria-hidden="true">' + d + "</div>"; });
    var first = 1; // 1 December 2026 is a Tuesday: one empty cell after Monday
    for (var i = 0; i < first; i++) h += "<div></div>";
    for (var d = 1; d <= 31; d++) {
      var wd = (first + d - 1) % 7, c = "";
      if (d >= 24) c = "off"; else if (d === 9 || d === 10) c = "ex"; else if (wd >= 5) c = "we";
      if (d === 3) c += " today";
      h += '<div class="' + c + '">' + d + "</div>";
    }
    g.innerHTML = h;
  }

  // ───── accordions: one slide + fade, the same both ways (Safari's own close left a ghost line) ─────
  function accordions() {
    $$("details").forEach(function (d) {
      var sum = d.querySelector("summary"), box = document.createElement("div");
      box.className = "acc";
      while (sum.nextSibling) box.appendChild(sum.nextSibling);
      d.appendChild(box);
      var anim = null, shown = d.open; // shown: open, or opening (not closing)
      sum.addEventListener("click", function (e) {
        e.preventDefault();
        shown = !shown;
        if (reduce.matches || !box.animate) { d.open = shown; return; }
        // start from where it is now: mid-way if it was still moving, else fully closed / open
        // (a closed <details> still reports its hidden content's full height, so don't measure it then)
        var now = anim ? box.getBoundingClientRect().height : shown ? 0 : box.scrollHeight;
        var fade = anim ? +getComputedStyle(box).opacity : shown ? 0 : 1;
        if (anim) anim.cancel();
        d.open = true; d.classList.toggle("closing", !shown);
        var full = box.scrollHeight;
        anim = box.animate([
          { height: now + "px", opacity: fade, transform: "translateY(" + (-8 * (1 - fade)) + "px)" },
          { height: (shown ? full : 0) + "px", opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(-8px)" }
        ], { duration: 340, easing: "cubic-bezier(.25,.8,.25,1)" });
        anim.onfinish = function () { anim = null; if (!shown) d.open = false; d.classList.toggle("closing", false); };
      });
    });
  }

  // ───── start ─────
  function init() {
    accordions(); boot(); sizes(); phoneBits(); steps(); copying(); handover(); qrBox(); calendar();
    fit(); addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    // sizes are set by this script, so the browser's own jump to #id lands too early: go again once laid out
    // (a timetable address, #install&z=…, is not an element id at all)
    var id = (location.hash.match(/^#([A-Za-z]+)/) || [])[1], target = id && document.getElementById(id);
    if (target && !target.offsetParent) target = $("#timetable"); // hidden here (#computer on a phone)
    if (target) {
      jumpPrep(target);
      var there = function () { target.scrollIntoView({ behavior: "instant", block: "start" }); };
      there(); addEventListener("load", there); setTimeout(there, 250);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
