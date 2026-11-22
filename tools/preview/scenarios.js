// The moments final.js and variants.js render (scenario lists shared by both pages).
// Each entry: [time, label].
const COMMON = [
  ["2026-11-05T10:20", "During a class · Thu 10:20"],
  ["2026-11-05T10:47", "Break · Thu 10:47"],
  ["2026-11-05T07:20", "Before school · Thu 07:20"],
  ["2026-11-05T15:00", "After school · Thu 15:00"],
  ["2026-11-07T11:00", "Weekend · Sat"],
  ["2026-11-11T12:50", "Wed 12:50 · ФВС, no room"],
  ["2026-12-28T10:00", "Christmas break · 28 Dec"],
  ["2027-04-06T10:00", "Spring break · 6 Apr"],
  ["2026-12-21T09:00", "Mon 21 Dec, period 2"],
  ["2026-11-05T12:50", "Last class of the day · Thu 12:50"],
  ["2026-11-09T08:10", "First class of a 7-period day · Mon 08:10"],
  ["2026-11-09T10:40", "Break before an important class · Mon 10:40"],
  ["2026-11-06T10:00", "Class with a timed test · Fri 10:00"]
];
// Links (v1.3): runs of back-to-back classes in the same room
const LINKS = [
  ["2026-11-10T12:55", "Links: Tue 12:55 · three boxes, 101 dashed"],
  ["2026-11-09T10:00", "Links: Mon 10:00 · 506 run"],
  ["2026-11-06T12:55", "Links: Fri 12:55 · 503 run"]
];
// tight moments for the medium widget's extra layouts (variants.js only)
const TIGHT = [
  ["2026-11-09T10:20", "Period 3 of 7, Английски · Mon 10:20"],
  ["2026-11-09T13:50", "Period 7 of 7, Математика · Mon 13:50"],
  ["2026-11-06T09:45", "Break before a timed test, Гражд. обр. · Fri 09:45"],
  ["2026-11-10T11:45", "Break before ФВС, no room · Tue 11:45"],
  ["2026-11-06T06:30", "Early morning, more than an hour before school · Fri 06:30"],
  ["2027-07-10T10:00", "Summer vacation · 10 Jul"]
];
module.exports = { final: [...COMMON, ...LINKS], variants: [...COMMON, ...TIGHT, ...LINKS] };
