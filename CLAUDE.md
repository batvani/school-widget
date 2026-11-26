# CLAUDE.md

Read this first, then `README.md` (what the user sees), `docs/SETTINGS.md` and `CONTRIBUTING.md`.

**This repo is public** (`batvani/school-widget`, MIT). Nothing personal goes in: no real names, emails, classes, the user's subjects or timetable, local paths or LAN addresses. Facts about the user and their phone live in Claude's memory. Fixtures, examples and README images are made-up timetables. `tools/test/privacy.test.js` (part of `npm test`) checks every file against a private word list (`~/.config/school-widget/private-words.txt`; on GitHub the secret `PRIVATE_WORDS`).

## What it is

- **`school-widget.js`** is the whole product: one Scriptable script ("School Widget"; text Bulgarian by default, English is a setting). Line 4 = version, must match `const VERSION` (no VERSION file). Line 5 = `// id: uchilishte-widget; schema: N`, must match `const SCHEMA`. The self-update, older versions and old Shortcuts check that line, so the id stays (the one Bulgarian name left).
- **Size:** ~250 kB readable (no hard limit; keep new UI compact). Releases publish a **squashed** copy (`tools/release.js` → esbuild, ~200 kB). Lines 1–5, `const VERSION = "…";` and `const TEST_NOW = null;` stay as they are (the self-update and preview tools look for them); fingerprint and size are the squashed file's. A readable copy pasted by hand counts as edited (auto-update pauses).
- **Timetable** lives in Scriptable's documents folder, `school-widget/` (`data.json`, `settings.json`, `state.json`, `holidays.json`, `history/`, `backups/`), never in the code. Code reads **`TT`** (groups resolved, `lastDay` filled in); `TT_FULL` is the saved form. The built-in `DATA` is a made-up demo (`meta.demo`), never adopted: used only until a timetable is set up (the widget shows it), for the bells of a hand-typed timetable, and as the `holidayIcons` fallback.
- **Installing and the timetable are separate.** Landing page (`landing/`, `#install`) → Scriptable → the Shortcut "School Widget Installer" (`shortcut/STEPS.md`: code only, ends with Run Script) or `ai/install-script.js` → School Widget opens its landing page only (`#land`, no tabs; no timetable yet = `isDemo()`; offers a copied timetable; no update check before the first one) → the editor (За теб first: grade, group, city; the calendar page after Save; details folded on import) → the finished screen (widget steps).
- **Getting a timetable in:** the full prompt (`ai/prompt.txt` = a few lines + `ai/INSTRUCTIONS.md`; the app fetches it for **Направи я с AI**) → the AI's answer → copy it all → **Постави**. Or a `#z=` link → `install/` (automatic: opens School Widget at once via `open.scriptable.app/run/School%20Widget?data=…`; after 2 s the landing page's `#install` with an **Open in School Widget** button). The import file and the editor work too.
- **Calendars:** the tests calendar and your own days-off calendar are picked in Settings (`Calendar.presentPicker`, saved as name + id). Nothing picked = none read.
- **Important classes (red) are personal:** the AI asks about them only for the person's own timetable; sharing strips every `important` and the group picks.
- **Self-update** (SELF-UPDATE section): once a day, after `Script.setWidget`, 8 s timeout; offline is silent and doesn't count as the day's check. Stable = GitHub's latest release; beta (`S.channel`) = newest including pre-releases. A download from `releases/download/v<version>/` is checked (id line, version, size, fingerprint, compiles) before it replaces the file; 3 backups, automatic rollback. A fingerprint matching neither its own release (`st.ownRelease`) nor the latest = **edited by hand**: auto-update pauses.
- **GitHub Pages** (`batvani.github.io/school-widget/`, `pages.yml`) serves the landing page (`landing/` → site root), `install/` (only automatic `#z=` jobs), `ai/` and the latest stable `school-widget.js`; the install script, Shortcut, prompt and Safari use these addresses. The Shortcut's iCloud link is `SHORTCUT_LINK` in `landing/page.js` (`tools/instructions.js` reads it there); hand out `#install` / `#computer`.

## Releases

Steps are in `CONTRIBUTING.md`. Here: bump line 4 + `const VERSION` (line 5 + `const SCHEMA` if the timetable format changed), add the `CHANGELOG.md` entry (`Накратко:` and `In short:` lines = release notes and update-card text), run `npm test`, the regression check and `node tools/release.js`. The user pushes `main` and the tag; `release.yml` makes a **pre-release** (= beta); unticking "pre-release" makes it stable and redeploys Pages.

**Claude gets no GitHub access; the user pushes and tags.** Never force-push or rewrite published history. No model-name trailer in commits.

## Working with this user

- **Readability first:** big, clear text, nothing cut off ("…"), nothing cramped. Thin icons and tight spacing get noticed.
- **Ask before big or creative changes** (sketch first); small requested fixes, just do.
- **Show before/after renders** for visual changes, and say they come from a mock: the phone is the real test. The user reviews on the phone and sends screenshots.
- **Keep approved looks.** Don't change sizes the user approved while doing other work (changing large's sizes once caused a revert). Approved: the Lock Screen (v1.0 look, kept after a redesign sketch), the medium list centred as a group.
- **Wording:** SI units; months, not weeks, for long durations; "промпт", never "подкана"; "School Widget" / "School Widget Installer" in English, widget text stays Bulgarian.
- **Check in proportion to the change.** A small fix gets only the test or the one render that covers it (a single before/after of the affected widget or page). The full `npm test`, `tree.js` and all-sizes renders are for bigger changes, before a release, and once at the end of a series of small fixes.
- **End every change by getting the script onto the phone:** run `tools/dev/serve.sh` (serves only `school-widget.js` as UTF-8; plain `python3 -m http.server` garbled the Cyrillic in Safari) and give the address it prints. After a release, beta is the way instead.

## Design rules

Every size lives in `T` (search `const T`): text `T.fs`, gaps `T.sp`, rings `T.ring`, per-widget blocks (`T.large`, `T.day`, `T.list`, `T.link`, `T.lock`, `T.vac`). No raw numbers in widget code; column widths are computed from `T.size` (Apple's sizes) minus margins.

1. **When space runs short, shrink decoration** (rings, band heights) before text or gaps.
2. **Grid of sectors:** small = 2 rows (top in 2 columns); medium = 2 equal columns; large = 3 columns (when | what | where) the full height. Same roles line up across rows. Text aligns left in columns, rooms right.
3. **One building block:** the hero cell (ring | room block; big value; name; optional note) is the whole small widget and medium's left half; large reuses its pieces. A ring always means a class: period number inside, fill = progress, colour = state (green now, red important/test, grey upcoming).
4. **Margins 16 pt. Every divider has the same visible gap on both sides, everywhere** (16 around medium's line; `T.large.lineGap` 8 on large, measured to ring or text, minus the row's own padding next to the list).
5. **Fill the height:** rows stretch to the real widget height (6 vs 7 classes). Large solves for row padding (rows ≥ 25) using `largeInnerH()` / `LARGE_H` (375 × 812 → 352, measured on the user's phone).
6. **Show what matters now:** during school only today (done classes dimmed, current one highlighted); tomorrow only after the last bell. Notes ("контролно", "Утре") only when needed, and the cell goes compact to fit them.
7. **Labels:** "стая" always above the room. ФВС has no room: empty space, no "стая", no stray "·". Room 3 is "03". Start times have no "в" ("08:00"). "Край за днес" and holiday names don't show on small/medium.
8. **Large's bottom line is always shown** (the user asked; the hero was shrunk to fit), laid out on its own, not on the list's columns: icon | break name | count + "дни" (calendar days to the break, weekends included); on a named day off the holiday's name, no count.
9. **Lock Screen:** always white, knockout pill / solid disc. The round widget's disc is filled **only** during a class.
10. **Fonts:** system font; big numbers semibold, names bold, notes/labels semibold dim, times regular dim (`nameText` / `noteText` / `timeText`, `bigValue`). Secondary text at 65 %.
11. **Medium layouts** `layout=day` / `layout=list` are Parameter-only (`S.layout`, not in `DEFAULTS`). Rows too low for rings use dimming, a tint and bold for the hero's row, red for important. The user chose start times in `day`, period numbers in `list`. Tightest spot: "Математика" as current class in `day` stays semibold to keep 13 pt.
12. **Links** (neighbouring classes in the same room, `dayLinks`): ring lines need `S.linkColors`, boxes also `S.linkOutlines`; `S.linkBox` = row / room. Parameter `color=`, `outline=`, `box=`.

## Lessons from the phone (don't undo)

- **No `DrawContext` text:** never draw text into a ring picture (`Color.dynamic` came out black). Rings under 36 pt put the number in a fixed-size horizontal stack (`ringNumSmall`). Pictures can't follow Light/Dark Mode, so box tints use `tintClassPic` / `tintBreakPic`, and automatic-mode rings use mid-greys.
- **Ring-line seams:** don't wrap large's rows or use negative spacing (iOS shrank **every** start time). Row heights are whole screen pixels (`pxFloor` large, `pxCeil` default medium) and each ring picture is the row's full height (`dayRow` always gets `ext`), so pictures meet exactly.
- **Never add an empty text** (an empty room shrank the ФВС row's time). Rows without a room get the invisible `NO_ROOM` (`C.clear`). On large a flexible spacer keeps the hero band left; in `layout=list` the big value moves to the right edge.
- **Ring lines are two layers** (`C.faint` + colour) and stop at the ring's edge (a translucent overlap showed as a patch). `C.grey` is opaque; done colours stay see-through.
- **Large dashes the same-room line** when rings are ≥ `T.link.dashMin` apart (6 classes) and splits it in the middle at 7. DrawContext has no dashes: they are separate `strokeLine`s.
- **Menu (web page):** the heading is the date (sized with `fitSize` to fit beside the share button, which shares the site). Week's `weekBoxes` are absolutely positioned grid items and need an explicit end line (`grid-column: c / c+1`) or they stretch. After the last bell, Today lists only the next school day.

## Scriptable / WidgetKit layout rules

1. **Flexible spacers are never narrower than ~8 pt.** Never centre text in a tight fixed box with spacers: it gets cut ("4…").
2. **Vertical stacks align left; fixed-width horizontal stacks centre** their content unless a flexible spacer fills them. `centerAlignContent()` doesn't centre sideways. For a left-aligned fixed column use a vertical stack (`col()`) or make the children add up exactly. Centring with `addSpacer()` + content + `addSpacer()` costs ~16 pt.
3. **Two flexible items in a row split leftover space equally** and text shrinks. Give side-by-side columns fixed widths; one flexible spacer per row.
4. **iOS sometimes truncates instead of shrinking** despite `minimumScaleFactor`, so font sizes are computed to fit: `txt(…, { fitW })`, `bigValue(…, { maxW })`, `fitFs`, `emWidth`.
5. **Only bottom alignment for text:** in `bigValue`, small words get bottom padding `0.23 × (big − small)` to sit on the baseline.
6. **`ListWidget` children are leading-aligned.**
7. **Lock Screen** renders white in iOS's style; slots ≈ 155 × 66 (rectangular), 68–72 (round).
8. **Refresh is iOS's call;** `refreshAfterDate` is a hint. After pasting new code the user may need Edit Widget → re-pick the script.

## Code map (`school-widget.js`, top to bottom)

Setup (`DATA`, `HOLIDAYS`, `DEFAULTS`, `TEST_NOW`, colours, `T`, `STRINGS`, `VERSION`/`SCHEMA`) → settings (`parseParam` → `S`; `L` strings, `C` colours) → timetable data (`loadTimetable`, `validateData`, `migrate`, `resolveGroups`, `parseImport`, `saveTimetable` + history) → self-update (`checkForUpdate`, `installUpdate`) → data (`loadData`, `lessonsFor`) → state (`computeState` → class / break / done / off / vacation; `nextRefresh`) → links (`dayLinks`, `linkedRows`) → rings (`ringImage`, `ringNum`) → helpers (`txt`, `fitSize`, `bigValue`, `col`, `hRow`, `pxFloor`/`pxCeil`) → widgets (`heroCell`, `homeSmall`/`Medium`/`Large`, Lock Screen, `buildWidget`/`fillWidget`) → reminders → share / new year → import and editor (`dataAction` for `school-widget://data?a=…`, `edPage`) → full-screen menu (`buildHTML`, `showView`; settings save via `school-widget://save?d=…`) → `main` (straight to the menu); the `__TEST__` hook sits just before `main()`.

## Preview and testing

A fake Scriptable in Node (`tools/preview/mock.js`) renders the widget tree to HTML. `npm install` once (Playwright, Chromium); new worktrees need it too, or the editor/install/share tests fail.

```sh
npm test                          # every tools/test/*.test.js
cd tools/preview
node final.js bg                  # all sizes × 16 moments → out/final-bg.html ("en"; MODE=light)
node variants.js bg               # medium's three layouts × 22 moments (EXTRA="box=room;outline=on")
node views.js                     # the full-screen menu → out/view-*.html
node check.js bg                  # overflow, cut-off text, smallest font, gaps < 4 pt; PNGs
node tree.js out/before; …edit…; node tree.js out/after; diff out/before/tree.txt out/after/tree.txt
node shots.js [editor|share|version|install|readme|hero]   # readme → img/widgets.png; hero → img/hero.png, img/tile-*.png
```

- **Regression check (`tree.js`):** ~18,855 cases (every family and layout every 10 min of a school week, holidays, languages, modes, Parameters, the menu, reminders, settings), one hash per tree. Use it for any change that shouldn't show; the diff lists what changed. To compare with an old version, swap in `git show <commit>:school-widget.js` temporarily.
- **Render library:** `run.js` is library-only (`const run = require("./run")`), used by every script here and by the tests; `gallery.js` renders the widget rows for `final.js` / `variants.js`. It loads `fixtures/sample.json` (made up, schema 0); `DATA_FILE=<path>` for another, `DATA_FILE=builtin` for the demo. `run()` options: `src`, `data`, `files`, `net` (url → text or null; offline without it), `expose` (`__TEST__`), `alerts`, `WebView` (`live.js`: the real menu in Chromium).
- **Tests** (`tools/test/`, shared setup `harness.js`): `data`, `update` (fake GitHub), `release`, `editor` (live in Chromium, plus the `ai/tests` timetables), `share`, `install`, `landing`, `widgets` and `calendar` (the pages, served as Pages would; `site.js`), `holidays`, `ai`, `privacy`.
- **AI side:** `ai/INSTRUCTIONS.md` and `ai/prompt*.txt` are generated: edit `tools/ai/INSTRUCTIONS.template.md`, run `node tools/instructions.js` (the `ai` test fails on a stale copy).
- **The mock isn't the phone:** Inter instead of SF, placeholder SF Symbols, approximate space sharing. Small/medium render 152 pt tall (Apple: 155), large 352 (`LARGE_H=345` for Apple's), on a 375 × 812 screen.

## Holidays (no release needed)

The official days off live in `holidays/list.json` (format and rules: `CONTRIBUTING.md`). `pages.yml` builds `holidays.json` (the widget downloads it daily) and the `.ics` feeds from it. To change them: edit the list, `npm test`, the user pushes `main`. The next year (about August) is a new entry in `years`.
