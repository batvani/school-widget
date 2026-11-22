# School Widget

**Уиджет с училищната програма за iPhone** — кой час е сега, колко остава, в коя стая е следващият, кога е почивката. Работи в безплатното приложение [Scriptable](https://apps.apple.com/app/scriptable/id1405459188).

*English below.*

![Уиджетите с примерната програма](img/widgets.png)

- **Малък и среден уиджет:** часът сега (или следващият), колко минути остават, стаята.
- **Голям уиджет:** целият ден, текущият час е отбелязан, а отдолу — следващата ваканция и колко учебни дни остават до нея.
- **Заключен екран:** кръгъл, правоъгълен и на един ред.
- **Пълен екран** (докосни уиджета): днес, седмицата, почивните дни, настройките.
- Официалните ваканции и неучебни дни за учебната 2026/2027 г. са вградени. Обновява се сам.

## Инсталиране стъпка по стъпка

Около 10 минути. Снимаш програмата, AI я прочита, едно докосване я инсталира.

0. **Инсталирай Scriptable** от App Store (безплатно) и **го отвори веднъж.** *Защо:* така Scriptable създава папката си в iCloud Drive; там се записват School Widget и програмата ти.
1. **Отвори AI** (ChatGPT, Gemini, Claude, Copilot …), постави промпта от [ai/START.md](ai/START.md) и **прикачи снимка на програмата** (или екранна снимка, PDF). AI-ът отваря инструкциите тук и първо пише реда им с версията („Uchilishte instructions …“), за да знаеш, че наистина ги е прочел. Ако не може да отваря линкове: отвори [ai/INSTRUCTIONS.md](ai/INSTRUCTIONS.md), копирай целия текст и го постави в чата.
2. **Отговори на въпросите му,** провери таблицата и кажи **„Да“**. *Какво става:* AI-ът само събира програмата ти; още нищо не се инсталира. Имената на учителите не се записват.
3. **Само първия път: добави прекия път** „School Widget Installer“ от линка в последното съобщение на AI-а (или на страницата за инсталиране) → **Add Shortcut**. *Защо:* iOS показва стъпките му, преди да го добави: той само записва файлове в папката на Scriptable и изтегля School Widget от github.com.
4. **Натисни линка на AI-а.** Отваря се страница с кратък преглед (клас, дни, брой часове) → **Инсталирай**. *Програмата е вътре в линка; страницата не изпраща нищо.* Ако линкът не се натиска в чата: копирай го и го постави в Safari.
5. **„Open in Shortcuts?“** → **Open**. *Защо пита:* уеб страница иска да пусне пряк път.
6. **Само първия път:** прекият път иска достъп до папката на Scriptable и до `batvani.github.io` → **Allow** (или **Always Allow**). *Защо:* за да запази програмата ти и да изтегли School Widget (около 220 kB).
7. **Scriptable се отваря сам** и пуска School Widget.
8. Ако пита за **Calendars**: позволи само ако ще ползваш календар за неучебни дни или контролни (виж „Настройки“); иначе **Don't Allow**. Официалните ваканции са вградени.
9. **Провери таблицата, избери групата си** („Коя група си?“) и натисни **Запази**. *Какво става:* програмата се записва във файл до скрипта; обновяванията никога не я пипат.
10. **Добави уиджетите.** Екранът „Готово“ показва как; накратко:
    - **Начален екран:** задръж пръст на празно място → **Edit** → **Add Widget** → потърси **Scriptable** → избери размер → **Add Widget**. После задръж пръст върху новия уиджет → **Edit Widget** → **Script** → **School Widget**. Докосни извън него.
      *Трябва да видиш:* часа сега или следващия. Ако пише „Select script in widget configuration“, повтори стъпката с **Edit Widget**.
    - **Заключен екран (по желание):** отключи с Face ID, но остани на заключения екран → задръж пръст → **Customize** → **Lock Screen** → докосни полето под часовника (кръгъл или правоъгълен) или реда с датата (на един ред) → **Scriptable** → избери форма → **докосни поставения уиджет още веднъж** → **Script** → **School Widget** → **Done**.
11. **Нищо повече.** School Widget веднъж на ден проверява за нова версия и се обновява сам (виж по-долу).

**Без прекия път** (или ако нищо не стане): AI-ът дава и малък скрипт за инсталиране с програмата ти вътре. 1. Натисни **Copy** върху него. 2. В Scriptable: **+** → задръж пръст в празното поле → **Paste** → **Done** → ▶. 3. Той запазва програмата, изтегля School Widget и го отваря: продължи от стъпка 8. 4. Скрипта за инсталиране можеш да изтриеш.

**Вече имаш School Widget** (нова програма, друг клас): в School Widget **Внеси програма** → **Постави от AI** (след като копираш програмата от AI-а), или натисни линка → **Вече имам School Widget**. Промяна на ръка: **Програма** → **Промени програмата**.

**Без AI:** в Safari отвори `https://batvani.github.io/school-widget/school-widget.js` → задръж пръст върху текста → **Select All** → **Copy**; в Scriptable **+** → **Paste** → кръсти скрипта **School Widget** → ▶. Започва с примерна програма: **Програма** → **Промени програмата** и я смени със своята.

## Сподели с класа

Една снимка и един AI чат стигат за целия клас. В School Widget: **Програма** → **Сподели програмата**:
1. **Изпрати линк** отваря менюто за споделяне на iPhone (Messages, WhatsApp, AirDrop…). Съученикът натиска линка → **Инсталирай**, както в стъпките по-горе.
2. **Покажи QR код:** съученикът го снима с камерата на iPhone.
3. **Запази като файл:** `10а-програма.json`; съученикът го внася с **Внеси програма** → **От файл**.

Споделя се цялата програма с **двете групи** (всеки избира своята). **Твоите важни (червени) часове и твоята група не се споделят:** те са лично твои.

## Нова учебна година

От 1 септември в **Програма** има карта **Нова учебна година**: **Копирай промпта с моите имена** → дай го на AI с новата снимка → внеси програмата. School Widget запазва твоите кратки имена, важни часове и група, показва в синьо какво се е променило и пита „В кой клас си сега?“.

## Какво става после

- **Обновяване:** веднъж на ден School Widget проверява версиите (releases) тук, в GitHub, за нова версия и се обновява сам. Изтеглената версия се проверява, преди да замени старата; последните 3 версии се пазят и ако нова версия не тръгне, старата се връща сама. Програмата и настройките ти не се променят. Виж **Настройки → Версия** (или „Обновяване“ в менюто): там са **Обнови**, **Провери сега**, **Предишна версия** и превключвателят за автоматично обновяване.
- **Ако промениш кода на ръка,** автоматичното обновяване спира, за да не изтрие промяната ти. **Обнови все пак** в Настройки → Версия го пуска пак.
- **Бета:** докосни номера на версията 5 пъти → **Канал: beta**. Получаваш новите версии първи, за проба. Обратно: същото, **stable**.
- **Поверителност:** програмата ти остава на телефона. School Widget се свързва само с github.com, за да провери за нова версия. Нищо не се изпраща.

## Настройки

Пусни скрипта → **Настройки**: език (български / English), тема, напомняне преди час, календар с неучебни дни на училището (по подразбиране „Off-School“), календар с контролни, свързани часове. За един уиджет: задръж пръст → **Edit Widget** → **Parameter**, например `lang=en`, `theme=dark`, `update=off`.

## Ако нещо не работи

- **Прекият път казва, че няма папка Scriptable:** отвори Scriptable веднъж и опитай пак. Ако пак не стане: Settings → [името ти] → iCloud → включи **Scriptable** (iCloud Drive).
- **Линкът е повреден** (чатът го е отрязал): копирай цялото съобщение на AI-а → School Widget → **Внеси програма** → **Постави от AI**, или ползвай скрипта за инсталиране.
- **Странни знаци вместо кирилица:** кодът е копиран с грешно кодиране. Копирай го пак от адреса в стъпка 2, в Safari.
- **Уиджетът не се променя:** iOS обновява уиджетите, когато реши. Задръж пръст → **Edit Widget** → избери скрипта пак, или махни уиджета и го добави наново.
- **„Няма връзка с GitHub“:** няма интернет или GitHub не отговаря. Уиджетът работи и без интернет; ще провери за нова версия по-късно.
- **Грешка в програмата:** School Widget казва кое не е наред (ден и час). Ако файлът с програмата се повреди, предлага **Възстанови** последната запазена.

Проблем или идея: [Issues](https://github.com/batvani/school-widget/issues).

---

# School Widget (English)

**A school timetable widget for iPhone:** the class now, the time left, the next room, the next break. It runs in the free app [Scriptable](https://apps.apple.com/app/scriptable/id1405459188). The widget's text is Bulgarian by default; English is one setting away.

- **Small and medium:** the class now (or next), minutes left, the room.
- **Large:** the whole day with the current class marked, and the next holiday with the school days left until it.
- **Lock Screen:** round, rectangular and one-line.
- **Full screen** (tap the widget): today, the week, the days off, settings.
- The official Bulgarian holidays and days off for 2026/27 are built in. It updates itself.

## Install step by step

About 10 minutes. You photograph the timetable, an AI reads it, one tap installs it.

0. **Install Scriptable** from the App Store (free) and **open it once.** *Why:* that creates its folder in iCloud Drive, where School Widget and your timetable are saved.
1. **Open an AI app** (ChatGPT, Gemini, Claude, Copilot …), paste the prompt from [ai/START.md](ai/START.md) and **attach a photo of your timetable** (or a screenshot, a PDF). The AI opens the instructions here and first writes their version line ("Uchilishte instructions …"), so you know it really read them. If it can't open links: open [ai/INSTRUCTIONS.md](ai/INSTRUCTIONS.md), copy all of it and paste it into the chat.
2. **Answer its questions,** check the table and say **"Yes"**. *What's happening:* the AI is only collecting your timetable; nothing is installed yet. Teacher names are never written down.
3. **First time only: add the Shortcut** "School Widget Installer" from the link in the AI's last message (or on the install page) → **Add Shortcut**. *Why:* iOS shows its steps before adding it: it only saves files into Scriptable's folder and downloads School Widget from github.com.
4. **Tap the AI's link.** A page opens with a short preview (class, days, number of classes) → **Install**. *Your timetable is inside the link; the page sends nothing.* If the link isn't tappable in the chat: copy it into Safari.
5. **"Open in Shortcuts?"** → **Open**. *Why it asks:* a web page wants to start a Shortcut.
6. **First time only:** the Shortcut asks to use Scriptable's folder and to connect to `batvani.github.io` → **Allow** (or **Always Allow**). *Why:* to save your timetable and download School Widget (about 220 kB).
7. **Scriptable opens by itself** and runs School Widget.
8. If it asks for **Calendars**: allow only if you'll use a calendar for days off or tests (see Settings); otherwise **Don't Allow**. The official holidays are built in.
9. **Check the table, pick your group** ("Коя група си?") and tap **Запази** (Save). *What's happening:* your timetable is saved in a file next to the script; updates never touch it.
10. **Add the widgets.** The "Готово" screen shows how; in short:
    - **Home Screen:** touch and hold an empty spot → **Edit** → **Add Widget** → search **Scriptable** → pick a size → **Add Widget**. Then touch and hold the new widget → **Edit Widget** → **Script** → **School Widget**. Tap outside it.
      *You should see* the class now or next. If it says "Select script in widget configuration", do the **Edit Widget** step again.
    - **Lock Screen (optional):** unlock with Face ID but stay on the Lock Screen → touch and hold → **Customize** → **Lock Screen** → tap the box under the clock (round or rectangular) or the date line (one-line) → **Scriptable** → pick a shape → **tap the placed widget again** → **Script** → **School Widget** → **Done**.
11. **Nothing else.** Once a day School Widget checks for a new version and updates itself (see below).

**Without the Shortcut** (or if nothing happens): the AI also gives a small install script with your timetable inside. 1. Tap **Copy** on it. 2. In Scriptable: **+** → touch and hold the empty editor → **Paste** → **Done** → ▶. 3. It saves your timetable, downloads School Widget and opens it: go on from step 8. 4. You can delete the install script afterwards.

**Already have School Widget** (a new timetable, another class): in School Widget, **Внеси програма** → **Постави от AI** (after copying the timetable from the AI), or tap the link → **I already have School Widget**. To change it by hand: **Програма** → **Промени програмата**.

**Without an AI:** in Safari open `https://batvani.github.io/school-widget/school-widget.js` → touch and hold the text → **Select All** → **Copy**; in Scriptable **+** → **Paste** → name the script **School Widget** → ▶. It starts with a demo timetable: **Програма** → **Промени програмата** to make it yours.

## Share with your class

One photo and one AI chat are enough for the whole class. In School Widget: **Програма** → **Сподели програмата**:
1. **Изпрати линк** (send a link) opens the iPhone share menu (Messages, WhatsApp, AirDrop…). Your classmate taps the link → **Install**, as in the steps above.
2. **Покажи QR код** (show a QR code): your classmate scans it with the iPhone camera.
3. **Запази като файл** (save as a file): `10а-програма.json`; your classmate imports it with **Внеси програма** → **От файл**.

The whole timetable is shared with **both groups** (everyone picks theirs). **Your important (red) classes and your group are not shared:** they are yours.

## A new school year

From 1 September, **Програма** has a **Нова учебна година** card: **Копирай промпта с моите имена** (copy the prompt with my names) → give it to an AI with the new photo → import the timetable. School Widget keeps your short names, important classes and group, shows what changed in blue, and asks which grade you're in now.

## After that

- **Updates:** once a day School Widget checks this repo's releases for a new version and updates itself. A download is checked before it replaces anything; the last 3 versions are kept, and if a new one fails to start, the previous one comes back by itself. Your timetable and settings don't change. See **Settings → Версия** (or "Обновяване" in the menu) for **Update**, **Check now**, **Previous version** and the automatic-updates switch.
- **If you edit the code by hand,** automatic updates pause so your change isn't overwritten. **Update anyway** in Settings → Версия turns them back on.
- **Beta:** tap the version number 5 times → **Channel: beta** to get new versions first. Back: the same, **stable**.
- **Privacy:** your timetable stays on the phone. School Widget only contacts github.com to check for a new version. Nothing is sent.

## Troubleshooting

- **The Shortcut says there's no Scriptable folder:** open Scriptable once and try again. If it still fails: Settings → [your name] → iCloud → turn on **Scriptable** (iCloud Drive).
- **The link is broken** (the chat cut it): copy the AI's whole message → School Widget → **Внеси програма** → **Постави от AI**, or use the install script.
- **Odd characters instead of Cyrillic:** the code was copied with the wrong encoding. Copy it again from the address in step 2, in Safari.
- **The widget doesn't change:** iOS refreshes widgets on its own schedule. Touch and hold → **Edit Widget** → pick the script again, or remove the widget and add it back.
- **"Can't reach GitHub":** no internet, or GitHub isn't answering. The widget works offline and checks again later.
- **A mistake in the timetable:** School Widget says what's wrong (day and period). If the timetable file gets damaged, it offers to **restore** the last saved one.

## Settings

**In the app:** tap the widget → **Настройки / Settings** tab. Changes save immediately and widgets pick them up on their next refresh.

| Setting | What it does |
|---|---|
| Language | Bulgarian or English widget text |
| Theme | Automatic (follows Light/Dark Mode), Dark, Light |
| Days-off calendar | Calendar whose events mark days off (default `Off-School`) |
| Reason for the day off | Shows the holiday's name, e.g. "Коледна ваканция" (large widget when there is room, rectangular Lock Screen) |
| Countdown | "Коледна ваканция след 34 учебни дни" at the bottom of the large widget, when the day is short enough to leave room |
| Tests calendar | Events like "Контролно по химия" turn that class red (default `Контролни`) |
| Reminder before class | 3/5/10/15 minutes before each class (off by default) |
| Tap opens this menu | On/off |
| Coloured links | Lines between linked rings in the rings' colours (green, red) or grey (on by default) |
| Coloured outlines | The boxes in the medium lists in colour too (only with coloured links; off by default) |
| Box around | The whole row, or only the room, in the medium lists (whole row by default) |

**Per widget:** use the widget's *Parameter* field, with entries separated by `;`:

```
Off-School; countdown=off; reason=on; tests=Контролни; tap=off; lang=en; theme=dark
color=off; outline=on; box=room
```

`update=off` turns automatic updates off and `channel=beta` gets test versions first (both also in Settings → Версия).

A word without `=` is the days-off calendar name. Bulgarian keys also work (`ваканция=не`, `език=en`, `тема=тъмна`, `цвят=не`, `рамки=да`, `рамка=стая`).

**Medium widget layouts** (set only here, per widget):

| Parameter | What the medium widget shows |
|---|---|
| (nothing) | The class in focus and the next three classes |
| `layout=day` (`изглед=ден`) | The class in focus and the whole day with start times |
| `layout=list` (`изглед=списък`) | The class in focus on top, the whole day below in two columns with class numbers |

## Development

Everything that makes School Widget is in this repo; the phone only needs `school-widget.js`.

```sh
npm install                      # Playwright (Chromium) for the page tests and screenshots
npx playwright install chromium
npm test                         # every test in tools/test/ (+ the privacy test, see below)
npm run preview                  # all widget sizes × 16 moments → tools/preview/out/final-bg.html
npm run tree -- out/a            # the regression check: one hash per case (~18,800) → out/a/tree.txt
npm run shots -- readme          # img/widgets.png (also: editor, share, version, install)
npm run serve                    # the script over Wi-Fi, to paste into Scriptable on a phone
```

| Path | What it is |
|---|---|
| `school-widget.js` | The whole widget: one Scriptable script |
| `install/` | The install page (GitHub Pages) |
| `ai/` | What an AI app reads: the prompt (`START.md`), `INSTRUCTIONS.md` (made by `node tools/instructions.js` from `tools/ai/INSTRUCTIONS.template.md`; don't edit it by hand), `schema.json`, `example.json`, `encode.py`, the install script. `ai/tests/`: AI tests |
| `shortcut/STEPS.md` | How the Shortcut "School Widget Installer" is built |
| `tools/preview/` | A fake Scriptable in Node (`mock.js`, `run.js`) that renders every widget to HTML/PNG; `fixtures/` are made-up timetables |
| `tools/test/` | The tests; `all.js` runs them |
| `tools/release.js` | Checks a release and writes `out/release/` (the script, `version.json`, the notes) |

**Regression check:** run `npm run tree -- out/before` before a change and `npm run tree -- out/after` after it; `diff out/before/tree.txt out/after/tree.txt` lists exactly which cases render differently.

**Privacy test:** `tools/test/privacy.test.js` searches every file for the words in `~/.config/school-widget/private-words.txt` (one per line; on GitHub the secret `PRIVATE_WORDS`). Without the list it is skipped locally.

**Releases:** bump line 4 and `VERSION`, add the version to `CHANGELOG.md` with a `Накратко:` and an `In short:` line, then `git tag vX.Y.Z && git push origin vX.Y.Z`. The release workflow runs the tests and makes a **pre-release** (beta). To make it stable: edit the release on GitHub → untick **Set as a pre-release** → **Update release**.

Problems or ideas: [Issues](https://github.com/batvani/school-widget/issues).

License: [MIT](LICENSE).
