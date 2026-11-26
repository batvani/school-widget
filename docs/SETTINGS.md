# School Widget · settings

**In the app:** tap the widget → **Настройки** (Settings). Changes are saved at once; widgets show them on their next refresh, usually within a few minutes.

| Setting | What it does |
|---|---|
| Language | Bulgarian or English widget text |
| Theme | Automatic (follows Light/Dark Mode), Dark, Light |
| City | Optional. Adds the days off a city declares itself (e.g. a flu break). Chosen from a list |
| Your calendar | Optional. A calendar with your school's own days off (e.g. its patron's day). Picked from your calendars; Calendar access is asked only then. The official days off come by themselves |
| Reason for the day off | Shows the holiday's name, e.g. "Коледна ваканция" (large widget when there is room, rectangular Lock Screen) |
| Countdown | "Коледна ваканция след 34 дни" (days, weekends included) at the bottom of the large widget, and in Days off |
| Tests | A calendar where an event like "Контролно по химия" turns that class red. Picked from your calendars |
| Reminder before class | 3/5/10/15 minutes before each class (off by default) |
| Tap opens this menu | On/off |
| Coloured links | Lines between linked rings in the rings' colours (green, red) or grey (on by default) |
| Coloured outlines | The boxes in the medium lists in colour too (only with coloured links; off by default) |
| Box around | The whole row, or only the room, in the medium lists (whole row by default) |
| Version | Update, Check now, Previous version, automatic updates on/off. Tap the version number 5 times for the beta channel |

A calendar picked in Settings is found even after you rename it. With no calendar picked, none is read.

## Per widget: the Parameter

Touch and hold the widget → **Edit Widget** → **Parameter**, with entries separated by `;`:

```
lang=en; theme=dark; countdown=off; reason=on; tap=off
calendar=School days off; tests=Tests
color=off; outline=on; box=room
update=off; channel=beta
```

A Parameter wins over Settings, for that widget only.

- `calendar=` and `tests=` name a calendar (`tests=off` turns tests off). A word without `=` is the days-off calendar's name.
- Bulgarian keys also work: `ваканция=не`, `език=en`, `тема=тъмна`, `цвят=не`, `рамки=да`, `рамка=стая`, `календар=…`, `контролни=…`.

**Medium widget layouts** (only here, per widget):

| Parameter | What the medium widget shows |
|---|---|
| (nothing) | The class in focus and the next three classes |
| `layout=day` (`изглед=ден`) | The class in focus and the whole day with start times |
| `layout=list` (`изглед=списък`) | The class in focus on top, the whole day below in two columns with class numbers |

## The holidays in your calendar app

The [calendar page](https://batvani.github.io/school-widget/calendar/) (also **Days off** → **Add the holidays to your calendar**) subscribes your calendar app to the official days off for your grade. It works with Apple Calendar (`webcal://`), Google Calendar and any app that takes a calendar link, such as Outlook.

- It is a subscription, not a copy. Apple Calendar refreshes it within hours, Google within about a day.
- It follows your class: next September it shows the next grade's days with no change from you.

To remove it: Apple Calendar → Calendars → ⓘ next to "Ваканции · School Widget" → Unsubscribe. Google Calendar → Settings → the calendar → Unsubscribe.
