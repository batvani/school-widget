# Landing page: the plan (approved direction, 25 Nov 2026)

A new page at the **site root** (`batvani.github.io/school-widget/`), built from scratch, sharing no code or design with the old `install/` page. **English only.** Functional first: someone who has never heard of School Widget should understand what it is from the first screen and be one tap from installing.

`landing/preview-3.html` is the approved rough preview (open it in a browser; the widgets are stand-ins, sizes and alignment are not final). Desktop layout = preview 2's (liked); phone layout = preview 3's (liked, "looks mint").

## Addresses

| Address | Job |
|---|---|
| `…/school-widget/` | The landing page (new). |
| `…/school-widget/#install` | Its install section. Every hand-opened "install" link points here. |
| `…/school-widget/#computer` | "The AI is on a computer?" box (paste the answer → QR code). |
| `…/install/` | **Kept, but only for automatic jobs**: tiny, no design, nothing to type (it loads faster). |

`install/` behaviour:
- `install/#z=…` / `#d=…` (classmates' links, QR codes, AI answers): opens School Widget with that timetable straight away (iOS asks "Open in Scriptable?"). If School Widget doesn't open within ~2 s, it goes to the landing page's `#install` and carries the timetable along (the landing page then offers **Copy your timetable** on top of the install steps).
- plain `install/`, `install/?lang=en`: goes to `…/school-widget/#install`.
- **Risk:** auto-opening Scriptable from a page must be tested on the phone. If iOS refuses, `install/` falls back to one **Open in School Widget** button (one tap, no typing).
- The old page's timetable preview and `?copied=1` are dropped. The whole app is beta, so links are replaced in the code itself (cleaner), not patched around.

What keeps making `install/#z=` links (automatic, unchanged): `school-widget.js:2736` (`page: PAGES + "install/"`, share sheet), `ai/encode.py` and the AI instructions' `link()`.

What must change to the new addresses (hand-opened):
- `tools/ai/INSTRUCTIONS.template.md` lines 63–64 ("No School Widget yet? Install it from…" → `#install`; "AI on a computer? Paste…" → `#computer`), then `node tools/instructions.js` (rebuilds `ai/prompt.txt`, `ai/prompt-en.txt`, `ai/INSTRUCTIONS.md`).
- `README.md` (lines 17, 73), `ai/START.md` (3, 11), `CONTRIBUTING.md` (18), `CLAUDE.md` (12, 13, 17, 96), `shortcut/STEPS.md` (73).
- The Shortcut's iCloud link (`SHORTCUT_LINK`) moves into the landing page; `tools/instructions.js` (lines 44–47) reads it from there.
- The QR code generator copy (the `install.test.js` "qrSvg copied word for word" test) moves with the computer box.
- `pages.yml` (copy the landing page to `_site/index.html`; `paths` gets `landing/**`), `tools/serve.sh` / `tools/serve.py` (serve the root page), `tools/preview/shots.js install`.
- Tests: `install.test.js` (rewrite: the automatic page + the landing page), `ai.test.js` (36, 66), `share.test.js` (48), `data.test.js` (162–165, still valid: `parseImport` accepts any address with `#z=`, `school-widget.js:825`).
- If `school-widget.js` changes at all → release 1.8.6 (beta) with a CHANGELOG entry.

Not affected: the Shortcut and `ai/install-script.js` (they download `school-widget.js` from Pages directly), `open.scriptable.app` links, `calendar/`.

## Page sections (in order)

1. **Top bar** (sticky, blurred): School Widget · Widgets · Try it · Menu · Holidays · Timetable · Help · **Install** (green pill). Phone: School Widget · Install · ☰ (slides down a list of sections).
2. **Opening screen**: "Your school day, on your Home Screen." + one sentence (class now, minutes left, next room, time to the holidays) + **Install in 2 minutes** / **Try it here** + three facts (2 minutes to install · 1 photo of your timetable · Nothing sent anywhere). Beside it (desktop) / under the headline (phone): **a real-looking iPhone** (frame, Dynamic Island, status bar clock, wallpaper, app icons, dock) with a small and a medium widget. The day plays by itself. This is the page's one bold element.
3. **Widgets** ("A widget for every spot"): tabs Small / Medium / Large / Lock Screen with a sliding highlight; one wallpaper stage morphs between them; a one-line caption.
4. **Try it** ("Drag through a school day"): big clock, state line (e.g. "History · 21 min left"), slider 07:00–16:00, shortcut buttons (Before school, In class, Break, After school, glide there), Dark / Light for the demo widgets. **Every widget on the page follows the slider.** The day keeps running: the slider only moves it, and it carries on ~1.5 s after you let go (still only with Reduce Motion).
5. **Menu** ("Tap the widget for the whole picture"): a second iPhone with the full-screen menu, tabs Today / Timetable / Days off / Settings, tappable; a list explaining each tab. Tapping any widget on the page scrolls here (like the real widget opens the menu).
6. **Holidays** ("Every day off, in your calendar too"): official holidays and exams downloaded for your grade; Add to Apple / Google Calendar (subscription, updates itself, moves to the next grade every September); your city's own days off. A month calendar (holidays green, exam red, today outlined).
7. **Your timetable**: three ways (With an AI: photo → ChatGPT, Gemini, Claude → Paste, **Copy the prompt** · From a classmate · By hand). Phone: swipe the cards sideways. Then "The AI is on a computer?" (`#computer`).
8. **Install** (`#install`): progress bar + 3 steps (Get Scriptable → Add the Shortcut → Run it); tapping a step's button ticks it and opens the next; remembers progress when you come back from Shortcuts. "The Shortcut doesn't work?" folded (copy the installer script / paste the code by hand). If you arrived with a timetable: a **Copy your timetable** card on top.
9. **Questions** (folded): free? what's sent? the widget doesn't change; Bulgarian?
10. Footer: open source (MIT), GitHub, Changelog, nothing typed here is sent anywhere.

Phone-only: an **Install in 2 minutes** bar slides up from the bottom after the first screen and hides on Try it and Install.

## The widgets

- **Hand-made HTML copies of today's real widgets**, English (School Widget's English setting): small, medium (default layout), large, Lock Screen (round, rectangular, one-line). Written once: no build step, no auto-updating.
- They must look **100% right**: exact values from `T` (`school-widget.js` ~line 214) and the colour table (~line 170), checked by a test that compares each against the preview mock's render of the real script at the same moment (`tools/preview/mock.js`), then against the user's phone screenshots (**coming later, needed before calling them done**).
- Animated like on the phone: ring fills, minutes count down, class → break → next class; on large, done classes dim and the highlight moves down.
- They always sit **on a wallpaper**, never on a plain card (preview 1's mistake: you couldn't see them).
- Dark / Light: the page follows the phone; the Try it switch overrides for the demo widgets.

## Design tokens (from the frontend-design pass)

- **Colour:** page `#000`, alternate sections `#1d1d1f`, text `#f5f5f7`, secondary `#a1a1a6`, lines `#424245`; the widget's own colours as the accent (green `#30d158` now, red `#ff453a` important/test, grey `#8e8e93` upcoming), not decoration. Wallpaper: dawn gradient `#2b3f7a → #5a6fb5 → #e3a47a → #f2c99b`.
- **Type:** Apple's system font only (the page loads nothing from outside; SF in Safari). Headlines 700, tight tracking (−0.03 em); h1 56 px desktop / 40 phone, h2 44 / 32, lead 21 / 18. Nothing under ~13 px, body 17.
- **Avoid** (the design guidance's "generated" tells): a small label above every heading, all caps, identical card grids, middle-dot meta strings, `→` on buttons, numbers on things that aren't a sequence (only the install steps are numbered). One bold element (the iPhone); everything else quiet.
- Motion: one orchestrated entrance (the iPhone rises), then motion only in answer to the person (tabs, slider, steps). Everything stops for Reduce Motion. Visible keyboard focus. Every `#` link scrolls smoothly.

## Known bugs in preview 3 (fix in the real build)

1. **Menu phone re-animates by itself:** its view fades/slides in again every 0.7 s, because the running clock redraws it (`drawAll` → `drawMenu` rebuilds `.mview`, restarting its animation). Animate only when a tab changes; update the rows in place otherwise.
2. **Phone Install bar flickers** in some sections (hides and reappears): three IntersectionObservers fight over it. Use one rule: shown when the hero buttons are above the screen and neither Try it nor Install is on screen.
3. **☰ menu's first item is hidden** under the top bar ("Widgets" cut off): the sheet is fixed at `top:48px`, but the bar isn't at 48 px when the page has scrolled less than the banner above it. Attach the sheet to the bar (`top:100%` inside `nav`) and give it top padding.
4. Sizes and alignment are rough everywhere (expected: this was a sketch).

## Ideas kept for later

- A size picker morph (done in the preview as tabs), a time slider (done), Light/Dark (done).
- "Try it" in the hero: tap the demo widget → its menu opens in place.
- A "Week" demo and the calendar subscription (covered by Menu / Holidays sections).

## How the build runs

- **Branch:** `landing-page` from `33e9ab8` (the 1.8.5 commit + settings.json). The user pushes and tags; Claude pushes only to the branch the session allows.
- **Tests first**, then **Sonnet agents in parallel**, each in its own worktree, until their tests pass; Claude reviews and merges.
  - Step 0 (Claude): branch + failing tests: `install/` cases, `#install` / `#computer` / timetable handoff, stepper buttons and the Shortcut link, widget pixel match, no cut-off text, smallest font, Reduce Motion, light/dark, slider moments, the prompt and doc addresses.
  - Step 1, sketch (**approved: this file + `preview-3.html`**).
  - Step 2, parallel: **A** widget copies (all sizes, every slider moment) + pixel test · **B** page sections, layout (desktop + phone), motion · **C** the automatic `install/` page + every address change (template, prompts, docs, tools, `pages.yml`, serving) · **D** stepper, timetable handoff, AI prompt copy, QR box, slider and Light/Dark wiring.
  - Step 3: merge, `npm test`, the regression check (`tools/preview/tree.js`: no visible widget change), before/after screenshots and a screen recording (from Chromium; the phone is the real test), serve to the phone, then 1.8.6 (beta) if the script changed.
- Still open: the user's phone screenshots of the widgets.
