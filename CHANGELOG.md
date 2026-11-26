# Changelog

## 1.8.7 — 26 Nov 2026
Накратко: Менюто се отваря направо, без списък за избор. Днес се побира на един екран, а Програма показва седмицата първо, с бутони под нея. Зеленото зад текущия час е по-ясно.
In short: The menu opens straight away, with no list to choose from. Today fits on one screen, and Програма shows the week first, with buttons under it. The green behind the current class is clearer.

- **Running School Widget** in Scriptable opens the full-screen menu on **Днес** at once; the start list (Разписание, Настройки, the widget previews, Обновяване, Внеси програма) is gone. Importing is in **Програма → Внеси**, updates in **Настройки → Версия**; once after an update or a rollback the menu opens on Версия, so its notice is seen.
- **Днес** fits on one screen: the rows share the height left (44–64 pt, rings 42 or 36 pt), the current class's row is tinted green, the hero card and margins are tighter.
- **Програма** shows the week first. The four big buttons became round icon buttons under it (Редактирай, Внеси, Предишни, Сподели). The current period's cell is tinted green instead of outlined; names are sized so the longest word fits; a 7-period week and the buttons fit on one screen.
- **The green tint** behind the current class is stronger everywhere (widgets, boxes, the menu, the site): 32 % in Dark Mode (was 18 %), 24 % in Light Mode (was 16 %).
- **The site:** the menu phone on the landing page follows the new Днес and Програма; buttons answer hover (mouse only) and touch, copy buttons pop or shake, the menu button turns into ✕; Reduce Motion turns the movement off.

## 1.8.6 — 25 Nov 2026
Накратко: Обратното броене до ваканцията е в дни, не в учебни дни. Менюто има за заглавие датата и бутон за споделяне на School Widget. Нова начална страница на сайта.
In short: The countdown to the next break is in days, not school days. The menu's heading is the date, with a button to share School Widget. A new home page for the site.

- **The countdown** (the large widget's bottom line, Днес and Почивни in the menu) counts days, weekends included, until the break starts: "Коледна ваканция след 29 дни", instead of counting only school days.
- **The menu's heading** is the date (it was the date small and "Разписание" big). Beside it a share button sends School Widget's page (`batvani.github.io/school-widget/`) through the share sheet. A long date ("Понеделник, 28 септември") breaks after the weekday.
- **The landing page** (the site's root, `batvani.github.io/school-widget/`, in English): an iPhone with the widgets and apps, every widget size, **Try it** (a slider and shortcuts through a made-up school day, Dark / Light), the full-screen menu to tap through, the holidays in your calendar, the ways to get a timetable, the install steps and the questions. The widgets on it are hand-made copies that the tests compare with the real script at every moment.
- **AI on a computer:** on a computer the page turns the AI's whole answer into a QR code to scan with the iPhone (hidden on a phone).
- **Install:** the steps live on the landing page (`#install`); `install/` is only the automatic page for timetable links (`#z=`), which opens School Widget at once and falls back to the landing page. The AI's last lines and the docs point to `#install` / `#computer`.
- Small, medium and the Lock Screen don't change (tree.js: only large and the menu).

## 1.8.5 — 24 Nov 2026
Накратко: Инсталирането и програмата са отделни: първо School Widget, после той пита за програмата (Постави, линк, QR код, AI или на ръка). Ваканциите идват от интернет за твоя клас и могат да влязат в календара ти. Град по желание.
In short: Installing and the timetable are separate: first School Widget, then it asks for your timetable (Paste, a link, a QR code, an AI or by hand). The holidays come from the internet for your grade and can go into your calendar. An optional city.

- **Install:** the install page has three steps (Scriptable, add the Shortcut, run it), with the install script and a way by hand under "Не става с прекия път?". The Shortcut and the install script only install the code and open School Widget; the timetable no longer goes through them.
- **The landing page:** with no timetable yet, School Widget shows only **Внеси програмата си** (no tabs, no demo): **Постави** and **Сканирай QR код** (how to use the Camera, or Photos for a QR picture), **От файл**, then **Направи я с AI** (copies the whole prompt, instructions included, for AIs that can't open links) / **Въведи я на ръка**. A copied timetable is offered on the first start. It warns when the script isn't called "School Widget". No update check before the first timetable.
- **The editor:** **За теб** on top (grade, group, city, and on import "the holidays in your calendar", which opens the calendar page after Save), then the timetable; subjects, bells and days off are folded under **Подробности** when importing. Official days off that an imported timetable repeats are dropped from its own.
- **Links:** a timetable link opens the page's preview → **Отвори в School Widget** (straight into Scriptable). "Още нямаш School Widget?" copies the timetable and shows the install. The page also turns an AI answer from a computer into a QR code.
- **The AI's answer** ends with "copy this whole answer → School Widget → Постави"; no install script or Shortcut link inside it any more.
- **Holidays:** the official days off are downloaded daily from GitHub Pages (`holidays.json`, from `holidays/list.json`) instead of being built in, so a change needs no release. They include the national exams (матури, НВО) for the grades that sit them and the days some cities declare.
- **City** (Settings or the editor's За теб, optional) adds a city's own days off.
- **Calendars:** your own days-off calendar and the tests calendar are picked from your calendars (found even after a rename); new installs read none. Settings from before 1.8.5 keep "Off-School" and "Контролни".
- **The holidays in your calendar app:** a calendar page (Почивни → **Добави ваканциите в календара си**) subscribes Apple, Google or any calendar app to your grade's days off; it follows the class into the next grade.
- **The widgets don't change** (checked in 18,855 cases); the menu's cases change (setup page, Settings, the Почивни button).
- **Предишни програми** (Програма): the last 5 saved timetables, each restored (it leaves the list, the replaced one joins it; never two the same) or deleted, and **Изтрий всички**. It replaces **Върни предишна** in the editor.
- The editor's **Почивни дни** lists only your school's own days off: the official ones come by themselves and are no longer listed with switches.
- **Smaller download:** a release publishes a squashed copy of the script (about 203 kB instead of 255 kB); the readable one stays in the repo. Unused code from before 1.8.5 is gone (the old welcome card, "the timetable in the code has changed", unused icons and strings).
- **The last day of school** is always the official one for the grade (30 June without a grade): there's no field for it any more, and one set before is dropped. A missing grade is a warning, and **Клас** is the first thing in **За теб**.
- **English file names:** everything is in one folder, `school-widget/` (`settings.json`, `data.json`, `state.json`, `holidays.json`, `history/`, `backups/`), instead of `uchilishte/` and `uchilishte-settings.json`. The old files are copied once on the first start and left in place, so a rollback to 1.8 still finds them. The import file is `school-widget-import.txt`, a saved timetable is `<class>-timetable.json`, the page links are `school-widget://`, the clipboard marker is `school-widget:z:` and the AI's version line is "School Widget instructions". The old import file name and `uchilishte:` markers are still read.
- **Docs:** a short README; settings in `docs/SETTINGS.md`, development and the holiday list in `CONTRIBUTING.md`.

## 1.8.0 — 22 Nov 2026 (the first public version)
Накратко: Първата публична версия. Обновленията идват от версиите (releases) в GitHub: бета е предварителна версия, стабилна е последната.
In short: The first public version. Updates come from the GitHub releases: beta is a pre-release, stable is the latest release.

- **Updates from GitHub releases** instead of the `stable` / `beta` branches: stable reads the latest release's `version.json`, beta the newest release of all (pre-releases included); the script downloads from the release's own tag (`releases/download/v<version>/`), with the same checks as before (id line, version, size, fingerprint, compiles, backups, rollback).
- **Edited by hand** is found by comparing this file with its own release's fingerprint (looked up once per version and remembered), instead of a list of every earlier release. A copy that was never released still pauses auto-update; offline changes nothing.
- **Addresses:** the install script, the Shortcut and the AI prompt use GitHub Pages (`batvani.github.io/school-widget/`), which the Pages workflow fills with the install page, `ai/` and the latest stable release's script.
- **The widgets don't change.**
- **The repo:** one public repo with everything (tools and tests included); releases are made by the release workflow from a tag; a privacy test checks every file against a private word list. Removed: `publish.js`, `releases.json`, `with-timetable.js`, `validate.js`, `snapshot.sh` / `snapdiff.js`, `ai/encode.js`, the build plans. The screenshot scripts are one `tools/preview/shots.js`; `npm test` runs every test.

## 1.7.0 — 22 Nov 2026 (not released on its own: 1.8.0, the first public version, includes it)
Накратко: Сподели програмата с класа (линк, QR код, файл), без твоите важни часове и група. От 1 септември: нова програма, която пази твоите имена, важни часове и група. Разделът „Седмица“ вече е „Програма“.
In short: Share your timetable with your class (a link, a QR code, a file), without your important classes and group. From 1 September: a new timetable that keeps your names, important classes and group. The "Седмица" tab is now "Програма".

- **Програма** (was Седмица): the tab's new name (the user asked).
- **Сподели програмата** (in Програма): what is shared and what isn't, then **Изпрати линк** (the iPhone share sheet with the install link; the page compresses the timetable), **Покажи QR код** (drawn in the page by a built-in encoder after Project Nayuki's, MIT; only for links up to 2,000 characters) and **Запази като файл** (`<class>-програма.json`). Shared: both groups; not shared: the group picks and every important class.
- **A shared timetable:** importing it says so and asks for the group.
- **Нова учебна година** card in Програма, from 1 September until a timetable for the new school year is saved or "Не сега" (once a year): **Копирай промпта с моите имена** (the start prompt plus the short names, very short names, no-room subjects and the group pick), **Внеси програма**.
- **Importing over your own timetable** keeps your short and very short names, important classes (when the new one has none), group picks (by label) and, in the same school year, the school's own days off and last day. Changed cells are outlined in blue and listed ("беше …"); a name that is gone (a nickname) is listed with **Избери клетки** (tap the cells; red if it always was) / **Не е нужно**.
- **A new school year:** "В кой клас си сега?" (last year's grade + 1, from 1 to 12), with a note when the built-in days off are last year's. Saved timetables now carry `meta.schoolYear`.
- **The widgets don't change:** checked in 18,855 cases; only the menu's 270 cases change (the tab's name, the share button).
- **Tools:** `tools/test/share.test.js` (9 tests; reads the QR code back with jsQR when `JSQR=<path>` points to it), `tools/preview/share.js` (renders), `tools/preview/sketch-phase7.js`; the mock has `ShareSheet`, `DocumentPicker.exportString` and `FileManager.modificationDate`.

## 1.6.0 — 21 Nov 2026 (not released; included in the first public version)
Накратко: Внасяш програмата си от AI (копираш отговора и натискаш „Постави от AI“) и я поправяш в таблица. Седмица → Промени програмата: предмети, групи, звънци, почивни дни, последен учебен ден, връщане на предишна.
In short: Import your timetable from an AI (copy its answer, tap "Постави от AI") and fix it in a table. Week → Edit the timetable: subjects, groups, bells, days off, the last day of school, and going back to an earlier one.

- **Import:** from the clipboard ("Постави от AI": the whole AI answer, a ```json block or a link), a file ("От файл"), a link that opens the script with `?data=…`, or the file `uchilishte-import.txt` next to the script (the installer of a later version puts it there). The menu has "Внеси програма"; the demo shows a welcome card with "Копирай промпта за AI" and "Внеси програма".
- **"Провери програмата":** the week as a table; cells to look at have a "!" (an unsure "?", a missing room, a split class), with the list of warnings under it. Tap a cell: subject (pick or type), room, important, free period, and "Само тази клетка" or "Всички „…“" (rename the subject everywhere). A split class asks "Коя група си?" before saving. Errors block saving; warnings ask once ("Запази все пак"). Nothing is saved until "Запази".
- **"Готово" screen** after the first save, with the steps for adding the widgets.
- **Week → Промени програмата:** the same table for the saved timetable, plus subjects (name, short and very short name, no room, with the width warnings), groups, bells (add or remove a period), the official days off with a switch for each day the school has classes (`notOff`), the school's own days off, the grade and the last day of school, and "Върни предишна" (any of the last 5; the replaced one goes into the history too).
- **The widgets don't change:** checked in 18,855 cases; only the menu's 270 cases change (the new buttons and the editor). The width warning now names the widget in Bulgarian ("за малкия уиджет").
- **Tools:** `tools/preview/live.js` runs the menu page in Chromium with the real script behind it; `tools/preview/editor.js` renders every new screen; `tools/test/editor.test.js` (16 tests).

## 1.5.0 — 18 Nov 2026 (not released; included in the first public version)
Накратко: Обновява се сам (Настройки → Версия). Програмата се пази във файл, който обновяванията не пипат. Вградени са ваканциите и неучебните дни за 2026/2027 г. и последният учебен ден за всеки клас.
In short: Updates itself (Settings → Версия). The timetable is kept in a file that updates never touch. The 2026/27 holidays, days off and the last day of school for every grade are built in.

- **Your timetable moves into a data file** (`uchilishte/data.json` in Scriptable's documents folder, next to the settings). The first time 1.5.0 runs (widget or app), it moves the timetable from the code there by itself. From now on, pasting a new version of the code never touches your timetable. If you later change the timetable in the code by hand, the script asks in Scriptable whether to use it ("Програмата в кода е променена"). A damaged data file falls back to the timetable in the code and offers to restore the last saved one ("Възстанови"); the last 5 timetables are kept.
- **The official days off are built into the code** (`HOLIDAYS`, school year 2026–27), so next year's arrive as an update. A timetable can add its own (`daysOff`) or cancel an official one (`notOff`). Checked against МОН's order for 2026/27: the unnamed days now have names (19 and 21 May: the matura exams, 25 May, 18 and 21 June: НВО), the second spring break is "Великденска ваканция" (30 April – 9 May), and the last day of school is per grade (`meta.grade`): grades 1–3 on 2 June, 4–6 on 16 June, 7–11 on 2 July, 12 on 13 May. Entries can be limited to some grades (12th grade has a shorter spring break and school on 5 and 7 May).
- **A demo timetable is built in** (class 10а, made up) instead of a real class: it is shown until you put in your own and is never saved as yours.
- **Groundwork for importing timetables** (not used by any screen yet): timetable checks with Bulgarian and English messages, conversion of older formats (`meta.schema`), split classes with groups, reading a timetable from a link, the clipboard or a whole AI answer, and a fingerprint for updates.
- **Updates by itself** (works once the public repo exists): once a day, after the widget has drawn itself, it checks GitHub for a new version, checks the download (id, version, size, fingerprint, that it compiles) and installs it. It keeps the last 3 versions; a version that crashes on its first run is replaced by the previous one by itself and skipped from then on. Hand edits pause automatic updates. **Settings → Версия** shows the version, what's new, "Обнови", "Провери сега", "Предишна версия" and the automatic-updates switch; tapping the version number 5 times shows the beta channel. The app menu has "Обновяване". Parameter: `update=off`, `channel=beta`.
- **Nothing else you can see changes:** every widget, the Lock Screen and reminders were checked against 1.4.7 in 18,855 cases and come out identical; the menu changes only by the new Версия section. The large widget fits up to 7 periods a day readably (8 rows would be under 25 pt).
- **Tools:** previews from any timetable file (`DATA_FILE=…`), `tools/validate.js` to check a timetable, `tools/test/data.test.js`, and `tools/serve.sh` to open the script on the iPhone over Wi-Fi.

## 1.4.7 — 18 Nov 2026
- **Default medium: the period number is centred in the ring again** when a line comes in from the hero above it (the ring's picture is 6 pt taller at the top there, and the number was centred on the picture, so it sat 3 pt high). Large, small and the Lock Screen are unchanged.
- **Menu (Today): one colour for the whole line between two rings.** Finished rows were dimmed with opacity, so the half of the line inside them came out darker. Their colours are now mixed with the page instead (Dark and Light Mode), so the line keeps one colour.
- **Menu: a clean bridge between rings.** The line runs under the rings and ends halfway into their outline (the rings' tracks are opaque now), so its square ends no longer show when zoomed in.

## 1.4.6 — 18 Nov 2026
- **Code cleanup, nothing you can see changes.** The script is simpler and a little shorter: repeated pieces became shared helpers, vacation is handled in one place, and dead code and two unused style rules in the menu are gone. Every widget, the menu, reminders and settings were checked against 1.4.5 in about 18,800 cases (all sizes and layouts, every 10 minutes of a school week, holidays, both languages, Light and Dark Mode, many Parameter entries) and come out identical.
- **Repository:** the old plans and concept sketches for 1.1–1.3 (`docs/`) are removed; they are in git history.

## 1.4.5 — 18 Nov 2026 (approved on the phone; merged into main)
- **Default medium: no seam across the line between rings,** the same fix as large in 1.4.4 (the ring's picture is a whole number of screen pixels high, 32.67 pt instead of 32.4).
- **Menu: solid grey for upcoming rings and their lines,** as on the widgets since 1.4.2. Finished rows stay dimmed.

## 1.4.4 — 18 Nov 2026
- **Large: the times are full size again.** 1.4.3's overlapping rows (a stack with negative spacing) made iOS shrink every start time. That is gone; instead every row is a whole number of screen pixels high and every ring is drawn the same way (as tall as its row), so the ring pictures meet exactly and the line between rings has no seam. The layout is the same as 1.4.2.

## 1.4.3 — 18 Nov 2026
- **Large: no seam across the lines between rings.** Each ring is its own picture, and where two met iOS softened both edges, which showed as a faint line across the connector (like a separator). The rows now overlap by half a point, so the pieces cover each other. Row positions and the list's height are unchanged.
- **Large and the medium lists: ФВС's row is laid out like the others.** It gets an invisible stand-in for the room, since a row without one made iOS shrink its start time.

## 1.4.2 — 18 Nov 2026
- **Upcoming grey is solid.** Rings of classes still to come, the lines between them and the boxes in the medium lists are an opaque grey now, so a line is exactly its rings' colour on any background. Finished classes stay dimmed (see-through). The grey looks about the same as before: #939395 in Dark, #a9a9ad in Light, iOS's system grey #8e8e93 in automatic mode.

## 1.4.1 — 18 Nov 2026
- **Lines between rings are the rings' own grey.** A ring is two see-through layers (track + colour); the line had only one, so it was a different grey, and where it overlapped the ring a lighter patch showed. The line now has both layers and stops at the ring's edge.
- **Large: dashed again on 6-class days.** The same-room line is dashed when the rings are far enough apart (6 classes) and split in the middle only on 7-class days, where dashes are too short.
- **ФВС row on large:** the empty room no longer makes iOS shrink the row's start time (no empty texts anywhere now; the rectangular Lock Screen widget skips the room line for ФВС).

## 1.4.0 — 17 Nov 2026
- **Links in the menu too.** *Today:* a line between the rings of back-to-back classes in the same room (solid for the same class, dashed for the same room; colours as set in Settings). *Week:* boxes around them, as in the medium lists (solid boxes close with rounded corners, dashed ones run on straight past them; coloured with *Coloured outlines*).
- **After the last bell, Today shows only the next school day,** no longer today's finished classes above it.

## 1.3.2 — 17 Nov 2026
- **ФВС without a room, laid out properly:** on large the top band stays on the left (it was floating towards the middle); in `layout=list` the minutes sit on the right edge, where the room would be.

## 1.3.1 — 17 Nov 2026
- **Room 3 is "03"** everywhere (widgets, menu, reminders, Lock Screen).
- **ФВС shows no room:** an empty space where the room was, without "стая", and no stray "·" in lines like "ФВС · 40 мин". It is never linked to the class before or after it.

## 1.3.0 — 17 Nov 2026
Back-to-back classes in the same room are linked, so you can see at a glance when you stay put.
- **Same class** (same subject, same room, e.g. ПП Физика 1–2 in 407): a solid line or box. **Same room only** (e.g. Английски + Час на кл. in 101): a dashed one. A different room is never linked. The long break doesn't break a link.
- **Large and the default medium:** a line between the rings. On large, the same-room line has a gap in the middle (the rings are close together there, dashes didn't read). The default medium also draws a short fading line above its first ring when that class follows the current one in the same room.
- **`layout=day` and `layout=list`:** a box around the linked rows. A solid box closes with rounded corners; a dashed box that meets it runs on straight past them. The current class's tint fills its box right up to the line. In `layout=list` a box that goes on in the other column is left open there. Neighbouring boxes are 2 pt apart, so rows are up to 1 pt lower; text stays 13 pt.
- **New settings (menu → Settings → "Свързани часове"):** *Coloured links* (on: lines between rings are green next to the current class, red between important classes; off: grey), *Coloured outlines* (only with coloured links; off by default: boxes grey) and *Box around* the whole row or only the room. With "only the room", rooms sit centred in a fixed column (42 pt, wider for "Салон"), and a name that doesn't fit next to it uses a shorter form ("Математика" → "Мат.").
- **Per widget:** `color=off`, `outline=on`, `box=room` / `box=row` in the Parameter win over the settings (Bulgarian: `цвят=`, `рамки=`, `рамка=стая`).
- **Unchanged:** small, the Lock Screen widgets, the menu's Today/Week/Days off. The previous version is in git: `git show 51b0974:uchilishte-widget.js`.

## 1.2.2 — 17 Nov 2026
- **Just "08:00", no "в".** More than an hour before the first class, the small and medium widgets (and the menu) show the start time on its own; it is 34 pt, 2 pt bigger than before.
- **Round Lock Screen widget: the solid disc only during a class.** It used to fill for an important class at any time (e.g. the evening before). Now it is an outline ring outside class; the rectangular and one-line widgets are unchanged.

## 1.2.1 — 12 Nov 2026
- **Room number the same size everywhere.** When the small or medium widget shows a class that isn't today (after school, weekends) or a test, the room was 20 pt instead of 24. It is 24 now; the note under the subject sits 2 pt closer to make room.

## 1.2.0 — 11 Nov 2026
Two more looks for the medium widget. The usual one stays the default; to switch, long-press the widget → Edit Widget → Parameter.
- **`layout=day` — the class now, plus the whole day with start times.** The left part is the same block as on the small widget (ring, room, minutes, subject), a little narrower. The right part lists every class of the day: start time, subject, room.
- **`layout=list` — the class now on top, the whole day below.** The top line has the ring, the subject with a note under it ("до 10:35", "контролно"), the minutes and the room. Below it the day is in two columns (classes 1–4, then 5–7): number, subject, room.
- **In both lists:** finished classes are dimmed, the class in focus has a tinted background (green during a class), important classes are red. After school they show the next school day.
- The rows are too low for rings, so the lists use plain start times or numbers. List text is 13 pt.
- Bulgarian works too: `изглед=ден`, `изглед=списък`.
- **Unchanged:** the default medium, small, large, the Lock Screen widgets, the menu. The previous version is in git: `git show 497262e:uchilishte-widget.js`.

## 1.1.4 — 10 Nov 2026
- **"стая" is always shown above the room,** also for "Салон" (it used to be blank there), on small, medium and large.

## 1.1.3 — 10 Nov 2026
- **Equal space on both sides of every divider line:** 16 pt around the medium widget's line (unchanged), 8 pt around both lines on the large widget, measured to what you see (the ring or the text). The rows now take exactly the height that is left: about 33 pt with 6 classes, 28 pt with 7.

## 1.1.2 — 10 Nov 2026
- **Numbers in the small rings** (medium and large) were black on the phone: colours that follow Light/Dark Mode can't be used inside a drawn picture. They are normal text again, centred by the ring's own frame.
- **Large, bottom line** is laid out on its own: icon, 8 pt, the break's name, the count on the right. It no longer follows the list's columns.
- **Large, rows fill the widget:** the widget's real height is looked up from the screen size (352 pt on the user's iPhone, measured; Apple lists 345), so rows are about 31 pt on 6-class days and 27 pt on 7-class days instead of leaving a gap above the bottom line.

## 1.1.1 — 10 Nov 2026
Fixes after the first look on the phone.
- **Medium:** 16 pt on both sides of the dividing line (the same as the outer margin), instead of 8. The rows' second line is now "11:50 · 101" (no "стая"), so it stays at 12 pt in the narrower column.
- **Large, list:** the rings and times no longer shift sideways from row to row, and the names are left-aligned under the hero's name. iOS centres what is inside a fixed-width horizontal stack, so the columns are now built so this can't happen.
- **Large, numbers in the small rings** are now drawn into the ring picture, so iOS centres them exactly.
- **Large, bottom section:** the countdown to the next break is always shown, under a line at the bottom: icon, the break's name (15 pt) and "11 уч. дни" on the right. To make room, the top part is smaller (ring 64, minutes 32) and rows are 29 pt on 6-class days and 25 pt on 7-class days.

## 1.1.0 — 10 Nov 2026
- **New layout for the Home Screen widgets,** built on a grid: every widget is split into sectors, with 16 pt margins and at least 8 pt between neighbours.
- **Small:** ring with the period number and the room on top; big minutes and the subject below. On a test day, or when the class is on another day, a short note ("контролно", "Утре") is added and the rest gets a little smaller to make room.
- **Medium:** two equal halves with a thin line between them: the class in focus on the left (as on the small widget), the next three classes of the same day on the right (ring with the number, name, time and room). An "End" row shows when school ends.
- **Large:** the class in focus on top, then the whole day as a list with the time, name and room in three aligned columns. Finished classes are dimmed, the class now is highlighted. The countdown to the next break (or the holiday's name on a day off) appears at the bottom when the day is short enough to leave room.
- **No longer shown:** "Край за днес" and the holiday name on small and medium, subject icons on the large widget.
- **Unchanged:** Lock Screen widgets, the full-screen menu, reminders, settings.
- **Under the hood:** all sizes come from one set of design tokens (`T`); new preview checks (`tools/preview/check.js`, `snapdiff.js`). The previous version is in git: `git show a54297b:uchilishte-widget.js`.

## 1.0.1 — 6 Nov 2026
- **Code cleanup:**
  - Removed unused functions (`countdownText`, `liveSlots`, `daySlots`) and unused strings.
  - Merged the two text-width tables into `emWidth`.
  - Rendering is byte-identical to 1.0.
- **Fix, rectangular Lock Screen:** a long holiday name would have been cut off; it now falls back to "Почивен ден" / "Day off".
- **Fix, round Lock Screen:** the caption ("tomorrow" in English) now shrinks to fit the ring.

## 1.0 — 6 Nov 2026 (first production version)
- **Small:** ring with the period number, room corner, big minutes, subject.
- **Medium:** class now on the left, next 2 classes as rings.
- **Large:** 3 sections with divider lines: big ring + name + minutes + room · next 4 rings · list + holiday countdown.
- **Lock Screen:** rectangular, round and one-line. During a class, a filled pill and disc.
- **Holiday icons:** gift, leaf, flower, snowflake, bunny, sun, flag.
- **Full-screen menu:** Today, Week, Days off and Settings tabs, matching the widget design.
- Bulgarian or English, Light/Dark/Automatic theme, tests calendar, reminders, days off from a calendar plus a backup list.

## Earlier iterations (before 1.0)
- **First version:** rings with icons, Bulgarian UI, calendar days off.
- **Then:**
  - Settings moved into the tap menu.
  - English code and comments, plus a language switch.
  - Light/Dark Mode.
- **Layout fixes:**
  - Layout changes: Batteries-style redesign, sized for a 155 pt small widget, numbers instead of icons in rings, numbers centred correctly.
  - Scriptable layout rules discovered: the spacer minimum, left-aligned vertical stacks, columns splitting space equally.
