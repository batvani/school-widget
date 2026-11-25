// School Widget's landing page: hand-made HTML copies of the real widgets and of the full-screen menu.
// Written once, no build step. Everything is worked out the way school-widget.js works it out
// (T sizes, colour table, rings, link lines) and laid out with absolute positions, so the copy
// is the script's own layout; tools/test/widgets.test.js compares each text's words, box and colour
// and every picture's box with the real script rendered by the preview mock.
// API: window.SW = { html, mount, state, mountMenu }  (see landing/PLAN.md, "Build contract")
(function (root) {
  "use strict";
  var DEMO = root.SW_DEMO.DEMO;
  var NS = "http://www.w3.org/2000/svg";
  var LH = 1.15; // the line box of one line of text, × its size (also set in widgets.css)
  var reduced = function () { return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches); };

  // ───────────── sizes: the script's T ─────────────
  var FS = { xs: 11, sm: 12, md: 13, base: 15, lg: 17, xl: 20, xl2: 24, xl3: 28, xl4: 32, xl5: 36, xl6: 40 };
  var SP = { xxs: 2, xs: 4, sm: 6, md: 8, lg: 12, xl: 16 };
  var PAD = 16, FLEX = 8, SLACK = 4, HAIR = 1, SHRINK = 2;
  var RING = { row: { d: 22, w: 3, fs: 11 }, list: { d: 26, w: 3.5, fs: 12 }, cellCompact: { d: 36, w: 5 }, cell: { d: 40, w: 6 }, hero: { d: 64, w: 8 },
    lockRect: { d: 52, w: 5 }, lockRound: { d: 64, w: 6 } };
  var HERO = { regular: { ring: "cell", room: FS.xl2, value: FS.xl5, unit: FS.lg, name: FS.xl }, compact: { ring: "cellCompact", room: FS.xl2, value: FS.xl3, unit: FS.base, name: FS.lg, note: FS.sm } };
  var LINK = { ringDash: [3, 2.5], split: 2, dashMin: 9, stub: 6 };
  var LOCK = { name: 15, line: 14, sub: 13, ringFs: 24, roundFs: 28, capFs: 10, flag: 11, inline: 13, inlineFlag: 12, gap: 8, lineGap: 1, textW: 84, nameHotW: 70, pillPad: 4, pillR: 5, flagGap: 4 };
  var SIZE = { small: [155, 155], medium: [329, 155], large: [329, 352], lockRect: [155, 66], lockRound: [68, 68], lockInline: [260, 22] };

  // ───────────── colours: makeColors (Dark / Light) ─────────────
  var COL = {
    dark: { text: "#fff", dim: "rgba(255,255,255,.65)", divider: "rgba(255,255,255,.12)", red: "#ff453a", faded: "rgba(255,255,255,.38)", fadedRed: "rgba(255,69,58,.45)",
      tintClass: "rgba(48,209,88,.18)", tintBreak: "rgba(255,255,255,.08)", faint: "rgba(255,255,255,.2)", grey: "#939395", normal: "rgba(255,255,255,.9)",
      ringRed: "#ff453a", ringFaded: "rgba(255,255,255,.22)", ringRedFaded: "rgba(255,69,58,.4)", green: "#30d158" },
    light: { text: "#000", dim: "rgba(60,60,67,.62)", divider: "rgba(0,0,0,.1)", red: "#ff3b30", faded: "rgba(0,0,0,.36)", fadedRed: "rgba(255,59,48,.45)",
      tintClass: "rgba(48,209,88,.16)", tintBreak: "rgba(0,0,0,.05)", faint: "rgba(0,0,0,.09)", grey: "#a9a9ad", normal: "rgba(0,0,0,.7)",
      ringRed: "#ff453a", ringFaded: "rgba(0,0,0,.14)", ringRedFaded: "rgba(255,69,58,.4)", green: "#30d158" },
    // the Lock Screen is always white (lockColors)
    lock: { text: "#fff", dim: "rgba(255,255,255,.72)", mid: "rgba(255,255,255,.88)", track: "rgba(255,255,255,.28)", black: "#000", capDark: "rgba(0,0,0,.75)" }
  };

  // ───────────── text widths, as the script estimates them ─────────────
  function emWidth(s, rounded) {
    var w = 0;
    String(s).split("").forEach(function (ch) {
      w += /[0-9]/.test(ch) ? 0.66 : rounded ? (/[:.·]/.test(ch) ? 0.32 : /[а-яА-Я]/.test(ch) ? 0.7 : /[A-Z]/.test(ch) ? 0.74 : 0.64)
        : (/[ .,:·]/.test(ch) ? 0.3 : /[А-ЯA-Z]/.test(ch) ? 0.74 : 0.62);
    });
    return w;
  }
  function fitSize(s, size, w, bold) { return Math.max(9, Math.min(size, Math.floor(w / (emWidth(s) * (bold ? 1.06 : 1))))); }
  function fitFs(text, boxW, boxH, base) { var w = emWidth(text, true) || 1; return Math.max(7, Math.floor(Math.min(base, boxW * 0.96 / w, boxH / 1.22))); }
  function ringRoom(o, kind) {
    var D = o.d - 2 * o.w - 2, f = kind === "wide" ? [0.84, 0.54] : kind === "two" ? [0.72, 0.69] : [0.7, 0.7];
    return { w: Math.min(D * f[0], o.d - 18), h: Math.min(D * f[1], o.d - 18) };
  }
  var pxFloor = function (h) { return Math.floor(h * 3 + 1e-9) / 3; };
  var pxCeil = function (h) { return Math.ceil(h * 3 - 1e-9) / 3; };
  var hm = function (m) { m = Math.round(m); return (m < 600 ? "0" : "") + Math.floor(m / 60) + ":" + (m % 60 < 10 ? "0" : "") + (m % 60); };
  var mm = function (t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; };
  var clamp01 = function (x) { return Math.max(0, Math.min(1, x)); };
  var isNumRoom = function (r) { return /^\d+[а-яa-z]?$/i.test(String(r || "")); };
  var roomLabel = function (r) { return isNumRoom(r) ? "Room " + r : String(r || ""); };

  // ───────────── the demo day ─────────────
  var BELLS = DEMO.bells.map(function (b) { return [mm(b[0]), mm(b[1])]; });
  function lessons(day) {
    return (DEMO.week[day] || []).map(function (c, i) {
      return { num: i + 1, name: c.name, short: c.name, room: c.room || "", hot: !!c.important, start: BELLS[i][0], end: BELLS[i][1] };
    });
  }
  var TODAY = lessons(4), TOMORROW = lessons(5);
  var BREAK_NAME = "Christmas break", DAYS_LEFT = 21; // days from the demo's Thursday, 3 Dec, to the break (24 Dec), as the script counts them

  // computeState: the script's own (class / break / done), over the demo day
  function compute(min) {
    var s = { min: min, lessons: TODAY, upcoming: [], nextLessons: TOMORROW };
    var cur = TODAY.filter(function (l) { return l.start <= min && min < l.end; })[0];
    if (cur) {
      s.mode = "class"; s.current = cur;
      s.upcoming = TODAY.filter(function (l) { return l.start >= cur.end; });
      s.progress = clamp01((min - cur.start) / (cur.end - cur.start));
      s.minsLeft = Math.ceil(cur.end - min - 1e-9);
    } else {
      var nx = TODAY.filter(function (l) { return l.start > min; })[0];
      if (nx) {
        var prev = TODAY.filter(function (l) { return l.end <= min; }).pop();
        s.mode = "break"; s.next = nx; s.before = !prev;
        s.upcoming = TODAY.filter(function (l) { return l.start > nx.start; });
        var bs = prev ? prev.end : nx.start - 60;
        s.progress = clamp01((min - bs) / (nx.start - bs));
        s.minsTo = Math.ceil(nx.start - min - 1e-9);
      } else s.mode = "done";
    }
    return s;
  }
  function stateOf(min) {
    var s = compute(min), n = s.mode === "class" ? TODAY.filter(function (l) { return l.start >= s.current.end; })[0] : s.next;
    var pick = function (l) { return l ? { period: l.num, name: l.name, room: l.room, start: hm(l.start) } : null; };
    if (s.mode === "class") return { kind: "class", period: s.current.num, name: s.current.name, room: s.current.room, left: s.minsLeft, next: pick(n) };
    if (s.mode === "break") return { kind: s.before ? "before" : "break", period: s.next.num, name: s.next.name, room: s.next.room, left: s.minsTo, next: pick(s.next) };
    var t = TOMORROW[0];
    return { kind: "after", period: t.num, name: t.name, room: t.room, left: 0, next: pick(t) };
  }

  // focus(): the class the widget is about
  function focus(s) {
    var live = s.mode !== "done", isClass = s.mode === "class", l = isClass ? s.current : live ? s.next : s.nextLessons[0], f = { live: live, isClass: isClass, l: l };
    if (live) {
      f.sub = isClass ? "until " + hm(l.end) : s.minsTo <= 60 ? "starts at " + hm(l.start) : "first class";
      f.ring = { p: s.progress, color: isClass ? "green" : l.hot ? "ringRed" : "normal" };
    } else {
      f.day = "Tomorrow";
      f.ring = { p: 1, color: l.hot ? "ringRed" : "grey" };
    }
    f.time = hm(l.start);
    f.endTime = live ? s.lessons[s.lessons.length - 1].end : null;
    return f;
  }
  var upcomingRing = function (l) { return { p: 1, color: l.hot ? "ringRed" : "grey" }; };

  // links between back-to-back classes in the same room
  function dayLinks(day) {
    return day.slice(0, -1).map(function (a, i) {
      var b = day[i + 1];
      if (b.num !== a.num + 1 || !a.room || a.room !== b.room) return null;
      return a.name === b.name ? "class" : "room";
    });
  }
  function linkColor(ls, states, f) {
    var done = states.every(function (x) { return x === "done"; });
    if (f.isClass && states.indexOf("now") >= 0) return "green";
    if (ls.every(function (l) { return l.hot; })) return done ? "ringRedFaded" : "ringRed";
    return done ? "ringFaded" : "grey";
  }

  // ───────────── specs: what a widget is made of ─────────────
  // t: text · row: a baseline row of texts · b: a box (tint, line, pill) · ring: a ring picture · icon
  function text(k, s, fs, wt, c, p) { // p: x (left) | xr (right edge) | xc (centre), cy (centre line)
    return { t: "t", k: k, s: String(s), fs: fs, wt: wt, c: c, x: p.x, xr: p.xr, xc: p.xc, cy: p.cy };
  }
  function box(k, x, y, w, h, bg, r, z) { return { t: "b", k: k, x: x, y: y, w: w, h: h, bg: bg, r: r || 0, z: z }; }
  function ring(k, x, y, o) { return Object.assign({ t: "ring", k: k, x: x, y: y }, o); }
  var up = function (a) { return a.filter(Boolean); };

  // ring number: ringNum / ringNumSmall (a ring with the class's number inside)
  function ringNum(k, cx, cy, o, num, color) {
    var fs, h = 0;
    if (o.d < 36) fs = o.fs;
    else { var rr = ringRoom(o, "square"); fs = fitFs(String(num), rr.w, rr.h, Math.round(o.d * 0.42)); }
    return text(k, num, fs, 700, color, { xc: cx, cy: cy });
  }

  // bigValue: "in 30 min" / "30 min" / "08:00" on one baseline; items shrink together to fit maxW
  function bigRow(k, x, cyTop, value, unit, fs, ufs, pre, c, maxW, right) {
    var psz = ufs;
    if (maxW) {
      var total = emWidth(value) * fs + (unit ? 3 + emWidth(unit) * ufs : 0) + (pre ? 5 + emWidth(pre) * psz : 0);
      if (total > maxW) { var q = maxW / total; fs = Math.floor(fs * q); ufs = Math.floor(ufs * q); psz = Math.floor(psz * q); }
    }
    var kids = [];
    if (pre) kids.push({ t: "t", k: "pre", s: pre, fs: psz, wt: 600, c: c.dim, ml: 0 });
    kids.push({ t: "t", k: "val", s: value, fs: fs, wt: 600, c: c.text, ml: pre ? 5 : 0 });
    if (unit) kids.push({ t: "t", k: "unit", s: unit, fs: ufs, wt: 600, c: c.dim, ml: 3 });
    return { t: "row", k: k, x: x, top: cyTop - fs * LH / 2, kids: kids, h: fs * LH };
  }
  function bigParts(s, f, fs) {
    if (!f.live) return { value: f.time, fs: fs };
    if (f.isClass) return { value: String(s.minsLeft), unit: "min", fs: fs };
    if (s.minsTo <= 60) return { value: String(s.minsTo), unit: "min", pre: "in", fs: fs };
    return { value: f.time, fs: fs - SHRINK };
  }
  var nameColor = function (l, c) { return l.hot ? c.red : c.text; };

  // ───────────── the hero cell (small; medium's left half) ─────────────
  function hero(o) {
    var s = o.s, f = o.f, l = f.l, c = o.c, out = [], note = !f.live ? { s: f.day, c: c.dim } : null;
    var d = note ? HERO.compact : HERO.regular, rg = RING[d.ring], W = o.W, tw = W - FLEX;
    var rfs = l.room ? fitSize(l.room, d.room, W - rg.d - SP.md - FLEX, true) : 0;
    var roomH = l.room ? (FS.sm + rfs) * LH : 0, H1 = Math.max(rg.d, roomH), ry = o.y0 + (H1 - rg.d) / 2;
    out.push(ring("hr", o.x0, ry, { d: rg.d, w: rg.w, p: f.ring.p, color: c[f.ring.color], track: c.faint }));
    out.push(ringNum("hn", o.x0 + rg.d / 2, ry + rg.d / 2, rg, l.num, c.text));
    if (l.room) {
      var pad = Math.max(1, Math.round(rfs * 0.05)), xr = o.x0 + W;
      out.push(text("hrl", "room", FS.sm, 600, c.dim, { xr: xr - pad, cy: o.y0 + FS.sm * LH / 2 }));
      out.push(text("hrm", l.room, rfs, 700, c.text, { xr: xr, cy: o.y0 + FS.sm * LH + rfs * LH / 2 }));
    }
    var y = o.B;
    if (note) { out.push(text("hnote", note.s, fitSize(note.s, d.note, tw), 600, note.c, { x: o.x0, cy: y - d.note * LH / 2 })); y -= d.note * LH; }
    var nfs = fitSize(l.short, d.name, tw, true);
    out.push(text("hname", l.short, nfs, 700, nameColor(l, c), { x: o.x0, cy: y - nfs * LH / 2 })); y -= nfs * LH;
    var b = bigParts(s, f, d.value);
    out.push(bigRow("hbig", o.x0, y - b.fs * LH / 2, b.value, b.unit, b.fs, d.unit, b.pre, c, tw - SLACK));
    return out;
  }

  function buildSmall(s, c) {
    return hero({ s: s, f: focus(s), c: c, x0: PAD, y0: PAD, W: 123, B: SIZE.small[1] - PAD });
  }

  // ───────────── medium (default layout) ─────────────
  function buildMedium(s, c) {
    var f = focus(s), out = [], H = SIZE.medium[1], dg = SP.xl, colW = Math.floor((297 - 2 * dg - HAIR) / 2), B = H - PAD;
    out = hero({ s: s, f: f, c: c, x0: PAD, y0: PAD, W: colW, B: B });
    out.push(box("div", PAD + colW + dg, PAD, HAIR, B - PAD, c.divider));
    var x0 = PAD + colW + dg + HAIR + dg;
    // the next classes; "End" closes the list when fewer than three are left
    var rows;
    if (!f.live) rows = s.nextLessons.slice(1, 4).map(function (l) { return { l: l }; });
    else { rows = s.upcoming.slice(0, 3).map(function (l) { return { l: l }; }); if (rows.length < 3) rows.push({ end: true, time: f.endTime }); }
    var day = f.live ? s.lessons : s.nextLessons, links = dayLinks(day), rg = RING.list, gap = SP.md;
    var rowH = pxCeil((FS.base + FS.sm) * 1.2), margin = (rowH - rg.d) / 2, textH = (FS.base + FS.sm) * LH, tw = colW - rg.d - gap;
    var at = function (it) { return it.l ? day.indexOf(it.l) : -1; };
    var link = function (a, b) { return a >= 0 && b === a + 1 ? links[a] : null; };
    var state = function (l) { return f.isClass && l === f.l ? "now" : "next"; };
    var piece = function (a, kind, o2) {
      return Object.assign({ w: rg.w, dash: kind === "room" ? LINK.ringDash : null, color: c[linkColor([day[a], day[a + 1]], [state(day[a]), state(day[a + 1])], f)] }, o2);
    };
    var items = rows.map(function (it, i) {
      var ix = at(it), upL = i ? link(at(rows[i - 1]), ix) : null, dn = i < rows.length - 1 ? link(ix, at(rows[i + 1])) : null;
      var stub = i === 0 ? link(day.indexOf(f.l), ix) : null, ext = null;
      if (upL || dn || stub) {
        var top = stub ? LINK.stub : 0;
        ext = { h: rowH + top, oy: top + margin, stub: !!stub,
          above: upL ? piece(ix - 1, upL, { phase: margin + gap }) : stub ? piece(ix - 1, stub, { fade: true }) : null,
          below: dn ? piece(ix, dn, { phase: 0 }) : null };
      }
      return { it: it, ix: ix, up: upL, ext: ext, h: ext ? ext.h : Math.max(rg.d, textH) };
    });
    var total = 0;
    items.forEach(function (r, i) { total += r.h + (i ? gap : 0); });
    var y = PAD + (H - 2 * PAD - total) / 2;
    items.forEach(function (r, i) {
      if (i) {
        if (r.up) out.push(ring("lg" + i, x0, y, { d: rg.d, w: rg.w, H: gap, gapPiece: piece(r.ix - 1, r.up, { phase: margin }), nodisc: true }));
        y += gap;
      }
      var it = r.it, kp = it.end ? "e" : it.l.num, ext = r.ext, cyR, ringY;
      if (ext) { ringY = y; cyR = y + ext.oy + rg.d / 2; } else { ringY = y + (r.h - rg.d) / 2; cyR = ringY + rg.d / 2; }
      var col = it.end ? null : upcomingRing(it.l);
      out.push(ring("r" + i, x0, ringY, { d: rg.d, w: rg.w, p: it.end ? 0 : 1, color: col ? c[col.color] : c.grey, track: c.faint, H: ext ? ext.h : rg.d, oy: ext ? ext.oy : 0, above: ext && ext.above, below: ext && ext.below, ext: !!ext }));
      if (ext) out[out.length - 1].y = y;
      if (!it.end) out.push(ringNum("rn" + i, x0 + rg.d / 2, cyR, rg, it.l.num, c.text));
      var tx = x0 + rg.d + gap, ty = ext && ext.stub ? y + r.h - textH : y + (r.h - textH) / 2;
      var name = it.end ? "End" : it.l.short, nf = fitSize(name, FS.base, tw, true);
      var sub = it.end ? hm(it.time) : [hm(it.l.start), it.l.room].filter(Boolean).join(" · "), sf = fitSize(sub, FS.sm, tw);
      out.push(text("rt" + i, name, nf, 700, it.end ? c.dim : nameColor(it.l, c), { x: tx, cy: ty + FS.base * LH / 2 }));
      out.push(text("rs" + i, sub, sf, 400, c.dim, { x: tx, cy: ty + FS.base * LH + FS.sm * LH / 2 }));
      y += r.h;
    });
    return out;
  }

  // ───────────── large ─────────────
  function buildLarge(s, c) {
    var f = focus(s), out = [], day = f.live ? s.lessons : s.nextLessons, n = day.length, G = { when: 76, gap: SP.lg, where: 68 };
    var what = 297 - G.when - G.gap - G.where, gap = SP.md, rg = RING.row, hr = RING.hero;
    // the script's rows: whole screen pixels high, as tall as the free height allows
    var heroH = Math.max(hr.d, (FS.xl + FS.xl4 + FS.md) * 1.2), fixed = heroH + gap + HAIR + 2 * gap + (HAIR + gap + FS.base * 1.2);
    var free = 320 - 2 - fixed - n * rg.d, padMin = (25 - rg.d) / 2;
    var rowH = pxFloor(rg.d + 2 * Math.max(padMin, Math.min(gap, free / (2 * n - 2)))), padV = (rowH - rg.d) / 2, near = Math.max(0, gap - padV);
    // the natural heights, centred in the widget (what the preview mock does)
    var b = bigParts(s, f, FS.xl4), nameH = FS.xl * LH, bigH = FS.xl4 * LH, noteH = FS.md * LH, textH = nameH + bigH + noteH, bandH = Math.max(hr.d, textH);
    var footH = FS.base * LH, content = bandH + gap + HAIR + near + n * rowH + near + HAIR + gap + footH;
    var top = PAD + (352 - 2 * PAD - content) / 2, cy0 = top + bandH / 2, tx = PAD + G.when + G.gap, l = f.l;
    // hero band
    out.push(ring("hr", PAD, cy0 - hr.d / 2, { d: hr.d, w: hr.w, p: f.ring.p, color: c[f.ring.color], track: c.faint }));
    out.push(ringNum("hn", PAD + hr.d / 2, cy0, hr, l.num, c.text));
    var ty = cy0 - textH / 2, nfs = fitSize(l.short, FS.xl, what, true);
    out.push(text("hname", l.short, nfs, 700, nameColor(l, c), { x: tx, cy: ty + nameH / 2 }));
    out.push(bigRow("hbig", tx, ty + nameH + bigH / 2, b.value, b.unit, b.fs, FS.base, b.pre, c, what - SLACK));
    var note = f.live ? f.sub : f.day;
    out.push(text("hnote", note, fitSize(note, FS.md, what), 600, c.dim, { x: tx, cy: ty + nameH + bigH + noteH / 2 }));
    if (l.room) {
      var rfs = fitSize(l.room, FS.xl2, G.where - FLEX, true), pad = Math.max(1, Math.round(rfs * 0.05)), rh = (FS.sm + rfs) * LH, ry = cy0 - rh / 2, xr = 329 - PAD;
      out.push(text("hrl", "room", FS.sm, 600, c.dim, { xr: xr - pad, cy: ry + FS.sm * LH / 2 }));
      out.push(text("hrm", l.room, rfs, 700, c.text, { xr: xr, cy: ry + FS.sm * LH + rfs * LH / 2 }));
    }
    var y = top + bandH + gap;
    out.push(box("l1", PAD, y, 297, HAIR, c.divider)); y += HAIR + near;
    // the day: ring | start time | name | room
    var states = day.map(function (x) { return !f.live ? "next" : x === f.l ? "now" : x.end <= s.min ? "done" : "next"; });
    var links = dayLinks(day), dashed = 2 * padV >= LINK.dashMin;
    var piece = function (i, above) {
      return { w: rg.w, color: c[linkColor([day[i], day[i + 1]], [states[i], states[i + 1]], f)], split: links[i] === "room" && !dashed ? LINK.split : 0,
        dash: links[i] === "room" && dashed ? LINK.ringDash : null, phase: above ? padV : 0 };
    };
    day.forEach(function (x, i) {
      var st = states[i], done = st === "done", now = st === "now", k = "d" + x.num, cy = y + rowH / 2;
      if (now) out.push(box("tint" + k, 8, y, 313, rowH, f.isClass ? c.tintClass : c.tintBreak, SP.md, 0));
      var ro = now ? f.ring : done ? { p: 1, color: x.hot ? "ringRedFaded" : "ringFaded" } : upcomingRing(x);
      out.push(ring(k + "r", PAD, y, { d: rg.d, w: rg.w, p: ro.p, color: c[ro.color], track: c.faint, H: rowH, oy: (rowH - rg.d) / 2, ext: true,
        above: i > 0 && links[i - 1] ? piece(i - 1, true) : null, below: links[i] ? piece(i, false) : null }));
      out.push(ringNum(k + "n", PAD + rg.d / 2, cy, rg, x.num, done ? c.faded : c.text));
      var dimC = done ? c.faded : c.dim, timeW = G.when - rg.d - SP.md;
      out.push(text(k + "t", hm(x.start), fitSize(hm(x.start), FS.base, timeW), 400, dimC, { x: PAD + rg.d + SP.md, cy: cy }));
      var nm = fitSize(x.name, FS.lg, what, now) >= FS.base ? x.name : x.short;
      out.push(text(k + "w", nm, fitSize(nm, FS.lg, what, now), now ? 700 : 600, done ? (x.hot ? c.fadedRed : c.faded) : nameColor(x, c), { x: tx, cy: cy }));
      if (x.room) out.push(text(k + "m", x.room, fitSize(x.room, FS.lg, G.where - FLEX), 600, done ? c.faded : c.text, { xr: 329 - PAD, cy: cy }));
      y += rowH;
    });
    y += near;
    out.push(box("l2", PAD, y, 297, HAIR, c.divider)); y += HAIR + gap;
    // the bottom line: icon | break name | count
    var cn = DAYS_LEFT, fy = y + footH / 2;
    out.push({ t: "icon", k: "gift", name: "gift", x: PAD, y: fy - FS.base / 2, size: FS.base, c: c.dim });
    out.push(text("fn", BREAK_NAME, FS.base, 600, c.text, { x: PAD + FS.base + SP.md, cy: fy }));
    out.push({ t: "row", k: "fc", xr: 329 - PAD, top: fy - FS.base * LH / 2, h: FS.base * LH, kids: [
      { t: "t", k: "n", s: String(cn), fs: FS.base, wt: 700, c: c.text, ml: 0 }, { t: "t", k: "u", s: "days", fs: FS.sm, wt: 600, c: c.dim, ml: SP.xs }] });
    return out;
  }

  // ───────────── Lock Screen ─────────────
  function lockRing(k, x, y, base, s, L) {
    var o = Object.assign({ track: L.track, color: "#fff", fs: base.fs }, base.r), cx = x + o.d / 2, cy = y + o.d / 2, out = [];
    return { o: o, cx: cx, cy: cy };
  }
  function buildLockRect(s, L) {
    var out = [], H = 66, r = RING.lockRect, ry = (H - r.d) / 2, cx = r.d / 2, cy = H / 2, p, num, disc = false, color = "#fff";
    var f = focus(s), l = f.l;
    if (s.mode === "class") { p = s.progress; num = String(s.minsLeft); disc = true; }
    else if (s.mode === "break") { p = s.progress; num = s.minsTo <= 99 ? String(s.minsTo) : s.next.room; }
    else { p = 1; color = L.track; num = l.room; }
    var rr = ringRoom(r, "wide"), nfs = fitFs(num, rr.w, rr.h, LOCK.ringFs);
    out.push(ring("lr", 0, ry, { d: r.d, w: r.w, p: p, color: color, track: L.track, disc: disc ? "#fff" : null }));
    out.push(text("ln", num, nfs, 700, disc ? L.black : L.text, { xc: cx, cy: cy }));
    // three short lines, centred as a group
    var lines = [], isClass = s.mode === "class", x = r.d + LOCK.gap, tw = LOCK.textW;
    var nameLine = function (nm, size, filled, maxW, flag) {
      var fs = fitSize(nm, size, filled ? maxW - 2 * LOCK.pillPad : maxW);
      return { h: fs * LH, name: true, fs: fs, nm: nm, filled: filled, flag: flag };
    };
    if (s.mode === "class" || s.mode === "break") {
      var cl = isClass ? s.current : s.next, hot = cl.hot;
      lines.push(nameLine(cl.short, LOCK.name, isClass || hot, hot && isClass ? LOCK.nameHotW : tw, hot && isClass));
      if (cl.room) lines.push({ k: "lrm", s: roomLabel(cl.room), fs: fitSize(roomLabel(cl.room), LOCK.line, tw), wt: 600, c: L.mid });
      var sub = isClass ? "until " + hm(cl.end) : s.minsTo <= 60 ? "in " + s.minsTo + " min" : "at " + hm(cl.start);
      lines.push({ k: "lsb", s: sub, fs: fitSize(sub, LOCK.sub, tw), wt: 600, c: L.dim });
    } else {
      var l0 = s.nextLessons[0], status = "Done for today", day = "Tomorrow";
      lines.push({ k: "lst", s: status, fs: fitSize(status, LOCK.name, tw), wt: 600, c: L.text });
      var dl = day + " · " + hm(l0.start);
      lines.push({ k: "lsd", s: dl, fs: fitSize(dl, LOCK.line, tw), wt: 600, c: L.mid });
      var nl = nameLine(l0.short, LOCK.sub, l0.hot, tw, false); lines.push(nl);
    }
    lines.forEach(function (ln) { if (!ln.h) ln.h = ln.fs * LH; });
    var tot = lines.reduce(function (a, ln) { return a + ln.h; }, 0) + (lines.length - 1) * LOCK.lineGap, y = (H - tot) / 2;
    lines.forEach(function (ln, i) {
      var cyl = y + ln.h / 2;
      if (ln.name) {
        var w = ln.filled ? LOCK.pillPad : 0;
        if (ln.filled) {
          out.push(box("lpill", x, y, 0, ln.h, "#fff", LOCK.pillR, 0)); out[out.length - 1].fitText = "lnm";
          out.push(text("lnm", ln.nm, ln.fs, 600, L.black, { x: x + LOCK.pillPad, cy: cyl }));
        } else out.push(text("lnm", ln.nm, ln.fs, 600, L.text, { x: x, cy: cyl }));
        if (ln.flag) out.push({ t: "icon", k: "lflag", name: "flag", x: 0, y: cyl - LOCK.flag / 2, size: LOCK.flag, c: "#fff", after: "lnm", gapX: LOCK.flagGap + (ln.filled ? LOCK.pillPad : 0) });
      } else out.push(text(ln.k, ln.s, ln.fs, ln.wt, ln.c, { x: x, cy: cyl }));
      y += ln.h + LOCK.lineGap;
    });
    return out;
  }
  function buildLockRound(s, L) {
    var out = [], r = RING.lockRound, o = 2, cx = 34, cy = 34, capFs = LOCK.capFs, rr, p, num, cap = null, capTop = false, disc = false, textC = L.text, capC = L.dim;
    if (s.mode === "class") { p = s.progress; num = String(s.minsLeft); cap = "min"; disc = true; textC = L.black; capC = L.capDark; }
    else if (s.mode === "break") { p = s.progress; num = s.next.room || s.next.short; cap = isNumRoom(s.next.room) ? "room" : null; capTop = true; }
    else { p = 0; num = s.nextLessons[0].room || s.nextLessons[0].short; cap = "tomorrow"; capTop = true; }
    rr = ringRoom(r, cap ? "two" : "wide");
    if (cap) capFs = Math.min(LOCK.capFs, Math.floor(rr.w * 0.96 / emWidth(cap)));
    var fs = fitFs(num, rr.w, cap ? rr.h - capFs * 1.25 : rr.h, LOCK.roundFs);
    out.push(ring("lr", o, o, { d: r.d, w: r.w, p: p, color: "#fff", track: L.track, disc: disc ? "#fff" : null }));
    var th = fs * LH, ch = cap ? capFs * LH : 0, y = cy - (th + ch) / 2;
    if (cap && capTop) { out.push(text("lcap", cap, capFs, 600, capC, { xc: cx, cy: y + ch / 2 })); y += ch; }
    out.push(text("ln", num, fs, 700, textC, { xc: cx, cy: y + th / 2 })); y += th;
    if (cap && !capTop) out.push(text("lcap", cap, capFs, 600, capC, { xc: cx, cy: y + ch / 2 }));
    return out;
  }
  function buildLockInline(s, L) {
    var t, hot = false;
    if (s.mode === "class") { var l = s.current; hot = l.hot; t = [l.short, l.room, s.minsLeft + " min"].filter(Boolean).join(" · "); }
    else if (s.mode === "break") { var b = s.next; hot = b.hot; t = [b.short, b.room, s.minsTo <= 60 ? "in " + s.minsTo + " min" : "at " + hm(b.start)].filter(Boolean).join(" "); }
    else { var n = s.nextLessons[0]; hot = n.hot; t = "Tomorrow " + hm(n.start) + " · " + [n.short, n.room].filter(Boolean).join(" "); }
    return [{ t: "inline", k: "li", s: t, fs: LOCK.inline, c: L.text, flag: hot, flagSize: LOCK.inlineFlag }];
  }

  // ───────────── the engine: specs → DOM (in place) ─────────────
  function css(el, o) {
    var c = el._c || (el._c = {});
    for (var k in o) if (c[k] !== o[k]) { c[k] = o[k]; el.style[k] = o[k]; }
  }
  var px = function (v) { return Math.round(v * 100) / 100 + "px"; };
  function makeSvg(name, attrs) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  // A line piece. Pieces in neighbouring pictures meet at fractional pixels, and two soft edges
  // there show a dark seam: an opaque line runs SEAM past each end into the next picture or under
  // its ring (a see-through one stops exactly, or the overlap shows as a brighter patch). The fade
  // (the stub above the first row) is one line with a stepped gradient, not separate pieces.
  var SEAM = 0.75, gid = 0;
  function opaque(c) { return typeof c === "string" && !/rgba|hsla|transparent/.test(c) || /rgba\([^)]*,\s*1\)/.test(c); }
  function pieceSvg(g, pc, x, y0, y1, above, ends) {
    if (pc.split) { if (above) y0 += pc.split / 2; else y1 -= pc.split / 2; }
    if (y1 <= y0) return;
    var n = pc.fade ? 6 : 1, step = (y1 - y0) / n;
    [pc.track, pc.color].forEach(function (col) {
      if (!col) return;
      var ext = opaque(col) && !pc.fade ? SEAM : 0, a0 = y0 - (ends[0] ? ext : 0), a1 = y1 + (ends[1] ? ext : 0);
      var a = { x1: x, x2: x, y1: a0, y2: a1, stroke: col, "stroke-width": pc.w };
      if (pc.dash) { a["stroke-dasharray"] = pc.dash[0] + " " + pc.dash[1]; a["stroke-dashoffset"] = (pc.phase || 0) - (y0 - a0); }
      if (pc.fade) {
        var id = "swf" + (++gid), gr = makeSvg("linearGradient", { id: id, gradientUnits: "userSpaceOnUse", x1: 0, x2: 0, y1: y0, y2: y1 });
        for (var i = 0; i < n; i++) [i / n, (i + 1) / n].forEach(function (off) {
          gr.appendChild(makeSvg("stop", { offset: off, "stop-color": col, "stop-opacity": (i + 1) / (n + 1) }));
        });
        g.appendChild(gr); a.stroke = "url(#" + id + ")";
      }
      g.appendChild(makeSvg("line", a));
    });
  }
  function syncRing(el, o) {
    var d = o.d, H = o.H || d, oy = o.ext ? o.oy : (H - d) / 2, c = d / 2, cy = c + oy, r = (d - o.w) / 2, full = o.p >= 0.995;
    if (!el._r) {
      el.setAttribute("data-img", ""); el.setAttribute("aria-hidden", "true"); el.setAttribute("class", "ring");
      el._g = makeSvg("g", {}); el._dc = makeSvg("circle", { "class": "dc" }); el._tr = makeSvg("circle", { "class": "tr", fill: "none" });
      el._pr = makeSvg("circle", { "class": "pr", fill: "none", pathLength: 100 });
      [el._g, el._dc, el._tr, el._pr].forEach(function (e) { el.appendChild(e); });
      el._r = 1;
    }
    var sig = JSON.stringify([d, H, oy, o.above, o.below, o.gapPiece, o.track]);
    if (el._sig !== sig) {
      el._sig = sig; el.setAttribute("width", d); el.setAttribute("height", H); el.setAttribute("viewBox", "0 0 " + d + " " + H);
      while (el._g.firstChild) el._g.removeChild(el._g.firstChild);
      var tk = o.track;
      if (o.gapPiece) pieceSvg(el._g, Object.assign({ track: tk }, o.gapPiece), c, 0, H, false, [1, 1]);
      if (o.ext) {
        if (o.above) pieceSvg(el._g, Object.assign({ track: tk }, o.above), c, 0, oy, true, [1, 1]);
        if (o.below) pieceSvg(el._g, Object.assign({ track: tk }, o.below), c, oy + d, H, false, [1, 1]);
      }
    }
    var gp = !!o.gapPiece;
    el._tr.setAttribute("cx", c); el._tr.setAttribute("cy", cy); el._tr.setAttribute("r", r); el._tr.setAttribute("stroke-width", o.w);
    el._pr.setAttribute("cx", c); el._pr.setAttribute("cy", cy); el._pr.setAttribute("r", r); el._pr.setAttribute("stroke-width", o.w);
    el._pr.setAttribute("transform", "rotate(-90 " + c + " " + cy + ")");
    var di = o.w * 1.45;
    el._dc.setAttribute("cx", c); el._dc.setAttribute("cy", cy); el._dc.setAttribute("r", Math.max(0, d / 2 - di));
    css(el._tr, { stroke: o.track, display: gp ? "none" : "" });
    css(el._pr, { stroke: o.color, strokeLinecap: full ? "butt" : "round", strokeDasharray: full ? "none" : o.p * 100 + " 100", opacity: o.p > 0 && !gp ? "1" : "0", display: gp ? "none" : "" });
    css(el._dc, { fill: o.disc || "transparent", opacity: o.disc ? "1" : "0" });
  }
  var ICONS = {
    gift: '<path d="M3 9h18v3H3zM4.5 12h15v8.5h-15zM12 9v11.5" fill="currentColor" stroke="none"/><path d="M12 9C9 9 7 8 7 6.3 7 5 8 4 9.2 4 11 4 12 6 12 9zM12 9c3 0 5-1 5-2.700C17 5 16 4 14.800 4 13 4 12 6 12 9z" fill="none" stroke="currentColor" stroke-width="1.600"/>',
    flag: '<path d="M6 21V4h11l-2.500 4.500L17 13H8v8z" fill="currentColor"/>'
  };
  function syncIcon(el, sp) {
    if (!el._r) {
      el._r = 1; el.setAttribute("class", "ic"); el.setAttribute("aria-hidden", "true"); el.setAttribute("viewBox", "0 0 24 24");
      el.innerHTML = ICONS[sp.name];
    }
    el.setAttribute("width", sp.size); el.setAttribute("height", sp.size);
  }

  function place(el, sp, W) {
    var o = {};
    if (sp.xr != null) { o.right = px(W - sp.xr); o.left = "auto"; }
    else if (sp.xc != null) { o.left = px(sp.xc - 100); o.width = "200px"; o.textAlign = "center"; o.right = "auto"; }
    else { o.left = px(sp.x); o.right = "auto"; }
    css(el, o);
  }
  function reconcile(parent, specs, ctx) {
    var map = parent._m || (parent._m = {}), seen = {}, prevFixed = null;
    specs.forEach(function (sp) {
      var el = map[sp.k], isNew = !el;
      if (isNew) {
        el = document.createElementNS(sp.t === "ring" || sp.t === "icon" ? NS : "http://www.w3.org/1999/xhtml", sp.t === "ring" || sp.t === "icon" ? "svg" : sp.t === "row" ? "div" : sp.t === "b" ? "div" : "span");
        map[sp.k] = el;
        if (sp.t === "t") el.setAttribute("class", "t");
        else if (sp.t === "inline") el.setAttribute("class", "il");
        else if (sp.t === "row") el.setAttribute("class", "ln");
        else if (sp.t === "b") el.setAttribute("class", "b");
        parent.appendChild(el);
        if (ctx.animate && !reduced()) { el.style.opacity = "0"; el._c = { opacity: "0" }; root.requestAnimationFrame(function () { root.requestAnimationFrame(function () { css(el, { opacity: "" }); }); }); }
      } else if (el._gone) { clearTimeout(el._gone); el._gone = 0; el.classList.remove("gone"); }
      seen[sp.k] = 1;
      if (sp.t === "t") {
        if (el.textContent !== sp.s) el.textContent = sp.s;
        place(el, sp, ctx.W);
        css(el, { top: px(sp.cy - sp.fs * LH / 2), fontSize: sp.fs + "px", fontWeight: String(sp.wt), color: sp.c, marginLeft: sp.ml ? sp.ml + "px" : "" });
      } else if (sp.t === "b") {
        place(el, { x: sp.x, xr: null }, ctx.W);
        css(el, { top: px(sp.y), width: px(sp.w), height: px(sp.h), background: sp.bg, borderRadius: sp.r + "px" });
        if (sp.fitText) el._fit = sp.fitText;
      } else if (sp.t === "ring") {
        css(el, { left: px(sp.x), top: px(sp.y), width: px(sp.d), height: px(sp.H || sp.d) });
        syncRing(el, sp);
      } else if (sp.t === "icon") {
        syncIcon(el, sp);
        css(el, { left: px(sp.x), top: px(sp.y), color: sp.c });
        el._after = sp.after; el._gapX = sp.gapX;
      } else if (sp.t === "row") {
        var o = { top: px(sp.top), height: px(sp.h) };
        if (sp.xr != null) { o.right = px(ctx.W - sp.xr); o.left = "auto"; } else { o.left = px(sp.x); o.right = "auto"; }
        css(el, o);
        sp.kids.forEach(function (kd) { kd.cy = 0; });
        reconcileKids(el, sp.kids, ctx);
      } else if (sp.t === "inline") {
        el._sp = sp;
        css(el, { fontSize: sp.fs + "px", color: sp.c });
        if (!el._t) { el._t = document.createElement("span"); el._t.className = "t"; el.appendChild(el._t); }
        if (el._t.textContent !== sp.s) el._t.textContent = sp.s;
        if (sp.flag && !el._f) { el._f = makeSvg("svg", { "class": "ic", "aria-hidden": "true", viewBox: "0 0 24 24", width: sp.flagSize, height: sp.flagSize }); el._f.innerHTML = ICONS.flag; el.insertBefore(el._f, el._t); }
        if (!sp.flag && el._f) { el.removeChild(el._f); el._f = null; }
      }
    });
    // document order = spec order (reading order); a node is moved only when it is out of place
    var cur = parent.firstChild;
    while (cur && cur.nodeType === 1 && cur.classList.contains("bg")) cur = cur.nextSibling;
    specs.forEach(function (sp) {
      var el = map[sp.k];
      if (el === cur) cur = cur.nextSibling; else parent.insertBefore(el, cur);
    });
    Object.keys(map).forEach(function (k) {
      if (seen[k]) return;
      var el = map[k];
      if (ctx.animate && !reduced()) {
        if (el._gone) return;
        el.classList.add("gone");
        el._gone = setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); if (map[k] === el) delete map[k]; }, 360);
      } else { if (el.parentNode) el.parentNode.removeChild(el); delete map[k]; }
    });
  }
  // the texts inside a baseline row: plain flex children
  function reconcileKids(parent, kids, ctx) {
    var map = parent._m || (parent._m = {}), seen = {};
    kids.forEach(function (kd) {
      var el = map[kd.k];
      if (!el) { el = document.createElement("span"); el.className = "t"; map[kd.k] = el; parent.appendChild(el); }
      seen[kd.k] = 1;
      if (el.textContent !== kd.s) el.textContent = kd.s;
      css(el, { fontSize: kd.fs + "px", fontWeight: String(kd.wt), color: kd.c, marginLeft: kd.ml ? kd.ml + "px" : "0px" });
    });
    // keep the document order pre, val, unit
    kids.forEach(function (kd) { parent.appendChild(map[kd.k]); });
    Object.keys(map).forEach(function (k) { if (!seen[k]) { parent.removeChild(map[k]); delete map[k]; } });
  }
  // pill width and flag position follow the text they belong to
  function fixups(rootEl) {
    var m = rootEl._m || {};
    Object.keys(m).forEach(function (k) {
      var el = m[k];
      if (el._fit && m[el._fit]) {
        var tx = m[el._fit], w = tx.getBoundingClientRect().width;
        css(el, { width: px(w + 2 * LOCK.pillPad) });
      }
      if (el._after && m[el._after]) {
        var t2 = m[el._after], r0 = rootEl.getBoundingClientRect(), r1 = t2.getBoundingClientRect();
        css(el, { left: px(r1.right - r0.left + el._gapX) });
      }
      if (el.classList && el.classList.contains("il")) {
        var f = el._f, w2 = el._t.getBoundingClientRect().width + (f ? +f.getAttribute("width") : 0);
        css(el, { left: px((rootEl._W - w2) / 2), top: "0px", height: rootEl._H + "px" });
      }
    });
  }
  // text widths aren't known before the page lays them out: the pill and the flag are set after
  function widthsLater(rootEl) {
    var again = function () { if (rootEl.isConnected) fixups(rootEl); };
    again();
    if (root.document && root.document.fonts && root.document.fonts.ready) root.document.fonts.ready.then(again);
    root.requestAnimationFrame(again);
  }

  function build(kind, min, mode) {
    var lock = kind.indexOf("lock") === 0, s = compute(min), L = COL.lock, c = COL[mode === "light" ? "light" : "dark"];
    switch (kind) {
      case "small": return buildSmall(s, c);
      case "medium": return buildMedium(s, c);
      case "large": return buildLarge(s, c);
      case "lockRect": return buildLockRect(s, L);
      case "lockRound": return buildLockRound(s, L);
      case "lockInline": return buildLockInline(s, L);
    }
    throw new Error("SW: unknown widget " + kind);
  }
  function makeRoot(kind, min, mode) {
    var el = document.createElement("div"), lock = kind.indexOf("lock") === 0, sz = SIZE[kind];
    el.className = "sw"; el.setAttribute("data-kind", kind); el.setAttribute("data-min", min); el.setAttribute("data-mode", lock ? "dark" : mode);
    el.style.width = sz[0] + "px"; el.style.height = sz[1] + "px"; el._W = sz[0]; el._H = sz[1];
    el.setAttribute("role", "img");
    if (!lock) { el.innerHTML = '<div class="bg bgd"></div><div class="bg bgl"></div>'; }
    return el;
  }
  function paint(el, kind, min, mode, animate) {
    var specs = build(kind, min, mode);
    reconcile(el, specs, { W: el._W, animate: animate });
    el.setAttribute("data-min", min);
    widthsLater(el);
  }
  function label(kind, min) {
    var s = stateOf(min);
    return "School Widget, " + kind.replace("lock", "Lock Screen ").toLowerCase() + ": " + (s.kind === "class" ? s.name + ", " + s.left + " min left" : s.kind === "after" ? "done for today" : s.name + " in " + s.left + " min");
  }
  function html(kind, min, o) {
    var mode = (o && o.mode) === "light" ? "light" : "dark", el = makeRoot(kind, min, mode);
    el.style.visibility = "hidden"; document.body.appendChild(el); // laid out, so pill and flag widths are known
    paint(el, kind, min, mode, false);
    el.setAttribute("aria-label", label(kind, min));
    el.style.visibility = "";
    var out = el.outerHTML; document.body.removeChild(el);
    return out;
  }
  function mount(host, kind, o) {
    o = o || {};
    var mode = o.mode === "light" ? "light" : "dark", min = o.min == null ? 550 : o.min, el = makeRoot(kind, min, mode);
    host.innerHTML = ""; host.appendChild(el);
    paint(el, kind, min, mode, false);
    var cur = min;
    var h = {
      el: el,
      update: function (m) { cur = m; paint(el, kind, m, mode, true); el.setAttribute("aria-label", label(kind, m)); },
      setMode: function (md) { mode = md === "light" ? "light" : "dark"; if (kind.indexOf("lock") !== 0) el.setAttribute("data-mode", mode); paint(el, kind, cur, mode, true); }
    };
    el.setAttribute("aria-label", label(kind, min));
    return h;
  }

  // ───────────── the full-screen menu (tap on the widget) ─────────────
  var WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"], DATES = ["30.11", "1.12", "2.12", "3.12", "4.12"];
  var OFF = [["🎁", "Christmas break", "24 Dec – 3 Jan"], ["❄️", "Mid-term break", "30 Jan – 2 Feb"], ["🌷", "Spring break", "3 Apr – 11 Apr"], ["📅", "Exam day", "Wed, 19 May"], ["📚", "School holiday", "Mon, 24 May"]];
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function mring(d, w) {
    var e = makeSvg("svg", { width: d, height: d, viewBox: "0 0 " + d + " " + d, "aria-hidden": "true", "class": "mr" }), r = (d - w) / 2;
    e.appendChild(makeSvg("circle", { cx: d / 2, cy: d / 2, r: r, fill: "none", "class": "tr", "stroke-width": w }));
    e.appendChild(makeSvg("circle", { cx: d / 2, cy: d / 2, r: r, fill: "none", "class": "pr", "stroke-width": w, pathLength: 100, transform: "rotate(-90 " + d / 2 + " " + d / 2 + ")" }));
    e.appendChild(makeSvg("text", { x: d / 2, y: d / 2, "text-anchor": "middle", "dominant-baseline": "central", "class": "mn", "font-size": d * 0.4 }));
    return e;
  }
  function setRing(e, p, color, num, faded) {
    var pr = e.querySelector(".pr");
    pr.style.stroke = color; pr.style.strokeDasharray = p >= 0.995 ? "none" : p * 100 + " 100"; pr.style.strokeLinecap = p >= 0.995 ? "butt" : "round"; pr.style.opacity = p > 0 ? "1" : "0";
    e.querySelector(".mn").textContent = num; e.classList.toggle("fd", !!faded);
  }
  function mountMenu(host, o) {
    o = o || {};
    var tab = o.tab || "today", min = o.min == null ? 550 : o.min, mode = o.mode === "light" ? "light" : "dark";
    host.innerHTML = "";
    var rootEl = h("div", "mw"); rootEl.setAttribute("data-mode", mode);
    var head = h("div", "mhead"); head.appendChild(h("h2", "mtitle", "Thursday, 3 December"));
    var shr = h("span", "mshr"); shr.setAttribute("aria-hidden", "true"); // as in the app: shares School Widget's page
    shr.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3.5v11M7.8 7.4 12 3.2l4.2 4.2M8.5 10.5H6.8A1.8 1.8 0 0 0 5 12.3v6.4a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8v-6.4a1.8 1.8 0 0 0-1.8-1.8h-1.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; head.appendChild(shr);
    var tabs = h("div", "mtabs"); tabs.setAttribute("role", "tablist");
    var api = { el: rootEl };
    [["today", "Today"], ["timetable", "Timetable"], ["daysoff", "Days off"], ["settings", "Settings"]].forEach(function (t) {
      var b = h("button", "", t[1]); b.type = "button"; b.setAttribute("data-tab", t[0]); b.setAttribute("role", "tab");
      b.addEventListener("click", function () { api.setTab(t[0]); }); tabs.appendChild(b);
    });
    var body = h("div", "mbody"); rootEl.appendChild(head); rootEl.appendChild(tabs); rootEl.appendChild(body); host.appendChild(rootEl);
    var view = null, live = {};

    function today() {
      var v = h("div", "mview"); live = { rows: {} };
      var hero = h("div", "mhero"); live.hr = mring(56, 7); hero.appendChild(live.hr);
      var mid = h("div", "hmid"); live.hn = h("div", "hname"); live.hb = h("div", "hbig"); live.hs = h("div", "hsub"); mid.appendChild(live.hn); mid.appendChild(live.hb); mid.appendChild(live.hs); hero.appendChild(mid);
      var rm = h("div", "hroom"); rm.appendChild(h("small", "", "room")); live.hm = h("b"); rm.appendChild(live.hm); hero.appendChild(rm); v.appendChild(hero);
      v.appendChild(h("h3", "", "Today"));
      var links = dayLinks(TODAY);
      TODAY.forEach(function (l, i) {
        var r = h("div", "mrow"), ringE = mring(36, 4.5), mid2 = h("div", "mid");
        r.appendChild(ringE); var nm = h("div", "nm", l.name), sub = h("div", "sub", hm(l.start) + "–" + hm(l.end));
        mid2.appendChild(nm); mid2.appendChild(sub); r.appendChild(mid2); r.appendChild(h("div", "mroom", l.room ? "Room " + l.room : ""));
        // as in the app: each row draws its half of a link, from its edge to its ring (solid for the
        // same class, dashed for only the same room)
        var row = { r: r, ring: ringE, nm: nm, sub: sub };
        [["up", i ? links[i - 1] : null], ["down", links[i]]].forEach(function (x) {
          if (!x[1]) return;
          var lk = h("i", "lk " + x[0] + (x[1] === "room" ? " room" : "")); lk.setAttribute("aria-hidden", "true"); r.appendChild(lk); row[x[0]] = lk;
        });
        live.rows[l.num] = row; v.appendChild(r);
      });
      live.foot = h("p", "foot"); v.appendChild(live.foot);
      return v;
    }
    function tick() {
      if (live.cells) live.cells.forEach(function (x) { x[1].classList.toggle("cur", x[0][0] <= min && min < x[0][1]); });
      if (!live.hr) return;
      var s = compute(min), f = focus(s), l = f.l, C = COL[mode];
      live.hn.textContent = l.short; live.hn.classList.toggle("hot", l.hot);
      live.hb.textContent = ""; var big = bigParts(s, f, 40);
      if (big.pre) live.hb.appendChild(h("span", "pre", big.pre));
      live.hb.appendChild(document.createTextNode(big.value));
      if (big.unit) live.hb.appendChild(h("span", "", big.unit));
      live.hs.textContent = f.live ? f.sub : "Tomorrow"; live.hm.textContent = l.room;
      setRing(live.hr, f.ring.p, C[f.ring.color], l.num, false);
      var links = dayLinks(TODAY);
      TODAY.forEach(function (x, i) {
        var o = live.rows[x.num], done = f.live && x.end <= min && x !== l, now = f.live && x === l;
        var rg = now ? f.ring : done ? { p: 1, color: x.hot ? "ringRedFaded" : "ringFaded" } : upcomingRing(x);
        setRing(o.ring, rg.p, C[rg.color], x.num, done);
        o.r.className = "mrow" + (done ? " past" : "") + (now ? " cur" : "") + (x.hot ? " hot" : "");
        var t = hm(x.start) + "–" + hm(x.end); if (now && f.isClass) t += " · " + s.minsLeft + " min left"; o.sub.textContent = t;
        if (o.up) o.up.style.setProperty("--c", lineCss(TODAY[i - 1], x));
        if (o.down) o.down.style.setProperty("--c", lineCss(x, TODAY[i + 1]));
      });
      live.foot.textContent = "🎁 " + BREAK_NAME + " in " + DAYS_LEFT + " days";
      // the app's line colour: green next to the class on now, red if both are important, else grey;
      // between two finished classes mixed with the page (opaque, so it can pass under a ring)
      function lineCss(a, b) {
        var on = function (x) { return f.live && f.isClass && x === l; }, done = function (x) { return f.live && x.end <= min && x !== l; };
        var c = on(a) || on(b) ? "#30d158" : a.hot && b.hot ? "var(--red)" : "#8e8e93";
        return done(a) && done(b) ? "color-mix(in srgb, " + c + " 40%, var(--bg))" : c;
      }
    }
    function timetable() {
      var v = h("div", "mview"); live = { cells: [] };
      var g = h("div", "mgrid"); g.appendChild(h("span", ""));
      WEEK.forEach(function (d, i) { var c = h("div", "dh" + (i === 3 ? " today" : ""), d); c.appendChild(h("span", "", DATES[i])); g.appendChild(c); });
      for (var p = 0; p < 6; p++) {
        var pn = h("div", "pn", String(p + 1)); pn.appendChild(h("span", "", hm(BELLS[p][0]))); g.appendChild(pn);
        for (var d = 1; d <= 5; d++) {
          var c = DEMO.week[d][p], cell = h("div", "cell" + (d === 4 ? " today" : "") + (c && c.important ? " hot" : ""));
          if (c) { cell.appendChild(h("b", "", c.name)); if (c.room) cell.appendChild(h("span", "", c.room)); } else cell.className += " empty";
          if (d === 4 && c) live.cells.push([BELLS[p], cell]);
          g.appendChild(cell);
        }
      }
      // as in the app: a box round back-to-back classes in the same room (solid for the same class)
      for (var dd = 1; dd <= 5; dd++) {
        var col = DEMO.week[dd], ls = [];
        col.forEach(function (c, p) { if (c) ls.push({ num: p + 1, name: c.name, room: c.room }); });
        var lk = dayLinks(ls);
        for (var a = 0; a < ls.length; a++) {
          var b = a; while (b < ls.length - 1 && lk[b] === lk[a] && lk[a]) b++;
          if (b > a) { var bx = h("div", "wbox" + (lk[a] === "room" ? " dash" : "")); bx.style.gridColumn = (dd + 1) + " / " + (dd + 2); bx.style.gridRow = (ls[a].num + 1) + " / " + (ls[b].num + 2); g.appendChild(bx); a = b; }
        }
      }
      v.appendChild(g); return v;
    }
    function daysoff() {
      var v = h("div", "mview"); live = {};
      var cd = h("div", "mhero"); cd.appendChild(h("div", "emoji", "🎁"));
      var m = h("div", "hmid"), b = h("div", "hbig", String(DAYS_LEFT)); b.appendChild(h("span", "", "days")); m.appendChild(b); m.appendChild(h("div", "hsub", "until " + BREAK_NAME)); cd.appendChild(m); v.appendChild(cd);
      OFF.forEach(function (x) { var r = h("div", "mrow"); r.appendChild(h("div", "em", x[0])); var mid = h("div", "mid"); mid.appendChild(h("div", "nm", x[1])); mid.appendChild(h("div", "sub", x[2])); r.appendChild(mid); v.appendChild(r); });
      var bt = h("button", "mbtn", "Add the holidays to your calendar"); bt.type = "button"; bt.style.marginTop = "12px"; v.appendChild(bt); return v;
    }
    function settings() {
      var v = h("div", "mview"); live = {};
      v.appendChild(h("p", "mnote", "Changes are saved straight away. Widgets show them on their next refresh (usually within a few minutes)."));
      var sections = [["Widget language", [["seg", ["Български", "English"], 1]]], ["Theme", [["seg", ["Automatic", "Dark", "Light"], 1]]],
        ["Days off", [["sw", "Show why it's a day off", "“Day off · Christmas break”", 1], ["sw", "Countdown to the next break", "On the large widget and in “Days off”", 1]]],
        ["Reminder before class", [["seg", ["Off", "3 min", "5 min", "10 min", "15 min"], 0]]],
        ["Linked classes", [["sw", "Coloured links", "Lines between rings take the rings' colour.", 1], ["sw", "Coloured outlines", "The boxes in the lists get coloured too.", 0]]]];
      sections.forEach(function (sec) {
        v.appendChild(h("h3", "", sec[0])); var card = h("div", "mcard");
        sec[1].forEach(function (it) {
          if (it[0] === "seg") { var sg = h("div", "seg"); it[1].forEach(function (t, i) { sg.appendChild(h("span", i === it[2] ? "on" : "", t)); }); card.appendChild(sg); }
          else { var r = h("div", "swr"), tx = h("div", ""); tx.appendChild(h("span", "", it[1])); tx.appendChild(h("small", "", it[2])); r.appendChild(tx); r.appendChild(h("i", "tg" + (it[3] ? " on" : ""))); card.appendChild(r); }
        });
        v.appendChild(card);
      });
      return v;
    }
    var VIEWS = { today: today, timetable: timetable, daysoff: daysoff, settings: settings };
    function show(t, animate) {
      tab = VIEWS[t] ? t : "today"; body.innerHTML = ""; view = VIEWS[tab]();
      if (animate && !reduced()) view.classList.add("in");
      body.appendChild(view);
      [].forEach.call(tabs.children, function (b) { var on = b.getAttribute("data-tab") === tab; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
      tick();
    }
    api.update = function (m) { min = m; tick(); };
    api.setTab = function (t) { if (t !== tab) show(t, true); };
    api.setMode = function (md) { mode = md === "light" ? "light" : "dark"; rootEl.setAttribute("data-mode", mode); tick(); };
    show(tab, false);
    return api;
  }

  root.SW = { html: html, mount: mount, state: stateOf, mountMenu: mountMenu };
})(typeof window !== "undefined" ? window : this);
