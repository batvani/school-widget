// Minimal Scriptable mock + HTML renderer for previewing widgets.
const fs = require("fs");

function css(c) { return c ? c.css : "inherit"; }
class Color {
  constructor(hex, a = 1) { this.hex = hex; this.a = a; const h = hex.replace("#", ""); const n = parseInt(h, 16); this.css = `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
  get alpha() { return this.a; }
  static white() { return new Color("#ffffff"); } static black() { return new Color("#000000"); }
  static dynamic(l, d) { return process.env.MODE === "light" ? l : d; }
}
const mkFont = (w, r) => s => ({ size: s, weight: w, rounded: !!r });
const Font = {
  systemFont: mkFont(400), mediumSystemFont: mkFont(500), semiboldSystemFont: mkFont(600), boldSystemFont: mkFont(700),
  boldRoundedSystemFont: mkFont(700, 1), semiboldRoundedSystemFont: mkFont(600, 1)
};
class Size { constructor(w, h) { this.width = w; this.height = h; } }
class Point { constructor(x, y) { this.x = x; this.y = y; } }
class Rect { constructor(x, y, w, h) { this.x = x; this.y = y; this.width = w; this.height = h; } }
class Path { constructor() { this.d = ""; } move(p) { this.d += `M${p.x} ${p.y}`; } addLine(p) { this.d += `L${p.x} ${p.y}`; } closeSubpath() { this.d += "Z"; } }
class DrawContext {
  constructor() { this.ops = []; this.stroke = "#fff"; this.fill = "#fff"; this.lw = 1; this.font = mkFont(400)(12); this.tc = "#fff"; this.path = null; }
  setStrokeColor(c) { this.stroke = c.css; } setFillColor(c) { this.fill = c.css; } setLineWidth(w) { this.lw = w; }
  setFont(f) { this.font = f; } setTextColor(c) { this.tc = c.css; } setTextAlignedCenter() { }
  strokeEllipse(r) { this.ops.push(`<ellipse cx="${r.x + r.width / 2}" cy="${r.y + r.height / 2}" rx="${r.width / 2}" ry="${r.height / 2}" fill="none" stroke="${this.stroke}" stroke-width="${this.lw}"/>`); }
  fillEllipse(r) { this.ops.push(`<ellipse cx="${r.x + r.width / 2}" cy="${r.y + r.height / 2}" rx="${r.width / 2}" ry="${r.height / 2}" fill="${this.fill}"/>`); }
  addPath(p) { this.path = p; }
  fillPath() { this.ops.push(`<path d="${this.path.d}" fill="${this.fill}"/>`); }
  strokePath() { this.ops.push(`<path d="${this.path.d}" fill="none" stroke="${this.stroke}" stroke-width="${this.lw}" stroke-linejoin="round"/>`); }
  drawTextInRect(t, r) {
    // approximate CoreText: baseline ≈ top + 0.95*size
    const f = this.font;
    this.ops.push(`<text x="${r.x + r.width / 2}" y="${r.y + f.size * 0.95}" text-anchor="middle" font-size="${f.size}" font-weight="${f.weight}" font-family="${f.rounded ? "ui-rounded,'SF Pro Rounded'," : ""}-apple-system,'Helvetica Neue',Arial,sans-serif" fill="${this.tc}">${t}</text>`);
  }
  getImage() { const s = this.size; return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${s.width}" height="${s.height}" viewBox="0 0 ${s.width} ${s.height}">${this.ops.join("")}</svg>` }; }
}
class SFSymbol { static named(n) { return { image: { sym: n }, applyFont() { } }; } }
class LinearGradient { }

class Elem { }
class WidgetText extends Elem {
  constructor(t) { super(); this.type = "text"; this.text = t; this.align = "left"; }
  centerAlignText() { this.align = "center"; } rightAlignText() { this.align = "right"; } leftAlignText() { this.align = "left"; }
}
class Container {
  constructor() { this.children = []; this.layout = "h"; this.align = "center"; }
  addText(t) { const e = new WidgetText(t); this.children.push(e); return e; }
  addImage(img) { const e = { type: "image", image: img }; this.children.push(e); return e; }
  addSpacer(n) { const e = { type: "spacer", len: n }; this.children.push(e); return e; }
  addStack() { const e = new WidgetStack(); this.children.push(e); return e; }
  layoutHorizontally() { this.layout = "h"; } layoutVertically() { this.layout = "v"; }
  centerAlignContent() { this.align = "center"; } topAlignContent() { this.align = "flex-start"; } bottomAlignContent() { this.align = "flex-end"; }
  setPadding(t, l, b, r) { this.padding = [t, l, b, r]; }
}
class WidgetStack extends Container { constructor() { super(); this.type = "stack"; } }
class ListWidget extends Container {
  constructor() { super(); this.layout = "v"; this.padding = [16, 16, 16, 16]; }
  presentMedium() { } presentSmall() { } presentLarge() { }
}

const GLYPH = { "sun.max.fill": "☀", "flag.fill": "⚑", "atom": "⚗", "function": "ƒ", "desktopcomputer": "⌨", "globe.europe.africa.fill": "◍", "character.bubble.fill": "A", "book.fill": "▤", "figure.run": "⚲", "building.columns.fill": "⌂", "person.3.fill": "☺", "house.fill": "⌂", "book.closed.fill": "▥", "gift.fill": "🎁", "leaf.fill": "🍂", "camera.macro": "🌷", "snowflake": "❄", "hare.fill": "🐇", "star.fill": "★", "calendar": "▦" };
function renderEl(e, parentLayout) {
  if (e.type === "spacer") {
    if (e.len === undefined || e.len === null) return `<div class="sp" style="flex:1 1 0;min-${parentLayout === "h" ? "width" : "height"}:8px"></div>`;
    return `<div style="flex:0 0 ${e.len}px;${parentLayout === "h" ? "width" : "height"}:${e.len}px"></div>`;
  }
  if (e.type === "text") {
    const f = e.font || mkFont(400)(17);
    const lines = e.lineLimit || 0;
    const clamp = lines === 1 ? "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" : lines > 1 ? `display:-webkit-box;-webkit-line-clamp:${lines};-webkit-box-orient:vertical;overflow:hidden;` : "";
    return `<div class="t" data-scale="${e.minimumScaleFactor || 1}" style="font-size:${f.size}px;font-weight:${f.weight};color:${css(e.textColor)};text-align:${e.align};${clamp}min-width:0;flex-shrink:1;line-height:normal">${e.text}</div>`;
  }
  if (e.type === "image") {
    const w = e.imageSize ? e.imageSize.width : 20, h = e.imageSize ? e.imageSize.height : 20;
    if (e.image.sym) return `<div style="width:${w}px;height:${h}px;flex:0 0 auto;color:${css(e.tintColor) || "#fff"};font-size:${h * 0.8}px;line-height:${h}px;text-align:center">${GLYPH[e.image.sym] || "◆"}</div>`;
    return `<div style="width:${w}px;height:${h}px;flex:0 0 auto">${e.image.svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${w}" height="${h}"`)}</div>`;
  }
  // stack
  const p = e.padding || [0, 0, 0, 0];
  const sz = e.size || { width: 0, height: 0 };
  const st = [`display:flex`, `flex-direction:${e.layout === "v" ? "column" : "row"}`, `align-items:${e.layout === "v" ? "flex-start" : e.align}`, e.layout === "v" && e.align === "center" ? "justify-content:center" : "",
    // iOS centres the content of a fixed-width horizontal stack sideways (seen on the phone, v1.1.0)
    e.layout === "h" && sz.width && !e.children.some(c => c.type === "spacer" && c.len == null) ? "justify-content:center" : "",
    `gap:${e.spacing || 0}px`, `padding:${p[0]}px ${p[3]}px ${p[2]}px ${p[1]}px`, `flex:0 1 auto`, `min-width:0`,
    sz.width ? `width:${sz.width}px;flex-shrink:0` : "", sz.height ? `height:${sz.height}px;flex-shrink:0` : "", (sz.width && sz.height) ? "overflow:hidden" : "",
    e.backgroundColor ? `background:${e.backgroundColor.css}` : "",
    e.backgroundImage ? `background:url('data:image/svg+xml;utf8,${encodeURIComponent(e.backgroundImage.svg).replace(/'/g, "%27")}') center/100% 100% no-repeat` : "", e.cornerRadius ? `border-radius:${e.cornerRadius}px` : ""].join(";");
  const wants = x => x.type === "stack" && !(x.size && x.size.width) && x.children.some(c => (x.layout === "h" && c.type === "spacer" && c.len == null) || wants(c));
  const fill = wants(e) ? (parentLayout === "h" ? "flex:1 1 0;min-width:0;" : "align-self:stretch;") : "";
  // A stack holding a flexible spacer that runs vertically (directly, or deeper down) grows to the
  // full height it is offered, as SwiftUI's Spacer does. Stacks with a fixed height don't.
  const wantsV = x => x.type === "stack" && !(x.size && x.size.height) && x.children.some(c => (x.layout === "v" && c.type === "spacer" && c.len == null) || wantsV(c));
  const fillV = wantsV(e) ? (parentLayout === "v" ? "flex:1 1 0;min-height:0;" : "align-self:stretch;") : "";
  // negative spacing (overlapping children): CSS gap can't be negative, so a negative margin instead
  const neg = (e.spacing || 0) < 0, mk = e.layout === "v" ? "margin-top" : "margin-left";
  const kids = e.children.map((c, i) => { const h = renderEl(c, e.layout); return neg && i ? h.replace('style="', `style="${mk}:${e.spacing}px;`) : h; });
  return `<div style="${st.replace(/gap:-[\d.]+px/, "gap:0px")};${fill}${fillV}">${kids.join("")}</div>`;
}
// large: 352 pt, measured on the user's iPhone (375 × 812); LARGE_H=345 for Apple's documented size
const FAM = { small: [155, 152], medium: [329, 152], mediumDay: [329, 152], mediumList: [329, 152], large: [329, +(process.env.LARGE_H || 352)], accessoryRectangular: [155, 66], accessoryCircular: [68, 68], accessoryInline: [260, 22] };
function renderWidget(w, family) {
  const [W, H] = FAM[family];
  const p = w.padding; const lock = family.startsWith("accessory");
  const gc = w.backgroundGradient && w.backgroundGradient.colors;
  const bg = lock ? "transparent" : gc ? `linear-gradient(${gc[0].css},${gc[1].css})` : "#1c1c1e";
  const inline = family === "accessoryInline";
  return `<div class="wid ${lock ? "lock" : ""}" data-fam="${family}" style="width:${W}px;height:${H}px;border-radius:${lock ? 8 : 22}px;background:${bg};padding:${p[0]}px ${p[3]}px ${p[2]}px ${p[1]}px;display:flex;flex-direction:${inline ? "row" : "column"};align-items:center;justify-content:center;gap:${w.spacing || 0}px">${w.children.map(c => renderEl(c, inline ? "h" : "v")).join("")}</div>`;
}

module.exports = { Color, Font, Size, Point, Rect, Path, DrawContext, SFSymbol, LinearGradient, ListWidget, renderWidget };
