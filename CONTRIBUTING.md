# School Widget · development

Everything that makes School Widget is in this repo; the phone only needs `school-widget.js`.

```sh
npm install                      # Playwright (Chromium) for the page tests and screenshots
npx playwright install chromium
npm test                         # every test in tools/test/ (+ the privacy test, see below)
npm run preview                  # all widget sizes × 16 moments → tools/preview/out/final-bg.html
npm run tree -- out/a            # the regression check: one hash per case (~18,800) → out/a/tree.txt
npm run shots -- readme          # img/widgets.png (also: hero = the README's other pictures from the landing page; editor, share, version, install)
```

| Path | What it is |
|---|---|
| `school-widget.js` | The whole widget: one Scriptable script |
| `landing/` | The landing page at the site root (GitHub Pages): what it is, demo widgets, the install steps (`#install`), the AI prompt, the AI answer → QR box (`#computer`); `SHORTCUT_LINK` lives in `page.js` |
| `install/` | The small automatic page for `#z=` / `#d=` links (QR codes, classmates, the AI): opens School Widget with the timetable, or goes to the landing page's `#install`. Nothing to type |
| `calendar/` | The calendar page: the official days off as a subscription for any calendar app |
| `holidays/list.json` | The official days off, every grade (and cities). `tools/holidays.js` checks it and builds what Pages serves |
| `ai/` | What an AI reads: `INSTRUCTIONS.md` and the full prompts `prompt.txt` / `prompt-en.txt` (all made by `node tools/instructions.js` from `tools/ai/INSTRUCTIONS.template.md`; don't edit them by hand), `START.md`, `schema.json`, `example.json`, `encode.py`, the install script. `ai/tests/`: AI tests |
| `shortcut/STEPS.md` | How the Shortcut "School Widget Installer" is built |
| `tools/preview/` | A fake Scriptable in Node (`mock.js`; `run.js` is the library behind the scripts and tests) that renders every widget to HTML/PNG; `shots.js` makes the README's pictures; `fixtures/` are made-up timetables |
| `tools/test/` | The tests; `all.js` runs them; `harness.js` is the shared test setup; `site.js` serves the site as Pages would |
| `tools/ai/` | The template the AI prompt files in `ai/` are built from (`node tools/instructions.js`) |
| `tools/release.js` | Checks a release and writes `out/release/`: the script **squashed** (esbuild, Cyrillic as UTF-8; the header lines and `const VERSION` kept as they are), `version.json`, the notes |

**Regression check:** run `npm run tree -- out/before` before a change and `npm run tree -- out/after` after it; `diff out/before/tree.txt out/after/tree.txt` lists exactly which cases render differently.

**Privacy test:** `tools/test/privacy.test.js` searches every file for the words in `~/.config/school-widget/private-words.txt` (one per line; on GitHub the secret `PRIVATE_WORDS`). Without the list it is skipped locally.

## The official days off

They aren't in the code: School Widget downloads `holidays.json` from GitHub Pages once a day, and the calendar feeds come from the same list. To change them, **edit `holidays/list.json` and push to `main`**: no release is needed. Pages rebuilds everything, and every widget and subscribed calendar picks it up.

```json
{ "cities": ["Варна", "…"],
  "years": [{ "schoolYear": "2026-27", "source": "…",
    "lastDay": { "1-3": "2027-06-02", "4-6": "2027-06-16", "7-11": "2027-07-02", "12": "2027-05-13" },
    "daysOff": [
      ["2026-12-24", "2027-01-03", "Коледна ваканция"],
      ["2027-04-03", "2027-04-11", "Пролетна ваканция", { "grades": "1-11" }],
      ["2027-05-19", "Матура по БЕЛ", { "exam": "12" }],
      ["2027-02-10", "Грипна ваканция", { "city": "Варна" }] ] }] }
```

- Every day has a name; the first name wins where entries overlap.
- `grades`: only those grades have the day off. `city`: only people who picked that city (it must be in `cities`). `exam`: the grades sitting that exam see it even after their last day of school.
- Add the next school year as a new entry in `years` when МОН publishes it (about August); old years can stay.
- `node tools/holidays.js` checks the list and builds `out/pages/`. `node tools/holidays.js --preview 8 Варна` prints one grade's days. `npm test` checks it too.

## Releases

Bump line 4 and `const VERSION` in `school-widget.js`, add the version to `CHANGELOG.md` with a `Накратко:` and an `In short:` line, run `npm test` and `node tools/release.js`, then `git tag vX.Y.Z && git push origin vX.Y.Z`. The release workflow runs the tests and makes a **pre-release** (beta). To make it stable: edit the release on GitHub → untick **Set as a pre-release** → **Update release** (that also redeploys Pages).
