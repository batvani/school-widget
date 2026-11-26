// Tests for the official days off: holidays/list.json is valid, and tools/holidays.js builds
// holidays.json and the calendar feeds right. node tools/test/holidays.test.js
const fs = require("fs"), path = require("path"), os = require("os"), assert = require("assert");
const H = require("../holidays");
const ROOT = path.join(__dirname, "..", "..");
const LIST = JSON.parse(fs.readFileSync(path.join(ROOT, "holidays/list.json"), "utf8"));
const clone = o => JSON.parse(JSON.stringify(o));

const { testSync: test, finish } = require("./harness");
// the events of a feed: [{ a, b (exclusive), name }]
function events(ics) {
  const text = ics.replace(/\r\n /g, "");
  return [...text.matchAll(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g)].map(([e]) => ({
    a: e.match(/DTSTART;VALUE=DATE:(\d+)/)[1], b: e.match(/DTEND;VALUE=DATE:(\d+)/)[1], name: e.match(/SUMMARY:(.*)/)[1].replace(/\\(.)/g, "$1"), uid: e.match(/UID:(.*)/)[1]
  }));
}

test("holidays/list.json has no mistakes", () => assert.deepStrictEqual(H.check(LIST), []));
test("mistakes are found", () => {
  const bad = (mut, re) => { const d = clone(LIST); mut(d); const e = H.check(d); assert(e.some(x => re.test(x)), `${re}: ${e.join(" | ") || "none"}`); };
  bad(d => d.years[0].schoolYear = "2026/27", /like "2026-27"/);
  bad(d => d.years[0].daysOff.push(["2026-02-30", "X"]), /starts with a date/);
  bad(d => d.years[0].daysOff.push(["2027-09-10", "X"]), /outside the school year/);
  bad(d => d.years[0].daysOff.push(["2026-11-10"]), /needs a name/);
  bad(d => d.years[0].daysOff.push(["2026-11-12", "2026-11-10", "X"]), /ends before/);
  bad(d => d.years[0].daysOff.push(["2026-11-10", "X", { grade: "1-4" }]), /unknown "grade"/);
  bad(d => d.years[0].daysOff.push(["2026-11-10", "X", { grades: "0-13" }]), /grades "0-13"/);
  bad(d => d.years[0].daysOff.push(["2026-11-10", "X", { city: "Атлантида" }]), /not in cities/);
  bad(d => delete d.years[0].lastDay["12"], /no last day for grade 12/);
  bad(d => d.years.push(clone(d.years[0])), /twice/);
});
test("the widget's check accepts it (holValid: years, schoolYear, daysOff)", () => {
  assert(Array.isArray(LIST.years) && LIST.years.every(y => /^\d{4}-\d\d$/.test(y.schoolYear) && Array.isArray(y.daysOff)));
  assert(Array.isArray(LIST.cities) && LIST.cities.includes("София"));
});
test("a grade's days: grade limits, the last day, nothing after it but its own exams", () => {
  const y = LIST.years[0], names = g => H.daysFor(y, g, null).map(d => `${d.a} ${d.name}`);
  assert(names(11).includes("2027-04-03 Пролетна ваканция") && !names(12).includes("2027-04-03 Пролетна ваканция"));
  assert(names(12).includes("2027-05-13 Последен учебен ден") && names(12).includes("2027-05-19 Матура по БЕЛ"));
  assert(!names(12).includes("2027-05-24 24 май"), "after 12th grade's last day: only its exams");
  assert(names(7).includes("2027-06-18 НВО по БЕЛ") && names(7).includes("2027-07-02 Последен учебен ден"));
  assert(!names(2).some(n => /НВО/.test(n)), "2nd grade has finished by then");
  // the first name wins: Велики петък is inside the Великденска ваканция for 1–11
  const d11 = H.daysFor(y, 11, null), vp = d11.filter(d => d.a <= "2027-04-30" && d.b >= "2027-04-30");
  assert.deepStrictEqual(vp.map(d => d.name), ["Великденска ваканция"]);
  assert(H.daysFor(y, 12, null).some(d => d.a === "2027-04-30" && d.name === "Велики петък"));
});
test("a feed follows its class: cohort 2031 is in 8th grade in 2026/27", () => {
  const ev = events(H.feed(LIST, 2031, null));
  assert(ev.some(e => e.a === "20270702" && e.name === "Последен учебен ден"), "8th grade ends with 7–11");
  const ev12 = events(H.feed(LIST, 2027, null));
  assert(ev12.some(e => e.a === "20270513" && e.name === "Последен учебен ден"));
  assert.deepStrictEqual(H.cohorts(LIST), Array.from({ length: 12 }, (_, i) => 2027 + i));
});
test("all-day events end the day after; ids are unique; long lines folded", () => {
  const ics = H.feed(LIST, 2031, null), ev = events(ics);
  const xmas = ev.find(e => e.name === "Коледна ваканция");
  assert.deepStrictEqual([xmas.a, xmas.b], ["20261224", "20270104"]);
  assert.strictEqual(new Set(ev.map(e => e.uid)).size, ev.length);
  for (const line of ics.split("\r\n")) assert(Buffer.byteLength(line) <= 75, line);
  assert(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
  assert(/REFRESH-INTERVAL;VALUE=DURATION:PT6H/.test(ics));
});
test("city feeds: one per city in the list, with that city's days", () => {
  const d = clone(LIST); d.years[0].daysOff.unshift(["2026-11-10", "Грипна ваканция", { city: "Варна" }]);
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "hol-"));
  const files = H.build(d, out);
  assert(files.includes("calendar/feeds/2031-varna.ics") && files.includes("calendar/feeds/2031-sofiya.ics"));
  assert.strictEqual(files.length, 1 + 12 * (1 + d.cities.length));
  assert(events(fs.readFileSync(path.join(out, "calendar/feeds/2031-varna.ics"), "utf8")).some(e => e.name === "Грипна ваканция"));
  assert(!events(fs.readFileSync(path.join(out, "calendar/feeds/2031.ics"), "utf8")).some(e => e.name === "Грипна ваканция"));
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(out, "calendar/feeds.json"), "utf8")).cities["Варна"], "varna");
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(out, "holidays.json"), "utf8")), d);
  fs.rmSync(out, { recursive: true });
});
test("names are transliterated for the file names", () => {
  assert.strictEqual(H.slug("Велико Търново"), "veliko-tarnovo");
  assert.strictEqual(H.slug("Стара Загора"), "stara-zagora");
});

finish();
