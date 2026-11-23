// The official days off: checks holidays/list.json and builds what the website serves.
//   node tools/holidays.js [outDir]        (default out/pages; the Pages workflow passes _site)
//     <out>/holidays.json                   what School Widget downloads (the list, checked)
//     <out>/calendar/feeds/<Y>.ics          a calendar for the class finishing school in Y,
//     <out>/calendar/feeds/<Y>-<city>.ics   (+ that city's days off): it follows the class through
//                                           the years, so a subscription never has to change
//     <out>/calendar/feeds.json             { cohorts: [Y…], cities: { "Варна": "varna", … } } for the page
//   node tools/holidays.js --preview <grade> [city]   prints this school year's days for a grade
// The list: { cities: ["Варна", …] (the app's city picker), years: [{ schoolYear: "2026-27", source,
//   lastDay: { "1-3": "YYYY-MM-DD", … }, daysOff: [["YYYY-MM-DD", "Name"] or ["from", "to", "Name"],
//   optionally + { grades: "1-11" } and/or { city: "Варна" } and/or { exam: "7, 10" }] }]}. Every day
//   needs a name. exam: the grades sitting that exam that day (in their calendar even after their last
//   day of school; for the others it is a day off like any other).
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const LIST = path.join(ROOT, "holidays", "list.json");

const isYmd = s => typeof s === "string" && /^\d{4}-\d\d-\d\d$/.test(s) && new Date(s + "T00:00Z").toISOString().slice(0, 10) === s;
const grades = r => { const m = /^(\d{1,2})(?:-(\d{1,2}))?$/.exec(String(r)); if (!m) return null; const a = +m[1], b = +(m[2] || m[1]); return a >= 1 && b <= 12 && a <= b ? [a, b] : null; };
const inGrades = (r, g) => { const x = grades(r); return !!x && g >= x[0] && g <= x[1]; };
// "7, 10" or "4-6, 12": a list of grades and ranges
const gradeList = r => String(r).split(",").map(x => x.trim());
const inList = (r, g) => gradeList(r).some(x => inGrades(x, g));
const addDay = (s, n) => { const d = new Date(s + "T00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// Every mistake in the list, as text (empty = fine).
function check(doc) {
  const err = [];
  if (!doc || !Array.isArray(doc.years) || !doc.years.length) return ["years: a non-empty list is needed"];
  if (doc.cities && (!Array.isArray(doc.cities) || doc.cities.some(c => typeof c !== "string" || !c.trim()))) err.push("cities: a list of names");
  const seen = new Set();
  for (const y of doc.years) {
    const sy = y && y.schoolYear, m = /^(\d{4})-(\d\d)$/.exec(sy || "");
    if (!m || (+m[1] + 1) % 100 !== +m[2]) { err.push(`schoolYear "${sy}": like "2026-27"`); continue; }
    if (seen.has(sy)) err.push(`${sy}: twice`); seen.add(sy);
    const from = `${m[1]}-09-01`, to = `${+m[1] + 1}-08-31`, inYear = s => s >= from && s <= to;
    for (const [k, v] of Object.entries(y.lastDay || {})) {
      if (!grades(k)) err.push(`${sy} lastDay "${k}": a grade or a range like "1-3"`);
      if (!isYmd(v) || !inYear(v)) err.push(`${sy} lastDay ${k}: "${v}" is not a date in the school year`);
    }
    for (let g = 1; g <= 12; g++) if (!Object.keys(y.lastDay || {}).some(k => inGrades(k, g))) err.push(`${sy} lastDay: no last day for grade ${g}`);
    if (!Array.isArray(y.daysOff)) { err.push(`${sy} daysOff: a list is needed`); continue; }
    y.daysOff.forEach((e, i) => {
      const at = `${sy} daysOff[${i}] ${JSON.stringify(e)}`;
      if (!Array.isArray(e) || !isYmd(e[0])) return err.push(`${at}: starts with a date`);
      const end = isYmd(e[1]) ? e[1] : e[0], rest = e.slice(isYmd(e[1]) ? 2 : 1);
      if (!inYear(e[0]) || !inYear(end)) err.push(`${at}: outside the school year`);
      if (end < e[0]) err.push(`${at}: ends before it starts`);
      if (typeof rest[0] !== "string" || !rest[0].trim()) err.push(`${at}: needs a name`);
      for (const o of rest.slice(1)) {
        if (!o || typeof o !== "object" || Array.isArray(o)) { err.push(`${at}: only { grades, city, exam } after the name`); continue; }
        for (const k of Object.keys(o)) if (!["grades", "city", "exam"].includes(k)) err.push(`${at}: unknown "${k}"`);
        if ("grades" in o && !grades(o.grades)) err.push(`${at}: grades "${o.grades}" like "1-11"`);
        if ("exam" in o && !gradeList(o.exam).every(grades)) err.push(`${at}: exam "${o.exam}" like "7, 10"`);
        if ("city" in o && !(doc.cities || []).includes(o.city)) err.push(`${at}: city "${o.city}" is not in cities`);
      }
      if (rest.length > 2) err.push(`${at}: one { } at most`);
    });
  }
  return err;
}

// One school year's days for a grade and a city: [{ a, b, name, exam? }], the first name winning per
// day; nothing after the grade's last day except its own exams.
function daysFor(y, grade, city) {
  const out = [], taken = new Set();
  const last = Object.entries(y.lastDay).find(([k]) => inGrades(k, grade)), ld = last ? last[1] : "9999";
  for (const e of y.daysOff) {
    const end = isYmd(e[1]) ? e[1] : e[0], rest = e.slice(isYmd(e[1]) ? 2 : 1), o = rest[1] || {};
    if (o.grades && !inGrades(o.grades, grade)) continue;
    if (o.city && o.city !== city) continue;
    const exam = !!o.exam && inList(o.exam, grade);
    if (e[0] > ld && !exam) continue;
    // split around days an earlier entry already named
    let a = null;
    for (let d = e[0]; d <= addDay(end, 1); d = addDay(d, 1)) {
      const free = d <= end && (exam || d <= ld) && !taken.has(d);
      if (free) { taken.add(d); if (!a) a = d; }
      else if (a) { out.push(Object.assign({ a, b: addDay(d, -1), name: rest[0] }, exam ? { exam: true } : {})); a = null; }
    }
  }
  if (last) out.push({ a: ld, b: ld, name: "Последен учебен ден", school: true });
  return out.sort((x, y) => x.a < y.a ? -1 : x.a > y.a ? 1 : 0);
}

// ───── iCalendar ─────
const LAT = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht", ъ: "a", ь: "y", ю: "yu", я: "ya" };
const slug = s => [...s.toLowerCase()].map(c => LAT[c] !== undefined ? LAT[c] : /[a-z0-9]/.test(c) ? c : "-").join("").replace(/-+/g, "-").replace(/^-|-$/g, "");
const esc = s => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
// lines longer than 75 bytes are folded (RFC 5545), never inside a character
function fold(line) {
  const out = []; let cur = "", n = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    if (n + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; n = 0; }
    cur += ch; n += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}
function fnv(s) { let h = 0x811c9dc5; for (const b of Buffer.from(s)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); }
// The calendar for the class finishing school in the summer of `cohort` (+ a city's days).
function feed(doc, cohort, city) {
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//School Widget//holidays//BG", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:" + esc("Ваканции · School Widget"), "X-WR-TIMEZONE:Europe/Sofia",
    "X-WR-CALDESC:" + esc(`Официалните почивни дни за випуск ${cohort}${city ? ", " + city : ""}. https://github.com/batvani/school-widget`),
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H"];
  for (const y of doc.years) {
    const start = +y.schoolYear.slice(0, 4), grade = 12 - (cohort - start - 1);
    if (grade < 1 || grade > 12) continue;
    for (const d of daysFor(y, grade, city)) {
      L.push("BEGIN:VEVENT", `UID:${d.a}-${fnv(d.name + "|" + y.schoolYear)}@school-widget`, "DTSTAMP:20260901T000000Z",
        `DTSTART;VALUE=DATE:${d.a.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${addDay(d.b, 1).replace(/-/g, "")}`,
        "SUMMARY:" + esc(d.name), "TRANSP:TRANSPARENT", "END:VEVENT");
    }
  }
  L.push("END:VCALENDAR");
  return L.map(fold).join("\r\n") + "\r\n";
}
// Every class that is at school in one of the listed years.
function cohorts(doc) {
  const set = new Set();
  for (const y of doc.years) { const s = +y.schoolYear.slice(0, 4); for (let g = 1; g <= 12; g++) set.add(s + 1 + 12 - g); }
  return [...set].sort((a, b) => a - b);
}

function build(doc, out) {
  // a feed for every city in the list, so a subscription also gets the city's days added later
  const cities = doc.cities || [];
  const fd = path.join(out, "calendar", "feeds");
  fs.mkdirSync(fd, { recursive: true });
  fs.writeFileSync(path.join(out, "holidays.json"), JSON.stringify(doc));
  const files = ["holidays.json"];
  for (const c of cohorts(doc)) {
    fs.writeFileSync(path.join(fd, `${c}.ics`), feed(doc, c, null)); files.push(`calendar/feeds/${c}.ics`);
    for (const city of cities) { fs.writeFileSync(path.join(fd, `${c}-${slug(city)}.ics`), feed(doc, c, city)); files.push(`calendar/feeds/${c}-${slug(city)}.ics`); }
  }
  fs.writeFileSync(path.join(out, "calendar", "feeds.json"), JSON.stringify({ cohorts: cohorts(doc), cities: Object.fromEntries(cities.map(c => [c, slug(c)])), years: doc.years.map(y => y.schoolYear) }));
  return files;
}

module.exports = { check, daysFor, feed, cohorts, build, slug, fold };
if (require.main !== module) return;
const doc = JSON.parse(fs.readFileSync(LIST, "utf8"));
const err = check(doc);
if (err.length) { console.error("holidays/list.json:\n  " + err.join("\n  ")); process.exit(1); }
if (process.argv[2] === "--preview") {
  const g = +process.argv[3], city = process.argv[4] || null, now = new Date();
  const s = now.getMonth() < 8 ? now.getFullYear() - 1 : now.getFullYear(), y = doc.years.find(x => +x.schoolYear.slice(0, 4) === s) || doc.years[doc.years.length - 1];
  console.log(`${y.schoolYear}, grade ${g}${city ? ", " + city : ""}:`);
  for (const d of daysFor(y, g, city)) console.log(`  ${d.a}${d.b !== d.a ? " … " + d.b : ""}  ${d.name}${d.exam ? "  (изпит)" : ""}`);
  return;
}
const out = path.resolve(process.argv[2] || path.join(ROOT, "out", "pages"));
const files = build(doc, out);
console.log(`holidays/list.json is fine → ${files.length} files in ${path.relative(process.cwd(), out) || "."}`);
