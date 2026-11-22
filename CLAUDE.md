# CLAUDE.md

Read this first, then `README.md` (what the user sees) and `TODO.md` (what's left).

**This repo is public** (`batvani/school-widget`, MIT). Nothing personal goes in: no real names, emails, classes, the user's subjects or timetable, local paths or LAN addresses. Facts about the user and their phone live in Claude's memory. Fixtures and examples are made-up timetables. `tools/test/privacy.test.js` (part of `npm test`) checks every file against a private word list (`~/.config/school-widget/private-words.txt`; on GitHub the secret `PRIVATE_WORDS`).

## What it is

- **`school-widget.js`** is the whole product: one Scriptable script ("School Widget"; its text is Bulgarian by default, English is a setting). Line 4 = version, must match `const VERSION` (~line 209; there is no VERSION file). Line 5 = `// id: uchilishte-widget; schema: N`, must match `const SCHEMA`; the self-update checks it.
- **Size budget:** about 250 kB (244 kB at 1.8.0). Keep new UI compact.
- **Timetable** lives in Scriptable's documents folder (`uchilishte/data.json`, `state.json`, `history/`), never in the code. The built-in `DATA` is a made-up demo (`meta.demo`), never adopted. **Code reads `TT`** (groups resolved, `lastDay` filled in); `TT_FULL` is the saved form; `DATA` only for adoption and the `holidayIcons` fallback.
- **Getting a timetable in:** photo → an AI app with `ai/START.md`'s prompt (reads `ai/INSTRUCTIONS.md`) → a link to `install/` (GitHub Pages) → the Shortcut "School Widget Installer" (`shortcut/STEPS.md`; ends with Scriptable's Run Script, no URL actions) or the menu's **Внеси програма**. The editor (Програма → Промени програмата) fixes it on the phone.
- **Important classes (red) are personal:** the AI asks about them only for the person's own timetable; sharing strips every `important` and the group picks.
- **Self-update** (SELF-UPDATE section): once a day, after `Script.setWidget`, 8 s timeout; offline is silent and doesn't count as the day's check. Stable = GitHub's latest release; beta (`S.channel`) = newest including pre-releases. Downloads from `releases/download/v<version>/` are checked (id line, version, size, fingerprint, compiles) before replacing the file; 3 backups, automatic rollback. If the file's fingerprint matches neither its own release (`st.ownRelease`) nor the latest, it was **edited by hand** and auto-update pauses.
- **GitHub Pages** (`batvani.github.io/school-widget/`, `pages.yml`) serves `install/`, `ai/` and the latest stable `school-widget.js`; the install script, Shortcut, prompt and Safari use these addresses.

## Releases

1. Bump line 4 + `const VERSION` (and line 5 + `const SCHEMA` if the timetable format changed). Add `## X.Y.Z — <date>` to `CHANGELOG.md` with a `Накратко:` and an `In short:` line (release notes and update-card text).
2. `npm test`, the regression check (below), and `node tools/release.js` (builds `out/release/`, refuses on any mismatch).
3. The user pushes `main`, then `git tag vX.Y.Z && git push origin vX.Y.Z`: `release.yml` makes a **pre-release** (= beta). Unticking "pre-release" on GitHub makes it stable and redeploys Pages.

**Claude gets no GitHub access; the user pushes and tags.** Never force-push or rewrite published history. No model-name trailer in commits.

## Working with this user

- **Readability first:** big, clear text, nothing cut off ("…"), nothing cramped. Thin icons and tight spacing get noticed.
- **Ask before big or creative changes** (sketch first); small requested fixes, just do.
- **Show before/after renders** for visual changes, and say they come from a mock: the phone is the real test. The user reviews on the phone and sends screenshots.
- **Keep approved looks.** Don't change sizes the user approved while doing other work (changing large's sizes once caused a revert). Approved: the Lock Screen (v1.0 look, kept after a redesign sketch, 11 Nov 2026), the medium list centred as a group.
- **Wording:** SI units; months, not weeks, for long durations; "промпт", never "подкана"; "School Widget" / "School Widget Installer" in English, widget text stays Bulgarian.
- **End every change by getting the script onto the phone:** run `tools/serve.sh` (serves only `school-widget.js` as UTF-8; plain `python3 -m http.server` garbled the Cyrillic in Safari) and give the address it prints. After a release, beta is the way instead.

## Design rules

Every size lives in `T` (~line 266): text `T.fs`, gaps `T.sp`, rings `T.ring`, per-widget blocks (`T.large`, `T.day`, `T.list`, `T.link`, `T.lock`, `T.vac`). No raw numbers in widget code; column widths are computed from `T.size` (Apple's sizes) minus margins, never typed in. Read `T` for the exact values.

1. **When space runs short, shrink decoration** (rings, band heights) before text or gaps.
2. **Grid of sectors:** small = 2 rows (top in 2 columns); medium = 2 equal columns; large = 3 columns (when | what | where) the full height. Same roles line up across rows. Text aligns left in columns, rooms right.
3. **One building block:** the hero cell (ring | room block; big value; name; optional note) is the whole small widget and medium's left half; large reuses its pieces. A ring always means a class: period number inside, fill = progress, colour = state (green now, red important/test, grey upcoming).
4. **Margins 16 pt. Every divider has the same visible gap on both sides, everywhere** (16 around medium's line; `T.large.lineGap` 8 on large, measured to ring or text, minus the row's own padding next to the list).
5. **Fill the height:** rows stretch to the real widget height (6 vs 7 classes). Large solves for row padding (rows ≥ 25) using `largeInnerH()` / `LARGE_H` (375 × 812 → 352, measured on the user's phone).
6. **Show what matters now:** during school only today (done classes dimmed, current one highlighted); tomorrow only after the last bell. Notes ("контролно", "Утре") only when needed, and the cell goes compact to fit them.
7. **Labels:** "стая" always above the room. ФВС has no room: empty space, no "стая", no stray "·". Room 3 is "03". Start times have no "в" ("08:00"). "Край за днес" and holiday names don't show on small/medium.
8. **Large's bottom line is always shown** (the user asked; the hero was shrunk to fit), laid out on its own, not on the list's columns: icon | break name | count + "уч. дни"; on a named day off the holiday's name, no count.
9. **Lock Screen:** always white, knockout pill / solid disc. The round widget's disc is filled **only** during a class.
10. **Fonts:** system font; big numbers semibold, names bold, notes/labels semibold dim, times regular dim (`nameText` / `noteText` / `timeText`, `bigValue`). Secondary text at 65 %.
11. **Medium layouts** `layout=day` / `layout=list` are Parameter-only (`S.layout`, not in `DEFAULTS`). Rows too low for rings: dimming, a tint and bold for the hero's row, red for important. The user chose start times in `day`, period numbers in `list`. Tightest spot: "Математика" as current class in `day` stays semibold to keep 13 pt.
12. **Links** (neighbouring classes in the same room, `dayLinks`): ring lines need `S.linkColors`, boxes also `S.linkOutlines`; `S.linkBox` = row / room. Parameter `color=`, `outline=`, `box=`.

## Lessons from the phone the code depends on (don't undo)

- **No `DrawContext` text:** never draw text into a ring picture (`Color.dynamic` came out black). Rings under 36 pt put the number in a fixed-size horizontal stack (`ringNumSmall`). Pictures can't follow Light/Dark Mode, so box tints use `tintClassPic` / `tintBreakPic`, and automatic-mode rings use mid-greys.
- **Ring-line seams (1.4.3–1.4.5):** don't wrap large's rows or use negative spacing (iOS shrank **every** start time). Row heights are whole screen pixels (`pxFloor` large, `pxCeil` default medium) and each ring picture is the row's full height (`dayRow` always gets `ext`), so pictures meet exactly.
- **Never add an empty text** (an empty room shrank the ФВС row's time). Rows without a room get the invisible `NO_ROOM` (`C.clear`). On large a flexible spacer keeps the hero band left; in `layout=list` the big value moves to the right edge.
- **Ring lines are two layers** (`C.faint` + colour) and stop at the ring's edge (a translucent overlap showed as a patch). `C.grey` is opaque; done colours stay see-through.
- **Large dashes the same-room line** when rings are ≥ `T.link.dashMin` apart (6 classes) and splits it in the middle at 7. DrawContext has no dashes: they're separate `strokeLine`s.
- **Menu (web page):** Week's `weekBoxes` are absolutely positioned grid items and need an explicit end line (`grid-column: c / c+1`) or they stretch. After the last bell, Today lists only the next school day.

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

Setup (`DATA`, `HOLIDAYS`, `DEFAULTS`, `TEST_NOW`, colours, `T`, `STRINGS`, `VERSION`/`SCHEMA`) → settings (`parseParam` → `S`; `L` strings, `C` colours) → timetable data (`loadTimetable`, `validateData`, `migrate`, `resolveGroups`, `parseImport`, `inflateRaw`, `fingerprint`, `saveTimetable` + history) → self-update (`latestRelease`, `checkForUpdate`, `installUpdate`, Версия card) → data (`loadData`: official days off, `TT.daysOff`, `TT.notOff`, calendars; `lessonsFor`) → state (`computeState` → class / break / done / off / vacation; `nextRefresh`) → links (`dayLinks`, `linkParts`, `boxImage`, `linkedRows`) → rings (`ringImage`, `ringNum`) → helpers (`txt`, `fitSize`, `emWidth`, `bigValue`, `col`, `hRow`, `pxFloor`/`pxCeil`) → widgets (`heroCell`, `homeSmall`, `homeMedium`, `homeLarge`, `homeMediumDay`, `homeMediumList`, Lock Screen, `buildWidget`/`fillWidget`) → reminders (`syncRemindersSafe`) → share / new year (`sharedTimetable`, `mergeOld`) → import and editor (`dataAction` for `uchilishte://data?a=…`, `edPage`) → full-screen menu (`buildHTML`, `showView`; settings save via `uchilishte://save?d=…`) → `appMenu`, `main`; the `__TEST__` hook just before `main()`.

## Preview and testing

A fake Scriptable in Node (`tools/preview/mock.js`) renders the widget tree to HTML. `npm install` once (Playwright, Chromium); new worktrees need it too, or the editor/install/share tests fail.

```sh
npm test                          # every tools/test/*.test.js
cd tools/preview
node run.js                       # logic + quick preview
node final.js bg                  # all sizes × 16 moments → out/final-bg.html ("en"; MODE=light)
node variants.js bg               # medium's three layouts × 22 moments (EXTRA="box=room;outline=on")
node views.js                     # the full-screen menu → out/view-*.html
node check.js bg                  # overflow, cut-off text, smallest font, gaps < 4 pt; PNGs
node tree.js out/before; …edit…; node tree.js out/after; diff out/before/tree.txt out/after/tree.txt
node shots.js [editor|share|version|install|readme]   # readme → img/widgets.png
```

- **Regression check (`tree.js`):** ~18,855 cases (every widget family and layout every 10 min of a school week, holidays, both languages, both modes, many Parameters, the menu, reminders, settings), one hash per whole tree. Use it for any change that shouldn't show; the diff lists the cases that changed. To compare with an old version, swap in `git show <commit>:school-widget.js` temporarily.
- **Render data:** `run.js` loads `fixtures/sample.json` (made up, schema 0). `DATA_FILE=<path>` for another, `DATA_FILE=builtin` for the demo. `run()` options: `src`, `data`, `files`, `net` (url → text or null; offline without it), `expose` (`__TEST__`), `alerts`, `WebView` (`live.js`: the real menu in Chromium).
- **Tests:** `data`, `update` (fake GitHub), `release`, `editor` (live in Chromium, plus the `ai/tests` timetables), `share`, `install`, `ai`, `privacy`.
- **AI side:** `ai/INSTRUCTIONS.md` is generated: edit `tools/ai/INSTRUCTIONS.template.md`, run `node tools/instructions.js` (the `ai` test fails on a stale one). The Shortcut's iCloud link is `SHORTCUT_LINK` in `install/index.html`.
- **The mock isn't the phone:** Inter instead of SF, placeholder SF Symbols, approximate space sharing. Small/medium render 152 pt tall (Apple: 155), large 352 (`LARGE_H=345` for Apple's), on a 375 × 812 screen.

## Holidays (each school year)

When МОН publishes the next year's order (about August): edit `HOLIDAYS` (`schoolYear`, `source`, `lastDay` per grade range, `daysOff` with every day named; `{ grades: "1-11" }` for some grades only; first name wins on overlaps; keep the comment above it). Release as above; only days-off cases should change in the regression check.
