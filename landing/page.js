// The landing page: everything that moves or reacts (agent D builds it; see landing/PLAN.md, "Build contract").
(function () {
  "use strict";
  var SHORTCUT_LINK = "https://www.icloud.com/shortcuts/0f4543dd299d4e4e87b49e4083b0fbcf"; // the Shortcut's iCloud link (shortcut/STEPS.md; tools/instructions.js reads it here)

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
})();
