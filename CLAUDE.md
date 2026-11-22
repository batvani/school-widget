# CLAUDE.md

Notes for continuing this project in Claude Code. Read this first, then `README.md` (what the user sees) and `TODO.md` (what's left).

**This repo is public** (`batvani/school-widget`, MIT). Nothing personal goes into it: no real names, emails, classes, the user's own subjects or timetable, local paths or LAN addresses. `npm test` includes `tools/test/privacy.test.js`, which checks every file against a private word list outside the repo (`~/.config/school-widget/private-words.txt`; on GitHub the secret `PRIVATE_WORDS`). Facts about the user and their phone live in Claude's memory, not here. Fixtures and examples are made-up timetables.

## What it is

- **`school-widget.js`:** the whole product, one Scriptable script ("School Widget"; its menu and widget text are Bulgarian by default, English is a setting). Version on line 4 and in `const VERSION` (~line 209; there is no VERSION file); line 5 is the id line (`// id: uchilishte-widget; schema: N`, must match `const SCHEMA`), which the self-update checks.
- **Timetable:** kept in Scriptable's documents folder (`uchilishte/data.json`, `state.json`, `history/`), never in the code. The built-in `DATA` is a made-up demo (class 10а, `meta.demo`), never adopted. **Code reads `TT`** (groups resolved, `lastDay` filled in), `TT_FULL` is the saved form; `DATA` only for adoption and the `holidayIcons` fallback.
- **Getting a timetable in:** photo → an AI app with `ai/START.md`'s prompt (it reads `ai/INSTRUCTIONS.md`) → a link to the install page (`install/`, on GitHub Pages) → the Shortcut "School Widget Installer" (`shortcut/STEPS.md`; ends with Scriptable's Run Script, no URL actions) or the menu's **Внеси програма**. The editor (Програма → Промени програмата) fixes it on the phone.
- **Important classes (red) are personal** (the person's own reminder): the AI asks about them only for the person's own timetable, and sharing strips every `important` and the group picks.
- **Self-update** (SELF-UPDATE section): once a day, after `Script.setWidget` (8 s timeout; offline is silent and doesn't count as the day's check). Stable = GitHub's latest release, beta (`S.channel`) = the newest release including pre-releases (the API list). Downloads come from `releases/download/v<version>/`, and are checked (id line, version, size, fingerprint, compiles) before the file is replaced; 3 backups, rollback by itself. **Edited by hand** = this file's fingerprint is neither its own release's (looked up once per version, `st.ownRelease`) nor the latest's: auto-update pauses.
- **GitHub Pages** (`batvani.github.io/school-widget/`, `.github/workflows/pages.yml`): `install/`, `ai/` and the latest stable release's `school-widget.js`. The install script, the Shortcut, the prompt and Safari use these addresses.
- **Size budget:** about 250 kB for the script (244 kB at 1.8.0). Keep new UI compact.

## Releases

1. Bump line 4 and `const VERSION` (and line 5 + `const SCHEMA` if the timetable format changed); add `## X.Y.Z — <date>` to `CHANGELOG.md` with a `Накратко:` line and an `In short:` line (they become the release notes and the update card's text; `tools/release.js` refuses without them).
2. `npm test`, the regression check (below), and `node tools/release.js` (builds `out/release/` and shows the notes; it refuses on any mismatch).
3. The user pushes `main`, then `git tag vX.Y.Z && git push origin vX.Y.Z`: `release.yml` runs the tests and makes a **pre-release** (= beta) with `school-widget.js` and `version.json`. Making it stable = unticking "pre-release" on GitHub (that also redeploys Pages).

**The builder gets no GitHub access; the user pushes and tags.** Never force-push, never rewrite published history. Commits have no model-name trailer.

## Working with this user

- **Readability is the top priority:** big, clear text and no cut-off text ("…"). Thin icons and cramped spacing get noticed.
- **They review on the real phone and send screenshots.** Always say that renders come from a mock (`tools/preview`) and the phone is the real test.
- **Before big or creative changes:** ask first. Small fixes they request: just do them.
- **Show renders:** before/after comparisons for visual changes.
- **Keep approved looks:** when they say a version looks right, don't change those sizes while doing other work (changing the large widget's sizes once already caused a revert).
- **Units:** SI; for long durations use months, not weeks. They say "промпт", never "подкана". Names: "School Widget" and "School Widget Installer" in English; the widget's own text stays Bulgarian.
- **End every change by getting the script onto the phone:** run `tools/serve.sh` (it serves only `school-widget.js`, UTF-8: plain `python3 -m http.server` made Safari garble the Cyrillic) and give the address it prints, to open in Safari on the iPhone and paste into Scriptable. After a release, beta is the way instead.

## Lessons from the phone that the code depends on (don't undo them)

- **Seam across ring lines (1.4.3–1.4.5):** don't wrap large's rows or use negative spacing (1.4.3 did: iOS shrank **every** start time). Instead row heights are whole screen pixels (`pxFloor` on large, `pxCeil` on the default medium) and every ring picture is the row's full height (`dayRow` always gets `ext`), so pictures aren't resampled and meet exactly.
- **Never add an empty text** (an empty room shrank the ФВС row's time on large). Rows without a room get an invisible `NO_ROOM` text (`C.clear`).
- **Ring lines are two layers like the rings** (`C.faint` + colour) and end at the ring's edge (a translucent overlap showed as a patch). `C.grey` (upcoming rings, lines, list boxes) is opaque; done colours stay see-through (1.4.1–1.4.2).
- **Large dashes the same-room line** when the rings are ≥ `T.link.dashMin` (9) apart (6 classes), and splits it in the middle at 7 (1.4.1).
- **Menu links (1.4.0):** Today has `.lk` pieces above/below each ring, dashed by a repeating gradient; Week has `weekBoxes`, absolutely positioned grid items that need an explicit end line (`grid-column: c / c+1`) or they stretch to the grid's edge. After the last bell, Today lists only the next school day (the user asked).
- **Data (1.3.1):** room "3" is "03"; ФВС has no room (empty space; on large a flexible spacer keeps the hero band left, in `layout=list` the big value moves to the right edge).
- **v1.2.x:** no "в" before the start time ("08:00" alone); the round Lock Screen ring is filled only during a class; the compact hero cell keeps the room at 24 pt, with no gap above the note.

## Design principles (agreed with the user, Nov 2026)

Follow these for any new layout or change; the numbers in "Design (v1.1)" are these principles applied.

1. **Readability first, then prettiness.** Big, clear text; nothing cut off ("…"); nothing cramped or nearly touching. When space runs short, shrink decoration (rings, band heights) before text or gaps.
2. **Think in a grid of sectors.** Every widget is split into rows and columns (small: 2 rows, the top one in 2 columns; medium: 2 equal columns; large: 3 columns — when | what | where — running the whole height). Things in the same role line up across rows.
3. **One building block, reused at every size.** The hero cell (ring with the period number | room; big value; name) is the whole small widget and the left half of medium; large uses the same pieces in its hero band. A ring always means a class: period number inside, fill = progress, colour = state.
4. **One scale for everything (Tailwind-style tokens in `T`).** Text, gaps, rings and margins come from fixed scales; no raw numbers in widget code. Column widths are calculated from the widget size, never typed in.
5. **Margins:** 16 pt from every edge. **Every divider line has the same visible gap on both sides** — the user asked for this "everywhere".
6. **Centre things vertically inside their sector** where it helps (ring against the room block, the hero band's three parts).
7. **Fill the space.** Rows stretch to use the widget's real height (6 vs 7 classes a day), instead of leaving a gap.
8. **Text aligns left in columns,** names under names, times under times; rooms align right.
9. **Show what matters now.** During school: only today (finished classes dimmed, the current one highlighted on large); tomorrow appears only after the last bell. Notes ("контролно", "Утре") appear only when needed, and the cell compacts to make room for them.
10. **Consistent labels:** "стая" always sits above the room. ФВС has no room (v1.3.1, the user asked; it used to be "Салон"): an empty space, no "стая", no stray "·". Room 3 is written "03" (in `DATA`).
11. **Process:** sketch and ask before big or creative changes; small requested fixes, just do. Show before/after renders. Keep what the user approves (e.g. the Lock Screen, the medium list centred as a group) and don't change it while doing other work.

## Design (v1.1)

- Dark (or Light, per theme), white text, secondary text at 65 %.
- Rings are drawn with `DrawContext`:
  - **Green:** class now, filling up.
  - **Red:** important or test.
  - **Grey:** upcoming.
  - **Inside the ring:** the period number (rings under 36 pt: plain text in a fixed-size horizontal stack, which iOS centres; see `ringNumSmall`). Never draw text into a ring picture: `Color.dynamic` doesn't work in `DrawContext` and came out black.
- **Fonts:** system font. Big numbers semibold, names bold, notes and labels semibold dim, times regular dim (`nameText` / `noteText` / `timeText`, `bigValue`).
- **Every size lives in `T`** (after the colours). Widget functions take sizes, gaps and column widths from it; column widths are worked out from `T.size` (Apple's documented sizes) minus the margins.

| Token | Values |
|---|---|
| `T.fs` text | xs 11 · sm 12 · md 13 · base 15 · lg 17 · xl 20 · xl2 24 · xl3 28 · xl4 32 · xl5 36 · xl6 40 |
| `T.sp` gaps | xxs 2 · xs 4 · sm 6 · md 8 · lg 12 · xl 16 |
| margins | `T.pad` 16 on every Home Screen widget (large: 8 + 8 per band, see below) |
| `T.ring` d / line | row 22/3 (number 11) · list 26/3.5 (12) · cellCompact 36/5 · cell 40/6 · hero 64/8 · lockRect 52/5 · lockRound 64/6 |
| other | `flexMin` 8 (spacer minimum) · `slack` 4 (spare width for multi-part lines) · `lineH` 1.2 · `hair` 1 · `timeShrink` 2 |
| `T.day`, `T.list` | the two extra medium layouts: hero width 100, `bleed` 6, row text 13, `rowMax` 24, `slackV` 3; list header sizes and `valueMax` 96, `roomMax` 60 |
| `T.lock`, `T.vac` | v1.0's Lock Screen and summer-vacation sizes and margins, unchanged |

- **Hero cell** (the whole small widget; the left half of medium):
  - Top row: ring with the period number | room block ("стая" 12 over the room number, right-aligned). The label is always "стая", also for "Салон" (the user asked).
  - Bottom row, pushed down by a flexible spacer: big value ("15 мин" / "след 8 мин" / "08:00" (no "в", the user asked)), the short name, and a note when needed.
  - **Regular:** ring 40, room 24, value 36 + unit 17, name 20.
  - **Compact** (a note is shown: "контролно" in red, or the day "Утре" / "Пн, 4 яну" when the class isn't today): ring 36, room 24 (same as regular; the user asked, v1.2.1), value 28 + unit 15, name 17, note 12 with no gap above it (the small widget is exactly full).
  - "Край за днес" and holiday names are not shown on small and medium.
- **Small:** the hero cell, 123 pt wide.
- **Medium:** hero 132 | gap 16 | line 1 | gap 16 | list 132 (the gap equals the outer margin; the user asked for that). Up to 3 class rows, centred as a group, 8 pt apart: ring 26 | gap 8 | short name 15 bold over "10:55 · 112" 12. Only the hero's day; while school is on and fewer than 3 are left, an end row ("Край", end time). The next day's classes only when the hero is that day's first class.
- **Large:** three columns all the way down: **when** 76 | gap 12 | **what** 141 | **where** (the rest: 68 at 329 pt; the only flexible part of each band, so rooms sit on the right edge on any phone).
  - **Hero band:** ring 64 at the start of the when column | name 20 bold, value 32 + 15, note 13 ("до 10:35", red "контролно · до 10:35" or just "контролно" if that doesn't fit (the user is fine with that), "започва в 10:55" / "първи час" in a break, the day otherwise) | "стая" 12 over the room 24.
  - **Divider lines: the same visible gap on both sides, everywhere** (the user asked): 16 pt around medium's vertical line; 8 pt (`T.large.lineGap`) around both of large's lines, measured to the ring or text. Next to the list, part of the 8 pt is the row's own padding, so the spacer is `8 − padV`.
  - **The whole day of the hero's class,** one row per period: ring 22 + start time 15 | name 17, left-aligned (full name; the short one if the full one would drop under 15) | room 17. Finished classes at about 40 % strength; the class in focus on a rounded tint (green in a class, neutral in a break) with the hero's progress ring and a bold name; nothing dimmed when the day isn't today.
  - **Rows take all the height that is left** (`homeLarge` solves for the row padding; rows never under 25, 2 pt spare in `T.large.slackV`). The height comes from `largeInnerH()`: a table of large-widget heights by screen size (`LARGE_H`; 375 × 812 → 352, measured on the user's phone). On the user's phone: about 33 pt with 6 rows, 28 with 7.
  - **Bottom section, always shown** (the user asked for it; the hero was made smaller to fit): a line, then one line laid out on its own (the user asked; not on the list's columns): icon 15 | 8 pt | the break's name 15 | "11" 15 + "уч. дни" 12 on the right. On a named day off: the holiday's name instead, no count.
  - Side margins: the widget has 8, every band adds 8 more, so the highlighted row's tint reaches 8 pt past the columns.
- **Medium layouts (v1.2), Parameter-only** (`S.layout`; not in `DEFAULTS`, so not in the Settings page):
  - Both list **the whole day of the hero's class** in rows of 13 pt text (`miniRow`): 17 pt high with 7 periods in `day`, 16.5 pt with 4 rows per column in `list`, never over 24. Rows are too low for rings: finished classes are dimmed, the hero's row has a tint (green in a class, neutral otherwise, also after school) and a bold name, important classes are red. The tint reaches 6 pt (`bleed`) past the text; the widget's side margin is 10 there and everything else gets the 6 back.
  - Everything is sized for a 120 pt inner height (the mock's 152 pt widget), `slackV` 3.
  - **`layout=day` (`homeMediumDay`):** hero 100 | gap 16 | line | gap 16 | list 164: start time | name | room. The hero is `heroCell` with the compact density forced. When "след 15 мин" would shrink its words under 12 pt, "след" goes on its own line above (only when there is no note). The user wanted start times here.
  - **`layout=list` (`homeMediumList`):** header (ring 36 | name 17 over a note 12 | big value 28 + 15 | "стая" over the room 20) | gap 8 | line | gap 8 | two columns of 152 (text 140), periods down the left then the right: number 12 | name | room. The user chose numbers here; times don't fit. The header's name column gets what is left after the value and the room; in a break the note shortens to "в 10:55".
  - Tightest spots: "Математика" as the current class in `day` (stays semibold instead of bold, to keep 13 pt), and the 4-row columns in `list`.
- **Links (v1.3):** `dayLinks(day)` gives "class" / "room" / null per neighbouring pair (needs consecutive periods and the same room). Colours: `linkColor` (green next to the current class, red when all are important, grey; dimmed when done), on for ring lines with `S.linkColors`, for boxes only with `S.linkOutlines` too.
  - **Ring lines** are drawn inside the ring's picture (`ringImage`'s `ext`: the picture is the row's height, with `linkPiece`s above and below the ring), so the ring stack is as tall as the row. Large: `dayRow(..., ext)`, padding 0 then; the same-room line has a `T.link.split` gap at the row boundary. Default medium: ring stack 32.67 pt (two text lines, rounded up to whole pixels), the 8 pt gap between rows becomes a `linkGap` picture, dashes keep their phase across the pieces; the line from the hero (`stub`, 6 pt, fading) makes the first ring's picture taller and the row bottom-aligned.
  - **Boxes** (`linkedRows` → `boxImage`): each linked run (per column) goes into one stack of the exact size with the box picture as its background; the tint of the current class is in the picture (box=row; colours `tintClassPic` / `tintBreakPic`, since pictures can't follow Light/Dark Mode). Dashes are separate little lines (`strokeLine`; DrawContext has no dashes); corners are sampled arcs. `boxGaps` takes 2 pt per gap between a box and its neighbours from the row height. box=room: `roomColW`, the row's right padding is 0 and the room sits in a fixed-width horizontal stack (centred).
  - Settings: `linkColors` / `linkOutlines` / `linkBox` in `DEFAULTS` and the Settings page ("Свързани часове"); Parameter `color=`, `outline=`, `box=`.
- **Lock Screen (approved as is, 11 Nov 2026):** the user saw a redesign sketch matching the Home Screen and chose to keep the v1.0 look. Don't change it unless they ask. Always white. Knockout pill for the name and a solid disc ring during a class. The round widget's disc is filled **only** during a class (v1.2.2, the user asked); the rectangular one still uses the filled pill for an important class. A flag icon marks an important class in the one-line widget and during a class on the rectangular one.
- **Holiday icons:** SF Symbols in widgets, emoji in the full-screen menu. Subject icons (`DATA.icons`) are no longer shown on the widgets.

## Code map (`school-widget.js`, in order)

| Part | Contents |
|---|---|
| Setup | `DATA`, `DEFAULTS`, `TEST_NOW`, colors (`makeColors`, `lockColors`), design tokens `T`, `STRINGS` (bg / en), date helpers |
| Setup (1.5.0) | `DATA` is the demo (`meta.demo`); `HOLIDAYS` (official days off, `lastDay` per grade, grade-limited entries, one school year) after `DATA`; `VERSION`, `SCHEMA` |
| Settings | Settings file in Scriptable's documents folder, merged with the widget's Parameter (`parseParam`) → `S`; `L` = strings, `C` = colors |
| Timetable data (1.5.0) | `dataPath` (`uchilishte/…`), `readState` / `writeState` (`state.json`), `fingerprint` (FNV-1a 64), `utf8encode/decode`, `b64decode` / `b64urlencode`, `inflateRaw` (after tiny-inflate, MIT), `parseImport` (+ `balancedObject`, `IMPORT_ERR`), `migrate`, `groupKey` / `resolveGroups`, `lastDayFor`, `nameSpots`, `MAX_PERIODS_LARGE`, `validateData`, `TT` / `TT_FULL` / `TINFO`, `saveTimetable` (history, 5), `lastGoodHistory`, `useTimetable`, `loadTimetable`, `timetableQuestions` (app only) |
| Self-update (1.8.0) | `REPO`, `PAGES`, `GH`, `relFile`, `latestRelease` (stable: latest/download; beta: the API list), `checkForUpdate` (once a day; `st.ownRelease` for the edited check), `installUpdate` (checks, backups), `switchChannel`, the Версия card (`versionCard` / `versionAction`, `uchilishte://update?a=…`) |
| Data | `loadData` merges `HOLIDAYS.daysOff`, then `TT.daysOff`, then removes `TT.notOff`, then the days-off calendar and the tests calendar; `lessonsFor` (cached, applies tests), `dayStatus`, `nextSchoolDay` |
| State | `computeState(now)` → mode `class` / `break` / `done` / `off` / `vacation`; `nextRefresh` (next bell, or ≤5 min during school); `countdown` |
| Links (v1.3) | `dayLinks`, `runOf`, `inRun`, `linkParts` (solid / dashed parts of a run; the menu's Week boxes use it too), `linkColor`, `strokeLine`, `polyPath`, `fillPts`, `arcPts`, `areaPts`, `outlinePts`, `linkPiece`, `linkGap`, `boxImage`, `boxGaps`, `linkedRows`, `roomColW` (before the widget helpers) |
| Rings | `ringImage` (DrawContext; `ext` for link lines), `ringStack`, `ringRow`, `ringText`, `ringNum` (`ringNumSmall` under 36 pt), `ringPlain`, `ringIcon`, `fitFs` |
| Helpers | `emWidth` (text-width estimates), `fitSize`, `txt` (with `fitW`), text roles `nameText` / `noteText` / `timeText`, `hRow` / `col` / `leftLine` / `rightLine` / `centered`, `pxFloor` / `pxCeil` (whole screen pixels), `icon`, `nameColor` / `rowNameColor` / `focusTint`, `bigValue` (with `baseline` + `maxW`), `vacation` |
| Widgets | `focus` (also the note `f.sub`), `bigParts` / `bigLine`; hero cell: `heroNote`, `roomBlock` / `roomLines`, `heroCell`, `homeSmall`; medium: `nextRows`, `classRow`, `heroSplit`, `vDivider`, `homeMedium`; large: `largeCols`, `band`, `hLine`, `largeNote`, `largeHero`, `dayRow`, `largeFooter`, `footerLine`, `homeLarge`; medium layouts: `rowState`, `miniRow`, `miniRowH`, `homeMediumDay`, `bigLineW`, `homeMediumList`; the Lock Screen functions; `buildWidget` / `fillWidget` (vacation for every Home Screen size; picks the medium layout from `S.layout`) |
| Reminders | `syncReminders` (`syncRemindersSafe` never throws): scheduled notifications, thread `uchilishte-widget` |
| Share and new year (1.7.0) | `syOf`, `ttYear`, `newYearDue`, `sharedTimetable`, `namesNote`, `mergeOld` (after `isDemo`) |
| Import and editor (1.6.0) | `importPath` / `readImportFile` / `removeImportFile`, `prepareImport`, `pickFile`, `isDemo`, `editorPayload`, `dataAction` (the page's `uchilishte://data?a=…` links), `startImport`, `menuImport`, `edPage` (the editor's page code, put into the page as text) |
| Full-screen view | `buildHTML(s, tab, jump, ed)` (Today / Week / Days off / Settings tabs, web page; the welcome card on the demo, the editor's container in Week, the Готово screen) and `showView(s, tab, jump, ed)`. Settings save through `wv.shouldAllowRequest` intercepting `uchilishte://save?d=…`. |
| App | `appMenu` (when run in the app), `reload` (also reloads the timetable), `main` (`loadTimetable` → app: `timetableQuestions` → `loadData`); the `__TEST__` hook just before `main()` |

## Scriptable / WidgetKit layout rules (learned the hard way; follow them)

1. **Flexible spacers have a ~8 pt minimum.** `addSpacer()` with no length is never narrower than about 8 pt. Never centre text inside a tight fixed box with spacers; it squeezes and gets cut ("4…").
2. **Vertical stacks align their contents left; fixed-width horizontal stacks centre theirs.** `centerAlignContent()` does not centre sideways. A *horizontal* stack with a fixed width centres its content unless a flexible spacer fills it (seen on the phone in v1.1.0: list names centred, rings shifting with the time's width). For a left-aligned fixed-width column use a vertical stack (`col()` in the large widget), or make the fixed children add up to the exact width. Centre with a row: `addSpacer()` + content + `addSpacer()`. That costs about 16 pt of width.
3. **Two flexible things in one row share space equally.** A row containing spacers stretches; so does a stack containing such rows. If two of them sit side by side, iOS splits the leftover width between them and text shrinks. Give side-by-side columns fixed widths, and keep the flexible spacer the only flexible item in its row.
4. **iOS sometimes truncates instead of shrinking,** despite `minimumScaleFactor`. So font sizes are computed to fit: `txt(..., { fitW })`, `bigValue(..., { maxW })`, `fitFs` in rings, `emWidth` estimates.
5. **Baseline alignment:** iOS can only bottom-align text boxes. In `bigValue`, small words get bottom padding of `0.23 × (bigSize − smallSize)` to sit on the big number's baseline.
6. **`ListWidget` children are leading-aligned.** Rows that don't fill the width sit left.
7. **Lock Screen widgets:** render white, in iOS's own style. Black text on a white pill or disc gives a "knockout" look. Slot sizes are about rectangular 155 × 66 and round 68–72.
8. **Light and Dark Mode:** text uses `Color.dynamic`. Rings are images, so in automatic mode they use mid-greys that read on both backgrounds.
9. **Refreshing:** widgets refresh on iOS's schedule, and `refreshAfterDate` is only a hint. After pasting new code, the user may need to Edit Widget → re-pick the script.

## Preview and testing

The script runs under a fake Scriptable in Node (`tools/preview/mock.js`), which renders the widget tree to HTML. `npm install` once (Playwright, Chromium).

```sh
npm test                          # tools/test/all.js: every *.test.js, summed
cd tools/preview
node run.js                       # logic: reminders, Parameter parsing, settings round-trip, quick preview
node final.js bg                  # all widget sizes × 16 moments → out/final-bg.html ("en" for English)
MODE=light node final.js bg       # Light Mode
node variants.js bg               # the medium widget's three layouts × 22 moments
EXTRA="box=room;outline=on" node variants.js bg   # with extra Parameter entries (final.js too)
node views.js                     # the full-screen menu → out/view-*.html
node check.js bg                  # report + PNGs (PAGE=variants for that page; MODE=light)
node tree.js out/before; …edit…; node tree.js out/after
diff out/before/tree.txt out/after/tree.txt        # the regression check
node shots.js [editor|share|version|install|readme]  # screenshots; readme → img/widgets.png
```

- **`check.js`** reports overflowing widgets, cut-off text, the smallest font size per widget family, the closest text to the edge, and text boxes closer than 4 pt.
- **Regression check (`tree.js`):** about 18,855 cases (every widget family and medium layout every 10 minutes of a school week, holidays, both languages, Light and Dark Mode, many Parameter entries; the menu, reminders, the settings round-trip), one hash per case of the *whole* widget tree. Use it for any change that should not show: the diff lists exactly which cases changed. To compare with an older version, put it in place of the script temporarily (`git show <commit>:school-widget.js`).
- **Timetable for every render:** `run.js` loads `fixtures/sample.json` (made up, schema 0) into the mock's data file, so renders don't depend on `DATA`. `DATA_FILE=<path>` another file, `DATA_FILE=builtin` none (the demo; adoption). `run()` options: `src`, `data`, `files`, `net` (a function url → text or null for 404; offline without it), `expose` (the `__TEST__` hook), `alerts`, `WebView` (`live.js`: the menu page in Chromium with the real script behind it). The mock has `module.filename` = `/icloud/School Widget.js`.
- **Tests (`tools/test/`):** `data` (validation, migration, groups, transport, inflate, fingerprint, adoption; `withData(FIX)` for an own built-in DATA), `update` (a fake GitHub with releases), `release`, `editor` (live in Chromium; also the five `ai/tests` timetables), `share`, `install`, `ai` (instructions current, encoders, the install script), `privacy`.
- **AI side:** `ai/INSTRUCTIONS.md` is generated: edit `tools/ai/INSTRUCTIONS.template.md` and run `node tools/instructions.js` (the `ai` test fails on a stale one). Name limits in it are measured with `nameSpots` / `fitSize`. The Shortcut's iCloud link is `SHORTCUT_LINK` in `install/index.html`. `ai/tests/`: `make.js` draws the pictures, `answers.md`, `compare.js` → `results/REPORT.md`.

**What the mock can't do:** its font is Inter, not SF; SF Symbols are placeholder glyphs; it only approximates how iOS shares space. It renders small and medium 152 pt tall (Apple: 155) and large 352 pt (measured on a 375 × 812 phone; `LARGE_H=345` for Apple's size), with a 375 × 812 screen. It models the 8 pt spacer minimum, left-aligned vertical stacks, centred content in fixed-width horizontal stacks, equal sharing between flexible items, and stacks with a vertical flexible spacer growing to the full height.

## How to update the holidays (each school year)

When МОН publishes the next school year's order (about August):
1. Edit `HOLIDAYS`: `schoolYear`, `source` (the order's number and date), `lastDay` per grade range, `daysOff` (every day named; `{ grades: "1-11" }` for days only some grades have; the first name wins on overlaps). Keep the comment above it.
2. Release as above: only days-off cases should change in the regression check.

## Ideas backlog (not started)

- **Icons tab:** a menu tab showing the real SF Symbols on the phone, to pick subject icons.
- **Native app:** SwiftUI + WidgetKit + ActivityKit (a live countdown on the Lock Screen and Dynamic Island) + App Intents (real widget settings).
  - **Without the paid Apple Developer Program:** free signing works for the user's own phone, but apps expire after 7 days and there's no iCloud.
  - **Needs the paid program ($99/yr):** class sharing over iCloud, TestFlight, the App Store.
