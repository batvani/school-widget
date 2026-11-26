// The approved 1.9 menu design as a sketch: applies jobs 1 and 2 to a copy of school-widget.js.
// node tools/preview/plan-1.9/sketch.js /tmp/out.js  → a script for run.js { src }. Reference only:
// the real change is written properly (no raw numbers in the wrong place, both languages, tests).
const fs = require("fs");
const src0 = fs.readFileSync(require("path").join(__dirname, "../../../school-widget.js"), "utf8");
function rep(s, a, b) { if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 80)); return s.replace(a, b); }
const ICON = {
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  imp: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  hist: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4M12 8v4l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  share: '<path d="M12 3.5v11M7.8 7.4 12 3.2l4.2 4.2M8.5 10.5H6.8A1.8 1.8 0 0 0 5 12.3v6.4a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8v-6.4a1.8 1.8 0 0 0-1.8-1.8h-1.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};
function build(v) {
  let s = src0;
  // --- Today: hero ring 64
  s = rep(s, 'svgRing(76, 9, p, ringColor, String(l.num), 32)', 'svgRing(64, 8, p, ringColor, String(l.num), 28)');
  // --- Week: cell names sized so the longest word fits; tiny name as a fallback
  s = rep(s, 'grid += l ? `<div class="cell ${l.hot ? "hot" : ""} ${cur ? "cur" : ""} ${td}"><b>${esc(l.short)}</b>',
    'const cf = n => Math.min(11.5, 52 / (Math.max(...n.split(/\\s+/).map(w => emWidth(w))) * 1.06)); const cn = !l ? "" : cf(l.short) < 10 && l.tiny && cf(l.tiny) > cf(l.short) ? l.tiny : l.short;\n      grid += l ? `<div class="cell ${l.hot ? "hot" : ""} ${cur ? "cur" : ""} ${td}"><b class="${cf(cn) < 10 ? "hy" : ""}" style="font-size:${Math.max(10, cf(cn)).toFixed(1)}px">${esc(cn)}</b>');
  // --- Week: actions below the grid
  const ic = k => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${ICON[k]}</svg>`;
  const acts = [["edit", "E.edit"], ["imp", "E.importBtn"], ["hist", "E.hist", "ownTT()"], ["share", "E.share", "ownTT()"]];
  let actions;
  if (v === "A") actions = '`<div class="card acts">` + ' + acts.map(([k, t, c]) => `${c ? "(" + c + " ? " : "("}\`<button class="act" data-x="${k}"><i>${ic(k)}</i><span>\${${t}}</span><em>›</em></button>\`${c ? ' : "")' : ")"}`).join(" + ") + ' + `</div>`';
  else actions = '`<div class="ibar">` + ' + acts.map(([k, t, c]) => `${c ? "(" + c + " ? " : "("}\`<button class="ib" data-x="${k}"><i>${ic(k)}</i><span>\${${t}.replace(" програмата", "").replace(" програма", "").replace("Предишни програми", "Предишни")}</span></button>\`${c ? ' : "")' : ")"}`).join(" + ") + ' + `</div>`';
  s = rep(s, '<div class="btns"><button class="btn" data-x="edit">${E.edit}</button><button class="btn" data-x="imp">${E.importBtn}</button></div>${impBtns}${ownTT() ? `<div class="btns"><button class="btn" data-x="hist">${E.hist}</button></div>` : ""}${ownTT() ? `<div class="btns"><button class="btn" data-x="share">${E.share}</button></div>` : ""}${grid}',
    '${grid}${' + actions + '}${impBtns}');
  // --- CSS
  const TINT = "rgba(48,209,88,.18)", TINTL = "rgba(52,199,89,.16)";
  s = rep(s, 'body{margin:0;background:#000;color:#fff;font:16px -apple-system,system-ui,sans-serif;padding:max(16px,env(safe-area-inset-top)) 16px 60px}',
    'body{margin:0;background:#000;color:#fff;font:16px -apple-system,system-ui,sans-serif;padding:max(16px,env(safe-area-inset-top)) 16px 60px}body.fit{padding-bottom:0}');
  s = rep(s, '.tabs{display:flex;gap:4px;background:#1c1c1e;border-radius:10px;padding:3px;margin:16px 0;', '.tabs{display:flex;gap:4px;background:#1c1c1e;border-radius:10px;padding:3px;margin:12px 0 10px;');
  s = rep(s, '.row.past .mid,.row.past .room{opacity:.4}.row.cur .nm{color:#30d158}',
    `.row.past .mid,.row.past .room{opacity:.4}.row.cur .nm{color:#30d158}
#t1{--rh:59px;--ring:42px}#t1 .row{min-height:var(--rh);padding:0}#t1 .row>svg{width:var(--ring);height:var(--ring)}
#t1 .lk{left:calc(var(--ring) / 2 - 2.5px)}#t1 .lk.up{height:calc(50% - var(--ring) / 2 + 3.5px)}#t1 .lk.down{top:calc(50% + var(--ring) / 2 - 2.5px)}
#t1 .row.cur{background:${TINT};border-radius:14px;margin:0 -10px;padding:0 10px;border-bottom-color:transparent}#t1 .row.cur .lk{left:calc(10px + var(--ring) / 2 - 2.5px)}
#t1 .row:has(+ .row.cur){border-bottom-color:transparent}`);
  s = rep(s, '.grid{display:grid;grid-template-columns:34px repeat(5,1fr);gap:4px;position:relative}', '.grid{display:grid;grid-template-columns:28px repeat(5,1fr);gap:3px;position:relative;margin-top:4px}');
  s = rep(s, '.cell.today{background:#2c2c2e}.cell.hot b{color:#ff453a}.cell.cur{outline:2px solid #30d158}', `.cell.today{background:#2c2c2e}.cell.hot b{color:#ff453a}.cell.cur{background:${TINT}}`);
  s = rep(s, '.cell b{display:block;font-size:11.5px;font-weight:600;line-height:1.15;-webkit-hyphens:auto;hyphens:auto;overflow-wrap:anywhere}', '.cell b{display:block;font-size:11.5px;font-weight:600;line-height:1.15;overflow-wrap:break-word}.cell b.hy{-webkit-hyphens:auto;hyphens:auto}');
  s = rep(s, '.hero{display:flex;align-items:center;gap:14px;background:#1c1c1e;border-radius:22px;padding:16px;margin:4px 0 6px}', '.hero{display:flex;align-items:center;gap:14px;background:#1c1c1e;border-radius:22px;padding:12px 16px;margin:4px 0 6px}');
  s = rep(s, '.hbig{font-size:40px;', '.hbig{font-size:36px;');
  s = rep(s, '.foot{color:rgba(255,255,255,.65);font-size:14px;margin:16px 2px}', '.foot{color:rgba(255,255,255,.65);font-size:14px;margin:10px 2px}');
  s = rep(s, 'h3{font-size:13px;text-transform:uppercase;letter-spacing:.03em;color:rgba(255,255,255,.55);margin:24px 4px 8px;font-weight:500}',
    'h3{font-size:13px;text-transform:uppercase;letter-spacing:.03em;color:rgba(255,255,255,.55);margin:24px 4px 8px;font-weight:500}#t1 h3{margin:16px 4px 4px}' +
    `.acts{margin:16px 0 0;padding:0 0 0 14px}.act{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;border:0;background:none;color:inherit;font:16px -apple-system,sans-serif;padding:0 14px 0 0;border-bottom:1px solid rgba(255,255,255,.08);text-align:left}.act:last-child{border-bottom:0}.act i{width:30px;height:30px;border-radius:8px;background:${TINT};color:#30d158;display:flex;align-items:center;justify-content:center;flex:none}.act i svg{width:19px;height:19px}.act span{flex:1}.act em{font-style:normal;font-size:22px;color:rgba(255,255,255,.3)}` +
    `.ibar{display:flex;justify-content:space-between;gap:6px;margin:24px 0 8px}.ib{flex:1;border:0;background:none;color:inherit;display:flex;flex-direction:column;align-items:center;gap:6px;padding:0;font:600 12.5px -apple-system,sans-serif}.ib i{width:54px;height:54px;border-radius:27px;background:#1c1c1e;color:#30d158;display:flex;align-items:center;justify-content:center}.ib:first-child i{background:#30d158;color:#000}`);
  s = rep(s, '.tabs,.card,.cd,.cell,.hero{background:#fff}', `.tabs,.card,.cd,.cell,.hero{background:#fff}#t1 .row.cur{background:${TINTL}}.cell.cur{background:${TINTL}}.act{border-color:rgba(0,0,0,.08)}.act i{background:${TINTL};color:#248a3d}.act em{color:rgba(60,60,67,.3)}.ib i{background:#fff;color:#248a3d}.ib:first-child i{background:#34c759;color:#fff}`);
  s = rep(s, '.cell.today{background:#e8f8ec}', '.cell.today{background:#e5e5ea}');
  // --- fit script: rows share the height left on the screen (44–64 pt); otherwise the page scrolls
  s = rep(s, "document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button,.pane').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.getElementById(b.dataset.t).classList.add('on');scrollTo(0,0)});",
    `function fit(){var t=document.getElementById('t1'),rs=t.querySelectorAll('.row'),on=t.classList.contains('on');document.body.classList.toggle('fit',on&&rs.length>0);if(!on||!rs.length)return;t.style.setProperty('--rh','59px');t.style.setProperty('--ring','42px');
var sb=window.SB||20,f=t.querySelector('.foot'),fh=f?f.getBoundingClientRect().height+20:0,top=rs[0].getBoundingClientRect().top+scrollY;var h=Math.floor((innerHeight-top-fh-sb)/rs.length);h=Math.max(44,Math.min(64,h));
t.style.setProperty('--rh',h+'px');t.style.setProperty('--ring',(h<54?36:42)+'px')}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button,.pane').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.getElementById(b.dataset.t).classList.add('on');scrollTo(0,0);fit()});addEventListener('resize',fit);addEventListener('load',fit);fit();`);
  return s;
}
fs.writeFileSync(process.argv[2] || "sw-B.js", build("B"));
console.log("ok");
