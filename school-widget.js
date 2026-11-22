// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: graduation-cap;
// Version 1.8.0 — 22 Nov 2026. See CHANGELOG.md.
// id: uchilishte-widget; schema: 1

// ════════════════════════ TIMETABLE ════════════════════════
// Since 1.5.0 your timetable is kept in a data file (uchilishte/data.json in Scriptable's
// documents folder), so updates never touch it. The timetable below is used only when there
// is no data file yet: the first time, it is moved into the data file by itself. If you edit
// it here later, the script asks (when run in Scriptable) whether to use it.
//
// week:    "1" = Monday … "5" = Friday, classes in period order.
//          "important": true marks a class as important (red ring, red name).
//          A free period: { "name": "" }.
// short:   optional short names, used where space is tight (the big class name,
//          the medium widget's list, the Lock Screen).
// icons:   optional icon for each subject: an Apple SF Symbol name (browse them
//          in Apple's free "SF Symbols" app), or "text:XX" for a short text
//          badge like "text:ES". Not shown on the widgets since 1.1 (kept for a
//          future icons tab in the menu).
// daysOff: extra days off of this school (the official ones are in HOLIDAYS below).
//          Each entry is a date "YYYY-MM-DD", a range ["start", "end"], or either one
//          with a name at the end: ["start", "end", "Name"] / ["date", "Name"].
// notOff:  official days off that are school days at this school: ["YYYY-MM-DD", …].
// holidayIcons: icon for a day off whose name contains the given text, e.g.
//          "Коледн" → gift.fill matches "Коледна ваканция". Others get a calendar.
// lastDay: last day of school. After it the widget shows "Vacation". Without it, the
//          grade (meta.grade) picks the official one from HOLIDAYS.lastDay.
// meta:    schema (the format's version), grade, class, noRoom (subjects with no room,
//          e.g. ["ФВС"]), groups (your group in a split class), demo.
const DATA = {
  // A made-up demo class: import your own timetable (or edit this one). A demo is never
  // moved into the data file.
  "meta": { "schema": 1, "demo": true, "class": "10а", "grade": 10, "noRoom": ["ФВС"], "groups": { "Английски|Немски": 0 } },
  "bells": [
    ["08:00", "08:45"],
    ["08:55", "09:40"],
    ["09:50", "10:35"],
    ["10:55", "11:40"],
    ["11:50", "12:35"],
    ["12:45", "13:30"],
    ["13:40", "14:25"]
  ],
  "week": {
    "1": [
      { "name": "БЕЛ", "room": "204" },
      { "name": "Математика", "room": "301" },
      { "name": "Английски / Немски", "room": "306 / 307", "groups": [ { "label": "Английски", "name": "Английски език", "room": "306" }, { "label": "Немски", "name": "Немски език", "room": "307" } ] },
      { "name": "История и цивилизации", "room": "112" },
      { "name": "Биология и здравно образование", "room": "405", "important": true },
      { "name": "ФВС" },
      { "name": "Час на класа", "room": "204" }
    ],
    "2": [
      { "name": "Математика", "room": "301" },
      { "name": "Математика", "room": "301" },
      { "name": "Физика и астрономия", "room": "410" },
      { "name": "География и икономика", "room": "108" },
      { "name": "Английски / Немски", "room": "306 / 307", "groups": [ { "label": "Английски", "name": "Английски език", "room": "306" }, { "label": "Немски", "name": "Немски език", "room": "307" } ] },
      { "name": "Изобразително изкуство", "room": "101" }
    ],
    "3": [
      { "name": "Химия и опазване на околната среда", "room": "407" },
      { "name": "БЕЛ", "room": "204", "important": true },
      { "name": "БЕЛ", "room": "204", "important": true },
      { "name": "Информационни технологии", "room": "215" },
      { "name": "Философия", "room": "112" },
      { "name": "ФВС" },
      { "name": "Музика", "room": "101" }
    ],
    "4": [
      { "name": "Английски / Немски", "room": "306 / 307", "groups": [ { "label": "Английски", "name": "Английски език", "room": "306" }, { "label": "Немски", "name": "Немски език", "room": "307" } ] },
      { "name": "Английски / Немски", "room": "306 / 307", "groups": [ { "label": "Английски", "name": "Английски език", "room": "306" }, { "label": "Немски", "name": "Немски език", "room": "307" } ] },
      { "name": "Математика", "room": "301" },
      { "name": "Биология и здравно образование", "room": "405" },
      { "name": "История и цивилизации", "room": "112" },
      { "name": "Физика и астрономия", "room": "410" }
    ],
    "5": [
      { "name": "География и икономика", "room": "108" },
      { "name": "Химия и опазване на околната среда", "room": "407" },
      { "name": "Математика", "room": "301", "important": true },
      { "name": "БЕЛ", "room": "204" },
      { "name": "Философия", "room": "112" },
      { "name": "ФВС" }
    ]
  },
  "short": {
    "Английски / Немски": "Англ. / Нем.",
    "Английски език": "Английски",
    "Немски език": "Немски",
    "История и цивилизации": "История",
    "Биология и здравно образование": "Биология",
    "Физика и астрономия": "Физика",
    "География и икономика": "География",
    "Химия и опазване на околната среда": "Химия",
    "Информационни технологии": "ИТ",
    "Изобразително изкуство": "Изобр. изк.",
    "Час на класа": "Час на кл."
  },
  // Shorter still, only where a short name doesn't fit (next to the room column, box=room)
  "tiny": {
    "Математика": "Мат."
  },
  "icons": {
    "БЕЛ": "book.fill",
    "Математика": "function",
    "Английски език": "text:EN",
    "Немски език": "text:DE",
    "История и цивилизации": "building.columns.fill",
    "Биология и здравно образование": "leaf.fill",
    "Физика и астрономия": "atom",
    "География и икономика": "globe.europe.africa.fill",
    "Химия и опазване на околната среда": "flask.fill",
    "Информационни технологии": "laptopcomputer",
    "Философия": "brain.head.profile",
    "Изобразително изкуство": "paintpalette.fill",
    "Музика": "music.note",
    "ФВС": "figure.run",
    "Час на класа": "graduationcap.fill"
  },
  "holidayIcons": {
    "Коледн": "gift.fill",
    "Есенн": "leaf.fill",
    "Пролетн": "camera.macro",
    "Междусрочн": "snowflake",
    "Великд": "hare.fill",
    "Великден": "hare.fill",
    "Лятн": "sun.max.fill",
    "Summer": "sun.max.fill",
    "независимост": "flag.fill",
    "Трети март": "flag.fill",
    "24 май": "book.fill",
    "Патрон": "star.fill"
  },
  "daysOff": []
};

// ════════════════════════ HOLIDAYS (built in, one school year) ════════════════════════
// The official days off and the last day of school per grade. They come with the code, so a
// new school year's holidays arrive as a normal update. Schools that differ keep their own
// changes in the timetable (daysOff: extra days off; notOff: official days off they don't have).
// How to update them each school year (when МОН publishes the next year's order, about August):
//   1. edit HOLIDAYS: schoolYear, source, lastDay per grade, daysOff (or ask Claude to do it)
//   2. bump VERSION and line 4, and add the version to CHANGELOG.md with "Накратко:" / "In short:"
//   3. push a tag vX.Y.Z (a GitHub pre-release = beta), check on the phone, then untick "pre-release" (stable)
//   schoolYear: "2026-27" · lastDay: { "<grade or range, e.g. 1-4>": "YYYY-MM-DD" }
//   daysOff: entries in the same forms as the timetable's daysOff
const HOLIDAYS = {
  schoolYear: "2026-27",
  source: "МОН, заповед № РД09-3345 от 31.08.2026 (график на учебното време 2026/2027), as reported by dbr.bg and svetlinki.com; checked 18 Nov 2026",
  // last day of school per grade ("1-3" = grades 1 to 3)
  lastDay: { "1-3": "2027-06-02", "4-6": "2027-06-16", "7-11": "2027-07-02", "12": "2027-05-13" },
  // As in a timetable's daysOff; { grades: "1-11" } at the end = only for those grades (meta.grade;
  // without a grade it counts). Where two overlap, the first name wins.
  daysOff: [
      ["2026-09-22", "Ден на независимостта"],
      ["2026-10-31", "2026-11-02", "Есенна ваканция"],
      ["2026-12-24", "2027-01-03", "Коледна ваканция"],
      ["2027-01-30", "2027-02-02", "Междусрочна ваканция"],
      ["2027-03-03", "Трети март"],
      ["2027-04-03", "2027-04-07", "Пролетна ваканция", { grades: "1-11" }],
      ["2027-04-08", "2027-04-11", "Пролетна ваканция"],
      ["2027-04-30", "2027-05-09", "Великденска ваканция", { grades: "1-11" }],
      ["2027-04-30", "Велики петък"],
      ["2027-05-03", "2027-05-04", "Великден"],
      ["2027-05-06", "Гергьовден"],
      ["2027-05-19", "Матура по БЕЛ"],
      ["2027-05-21", "Втора матура"],
      ["2027-05-24", "24 май"],
      ["2027-05-25", "След 24 май"],
      ["2027-06-18", "НВО по БЕЛ"],
      ["2027-06-21", "НВО по математика"]
  ]
};

// ════════════════════════ DEFAULT SETTINGS ════════════════════════
// Easiest to change in the Settings tab: tap the widget, or run the script
// in Scriptable and choose "Settings". Values chosen there override these.
//
// A single widget can also override them with its Parameter field
// (long-press the widget → Edit Widget → Parameter), separated by ";":
//   Off-School; countdown=off; reason=on; tests=Контролни; tap=off; lang=en; theme=dark
// A word without "=" is the days-off calendar name.
// The medium widget has two more layouts, chosen only here:
//   layout=day   the class in focus | the whole day with start times
//   layout=list  the class in focus on top, the whole day below in two columns
const DEFAULTS = {
  language: "bg",              // "bg" = Bulgarian, "en" = English (text on the widget)
  theme: "auto",               // "auto" = follow Light/Dark Mode, or "dark" / "light"
  offCalendar: "Off-School",   // calendar whose events mark days off
  testsCalendar: "Контролни",  // calendar with tests ("" = off)
  showReason: true,            // show why it's a day off, e.g. "Day off · Коледна ваканция"
  countdown: true,             // "Коледна ваканция in 12 school days" (large widget)
  tapView: true,               // tapping the widget opens Today / Week / Days off / Settings
  remindMinutes: 0,            // notification N minutes before each class (0 = off)
  linkColors: true,            // lines between back-to-back rings in the rings' colours (else grey)
  linkOutlines: false,         // ...and the boxes in the medium lists too (only with linkColors)
  linkBox: "row",              // medium lists: the box goes around the "row" or only the "room"
  autoUpdate: true,            // install new versions by themselves (Settings → Версия)
  channel: "stable"            // "beta" = test versions first (Settings → Версия: tap the version 5 times)
};

// For testing: e.g. "2026-11-05T10:20" shows the widget as it would look then.
const TEST_NOW = null;

// ════════════════════════ CODE (no need to edit below) ════════════════════════
const VERSION = "1.8.0";
const SCHEMA = 1; // the timetable format this version reads (meta.schema)
const NOW = TEST_NOW ? new Date(TEST_NOW) : new Date();

// Colours. "auto" follows the phone's Light/Dark Mode, "dark"/"light" force one.
// Text, icons and the background switch instantly (Color.dynamic). The rings are
// pictures and can't switch by themselves, so in "auto" they use greys that read
// well on both white and black.
function makeColors(theme) {
  const light = theme === "light", dark = theme === "dark";
  const pick = (l, d) => light ? l : dark ? d : Color.dynamic(l, d);
  const ring = (l, d, both) => light ? l : dark ? d : both;
  return {
    bgTop: pick(new Color("#ffffff"), new Color("#1c1c1e")),
    bgBottom: pick(new Color("#f2f2f7"), new Color("#0b0b0c")),
    text: pick(Color.black(), Color.white()),
    dim: pick(new Color("#3c3c43", 0.62), new Color("#ffffff", 0.65)),
    divider: pick(new Color("#000000", 0.1), new Color("#ffffff", 0.12)),
    red: pick(new Color("#ff3b30"), new Color("#ff453a")),      // red text and icons
    // finished classes in the large widget's day list: the same colours at about 40 % strength
    faded: pick(new Color("#000000", 0.36), new Color("#ffffff", 0.38)),
    fadedRed: pick(new Color("#ff3b30", 0.45), new Color("#ff453a", 0.45)),
    // the row of the class in focus: a green tint during a class, a neutral one in a break
    tintClass: pick(new Color("#30d158", 0.16), new Color("#30d158", 0.18)),
    tintBreak: pick(new Color("#000000", 0.05), new Color("#ffffff", 0.08)),
    sun: pick(new Color("#ff9500"), new Color("#ffd60a")),
    // ring colours (pictures)
    faint: ring(new Color("#000000", 0.09), new Color("#ffffff", 0.2), new Color("#8e8e93", 0.3)),
    // upcoming rings and the lines and boxes between them: opaque, so a line is exactly its rings'
    // colour on any background (the user asked; was see-through, and lines came out a different grey).
    // Light / Dark are what the see-through grey looked like over the track; auto: iOS's system grey.
    grey: ring(new Color("#a9a9ad"), new Color("#939395"), new Color("#8e8e93")),
    normal: ring(new Color("#000000", 0.7), new Color("#ffffff", 0.9), new Color("#8e8e93")),
    ringRed: new Color("#ff453a"),
    ringFaded: ring(new Color("#000000", 0.14), new Color("#ffffff", 0.22), new Color("#8e8e93", 0.4)),
    ringRedFaded: new Color("#ff453a", 0.4),
    green: new Color("#30d158"),
    clear: new Color("#000000", 0),
    // the current class's tint inside a box picture (pictures can't follow Light/Dark Mode)
    tintClassPic: ring(new Color("#30d158", 0.16), new Color("#30d158", 0.18), new Color("#30d158", 0.17)),
    tintBreakPic: ring(new Color("#000000", 0.05), new Color("#ffffff", 0.08), new Color("#8e8e93", 0.14)),
    lockTrack: new Color("#ffffff", 0.28)
  };
}
// Lock Screen widgets are always drawn white by iOS (it applies its own style).
function lockColors(c) {
  return Object.assign({}, c, {
    text: Color.white(), dim: new Color("#ffffff", 0.72), faint: new Color("#ffffff", 0.28),
    grey: new Color("#ffffff", 0.45), normal: Color.white(), red: Color.white()
  });
}

// ───── Design tokens ─────
// Every size used by the Home Screen widgets comes from here (like Tailwind's scale).
// fs = text sizes, sp = gaps, ring = { d: diameter, w: line width }.
// size = Apple's documented widget sizes (the smallest phones of this class);
// inner = the size minus the margins. Column widths are worked out from these.
const T = (() => {
  const pad = 16;
  const box = (w, h) => ({ w, h, inner: { w: w - 2 * pad, h: h - 2 * pad } });
  return {
    fs: { xs: 11, sm: 12, md: 13, base: 15, lg: 17, xl: 20, xl2: 24, xl3: 28, xl4: 32, xl5: 36, xl6: 40 },
    sp: { xxs: 2, xs: 4, sm: 6, md: 8, lg: 12, xl: 16 },
    flexMin: 8, // a flexible spacer is never narrower than this (CLAUDE.md, layout rule 1)
    slack: 4,   // spare width for a line built from several texts (the widths are estimates)
    lineH: 1.2, // height of a line of text, × the font size
    hair: 1,    // divider lines
    timeShrink: 2, // a time ("08:00") is this much smaller than the minutes, as it is wider
    pad,
    size: { small: box(155, 155), medium: box(329, 155), large: box(329, 345) },
    ring: {
      row: { d: 22, w: 3, fs: "xs" }, list: { d: 26, w: 3.5, fs: "sm" }, cellCompact: { d: 36, w: 5 }, cell: { d: 40, w: 6 }, hero: { d: 64, w: 8 },
      lockRect: { d: 52, w: 5 }, lockRound: { d: 64, w: 6 },
      spacedMin: 36 // under this size the number is centred without spacers (ringNumSmall)
    },
    // Hero cell (small widget, left half of medium): regular, or compact when a note line is needed
    hero: {
      regular: { ring: "cell", room: "xl2", value: "xl5", unit: "lg", name: "xl" },
      compact: { ring: "cellCompact", room: "xl2", value: "xl3", unit: "base", name: "lg", note: "sm" },
      label: "sm"
    },
    // Medium: hero cell | divider | up to 3 class rows (ring | name over "time · room")
    medium: { rows: 3, rowGap: "md", ringGap: "md", divGap: "xl", name: "base", sub: "sm" },
    // Medium "day" (Parameter layout=day): hero cell | line | the whole day — time | name | room.
    // list width = inner width − hero − the line and its gaps. bleed: how far the highlighted
    // row's tint reaches past the text. Rows share the height (inner height − slackV), up to rowMax.
    day: { hero: 100, divGap: "xl", bleed: "sm", slackV: 3, rowMax: 24, radius: "sm", row: "md", leadGap: "xs" },
    // Medium "list" (Parameter layout=list): header band (ring | name over note | big value | room),
    // a line, then the whole day in two columns — period number | name | room.
    list: {
      ring: "cellCompact", ringGap: "md", name: "lg", note: "sm", noteGap: "xxs", value: "xl3", unit: "base", valueMax: 96, valueGap: "lg",
      room: "xl", roomMax: 60, lineGap: "md", colGap: "xs",
      bleed: "sm", slackV: 3, rowMax: 24, radius: "sm", row: "md", num: "sm", leadGap: "sm"
    },
    // Large: three columns all the way down — when | gap | what | where.
    // what = inner width − when − gap − where. Rows share all the height that is left (homeLarge).
    // The bottom section (countdown / holiday) is always shown; the hero band is sized so it fits.
    large: {
      when: 76, gap: "lg", where: 68, slackV: 2,
      name: "xl", value: "xl4", unit: "base", note: "md", room: "xl2",
      lineGap: "md", rowMin: 25, ringGap: "md",
      rowTime: "base", rowName: "lg", rowNameMin: "base", rowRoom: "lg", radius: "md",
      footer: "base", footerCount: "sm"
    },
    // Links between back-to-back classes (v1.3): boxes in the medium lists, lines between rings.
    //   line: the box outline · dash / dashGap: its dashes · radius · boxGap: between two boxes
    //   roomW: the room column with box=room (at least; wider for a wider room) · ringDash: dashes
    //   between rings · split: the gap in the middle of large's same-room line · stub: the line above
    //   the default medium's first ring when it is linked to the hero's class · dashMin: large uses
    //   dashes when its rings are at least this far apart (6 classes), else the split line (7)
    link: { line: 1.5, dash: 3.5, dashGap: 2.5, radius: "sm", boxGap: "xxs", roomW: 42, ringDash: [3, 2.5], split: 2, dashMin: 9, stub: 6 },
    // Lock Screen (iOS's own style; sizes kept from v1.0)
    lock: {
      name: 15, line: 14, sub: 13, title: 16, ringFs: 24, roundFs: 28, capFs: 10, flag: 11, inline: 13, inlineFlag: 12,
      gap: 8, lineGap: 1, textW: 84, nameHotW: 70, pillR: 5, pillPad: 4, flagGap: 4, holidayFs: 11
    },
    // Summer vacation screen (sizes kept from v1.0)
    vac: { iconS: 38, iconL: 50, titleS: 22, titleL: 26, note: 13, gapIcon: 8, gapText: 2,
      pad: { small: [15, 15, 15, 15], medium: [15, 16, 15, 16], large: [16, 16, 15, 16] } }
  };
})();

// ───── Text shown on the widget, in both languages ─────
const STRINGS = {
  bg: {
    weekdays: ["неделя", "понеделник", "вторник", "сряда", "четвъртък", "петък", "събота"],
    weekdaysShort: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    months: ["яну", "фев", "мар", "апр", "май", "юни", "юли", "авг", "сеп", "окт", "ное", "дек"],
    monthsFull: ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"],
    room: r => `стая ${r}`, roomWord: "стая", min: "мин", inWord: "след",
    inMin: n => `след ${n} мин`, atTime: t => `в ${t}`, until: t => `до ${t}`, startsAt: t => `започва в ${t}`,
    firstClass: "първи час", test: "контролно", testShort: "К",
    dayOff: "Почивен ден", noMore: "Няма повече часове днес", doneShort: "Край за днес",
    tomorrow: "Утре", end: "Край", vacation: "Ваканция", enjoy: "Приятна почивка!", weekend: "Уикенд",
    summer: "Лятна ваканция",
    countdown: (r, n) => `${r} след ${n} ${n === 1 ? "учебен ден" : "учебни дни"}`, daysShort: n => n === 1 ? "уч. ден" : "уч. дни",
    error: "Грешка в разписанието",
    notifStart: t => `Започва в ${t}`, notifTest: (x, t) => `Контролно: ${x} · започва в ${t}`,
    title: "Разписание", tabToday: "Днес", tabWeek: "Програма", tabOff: "Почивни", tabSettings: "Настройки",
    now: "Сега", next: "Следва", minLeft: n => `още ${n} мин`, schoolDay1: "учебен ден", schoolDays: "учебни дни", noDaysOff: "Няма записани почивни дни.",
    set: {
      applyNote: "Промените се запазват веднага. Уиджетите ги показват при следващото си обновяване (обикновено до няколко минути).",
      paramNote: p => `Този уиджет има Parameter „${p}“ – неговите стойности са с предимство пред тези тук.`,
      saved: "Запазено ✓", language: "Език на уиджета",
      theme: "Тема", themeAuto: "Автоматично", themeDark: "Тъмна", themeLight: "Светла",
      themeHint: "„Автоматично“ следва светлия/тъмния режим на телефона.", langNote: "Затвори и отвори отново, за да видиш новия език.",
      daysOff: "Почивни дни", calendar: "Календар", reason: "Причина за почивката", reasonHint: "„Почивен ден · Коледна ваканция“",
      countdown: "Обратно броене до ваканция", countdownHint: "В големия уиджет и в „Почивни“",
      tests: "Контролни", testsHint: "Събитие като „Контролно по химия“ в този календар оцветява часа в червено. Празно = изключено.",
      off: "Изкл.", remind: "Напомняне преди час", remindHint: "При първото включване iOS ще поиска разрешение за известия – позволи го.",
      widget: "Уиджет", tap: "Докосване отваря това меню", tapHint: "Ако го изключиш, менюто остава достъпно в Scriptable.",
      links: "Свързани часове", linkColors: "Цветни връзки",
      linkColorsHint: "Линиите между кръгчетата са в техния цвят: зелено до текущия час, червено между важни часове.",
      linkOutlines: "Цветни рамки", linkOutlinesHint: "Рамките в списъците също стават цветни.",
      linkBox: "Рамка около", boxRow: "Целия ред", boxRoom: "Само стаята",
      linkHint: "Само за един уиджет: в Parameter напиши color=off, outline=on, box=room или box=row.",
      v: {
        title: "Версия", upToDate: "актуална ✓", available: v => `Налична е ${v}`, notes: "Какво е новото",
        update: "Обнови", updateAnyway: "Обнови все пак", check: "Провери сега", previous: "Предишна версия", sure: "Натисни пак, за да потвърдиш", working: "Момент…",
        auto: "Автоматично обновяване", autoHint: "Проверява веднъж на ден и се обновява сам. Програмата и настройките ти не се променят.",
        checked: t => `Проверено ${t}`, today: t => `днес в ${t}`, onDay: (d, t) => `на ${d} в ${t}`, never: "Още не е проверявано за нова версия.",
        updated: v => `Обновено до ${v}`, rolledBack: (a, b) => `Версия ${a} не заработи, затова е върната ${b}.`,
        paused: "Кодът е променян ръчно — автоматичното обновяване е спряно.", pausedBack: v => `Автоматичното обновяване е спряно след „Предишна версия“, докато излезе версия, по-нова от ${v}.`,
        channel: "Канал", channelHint: "beta: получаваш новите версии първи, за проба.",
        newer: "Тази версия е по-нова от stable. Остава, докато stable я настигне.", backTo: v => `Върни се към ${v} (stable)`,
        installed: v => `Готово: инсталирана е ${v}. Затвори менюто и пусни скрипта отново, за да заработи.`, restart: "Кодът вече е сменен. Затвори менюто и пусни скрипта отново.",
        offline: "Няма връзка с GitHub. Опитай пак по-късно.", none: "Няма нова версия.", resumed: "Автоматичното обновяване е пуснато отново.",
        failed: why => `Изтеглената версия не мина проверката (${why}), затова не е инсталирана. Нищо не е променено.`,
        wentBack: v => `Върната е ${v}. Затвори менюто и пусни скрипта отново. Автоматичното обновяване е спряно до следващата версия.`, noBackup: "Няма предишна версия.",
        onChannel: c => `Канал: ${c}.`
      },
      howTo: "Как да добавя уиджет", home: "Начален екран", lock: "Заключен екран",
      homeSteps: name => [
        "Задръж пръст на празно място на началния екран → „Редактиране“ → „Добавяне на уиджет“.",
        "Потърси Scriptable, избери размер и натисни „Добави уиджет“.",
        `Задръж новия уиджет → „Редактиране на уиджета“ → до Script избери „${name}“.`
      ],
      lockSteps: name => [
        "Отключи телефона с Face ID / Touch ID, но остани на заключения екран (не плъзгай нагоре).",
        "Задръж пръст върху заключения екран → „Персонализиране“ → „Заключен екран“.",
        "Докосни полето под часовника (за кръг и правоъгълник) или реда с датата над часовника (за едноредовия).",
        "Намери Scriptable в списъка и докосни формата, която искаш.",
        `Докосни поставения уиджет още веднъж → до Script избери „${name}“ → затвори и натисни „Готово“.`
      ],
      lockTip: "Ако на заключения екран пише „Select script…“, пропуснал си последната стъпка."
    },
    menuTitle: "Училище", menuTimetable: "Разписание", menuSettings: "Настройки",
    menuMedium: "Среден уиджет", menuSmall: "Малък уиджет", menuLarge: "Голям уиджет",
    menuRect: "Заключен екран – правоъгълник", menuCirc: "Заключен екран – кръг", menuInline: "Заключен екран – ред", close: "Затвори", menuUpdates: "Обновяване",
    codeChangedTitle: "Програмата в кода е променена", codeChangedMsg: "Програмата в кода на скрипта е различна от запазената. Да я използвам ли? (Запазената остава в историята.)",
    useIt: "Да, използвай я", keepMine: "Не, остави запазената", ok: "Добре", restore: "Възстанови",
    brokenTitle: "Запазената програма е повредена", brokenMsg: "Сега се показва програмата от кода. Да възстановя последната запазена програма?",
    brokenMsgNoHistory: "Сега се показва програмата от кода. Няма по-стара запазена програма за възстановяване.",
    menuImport: "Внеси програма",
    // the timetable editor and import (1.6.0); "%" is filled in by the page
    ed: {
      edit: "Промени програмата", title: "Програма", impTitle: "Провери програмата", importTitle: "Внасяне на програма",
      impLead: "Докосни клетка, за да я поправиш. Нищо не е запазено, докато не натиснеш „Запази“.", editLead: "Докосни клетка, за да я промениш.",
      daysN: "% дни · % часа", toCheck: "% за проверка", errs: "грешки: %", free: "свободен",
      cancel: "Отказ", save: "Запази", saveAnyway: "Запази все пак", done: "Готово", cont: "Продължи",
      cellTitle: "%, %. час · %", subject: "Предмет", room: "Стая", important: "Важен", importantHint: "Червен пръстен и име", freeP: "Свободен час",
      onlyCell: "Само тази клетка", allOf: "Всички „%“",
      subjects: "Предмети", name: "Име", shortName: "Кратко име", tinyName: "Много кратко", noRoom: "без стая", shortIs: "кратко: %",
      groups: "Групи", whichGroup: "Коя група си?", groupLead: "Класът се дели на групи — избери своята. Уиджетът показва само твоя час и стая. Можеш да смениш по-късно: Програма → Промени програмата.",
      bells: "Звънци", addBell: "+ Добави час",
      off: "Почивни дни", official: "Официалните почивни дни. Включи ден, ако в твоето училище се учи тогава.", addOff: "+ Добави почивен ден на училището", addOffTitle: "Почивен ден на училището", from: "От", to: "До (по желание)",
      last: "Последен учебен ден", lastShort: "Последен ден", grade: "Клас (1–12)", lastHint: "За %. клас по подразбиране: %.", gradeHint: "Напиши класа (1–12): от него идват последният учебен ден и почивните дни само за някои класове.",
      undo: "Върни предишна", undoLead: "Програмите отпреди всяко запазване. Сегашната също отива в историята, така че и това може да се върне.",
      saved: "Програмата е запазена ✓", restored: "Върната е предишната програма ✓", badHist: "Тази програма от историята е повредена.",
      fixFirst: "Първо поправи грешките (в червено).",
      welcome: "Това е примерна програма", welcomeLead: "Сложи своята: снимай програмата, дай я на AI (ChatGPT, Gemini, Claude…) с промпта и внеси отговора.",
      copyPrompt: "Копирай промпта за AI", importBtn: "Внеси програма", paste: "Постави от AI", file: "От файл",
      welcomeHint: "„Постави от AI“ чете копирания отговор на AI-а (целия текст или линка). Програмата остава на телефона.",
      copied: "Промптът е копиран ✓ Постави го в AI-а заедно със снимката на програмата.", emptyClip: "Клипбордът е празен. Копирай целия отговор на AI-а и опитай пак.",
      newer: "Тази програма е от по-нова версия на School Widget. Първо обнови School Widget.", fileBad: "Файлът за внасяне (uchilishte-import.txt) не стана. Да го изтрия ли?", fileGone: "Изтрий файла",
      doneTitle: "Програмата е запазена", doneLead: "Сега добави уиджета. Тези стъпки са и в Настройки → Как да добавя уиджет.", toMenu: "Към менюто",
      share: "Сподели програмата", shareLead: "За съучениците: една снимка и един AI чат стигат за целия клас.", shareWhat: "Какво се споделя",
      shareYes: ["Часовете, стаите, звънците, имената", "И двете групи (всеки избира своята)"], shareNo: "Твоите важни (червени) часове и твоята група",
      sendLink: "Изпрати линк", showQR: "Покажи QR код", saveFile: "Запази като файл", close: "Затвори", fileName: "програма",
      shareHint: "„Изпрати линк“ отваря менюто за споделяне на iPhone: Messages, WhatsApp, AirDrop… Линкът отваря страницата за инсталиране с програмата.",
      qrTitle: "QR код", qrLead: "Съученикът го снима с камерата на iPhone → страницата за инсталиране.", qrBig: "Програмата е твърде голяма за QR код: използвай линка.",
      sharedNote: "Споделена програма. Провери си групите. Важните часове не идват с нея: отбележи своите (докосни клетка → Важен).",
      newYear: "Нова учебна година", newYearLead: "Ако програмата се смени, снимай новата и я дай на AI. Промптът носи твоите имена (кратки имена, група), за да ги запази.",
      copyNames: "Копирай промпта с моите имена", later: "Не сега",
      changed: "Какво се промени", was: "беше %", more: "и още %",
      gone: "„%“ го няма в новата програма (беше %). Къде е сега?", pick: "Избери клетки", drop: "Не е нужно", pickLead: "Докосни клетките, които са „%“.",
      gradeQ: "В кой клас си сега?", gradeLead: "Нова учебна година. От класа зависят последният учебен ден и някои почивни дни.",
      oldHol: "Почивните дни в School Widget са за %. Новите идват с обновяване (обикновено през септември). Дотогава провери почивните дни в Програма → Промени програмата.",
      names: "Моите имена от досегашната програма (използвай ги пак, ако предметите са същите):", namesShort: "кратко „%“", namesTiny: "много кратко „%“", namesNoRoom: "без стая", namesGroup: "Моята група: % (от „%“)",
      prompt: url => `Здравей! Искам да настроя уиджета „School Widget“ с моята програма (снимката е приложена).\nОтвори и следвай стъпките от:\n${url}\nПърво ми напиши реда с версията от файла. Ако не можеш да отваряш линкове, кажи ми и ще ти поставя файла.`
    }
  },
  en: {
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    monthsFull: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    room: r => `Room ${r}`, roomWord: "room", min: "min", inWord: "in",
    inMin: n => `in ${n} min`, atTime: t => `at ${t}`, until: t => `until ${t}`, startsAt: t => `starts at ${t}`,
    firstClass: "first class", test: "test", testShort: "T",
    dayOff: "Day off", noMore: "No more classes today", doneShort: "Done for today",
    tomorrow: "Tomorrow", end: "End", vacation: "Vacation", enjoy: "Enjoy the break!", weekend: "Weekend",
    summer: "Summer vacation",
    countdown: (r, n) => `${r} in ${n} school ${n === 1 ? "day" : "days"}`, daysShort: n => n === 1 ? "day" : "days",
    error: "Timetable error",
    notifStart: t => `Starts at ${t}`, notifTest: (x, t) => `Test: ${x} · starts at ${t}`,
    title: "Timetable", tabToday: "Today", tabWeek: "Timetable", tabOff: "Days off", tabSettings: "Settings",
    now: "Now", next: "Next", minLeft: n => `${n} min left`, schoolDay1: "school day", schoolDays: "school days", noDaysOff: "No days off recorded.",
    set: {
      applyNote: "Changes are saved straight away. Widgets show them on their next refresh (usually within a few minutes).",
      paramNote: p => `This widget has the Parameter “${p}” – its values take priority over these.`,
      saved: "Saved ✓", language: "Widget language",
      theme: "Theme", themeAuto: "Automatic", themeDark: "Dark", themeLight: "Light",
      themeHint: "“Automatic” follows the phone's Light/Dark Mode.", langNote: "Close and reopen to see the new language.",
      daysOff: "Days off", calendar: "Calendar", reason: "Show why it's a day off", reasonHint: "“Day off · Коледна ваканция”",
      countdown: "Countdown to the next break", countdownHint: "On the large widget and in “Days off”",
      tests: "Tests", testsHint: "An event like “Контролно по химия” in this calendar turns that class red. Empty = off.",
      off: "Off", remind: "Reminder before class", remindHint: "The first time, iOS will ask to allow notifications – allow it.",
      widget: "Widget", tap: "Tapping opens this menu", tapHint: "If you turn this off, the menu is still in Scriptable.",
      links: "Linked classes", linkColors: "Coloured links",
      linkColorsHint: "Lines between rings take the rings' colour: green next to the current class, red between important ones.",
      linkOutlines: "Coloured outlines", linkOutlinesHint: "The boxes in the lists get coloured too.",
      linkBox: "Box around", boxRow: "The whole row", boxRoom: "Only the room",
      linkHint: "For one widget only: write color=off, outline=on, box=room or box=row in its Parameter.",
      v: {
        title: "Version", upToDate: "up to date ✓", available: v => `${v} is available`, notes: "What's new",
        update: "Update", updateAnyway: "Update anyway", check: "Check now", previous: "Previous version", sure: "Tap again to confirm", working: "One moment…",
        auto: "Automatic updates", autoHint: "Checks once a day and updates by itself. Your timetable and settings don't change.",
        checked: t => `Checked ${t}`, today: t => `today at ${t}`, onDay: (d, t) => `on ${d} at ${t}`, never: "Not checked for a new version yet.",
        updated: v => `Updated to ${v}`, rolledBack: (a, b) => `Version ${a} didn't work, so ${b} is back.`,
        paused: "The code was changed by hand: automatic updates are paused.", pausedBack: v => `Automatic updates are paused after "Previous version" until a version newer than ${v} comes out.`,
        channel: "Channel", channelHint: "beta: you get new versions first, to try them.",
        newer: "This version is newer than stable. It stays until stable catches up.", backTo: v => `Go back to ${v} (stable)`,
        installed: v => `Done: ${v} is installed. Close the menu and run the script again to start it.`, restart: "The code has already been replaced. Close the menu and run the script again.",
        offline: "Can't reach GitHub. Try again later.", none: "No new version.", resumed: "Automatic updates are on again.",
        failed: why => `The downloaded version failed the check (${why}), so it isn't installed. Nothing has changed.`,
        wentBack: v => `${v} is back. Close the menu and run the script again. Automatic updates are paused until the next version.`, noBackup: "No previous version.",
        onChannel: c => `Channel: ${c}.`
      },
      howTo: "How to add the widget", home: "Home Screen", lock: "Lock Screen",
      homeSteps: name => [
        "Touch and hold an empty spot on the Home Screen → Edit → Add Widget.",
        "Search for Scriptable, pick a size and tap Add Widget.",
        `Touch and hold the new widget → Edit Widget → next to Script, choose “${name}”.`
      ],
      lockSteps: name => [
        "Unlock with Face ID / Touch ID but stay on the Lock Screen (don't swipe up).",
        "Touch and hold the Lock Screen → Customize → Lock Screen.",
        "Tap the box under the clock (for round and rectangular) or the date line above the clock (for the one-line widget).",
        "Find Scriptable in the list and tap the shape you want.",
        `Tap the placed widget once more → next to Script, choose “${name}” → close and tap Done.`
      ],
      lockTip: "If the Lock Screen says “Select script…”, the last step was skipped."
    },
    menuTitle: "School", menuTimetable: "Timetable", menuSettings: "Settings",
    menuMedium: "Medium widget", menuSmall: "Small widget", menuLarge: "Large widget",
    menuRect: "Lock Screen – rectangular", menuCirc: "Lock Screen – round", menuInline: "Lock Screen – one line", close: "Close", menuUpdates: "Updates",
    codeChangedTitle: "The timetable in the code has changed", codeChangedMsg: "The timetable in the script's code differs from the saved one. Use it? (The saved one stays in the history.)",
    useIt: "Yes, use it", keepMine: "No, keep the saved one", ok: "OK", restore: "Restore",
    brokenTitle: "The saved timetable is damaged", brokenMsg: "The timetable from the code is shown for now. Restore the last saved timetable?",
    brokenMsgNoHistory: "The timetable from the code is shown for now. There is no older saved timetable to restore.",
    menuImport: "Import a timetable",
    ed: {
      edit: "Edit the timetable", title: "Timetable", impTitle: "Check the timetable", importTitle: "Import a timetable",
      impLead: "Tap a cell to fix it. Nothing is saved until you tap Save.", editLead: "Tap a cell to change it.",
      daysN: "% days · % periods", toCheck: "% to check", errs: "errors: %", free: "free",
      cancel: "Cancel", save: "Save", saveAnyway: "Save anyway", done: "Done", cont: "Continue",
      cellTitle: "%, period % · %", subject: "Subject", room: "Room", important: "Important", importantHint: "Red ring and name", freeP: "Free period",
      onlyCell: "Only this cell", allOf: "Every “%”",
      subjects: "Subjects", name: "Name", shortName: "Short name", tinyName: "Very short", noRoom: "no room", shortIs: "short: %",
      groups: "Groups", whichGroup: "Which group are you in?", groupLead: "The class splits into groups: pick yours. The widget shows only your class and room. You can change it later: Timetable → Edit the timetable.",
      bells: "Bells", addBell: "+ Add a period",
      off: "Days off", official: "The official days off. Turn one on if your school has classes that day.", addOff: "+ Add a school day off", addOffTitle: "The school's day off", from: "From", to: "To (optional)",
      last: "Last day of school", lastShort: "Last day", grade: "Grade (1–12)", lastHint: "Default for grade %: %.", gradeHint: "Enter the grade (1–12): the last day of school and the days off for some grades only come from it.",
      undo: "Restore an earlier one", undoLead: "The timetables from before each save. The current one goes into the history too, so this can be undone.",
      saved: "Timetable saved ✓", restored: "The earlier timetable is back ✓", badHist: "This timetable in the history is damaged.",
      fixFirst: "Fix the errors (in red) first.",
      welcome: "This is a demo timetable", welcomeLead: "Put in yours: photograph your timetable, give it to an AI (ChatGPT, Gemini, Claude…) with the prompt, and import the answer.",
      copyPrompt: "Copy the AI prompt", importBtn: "Import a timetable", paste: "Paste from the AI", file: "From a file",
      welcomeHint: "“Paste from the AI” reads the AI's copied answer (the whole text or the link). The timetable stays on the phone.",
      copied: "Prompt copied ✓ Paste it into the AI together with the photo of your timetable.", emptyClip: "The clipboard is empty. Copy the AI's whole answer and try again.",
      newer: "This timetable is from a newer version of School Widget. Update School Widget first.", fileBad: "The import file (uchilishte-import.txt) didn't work. Delete it?", fileGone: "Delete the file",
      doneTitle: "Timetable saved", doneLead: "Now add the widget. These steps are also in Settings → How to add the widget.", toMenu: "To the menu",
      share: "Share the timetable", shareLead: "For your classmates: one photo and one AI chat are enough for the whole class.", shareWhat: "What is shared",
      shareYes: ["The classes, rooms, bells and names", "Both groups (everyone picks theirs)"], shareNo: "Your important (red) classes and your group",
      sendLink: "Send a link", showQR: "Show a QR code", saveFile: "Save as a file", close: "Close", fileName: "timetable",
      shareHint: "“Send a link” opens the iPhone share menu: Messages, WhatsApp, AirDrop… The link opens the install page with the timetable.",
      qrTitle: "QR code", qrLead: "Your classmate scans it with the iPhone camera → the install page.", qrBig: "The timetable is too big for a QR code: use the link.",
      sharedNote: "A shared timetable. Check your groups. Important classes don't come with it: mark yours (tap a cell → Important).",
      newYear: "New school year", newYearLead: "If your timetable changes, photograph the new one and give it to an AI. The prompt carries your names (short names, group) so they're kept.",
      copyNames: "Copy the prompt with my names", later: "Not now",
      changed: "What changed", was: "was %", more: "and % more",
      gone: "“%” isn't in the new timetable (it was %). Where is it now?", pick: "Pick the cells", drop: "Not needed", pickLead: "Tap the cells that are “%”.",
      gradeQ: "Which grade are you in now?", gradeLead: "A new school year. The last day of school and some days off depend on the grade.",
      oldHol: "The days off in School Widget are for %. The new ones come with an update (usually in September). Until then, check the days off in Timetable → Edit the timetable.",
      names: "My names from the current timetable (use them again if the subjects are the same):", namesShort: "short “%”", namesTiny: "very short “%”", namesNoRoom: "no room", namesGroup: "My group: % (of “%”)",
      prompt: url => `Hi! I want to set up the “School Widget” widget with my timetable (the photo is attached).\nOpen and follow the steps at:\n${url}\nFirst write me the version line from the file. If you can't open links, tell me and I'll paste the file.`
    }
  }
};

// ───── Dates ─────
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isYmd = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const parseYmd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const atTime = (day, t) => { const [h, m] = t.split(":").map(Number); return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m); };
const hm = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const clamp01 = x => Math.max(0, Math.min(1, x));
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const minsBetween = (a, b) => Math.ceil((b - a) / 60000);

function dayLabel(d, today, short) {
  if (+startOfDay(d) === +addDays(today, 1)) return L.tomorrow;
  return short ? `${L.weekdaysShort[d.getDay()]}, ${d.getDate()} ${L.months[d.getMonth()]}`
               : `${cap(L.weekdays[d.getDay()])}, ${d.getDate()} ${L.months[d.getMonth()]}`;
}

// ───── Rooms and names ─────
const isNumRoom = r => /^\d+[а-яa-z]?$/i.test(String(r || ""));
const roomLabel = r => isNumRoom(r) ? L.room(r) : String(r || "");
const shortName = n => (TT.short && TT.short[n]) || n;
const tinyName = n => (TT.tiny && TT.tiny[n]) || shortName(n);

// ───── Settings ─────
const SETTINGS_FILE = "uchilishte-settings.json";
function settingsPath() { const fm = FileManager.local(); return fm.joinPath(fm.documentsDirectory(), SETTINGS_FILE); }
function loadSaved() {
  const s = Object.assign({}, DEFAULTS);
  try {
    const fm = FileManager.local(), p = settingsPath();
    if (fm.fileExists(p)) Object.assign(s, JSON.parse(fm.readString(p)));
  } catch (e) { console.error("Reading settings: " + e); }
  return s;
}
function saveSettings(s) {
  try { FileManager.local().writeString(settingsPath(), JSON.stringify(s, null, 2)); }
  catch (e) { console.error("Saving settings: " + e); }
}
// Keeps only known keys with the right types (used for values coming from the Settings page).
function cleanSettings(d) {
  const out = loadSaved();
  for (const k of Object.keys(DEFAULTS)) {
    if (!d || !(k in d)) continue;
    const t = typeof DEFAULTS[k];
    out[k] = t === "boolean" ? !!d[k] : t === "number" ? (Number(d[k]) || 0) : String(d[k] || "").trim();
  }
  if (!out.offCalendar) out.offCalendar = DEFAULTS.offCalendar;
  if (!STRINGS[out.language]) out.language = DEFAULTS.language;
  if (!["auto", "dark", "light"].includes(out.theme)) out.theme = "auto";
  if (!["row", "room"].includes(out.linkBox)) out.linkBox = DEFAULTS.linkBox;
  if (!["stable", "beta"].includes(out.channel)) out.channel = DEFAULTS.channel;
  return out;
}
// Reads the widget's Parameter field.
function parseParam(p) {
  const out = {};
  if (!p) return out;
  const YES = /^(yes|on|true|1|да|вкл)$/i, NO = /^(no|off|false|0|не|изкл)$/i;
  String(p).split(/[;\n]/).map(t => t.trim()).filter(Boolean).forEach(tok => {
    const m = tok.match(/^([^=]+)=(.*)$/);
    if (!m) { if (!out.offCalendar) out.offCalendar = tok; return; }
    const k = m[1].trim().toLowerCase(), v = m[2].trim();
    const on = !NO.test(v);
    switch (k) {
      case "calendar": case "календар": out.offCalendar = v || DEFAULTS.offCalendar; break;
      case "countdown": case "ваканция": out.countdown = on; break;
      case "reason": case "причина": out.showReason = on; break;
      case "tests": case "контролни": out.testsCalendar = (NO.test(v) || !v) ? "" : (YES.test(v) ? DEFAULTS.testsCalendar : v); break;
      case "tap": case "докосване": out.tapView = on; break;
      case "color": case "colors": case "colour": case "colours": case "цвят": case "цветове": out.linkColors = on; break;
      case "outline": case "outlines": case "рамки": out.linkOutlines = on; break;
      case "box": case "рамка": { // the box in the medium lists: the whole row, or only the room
        const t = v.toLowerCase();
        if (/^(row|whole|ред|цял|целия)/.test(t)) out.linkBox = "row";
        else if (/^(room|стая|стаята)/.test(t)) out.linkBox = "room";
        break;
      }
      case "layout": case "изглед": case "вид": { // medium widget only: "day" or "list"
        const t = v.toLowerCase();
        out.layout = /^(day|ден)$/.test(t) ? "day" : /^(list|списък)$/.test(t) ? "list" : "";
        break;
      }
      case "update": case "updates": case "обновяване": out.autoUpdate = on; break;
      case "channel": case "канал": out.channel = /^(beta|бета)$/i.test(v) ? "beta" : "stable"; break;
      case "lang": case "language": case "език": if (STRINGS[v.toLowerCase()]) out.language = v.toLowerCase(); break;
      case "theme": case "тема": {
        const t = v.toLowerCase();
        out.theme = /^(dark|тъмна|тъмен)$/.test(t) ? "dark" : /^(light|светла|светъл)$/.test(t) ? "light" : "auto";
        break;
      }
    }
  });
  return out;
}

const PARAM = (args.widgetParameter || (args.queryParameters && args.queryParameters.p) || "").trim();
const SAVED = loadSaved();                              // from the Settings page (all widgets)
const S = Object.assign({}, SAVED, parseParam(PARAM));  // + this widget's Parameter
let L = STRINGS[S.language] || STRINGS.bg;
let C = makeColors(S.theme);

// ════════════════════════ TIMETABLE DATA (since 1.5.0) ════════════════════════
// The timetable lives in a data file, uchilishte/data.json in Scriptable's local documents
// folder (next to the settings file), so an update can replace this code without touching it.
// The built-in DATA above is used only when there is no data file; if it is not a demo
// (meta.demo), it is moved into the data file by itself the first time ("adopted").
const DATA_DIR = "uchilishte", HISTORY_KEEP = 5;
const dataPath = (...p) => { const fm = FileManager.local(); return [DATA_DIR, ...p].reduce((a, b) => fm.joinPath(a, b), fm.documentsDirectory()); };
function ensureDir(p) { const fm = FileManager.local(); if (!fm.fileExists(p)) fm.createDirectory(p, true); }
function readJSON(p) { const fm = FileManager.local(); return fm.fileExists(p) ? JSON.parse(fm.readString(p)) : null; }
function writeJSON(p, v) { ensureDir(p.slice(0, p.lastIndexOf("/"))); FileManager.local().writeString(p, JSON.stringify(v, null, 2)); }
// state.json: update state and the built-in DATA's fingerprint at adoption.
function readState() { try { return readJSON(dataPath("state.json")) || {}; } catch (e) { return {}; } }
function writeState(st) { try { writeJSON(dataPath("state.json"), st); } catch (e) { console.error("Saving state: " + e); } }
const clone = o => JSON.parse(JSON.stringify(o));

// FNV-1a, 64 bit, over the UTF-8 bytes of the text with \n line endings; 16 hex digits.
// Done in four 16-bit pieces (no BigInt, fast enough for the whole script). tools/release.js has the same with BigInt.
function fingerprint(text) {
  const b = utf8encode(String(text).replace(/\r\n?/g, "\n"));
  let h0 = 0x2325, h1 = 0x8422, h2 = 0x9ce4, h3 = 0xcbf2; // offset basis cbf29ce484222325
  for (let i = 0; i < b.length; i++) {
    h0 ^= b[i];
    // × prime 0x100000001b3 = × 0x1b3 + (× 1 << 40)
    const t0 = h0 * 0x1b3, t1 = h1 * 0x1b3 + (t0 >>> 16), t2 = h2 * 0x1b3 + (t1 >>> 16) + (h0 << 8), t3 = h3 * 0x1b3 + (t2 >>> 16) + (h1 << 8);
    h0 = t0 & 0xffff; h1 = t1 & 0xffff; h2 = t2 & 0xffff; h3 = t3 & 0xffff;
  }
  return [h3, h2, h1, h0].map(x => x.toString(16).padStart(4, "0")).join("");
}

// ───── Transport: UTF-8, base64url, raw DEFLATE ─────
function utf8encode(s) {
  const out = [];
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | c >> 6, 0x80 | c & 63);
    else if (c < 0x10000) out.push(0xe0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63);
    else out.push(0xf0 | c >> 18, 0x80 | c >> 12 & 63, 0x80 | c >> 6 & 63, 0x80 | c & 63);
  }
  return out;
}
function utf8decode(b) {
  let s = "";
  for (let i = 0; i < b.length;) {
    const c = b[i++], n = c < 0x80 ? 0 : c >= 0xf0 ? 3 : c >= 0xe0 ? 2 : c >= 0xc0 ? 1 : -1;
    if (n < 0 || i + n > b.length) throw new Error("bad UTF-8");
    let cp = n ? c & (0x3f >> n) : c;
    for (let k = 0; k < n; k++) { const x = b[i++]; if ((x & 0xc0) !== 0x80) throw new Error("bad UTF-8"); cp = cp << 6 | x & 63; }
    s += String.fromCodePoint(cp);
  }
  return s;
}
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
// base64 or base64url, padding optional → bytes
function b64decode(s) {
  s = String(s).replace(/[\s=]+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*$/.test(s) || s.length % 4 === 1) throw new Error("bad base64");
  const out = [];
  let acc = 0, n = 0;
  for (const ch of s) {
    acc = acc << 6 | (ch === "+" ? 62 : ch === "/" ? 63 : B64.indexOf(ch)); n += 6;
    if (n >= 8) { n -= 8; out.push(acc >> n & 255); }
  }
  return out;
}
function b64urlencode(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2], A = B64 + "-_";
    s += A[a >> 2] + A[(a & 3) << 4 | (b || 0) >> 4] + (b === undefined ? "" : A[(b & 15) << 2 | (c || 0) >> 6]) + (c === undefined ? "" : A[c & 63]);
  }
  return s;
}
// Raw DEFLATE decoder (RFC 1951), after tiny-inflate by Devon Govett (MIT licence,
// github.com/foliojs/tiny-inflate), itself a port of Mark Adler's puff. Plain JavaScript,
// so it works in widget runs too. bytes → bytes.
function inflateRaw(src) {
  let pos = 0, bitBuf = 0, bitCnt = 0;
  const out = [];
  const bits = n => {
    let v = 0;
    for (let i = 0; i < n; i++) {
      if (!bitCnt) { if (pos >= src.length) throw new Error("unexpected end of data"); bitBuf = src[pos++]; bitCnt = 8; }
      v |= (bitBuf & 1) << i; bitBuf >>= 1; bitCnt--;
    }
    return v;
  };
  const tree = lens => {
    const counts = new Array(16).fill(0), offs = new Array(16).fill(0), syms = [];
    lens.forEach(l => counts[l]++);
    counts[0] = 0;
    for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + counts[i - 1];
    lens.forEach((l, s) => { if (l) syms[offs[l]++] = s; });
    return { counts, syms };
  };
  const decode = t => {
    let code = 0, first = 0, idx = 0;
    for (let len = 1; len < 16; len++) {
      code |= bits(1);
      const c = t.counts[len];
      if (code - first < c) return t.syms[idx + code - first];
      idx += c; first = (first + c) << 1; code <<= 1;
    }
    throw new Error("bad Huffman code");
  };
  const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
  const LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  const DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  const ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
  let last;
  do {
    last = bits(1);
    const type = bits(2);
    if (type === 0) { // stored
      bitCnt = 0;
      if (pos + 4 > src.length) throw new Error("unexpected end of data");
      const len = src[pos] | src[pos + 1] << 8;
      if ((len ^ 0xffff) !== (src[pos + 2] | src[pos + 3] << 8)) throw new Error("bad stored block");
      pos += 4;
      if (pos + len > src.length) throw new Error("unexpected end of data");
      for (let i = 0; i < len; i++) out.push(src[pos++]);
      continue;
    }
    if (type === 3) throw new Error("bad block type");
    let lt, dt;
    if (type === 1) { // fixed codes
      const l = []; for (let i = 0; i < 288; i++) l.push(i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8);
      lt = tree(l); dt = tree(new Array(30).fill(5));
    } else { // dynamic codes
      const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
      const cl = new Array(19).fill(0);
      for (let i = 0; i < hclen; i++) cl[ORDER[i]] = bits(3);
      const ct = tree(cl), lens = [];
      while (lens.length < hlit + hdist) {
        const sym = decode(ct);
        if (sym < 16) lens.push(sym);
        else {
          const [val, n] = sym === 16 ? [lens[lens.length - 1], 3 + bits(2)] : sym === 17 ? [0, 3 + bits(3)] : [0, 11 + bits(7)];
          if (val === undefined) throw new Error("bad code lengths");
          for (let i = 0; i < n; i++) lens.push(val);
        }
      }
      if (lens.length > hlit + hdist) throw new Error("bad code lengths");
      lt = tree(lens.slice(0, hlit)); dt = tree(lens.slice(hlit));
    }
    for (;;) {
      const sym = decode(lt);
      if (sym === 256) break;
      if (sym < 256) { out.push(sym); continue; }
      const li = sym - 257;
      if (li >= 29) throw new Error("bad length code");
      const len = LBASE[li] + bits(LEXT[li]), di = decode(dt);
      if (di >= 30) throw new Error("bad distance code");
      const dist = DBASE[di] + bits(DEXT[di]);
      if (dist > out.length) throw new Error("bad distance");
      for (let i = 0; i < len; i++) out.push(out[out.length - dist]);
    }
  } while (!last);
  return out;
}

// ───── Import: any of the transport forms → a timetable object ─────
const IMPORT_ERR = {
  none: { bg: "Това не прилича на програма. Копирай целия отговор на AI-а (или линка) и опитай пак.", en: "This doesn't look like a timetable. Copy the AI's whole answer (or the link) and try again." },
  broken: { bg: "Програмата е непълна или повредена — вероятно е отрязана при копирането. Копирай я отново цялата.", en: "The timetable is incomplete or damaged, probably cut off while copying. Copy all of it again." },
  notObject: { bg: "Това е JSON, но не е програма.", en: "This is JSON, but not a timetable." }
};
// The first balanced {…} in the text (from position `from`), respecting strings.
function balancedObject(text, from) {
  const a = text.indexOf("{", from);
  if (a < 0) return null;
  let depth = 0, str = false, esc = false;
  for (let i = a; i < text.length; i++) {
    const ch = text[i];
    if (str) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') str = false; continue; }
    if (ch === '"') str = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && !--depth) return { start: a, text: text.slice(a, i + 1) };
  }
  return { start: a, text: null };
}
// Returns { data } or { error: { bg, en } }.
function parseImport(input) {
  const text = String(input == null ? "" : input).trim();
  const ok = d => d && typeof d === "object" && !Array.isArray(d) ? { data: d } : { error: IMPORT_ERR.notObject };
  const payload = (kind, body) => {
    try {
      if (kind === "j") return ok(JSON.parse(body));
      const bytes = b64decode(body);
      return ok(JSON.parse(utf8decode(kind === "z" ? inflateRaw(bytes) : bytes)));
    } catch (e) { return { error: IMPORT_ERR.broken }; }
  };
  if (!text) return { error: IMPORT_ERR.none };
  // 1–3: uchilishte:z: / :d: / :j: at the start
  let m = text.match(/^uchilishte:([zdj]):([\s\S]*)$/);
  if (m) return payload(m[1], m[1] === "j" ? m[2].trim() : m[2].trim().split(/\s/)[0]);
  // 4: a link with #z= / #d= / ?data=
  m = text.match(/[#&]([zd])=([A-Za-z0-9_\-+/=%]+)/);
  if (m) return payload(m[1], decodeURIComponent(m[2]));
  m = text.match(/[?&]data=([^&#\s]+)/);
  if (m) { let v = m[1]; try { v = decodeURIComponent(v); } catch (e) { } if (/^uchilishte:/.test(v)) return parseImport(v); }
  // 5: raw JSON
  try { return ok(JSON.parse(text)); } catch (e) { }
  // the prefix somewhere inside a longer text (a whole AI answer)
  m = text.match(/uchilishte:([zd]):([A-Za-z0-9_\-]+)/);
  if (m) return payload(m[1], m[2]);
  // 6: the first balanced {…} that parses (a ```json block, or JSON inside other text)
  for (let from = 0, found = false; ;) {
    const b = balancedObject(text, from);
    if (!b) return { error: found ? IMPORT_ERR.broken : IMPORT_ERR.none };
    found = true;
    if (!b.text) return { error: IMPORT_ERR.broken }; // never closed: cut off while copying
    try { return ok(JSON.parse(b.text)); } catch (e) { }
    from = b.start + 1;
  }
}

// ───── Data format: schema conversion, groups, checks ─────
// schema 0 = a bare DATA without meta (the 1.4.x format). Each later schema adds one step here.
function migrate(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return d;
  d = clone(d);
  if (!d.meta || typeof d.meta !== "object") d.meta = { schema: 1, source: "adopted" };
  else if (d.meta.schema === undefined || d.meta.schema === 0) d.meta.schema = 1;
  // the grade comes from shared links and files, and the editor's page shows it: a whole number 1–12 or nothing
  if (d.meta.grade !== undefined) { const g = Number(d.meta.grade); if (Number.isInteger(g) && g >= 1 && g <= 12) d.meta.grade = g; else delete d.meta.grade; }
  return d;
}
// The key of a split class's label set: labels sorted and joined with "|".
const groupKey = groups => groups.map(g => g.label).sort().join("|");
// An ordinary DATA for the widgets: each split class becomes the picked group's
// { name, room, important }; without a pick, the entry's own name and room.
function resolveGroups(d) {
  const out = clone(d), picks = (d.meta && d.meta.groups) || {};
  for (const k of Object.keys(out.week || {})) {
    out.week[k] = out.week[k].map(e => {
      if (!e || !Array.isArray(e.groups)) return e;
      const g = e.groups[picks[groupKey(e.groups)]];
      const r = g ? { name: g.name, room: g.room !== undefined ? g.room : e.room, important: g.important !== undefined ? g.important : e.important }
        : { name: e.name, room: e.room, important: e.important };
      if (r.room === undefined) delete r.room;
      if (!r.important) delete r.important;
      return r;
    });
  }
  return out;
}
// The last day of school: the timetable's own, else the built-in one for the grade
// (HOLIDAYS.lastDay keys: "10", or a range "8-11"), else 30 June of the school year.
// grade g in a range "10" / "8-11"
const inGrades = (r, g) => { const [a, b] = String(r).split("-").map(Number); return g >= a && g <= (b || a); };
function lastDayFor(d) {
  if (d.lastDay) return d.lastDay;
  const g = d.meta && d.meta.grade;
  for (const [k, v] of Object.entries(HOLIDAYS.lastDay || {})) if (inGrades(k, g)) return v;
  return `20${HOLIDAYS.schoolYear.slice(-2)}-06-30`;
}
const realDate = s => isYmd(s) && ymd(parseYmd(s)) === s;
const isHHMM = s => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const toMin = s => +s.slice(0, 2) * 60 + +s.slice(3);
const CELL = n => ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][n.day] + n.p;
// Where a name goes, for the width warnings: the font size it should keep, the smallest size it
// may shrink to (one step down the scale, as on large's rows) and the width it has, worked out like
// the widgets do it (heroCell, classRow, largeHero, dayRow, the Lock Screen).
function nameSpots() {
  const k = largeCols(), H = T.hero, dg = T.sp[T.medium.divGap];
  const medCol = Math.floor((T.size.medium.inner.w - 2 * dg - T.hair) / 2);
  const step = s => { const v = Object.values(T.fs).filter(x => x < s); return v.length ? Math.max(...v) : s; };
  const spot = (where, use, size, w, bold = true) => ({ where, use, size, min: step(size), w, bold });
  return [
    spot("small", "short", T.fs[H.regular.name], T.size.small.inner.w - T.flexMin),
    spot("medium", "short", T.fs[H.regular.name], medCol - T.flexMin),
    spot("medium list", "short", T.fs[T.medium.name], medCol - T.ring.list.d - T.sp[T.medium.ringGap]),
    spot("large", "short", T.fs[T.large.name], k.what),
    spot("large list", "full", T.fs[T.large.rowName], k.what, false),
    spot("Lock Screen", "short", T.lock.name, T.lock.textW, false)
  ];
}
const SPOT_BG = { small: "малкия уиджет", medium: "средния уиджет", "medium list": "списъка на средния уиджет", large: "големия уиджет", "large list": "списъка на големия уиджет", "Lock Screen": "заключения екран" };
// The most periods the large widget shows with rows of at least T.large.rowMin (Phase 1: 8 → 7).
const MAX_PERIODS_LARGE = 7;
// Checks a timetable (after migrate). Returns { errors, warnings }, each item
// { code, where, text: { bg, en } }. opts.quick: errors only (used when loading).
function validateData(d, opts = {}) {
  const errors = [], warnings = [];
  const E = (code, where, bg, en) => errors.push({ code, where, text: { bg, en } });
  const W = (code, where, bg, en) => warnings.push({ code, where, text: { bg, en } });
  const isObj = x => x && typeof x === "object" && !Array.isArray(x);
  if (!isObj(d)) { E("not_object", "", "Програмата не е обект.", "The timetable is not an object."); return { errors, warnings }; }
  const meta = isObj(d.meta) ? d.meta : null;
  if (!meta || typeof meta.schema !== "number") E("schema_missing", "meta.schema", "Липсва номер на формата (meta.schema).", "The format number (meta.schema) is missing.");
  else if (meta.schema > SCHEMA) { E("schema_newer", "meta.schema", "Програмата е в по-нов формат — първо обнови School Widget.", "The timetable is in a newer format: update School Widget first."); return { errors, warnings }; }
  // bells
  const bells = d.bells;
  if (!Array.isArray(bells) || bells.length < 1 || bells.length > 10) E("bells", "bells", "Звънецът трябва да има от 1 до 10 часа.", "Bell times must have 1 to 10 periods.");
  else bells.forEach((b, i) => {
    const w = `bells[${i}]`;
    if (!Array.isArray(b) || b.length !== 2 || !isHHMM(b[0]) || !isHHMM(b[1])) return E("bell_format", w, `Час ${i + 1}: часовете трябва да са като "08:00".`, `Period ${i + 1}: times must look like "08:00".`);
    if (toMin(b[0]) >= toMin(b[1])) E("bell_order", w, `Час ${i + 1} свършва преди да започне.`, `Period ${i + 1} ends before it starts.`);
    const p = bells[i - 1];
    if (i && Array.isArray(p) && isHHMM(p[1]) && toMin(b[0]) < toMin(p[1])) E("bell_overlap", w, `Час ${i + 1} започва преди да е свършил час ${i}.`, `Period ${i + 1} starts before period ${i} ends.`);
  });
  const nBells = Array.isArray(bells) ? bells.length : 10;
  // week
  const cells = []; // { day, p, e, where }
  if (!isObj(d.week)) E("week", "week", "Липсва седмицата (week).", "The week (week) is missing.");
  else {
    let schoolDays = 0;
    for (const [k, list] of Object.entries(d.week)) {
      if (!/^[1-6]$/.test(k)) { E("week_day", `week.${k}`, `Непознат ден "${k}" (1 = понеделник … 6 = събота).`, `Unknown day "${k}" (1 = Monday … 6 = Saturday).`); continue; }
      const dn = ["", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"][k], den = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][k];
      if (!Array.isArray(list)) { E("week_day", `week.${k}`, `${dn}: трябва да е списък от часове.`, `${den}: must be a list of periods.`); continue; }
      if (list.length > nBells) E("day_long", `week.${k}`, `${dn}: ${list.length} часа, а звънецът има ${nBells}.`, `${den}: ${list.length} periods, but there are ${nBells} bell times.`);
      if (list.length) schoolDays++;
      if (!list.some(e => isObj(e) && (e.name || Array.isArray(e.groups)))) W("day_empty", `week.${k}`, `${dn} няма часове.`, `${den} has no classes.`);
      list.forEach((e, i) => {
        const where = CELL({ day: +k, p: i + 1 });
        if (!isObj(e)) return E("cell", where, `${where}: не е час.`, `${where}: not a class.`);
        const bad = Object.keys(e).filter(x => !["name", "room", "important", "groups"].includes(x));
        if (bad.length) E("cell_key", where, `${where}: непознато поле ${bad.join(", ")}.`, `${where}: unknown field ${bad.join(", ")}.`);
        if (typeof e.name !== "string") E("cell_name", where, `${where}: липсва име на предмета.`, `${where}: the subject's name is missing.`);
        if (e.room !== undefined && typeof e.room !== "string") E("cell_room", where, `${where}: стаята трябва да е текст ("03", не 3).`, `${where}: the room must be text ("03", not 3).`);
        if (e.important !== undefined && typeof e.important !== "boolean") E("cell_important", where, `${where}: "important" трябва да е true или false.`, `${where}: "important" must be true or false.`);
        if (e.groups !== undefined) {
          if (!Array.isArray(e.groups) || e.groups.length < 2 || e.groups.length > 4) E("groups", where, `${where}: групите трябва да са от 2 до 4.`, `${where}: there must be 2 to 4 groups.`);
          else e.groups.forEach((g, j) => {
            if (!isObj(g) || typeof g.label !== "string" || !g.label.trim() || typeof g.name !== "string" || (g.room !== undefined && typeof g.room !== "string") || (g.important !== undefined && typeof g.important !== "boolean")
              || Object.keys(g).some(x => !["label", "name", "room", "important"].includes(x)))
              E("group", where, `${where}: група ${j + 1} трябва да има label, name и по желание room, important.`, `${where}: group ${j + 1} needs label, name and optionally room, important.`);
          });
        }
        cells.push({ day: +k, p: i + 1, e, where });
      });
    }
    if (!schoolDays) E("no_days", "week", "Няма нито един учебен ден.", "There isn't a single school day.");
  }
  // string maps
  for (const k of ["short", "tiny", "icons", "holidayIcons"]) {
    if (d[k] === undefined) continue;
    if (!isObj(d[k]) || Object.values(d[k]).some(v => typeof v !== "string")) E("map", k, `"${k}" трябва да е от вида { "име": "текст" }.`, `"${k}" must look like { "name": "text" }.`);
  }
  // days off and the last day
  if (d.daysOff !== undefined) {
    if (!Array.isArray(d.daysOff)) E("days_off", "daysOff", "daysOff трябва да е списък.", "daysOff must be a list.");
    else d.daysOff.forEach((e, i) => {
      const okE = realDate(e) || (Array.isArray(e) && realDate(e[0]) && (
        (e.length === 2 && (realDate(e[1]) ? e[1] >= e[0] : typeof e[1] === "string")) ||
        (e.length === 3 && realDate(e[1]) && e[1] >= e[0] && typeof e[2] === "string")));
      if (!okE) E("days_off", `daysOff[${i}]`, `Почивен ден ${i + 1}: трябва да е "ГГГГ-ММ-ДД", ["от", "до"] или с име накрая.`, `Day off ${i + 1}: must be "YYYY-MM-DD", ["from", "to"] or either with a name at the end.`);
    });
  }
  if (d.notOff !== undefined && (!Array.isArray(d.notOff) || !d.notOff.every(realDate))) E("not_off", "notOff", `notOff трябва да е списък от дати "ГГГГ-ММ-ДД".`, `notOff must be a list of "YYYY-MM-DD" dates.`);
  if (d.lastDay !== undefined && !realDate(d.lastDay)) E("last_day", "lastDay", `Последният учебен ден трябва да е дата "ГГГГ-ММ-ДД".`, `The last day of school must be a "YYYY-MM-DD" date.`);
  if (!d.lastDay && !(meta && meta.grade)) E("no_last_day", "lastDay", "Липсва последният учебен ден (или класът, meta.grade).", "The last day of school (or the grade, meta.grade) is missing.");
  if (meta && meta.groups !== undefined && (!isObj(meta.groups) || Object.values(meta.groups).some(v => !Number.isInteger(v) || v < 0))) E("meta_groups", "meta.groups", "meta.groups трябва да е от вида { \"А|Б\": 0 }.", "meta.groups must look like { \"A|B\": 0 }.");
  if (meta && meta.noRoom !== undefined && (!Array.isArray(meta.noRoom) || meta.noRoom.some(v => typeof v !== "string"))) E("meta_noroom", "meta.noRoom", "meta.noRoom трябва да е списък от имена.", "meta.noRoom must be a list of names.");
  if (errors.length || opts.quick) return { errors, warnings };

  // warnings
  const noRoom = new Set((meta && meta.noRoom) || []), picks = (meta && meta.groups) || {};
  const short = n => (d.short && d.short[n]) || n;
  const lessons = []; // every class as shown: { where, name, room }
  for (const c of cells) {
    const e = c.e;
    if (Array.isArray(e.groups)) {
      if (!(groupKey(e.groups) in picks)) W("no_pick", c.where, `${c.where}: класът се дели (${e.groups.map(g => g.label).join(" / ")}) — още не е избрана група.`, `${c.where}: a split class (${e.groups.map(g => g.label).join(" / ")}) with no group picked yet.`);
      e.groups.forEach(g => lessons.push({ where: c.where, name: g.name, room: g.room !== undefined ? g.room : e.room }));
    } else if (e.name) lessons.push({ where: c.where, name: e.name, room: e.room });
  }
  for (const l of lessons) {
    if (!l.room && !noRoom.has(l.name)) W("no_room", l.where, `${l.where} (${l.name}): липсва стая.`, `${l.where} (${l.name}): the room is missing.`);
  }
  const q = [];
  JSON.stringify(d, (k, v) => { if (typeof v === "string" && v.includes("?")) q.push(v); return v; });
  if (q.length) W("question", "", `Има неясни места („?“): ${[...new Set(q)].slice(0, 5).join(", ")}.`, `There are unclear places ("?"): ${[...new Set(q)].slice(0, 5).join(", ")}.`);
  // names that would have to shrink below their place's smallest size
  const names = [...new Set(lessons.map(l => l.name))], spots = nameSpots();
  for (const n of names) {
    for (const sp of spots) {
      const s = sp.use === "full" && fitSize(n, sp.size, sp.w, sp.bold) < T.fs[T.large.rowNameMin] ? short(n) : sp.use === "full" ? n : short(n);
      if (fitSize(s, sp.size, sp.w, sp.bold) < sp.min) { W("too_wide", n, `„${s}“ е твърде дълго за ${SPOT_BG[sp.where]} — дай по-кратко име (short).`, `"${s}" is too long for the ${sp.where} widget: give it a shorter name (short).`); break; }
    }
  }
  const longest = Math.max(0, ...cells.map(c => c.p));
  if (longest > MAX_PERIODS_LARGE) W("too_many", "week", `${longest} часа в ден: големият уиджет събира до ${MAX_PERIODS_LARGE} четливо.`, `${longest} periods in a day: the large widget fits up to ${MAX_PERIODS_LARGE} readably.`);
  const ld = lastDayFor(d), today = ymd(NOW);
  if (ld < today) W("last_day_past", "lastDay", `Последният учебен ден (${ld}) е минал.`, `The last day of school (${ld}) has passed.`);
  else if (ld > ymd(addDays(NOW, 380))) W("last_day_far", "lastDay", `Последният учебен ден (${ld}) е след повече от година.`, `The last day of school (${ld}) is more than a year away.`);
  // two different subjects with the same short name can't be told apart on the widgets
  const byShort = {};
  for (const n of names) (byShort[short(n)] = byShort[short(n)] || []).push(n);
  for (const [s, ns] of Object.entries(byShort)) if (ns.length > 1 && ns.some(n => n !== s))
    W("same_short", s, `„${ns.join("“ и „")}“ имат едно и също кратко име „${s}“.`, `"${ns.join('" and "')}" have the same short name "${s}".`);
  return { errors, warnings };
}

// ───── Loading the timetable ─────
let TT = null;      // the timetable the widgets use (groups resolved, lastDay set)
let TT_FULL = null; // the same in full form (with groups), as saved
const TINFO = {};   // how it was loaded: source "file" | "adopted" | "builtin" | "broken"; codeChanged; error
// Saves a timetable as data.json; the one it replaces goes to history/ (the last HISTORY_KEEP).
function saveTimetable(d) {
  const fm = FileManager.local(), p = dataPath("data.json"), hd = dataPath("history");
  if (fm.fileExists(p)) {
    ensureDir(hd);
    fm.writeString(fm.joinPath(hd, `${Date.now()}.json`), fm.readString(p));
    const old = fm.listContents(hd).filter(n => /^\d+\.json$/.test(n)).sort((a, b) => parseInt(b) - parseInt(a));
    old.slice(HISTORY_KEEP).forEach(n => fm.remove(fm.joinPath(hd, n)));
  }
  writeJSON(p, d);
}
// The newest timetable in history/ that loads without errors, or null.
function lastGoodHistory() {
  const fm = FileManager.local(), hd = dataPath("history");
  if (!fm.fileExists(hd)) return null;
  for (const n of fm.listContents(hd).filter(n => /^\d+\.json$/.test(n)).sort((a, b) => parseInt(b) - parseInt(a))) {
    try { const d = migrate(JSON.parse(fm.readString(fm.joinPath(hd, n)))); if (!validateData(d, { quick: true }).errors.length) return d; } catch (e) { }
  }
  return null;
}
function useTimetable(d) {
  TT_FULL = d;
  TT = resolveGroups(d);
  TT.lastDay = lastDayFor(d);
}
// The data file; else adopt the built-in DATA (unless it is the demo);
// a broken file falls back to the built-in DATA. Runs in widget runs too.
function loadTimetable() {
  for (const k of Object.keys(TINFO)) delete TINFO[k];
  const fm = FileManager.local(), p = dataPath("data.json"), st = readState();
  const own = !(DATA.meta && DATA.meta.demo), fp = fingerprint(JSON.stringify(DATA));
  let d = null;
  if (fm.fileExists(p)) {
    try {
      d = migrate(JSON.parse(fm.readString(p)));
      const v = validateData(d, { quick: true });
      if (v.errors.length) throw new Error(v.errors[0].text.en);
      TINFO.source = "file";
    } catch (e) {
      d = null; TINFO.source = "broken"; TINFO.error = String(e.message || e);
      if (st.brokenLogged !== TINFO.error) { console.error("Reading the timetable: " + TINFO.error); st.brokenLogged = TINFO.error; writeState(st); }
    }
    if (d && st.brokenLogged) { delete st.brokenLogged; writeState(st); }
    // the built-in DATA edited by hand, the old way, after the timetable moved into the file
    if (d && own) {
      if (!st.builtinFp) { st.builtinFp = fp; writeState(st); }
      else if (st.builtinFp !== fp) TINFO.codeChanged = true;
    }
  } else if (own) {
    d = migrate(DATA);
    try { saveTimetable(d); st.builtinFp = fp; writeState(st); TINFO.source = "adopted"; }
    catch (e) { console.error("Saving the timetable: " + e); TINFO.source = "builtin"; }
  }
  if (!d) { d = migrate(DATA); if (!TINFO.source) TINFO.source = "builtin"; }
  useTimetable(d);
  return TINFO;
}
// In the app: questions about how the timetable was loaded (asked before the menu opens).
async function timetableQuestions() {
  const ask = async (title, msg, yes, no) => {
    const a = new Alert(); a.title = title; a.message = msg;
    a.addAction(yes); a.addCancelAction(no);
    return (await a.presentAlert()) === 0;
  };
  if (TINFO.codeChanged) {
    const st = readState();
    if (await ask(L.codeChangedTitle, L.codeChangedMsg, L.useIt, L.keepMine)) { saveTimetable(migrate(DATA)); useTimetable(migrate(DATA)); }
    st.builtinFp = fingerprint(JSON.stringify(DATA)); writeState(st);
    delete TINFO.codeChanged;
  }
  if (TINFO.source === "broken") {
    const h = lastGoodHistory();
    if (await ask(L.brokenTitle, h ? L.brokenMsg : L.brokenMsgNoHistory, h ? L.restore : L.ok, L.close) && h) {
      writeJSON(dataPath("data.json"), h); useTimetable(h); TINFO.source = "file";
    }
  }
}

// ════════════════════════ SELF-UPDATE (since 1.5.0) ════════════════════════
// Checks the GitHub releases at most once a day (only version.json), and installs a new version
// by itself when auto-update is on: download → check (id line, version, size, fingerprint,
// compiles) → back up this file → replace it → the new version confirms on its first good run,
// or goes back to the backup by itself (main's catch). The timetable and settings are untouched.
// Every release v<version> has two files, made by the release workflow: version.json and the script.
// Stable is GitHub's latest release; beta is the newest of all, pre-releases included.
const REPO = "batvani/school-widget", PAGES = "https://batvani.github.io/school-widget/";
const GH = `https://github.com/${REPO}/releases/`;
const channel = () => S.channel === "beta" ? "beta" : "stable";
const relFile = (version, file) => `${GH}download/v${version}/${file}`;
const BACKUPS_KEEP = 3, CHECK_EVERY = 20 * 3600e3; // "once a day", with some slack for iOS's refresh times
const autoUpdateOn = () => S.autoUpdate !== false;
// semver: 1 if a > b, -1 if a < b, 0 if equal (pre-releases like 1.6.0-beta.2 come before 1.6.0)
function cmpVersion(a, b) {
  const p = v => { const [core, pre] = String(v).split("-"); return { n: core.split(".").map(Number), pre: pre ? pre.split(".") : [] }; };
  const x = p(a), y = p(b);
  for (let i = 0; i < 3; i++) if ((x.n[i] || 0) !== (y.n[i] || 0)) return (x.n[i] || 0) > (y.n[i] || 0) ? 1 : -1;
  if (!x.pre.length || !y.pre.length) return x.pre.length === y.pre.length ? 0 : x.pre.length ? -1 : 1;
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const s = x.pre[i], t = y.pre[i];
    if (s === undefined || t === undefined) return s === undefined ? -1 : 1;
    if (s === t) continue;
    const ns = /^\d+$/.test(s), nt = /^\d+$/.test(t);
    return ns && nt ? (+s > +t ? 1 : -1) : ns ? -1 : nt ? 1 : (s > t ? 1 : -1);
  }
  return 0;
}
// This script's own file (iCloud Drive or local, wherever Scriptable keeps it)
function scriptFM() {
  const l = FileManager.local();
  try { if (l.isFileStoredIniCloud(module.filename)) return FileManager.iCloud(); } catch (e) { }
  return l;
}
async function readOwn() {
  const fm = scriptFM();
  try { if (fm.downloadFileFromiCloud) await fm.downloadFileFromiCloud(module.filename); } catch (e) { }
  return fm.fileExists(module.filename) ? fm.readString(module.filename) : null;
}
const codeSize = t => utf8encode(String(t).replace(/\r\n?/g, "\n")).length;
async function fetchText(url, secs) {
  const r = new Request(url); r.timeoutInterval = secs || 20;
  const t = await r.loadString();
  if (r.response && r.response.statusCode && r.response.statusCode !== 200) throw new Error(`HTTP ${r.response.statusCode}`);
  return t;
}
// Downloads version.json (at most once a day unless forced). Offline or any error: silent, null.
// Works out whether this file is a published release (else auto-update pauses: edited by hand).
async function checkForUpdate(force, secs) {
  const st = readState();
  if (!force && st.lastCheck && NOW - new Date(st.lastCheck) < CHECK_EVERY && st.checkedChannel === channel()) return null;
  let v;
  try { v = await latestRelease(secs); } catch (e) { return null; }
  if (!v || typeof v.version !== "string" || typeof v.fingerprint !== "string") return null;
  st.lastCheck = NOW.toISOString(); st.checkedChannel = channel();
  st.latest = v.version; st.notes = v.notes || null;
  st.release = { version: v.version, file: v.file || "school-widget.js", fingerprint: v.fingerprint, size: v.size, shortcut: v.shortcut || null };
  const own = await readOwn().catch(() => null), fp = own == null ? null : fingerprint(own);
  // this file as it was published: its own release's fingerprint (looked up once per version;
  // not found = not a release, e.g. a copy from the PC; offline = unknown, nothing changes)
  let rel = v.version === VERSION ? v.fingerprint : st.ownRelease && st.ownRelease.version === VERSION ? st.ownRelease.fingerprint : null, unknown = false;
  if (!rel) try { rel = JSON.parse(await fetchText(relFile(VERSION, "version.json"), secs)).fingerprint || null; } catch (e) { unknown = !/404/.test(String(e && e.message || e)); }
  if (rel) st.ownRelease = { version: VERSION, fingerprint: rel };
  if (unknown) { } else if (fp && fp !== rel && fp !== v.fingerprint && st.ignoreFp !== fp) st.autoPaused = "edited";
  else if (st.autoPaused === "edited") st.autoPaused = false;
  if (st.autoPaused === "rollback" && cmpVersion(v.version, st.pausedAt || VERSION) > 0) st.autoPaused = false;
  writeState(st);
  return v;
}
// The newest release's version.json for this channel.
async function latestRelease(secs) {
  if (channel() !== "beta") return JSON.parse(await fetchText(GH + "latest/download/version.json", secs));
  const list = JSON.parse(await fetchText(`https://api.github.com/repos/${REPO}/releases?per_page=10`, secs));
  const vs = (Array.isArray(list) ? list : []).filter(r => r && !r.draft && /^v\d+\.\d+\.\d+/.test(r.tag_name || "")).map(r => r.tag_name.slice(1));
  if (!vs.length) throw new Error("no releases");
  return JSON.parse(await fetchText(relFile(vs.reduce((a, b) => cmpVersion(b, a) > 0 ? b : a), "version.json"), secs));
}
// Is there something to install? (newer than this version, not refused before)
function updateAvailable(st = readState()) {
  return !!(st.latest && cmpVersion(st.latest, VERSION) > 0 && !(st.badVersions || []).includes(st.latest));
}
// Downloads, checks and installs st.release. opts.manual: the user tapped (also clears a pause);
// opts.downgrade: an older version is allowed (going back from beta to stable). → { ok, reason }
async function installUpdate(opts = {}) {
  const st = readState(), rel = st.release;
  const fail = reason => ({ ok: false, reason });
  if (!rel) return fail("no release");
  const dir = cmpVersion(rel.version, VERSION);
  if (dir < 0 && !opts.downgrade || dir === 0) return fail("not newer");
  if ((st.badVersions || []).includes(rel.version) && !opts.manual) return fail("bad version");
  let code;
  try { code = await fetchText(relFile(rel.version, rel.file)); } catch (e) { return fail("offline"); }
  // the checks: a real release of this script, the version promised, complete, and it compiles
  const lines = code.split(/\r?\n/);
  if (!/^\/\/ id: uchilishte-widget; schema: \d+/.test(lines[4] || "")) return fail("no id line");
  const m = code.match(/\nconst VERSION = "([^"]+)";/);
  if (!m || m[1] !== rel.version) return fail("wrong version");
  if (typeof rel.size === "number" && codeSize(code) !== rel.size) return fail("wrong size");
  if (fingerprint(code) !== rel.fingerprint) return fail("wrong fingerprint");
  try { new (Object.getPrototypeOf(async function () { }).constructor)(code); } catch (e) { return fail("does not compile"); }
  // back up this file, then replace it
  const own = await readOwn().catch(() => null);
  if (own == null) return fail("can't read this script");
  const fm = FileManager.local(), bd = dataPath("backups"), backup = fm.joinPath(bd, `${VERSION}.js.txt`);
  try {
    ensureDir(bd); fm.writeString(backup, own);
    st.backups = [backup, ...(st.backups || []).filter(b => b !== backup)];
    st.backups.slice(BACKUPS_KEEP).forEach(b => { try { fm.remove(b); } catch (e) { } });
    st.backups = st.backups.slice(0, BACKUPS_KEEP);
    const sfm = scriptFM();
    sfm.writeString(module.filename, code);
    if (fingerprint(sfm.readString(module.filename)) !== rel.fingerprint) throw new Error("read back differs");
  } catch (e) {
    // iOS may not let a widget write the script: install at the next run in the app
    try { scriptFM().writeString(module.filename, own); } catch (e2) { }
    if (config.runsInWidget) { st.pendingInstall = rel.version; writeState(st); return fail("pending"); }
    writeState(st); return fail("can't write: " + (e.message || e));
  }
  st.pendingVerify = { version: rel.version, backup, from: VERSION };
  st.justUpdated = rel.version; st.pendingInstall = false;
  if (opts.manual) { st.autoPaused = false; delete st.ignoreFp; }
  writeState(st);
  return { ok: true, version: rel.version };
}
// The daily check, and an install if auto-update is on and not paused. Never throws.
async function updateTick(secs) {
  try {
    const st0 = readState();
    if (st0.pendingInstall && !config.runsInWidget) { await checkForUpdate(true, secs); return await installUpdate(); }
    const v = await checkForUpdate(false, secs);
    const st = readState();
    if (v && autoUpdateOn() && !st.autoPaused && updateAvailable(st)) return await installUpdate();
  } catch (e) { }
  return null;
}
// After the first good run of a new version: it's confirmed, the backup stays for "Предишна версия".
function confirmVersion() {
  const st = readState();
  if (st.pendingVerify && st.pendingVerify.version === VERSION) { st.pendingVerify = null; writeState(st); }
}
// main's catch: a new version that fails on its first run goes back to the backup by itself.
async function rollbackIfNew(err) {
  const st = readState(), pv = st.pendingVerify;
  if (!pv || pv.version !== VERSION) return false;
  try {
    const fm = FileManager.local();
    scriptFM().writeString(module.filename, fm.readString(pv.backup));
    st.badVersions = [...new Set([...(st.badVersions || []), VERSION])];
    st.pendingVerify = null; st.justUpdated = null; st.rolledBack = { from: VERSION, to: pv.from, error: String(err && err.message || err) };
    writeState(st);
    console.error(`Version ${VERSION} failed (${err}); went back to ${pv.from}.`);
    return true;
  } catch (e) { console.error("Going back failed: " + e); return false; }
}
// "Предишна версия": back to the newest backup; auto-update pauses until a newer release.
async function previousVersion() {
  const st = readState(), b = (st.backups || [])[0];
  if (!b) return { ok: false, reason: "no backup" };
  const fm = FileManager.local();
  let code;
  try { code = fm.readString(b); } catch (e) { return { ok: false, reason: "no backup" }; }
  try { scriptFM().writeString(module.filename, code); } catch (e) { return { ok: false, reason: "can't write" }; }
  st.backups = st.backups.slice(1);
  st.autoPaused = "rollback"; st.pausedAt = st.latest && cmpVersion(st.latest, VERSION) > 0 ? st.latest : VERSION;
  st.pendingVerify = null; st.justUpdated = null; st.ignoreFp = fingerprint(code);
  writeState(st);
  const m = code.match(/\nconst VERSION = "([^"]+)";/);
  return { ok: true, version: m ? m[1] : "?" };
}
// "Обнови все пак": resume auto-update after a hand edit (this file is then trusted).
async function resumeUpdates() {
  const st = readState(), own = await readOwn().catch(() => null);
  st.autoPaused = false; if (own != null) st.ignoreFp = fingerprint(own);
  writeState(st);
}
// Switching the channel: saved in the settings; from beta back to stable, when this version is
// newer than stable's, offers "Върни се към X (stable)" (downgrades only on that tap: opts.downgrade).
async function switchChannel(ch) {
  const s = loadSaved(); s.channel = ch === "beta" ? "beta" : "stable"; saveSettings(s);
  S.channel = s.channel;
  const v = await checkForUpdate(true);
  return { channel: s.channel, latest: v && v.version, back: !!(v && cmpVersion(v.version, VERSION) < 0) };
}

// ───── Days off and tests ─────
const OFF = new Map();   // "YYYY-MM-DD" → reason ("" if unknown)
const TESTS = new Map(); // "YYYY-MM-DD" → [calendar events]

function markOff(from, to, reason, override) {
  for (let d = startOfDay(from); d <= to; d = addDays(d, 1)) {
    const k = ymd(d);
    if (!OFF.has(k) || (reason && (override || !OFF.get(k)))) OFF.set(k, reason || "");
  }
}
// Every day an event covers. All-day events end at the next midnight.
function eventDays(ev) {
  const s = startOfDay(ev.startDate);
  let end = ev.endDate;
  if (ev.isAllDay) {
    const e0 = startOfDay(end);
    end = (+e0 === +end) ? end : addDays(e0, 1);
    if (end <= s) end = addDays(s, 1);
  }
  const out = [];
  for (let d = s; d < end; d = addDays(d, 1)) out.push(d);
  if (!out.length) out.push(s);
  return out;
}
async function eventsFrom(calName, from, to) {
  const cal = await Calendar.forEventsByTitle(calName);
  return await CalendarEvent.between(from, to, [cal]);
}
async function loadData() {
  // 1) the official days off (HOLIDAYS), then the school's own (the timetable's daysOff),
  //    then the official ones this school doesn't have (notOff) are removed
  const grade = TT.meta && TT.meta.grade;
  for (const e of [...HOLIDAYS.daysOff, ...(TT.daysOff || [])]) {
    if (isYmd(e)) markOff(parseYmd(e), parseYmd(e), "");
    else if (Array.isArray(e) && isYmd(e[0])) {
      const only = e.find(x => x && x.grades);
      if (only && grade && !inGrades(only.grades, grade)) continue;
      const b = isYmd(e[1]) ? e[1] : e[0];
      const name = e.slice(1).find(x => typeof x === "string" && !isYmd(x)) || "";
      markOff(parseYmd(e[0]), parseYmd(b), name);
    }
  }
  for (const k of TT.notOff || []) OFF.delete(k);
  // 2) the days-off calendar, from today to the end of the school year
  const today = startOfDay(NOW);
  const until = addDays(parseYmd(TT.lastDay), 1);
  if (today < until && S.offCalendar) {
    try {
      for (const ev of await eventsFrom(S.offCalendar, today, until))
        for (const d of eventDays(ev)) markOff(d, d, (ev.title || "").trim(), true);
    } catch (e) { console.error(`Can't read calendar "${S.offCalendar}": ${e}`); }
  }
  // 3) the tests calendar, a few weeks around today
  if (S.testsCalendar) {
    try {
      for (const ev of await eventsFrom(S.testsCalendar, addDays(today, -7), addDays(today, 22))) {
        for (const d of eventDays(ev)) {
          const k = ymd(d);
          if (!TESTS.has(k)) TESTS.set(k, []);
          TESTS.get(k).push(ev);
        }
      }
    } catch (e) { console.log(`Tests calendar "${S.testsCalendar}" not found (${e})`); }
  }
}

// ───── Classes for a given day ─────
const norm = s => String(s || "").toLowerCase().replace(/ё/g, "е");
// First 5 letters of each longer word, so "химия" matches "Контролно по химия".
const stems = name => norm(name).split(/[\s.,:;!?()"„“\-–—\/]+/).filter(w => w.length >= 4 && w !== "език").map(w => w.slice(0, 5));

// Marks classes that have a test, using the tests calendar.
// Timed events match the class at that time; all-day events match by subject name.
function applyTests(date, lessons) {
  for (const ev of TESTS.get(ymd(date)) || []) {
    const title = norm(ev.title);
    let hit = lessons.filter(l => title.includes(norm(l.name)));
    if (!hit.length) hit = lessons.filter(l => stems(l.name).some(st => title.includes(st)));
    if (!ev.isAllDay) {
      const overlap = lessons.filter(l => l.start < ev.endDate && l.end > ev.startDate);
      const both = hit.filter(l => overlap.includes(l));
      hit = both.length ? both : (hit.length ? hit : overlap);
    }
    if (hit.length && !ev.isAllDay) hit = hit.filter(l => l.name === hit[0].name);
    hit.forEach(l => { l.test = (ev.title || L.test).trim(); l.hot = true; });
  }
}
const LCACHE = new Map();
function lessonsFor(date) {
  const k = ymd(date);
  if (LCACHE.has(k)) return LCACHE.get(k);
  const list = (TT.week[String(date.getDay())] || []);
  const out = [];
  list.forEach((l, i) => {
    const b = TT.bells[i];
    if (!l || !l.name || !b) return;
    out.push({
      name: l.name, room: String(l.room || ""), hot: !!l.important,
      short: shortName(l.name), tiny: tinyName(l.name), num: i + 1,
      start: atTime(date, b[0]), end: atTime(date, b[1]), test: null
    });
  });
  applyTests(date, out);
  LCACHE.set(k, out);
  return out;
}
function dayStatus(d) {
  const k = ymd(d);
  if (k > TT.lastDay) return { school: false, kind: "vacation", reason: "" };
  const wd = d.getDay();
  if (wd === 0 || wd === 6) return { school: false, kind: "weekend", reason: "" };
  if (OFF.has(k)) return { school: false, kind: "off", reason: OFF.get(k) };
  if (!lessonsFor(d).length) return { school: false, kind: "off", reason: "" };
  return { school: true, kind: "school", reason: "" };
}
function nextSchoolDay(after) {
  for (let i = 1; i <= 400; i++) {
    const d = addDays(after, i);
    if (ymd(d) > TT.lastDay) return null;
    if (dayStatus(d).school) return d;
  }
  return null;
}

// ───── What's happening right now ─────
// mode: "class" | "break" (incl. before the first class) | "done" | "off" | "vacation"
function computeState(now) {
  const today = startOfDay(now);
  const status = dayStatus(today);
  const s = { now, today, status, lessons: [], upcoming: [] };
  if (status.school) {
    const Ls = lessonsFor(today);
    s.lessons = Ls;
    const cur = Ls.find(l => l.start <= now && now < l.end);
    if (cur) {
      s.mode = "class"; s.current = cur;
      s.upcoming = Ls.filter(l => l.start >= cur.end);
      s.progress = clamp01((now - cur.start) / (cur.end - cur.start));
      s.minsLeft = minsBetween(now, cur.end);
    } else {
      const nx = Ls.find(l => l.start > now);
      if (nx) {
        const prev = Ls.filter(l => l.end <= now).pop();
        s.mode = "break"; s.next = nx; s.before = !prev;
        s.upcoming = Ls.filter(l => l.start > nx.start);
        // the ring fills during the break (before school: during the last hour)
        s.breakStart = prev ? prev.end : new Date(nx.start - 60 * 60000);
        s.progress = clamp01((now - s.breakStart) / (nx.start - s.breakStart));
        s.minsTo = minsBetween(now, nx.start);
      } else s.mode = "done";
    }
  } else s.mode = status.kind === "vacation" ? "vacation" : "off";

  if (s.mode === "done" || s.mode === "off") {
    const nd = nextSchoolDay(today);
    if (nd) { s.nextDay = nd; s.nextLessons = lessonsFor(nd); }
    else s.mode = "vacation";
  }
  return s;
}
function startsIn(s) { return s.minsTo <= 60 ? L.inMin(s.minsTo) : L.atTime(hm(s.next.start)); }
// Next bell — or 5 minutes, whichever is sooner, so the minutes on the widget stay right.
function nextRefresh(s) {
  const t = [];
  const add = d => { if (d > s.now) t.push(+d); };
  s.lessons.forEach(l => { add(l.start); add(l.end); });
  if (s.lessons[0]) add(new Date(s.lessons[0].start - 60 * 60000));
  if (s.nextLessons && s.nextLessons[0]) add(new Date(s.nextLessons[0].start - 60 * 60000));
  add(addDays(s.today, 1));
  let next = Math.min(...t);
  if (s.mode === "class" || s.mode === "break") next = Math.min(next, +s.now + 5 * 60000);
  return new Date(next);
}
// School days left until the next weekday off (or until the end of the year).
function countdown(s) {
  let d = (s.status.school && s.mode !== "done") ? s.today : addDays(s.today, 1);
  let n = 0;
  for (let i = 0; i < 400; i++, d = addDays(d, 1)) {
    if (ymd(d) > TT.lastDay) return n ? { n, reason: L.summer } : null;
    const st = dayStatus(d);
    if (st.kind === "off") { if (n === 0) continue; return { n, reason: st.reason || L.dayOff }; }
    if (st.school) n++;
  }
  return null;
}
// The same holiday icons as emoji, for the full-screen view (web pages can't draw SF Symbols).
const HOLIDAY_EMOJI = { "gift.fill": "🎁", "leaf.fill": "🍂", "camera.macro": "🌷", "snowflake": "❄️", "hare.fill": "🐰", "sun.max.fill": "☀️", "flag.fill": "🇧🇬", "book.fill": "📚", "star.fill": "⭐️", "calendar": "📅" };
function holidayEmoji(reason) { const sym = holidayIcon(reason); return sym ? (HOLIDAY_EMOJI[sym] || "📅") : ""; }
// Icon for a day off, from the timetable's holidayIcons (matched by part of the name).
function holidayIcon(reason) {
  if (!reason) return null;
  const r = norm(reason);
  for (const [k, sym] of Object.entries(TT.holidayIcons || DATA.holidayIcons || {})) if (r.includes(norm(k))) return sym;
  return "calendar";
}
function offTitle(s) { return s.mode === "done" ? L.noMore : L.dayOff; }
function offReason(s) {
  if (s.mode !== "off" || !S.showReason) return null;
  if (s.status.kind === "weekend") return L.weekend;
  return s.status.reason || null;
}

// ════════════════════════ RINGS ════════════════════════
// The ring is only a picture, used as the background of a stack. The icon or
// number sits on top as normal widget text, kept inside the square that fits in
// the circle and allowed to shrink, so it can never stick out of the ring.
// ext (v1.3, links between back-to-back classes): the picture is ext.h tall with the ring in
// the middle, and line pieces from the ring to the top (ext.above) and bottom (ext.below) edge.
function ringImage(d, w, p, color, track, disc, ext) {
  const ctx = new DrawContext();
  const H = ext ? ext.h : d, oy = ext && ext.oy != null ? ext.oy : (H - d) / 2;
  ctx.size = new Size(d, H);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  const r = (d - w) / 2, c = d / 2, cy = c + oy;
  if (ext) {
    // the pieces end at the ring's outer edge: overlapping see-through colours showed as a patch
    if (ext.above) linkPiece(ctx, c, 0, oy, ext.above, true);
    if (ext.below) linkPiece(ctx, c, oy + d, H, ext.below, false);
  }
  if (disc) { const i = w * 1.45; ctx.setFillColor(disc); ctx.fillEllipse(new Rect(i, i + oy, d - 2 * i, d - 2 * i)); }
  const circle = () => ctx.strokeEllipse(new Rect(c - r, cy - r, 2 * r, 2 * r));
  ctx.setStrokeColor(track || C.faint);
  ctx.setLineWidth(w);
  circle();
  if (p > 0) {
    ctx.setStrokeColor(color); ctx.setFillColor(color); ctx.setLineWidth(w);
    if (p >= 0.995) circle();
    else {
      const a0 = -Math.PI / 2, a1 = a0 + 2 * Math.PI * p;
      ctx.addPath(polyPath(arcPts(c, cy, r, a0, a1, Math.max(6, Math.ceil(180 * p))))); ctx.strokePath();
      for (const a of [a0, a1]) // rounded ends
        ctx.fillEllipse(new Rect(c + r * Math.cos(a) - w / 2, cy + r * Math.sin(a) - w / 2, w, w));
    }
  }
  return ctx.getImage();
}
// o: { d: size, w: line width, p: 0…1, color, track, disc, ext (see ringImage) }
// The ring is the stack's background picture. Scriptable's vertical stacks line
// their contents up on the left, so each line inside goes on its own row with a
// flexible gap on both sides. Each gap is at least ~8 pt wide, so the text gets
// the ring's width minus 16 pt, and its size is worked out to fit that.
function ringStack(parent, o) {
  const st = parent.addStack();
  st.size = new Size(o.d, o.ext ? o.ext.h : o.d);
  st.backgroundImage = ringImage(o.d, o.w, o.p || 0, o.color || C.normal, o.track, o.disc, o.ext);
  st.layoutVertically();
  st.centerAlignContent();
  return st;
}
// Room for text inside the ring: a w × h box fits when w² + h² ≤ (inner diameter)².
function ringRoom(o, kind) {
  const D = o.d - 2 * o.w - 2;
  const [fw, fh] = kind === "wide" ? [0.84, 0.54] : kind === "two" ? [0.72, 0.69] : [0.7, 0.7];
  return { w: Math.min(D * fw, o.d - 18), h: Math.min(D * fh, o.d - 18) };
}
// Font size that fits a box, worked out here because iOS sometimes cuts text off
// instead of shrinking it. Widths are generous estimates for the rounded bold font.
function fitFs(text, boxW, boxH, base) {
  const w = emWidth(text, true) || 1;
  return Math.max(7, Math.floor(Math.min(base, (boxW * 0.96) / w, boxH / 1.22)));
}
// A row inside a ring with fn's content between two flexible spacers, so it sits in the middle.
function ringRow(st, fn) {
  const row = st.addStack(); row.layoutHorizontally();
  row.addSpacer();
  fn(row);
  row.addSpacer();
}
function ringLabel(st, t, fs, font, color) {
  ringRow(st, row => {
    const x = row.addText(String(t));
    x.font = font; x.textColor = color; x.lineLimit = 1; x.minimumScaleFactor = 0.5;
  });
}
// A plain ring with nothing inside.
function ringPlain(parent, o) {
  const st = ringStack(parent, o);
  st.addSpacer();
  return st;
}
// A ring with the class's period number inside ("3" = 3rd class).
// Rings too small for a readable number stay plain.
function ringNum(parent, o, l) {
  if (!l) return ringPlain(parent, o);
  if (o.d < T.ring.spacedMin) return ringNumSmall(parent, o, l);
  return ringText(parent, Object.assign({ text: String(l.num), fs: Math.round(o.d * 0.42), textColor: C.text, box: "square" }, o));
}
// Small rings: spacers (at least 8 pt each) would leave no room for the number. A stack
// with a fixed width that lays out horizontally centres its content on iOS (seen on the
// phone), so the number goes straight in, with no spacers. It stays normal widget text, so
// it switches with Light/Dark Mode (colours drawn into a picture can't).
function ringNumSmall(parent, o, l) {
  const st = ringStack(parent, o);
  st.layoutHorizontally(); st.centerAlignContent();
  // with link lines the picture is taller than the ring: pad it so the number is centred on the
  // ring itself (the line from the hero made the picture taller at the top and lifted the number)
  if (o.ext && o.ext.oy != null && Math.abs(o.ext.oy - (o.ext.h - o.d) / 2) > 0.01)
    st.setPadding(o.ext.oy, 0, o.ext.h - o.ext.oy - o.d, 0);
  const fs = T.fs[o.fs], x = st.addText(String(l.num));
  x.font = Font.boldRoundedSystemFont(fs); x.textColor = o.textColor || C.text; x.lineLimit = 1; x.minimumScaleFactor = 0.8;
  return st;
}
// A ring with an icon inside (Lock Screen: the sun during the holidays).
function ringIcon(parent, symName, o) {
  const st = ringStack(parent, o);
  const room = ringRoom(o, "square");
  st.addSpacer();
  ringRow(st, row => icon(row, symName, Math.floor(Math.min(room.w, o.d * 0.44)), C.text));
  st.addSpacer();
  return st;
}
// extra o fields: text, fs (largest size), caption, capTop, capFs, textColor, capColor
function ringText(parent, o) {
  const st = ringStack(parent, o);
  const room = ringRoom(o, o.caption ? "two" : (o.box === "square" ? "square" : "wide"));
  const capFs = o.caption ? Math.min(o.capFs || 9, Math.floor(room.w * 0.96 / emWidth(o.caption))) : 0; // caption fits the ring too
  const fs = fitFs(o.text, room.w, o.caption ? room.h - capFs * 1.25 : room.h, o.fs);
  const cap = () => ringLabel(st, o.caption, capFs, Font.semiboldSystemFont(capFs), o.capColor || C.dim);
  st.addSpacer();
  if (o.caption && o.capTop) cap();
  ringLabel(st, o.text, fs, Font.boldRoundedSystemFont(fs), o.textColor || C.text);
  if (o.caption && !o.capTop) cap();
  st.addSpacer();
  return st;
}

// ════════════════════════ LINKS (v1.3) ════════════════════════
// Back-to-back classes in the same room are linked: the same class (same subject and room)
// with a solid box or line, only the same room with a dashed one. Boxes go around rows in the
// medium lists (layout=day / layout=list); lines join the rings in large and the default medium.
// A different room is never linked: the link means "you stay in this room".

// links[i]: between day[i] and day[i + 1] — "class", "room" or null.
function dayLinks(day) {
  return day.slice(0, -1).map((a, i) => {
    const b = day[i + 1];
    if (b.num !== a.num + 1 || !a.room || a.room !== b.room) return null;
    return a.name === b.name ? "class" : "room";
  });
}
// The linked run around day[i]: { a, b } (a === b when it isn't linked).
function runOf(links, i) {
  let a = i, b = i;
  while (a > 0 && links[a - 1]) a--;
  while (b < links.length && links[b]) b++;
  return { a, b };
}
const inRun = (links, i) => (i > 0 && !!links[i - 1]) || (i < links.length && !!links[i]);
// Rows a..b of a linked run, split into parts: { a, b, solid } — solid around the same class,
// dashed (solid: false) around the rows in between.
function linkParts(links, run, a = run.a, b = run.b) {
  const solid = k => (k > run.a && links[k - 1] === "class") || (k < run.b && links[k] === "class");
  const parts = [];
  for (let k = a; k <= b;) {
    let e = k;
    if (solid(k)) while (e < b && links[e] === "class") e++;
    else while (e < b && !solid(e + 1)) e++;
    parts.push({ a: k, b: e, solid: solid(k) }); k = e + 1;
  }
  return parts;
}
// Colour of a link over the classes ls (states: "done" / "now" / "next"). Grey, or with
// colours on: green next to the current class, red when every class is important.
function linkColor(ls, states, f, coloured) {
  const done = states.every(x => x === "done");
  if (coloured) {
    if (f.isClass && states.includes("now")) return C.green;
    if (ls.every(l => l.hot)) return done ? C.ringRedFaded : C.ringRed;
  }
  return done ? C.ringFaded : C.grey;
}
// Strokes a polyline, solid or dashed (dash = [on, off]; phase: where in the pattern it starts).
// DrawContext has no dash setting, so dashes are separate little lines.
function strokeLine(ctx, pts, color, lw, dash, phase = 0) {
  const path = dash ? new Path() : polyPath(pts);
  if (dash) {
    const [on, off] = dash, per = on + off, at = (a, b, t) => new Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    let d = phase;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], len = Math.hypot(b.x - a.x, b.y - a.y);
      for (let t = 0; t < len - 1e-6;) {
        const m = d % per, inOn = m < on, step = Math.min(len - t, (inOn ? on : per) - m);
        if (inOn) { path.move(at(a, b, t / len)); path.addLine(at(a, b, (t + step) / len)); }
        t += step; d += step;
      }
    }
  }
  ctx.setStrokeColor(color); ctx.setLineWidth(lw);
  ctx.addPath(path); ctx.strokePath();
}
// A path through the points pts.
function polyPath(pts) {
  const path = new Path();
  pts.forEach((pt, i) => i ? path.addLine(pt) : path.move(pt));
  return path;
}
function fillPts(ctx, pts, color) {
  const path = polyPath(pts);
  path.closeSubpath();
  ctx.setFillColor(color); ctx.addPath(path); ctx.fillPath();
}
function arcPts(cx, cy, r, a0, a1, n = 6) {
  const out = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push(new Point(cx + r * Math.cos(a), cy + r * Math.sin(a))); }
  return out;
}
// The area of a box, rounded at the top and/or bottom (for the tint).
function areaPts(x, y0, w, y1, r, top, bot) {
  const x1 = x + w, P = Math.PI, pts = [];
  if (top) pts.push(...arcPts(x + r, y0 + r, r, P, 1.5 * P), ...arcPts(x1 - r, y0 + r, r, 1.5 * P, 2 * P));
  else pts.push(new Point(x, y0), new Point(x1, y0));
  if (bot) pts.push(...arcPts(x1 - r, y1 - r, r, 0, 0.5 * P), ...arcPts(x + r, y1 - r, r, 0.5 * P, P));
  else pts.push(new Point(x1, y1), new Point(x, y1));
  return pts;
}
// A box's outline: closed ends are rounded, open ends are just the two sides. One polyline per stroke.
function outlinePts(x, y0, w, y1, r, top, bot) {
  const x1 = x + w, P = Math.PI;
  if (top && bot) { const a = areaPts(x, y0, w, y1, r, true, true); return [a.concat([a[0]])]; }
  if (top) return [[new Point(x, y1), ...arcPts(x + r, y0 + r, r, P, 1.5 * P), ...arcPts(x1 - r, y0 + r, r, 1.5 * P, 2 * P), new Point(x1, y1)]];
  if (bot) return [[new Point(x, y0), ...arcPts(x + r, y1 - r, r, P, 0.5 * P), ...arcPts(x1 - r, y1 - r, r, 0.5 * P, 0), new Point(x1, y0)]];
  return [[new Point(x, y0), new Point(x, y1)], [new Point(x1, y0), new Point(x1, y1)]];
}
// A piece of the line between two rings, inside a ring picture (ringImage's ext), drawn from y0
// down to y1. pc: { color, w, dash, phase, split (a gap at the picture's edge, half of the gap
// between the rings), fade (fades out towards the top: the default medium's line from the hero) }
// A ring is two see-through layers (the track, then its colour), so the line is drawn the same
// way, or it comes out a different grey (seen on the phone).
function linkPiece(ctx, x, y0, y1, pc, above) {
  if (pc.split) { if (above) y0 += pc.split / 2; else y1 -= pc.split / 2; }
  if (y1 <= y0) return;
  const fade = (c, k) => new Color(c.hex, c.alpha * k);
  const n = pc.fade ? 6 : 1, step = (y1 - y0) / n;
  for (let i = 0; i < n; i++) {
    const pts = [new Point(x, y0 + i * step), new Point(x, y0 + (i + 1) * step)], k = pc.fade ? (i + 1) / (n + 1) : 1;
    for (const c of [C.faint, pc.color]) strokeLine(ctx, pts, k < 1 ? fade(c, k) : c, pc.w, pc.dash, (pc.phase || 0) + i * step);
  }
}
// The line between two rings where it crosses a gap between rows: a w × h picture.
function linkGap(parent, w, h, pc) {
  const ctx = new DrawContext();
  ctx.size = new Size(w, h); ctx.opaque = false; ctx.respectScreenScale = true;
  linkPiece(ctx, w / 2, 0, h, pc, false);
  const st = parent.addStack();
  st.size = new Size(w, h); st.backgroundImage = ctx.getImage();
  return st;
}

// ───── Boxes in the medium lists ─────
// Inside a run of rows in the same room: a solid box, closed with rounded corners, around every
// same-class part; the other rows get a dashed box whose sides run on straight past the solid
// box's corners. Two solid boxes that meet get a short dashed piece over their corners. With
// box=row the current class's tint fills its part of the box up to the outline; with box=room
// the box goes around the room column only and the row keeps its own tint.
// The picture covers rows day[a..b] of one column; a run that goes on in the other column
// (layout=list) is left open there.
function boxImage(o, a, b, links, day, s, f) {
  const K = T.link, run = runOf(links, a), W = o.textW + 2 * T.sp[o.bleed], H = (b - a + 1) * o.rowH;
  const r = T.sp[K.radius], h = K.line / 2, room = !!o.roomCol;
  const ctx = new DrawContext();
  ctx.size = new Size(W, H); ctx.opaque = false; ctx.respectScreenScale = true;
  const x = room ? W - o.roomCol + h : h, w = (room ? o.roomCol : W) - K.line, y = k => (k - a) * o.rowH;
  const st = l => rowState(s, f, l), parts = linkParts(links, run, a, b);
  parts.forEach((p, j) => {
    const first = j === 0, last = j === parts.length - 1;
    p.openTop = first && a > run.a; p.openBot = last && b < run.b;  // goes on in the other column
    p.top = first ? (p.openTop ? 0 : h) : y(p.a);
    p.bot = last ? (p.openBot ? H : H - h) : y(p.b + 1);
    p.cTop = !p.openTop && (p.solid || first); p.cBot = !p.openBot && (p.solid || last);
  });
  if (!room) parts.forEach(p => {
    for (let q = p.a; q <= p.b; q++) {
      if (st(day[q]) !== "now") continue;
      const top = q === p.a ? p.top : y(q), bot = q === p.b ? p.bot : y(q + 1);
      fillPts(ctx, areaPts(x, top, w, bot, r, q === p.a && p.cTop, q === p.b && p.cBot), f.isClass ? C.tintClassPic : C.tintBreakPic);
    }
  });
  const coloured = S.linkColors && S.linkOutlines, dash = [K.dash, K.dashGap];
  const color = (i, j) => { const ls = day.slice(i, j + 1); return linkColor(ls, ls.map(st), f, coloured); };
  parts.forEach((p, j) => {
    const y0 = p.cTop || p.openTop ? p.top : p.top - r, y1 = p.cBot || p.openBot ? p.bot : p.bot + r;
    outlinePts(x, y0, w, y1, r, p.cTop, p.cBot).forEach(pl => strokeLine(ctx, pl, color(p.a, p.b), K.line, p.solid ? null : dash));
    const q = parts[j + 1];
    if (p.solid && q && q.solid) {
      const yy = y(p.b + 1);
      for (const xx of [x, x + w]) strokeLine(ctx, [new Point(xx, yy - r), new Point(xx, yy + r)], color(p.b, p.b + 1), K.line, [2, 2], 1);
    }
  });
  return ctx.getImage();
}
// Gaps between a box and its neighbours, over the rows idx (one column).
function boxGaps(idx, links) {
  let n = 0;
  for (let k = 1; k < idx.length; k++) if (!links[idx[k - 1]] && (inRun(links, idx[k - 1]) || inRun(links, idx[k]))) n++;
  return n * T.sp[T.link.boxGap];
}
// The rows day[idx] of a medium list (one column). Each linked run goes into a stack of the
// exact size with its box picture as the background.
function linkedRows(parent, idx, day, links, s, f, o) {
  for (let k = 0; k < idx.length;) {
    const i = idx[k];
    if (k && !links[idx[k - 1]] && (inRun(links, idx[k - 1]) || inRun(links, i))) parent.addSpacer(T.sp[T.link.boxGap]);
    if (!inRun(links, i)) { miniRow(parent, day[i], rowState(s, f, day[i]), f, o); k++; continue; }
    let e = k;
    while (e + 1 < idx.length && links[idx[e]]) e++;
    const a = i, b = idx[e], g = parent.addStack();
    g.layoutVertically();
    g.size = new Size(o.textW + 2 * T.sp[o.bleed], (b - a + 1) * o.rowH);
    g.backgroundImage = boxImage(o, a, b, links, day, s, f);
    const ob = Object.assign({ boxed: true }, o);
    for (let q = a; q <= b; q++) miniRow(g, day[q], rowState(s, f, day[q]), f, ob);
    k = e + 1;
  }
}
// box=room: the room column (and the box) is as wide as T.link.roomW, or the day's widest room
// plus a little; 0 with box=row.
function roomColW(day, fs) {
  if (S.linkBox !== "room") return 0;
  return Math.max(T.link.roomW, Math.max(0, ...day.map(l => Math.ceil(emWidth(l.room) * fs))) + 2 * T.sp.xs);
}

// ════════════════════════ WIDGET HELPERS ════════════════════════
// Rough width of a text, in "em" (1 em = the font size). Generous on purpose: the
// script picks font sizes from these, because iOS sometimes cuts text off instead
// of shrinking it. rounded = the rounded bold font used for numbers in rings.
function emWidth(s, rounded = false) {
  return [...String(s)].reduce((a, ch) => a + (
    /[0-9]/.test(ch) ? 0.66 :
    rounded ? (/[:.·]/.test(ch) ? 0.32 : /[а-яА-Я]/.test(ch) ? 0.7 : /[A-Z]/.test(ch) ? 0.74 : 0.64)
            : (/[ .,:·]/.test(ch) ? 0.3 : /[А-ЯA-Z]/.test(ch) ? 0.74 : 0.62)), 0);
}
// The largest size up to `size` at which text s fits in width w (bold text is ~6 % wider).
const fitSize = (s, size, w, bold) => Math.max(9, Math.min(size, Math.floor(w / (emWidth(s) * (bold ? 1.06 : 1)))));
function txt(stack, s, size, opts = {}) {
  if (opts.fitW) size = fitSize(s, size, opts.fitW, opts.weight === "bold");
  const t = stack.addText(String(s));
  t.font = opts.font || (opts.weight === "bold" ? Font.boldSystemFont(size)
          : opts.weight === "regular" ? Font.systemFont(size) : Font.semiboldSystemFont(size));
  t.textColor = opts.color || C.text;
  t.lineLimit = opts.lines || 1;
  t.minimumScaleFactor = opts.scale || 0.7;
  if (opts.center) t.centerAlignText();
  if (opts.right) t.rightAlignText();
  return t;
}
// Text roles, so weight and colour rules live in one place:
// names bold, notes and labels semibold dim, times regular dim (big numbers: bigValue).
const nameText = (st, s, size, o = {}) => txt(st, s, size, Object.assign({ weight: "bold" }, o));
const noteText = (st, s, size, o = {}) => txt(st, s, size, Object.assign({ color: C.dim }, o));
const timeText = (st, s, size, o = {}) => txt(st, s, size, Object.assign({ color: C.dim, weight: "regular" }, o));
function hRow(stack) { const r = stack.addStack(); r.layoutHorizontally(); r.centerAlignContent(); return r; }
// A fixed-width column. iOS centres the content of a fixed-width *horizontal* stack, so
// columns are vertical stacks, which keep their content on the left.
function col(parent, width) {
  const c = parent.addStack(); c.layoutVertically(); c.size = new Size(width, 0);
  return c;
}
// Rounds a height down / up to whole screen pixels: ring pictures that aren't get resampled,
// their edges go soft, and where two met the line between rings showed a seam (seen on the phone).
const screenPx = () => (Device.screenScale && Device.screenScale()) || 3;
const pxFloor = h => Math.floor(h * screenPx()) / screenPx();
const pxCeil = h => Math.ceil(h * screenPx()) / screenPx();
function leftLine(stack, fn) { const r = hRow(stack); fn(r); r.addSpacer(); return r; }
function rightLine(stack, fn) { const r = hRow(stack); r.addSpacer(); fn(r); return r; }
function centered(stack, fn) { const r = hRow(stack); r.addSpacer(); fn(r); r.addSpacer(); return r; }
const ICON_DEFAULT = "book.closed.fill";
function icon(stack, name, size, color) {
  const sym = SFSymbol.named(name) || SFSymbol.named(ICON_DEFAULT);
  // Bold, so icons have the same stroke weight as the bold text around them
  // (the font's weight is what sets the symbol's weight).
  sym.applyFont(Font.boldSystemFont(size));
  const im = stack.addImage(sym.image);
  im.imageSize = new Size(size, size);
  if (im.applyFittingContentMode) im.applyFittingContentMode();
  im.tintColor = color;
  return im;
}
const nameColor = l => l.hot ? C.red : C.text;
// A day list's name colour: finished classes are dimmed (red ones to a faded red).
const rowNameColor = (l, done) => done ? (l.hot ? C.fadedRed : C.faded) : nameColor(l);
// The tint behind the row of the class in focus: green in a class, neutral in a break.
function focusTint(r, f, radius) { r.backgroundColor = f.isClass ? C.tintClass : C.tintBreak; r.cornerRadius = T.sp[radius]; }
// The invisible stand-in for a missing room (ФВС), as wide as a usual room number.
const NO_ROOM = "000";
const ringColor = l => l.hot ? C.ringRed : C.normal;
// Big number with small words on the same baseline, like "73%" in Batteries:
// "15 мин", "след 8 мин", "Утре 08:00". iOS can only line up the bottoms of
// text boxes, so the small words get a little bottom padding to sit on the
// big number's baseline (the baseline is ~0.23 × font size above the bottom).
// preOpts.maxW: the space available; the whole line shrinks evenly to fit it.
function bigValue(row, value, unit, fs, ufs, pre, preOpts = {}) {
  if (preOpts.maxW) {
    const pfs0 = preOpts.size || ufs;
    const total = emWidth(value) * fs + (unit ? 3 + emWidth(unit) * ufs : 0) + (pre ? 5 + emWidth(pre) * pfs0 : 0);
    if (total > preOpts.maxW) {
      const k = preOpts.maxW / total;
      fs = Math.floor(fs * k); ufs = Math.floor(ufs * k);
      preOpts = Object.assign({}, preOpts, { size: Math.floor(pfs0 * k) });
    }
  }
  row.bottomAlignContent();
  const small = (t, size, o) => txt(baseline(row, fs, size), t, size, Object.assign({ scale: 0.8 }, o));
  if (pre) { small(pre, preOpts.size || ufs, preOpts); row.addSpacer(5); }
  txt(row, value, fs, { font: Font.semiboldSystemFont(fs), scale: 0.6 });
  if (unit) { row.addSpacer(3); small(unit, ufs, { color: C.dim }); }
}
// A stack for small text of size fs next to a big number of size bigFs, padded to sit on its baseline.
function baseline(row, bigFs, fs) {
  const st = row.addStack();
  st.setPadding(0, 0, Math.round(0.23 * (bigFs - fs)), 0);
  return st;
}
// Upcoming classes: important = full red ring, normal = full grey ring.
const upcomingRing = l => l.hot ? { p: 1, color: C.ringRed } : { p: 1, color: C.grey };

function vacation(w, family) {
  const big = family === "large";
  w.setPadding(...T.vac.pad[family]);
  w.addSpacer();
  centered(w, r => icon(r, "sun.max.fill", big ? T.vac.iconL : T.vac.iconS, C.sun));
  w.addSpacer(T.vac.gapIcon);
  centered(w, r => txt(r, L.vacation, big ? T.vac.titleL : T.vac.titleS, { weight: "bold", center: true }));
  w.addSpacer(T.vac.gapText);
  centered(w, r => txt(r, L.enjoy, T.vac.note, { color: C.dim, weight: "regular", center: true }));
  w.addSpacer();
}

// ════════════════════════ HOME SCREEN ════════════════════════
// The class the widget is about right now (or tomorrow's first class).
function focus(s) {
  const live = s.mode === "class" || s.mode === "break";
  const isClass = s.mode === "class";
  const l = isClass ? s.current : live ? s.next : s.nextLessons[0];
  const f = { live, isClass, l };
  if (live) {
    // "до 10:35" / "започва в 10:55" / "първи час"; on a test "контролно · до 10:35" / "контролно · 10:55"
    f.sub = l.test ? `${L.test} · ${isClass ? L.until(hm(l.end)) : hm(l.start)}`
      : isClass ? L.until(hm(l.end)) : s.minsTo <= 60 ? L.startsAt(hm(l.start)) : L.firstClass;
    f.ring = { p: s.progress, color: isClass ? C.green : ringColor(l) };
  } else {
    f.day = dayLabel(s.nextDay, s.today, true);
    f.status = s.mode === "done" ? L.doneShort : (offReason(s) || L.dayOff);
    f.ring = upcomingRing(l);
  }
  f.time = hm(l.start);
  f.endTime = live ? s.lessons[s.lessons.length - 1].end : null;
  return f;
}
// The big line: "15 мин" in a class, "след 8 мин" in a break, "08:00" before school.
// noPre: leave out "след" (the narrow hero cell puts it on its own line above).
function bigParts(s, f, fs) {
  if (!f.live) return { value: f.time, fs };
  if (f.isClass) return { value: String(s.minsLeft), unit: L.min, fs };
  if (s.minsTo <= 60) return { value: String(s.minsTo), unit: L.min, pre: L.inWord, fs };
  return { value: f.time, fs: fs - T.timeShrink };
}
function bigLine(row, s, f, fs, ufs, maxW, noPre) {
  const b = bigParts(s, f, fs);
  bigValue(row, b.value, b.unit, b.fs, ufs, noPre ? null : b.pre, { color: C.dim, maxW });
}
// ───── Hero cell: the class in focus (the whole small widget, the left half of medium) ─────
//   top row:    ring with the period number | "стая" over the room number (right)
//   bottom row: big value ("15 мин", "след 8 мин", "08:00"), the name, and a note when needed
// The note (a test, or the day when the class isn't today) makes the cell compact.
function heroNote(f) {
  if (!f.live) return { text: f.day, color: C.dim };
  if (f.l.test) return { text: L.test, color: C.red };
  return null;
}
// The room block has a fixed width, so it never competes with the ring for space;
// its lines are pushed right by a flexible spacer, which takes at least T.flexMin.
function roomBlock(parent, l, width, fs) {
  const rb = col(parent, width);
  if (l.room) roomLines(rb, l.room, fitSize(l.room, T.fs[fs], width - T.flexMin, true)); // ФВС: an empty space, without "стая"
}
// "стая" over the room number, both on the right. Big bold digits carry a little extra space on
// their right side, so the small label is moved in by the same amount to line up with the number.
function roomLines(rb, room, rfs) {
  rightLine(rb, r => {
    noteText(r, L.roomWord, T.fs[T.hero.label]);
    r.setPadding(0, 0, 0, Math.max(1, Math.round(rfs * 0.05)));
  });
  rightLine(rb, r => nameText(r, room, rfs, { scale: 0.5 }));
}
// density: T.hero.regular / T.hero.compact; chosen by the note when not given.
function heroCell(parent, s, f, W, density) {
  const note = heroNote(f), d = density || (note ? T.hero.compact : T.hero.regular);
  const ring = T.ring[d.ring], tw = W - T.flexMin; // text width: each line ends with a flexible spacer
  const top = hRow(parent);
  ringNum(top, Object.assign({}, ring, f.ring), f.l);
  top.addSpacer(T.sp.md);
  roomBlock(top, f.l, W - ring.d - T.sp.md, d.room);
  parent.addSpacer();
  // A narrow cell (layout=day): when "след 40 мин" would have to shrink until its words are
  // smaller than a note, "след" goes on its own line above, if there is no note to make room for.
  const lineW = tw - T.slack;
  const preAbove = !!density && !note && f.live && !f.isClass && s.minsTo <= 60
    && Math.floor(T.fs[d.unit] * lineW / bigLineW(s, f, T.fs[d.value], T.fs[d.unit])) < T.fs[d.note];
  if (preAbove) leftLine(parent, r => noteText(r, L.inWord, T.fs[d.note]));
  leftLine(parent, r => bigLine(r, s, f, T.fs[d.value], T.fs[d.unit], lineW, preAbove));
  leftLine(parent, r => nameText(r, f.l.short, T.fs[d.name], { color: nameColor(f.l), scale: 0.6, fitW: tw }));
  if (note) leftLine(parent, r => noteText(r, note.text, T.fs[d.note], { color: note.color, fitW: tw }));
}

// Small: the hero cell, nothing else.
function homeSmall(w, s) {
  w.setPadding(T.pad, T.pad, T.pad, T.pad);
  heroCell(w, s, focus(s), T.size.small.inner.w);
}

// ───── Class rows (medium): ring with the period number | name over "10:55 · 112" ─────
// The classes after the one in focus, same day only; while school is on and fewer than
// `n` are left, an end row ("Край" and the time school ends) closes the list.
function nextRows(s, f, n) {
  if (!f.live) return s.nextLessons.slice(1, 1 + n).map(l => ({ l }));
  const out = s.upcoming.slice(0, n).map(l => ({ l }));
  if (out.length < n) out.push({ end: true, time: f.endTime });
  return out;
}
// ext: lines to the rows above and below ({ h, oy, above, below }, see ringImage), or none.
// With the line from the hero (ext.stub) the ring's picture is taller at the top, so the row
// lines up at the bottom.
function classRow(parent, it, W, ext) {
  const M = T.medium, ring = T.ring.list, gap = T.sp[M.ringGap], tw = W - ring.d - gap;
  const r = hRow(parent);
  if (ext && ext.stub) r.bottomAlignContent();
  if (it.end) ringPlain(r, Object.assign({ p: 0 }, ring));
  else ringNum(r, Object.assign({}, ring, upcomingRing(it.l), ext && { ext }), it.l);
  r.addSpacer(gap);
  // a fixed-width column: vertical stacks keep their lines on the left, no spacer needed
  const tc = col(r, tw);
  nameText(tc, it.end ? L.end : it.l.short, T.fs[M.name], { color: it.end ? C.dim : nameColor(it.l), scale: 0.8, fitW: tw });
  timeText(tc, it.end ? hm(it.time) : [hm(it.l.start), it.l.room].filter(Boolean).join(" · "), T.fs[M.sub], { scale: 0.8, fitW: tw });
}
// hero cell (heroW) | gap | line | gapR | a column for the list (listW), which is returned.
function heroSplit(w, s, f, heroW, gap, gapR, listW, density) {
  const row = hRow(w); // centres the list against the full-height hero column
  heroCell(col(row, heroW), s, f, heroW, density);
  row.addSpacer(gap);
  vDivider(row);
  row.addSpacer(gapR);
  return col(row, listW);
}
// A thin vertical line that runs the height of its row.
function vDivider(row) {
  const d = row.addStack(); d.layoutVertically();
  d.size = new Size(T.hair, 0); d.backgroundColor = C.divider;
  d.addSpacer();
}

// Medium: two equal columns, the hero cell and the next classes, with a line between them.
//   hero (inner − 33) / 2 | gap 16 | line 1 | gap 16 | rows (inner − 33) / 2  (gap = the outer margin)
function homeMedium(w, s) {
  w.setPadding(T.pad, T.pad, T.pad, T.pad);
  const f = focus(s), dg = T.sp[T.medium.divGap], colW = Math.floor((T.size.medium.inner.w - 2 * dg - T.hair) / 2);
  const list = heroSplit(w, s, f, colW, dg, dg, colW);
  // lines between the rings of back-to-back classes; the first ring also gets a short line,
  // fading out, when it is linked to the hero's class (across the divider)
  const rows = nextRows(s, f, T.medium.rows), day = f.live ? s.lessons : s.nextLessons, links = dayLinks(day);
  const ring = T.ring.list, rowGap = T.sp[T.medium.rowGap], K = T.link;
  // the ring's picture is a whole number of screen pixels high, so it meets the gap's picture exactly
  const rowH = pxCeil((T.fs[T.medium.name] + T.fs[T.medium.sub]) * T.lineH), margin = (rowH - ring.d) / 2;
  const at = it => it.l ? day.indexOf(it.l) : -1;
  const link = (a, b) => a >= 0 && b === a + 1 ? links[a] : null;
  const state = l => f.isClass && l === f.l ? "now" : "next";
  const piece = (a, kind, o) => Object.assign({ w: ring.w, dash: kind === "room" ? K.ringDash : null,
    color: linkColor([day[a], day[a + 1]], [state(day[a]), state(day[a + 1])], f, S.linkColors) }, o);
  const belowLen = margin; // from the ring's edge to the row's bottom
  rows.forEach((it, i) => {
    const ix = at(it), up = i ? link(at(rows[i - 1]), ix) : null, down = i < rows.length - 1 ? link(ix, at(rows[i + 1])) : null;
    const stub = i === 0 ? link(day.indexOf(f.l), ix) : null;
    if (i) {
      if (up) linkGap(list, ring.d, rowGap, piece(ix - 1, up, { phase: belowLen }));
      else list.addSpacer(rowGap);
    }
    let ext = null;
    if (up || down || stub) {
      const top = stub ? K.stub : 0;
      ext = { h: rowH + top, oy: top + margin, stub: !!stub,
        above: up ? piece(ix - 1, up, { phase: belowLen + rowGap }) : stub ? piece(ix - 1, stub, { fade: true }) : null,
        below: down ? piece(ix, down, { phase: 0 }) : null };
    }
    classRow(list, it, colW, ext);
  });
}

// ───── Large: hero band, the whole day as a list, and a bottom section ─────
// The large widget's real height, from the screen size (points, portrait). Apple's table,
// except 375 × 812, which was measured on the user's iPhone (Apple lists 345).
// Unknown screens use Apple's smallest documented size (T.size.large).
const LARGE_H = { "320x568": 311, "375x667": 324, "375x812": 352, "390x844": 354, "393x852": 354,
  "414x736": 357, "414x896": 379, "428x926": 382, "430x932": 382 };
function largeInnerH() {
  let h = 0;
  try { const z = Device.screenSize(); h = LARGE_H[`${Math.min(z.width, z.height)}x${Math.max(z.width, z.height)}`] || 0; } catch (e) { }
  return (h || T.size.large.h) - 2 * T.pad;
}
// Column widths, shared by every band so the columns line up all the way down.
function largeCols() {
  const G = T.large, gap = T.sp[G.gap];
  return { when: G.when, gap, what: T.size.large.inner.w - G.when - gap - G.where, where: G.where };
}
// Scriptable has no negative margins, so the widget has 8 pt side margins and every band
// gets 8 pt more; the highlighted row's background then reaches 8 pt past the columns.
function band(parent, side = T.sp.md) {
  const b = parent.addStack(); b.layoutVertically();
  b.setPadding(0, side, 0, side);
  return b;
}
function hLine(parent, side) {
  const d = band(parent, side).addStack();
  d.layoutHorizontally(); d.backgroundColor = C.divider; d.size = new Size(0, T.hair);
  d.addSpacer();
}
// The hero band's note: "до 10:35", "контролно · до 10:35" (or just "контролно" when the
// whole note doesn't fit), "започва в 10:55" / "първи час" in a break, the day otherwise.
function largeNote(s, f, width, fs = T.fs[T.large.note]) {
  const fits = t => fitSize(t, fs, width) >= fs;
  if (!f.live) { const long = dayLabel(s.nextDay, s.today, false); return { text: fits(long) ? long : f.day, color: C.dim }; }
  // "започва в 10:55" → "в 10:55" where the column is narrow (layout=list's header)
  if (!f.l.test) return { text: f.isClass || s.minsTo > 60 || fits(f.sub) ? f.sub : L.atTime(f.time), color: C.dim };
  return { text: fits(f.sub) ? f.sub : L.test, color: C.red };
}
// Height of the hero band: the taller of the ring and the three lines of text.
function largeHeroH() {
  const G = T.large;
  return Math.max(T.ring.hero.d, (T.fs[G.name] + T.fs[G.value] + T.fs[G.note]) * T.lineH);
}
function largeHero(parent, s, f, k) {
  const G = T.large, l = f.l, ring = T.ring.hero;
  const row = hRow(band(parent));
  // the ring sits at the start of the when column; the text starts where the list's names do
  ringNum(row, Object.assign({}, ring, f.ring), l);
  row.addSpacer(k.when - ring.d + k.gap);
  const mid = col(row, k.what);
  nameText(mid, l.short, T.fs[G.name], { color: nameColor(l), scale: 0.6, fitW: k.what });
  bigLine(hRow(mid), s, f, T.fs[G.value], T.fs[G.unit], k.what - T.slack);
  const note = largeNote(s, f, k.what);
  noteText(mid, note.text, T.fs[G.note], { color: note.color, fitW: k.what });
  // where: the only flexible part of the band, so it takes all the width that is left
  // no room (ФВС): an empty space, without "стая"; the spacer keeps the band on the left
  if (!l.room) return row.addSpacer();
  const rb = row.addStack(); rb.layoutVertically();
  roomLines(rb, l.room, fitSize(l.room, T.fs[G.room], k.where - T.flexMin, true));
}
// One class of the day: ring + start time | name | room. state: "done" | "now" | "next".
// ext: lines to the rows above and below (see ringImage); the ring's picture is the row's full
// height, so the row has no padding above and below.
function dayRow(parent, l, state, f, k, rowH, ext) {
  const G = T.large, ring = T.ring.row, done = state === "done", now = state === "now";
  const r = hRow(parent);
  r.setPadding(0, T.sp.md, 0, T.sp.md);
  if (now) focusTint(r, f, G.radius);
  const textC = rowNameColor(l, done);
  const dimC = done ? C.faded : C.dim;
  // when: ring | gap | time column — the three widths add up to the column exactly
  const ro = now ? f.ring : done ? { p: 1, color: l.hot ? C.ringRedFaded : C.ringFaded } : upcomingRing(l);
  ringNum(r, Object.assign({ textColor: done ? C.faded : C.text }, ring, ro, { ext: Object.assign({ h: rowH }, ext) }), l);
  const rg = T.sp[G.ringGap], timeW = k.when - ring.d - rg;
  r.addSpacer(rg);
  timeText(col(r, timeW), hm(l.start), T.fs[G.rowTime], { color: dimC, fitW: timeW });
  r.addSpacer(k.gap);
  // what: the full name, or the short one when the full one would get too small
  const bold = now, nfs = T.fs[G.rowName];
  const name = fitSize(l.name, nfs, k.what, bold) >= T.fs[G.rowNameMin] ? l.name : l.short;
  txt(col(r, k.what), name, nfs, { weight: bold ? "bold" : "semibold", color: textC, scale: 0.8, fitW: k.what });
  // where: right-aligned room, the row's only flexible part
  r.addSpacer();
  // no room (ФВС): an invisible placeholder, so the row is laid out like the others; with no text
  // here (or an empty one) iOS shrank the row's start time (seen on the phone)
  const room = l.room || NO_ROOM;
  txt(r, room, fitSize(room, T.fs[G.rowRoom], k.where - T.flexMin), { color: !l.room ? C.clear : done ? C.faded : C.text, scale: 0.8 });
}
// The bottom section: the holiday on a named day off, otherwise the countdown to the next break.
function largeFooter(s) {
  if (s.mode === "off" && S.showReason && s.status.reason) return { icon: holidayIcon(s.status.reason), text: s.status.reason };
  if (!S.countdown) return null;
  const c = countdown(s);
  return c ? { icon: holidayIcon(c.reason) || "calendar", text: c.reason, n: c.n } : null;
}
// One line, laid out on its own: icon | gap | the break's name | "11 уч. дни" on the right.
function footerLine(parent, ft, k) {
  const G = T.large, fs = T.fs[G.footer], cfs = T.fs[G.footerCount], gap = T.sp.md;
  const r = hRow(band(parent));
  icon(r, ft.icon || "calendar", fs, C.dim);
  r.addSpacer(gap);
  const full = T.size.large.inner.w - fs - gap;
  let countW = 0;
  if (ft.n != null) countW = Math.ceil(emWidth(String(ft.n)) * fs + T.sp.xs + emWidth(L.daysShort(ft.n)) * cfs) + T.slack;
  const tw = full - (countW ? countW + T.flexMin : 0);
  txt(r, ft.text, fitSize(ft.text, fs, tw), { color: C.text, scale: 0.8 });
  r.addSpacer();
  if (!countW) return;
  const c = r.addStack(); c.layoutHorizontally(); c.bottomAlignContent();
  nameText(c, String(ft.n), fs, { scale: 0.8 });
  c.addSpacer(T.sp.xs);
  noteText(baseline(c, fs, cfs), L.daysShort(ft.n), cfs, { scale: 0.8 });
}

// Large: the hero band (ring | name, big value, note | room), a line, every class of the
// hero's day (finished ones dimmed, the current one highlighted), and the bottom section.
function homeLarge(w, s) {
  const G = T.large;
  w.setPadding(T.pad, T.pad - T.sp.md, T.pad, T.pad - T.sp.md);
  const f = focus(s), k = largeCols(), ft = largeFooter(s);
  const day = f.live ? s.lessons : s.nextLessons, n = day.length;

  // Every divider line has the same visible gap (T.large.lineGap) above and below it. Next
  // to the list, part of that gap is the row's own padding (padV, above and below the ring),
  // so the spacer there is lineGap − padV. The rows take all the height that is left:
  //   height = hero + gap + line + (gap − padV) + n × (ring + 2 padV) [+ (gap − padV) + line + gap + footer]
  const gap = T.sp[G.lineGap], ring = T.ring.row.d, lines = ft ? 2 : 1;
  const fixed = largeHeroH() + gap + T.hair + lines * gap + (ft ? T.hair + gap + T.fs[G.footer] * T.lineH : 0);
  const free = largeInnerH() - G.slackV - fixed - n * ring;
  const padMin = (G.rowMin - ring) / 2;
  // rows are a whole number of screen pixels high, so the ring pictures meet exactly
  const rowH = pxFloor(ring + 2 * Math.max(padMin, Math.min(gap, free / (2 * n - lines))));
  const padV = (rowH - ring) / 2, near = Math.max(0, gap - padV);

  largeHero(w, s, f, k);
  w.addSpacer(gap);
  hLine(w);
  if (near) w.addSpacer(near);
  // the whole day of the class in focus; while school is on, finished classes are dimmed
  // back-to-back classes in the same room: a line between their rings, solid for the same
  // class; for only the same room dashed, or, when the rings are close (7 classes), split in
  // the middle, since dashes that short don't read (the user asked)
  const states = day.map(l => !f.live ? "next" : l === f.l ? "now" : l.end <= s.now ? "done" : "next");
  // Every ring's picture is the row's full height (with or without lines), so all rows are built
  // the same way and the pictures meet exactly at the row edges.
  const links = dayLinks(day), wr = T.ring.row.w, dashed = 2 * padV >= T.link.dashMin;
  const piece = (i, above) => ({ w: wr, color: linkColor([day[i], day[i + 1]], [states[i], states[i + 1]], f, S.linkColors),
    split: links[i] === "room" && !dashed ? T.link.split : 0, dash: links[i] === "room" && dashed ? T.link.ringDash : null,
    phase: above ? padV : 0 });
  day.forEach((l, i) => {
    const above = i > 0 && links[i - 1] ? piece(i - 1, true) : null, below = links[i] ? piece(i, false) : null;
    dayRow(w, l, states[i], f, k, rowH, { above, below });
  });
  if (!ft) return;
  if (near) w.addSpacer(near);
  hLine(w);
  w.addSpacer(gap);
  footerLine(w, ft, k);
}

// ───── Medium, two more layouts (Parameter: layout=day / layout=list) ─────
// Both show the whole day of the class in focus in rows about 17 pt high: too low for a ring
// with a readable number, so the state is shown by dimming (finished), a tint and bold name
// (the class in focus) and red (important), as in the large widget's list.
function rowState(s, f, l) { return l === f.l ? "now" : (f.live && l.end <= s.now) ? "done" : "next"; }
// One class: start time or period number | name | room.
// o: { textW, rowH, lead: "time" | "num", + sizes from T.day / T.list }
// The row has a fixed size; the flexible spacer before the room fills it, so iOS keeps the
// content on the left (layout rule 2). The side padding is the part the tint covers past the text.
function miniRow(parent, l, state, f, o) {
  const fs = T.fs[o.row], bleed = T.sp[o.bleed], gap = T.sp[o.leadGap], done = state === "done", now = state === "now";
  const r = hRow(parent);
  r.size = new Size(o.textW + 2 * bleed, o.rowH);
  // box=room: the room sits centred in a fixed column at the row's right edge
  r.setPadding(0, bleed, 0, o.roomCol ? 0 : bleed);
  // in a box (box=row) the tint is part of the box picture, so it reaches the outline
  if (now && !(o.boxed && !o.roomCol)) focusTint(r, f, o.radius);
  const leadC = done ? C.faded : now ? (f.isClass ? C.green : C.text) : C.dim;
  let leadW;
  if (o.lead === "time") {
    leadW = Math.ceil(emWidth("00:00") * fs);
    txt(col(r, leadW), hm(l.start), fs, { color: leadC, weight: now ? "semibold" : "regular", scale: 0.8 });
  } else {
    const nfs = T.fs[o.num];
    leadW = Math.ceil(emWidth("0", true) * nfs) + T.slack;
    txt(col(r, leadW), String(l.num), nfs, { color: leadC, font: Font.boldRoundedSystemFont(nfs), scale: 0.8 });
  }
  r.addSpacer(gap);
  const roomW = o.roomCol ? o.roomCol - bleed : Math.ceil(emWidth(l.room || NO_ROOM) * fs);
  // bold for the class in focus, unless bold would have to shrink (decoration gives way to size);
  // a name that doesn't fit at all uses its shortest form (tiny), e.g. next to the room column
  const nameW = o.textW - leadW - gap - T.flexMin - roomW;
  const name = fitSize(l.short, fs, nameW) < fs && l.tiny ? l.tiny : l.short, bold = now && fitSize(name, fs, nameW, true) >= fs;
  txt(r, name, fs, { weight: bold ? "bold" : "semibold", color: rowNameColor(l, done),
    scale: 0.8, fitW: nameW });
  r.addSpacer();
  const roomC = done ? C.faded : C.text;
  // no room (ФВС): an invisible placeholder, as in the large widget's rows
  if (!o.roomCol) return txt(r, l.room || NO_ROOM, fs, { color: l.room ? roomC : C.clear, scale: 0.8 });
  // a fixed-width horizontal stack centres its content (layout rule 2)
  const rc = hRow(r); rc.size = new Size(o.roomCol, 0);
  if (l.room) txt(rc, l.room, fs, { color: roomC, scale: 0.8, fitW: o.roomCol - 2 * T.sp.xxs });
}
// Row height: the rows share the height h, in half points, up to rowMax.
const miniRowH = (h, rows, max) => Math.min(max, Math.floor(2 * h / rows) / 2);

// layout=day: hero cell | gap | line | gap | the whole day (time | name | room).
// The tint needs side room, so the widget's right margin and the gap after the line are
// smaller by `bleed`, and every row has `bleed` of padding on both sides.
function homeMediumDay(w, s) {
  const D = T.day, bleed = T.sp[D.bleed], dg = T.sp[D.divGap], M = T.size.medium.inner;
  w.setPadding(T.pad, T.pad, T.pad, T.pad - bleed);
  const f = focus(s), day = f.live ? s.lessons : s.nextLessons;
  const textW = M.w - D.hero - 2 * dg - T.hair;
  const links = dayLinks(day), idx = day.map((_, i) => i);
  const o = Object.assign({ textW, lead: "time", roomCol: roomColW(day, T.fs[D.row]),
    rowH: miniRowH(M.h - D.slackV - boxGaps(idx, links), day.length, D.rowMax) }, D);
  linkedRows(heroSplit(w, s, f, D.hero, dg, dg - bleed, textW + 2 * bleed, T.hero.compact), idx, day, links, s, f, o);
}

// Estimated width of bigLine at full size (the sum bigValue makes; kept in this order, so the
// rounded results stay exactly as they were).
function bigLineW(s, f, fs, ufs) {
  const b = bigParts(s, f, fs);
  let w = (b.pre ? emWidth(b.pre) * ufs + 5 : 0) + emWidth(b.value) * b.fs;
  if (b.unit) w = w + 3 + emWidth(b.unit) * ufs;
  return w;
}
// layout=list: header band | line | the whole day in two columns (period number | name | room).
//   header: ring | name over a note | (flexible) | big value | "стая" over the room
// The widget's side margins are smaller by `bleed`; the header and the line get it back as
// padding, the rows carry it themselves (it is where the tint shows).
function homeMediumList(w, s) {
  const G = T.list, bleed = T.sp[G.bleed], gap = T.sp[G.lineGap], ring = T.ring[G.ring], M = T.size.medium.inner;
  w.setPadding(T.pad, T.pad - bleed, T.pad, T.pad - bleed);
  const f = focus(s), l = f.l, day = f.live ? s.lessons : s.nextLessons;

  // header: every part has a fixed or natural width; the spacer is the only flexible one
  const hb = hRow(band(w, bleed));
  ringNum(hb, Object.assign({}, ring, f.ring), l);
  hb.addSpacer(T.sp[G.ringGap]);
  const vfs = T.fs[G.value], ufs = T.fs[G.unit];
  const valW = Math.min(G.valueMax, Math.ceil(bigLineW(s, f, vfs, ufs)) + T.slack); // widths are estimates
  const rfs = fitSize(l.room, T.fs[G.room], G.roomMax - T.flexMin, true);
  // no room (ФВС): no room block, so the big value sits on the right edge
  const roomW = !l.room ? 0 : Math.max(Math.ceil(emWidth(L.roomWord) * T.fs[T.hero.label]), Math.ceil(emWidth(l.room) * rfs * 1.06)) + T.flexMin;
  const valueGap = l.room ? T.sp[G.valueGap] : 0;
  const nameW = M.w - ring.d - T.sp[G.ringGap] - T.flexMin - valW - valueGap - roomW;
  const nc = col(hb, nameW);
  nameText(nc, l.short, T.fs[G.name], { color: nameColor(l), scale: 0.6, fitW: nameW });
  nc.addSpacer(T.sp[G.noteGap]);
  const note = largeNote(s, f, nameW, T.fs[G.note]);
  noteText(nc, note.text, T.fs[G.note], { color: note.color, fitW: nameW });
  hb.addSpacer();
  bigLine(hRow(hb), s, f, vfs, ufs, valW - T.slack);
  if (l.room) {
    hb.addSpacer(valueGap);
    roomBlock(hb, l, roomW, G.room);
  }

  // the same visible gap above and below the line
  w.addSpacer(gap);
  hLine(w, bleed);
  w.addSpacer(gap);

  // the day, in reading order: down the left column, then the right one
  const per = Math.ceil(day.length / 2), full = M.w + 2 * bleed;
  const colW = Math.floor((full - T.sp[G.colGap]) / 2);
  const headH = Math.max(ring.d, Math.ceil((T.fs[G.name] + T.fs[G.note]) * T.lineH) + T.sp[G.noteGap]);
  // a box that goes on in the other column is left open there
  const links = dayLinks(day), parts = [day.map((_, i) => i).slice(0, per), day.map((_, i) => i).slice(per)];
  const gaps = Math.max(...parts.map(ix => boxGaps(ix, links)));
  const o = Object.assign({ textW: colW - 2 * bleed, lead: "num", roomCol: roomColW(day, T.fs[G.row]),
    rowH: miniRowH(M.h - G.slackV - headH - 2 * gap - T.hair - gaps, per, G.rowMax) }, G);
  const cols = w.addStack(); cols.layoutHorizontally(); cols.topAlignContent();
  parts.forEach((ix, i) => {
    if (i) cols.addSpacer(full - 2 * colW);
    const c = cols.addStack(); c.layoutVertically(); c.size = new Size(colW, 0);
    linkedRows(c, ix, day, links, s, f, o);
  });
}

// ════════════════════════ LOCK SCREEN ════════════════════════
// The Lock Screen is monochrome, so important classes are shown as a
// "knockout" pill: a solid white pill with the name cut out of it.
// filled: solid white pill with the name cut out (during a class, or an important class).
function lockName(stack, l, size, filled = l.hot, maxW = T.lock.textW) {
  if (!filled) return txt(stack, l.short, size, { color: Color.white(), scale: 0.6, fitW: maxW });
  const p = stack.addStack();
  p.backgroundColor = Color.white();
  p.cornerRadius = T.lock.pillR;
  p.setPadding(0, T.lock.pillPad, 0, T.lock.pillPad);
  return txt(p, l.short, size, { color: Color.black(), scale: 0.6, fitW: maxW - 2 * T.lock.pillPad });
}
// "Утре" for tomorrow, otherwise the short weekday ("Пн").
function lockDay(s) { return +s.nextDay === +addDays(s.today, 1) ? L.tomorrow : L.weekdaysShort[s.nextDay.getDay()]; }
function lockRingRect(parent, s) {
  const base = Object.assign({ track: C.lockTrack, color: Color.white(), fs: T.lock.ringFs }, T.ring.lockRect);
  // during a class the ring is a solid disc with the minutes cut out of it
  if (s.mode === "class") return ringText(parent, Object.assign(base, { p: s.progress, text: String(s.minsLeft), disc: Color.white(), textColor: Color.black() }));
  if (s.mode === "break") return ringText(parent, Object.assign(base, { p: s.progress, text: s.minsTo <= 99 ? String(s.minsTo) : s.next.room }));
  if (s.mode === "vacation") return ringIcon(parent, "sun.max.fill", base);
  return ringText(parent, Object.assign(base, { p: 1, color: C.lockTrack, text: s.nextLessons[0].room }));
}
// Rectangular: ring (minutes, or the room on days off) + 3 short lines,
// each one a single size so iOS never shrinks half a line.
function lockRect(w, s) {
  w.setPadding(0, 0, 0, 0);
  const row = hRow(w); row.spacing = T.lock.gap;
  lockRingRect(row, s);
  const col = row.addStack(); col.layoutVertically(); col.spacing = T.lock.lineGap;
  const mid = new Color("#ffffff", 0.88), dim = new Color("#ffffff", 0.72);
  const line = fn => leftLine(col, fn);

  if (s.mode === "vacation") {
    line(r => txt(r, L.vacation, T.lock.title, { weight: "bold", fitW: T.lock.textW }));
    line(r => txt(r, L.enjoy, T.lock.sub, { color: dim, fitW: T.lock.textW }));
  } else if (s.mode === "class" || s.mode === "break") {
    const isClass = s.mode === "class";
    const l = isClass ? s.current : s.next;
    line(r => {
      lockName(r, l, T.lock.name, isClass || l.hot, l.hot && isClass ? T.lock.nameHotW : T.lock.textW);
      if (l.hot && isClass) { r.addSpacer(T.lock.flagGap); icon(r, "flag.fill", T.lock.flag, Color.white()); } // important class
    });
    if (l.room) line(r => txt(r, roomLabel(l.room), T.lock.line, { color: mid, fitW: T.lock.textW }));
    line(r => txt(r, isClass ? L.until(hm(l.end)) : startsIn(s), T.lock.sub, { color: dim, fitW: T.lock.textW }));
  } else {
    const l = s.nextLessons[0];
    // a long holiday name would be tiny here, so it falls back to "Почивен ден"
    const why = offReason(s), status = s.mode === "done" ? L.doneShort : (why && emWidth(why) * T.lock.holidayFs <= T.lock.textW ? why : L.dayOff);
    line(r => txt(r, status, T.lock.name, { fitW: T.lock.textW }));
    line(r => txt(r, `${lockDay(s)} · ${hm(l.start)}`, T.lock.line, { color: mid, fitW: T.lock.textW }));
    line(r => lockName(r, l, T.lock.sub));
  }
}
// One line above the clock. Important classes get a flag, like flagged items in Reminders.
function lockInline(w, s) {
  w.setPadding(0, 0, 0, 0);
  let t, hot = false;
  if (s.mode === "class") { const l = s.current; hot = l.hot; t = [l.short, l.room, `${s.minsLeft} ${L.min}`].filter(Boolean).join(" · "); }
  else if (s.mode === "break") { const l = s.next; hot = l.hot; t = [l.short, l.room, startsIn(s)].filter(Boolean).join(" "); }
  else if (s.mode === "vacation") t = L.vacation;
  else { const l = s.nextLessons[0]; hot = l.hot; t = `${dayLabel(s.nextDay, s.today, true)} ${hm(l.start)} · ${[l.short, l.room].filter(Boolean).join(" ")}`; }
  if (hot) {
    const flag = SFSymbol.named("flag.fill");
    flag.applyFont(Font.boldSystemFont(T.lock.inlineFlag));
    const im = w.addImage(flag.image);
    im.imageSize = new Size(T.lock.inlineFlag, T.lock.inlineFlag);
  }
  txt(w, t, T.lock.inline);
}
// Round: one ring. During a class: a solid disc with the number cut out of it.
function lockCircular(w, s) {
  // The ring goes straight into the widget: no spacers around it, so it is never squeezed.
  w.setPadding(0, 0, 0, 0);
  const o = Object.assign({ track: C.lockTrack, color: Color.white(), fs: T.lock.roundFs, capFs: T.lock.capFs }, T.ring.lockRound);
  if (s.mode === "vacation") return ringIcon(w, "sun.max.fill", o);
  // a solid disc only during a class
  if (s.mode === "class") Object.assign(o, { p: s.progress, text: String(s.minsLeft), caption: L.min,
    disc: Color.white(), textColor: Color.black(), capColor: new Color("#000000", 0.75) });
  else if (s.mode === "break") Object.assign(o, { p: s.progress, text: s.next.room, caption: isNumRoom(s.next.room) ? L.roomWord : null, capTop: true });
  else Object.assign(o, { p: 0, text: s.nextLessons[0].room, caption: lockDay(s).toLowerCase(), capTop: true });
  ringText(w, o);
}

// ════════════════════════ BUILD THE WIDGET ════════════════════════
function buildWidget(family, s) {
  const w = new ListWidget();
  w.spacing = 0; // all spacing is set explicitly, so the layout is the same on every iOS version
  const lock = String(family).startsWith("accessory");
  const homeColors = C;
  if (lock) C = lockColors(C);
  try { fillWidget(w, family, s, lock); } finally { C = homeColors; }
  w.refreshAfterDate = nextRefresh(s);
  if (S.tapView) {
    let url = URLScheme.forRunningScript() + "?view=today";
    if (PARAM) url += "&p=" + encodeURIComponent(PARAM);
    w.url = url;
  }
  return w;
}
function fillWidget(w, family, s, lock) {
  if (!lock) {
    const g = new LinearGradient();
    g.colors = [C.bgTop, C.bgBottom];
    g.locations = [0, 1];
    w.backgroundGradient = g;
    w.backgroundColor = C.bgBottom;
  }
  switch (family) {
    case "accessoryRectangular": return lockRect(w, s);
    case "accessoryInline": return lockInline(w, s);
    case "accessoryCircular": return lockCircular(w, s);
  }
  const size = family === "small" ? "small" : family === "large" || family === "extraLarge" ? "large" : "medium";
  if (s.mode === "vacation") return vacation(w, size);
  if (size === "small") homeSmall(w, s);
  else if (size === "large") homeLarge(w, s);
  else (S.layout === "day" ? homeMediumDay : S.layout === "list" ? homeMediumList : homeMedium)(w, s);
}
function errorWidget(e) {
  const w = new ListWidget();
  w.backgroundColor = C.bgTop;
  txt(w, L.error, 14, { color: C.red });
  txt(w, String(e), 11, { color: C.dim, weight: "regular", lines: 6 });
  return w;
}

// ════════════════════════ REMINDERS ════════════════════════
// Schedules a notification before each class for the next 2 school days and
// removes ones that are no longer needed. Only the Settings page turns this on,
// so different widgets can't fight over it.
const THREAD = "uchilishte-widget";
function hashStr(s) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return (h >>> 0).toString(36); }
// Never lets a reminder problem stop the widget or the menu.
async function syncRemindersSafe() { try { await syncReminders(); } catch (e) { console.error("Reminders: " + e); } }
async function syncReminders() {
  const mins = Number(SAVED.remindMinutes) || 0;
  let pending = [];
  try { pending = (await Notification.allPending()).filter(n => n.threadIdentifier === THREAD); }
  catch (e) { console.log("Reminders: " + e); }
  if (!mins && !pending.length) return;
  const want = [];
  if (mins > 0) {
    let d = startOfDay(NOW), days = 0;
    for (let i = 0; i < 10 && days < 2; i++, d = addDays(d, 1)) {
      if (!dayStatus(d).school) continue;
      days++;
      for (const l of lessonsFor(d)) {
        const t = new Date(l.start - mins * 60000);
        if (t > NOW) want.push({ l, t, id: `uch-${ymd(d)}-${l.num}-${mins}-${hashStr(l.name + l.room + (l.test || "") + S.language)}` });
      }
    }
  }
  const ids = new Set(want.map(x => x.id));
  const stale = pending.filter(n => !ids.has(n.identifier)).map(n => n.identifier);
  if (stale.length) await Notification.removePending(stale);
  const have = new Set(pending.map(n => n.identifier));
  for (const x of want) {
    if (have.has(x.id)) continue;
    const n = new Notification();
    n.identifier = x.id;
    n.threadIdentifier = THREAD;
    n.title = [x.l.name, roomLabel(x.l.room)].filter(Boolean).join(" · ");
    n.body = x.l.test ? L.notifTest(x.l.test, hm(x.l.start)) : L.notifStart(hm(x.l.start));
    n.setTriggerDate(x.t);
    await n.schedule();
  }
}

// ════════════════════════ TODAY / WEEK / DAYS OFF / SETTINGS (full screen) ════════════════════════
const jsonIn = v => JSON.stringify(v).replace(/</g, "\\u003c"); // JSON inside <script>
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function svgRing(d, w, p, color, text, fs, track = "rgba(142,142,147,.3)", textColor = "currentColor") {
  const r = (d - w) / 2, c = 2 * Math.PI * r;
  return `<svg width="${d}" height="${d}" viewBox="0 0 ${d} ${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${r}" fill="none" style="stroke:${track}" stroke-width="${w}"/>` +
    (p > 0 ? `<circle cx="${d / 2}" cy="${d / 2}" r="${r}" fill="none" style="stroke:${color}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${c * Math.min(p, 0.9999)} ${c}" transform="rotate(-90 ${d / 2} ${d / 2})"/>` : "") +
    (text ? `<text x="50%" y="50%" dy=".35em" text-anchor="middle" font-size="${fs}" font-weight="700" style="fill:${textColor}" font-family="ui-rounded,-apple-system">${esc(text)}</text>` : "") + `</svg>`;
}
// Settings → Версия: the version, what's available, auto-update, the channel (shown after 5 taps
// on the number, or when on beta), Провери сега / Предишна версия. msg: the last action's result.
const NOTICES = { justUpdated: false, rolledBack: false }; // shown in this run: cleared when the page closes
function versionCard(msg) {
  const X = L.set.v, st = readState(), avail = updateAvailable(st), ch = channel();
  const back = ch === "stable" && st.checkedChannel === "stable" && st.latest && cmpVersion(st.latest, VERSION) < 0;
  const notes = st.notes && (st.notes[S.language] || st.notes.bg);
  const nd = open => notes ? `<details class="vnotes"${open ? " open" : ""}><summary>${X.notes}</summary>${esc(notes)}</details>` : "";
  const btn = (a, t, main) => `<button class="btn${main ? " main" : ""}" data-a="${a}">${esc(t)}</button>`;
  const when = iso => { const d = new Date(iso); return ymd(d) === ymd(NOW) ? X.today(hm(d)) : X.onDay(`${d.getDate()} ${L.months[d.getMonth()]}`, hm(d)); };
  let h = "";
  if (st.justUpdated === VERSION) { NOTICES.justUpdated = true; h += `<div class="vdone">✓ ${esc(X.updated(VERSION))}</div>${nd(false)}`; }
  if (st.rolledBack) { NOTICES.rolledBack = true; h += `<p class="vwarn">${esc(X.rolledBack(st.rolledBack.from, st.rolledBack.to))}</p>`; }
  h += `<div class="vline"><span class="vnum" id="vnum">${esc(VERSION)}</span>${avail ? `<span class="vnew">${esc(X.available(st.latest))}</span>` : st.latest && !back ? `<span class="vok">${X.upToDate}</span>` : ""}</div>`;
  h += `<p class="hint">${esc(st.lastCheck ? X.checked(when(st.lastCheck)) : X.never)}</p>`;
  if (avail && st.justUpdated !== VERSION) h += nd(true);
  if (st.autoPaused === "edited") h += `<p class="vwarn">${X.paused}</p><div class="btns">${btn("force", X.updateAnyway, true)}</div>`;
  else {
    if (st.autoPaused === "rollback") h += `<p class="hint">${esc(X.pausedBack(st.pausedAt || VERSION))}</p>`;
    if (avail) h += `<div class="btns">${btn("install", X.update, true)}</div>`;
  }
  if (back) h += `<p class="vwarn">${X.newer}</p><div class="btns">${btn("downgrade", X.backTo(st.latest), true)}</div>`;
  h += `<label class="sw"><span>${X.auto}<small>${X.autoHint}</small></span><input type="checkbox" id="autoUpdate"></label>`;
  h += `<div id="chan"${ch === "beta" || back ? "" : " hidden"}><label class="field"><span>${X.channel}</span></label><div class="seg" id="channel"><button data-v="stable">stable</button><button data-v="beta">beta</button></div><p class="hint">${X.channelHint}</p></div>`;
  h += `<div class="btns">${btn("check", X.check)}${(st.backups || []).length ? btn("previous", X.previous) : ""}</div>`;
  return h + (msg ? `<p class="vmsg">${esc(msg)}</p>` : "");
}
// Notices shown once ("Обновено до …", a rollback): cleared after they were on screen.
function clearNotices() {
  if (!NOTICES.justUpdated && !NOTICES.rolledBack) return;
  const st = readState();
  if (NOTICES.justUpdated && st.justUpdated === VERSION) st.justUpdated = null;
  if (NOTICES.rolledBack) st.rolledBack = null;
  writeState(st); NOTICES.justUpdated = NOTICES.rolledBack = false;
}
let CODE_REPLACED = false; // this run has already put another version in the script's file
// A button in the Версия card (uchilishte://update?a=…) → the message shown under it.
async function versionAction(a, v) {
  const X = L.set.v;
  if (CODE_REPLACED && a !== "check") return X.restart;
  if (a === "check") return await checkForUpdate(true) ? (updateAvailable() ? "" : X.none) : X.offline;
  if (a === "channel") {
    const r = await switchChannel(v);
    SAVED.channel = S.channel = r.channel;
    return X.onChannel(r.channel) + (r.latest ? "" : " " + X.offline);
  }
  if (a === "previous") {
    const r = await previousVersion();
    if (r.ok) CODE_REPLACED = true;
    return r.ok ? X.wentBack(r.version) : X.noBackup;
  }
  if (a === "force") await resumeUpdates();
  if (!(await checkForUpdate(true))) return X.offline;
  const r = await installUpdate({ manual: true, downgrade: a === "downgrade" });
  if (r.ok) { CODE_REPLACED = true; return X.installed(r.version); }
  return r.reason === "offline" ? X.offline : r.reason === "not newer" ? (a === "force" ? X.resumed : X.none) : X.failed(r.reason);
}
// ════════════════════════ IMPORT AND THE TIMETABLE EDITOR (since 1.6.0) ════════════════════════
// Sources: the link's ?data= and the import file next to the script (checked at start, in the app),
// "Постави от AI" (the clipboard) and "От файл" (DocumentPicker). Every one goes through
// parseImport → migrate → the editor page (validateData on every change), which saves through
// uchilishte://data?a=save: history/, then data.json. The page's code is edPage (below), which runs
// in the WebView; the script answers its links in dataAction.
const IMPORT_FILE = "uchilishte-import.txt";
const importPath = () => module.filename.slice(0, module.filename.lastIndexOf("/") + 1) + IMPORT_FILE;
async function readImportFile() {
  const fm = scriptFM(), p = importPath();
  try { if (fm.fileExists(p) && fm.downloadFileFromiCloud) await fm.downloadFileFromiCloud(p); } catch (e) { }
  try { return fm.fileExists(p) ? fm.readString(p) : null; } catch (e) { return null; }
}
function removeImportFile() { const fm = scriptFM(); try { if (fm.fileExists(importPath())) fm.remove(importPath()); } catch (e) { console.error("Import file: " + e); } }
// Text → { d } (migrated, not yet checked), { error: text } or { newer: true } (update first).
function prepareImport(text) {
  const r = parseImport(text);
  if (r.error) return { error: r.error[S.language] || r.error.bg };
  const d = migrate(r.data);
  if (typeof d.meta.schema === "number" && d.meta.schema > SCHEMA) return { newer: true };
  delete d.meta.demo;
  return { d };
}
async function pickFile() {
  let p;
  try { p = (await DocumentPicker.open())[0]; } catch (e) { return null; } // cancelled
  for (const fm of [FileManager.local(), FileManager.iCloud()]) {
    try { if (fm.downloadFileFromiCloud) await fm.downloadFileFromiCloud(p); } catch (e) { }
    try { return fm.readString(p); } catch (e) { }
  }
  return null;
}
const isDemo = () => !!(DATA.meta && DATA.meta.demo) && TINFO.source === "builtin";
// ───── Share and a new school year (1.7.0) ─────
// The school year a date belongs to, as the year it starts in (from 1 September); "2026-27".
const syOf = t => t.getFullYear() - (t.getMonth() < 8 ? 1 : 0);
const syName = y => `${y}-${String(y + 1).slice(-2)}`;
const fillP = (s, ...a) => a.reduce((t, x) => t.replace("%", x), s);
// Which school year a timetable is for: meta.schoolYear, else when it was imported, else when data.json was written.
function ttYear(d) {
  const m = (d && d.meta) || {};
  if (/^\d{4}-\d\d$/.test(m.schoolYear || "")) return +m.schoolYear.slice(0, 4);
  if (m.created && !isNaN(Date.parse(m.created))) return syOf(new Date(m.created));
  try { const t = FileManager.local().modificationDate(dataPath("data.json")); if (t) return syOf(t); } catch (e) { }
  return syOf(NOW);
}
// The person's own timetable (not the demo), and whether it is from an earlier school year.
const ownTT = () => !isDemo() && !!TT_FULL, yearOld = () => ownTT() && syOf(NOW) > ttYear(TT_FULL);
// From 1 September until a timetable for the new school year is saved (or "Не сега" for this year).
const newYearDue = () => yearOld() && readState().newYearLater !== syOf(NOW);
const eachCell = (d, f) => Object.entries(d.week || {}).forEach(([k, day]) => (day || []).forEach((e, p) => e && f(e, k, p)));
const cellNames = e => e.groups ? e.groups.map(g => g.name) : [e.name];
// What classmates get: both groups, no picks, no important classes (they are personal).
function sharedTimetable(d) {
  const s = clone(d);
  s.meta = s.meta || { schema: SCHEMA };
  delete s.meta.groups; delete s.meta.demo; delete s.meta.created;
  s.meta.source = "shared";
  eachCell(s, e => { delete e.important; (e.groups || []).forEach(g => { delete g.important; }); });
  return s;
}
// The names now in use, for the AI to reuse in a new timetable ("Копирай промпта с моите имена").
function namesNote(d) {
  const E = L.ed, seen = new Set(), out = [E.names];
  eachCell(d, e => cellNames(e).forEach(n => {
    if (!n || seen.has(n)) return;
    seen.add(n);
    const x = [d.short && d.short[n] ? fillP(E.namesShort, d.short[n]) : "", d.tiny && d.tiny[n] ? fillP(E.namesTiny, d.tiny[n]) : "", ((d.meta || {}).noRoom || []).includes(n) ? E.namesNoRoom : ""].filter(Boolean);
    out.push(`- ${n}${x.length ? ": " + x.join(", ") : ""}`);
  }));
  const picks = (d.meta || {}).groups || {}, done = new Set();
  eachCell(d, e => {
    const k = e.groups && groupKey(e.groups), g = k && e.groups[picks[k]];
    if (g && !done.has(k)) { done.add(k); out.push(fillP(E.namesGroup, g.label, e.groups.map(x => x.label).join(" / "))); }
  });
  return out.join("\n");
}
// A new import over the person's own timetable: keep their short names, important classes, group picks
// (and, in the same school year, the school's own days off). gone: old names the new one doesn't have.
function mergeOld(n, o, sameYear) {
  const d = clone(n), om = o.meta || {}, names = new Set(), R = resolveGroups(o);
  d.meta = d.meta || { schema: SCHEMA };
  eachCell(d, e => cellNames(e).forEach(x => x && names.add(x)));
  for (const m of ["short", "tiny", "icons"]) for (const [k, v] of Object.entries(o[m] || {})) if (names.has(k) && !(d[m] && k in d[m])) (d[m] = d[m] || {})[k] = v;
  const nr = (om.noRoom || []).filter(x => names.has(x) && !(d.meta.noRoom || []).includes(x));
  if (nr.length) d.meta.noRoom = (d.meta.noRoom || []).concat(nr);
  if (!d.meta.grade && om.grade) d.meta.grade = om.grade;
  if (!d.meta.class && om.class) d.meta.class = om.class;
  if (sameYear) for (const k of ["daysOff", "notOff", "lastDay"]) if (o[k] && !d[k]) d[k] = clone(o[k]);
  // important: only when the new one has none (a shared timetable, or not asked): the same subject in the
  // same place, or a subject that was important everywhere
  let any = false;
  eachCell(d, e => { if (e.important || (e.groups || []).some(g => g.important)) any = true; });
  if (!any) {
    const all = {}, hot = {};
    eachCell(R, e => { if (e.name) { all[e.name] = (all[e.name] || 0) + 1; if (e.important) hot[e.name] = (hot[e.name] || 0) + 1; } });
    eachCell(d, (e, k, p) => { const w = (R.week[k] || [])[p]; if (!e.groups && e.name && (hot[e.name] === all[e.name] || (w && w.name === e.name && w.important))) e.important = true; });
  }
  // group picks, by label (the order of the groups may differ)
  const old = {};
  eachCell(o, e => { if (e.groups) { const k = groupKey(e.groups), i = (om.groups || {})[k]; if (e.groups[i]) old[k] = e.groups[i].label; } });
  eachCell(d, e => {
    const k = e.groups && groupKey(e.groups);
    if (k && old[k] && !(d.meta.groups && k in d.meta.groups)) (d.meta.groups = d.meta.groups || {})[k] = e.groups.findIndex(g => g.label === old[k]);
  });
  const gone = {};
  eachCell(R, (e, k, p) => { if (e.name && !names.has(e.name)) (gone[e.name] = gone[e.name] || []).push(k + "," + p); });
  return { d, gone, old: R.week };
}
// What the editor page needs: the timetable, its check, history/, the official days off.
function editorPayload(ed = {}) {
  const fm = FileManager.local(), hd = dataPath("history"), imp = ed.mode === "import", own = ownTT(), newYear = imp && yearOld();
  const m = imp && own ? mergeOld(ed.d, TT_FULL, !newYear) : null, d = m ? m.d : imp ? ed.d : TT_FULL;
  const when = t => `${t.getDate()} ${L.months[t.getMonth()]} ${t.getFullYear()}, ${hm(t)}`;
  const hist = fm.fileExists(hd) ? fm.listContents(hd).filter(n => /^\d+\.json$/.test(n)).sort((a, b) => parseInt(b) - parseInt(a)).map(f => ({ f, t: when(new Date(parseInt(f))) })) : [];
  const hol = HOLIDAYS.daysOff.map(e => Array.isArray(e) ? e : [e]).filter(e => isYmd(e[0])).map(e => {
    const only = e.find(x => x && x.grades);
    return { a: e[0], b: isYmd(e[1]) ? e[1] : e[0], n: e.slice(1).find(x => typeof x === "string" && !isYmd(x)) || "", g: only ? only.grades : null };
  });
  return { mode: imp ? "import" : "edit", d, val: validateData(d), hist, hol, msg: ed.msg || "",
    ld: HOLIDAYS.lastDay || {}, ld0: `20${HOLIDAYS.schoolYear.slice(-2)}-06-30`,
    page: PAGES + "install/", sh: !imp && own ? sharedTimetable(TT_FULL) : null, old: m ? m.old : null, gone: m ? m.gone : {}, newYear,
    oldGrade: own ? TT_FULL.meta.grade || 0 : 0, oldHol: +HOLIDAYS.schoolYear.slice(0, 4) < syOf(NOW) ? HOLIDAYS.schoolYear.replace("-", "/") : "" };
}
// A link from the editor page or the welcome card (uchilishte://data?a=…).
async function dataAction(q, wv, changed) {
  const E = L.ed, js = c => wv.evaluateJavaScript(c);
  const say = (t, b) => js(`say(${JSON.stringify(t)}${b ? "," + JSON.stringify(b) : ""})`);
  const page = (tab, ed) => wv.loadHTML(buildHTML(computeState(NOW), tab, null, ed));
  if (q.a === "check" || q.a === "save") {
    let d;
    try { d = migrate(JSON.parse(q.d)); } catch (e) { return say(String(e.message || e)); }
    const v = validateData(d);
    if (q.a === "check" || v.errors.length) { await js(`setVal(${JSON.stringify(v)})`); return q.a === "save" ? say(E.fixFirst) : null; }
    const first = !FileManager.local().fileExists(dataPath("data.json"));
    delete d.meta.demo;
    if (q.m === "import" && !d.meta.created) d.meta.created = new Date(NOW).toISOString();
    if (q.m === "import") d.meta.schoolYear = syName(syOf(NOW));
    else if (!d.meta.schoolYear && ownTT()) d.meta.schoolYear = syName(ttYear(TT_FULL));
    saveTimetable(d);
    if (q.m === "import") removeImportFile();
    changed(); await reload();
    return page(first ? "t1" : "t2", { done: first, msg: first ? "" : E.saved });
  }
  if (q.a === "cancel") { removeImportFile(); return page("t1"); }
  if (q.a === "undo") {
    let d;
    try { d = migrate(JSON.parse(FileManager.local().readString(dataPath("history", q.f)))); } catch (e) { return say(String(e.message || e)); }
    if (validateData(d, { quick: true }).errors.length) return say(E.badHist);
    saveTimetable(d); changed(); await reload();
    return page("t2", { msg: E.restored });
  }
  if (q.a === "prompt" || q.a === "names") { Pasteboard.copyString(E.prompt(PAGES + "ai/INSTRUCTIONS.md") + (q.a === "names" ? "\n\n" + namesNote(TT_FULL) : "")); return say(E.copied); }
  if (q.a === "share") return ShareSheet.present([q.u]);
  if (q.a === "export") {
    const sh = sharedTimetable(TT_FULL);
    try { await DocumentPicker.exportString(JSON.stringify(sh, null, 1), `${sh.meta.class || "School Widget"}-${E.fileName}.json`); } catch (e) { } // cancelled
    return;
  }
  if (q.a === "later") { const st = readState(); st.newYearLater = syOf(NOW); writeState(st); return page("t2"); }
  if (q.a === "paste" || q.a === "file") {
    const text = q.a === "paste" ? Pasteboard.pasteString() : await pickFile();
    if (text == null) return q.a === "paste" ? say(E.emptyClip) : null;
    const r = prepareImport(text);
    if (r.error) return say(r.error);
    if (r.newer) return say(E.newer, { t: L.set.v.update, a: "install" });
    return page("t1", { mode: "import", d: r.d });
  }
}
// From the app menu or at start (outside the page): check the text, then open the editor.
async function startImport(text, fromFile) {
  const E = L.ed, r = prepareImport(text);
  const say = async (msg, acts = []) => { const a = new Alert(); a.title = E.importTitle; a.message = msg; acts.forEach(x => a.addAction(x)); a.addCancelAction(L.close); return a.presentAlert(); };
  if (r.error) {
    if (!fromFile) return say(r.error);
    if (await say(r.error + "\n\n" + E.fileBad, [E.fileGone]) === 0) removeImportFile();
    return;
  }
  if (r.newer) { if (await say(E.newer, [L.set.v.update]) === 0) await say(await versionAction("install")); return; }
  await showView(computeState(NOW), "t1", null, { mode: "import", d: r.d });
}
async function menuImport() {
  const E = L.ed, a = new Alert();
  a.title = E.importTitle; a.message = E.welcomeHint;
  a.addAction(E.paste); a.addAction(E.file); a.addCancelAction(L.close);
  const i = await a.presentSheet();
  if (i < 0) return;
  const text = i === 0 ? Pasteboard.pasteString() : await pickFile();
  if (text != null || i === 0) await startImport(text || "");
}
// The editor's own code. It runs in the WebView (buildHTML puts its text into the page), never in
// Scriptable. P: editorPayload(); E: the page's strings ("%" = a value).
function edPage(P, E) {
  const $ = id => document.getElementById(id), body = document.body;
  const h = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const F = (s, ...a) => a.reduce((t, x) => t.replace("%", x), s);
  const CODES = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]; // validateData's cell codes ("Пн5")
  let D = null, V = P.val, sure = false, stepDone = false, gradeDone = false, saveNext = false, onOk = null, pickN = null;
  const pickWas = {}, skip = new Set();
  const go = (a, o = {}) => { location.href = "uchilishte://data?a=" + a + Object.keys(o).map(k => "&" + k + "=" + encodeURIComponent(o[k])).join(""); };
  const chk = () => go("check", { d: JSON.stringify(D) });
  const upd = () => { sure = false; draw(); chk(); };
  const meta = () => D.meta || (D.meta = { schema: 1 });
  const key = gs => gs.map(g => g.label).sort().join("|");
  const picks = () => meta().groups || {};
  const shown = e => { const g = e.groups && e.groups[picks()[key(e.groups)]]; return g ? { name: g.name, room: g.room !== undefined ? g.room : e.room, important: g.important !== undefined ? g.important : e.important } : e; };
  const short = n => (D.short && D.short[n]) || n;
  const cells = () => Object.keys(D.week).flatMap(k => (D.week[k] || []).map((e, p) => ({ k: +k, p, e })));
  const days = () => [1, 2, 3, 4, 5].concat((D.week[6] || []).length ? [6] : []);
  const names = () => [...new Set(cells().flatMap(c => c.e.groups ? c.e.groups.map(g => g.name) : [c.e.name]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "bg"));
  const splits = () => { const m = {}; for (const c of cells()) if (c.e.groups) { const k = key(c.e.groups); (m[k] = m[k] || { gs: c.e.groups, at: [] }).at.push(E.wd[c.k] + (c.p + 1)); } return m; };
  const txt = x => x.text[E.lang] || x.text.bg;
  const inG = (r, g) => { const [a, b] = String(r).split("-").map(Number); return g >= a && g <= (b || a); };
  const lastDef = () => { const g = meta().grade; for (const k in P.ld) if (inG(k, g)) return P.ld[k]; return P.ld0; };
  const dates = (a, b) => { const out = []; for (let t = Date.parse(a + "T00:00Z"); t <= Date.parse(b + "T00:00Z"); t += 864e5) out.push(new Date(t).toISOString().slice(0, 10)); return out; };
  const fd = s => +s.slice(8) + " " + E.months[+s.slice(5, 7) - 1];
  const sw = (id, label, hint, on) => `<label class="sw"><span>${label}${hint ? `<small>${hint}</small>` : ""}</span><input type="checkbox" id="${id}"${on ? " checked" : ""}></label>`;
  const field = (id, label, v, type = "text", more = "") => `<label class="field"><span>${label}</span><input id="${id}" type="${type}" value="${h(v)}" ${more}></label>`;
  const row = (attr, main, sub) => `<div class="subj" ${attr}><div><b>${main}</b>${sub ? `<small>${sub}</small>` : ""}</div><span class="go">›</span></div>`;
  const wOf = n => V.warnings.filter(x => (x.code === "too_wide" && x.where === n) || (x.code === "same_short" && x.where === short(n)));
  // the import against the old timetable: cells that differ (shown name and room)
  const lbl = x => x && x.name ? x.name + (x.room ? " " + x.room : "") : "";
  const changes = () => {
    const out = [];
    if (P.old) for (const k of days()) {
      const a = P.old[k] || [], b = D.week[k] || [];
      for (let p = 0; p < Math.max(a.length, b.length); p++) { const x = lbl(a[p]), y = lbl(b[p] && shown(b[p])); if (x !== y) out.push({ k, p, x, y }); }
    }
    return out;
  };
  const marks = () => {
    const m = {};
    for (const c of changes()) m[c.k + "," + c.p] = "n";
    for (const c of cells()) if (JSON.stringify(c.e).includes("?")) m[c.k + "," + c.p] = "w"; // an unsure "?" from the AI
    V.errors.concat(V.warnings).forEach((x, i) => { const r = /^(Пн|Вт|Ср|Чт|Пт|Сб)(\d+)$/.exec(x.where); if (r) { const k = CODES.indexOf(r[1]) + "," + (r[2] - 1); m[k] = i < V.errors.length ? "e" : m[k] || "w"; } });
    return m;
  };
  const grid = () => {
    const ks = days(), mk = marks();
    let g = `<div class="grid" style="grid-template-columns:34px repeat(${ks.length},1fr)"><div></div>` + ks.map(k => `<div class="dh">${E.wd[k]}</div>`).join("");
    D.bells.forEach((b, p) => {
      g += `<div class="pn">${p + 1}<span>${h(b[0])}</span></div>`;
      for (const k of ks) {
        const e = (D.week[k] || [])[p], s = e && shown(e);
        g += `<div class="cell ec ${mk[k + "," + p] || ""} ${!e ? "empty" : !s.name ? "free" : s.important ? "hot" : ""}" data-k="${k}" data-p="${p}">` +
          (!e ? "" : !s.name ? `<b>${E.free}</b>` : `<b>${h(short(s.name))}</b><span>${h(s.room || "") || "&nbsp;"}</span>`) + "</div>";
      }
    });
    return g + "</div>";
  };
  const groupsHtml = () => Object.entries(splits()).map(([k, o]) => `<div class="gp"><p>${h(o.at.join(", "))}</p><div class="seg" data-g="${h(k)}">${o.gs.map((g, i) => `<button data-i="${i}" class="${picks()[k] === i ? "on" : ""}">${h(g.label)}</button>`).join("")}</div></div>`).join("");
  function draw() {
    const imp = P.mode === "import", items = V.errors.map(x => [x, "e"]).concat(V.warnings.map(x => [x, ""]));
    const nr = meta().noRoom || [], no = new Set(D.notOff || []), g = meta().grade;
    const own = (D.daysOff || []).map((e, i) => {
      const a = Array.isArray(e) ? e : [e], b = /^\d{4}-\d\d-\d\d$/.test(a[1]) ? a[1] : a[0];
      const n = a.slice(1).find(x => typeof x === "string" && !/^\d{4}-\d\d-\d\d$/.test(x)) || "";
      return `<div class="bell"><span class="t2">${fd(a[0])}${b !== a[0] ? " – " + fd(b) : ""}${n ? " · " + h(n) : ""}</span><span class="x" data-x="off" data-i="${i}">⊖</span></div>`;
    }).join("");
    const gh = groupsHtml(), ch = changes();
    const at = l => l.map(kp => { const [k, p] = kp.split(","); return E.wd[k] + " " + (+p + 1); }).join(", ");
    const gone = Object.keys(P.gone).filter(n => !skip.has(n) && !names().includes(n));
    $("ed").innerHTML = `<h1>${imp ? E.impTitle : E.title}</h1><p class="lead">${imp ? E.impLead : E.editLead}</p>
      <div class="sum"><span class="chip ok">${F(E.daysN, days().filter(k => (D.week[k] || []).length).length, D.bells.length)}</span>${V.errors.length ? `<span class="chip e">${F(E.errs, V.errors.length)}</span>` : ""}${V.warnings.length ? `<span class="chip w">${F(E.toCheck, V.warnings.length)}</span>` : ""}</div>
      ${imp && meta().source === "shared" ? `<p class="note2">${E.sharedNote}</p>` : ""}
      ${pickN ? `<div class="note2 pk">${h(F(E.pickLead, pickN))}<button class="btn main" data-x="pickDone">${E.done}</button></div>` : ""}
      ${grid()}${ch.length ? `<h3>${E.changed}</h3><div class="card chg">${ch.slice(0, 8).map(c => `<p><b>${E.wd[c.k]} ${c.p + 1}</b>: ${h(c.y || E.free)} <s>(${h(F(E.was, c.x || E.free))})</s></p>`).join("")}${ch.length > 8 ? `<p>${F(E.more, ch.length - 8)}</p>` : ""}</div>` : ""}
      ${gone.map(n => `<p class="note2">${h(F(E.gone, n, at(P.gone[n])))} <u data-x="pick" data-n="${h(n)}">${E.pick}</u> · <u data-x="drop" data-n="${h(n)}">${E.drop}</u></p>`).join("")}
      ${items.length ? `<ol class="wl">${items.map(([x, c]) => `<li class="${c}">${h(txt(x))}</li>`).join("")}</ol>` : ""}
      <h3>${E.subjects}</h3><div class="card">${names().map(n => { const w = wOf(n)[0]; return row(`data-s="${h(n)}"`, h(n), w ? `<span class="wt">${h(txt(w))}</span>` : [short(n) !== n ? F(E.shortIs, h(short(n))) : "", nr.includes(n) ? E.noRoom : ""].filter(Boolean).join(" · ")); }).join("")}</div>
      ${gh ? `<h3>${E.groups}</h3>${gh}` : ""}
      <h3>${E.bells}</h3><div class="card">${D.bells.map((b, i) => `<div class="bell"><span class="n">${i + 1}</span><input type="time" data-b="${i},0" value="${h(b[0])}"><span>–</span><input type="time" data-b="${i},1" value="${h(b[1])}">${i && i === D.bells.length - 1 ? `<span class="x" data-x="bell">⊖</span>` : ""}</div>`).join("")}<div class="bell add" data-x="addBell">${E.addBell}</div></div>
      <h3>${E.off}</h3><div class="card"><p class="hint" style="margin-top:10px">${E.official}</p>${P.hol.map((o, i) => o.g && g && !inG(o.g, g) ? "" : sw("o" + i, `${fd(o.a)}${o.b !== o.a ? " – " + fd(o.b) : ""} · ${h(o.n)}`, "", dates(o.a, o.b).every(x => no.has(x)))).join("")}${own}<div class="bell add" data-x="addOff">${E.addOff}</div></div>
      <h3>${E.last}</h3><div class="card">${field("grade", E.grade, g || "", "number", 'min="1" max="12" inputmode="numeric"')}${field("last", E.lastShort, D.lastDay || lastDef(), "date")}</div><p class="note">${g ? F(E.lastHint, h(g), fd(lastDef())) : E.gradeHint}</p>
      ${!imp && P.hist.length ? `<div class="btns"><button class="btn" data-x="undo">${E.undo}</button></div>` : ""}
      <div class="bar"><button class="btn" data-x="cancel">${E.cancel}</button><button class="btn main" data-x="save" id="sv">${sure ? E.saveAnyway : E.save}</button></div>`;
  }
  // a bottom sheet; ok() returns false to skip the redraw and check
  function sheet(title, html, ok, okText, closeText) {
    onOk = ok;
    $("sh").innerHTML = `<div class="dim" data-y="no"></div><div class="sheet"><div class="grab"></div><h2>${title}</h2>${html}<div class="btns"><button class="btn" data-y="no">${closeText || E.cancel}</button>${ok ? `<button class="btn main" data-y="ok">${okText || E.done}</button>` : ""}</div></div>`;
  }
  const rename = (a, b) => {
    for (const c of cells()) { if (c.e.name === a) c.e.name = b; (c.e.groups || []).forEach(g => { if (g.name === a) g.name = b; }); }
    for (const m of ["short", "tiny", "icons"]) if (D[m] && a in D[m]) { if (!(b in D[m])) D[m][b] = D[m][a]; delete D[m][a]; }
    if (meta().noRoom) meta().noRoom = meta().noRoom.map(x => x === a ? b : x);
  };
  const trim = day => { while (day.length && !day[day.length - 1].name && !day[day.length - 1].groups) day.pop(); };
  const val = id => $(id).value.trim(), on = id => $(id).checked;
  const flag = (o, k, v) => { if (v) o[k] = v; else delete o[k]; };
  function cellSheet(k, p) {
    const day = D.week[k] || [], e = day[p] || { name: "" }, t = D.bells[p];
    const list = `<datalist id="nl">${names().map(n => `<option value="${h(n)}">`).join("")}</datalist>`;
    const html = e.groups
      ? e.groups.map((g, i) => `<div class="card in">${field("gn" + i, h(g.label), g.name, "text", 'list="nl"')}${field("gr" + i, E.room, g.room !== undefined ? g.room : e.room || "")}</div>`).join("") + `<div class="card in">${sw("ci", E.important, E.importantHint, e.important)}</div>`
      : `<div class="card in"><div id="cf"${!e.name && p < day.length ? " hidden" : ""}>${field("cn", E.subject, e.name, "text", 'list="nl" autocomplete="off"')}${field("cr", E.room, e.room || "")}${sw("ci", E.important, E.importantHint, e.important)}</div>${sw("cz", E.freeP, "", !e.name && p < day.length)}</div>` +
        (e.name ? `<div class="seg" id="sc"><button class="on" data-v="one">${E.onlyCell}</button><button data-v="all">${h(F(E.allOf, e.name))}</button></div>` : "");
    sheet(F(E.cellTitle, E.wdFull[k], p + 1, t ? t[0] : ""), html + list, () => {
      while (day.length < p) day.push({ name: "" });
      if (e.groups) {
        e.groups.forEach((g, i) => { g.name = val("gn" + i) || g.name; flag(g, "room", val("gr" + i)); });
        flag(e, "important", on("ci")); day[p] = e;
      } else if (on("cz") || !val("cn")) day[p] = { name: "" };
      else {
        const n = { name: val("cn") }; flag(n, "room", val("cr")); flag(n, "important", on("ci"));
        if (e.name && $("sc").querySelector(".on").dataset.v === "all") {
          if (n.name !== e.name) rename(e.name, n.name);
          for (const c of cells()) if (!c.e.groups && c.e.name === n.name) {
            if ((n.room || "") !== (e.room || "")) flag(c.e, "room", n.room);
            if (!!n.important !== !!e.important) flag(c.e, "important", n.important);
          }
        } else day[p] = n;
      }
      trim(day); D.week[k] = day;
    });
  }
  function subjSheet(n) {
    sheet(h(n), `<div class="card in">${field("sn", E.name, n)}${field("ss", E.shortName, (D.short || {})[n] || "", "text", `placeholder="${h(n)}"`)}${field("st", E.tinyName, (D.tiny || {})[n] || "")}${sw("sr", E.noRoom, "", (meta().noRoom || []).includes(n))}</div>` +
      wOf(n).map(w => `<p class="hint wt">${h(txt(w))}</p>`).join(""), () => {
      const nn = val("sn") || n;
      if (nn !== n) rename(n, nn);
      for (const [m, id] of [["short", "ss"], ["tiny", "st"]]) { const v = val(id); D[m] = D[m] || {}; if (v && v !== nn) D[m][nn] = v; else delete D[m][nn]; }
      const nr = (meta().noRoom || []).filter(x => x !== nn);
      if (on("sr")) nr.push(nn);
      if (nr.length) meta().noRoom = nr; else delete meta().noRoom;
    });
  }
  function save() {
    if (V.errors.length) { say(E.fixFirst); const l = $("ed").querySelector(".wl"); if (l) l.scrollIntoView(); return; }
    if (P.mode === "import" && !stepDone && Object.keys(splits()).some(k => !(picks()[k] >= 0))) {
      return sheet(E.whichGroup, `<p class="lead">${E.groupLead}</p>${groupsHtml()}`, () => { stepDone = saveNext = true; chk(); return false; }, E.cont);
    }
    if (P.mode === "import" && P.newYear && !gradeDone) {
      const g = meta().grade, g0 = g && g !== P.oldGrade ? g : Math.min(12, (P.oldGrade || g || 0) + 1);
      return sheet(E.gradeQ, `<p class="lead">${E.gradeLead}</p><div class="step"><button class="btn" data-z="-1">−</button><b id="gv">${h(g0)}</b><button class="btn" data-z="1">+</button></div>${P.oldHol ? `<p class="note2">${h(F(E.oldHol, P.oldHol))}</p>` : ""}`,
        () => { meta().grade = +$("gv").textContent; gradeDone = saveNext = true; chk(); return false; }, E.cont);
    }
    if (V.warnings.length && !sure) { sure = true; $("sv").textContent = E.saveAnyway; return; }
    go("save", { d: JSON.stringify(D), m: P.mode });
  }
  window.setVal = v => {
    V = v;
    if (saveNext) { saveNext = false; draw(); sure = true; return save(); }
    if (!/INPUT|SELECT/.test((document.activeElement || {}).tagName)) draw();
  };
  window.say = (t, b) => {
    const s = $("say");
    s.innerHTML = h(t) + (b ? `<button class="btn main">${h(b.t)}</button>` : "");
    s.hidden = false; clearTimeout(window._say); window._say = setTimeout(() => { s.hidden = true; }, b ? 12000 : 4500);
    s.onclick = e => { s.hidden = true; if (b && e.target.tagName === "BUTTON") { document.querySelector('.tabs [data-t="t4"]').click(); $("verh").scrollIntoView(); act(b.a); } };
  };
  const open = () => { D = JSON.parse(JSON.stringify(P.d)); V = P.val; body.classList.add("ed"); scrollTo(0, 0); draw(); };
  // the install link with the shared timetable: deflate in the page (iOS 16.4+), else plain #d=
  const b64u = u8 => { let s = ""; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  async function shareLink() {
    const raw = new TextEncoder().encode(JSON.stringify(P.sh));
    if (typeof CompressionStream !== "function") return P.page + "#d=" + b64u(raw);
    return P.page + "#z=" + b64u(new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer()));
  }
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

  document.addEventListener("click", ev => {
    const t = ev.target, c = t.closest("[data-k],[data-s],[data-g] button,[data-x],[data-y],[data-h],[data-z],#sh .seg button");
    if (!c) return;
    if (c.dataset.y) { const ok = c.dataset.y === "ok" && onOk ? onOk() : null; $("sh").innerHTML = ""; if (c.dataset.y === "ok" && ok !== false) upd(); return; }
    if (c.dataset.z) { const g = $("gv"); g.textContent = Math.max(1, Math.min(12, +g.textContent + +c.dataset.z)); return; }
    if (c.dataset.k && pickN) { // put the missing name into the cells tapped (a second tap undoes it)
      const day = D.week[c.dataset.k] || [], e = day[c.dataset.p], at = c.dataset.k + "," + c.dataset.p;
      if (!e || e.groups) return;
      if (at in pickWas) { day[c.dataset.p] = pickWas[at]; delete pickWas[at]; } // a second tap: back as it was
      else if (e.name !== pickN) {
        pickWas[at] = JSON.parse(JSON.stringify(e));
        const was = Object.values(P.old || {}).flat().filter(x => x && x.name === pickN); // red if it always was
        day[c.dataset.p] = Object.assign({ name: pickN }, e.room ? { room: e.room } : {}, was.length && was.every(x => x.important) ? { important: true } : {});
      }
      return upd();
    }
    if (c.dataset.k) return cellSheet(+c.dataset.k, +c.dataset.p);
    if (c.dataset.s) return subjSheet(c.dataset.s);
    if (c.dataset.h) return go("undo", { f: c.dataset.h });
    if (c.parentNode.dataset.g) {
      const gs = meta().groups = Object.assign({}, picks(), { [c.parentNode.dataset.g]: +c.dataset.i });
      c.parentNode.querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.i === gs[c.parentNode.dataset.g]));
      if (!c.closest("#sh")) upd();
      return;
    }
    if (c.closest("#sh .seg")) { c.parentNode.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === c)); return; }
    const x = c.dataset.x;
    if (x === "edit") return open();
    if (x === "imp") { const w = c.parentNode.nextElementSibling; w.hidden = !w.hidden; return; }
    if (x === "menu") { body.classList.remove("done"); return; }
    if (["prompt", "paste", "file", "names", "later", "export"].includes(x)) return go(x);
    if (x === "pick") { pickN = c.dataset.n; draw(); return scrollTo(0, 0); }
    if (x === "pickDone") { pickN = null; return draw(); }
    if (x === "drop") { skip.add(c.dataset.n); return draw(); }
    if (x === "share") return sheet(E.share, `<p class="lead">${E.shareLead}</p><div class="card shw"><b>${E.shareWhat}</b>${E.shareYes.map(y => `<p>✓ ${y}</p>`).join("")}<p class="no">✕ ${E.shareNo}</p></div><div class="btns col"><button class="btn main" data-x="link">${E.sendLink}</button><button class="btn" data-x="qr">${E.showQR}</button><button class="btn" data-x="export">${E.saveFile}</button></div><p class="hint">${E.shareHint}</p>`, null, null, E.close);
    if (x === "link") return shareLink().then(u => go("share", { u }));
    if (x === "qr") return shareLink().then(u => {
      const svg = u.length <= 2000 && qrSvg(u), w = P.sh.week, n = Object.keys(w).filter(k => (w[k] || []).some(e => e.name || e.groups)).length;
      sheet(E.qrTitle, `<p class="lead">${E.qrLead}</p>${svg || `<p class="note2">${E.qrBig}</p>`}<p class="hint" style="text-align:center">${h((P.sh.meta.class ? P.sh.meta.class + " · " : "") + F(E.daysN, n, P.sh.bells.length))}</p>`, null, null, E.close);
    });
    if (x === "cancel") { if (P.mode === "import") return go("cancel"); body.classList.remove("ed"); $("sh").innerHTML = ""; return; }
    if (x === "save") return save();
    if (x === "undo") return sheet(E.undo, `<p class="lead">${E.undoLead}</p><div class="card">${P.hist.map(r => row(`data-h="${h(r.f)}"`, h(r.t), "")).join("")}</div>`);
    if (x === "bell") { D.bells.pop(); Object.values(D.week).forEach(day => { if (day.length > D.bells.length) day.length = D.bells.length; }); return upd(); }
    if (x === "addBell") {
      const [a, b] = D.bells[D.bells.length - 1].map(s => +s.slice(0, 2) * 60 + +s.slice(3)), m = v => String(Math.floor(v / 60) % 24).padStart(2, "0") + ":" + String(v % 60).padStart(2, "0");
      D.bells.push([m(b + 10), m(b + 10 + (b - a))]); return upd();
    }
    if (x === "off") { D.daysOff.splice(+c.dataset.i, 1); return upd(); }
    if (x === "addOff") return sheet(E.addOffTitle, `<div class="card in">${field("fa", E.from, "", "date")}${field("fb", E.to, "", "date")}${field("fn", E.name, "")}</div>`, () => {
      const a = val("fa"), b = val("fb"), n = val("fn");
      if (!a) return false;
      const e = [a].concat(b > a ? [b] : [], n ? [n] : []);
      D.daysOff = (D.daysOff || []).concat([e.length === 1 ? a : e]);
    });
  });
  document.addEventListener("change", ev => {
    const t = ev.target;
    if (t.id === "cz") { $("cf").hidden = t.checked; return; }
    if (!t.closest("#ed")) return;
    if (t.dataset.b) { const [i, j] = t.dataset.b.split(","); D.bells[i][j] = t.value; }
    else if (t.id === "grade") { const g = parseInt(t.value, 10); if (g >= 1 && g <= 12) meta().grade = g; else delete meta().grade; }
    else if (t.id === "last") { if (!t.value || t.value === lastDef()) delete D.lastDay; else D.lastDay = t.value; }
    else if (/^o\d+$/.test(t.id)) {
      const o = P.hol[+t.id.slice(1)], ds = dates(o.a, o.b), no = (D.notOff || []).filter(x => !ds.includes(x));
      D.notOff = t.checked ? no.concat(ds).sort() : no;
      if (!D.notOff.length) delete D.notOff;
    } else return;
    upd();
  });
  if (P.mode === "import") open();
  if (P.msg) say(P.msg);
}
function settingsPane() {
  const X = L.set; // the Settings page's strings
  const name = esc(Script.name());
  const sw = (id, label, hint) => `<label class="sw"><span>${label}${hint ? `<small>${hint}</small>` : ""}</span><input type="checkbox" id="${id}"></label>`;
  const steps = arr => `<ol>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ol>`;
  return `
  <p class="note">${X.applyNote}</p>
  ${PARAM ? `<p class="note warn">${esc(X.paramNote(PARAM))}</p>` : ""}
  <h3>${X.language}</h3>
  <div class="card"><div class="seg" id="language"><button data-v="bg">Български</button><button data-v="en">English</button></div>
  <p class="hint" id="langNote" hidden>${X.langNote}</p></div>
  <h3>${X.theme}</h3>
  <div class="card"><div class="seg" id="theme"><button data-v="auto">${X.themeAuto}</button><button data-v="dark">${X.themeDark}</button><button data-v="light">${X.themeLight}</button></div>
  <p class="hint">${X.themeHint}</p></div>
  <h3>${X.daysOff}</h3>
  <div class="card">
    <label class="field"><span>${X.calendar}</span><input id="offCalendar" placeholder="Off-School" autocapitalize="off" autocorrect="off"></label>
    ${sw("showReason", X.reason, X.reasonHint)}
    ${sw("countdown", X.countdown, X.countdownHint)}
  </div>
  <h3>${X.tests}</h3>
  <div class="card">
    <label class="field"><span>${X.calendar}</span><input id="testsCalendar" placeholder="${X.off}" autocapitalize="off" autocorrect="off"></label>
    <p class="hint">${X.testsHint}</p>
  </div>
  <h3>${X.remind}</h3>
  <div class="card"><div class="seg" id="remindMinutes">${[0, 3, 5, 10, 15].map(m => `<button data-v="${m}">${m ? `${m} ${L.min}` : X.off}</button>`).join("")}</div>
  <p class="hint">${X.remindHint}</p></div>
  <h3>${X.widget}</h3>
  <div class="card">${sw("tapView", X.tap, X.tapHint)}</div>
  <h3>${X.links}</h3>
  <div class="card">
    ${sw("linkColors", X.linkColors, X.linkColorsHint)}
    <div id="linkOutlinesRow">${sw("linkOutlines", X.linkOutlines, X.linkOutlinesHint)}</div>
    <label class="field"><span>${X.linkBox}</span></label>
    <div class="seg" id="linkBox"><button data-v="row">${X.boxRow}</button><button data-v="room">${X.boxRoom}</button></div>
    <p class="hint">${X.linkHint}</p>
  </div>
  <h3 id="verh">${X.v.title}</h3>
  <div class="card" id="ver">${versionCard()}</div>
  <h3>${X.howTo}</h3>
  <details class="card"><summary>${X.home}</summary>${steps(X.homeSteps(Script.name()))}</details>
  <details class="card"><summary>${X.lock}</summary>${steps(X.lockSteps(Script.name()))}<p class="hint">${esc(X.lockTip)}</p></details>
  <div id="toast">${X.saved}</div>`;
}
function buildHTML(s, tab, jump, ed = {}) {
  const now = s.now, E = L.ed;
  // upcoming rings and the lines between them: solid, as on the widgets (finished rows are dimmed)
  const GREY = "#8e8e93", GREEN = "#30d158", RED = "#ff453a";
  // Rows: ring with the period number, like the widget (green = now, red = important).
  // Links (v1.3): a line between the rings of back-to-back classes in the same room, as on the
  // widgets: solid for the same class, dashed for only the same room. ln: { up, down } pieces.
  // a link's colour over the classes ls: green next to the class now, red if all are important
  const linkCss = (ls, on, live = true) => !on ? GREY : ls.some(x => live && x.start <= now && now < x.end) ? GREEN
    : ls.every(x => x.hot) ? RED : GREY;
  // Finished rows are dimmed by mixing their colours with the page (--bg, opaque), not with
  // opacity: a see-through ring let the line show through, and a line half in a dimmed row
  // came out in two shades.
  const dim = c => `color-mix(in srgb, ${c} 40%, var(--bg))`;
  const TRACK = "color-mix(in srgb, #8e8e93 30%, var(--bg))"; // as rgba(142,142,147,.3), but opaque so the line can pass under it
  const lessonRow = (l, showProgress, ln = {}) => {
    const past = showProgress && l.end <= now, cur = showProgress && l.start <= now && now < l.end;
    const piece = (x, where) => x ? `<i class="lk ${where} ${x.kind}" style="--c:${x.color}"></i>` : "";
    const p = cur ? (now - l.start) / (l.end - l.start) : 1;
    const color = cur ? GREEN : l.hot ? RED : GREY;
    return `<div class="row ${past ? "past" : ""} ${cur ? "cur" : ""}">${piece(ln.up, "up")}${piece(ln.down, "down")}
      ${past ? svgRing(42, 5, p, dim(color), String(l.num), 17, dim(TRACK), dim("var(--fg)")) : svgRing(42, 5, p, color, String(l.num), 17, TRACK)}
      <div class="mid"><div class="nm ${l.hot ? "hot" : ""}">${esc(l.name)}${l.test ? ` <span class="tag">${esc(l.test)}</span>` : ""}</div>
      <div class="sub">${hm(l.start)}–${hm(l.end)}${cur ? ` · ${L.minLeft(minsBetween(now, l.end))}` : ""}</div></div>
      <div class="room">${esc(roomLabel(l.room))}</div></div>`;
  };
  // Top card: the same as the large widget's first section.
  const hero = () => {
    if (s.mode === "vacation") return `<div class="hero"><div class="emoji">☀️</div><div class="hmid"><div class="hname">${L.vacation}</div><div class="hsub">${L.enjoy}</div></div></div>`;
    const f = focus(s), l = f.l;
    const ringColor = f.isClass ? GREEN : l.hot ? RED : GREY;
    const p = f.live ? s.progress : 1;
    let mid;
    if (f.live) {
      const big = f.isClass ? `${s.minsLeft}<span>${L.min}</span>`
        : s.minsTo <= 60 ? `<span class="pre">${L.inWord}</span>${s.minsTo}<span>${L.min}</span>`
        : f.time;
      mid = `<div class="hname ${l.hot ? "hot" : ""}">${esc(l.short)}</div><div class="hbig">${big}</div><div class="hsub ${l.test ? "hot" : ""}">${esc(f.sub)}</div>`;
    } else {
      const em = s.mode === "off" ? holidayEmoji(offReason(s)) : "";
      const tomorrow = f.day === L.tomorrow;
      mid = `<div class="hsub">${em ? em + " " : ""}${esc(f.status)}</div><div class="hname ${l.hot ? "hot" : ""}">${esc(l.short)}</div>` +
        (tomorrow ? `<div class="hbig">${f.time}<span>${esc(f.day)}</span></div>` : `<div class="hbig">${f.time}</div><div class="hday">${esc(f.day)}</div>`);
    }
    const label = l.test ? `<small class="hot">${L.test}</small>` : `<small>${isNumRoom(l.room) ? L.roomWord : "&nbsp;"}</small>`;
    return `<div class="hero">${svgRing(76, 9, p, ringColor, String(l.num), 32)}<div class="hmid">${mid}</div><div class="hroom">${label}<b>${esc(l.room)}</b></div></div>`;
  };
  const dayList = (ls, showProgress) => {
    const links = dayLinks(ls);
    const done = x => showProgress && x.end <= now; // a line between two finished classes is dimmed like them
    const pc = (i, kind) => {
      if (!kind) return null;
      const c = linkCss([ls[i], ls[i + 1]], S.linkColors, showProgress);
      return { kind, color: done(ls[i]) && done(ls[i + 1]) ? dim(c) : c };
    };
    return ls.map((l, i) => lessonRow(l, showProgress, { up: i ? pc(i - 1, links[i - 1]) : null, down: pc(i, links[i]) })).join("");
  };
  // Today: today's classes while school is on; after the last bell and on days off, only the next school day's
  // the demo's welcome card (1.6.0) and the import buttons, also on the Week tab
  const impBtns = `<div class="btns" hidden><button class="btn" data-x="paste">${E.paste}</button><button class="btn" data-x="file">${E.file}</button></div>`;
  // a card with a main button and Внеси програма (the demo's welcome, the new school year's)
  const wcard = (t, lead, x, b, tail) => `<div class="card wc"><div class="wt1">${t}</div><p class="lead">${lead}</p><div class="btns col"><button class="btn main" data-x="${x}">${b}</button><button class="btn" data-x="imp">${E.importBtn}</button></div>${impBtns}${tail}</div>`;
  let today = (isDemo() ? wcard(E.welcome, E.welcomeLead, "prompt", E.copyPrompt, `<p class="hint">${E.welcomeHint}</p>`) : "") + hero();
  if (s.mode === "class" || s.mode === "break") today += `<h3>${L.tabToday}</h3>` + dayList(s.lessons, true);
  else if ((s.mode === "done" || s.mode === "off") && s.nextDay)
    today += `<h3>${esc(dayLabel(s.nextDay, s.today, false))}</h3>` + dayList(s.nextLessons, false);
  const cdToday = S.countdown ? countdown(s) : null;
  if (cdToday) today += `<p class="foot">${holidayEmoji(cdToday.reason) || "📅"} ${esc(L.countdown(cdToday.reason, cdToday.n))}</p>`;

  // Week: boxes around back-to-back classes in the same room, as in the medium lists (always the
  // whole cell). A solid box closes with rounded corners; a dashed one runs on straight past it.
  // They are placed on the grid with position:absolute, so they don't take part in its layout.
  const weekBoxes = (ls, col) => {
    const links = dayLinks(ls), out = [];
    for (let i = 0; i < ls.length;) {
      const run = runOf(links, i); i = run.b + 1;
      if (run.a === run.b) continue;
      for (const p of linkParts(links, run)) {
        const cls = p.solid ? "solid" : `dash${p.a > run.a ? " openT" : ""}${p.b < run.b ? " openB" : ""}`;
        const color = linkCss(ls.slice(p.a, p.b + 1), S.linkColors && S.linkOutlines);
        out.push(`<div class="wbox ${cls}" style="grid-column:${col + 2} / ${col + 3};grid-row:${ls[p.a].num + 1} / ${ls[p.b].num + 2};--c:${color}"></div>`);
      }
    }
    return out.join("");
  };
  // Week (on weekends: next week)
  let mon = addDays(s.today, 1 - (s.today.getDay() || 7));
  if (s.today.getDay() === 6 || s.today.getDay() === 0) mon = addDays(mon, 7);
  const days = [0, 1, 2, 3, 4].map(i => addDays(mon, i));
  const maxP = TT.bells.length;
  let grid = `<div class="grid"><div></div>` + days.map(d => `<div class="dh ${+d === +s.today ? "today" : ""}">${L.weekdaysShort[d.getDay()]}<span>${d.getDate()}.${pad(d.getMonth() + 1)}</span></div>`).join("");
  const st = days.map(dayStatus);
  for (let p = 1; p <= maxP; p++) {
    grid += `<div class="pn">${p}<span>${TT.bells[p - 1][0]}</span></div>`;
    days.forEach((d, i) => {
      if (!st[i].school) {
        grid += p === 1 ? `<div class="offcol" style="grid-row: span ${maxP}">${esc(st[i].reason || L.dayOff)}</div>` : "";
        return;
      }
      const l = lessonsFor(d).find(x => x.num === p);
      if (p === 1) grid += weekBoxes(lessonsFor(d), i);
      const cur = l && l.start <= now && now < l.end;
      const td = +d === +s.today ? "today" : "";
      grid += l ? `<div class="cell ${l.hot ? "hot" : ""} ${cur ? "cur" : ""} ${td}"><b>${esc(l.short)}</b><span>${esc([l.room, l.test ? L.testShort : ""].filter(Boolean).join(" · ")) || "&nbsp;"}</span></div>`
        : `<div class="cell empty ${td}"></div>`;
    });
  }
  grid += `</div>`;

  // Days off
  const keys = [...OFF.keys()].filter(k => k >= ymd(s.today) && k <= TT.lastDay).sort();
  const groups = [];
  for (const k of keys) {
    const g = groups[groups.length - 1];
    if (g && ymd(addDays(parseYmd(g.to), 1)) === k && OFF.get(k) === g.reason) g.to = k;
    else groups.push({ from: k, to: k, reason: OFF.get(k) });
  }
  const fmt = k => { const d = parseYmd(k); return `${d.getDate()} ${L.months[d.getMonth()]}`; };
  const cdc = countdown(s);
  const cd = cdc ? `<div class="cd"><div class="emoji">${holidayEmoji(cdc.reason) || "📅"}</div><div><div class="cdn">${cdc.n}<span>${cdc.n === 1 ? L.schoolDay1 : L.schoolDays}</span></div><div class="hsub">${esc(L.until(cdc.reason))}</div></div></div>` : "";
  const offList = groups.slice(0, 14).map(g => {
    const d = parseYmd(g.from);
    return `<div class="row"><div class="em">${holidayEmoji(g.reason) || "📅"}</div><div class="mid"><div class="nm">${esc(g.reason || L.dayOff)}</div><div class="sub">${g.from === g.to ? `${L.weekdaysShort[d.getDay()]}, ${fmt(g.from)}` : `${fmt(g.from)} – ${fmt(g.to)}`}</div></div></div>`;
  }).join("") || `<p class="sub">${L.noDaysOff}</p>`;

  const ol = a => `<div class="card"><ol>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>`;
  const done = ed.done ? `<div id="done"><div class="dn"><div class="big">✓</div><h1>${E.doneTitle}</h1><p class="lead">${E.doneLead}</p></div><h3>${L.set.home}</h3>${ol(L.set.homeSteps(Script.name()))}<h3>${L.set.lock}</h3>${ol(L.set.lockSteps(Script.name()))}<div class="btns"><button class="btn main" data-x="menu">${E.toMenu}</button></div></div>` : "";
  const tabs = [["t1", L.tabToday], ["t2", L.tabWeek], ["t3", L.tabOff], ["t4", L.tabSettings]];
  const on = tabs.some(t => t[0] === tab) ? tab : "t1";
  return `<!doctype html><html lang="${S.language}"><head><meta name="color-scheme" content="${S.theme === "dark" ? "dark" : S.theme === "light" ? "light" : "light dark"}"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
:root{color-scheme:dark;--bg:#000;--fg:#fff}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}[hidden]{display:none!important}
body{margin:0;background:#000;color:#fff;font:16px -apple-system,system-ui,sans-serif;padding:max(16px,env(safe-area-inset-top)) 16px 60px}
h1{font-size:30px;margin:6px 0 2px}h3{font-size:13px;text-transform:uppercase;letter-spacing:.03em;color:rgba(255,255,255,.55);margin:24px 4px 8px;font-weight:500}
.date0{color:rgba(255,255,255,.65);font-size:15px}
.tabs{display:flex;gap:4px;background:#1c1c1e;border-radius:10px;padding:3px;margin:16px 0;position:sticky;top:6px;z-index:2}
.tabs button{flex:1;border:0;border-radius:8px;padding:8px 2px;background:none;color:#fff;font:600 13.5px -apple-system}
.tabs button.on{background:#3a3a3c}
.pane{display:none}.pane.on{display:block}
.row{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08);position:relative}
.row.past .mid,.row.past .room{opacity:.4}.row.cur .nm{color:#30d158}
.row>svg{position:relative;z-index:1;flex:none}
.lk{position:absolute;z-index:0;left:18.5px;width:5px;background:var(--c)}
.lk.up{top:-1px;height:calc(50% - 17.5px)}.lk.down{top:calc(50% + 18.5px);bottom:-1px}
.lk.room{background:linear-gradient(var(--c) 0 3px,transparent 3px) 0 0/100% 5.5px repeat-y}
.lk.room.down{background-position:0 100%}.lk.room.up{background-position:0 1px}
.mid{flex:1;min-width:0}.nm{font-weight:600;font-size:16px}.nm.hot{color:#ff453a}
.sub{color:rgba(255,255,255,.65);font-size:13px}.room{color:rgba(255,255,255,.65);font-size:14px}
.tag{font-size:11px;background:#ff453a;color:#000;border-radius:5px;padding:1px 5px;vertical-align:2px}
.grid{display:grid;grid-template-columns:34px repeat(5,1fr);gap:4px;position:relative}
.wbox{position:absolute;inset:-1px;border:1.5px solid var(--c);border-radius:10px;pointer-events:none}
.wbox.dash{border-style:dashed}.wbox.openT{border-top:0;border-top-left-radius:0;border-top-right-radius:0;top:-12px}
.wbox.openB{border-bottom:0;border-bottom-left-radius:0;border-bottom-right-radius:0;bottom:-12px}
.dh{text-align:center;font-weight:600;font-size:14px;padding:4px 0;border-radius:8px}.dh span{display:block;font-size:11px;color:rgba(255,255,255,.5);font-weight:400}
.dh.today{background:#30d158;color:#000}.dh.today span{color:rgba(0,0,0,.6)}
.pn{font-size:13px;color:rgba(255,255,255,.65);text-align:center;padding-top:6px}.pn span{display:block;font-size:9px;opacity:.7}
.cell{background:#1c1c1e;border-radius:8px;padding:6px 4px;min-height:52px;text-align:center;font-size:11px;overflow:hidden}
.cell b{display:block;font-size:11.5px;font-weight:600;line-height:1.15;-webkit-hyphens:auto;hyphens:auto;overflow-wrap:anywhere}.cell span{color:rgba(255,255,255,.6)}
.cell.today{background:#2c2c2e}.cell.hot b{color:#ff453a}.cell.cur{outline:2px solid #30d158}.cell.empty{background:none}
.offcol{background:repeating-linear-gradient(135deg,#141414 0 8px,#1c1c1e 8px 16px);border-radius:8px;writing-mode:vertical-rl;text-align:center;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.6);font-size:13px}
.hero{display:flex;align-items:center;gap:14px;background:#1c1c1e;border-radius:22px;padding:16px;margin:4px 0 6px}
.hero svg{flex:none}.hmid{flex:1;min-width:0}.hname{font-size:20px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbig{font-size:40px;font-weight:600;line-height:1.05;letter-spacing:-.5px;white-space:nowrap}.hbig span{font-size:17px;color:rgba(255,255,255,.65);margin-left:4px;letter-spacing:0}
.hbig .pre{margin:0 5px 0 0}.hday{font-size:15px;font-weight:700;color:rgba(255,255,255,.65)}.hsub{font-size:13px;color:rgba(255,255,255,.65)}
.hroom{text-align:right;flex:none}.hroom small{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.65)}.hroom b{font-size:26px}
.hot{color:#ff453a!important}.emoji{font-size:44px;line-height:1;width:76px;text-align:center;flex:none}
.foot{color:rgba(255,255,255,.65);font-size:14px;margin:16px 2px}
.row .em{font-size:26px;width:42px;text-align:center;flex:none}
.cd{display:flex;align-items:center;gap:14px;background:#1c1c1e;border-radius:22px;padding:16px;margin:4px 0 14px}
.cd .emoji{font-size:40px;width:56px}.cdn{font-size:40px;font-weight:600;line-height:1.05}.cdn span{font-size:16px;font-weight:600;color:rgba(255,255,255,.65);margin-left:6px}
.card{background:#1c1c1e;border-radius:12px;padding:4px 14px;margin:0}
.sw,.field{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:50px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08)}
.card>:last-child{border-bottom:0}
.sw span,.field span{font-size:16px}.sw small{display:block;color:rgba(255,255,255,.5);font-size:12px;margin-top:2px}
.sw input{appearance:none;-webkit-appearance:none;width:51px;height:31px;border-radius:16px;background:#39393d;position:relative;flex:none;transition:.2s;margin:0}
.sw input::after{content:"";position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.sw input:checked{background:#30d158}.sw input:checked::after{left:22px}
.field input{flex:1;min-width:0;text-align:right;background:none;border:0;color:rgba(255,255,255,.75);font:16px -apple-system;outline:none}
.seg{display:flex;gap:3px;background:#2c2c2e;border-radius:9px;padding:2px;margin:10px 0}
.seg button{flex:1;border:0;border-radius:7px;padding:7px 2px;background:none;color:#fff;font:500 14px -apple-system}
.seg button.on{background:#636366}
.hint{color:rgba(255,255,255,.5);font-size:12.5px;margin:2px 0 10px;line-height:1.35}
.note{color:rgba(255,255,255,.6);font-size:13px;line-height:1.4;margin:0 4px 6px}.note.warn{color:#ffd60a}
details.card{margin-bottom:8px;padding:12px 14px}summary{font-weight:600;cursor:pointer}
ol{padding-left:20px;margin:10px 0 4px;line-height:1.45;font-size:14.5px;color:rgba(255,255,255,.85)}li{margin-bottom:6px}
#toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:#30d158;color:#000;font-weight:600;padding:8px 16px;border-radius:20px;opacity:0;transition:.25s;pointer-events:none}
#toast.show{opacity:1;transform:translate(-50%,0)}
.vline{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 8px;padding:12px 0 2px}.vnum{font:700 22px ui-rounded,-apple-system,sans-serif}.vok{color:#30d158;font-weight:600;font-size:15px}.vnew,.vwarn{color:#ffd60a;font-weight:600;font-size:15px}
.vwarn{font-weight:400;font-size:13.5px;line-height:1.4;margin:10px 0 0}.vdone{background:rgba(48,209,88,.15);border-radius:9px;padding:9px 11px;margin:10px 0 4px;font-size:14px}.vmsg{font-size:13.5px;line-height:1.4;margin:0 0 12px}
.vnotes{font-size:13.5px;line-height:1.4;color:rgba(255,255,255,.75);margin:4px 0 8px}.vnotes summary{color:#0a84ff;font-size:14px}
.lead{font-size:15px;line-height:1.4;color:rgba(255,255,255,.75);margin:2px 2px 12px}.wc{padding:4px 14px 2px;margin-bottom:12px}.wt1{font-size:17px;font-weight:700;margin:10px 0 4px}.wc .lead{margin:0 0 4px}.btns.col{flex-direction:column}
.sum{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.chip{font-size:13px;font-weight:600;border-radius:12px;padding:4px 10px;background:#2c2c2e}.chip.w{background:rgba(255,214,10,.18);color:#ffd60a}.chip.ok{background:rgba(48,209,88,.18);color:#30d158}.chip.e{background:rgba(255,69,58,.18);color:#ff453a}
.cell.w,.cell.e{outline:2px solid #ffd60a;position:relative;overflow:visible}.cell.e{outline-color:#ff453a}
.cell.w::after,.cell.e::after{content:"!";position:absolute;top:-7px;right:-5px;width:16px;height:16px;border-radius:8px;background:#ffd60a;color:#000;font:800 11px/16px sans-serif;text-align:center}.cell.e::after{background:#ff453a;color:#fff}
.ec.empty{outline:1px dashed rgba(142,142,147,.35)}.cell.free b{color:rgba(255,255,255,.4);font-weight:500}
.wl{margin:12px 0 0}.wl li{font-size:13.5px;margin-bottom:5px;color:#ffd60a}.wl li.e,.wt.e{color:#ff453a}.wt{color:#ffd60a!important}
.bar{position:sticky;bottom:0;display:flex;gap:8px;padding:12px 0 22px;margin-top:12px;background:linear-gradient(transparent,#000 30%);z-index:3}
.dim{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:5}
.sheet{position:fixed;left:0;right:0;bottom:0;max-height:88vh;overflow:auto;background:#1c1c1e;border-radius:14px 14px 0 0;padding:8px 16px 26px;box-shadow:0 -8px 30px rgba(0,0,0,.6);z-index:6}
.grab{width:36px;height:5px;border-radius:3px;background:#48484a;margin:0 auto 10px}.sheet h2{font-size:17px;margin:0 0 4px;text-align:center}.card.in{background:none;padding:0}
#ed .field input,.sheet .field input,.bell input{color:#0a84ff;background:none;border:0;font:16px -apple-system,sans-serif;min-width:0}
.cell.n{outline:2px solid #0a84ff}.chg{padding:8px 14px}.chg p{font-size:14px;margin:4px 0}.chg s{text-decoration:none;opacity:.5}
.note2{font-size:13.5px;line-height:1.4;border-radius:12px;padding:10px 12px;background:rgba(255,214,10,.14);color:#ffd60a;margin:0 0 10px}.note2 u{white-space:nowrap}.pk{position:sticky;top:6px;z-index:4;display:flex;align-items:center;gap:10px;background:#3a3214}.pk .btn{flex:0 0 auto;padding:8px 14px}
.step{display:flex;align-items:center;justify-content:center;gap:22px;margin:10px 0 16px}.step .btn{flex:0 0 52px;font-size:22px}.step b{font-size:40px;min-width:70px;text-align:center}
svg.qr{display:block;width:100%;max-width:300px;margin:6px auto 10px;border-radius:10px}.shw{padding:10px 14px}.shw p{margin:6px 0;font-size:15px}.shw .no{opacity:.6}
.gp{background:#1c1c1e;border-radius:12px;padding:12px 14px;margin:0 0 10px}.gp p{margin:0 0 8px;font-size:13.5px;color:rgba(255,255,255,.6)}.gp .seg{margin:0}
.subj{display:flex;align-items:center;gap:10px;min-height:50px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.08)}.subj>div{flex:1;min-width:0}.subj b{font-size:16px;font-weight:500}.subj small{display:block;color:rgba(255,255,255,.5);font-size:12.5px}.subj .go{color:rgba(255,255,255,.3);font-size:20px}
.bell{display:flex;align-items:center;gap:8px;min-height:44px;border-bottom:1px solid rgba(255,255,255,.08);font-size:16px}.bell .n{width:22px;color:rgba(255,255,255,.5)}.bell .t2{flex:1}.bell .x{margin-left:auto;color:#ff453a;font-size:22px;padding:0 4px}.bell.add{color:#0a84ff}
#say{position:fixed;left:16px;right:16px;bottom:90px;background:#2c2c2e;border-radius:12px;padding:12px 14px;font-size:14.5px;line-height:1.35;z-index:7;box-shadow:0 6px 24px rgba(0,0,0,.5)}#say .btn{display:block;width:100%;margin-top:10px}
#ed,#done{display:none}body.ed #ed,body.done #done{display:block}.dn{text-align:center;margin-top:30px}.dn h1{margin:6px 0}.big{font-size:34px;line-height:1;margin:6px 0 4px}
body.ed>.date0,body.ed>h1,body.ed>.tabs,body.ed .pane:not(#t2),body.ed #t2>:not(#ed),body.done>:not(#done):not(#sh):not(#say){display:none!important}body.ed #t2{display:block}
.btns{display:flex;gap:8px;margin:8px 0 12px}.btn{flex:1;border:0;border-radius:9px;padding:10px 4px;background:#2c2c2e;color:#fff;font:600 15px -apple-system,sans-serif}.btn.main{background:#30d158;color:#000}
${S.theme === "dark" ? "" : `@media ${S.theme === "light" ? "all" : "(prefers-color-scheme: light)"}{
:root{color-scheme:light;--bg:#f2f2f7;--fg:#000}body{background:#f2f2f7;color:#000}
.date0,.sub,.room,h3,.pn,.hint,.note,.sw small,.field input,.dh span,.cell span,.offcol{color:rgba(60,60,67,.6)}
.tabs,.card,.cd,.cell,.hero{background:#fff}.hbig span,.cdn span,.hroom small,.hsub,.foot,.hday{color:rgba(60,60,67,.6)}.tabs button,.seg button{color:#000}.tabs button.on{background:#e5e5ea}
.row,.sw,.field{border-color:rgba(0,0,0,.08)}.cell.today{background:#e8f8ec}
.seg{background:#e5e5ea}.seg button.on{background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.sw input{background:#e9e9eb}ol{color:rgba(0,0,0,.85)}.note.warn{color:#b25000}
.btn{background:#e5e5ea;color:#000}.btn.main{background:#34c759;color:#fff}.vnotes{color:rgba(0,0,0,.75)}.vwarn,.vnew{color:#b25000}.vok{color:#248a3d}
.offcol{background:repeating-linear-gradient(135deg,#e5e5ea 0 8px,#f2f2f7 8px 16px)}
.note2{color:#8a5a00}.pk{background:#fbf1d0}.lead,.gp p{color:rgba(60,60,67,.75)}.chip{background:#e5e5ea}.chip.w,.wl li,.wt{color:#a05a00!important}.cell.w{outline-color:#ff9f0a}.cell.w::after{background:#ff9f0a;color:#fff}.cell.free b,.subj .go{color:rgba(60,60,67,.4)}
.bar{background:linear-gradient(rgba(242,242,247,0),#f2f2f7 30%)}.sheet,.gp,#say{background:#fff}.subj,.bell{border-color:rgba(0,0,0,.08)}.subj small,.bell .n{color:rgba(60,60,67,.6)}.grab{background:#d1d1d6}}`}
</style></head><body class="${ed.mode === "import" ? "ed" : ed.done ? "done" : ""}">
${done}<div id="sh"></div><div id="say" hidden></div>
<div class="date0">${cap(L.weekdays[now.getDay()])}, ${now.getDate()} ${L.monthsFull[now.getMonth()]}</div>
<h1>${L.title}</h1>
<div class="tabs">${tabs.map(t => `<button class="${t[0] === on ? "on" : ""}" data-t="${t[0]}">${t[1]}</button>`).join("")}</div>
<div class="pane ${on === "t1" ? "on" : ""}" id="t1">${today}</div>
<div class="pane ${on === "t2" ? "on" : ""}" id="t2">${newYearDue() ? wcard(E.newYear, E.newYearLead, "names", E.copyNames, `<div class="btns"><button class="btn" data-x="later">${E.later}</button></div>`) : ""}<div class="btns"><button class="btn" data-x="edit">${E.edit}</button><button class="btn" data-x="imp">${E.importBtn}</button></div>${impBtns}${ownTT() ? `<div class="btns"><button class="btn" data-x="share">${E.share}</button></div>` : ""}${grid}<div id="ed"></div></div>
<div class="pane ${on === "t3" ? "on" : ""}" id="t3">${cd}${offList}</div>
<div class="pane ${on === "t4" ? "on" : ""}" id="t4">${settingsPane()}</div>
<script>
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button,.pane').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.getElementById(b.dataset.t).classList.add('on');scrollTo(0,0)});
// Settings: every change is sent to Scriptable straight away (it intercepts this link).
var ST=${jsonIn(SAVED)};
var LANG0=ST.language;
function send(){location.href='uchilishte://save?d='+encodeURIComponent(JSON.stringify(ST));var t=document.getElementById('toast');t.classList.add('show');clearTimeout(window._t);window._t=setTimeout(function(){t.classList.remove('show')},1200)}
function outl(){document.getElementById('linkOutlinesRow').hidden=!ST.linkColors}outl();
['showReason','countdown','tapView','linkColors','linkOutlines'].forEach(function(k){var el=document.getElementById(k);el.checked=!!ST[k];el.onchange=function(){ST[k]=el.checked;outl();send()}});
['offCalendar','testsCalendar'].forEach(function(k){var el=document.getElementById(k);el.value=ST[k]||'';el.oninput=function(){ST[k]=el.value.trim()};el.onchange=function(){ST[k]=el.value.trim();if(k==='offCalendar'&&!ST[k]){ST[k]='Off-School';el.value=ST[k]}send()};el.onkeydown=function(e){if(e.key==='Enter')el.blur()}});
['language','remindMinutes','theme','linkBox'].forEach(function(k){var box=document.getElementById(k);var mark=function(){box.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',String(ST[k])===b.dataset.v)})};mark();box.querySelectorAll('button').forEach(function(b){b.onclick=function(){ST[k]=k==='remindMinutes'?Number(b.dataset.v):b.dataset.v;mark();if(k==='language')document.getElementById('langNote').hidden=(ST.language===LANG0);send()}})});
var ver=document.getElementById('ver'),taps=0,tt=0;
function act(a,v){location.href='uchilishte://update?a='+a+(v?'&v='+v:'')}
function bindVer(){var au=document.getElementById('autoUpdate');au.checked=ST.autoUpdate!==false;au.onchange=function(){ST.autoUpdate=au.checked;send()};
document.querySelectorAll('#channel button').forEach(function(b){b.classList.toggle('on',(ST.channel||'stable')===b.dataset.v);b.onclick=function(){if((ST.channel||'stable')===b.dataset.v)return;ST.channel=b.dataset.v;bindVer();act('channel',b.dataset.v)}})}
function setVer(h){ver.innerHTML=h;bindVer()}
ver.onclick=function(e){var b=e.target.closest('[data-a]');if(b){if(b.dataset.a==='previous'&&!b.dataset.sure){b.dataset.sure=1;b.textContent=${JSON.stringify(L.set.v.sure)};return}b.textContent=${JSON.stringify(L.set.v.working)};act(b.dataset.a)}
if(e.target.id==='vnum'){var n=Date.now();taps=n-tt<1500?taps+1:1;tt=n;if(taps>=5)document.getElementById('chan').hidden=false}};
(${edPage})(${jsonIn(editorPayload(ed))}, ${jsonIn(Object.assign({ lang: S.language, months: L.months, wd: [""].concat(L.weekdaysShort.slice(1)), wdFull: [""].concat(L.weekdays.slice(1).map(cap)) }, E))});
bindVer();if(${JSON.stringify(jump || "")}==='ver')document.getElementById('verh').scrollIntoView();
</script>
</body></html>`;
}
// Shows the full-screen view. Returns true if settings or the timetable were changed.
// ed: { mode: "import", d } opens the editor on an imported timetable; { done } the "Готово" screen.
async function showView(s, tab, jump, ed) {
  const wv = new WebView();
  let changed = false, busy = Promise.resolve();
  const apply = d => { saveSettings(cleanSettings(d)); changed = true; };
  wv.shouldAllowRequest = req => {
    const u = String((req && req.url) || "");
    // a button in Settings → Версия: run it, then redraw only that card (the page keeps its place)
    const m = u.match(/^uchilishte:\/\/update\?a=(\w+)(?:&v=(\w+))?/);
    if (m) {
      busy = busy.then(async () => {
        let msg;
        try { msg = await versionAction(m[1], m[2]); } catch (e) { msg = String(e.message || e); }
        if (m[1] === "channel") changed = true;
        await wv.evaluateJavaScript(`setVer(${JSON.stringify(versionCard(msg))})`);
      }).catch(e => console.error("Version: " + e));
      return false;
    }
    // the timetable editor and the welcome card (uchilishte://data?a=…)
    if (u.startsWith("uchilishte://data?")) {
      const q = {};
      for (const kv of u.slice(18).split("&")) { const i = kv.indexOf("="); q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); }
      busy = busy.then(() => dataAction(q, wv, () => { changed = true; })).catch(e => console.error("Timetable: " + e));
      return false;
    }
    if (u.startsWith("uchilishte://")) {
      try { apply(JSON.parse(decodeURIComponent(u.split("?d=")[1] || ""))); } catch (e) { console.error("Settings page: " + e); }
      return false;
    }
    return true;
  };
  await wv.loadHTML(buildHTML(s, tab, jump, ed));
  await wv.present(true);
  await busy;
  clearNotices();
  // Backup: read the page's values once more after it's closed (e.g. a text field still being edited).
  try {
    const timeout = new Promise(r => Timer.schedule(1500, false, () => r(null)));
    const v = await Promise.race([wv.evaluateJavaScript("JSON.stringify(ST)"), timeout]);
    if (v && v !== JSON.stringify(SAVED)) apply(JSON.parse(v));
  } catch (e) { /* page already gone, nothing to do */ }
  if (changed) {
    await reload();
    await syncRemindersSafe();
  }
  return changed;
}

// ════════════════════════ MENU WHEN RUN IN SCRIPTABLE ════════════════════════
async function appMenu() {
  for (;;) {
    const s = computeState(NOW);
    const status = s.mode === "class" ? `${L.now}: ${[s.current.name, roomLabel(s.current.room), L.minLeft(s.minsLeft)].filter(Boolean).join(" · ")}`
      : s.mode === "break" ? `${L.next}: ${[s.next.name, roomLabel(s.next.room), startsIn(s)].filter(Boolean).join(" · ")}`
      : s.mode === "vacation" ? L.vacation : `${offTitle(s)}${offReason(s) ? " · " + offReason(s) : ""}`;
    const a = new Alert();
    a.title = L.menuTitle;
    // once after an update or a rollback, and while an update is waiting
    const st = readState(), V = L.set.v;
    const vnote = st.justUpdated === VERSION ? `✓ ${V.updated(VERSION)}` : st.rolledBack ? V.rolledBack(st.rolledBack.from, st.rolledBack.to) : updateAvailable(st) ? V.available(st.latest) : "";
    a.message = status + (vnote ? "\n" + vnote : "");
    const acts = [
      [L.menuTimetable, () => showView(s, "t1")],
      [L.menuSettings, () => showView(s, "t4")],
      [L.menuUpdates, () => showView(s, "t4", "ver")],
      [L.menuImport, menuImport],
      [L.menuMedium, () => buildWidget("medium", s).presentMedium()],
      [L.menuSmall, () => buildWidget("small", s).presentSmall()],
      [L.menuLarge, () => buildWidget("large", s).presentLarge()]
    ];
    const probe = new ListWidget();
    if (typeof probe.presentAccessoryRectangular === "function") {
      acts.push([L.menuRect, () => buildWidget("accessoryRectangular", s).presentAccessoryRectangular()]);
      acts.push([L.menuCirc, () => buildWidget("accessoryCircular", s).presentAccessoryCircular()]);
      acts.push([L.menuInline, () => buildWidget("accessoryInline", s).presentAccessoryInline()]);
    }
    acts.forEach(x => a.addAction(x[0]));
    a.addCancelAction(L.close);
    const i = await a.presentSheet();
    if (i < 0) return;
    await acts[i][1]();
  }
}

// ════════════════════════ START ════════════════════════
async function reload() {
  Object.assign(SAVED, loadSaved());
  Object.assign(S, SAVED, parseParam(PARAM));
  L = STRINGS[S.language] || STRINGS.bg;
  C = makeColors(S.theme);
  OFF.clear(); TESTS.clear(); LCACHE.clear();
  loadTimetable();
  await loadData();
}

async function main() {
  loadTimetable();
  if (!config.runsInWidget) await timetableQuestions();
  await loadData(); // the first run in Scriptable asks for calendar access here
  if (config.runsInWidget) {
    Script.setWidget(buildWidget(config.widgetFamily || "medium", computeState(NOW)));
    confirmVersion();
    await syncRemindersSafe();
    await updateTick(8); // after the widget is set, so a slow network never delays it
    return;
  }
  confirmVersion();
  await updateTick(8);
  // a timetable to import: from a link (?data=…) or the import file next to the script (1.6.0)
  const q = args.queryParameters || {}, file = q.data ? null : await readImportFile();
  if (q.data || file) await startImport(q.data || file, !q.data);
  if (q.view) {
    await showView(computeState(NOW), args.queryParameters.tab || "t1"); // opened by tapping the widget
  } else {
    await syncRemindersSafe();
    await appMenu();
  }
}

// For the tests in tools/ (undefined in Scriptable, so this does nothing there).
if (typeof __TEST__ === "function") __TEST__({ validateData, migrate, parseImport, resolveGroups, fingerprint, inflateRaw, b64decode, b64urlencode,
  utf8encode, utf8decode, cmpVersion, checkForUpdate, installUpdate, updateTick, previousVersion, resumeUpdates, switchChannel, readState, codeSize, loadTimetable, saveTimetable, lastDayFor, nameSpots, emWidth, fitSize, VERSION, SCHEMA, HOLIDAYS, DATA, OFF, TINFO, tt: () => TT, ttFull: () => TT_FULL });

try { await main(); }
catch (e) {
  console.error(e);
  await rollbackIfNew(e); // a new version failing on its first run goes back by itself
  if (config.runsInWidget) Script.setWidget(errorWidget(e));
  else throw e;
}
Script.complete();
