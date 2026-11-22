# To do

Renders come from a stand-in for Scriptable on the PC (`tools/preview`). Fonts and icons differ, so the phone is the real test.

## Once: make the public repo

1. **Your GitHub account first:** whoever can push here can run code on every user's phone (the script updates itself from the releases). Settings → Password and authentication → turn on two-factor authentication.
2. **Your email:** github.com → Settings → Emails → turn on **Keep my email addresses private** and **Block command line pushes that expose my email**. Copy the `…@users.noreply.github.com` address.
3. github.com → **New repository** → `school-widget`, **Public**, no README/license/.gitignore → Create.
4. Repo → Settings:
   - **Secrets and variables → Actions → New repository secret:** name `PRIVATE_WORDS`, value: the lines of `~/.config/school-widget/private-words.txt`.
   - **Pages → Source: GitHub Actions.**
   - **General → Releases → Enable release immutability** (a published release's files can't be changed).
5. After this branch is merged into `main`: a fresh history in a new folder, so the old commits (with personal details) never go public:
   ```sh
   cd ..                                   # the folder that holds this project
   git clone school-widget school-widget-public && cd school-widget-public
   git config user.email "ID+batvani@users.noreply.github.com"     # the noreply address from step 2
   git checkout --orphan fresh && git commit -qm "School Widget 1.8.0"
   git log -1 --format=%ae                                          # must be the noreply address
   git branch -M fresh main && git remote set-url origin https://github.com/batvani/school-widget.git
   npm install && npx playwright install chromium && npm test     # the privacy test must pass
   git push -u origin main
   ```
   The old folder keeps the full history: push it to a **private** repo (`school-widget-archive`) as a backup, then work in the new folder from now on.
6. Wait for the **test** and **pages** workflows (repo → Actions) to go green.

## The first release (1.8.0)

1. `git tag v1.8.0 && git push origin v1.8.0`. The **release** workflow makes a pre-release (beta) with `school-widget.js` and `version.json`.
2. Change the Shortcut "School Widget Installer": its download address is now `https://batvani.github.io/school-widget/school-widget.js` (`shortcut/STEPS.md`). Share it again and send me the new iCloud link (it goes into `install/index.html`).
3. Put 1.8.0 on your phone: `sh tools/serve.sh`, open the address on the iPhone, Select All → Copy → paste into School Widget in Scriptable → ▶.
4. Settings → Версия → tap the version line 5 times → **Канал: beta** → **Провери сега**: it should say up to date (1.8.0).
5. Make it stable: the release on GitHub → Edit → untick **Set as a pre-release** → Update release. The pages workflow then puts the script on `batvani.github.io/school-widget/school-widget.js`.

## Checks on the phone (1.5.0–1.8.0)

Send a screenshot if something looks wrong.

1. **Widgets:** small, medium, large and the Lock Screen look as before (1.4.7's small fixes are not seen yet).
2. **Програма → Промени програмата:** change a room → Добре → Запази; the widget shows it. **Върни предишна** brings the old one back.
3. **Програма → Сподели програмата:** Изпрати линк (does the share menu open?), Покажи QR код (another phone's camera shows a link), Запази като файл.
4. **Нова учебна година** shows only from 1 September: see `npm run shots -- share` until then.

## A test as a new user (after the release)

On a second iPhone with Scriptable: open a shared link → **Първи път? Добави прекия път** → Add Shortcut → back to the page → **Инсталирай**. It should save the timetable, download School Widget and open it. Note any unclear step.

## AI tests (optional)

`node ai/tests/make.js` draws the timetable pictures into `ai/tests/pictures/`. For each AI app and picture, in a new chat: paste `ai/START.md`'s prompt, attach the picture, answer from `ai/tests/answers.md`, and save its last answer as `ai/tests/results/<ai>-<n>.txt`. Then `node ai/tests/compare.js` writes `ai/tests/results/REPORT.md`.

## Every August or September

When МОН publishes the next school year's order, update `HOLIDAYS` (steps in `CLAUDE.md`), then release as above.

## Not built (as planned)

Odd/even weeks, different bell times per day, Shortcuts AI actions.

- **Icons tab:** a menu tab showing the real SF Symbols on the phone, to pick subject icons.
- **Native app:** SwiftUI + WidgetKit + ActivityKit (live countdown on the Lock Screen and Dynamic Island) + App Intents (real widget settings). Free signing works on your own phone but apps expire after 7 days and there's no iCloud; the paid Apple Developer Program ($99/yr) adds iCloud class sharing, TestFlight, the App Store.
