// The landing page's demo: a made-up class in School Widget's own timetable format (schema 1), in
// English. The page's widget copies show it on DEMO_DATE; tools/test/widgets.test.js gives the same
// timetable to the real script (the preview mock, language "en") and compares the two.
// Nothing here changes by itself: the page always shows this one Thursday.
(function (root) {
  var DEMO = {
    meta: { schema: 1, class: "10b", grade: 10, noRoom: ["PE"] },
    bells: [["08:00", "08:45"], ["08:55", "09:40"], ["09:50", "10:35"], ["10:55", "11:40"], ["11:50", "12:35"], ["12:45", "13:30"], ["13:40", "14:25"]],
    week: {
      1: [{ name: "Maths", room: "214" }, { name: "Maths", room: "214" }, { name: "Chemistry", room: "305" }, { name: "English", room: "208" }, { name: "History", room: "112" }, { name: "PE" }],
      2: [{ name: "Biology", room: "114" }, { name: "Geography", room: "110" }, { name: "Literature", room: "03" }, { name: "Literature", room: "03" }, { name: "Physics", room: "306" }, { name: "Art", room: "401" }],
      3: [{ name: "English", room: "208" }, { name: "Maths", room: "214" }, { name: "Physics", room: "306" }, { name: "History", room: "112" }, { name: "Music", room: "402" }, { name: "PE" }],
      // Thursday, the day the page shows: a test first (red), two Englishes in one room, a double
      // Biology test in one room (red, linked), PE without a room
      4: [{ name: "History", room: "112", important: true }, { name: "English", room: "208" }, { name: "English", room: "208" },
        { name: "Biology", room: "114", important: true }, { name: "Biology", room: "114", important: true }, { name: "PE" }],
      5: [{ name: "Chemistry", room: "305" }, { name: "Maths", room: "214" }, { name: "Literature", room: "03" }, { name: "Geography", room: "110" }, { name: "Art", room: "401" }]
    }
  };
  var out = {
    DEMO: DEMO,
    DEMO_DATE: "2026-12-03", // a Thursday, 13 school days before the Christmas break
    // the moments the page jumps to and the tests check (minutes after midnight)
    MOMENTS: { before: 7 * 60 + 30, inClass: 9 * 60 + 10, break: 10 * 60 + 40, last: 13 * 60 + 5, after: 15 * 60 },
    RANGE: [7 * 60, 16 * 60] // the Try it slider
  };
  if (typeof module === "object" && module.exports) module.exports = out;
  else root.SW_DEMO = out;
})(this);
