// Makes a release's files, for the release workflow (.github/workflows/release.yml) or to look at:
// checks that the tag, the script's version line and VERSION agree and that CHANGELOG.md has the
// version's "Накратко:" / "In short:" lines, then writes out/release/: school-widget.js, version.json
// (what every phone reads) and notes.md (the GitHub release's text).
// The fingerprint is FNV-1a 64 over the text with \n line endings, computed here with BigInt
// (independent of the script's own code; tools/test/release.test.js compares the two).
// The published copy is squashed (esbuild, minified): lines 1–5 (Scriptable's header, the version and id lines)
// and the lines `const VERSION = "…";` and `const TEST_NOW = null;` stay as they are, because the self-update (also 1.8's) and the Shortcut
// look for them; the rest is minified. The fingerprint and size are the squashed file's.
// Usage: node tools/release.js [vX.Y.Z]   (without a tag: this script's own version)
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");

function fnv(text) {
  let h = 0xcbf29ce484222325n;
  for (const b of Buffer.from(String(text).replace(/\r\n?/g, "\n"), "utf8")) { h ^= BigInt(b); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; }
  return h.toString(16).padStart(16, "0");
}
const size = text => Buffer.byteLength(String(text).replace(/\r\n?/g, "\n"), "utf8");

// The notes of one version from CHANGELOG.md: its "## <version>" section's short lines.
function notesFor(changelog, version) {
  const m = changelog.match(new RegExp(`^## ${version.replace(/\./g, "\\.")} [^\\n]*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, "m"));
  if (!m) return null;
  const line = p => { const x = m[1].match(new RegExp(`^${p}\\s*(.+)$`, "m")); return x && x[1].trim(); };
  return { bg: line("Накратко:"), en: line("In short:") };
}

// The squashed copy of the script (see the top). Non-ASCII text becomes \u escapes, so no encoding can garble it.
function squash(src) {
  const lines = src.replace(/\r\n?/g, "\n").split("\n"), head = lines.slice(0, 5), body = lines.slice(5);
  // kept lines: const VERSION (the update checks) and const TEST_NOW (the preview tools set the time there)
  const keep = [/^const VERSION = "[^"]+";$/, /^const TEST_NOW = null;/].map(re => {
    const i = body.findIndex(l => re.test(l)); if (i < 0) throw new Error("no line " + re);
    return body.splice(i, 1)[0].replace(/\s*\/\/.*$/, "");
  });
  const code = require("esbuild").transformSync(body.join("\n"), { minify: true, target: "safari16", legalComments: "none" }).code;
  return head.concat(keep).join("\n") + "\n" + code;
}

// opts: src, changelog, tag ("v1.8.0"), shortcut (the Shortcut's iCloud link) → { versionJson, notesMd, src }
function build(opts = {}) {
  const src = opts.src != null ? opts.src : fs.readFileSync(path.join(ROOT, "school-widget.js"), "utf8");
  const changelog = opts.changelog != null ? opts.changelog : fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8");
  const lines = src.split(/\r?\n/);
  const vLine = (lines[3] || "").match(/^\/\/ Version (\S+) — /), idLine = (lines[4] || "").match(/^\/\/ id: uchilishte-widget; schema: (\d+)/);
  const vConst = src.match(/\nconst VERSION = "([^"]+)";/), sConst = src.match(/\nconst SCHEMA = (\d+);/);
  const errs = [], version = vConst && vConst[1];
  if (!vLine) errs.push("line 4 is not \"// Version X — <date>. See CHANGELOG.md.\"");
  if (!idLine) errs.push("line 5 is not \"// id: uchilishte-widget; schema: N\"");
  if (!vConst) errs.push("no const VERSION");
  if (vLine && version && vLine[1] !== version) errs.push(`line 4 says ${vLine[1]}, VERSION says ${version}`);
  if (idLine && sConst && idLine[1] !== sConst[1]) errs.push(`line 5 says schema ${idLine[1]}, SCHEMA says ${sConst[1]}`);
  if (version && !/^\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/.test(version)) errs.push(`${version} is not X.Y.Z`);
  if (opts.tag && version && opts.tag !== "v" + version) errs.push(`the tag is ${opts.tag}, the script says ${version}: tag v${version}`);
  const notes = version && notesFor(changelog, version.replace(/-.*/, ""));
  if (version && !notes) errs.push(`CHANGELOG.md has no "## ${version.replace(/-.*/, "")} …" section`);
  else if (notes && (!notes.bg || !notes.en)) errs.push(`CHANGELOG.md's ${version} section needs a "Накратко: …" and an "In short: …" line`);
  if (errs.length) { const e = new Error("release refused:\n  " + errs.join("\n  ")); e.errors = errs; throw e; }
  const out = opts.squash === false ? src : squash(src);
  const v = { version, schema: Number(sConst ? sConst[1] : idLine[1]), file: "school-widget.js", fingerprint: fnv(out), size: size(out), notes };
  if (opts.shortcut) v.shortcut = opts.shortcut;
  v.instructions = "1";
  return { versionJson: v, notesMd: `${notes.bg}\n\n${notes.en}\n`, src: out };
}

module.exports = { build, squash, fnv, size, notesFor };
if (require.main === module) {
  try {
    const r = build({ tag: process.argv[2], shortcut: require("./instructions").shortcutLink() });
    const out = path.join(ROOT, "out", "release");
    fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, "school-widget.js"), r.src);
    fs.writeFileSync(path.join(out, "version.json"), JSON.stringify(r.versionJson, null, 2) + "\n");
    fs.writeFileSync(path.join(out, "notes.md"), r.notesMd);
    console.log(`${r.versionJson.version}: out/release/ (school-widget.js, version.json, notes.md)`);
  } catch (e) { console.error(e.message); process.exit(1); }
}
