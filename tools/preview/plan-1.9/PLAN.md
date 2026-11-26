# 1.9 design changes: the approved plan

Approved by the user on 26 Nov 2026 after mock previews (`img/`). **When the user says "build", run
this plan.** Three jobs, each done by a **Sonnet subagent** (`Agent`, `model: "sonnet"`), then reviewed
by the main session. The version bump to 1.9 and the CHANGELOG are a separate step, after the user
has tried everything on the phone.

`sketch.js` is the approved design as a quick patch on a copy of `school-widget.js` (jobs 1 and 2,
variant B): `node tools/preview/plan-1.9/sketch.js /tmp/sw.js`, then `run(…, { src })`. It is the
reference for the look, **not code to paste**: the real change follows CLAUDE.md (sizes named, both
languages, light and dark, tests). The `landing-*.diff` files are the same for the landing page.

**Dropped:** "job 4" (removing the "Утре" note from the widgets' heroes and the menu's hero card).
The widgets and the menu's hero text stay exactly as they are.

## Order

- Job 1 and job 3 run at the same time (different files).
- Job 2 starts after job 1 is merged: both edit `buildHTML` (its HTML and its CSS string).
- Each job: its own worktree (`isolation: "worktree"`), `npm install` first.
- **Cloud container:** the repo pins Playwright 1.65.1 (browser build 1255) but the container has
  build 1243, so the Chromium tests fail with "Executable doesn't exist". Before testing, once per
  container: `ln -s /opt/pw-browsers/chromium_headless_shell-1243 /opt/pw-browsers/chromium_headless_shell-1255`
  (and the same for `chromium-1243` → `chromium-1255` if a test asks for it). Don't commit anything for it.

## Job 1 · Today fits on one screen (`school-widget.js`, `buildHTML`, pane `#t1`)

Goal: the Today tab doesn't scroll with 7 classes. The phone's web view is about **375 × 718 pt**
(below Scriptable's ✕ / share bar; measured from a screenshot), with a 34 pt home bar.

- **Rows fit the screen:** a small script on the page (`fit()`) measures `innerHeight` on load, on
  resize and when the Today tab is shown, and shares the height left under the list's first row
  (minus the countdown line and the bottom inset) between the rows: **44–64 pt** each, as CSS
  variables `--rh` (row height) and `--ring` (**42**, or **36** when rows are under 54). With 8+
  classes, if 44 pt rows still don't fit, the page scrolls as before. Rows: `min-height: var(--rh)`,
  no vertical padding. Each ring SVG is sized by `--ring`.
- **Ring lines follow the ring size:** `.lk` positions from `--ring` (left = ring/2 − 2.5; up height
  = 50% − ring/2 + 3.5; down top = 50% + ring/2 − 2.5), so links stay seamless at 36 and 42.
- **The current class row gets a green background:** the widgets' tint (`C.tintClass`): #30d158 at
  **18 % in dark mode, 16 % in light** (`rgba(52,199,89,.16)` on light). Rounded corners 14, the
  tint bleeds 10 pt to each side (negative margin + padding; the ring lines move with it), no
  divider under it or under the row above it. Name stays green; ring and lines unchanged.
- **The "ДНЕС" / "УТРЕ" heading stays** (the user asked), with tighter margins: `#t1 h3` 16 / 4.
- **Hero card:** ring **76 → 64** (stroke 9 → 8, number 32 → 28), padding **16 → 12** top/bottom,
  big number **40 → 36** pt. Text sizes otherwise unchanged.
- **Margins:** tabs 16 / 16 → **12 / 10**; countdown line (`.foot`) 16 → **10**; while Today fits,
  no 60 pt padding under the page (`body.fit`).
- Unchanged: the date heading and share button, fonts, colours, the other tabs, the hero's text.

Reference: `img/today7-B-dark.png` (7 classes, rows 53 pt), `img/today6-B-dark.png` (6 classes,
rows stretch to 64), `img/today7-B-light.png`.

## Job 2 · Програма tab (`school-widget.js`, `buildHTML`, pane `#t2`) — after job 1

Variant **B** was chosen.

- **The week grid first**, at the top of the tab (the 4 big buttons above it are gone).
- **Under the grid, an icon bar:** 4 round buttons (54 pt circles, 22 pt line icons, caption under
  each, 12.5 pt semibold): **Промени** (solid green circle, black icon: the main action),
  **Внеси**, **Предишни**, **Сподели** (grey circle `#1c1c1e` / white on light, green icon). The
  user asked for **clear space between the grid and the bar: 24 pt** (and 8 under it).
  Captions are new short strings in `STRINGS` (bg + en; e.g. Edit / Import / Earlier / Share), not
  cut from the long ones. Предишни and Сподели show only when they do today (`ownTT()`).
  Same `data-x` actions as now (`edit`, `imp`, `hist`, `share`); Постави / От файл (`impBtns`) still
  open under the bar after Внеси; the new-year card (`wcard`) stays above the grid; the editor
  (`#ed`) still opens in place.
- **The current period cell: green background instead of the outline**, the same tint as job 1
  (18 % dark / 16 % light). On light, the "today" column was pale green (`#e8f8ec`) and the current
  cell didn't stand out: the today column becomes neutral grey **`#e5e5ea`** (as dark's `#2c2c2e`).
  The green day heading (`.dh.today`) stays.
- **Cell names:** each name's size is computed so its longest word fits on one line (11.5 pt, down
  to 10; `emWidth`, cell text width ≈ 52 pt at 375 pt wide); if it still doesn't fit, use the tiny
  name when there is one; only then break the word (with a hyphen: `hyphens: auto` only on those).
  More width: period column 34 → **28**, gaps 4 → **3**.
- The whole week + icon bar fit on one screen (375 × 718).

Reference: `img/week-B-dark.png`, `img/week-B-light.png`.

## Job 3 · Landing page (`landing/`, also `install/` and `calendar/` buttons)

- **Menu phone** (`landing/widgets.js` / `widgets.css`), mirroring jobs 1–2: the current class row
  in Today gets the green background (`.mrow.cur`); the week's current cell (`.cell.cur`) the green
  background instead of the outline; the icon bar (Edit / Import / Earlier / Share, Edit solid
  green) under the week, 24 pt below it. See `landing-widgets.*.diff`, `img/land-*.png`.
- **Buttons answer hover and touch** (see `landing-index.html.diff`, `img/landing-buttons.png`):
  - Hover only with a mouse (`@media (hover:hover) and (pointer:fine)`, so it doesn't stick on
    iPhone). Main green `.btn.p` and `nav a.get`: brightness 1.08, lift 1 pt, soft green glow
    `0 8px 24px rgba(48,209,88,.35)`. Outlined `.btn.o`: light green fill (12 %), lift 1 pt.
    Chips (`.marks`, `.mode`): lift 1 pt. Nav links (not the brand): an underline grows from the left.
  - Press, everywhere (buttons, chips, tabs, ☰, the menu phone's tabs and icon bar): scale **0.95**
    in 80 ms, brightness 0.92, springs back in 300 ms (`cubic-bezier(.34,1.56,.64,1)`). Don't remove
    the outlined button's ring when pressed (its border is a box-shadow). Mind specificity:
    `:active` must beat `:hover`.
  - Copy buttons: a short "pop" (1 → 1.06 → 1) with ✓ on success, a small shake on "Could not copy".
  - ☰ rotates into ✕ (not an instant text swap); FAQ `+` turns into `×`, the answer slides in.
  - Reduce Motion: no movement, colour fades only.
  - The same press/hover on the buttons of `install/` and `calendar/`.

## Checks (every job, before the main session reviews)

- `npm test` passes (the editor, landing, install, calendar, privacy tests included).
- **Regression check** (`cd tools/preview; node tree.js out/before` on the old code, then
  `out/after`, diff): only menu cases may change for jobs 1–2; **every widget case identical**.
  Job 3 changes no `tree.js` case.
- `node check.js bg` still clean; `node views.js` renders.
- Before/after renders from the real code at **375 × 718** (dark + light; 7 and 6 classes, after
  school; the Програма tab), compared with `img/`. Send them to the user as **PNG images** (the
  user's app can't open HTML files).
- Then `tools/serve.sh` and give the user the address for the phone. The landing changes go live
  when the user pushes `main`.

## Subagent brief (each job)

Give each subagent: this file's section for its job, CLAUDE.md's rules (it's in the repo), that it
works in its own worktree, must run the checks above and report the diff of `tree.js`, and must not
touch widget code, versions, CHANGELOG, or other jobs' areas. No model names in commits.
