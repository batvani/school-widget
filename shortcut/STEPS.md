# Прекият път „School Widget Installer“ · how to build it

Прекият път (Shortcut) изтегля School Widget в папката на Scriptable, ако го няма, и го отваря. Програмата **не минава** през него (от 1.8.5): School Widget сам я пита, щом се отвори. Прави се веднъж, на iPhone (Shortcuts не може да се направи на компютър), и после се споделя с линк. Около 10 минути. Имената на бутоните са както ги показва iOS 18 на английски.

**Преди това:** Scriptable е инсталиран и отворен поне веднъж (така има папка Scriptable в iCloud Drive), и School Widget вече е в него (за действие 5).

**Имаш стария пряк път (до 1.8)?** Не го прави наново, само го съкрати: отвори го → изтрий действията от **Receive … input** до **Show notification „Програмата е запазена“** (първите 4) → **ⓘ** долу → изключи **Show in Share Sheet** → **Done**. Останалото е същото като по-долу. После го сподели пак (най-долу): новият линк е друг.

## Създаване
1. Отвори **Shortcuts** → долу **Shortcuts** → горе вдясно **+**.
2. Горе натисни **New Shortcut** → **Rename** → напиши `School Widget Installer` → **Done** на клавиатурата.

## Действията (по реда им)
Всяко действие се добавя от полето **Search Actions** долу: напиши името и натисни действието. Сините думи в действие са полета: натисни ги, за да ги смениш. Стрелката **›** в края на действие показва още настройки.

**1. Get File from Folder** → `Get File Path from Shortcuts`
1. Натисни **Shortcuts** → **iCloud Drive** → **Scriptable** → **Open**.
2. Натисни **File Path** → напиши `School Widget.js`, **точно така** (главни S и W, интервал, `.js`): същото име като в действие 3, иначе прекият път не намира инсталирания School Widget и го тегли пак („School Widget-2“).
3. Натисни **›** → изключи **Error If Not Found**.

**2. If** → `If File Condition`
- Натисни **Condition** → **does not have any value**. (Ако пише друго вместо **File**, натисни го → **Select Variable** → натисни действие 1.)
- Под **If** се появяват **Otherwise** и **End If**. Действията в 3 трябва да са **между If и Otherwise**: добави ги и ги провлачи нагоре, ако отидат под End If.

**3. Изтегляне и проверка** (между **If** и **Otherwise**, по реда им):
1. **Show Notification** → `Изтеглям School Widget…`
2. **Get Contents of URL** → натисни **URL** → напиши `https://batvani.github.io/school-widget/school-widget.js`
3. **Get Text from Input** → входът трябва да е **Contents of URL** (ако не е: натисни го → **Select Variable** → Get Contents of URL).
4. **If** → входът е **Text**; **Condition** → **contains** → напиши `id: uchilishte-widget`. Между този **If** и неговото **Otherwise** не слагай нищо. Между неговите **Otherwise** и **End If**: **Show Alert** → `School Widget не можа да се изтегли. Провери интернета и опитай пак.` (натисни **›** → изключи **Show Cancel Button**), после **Stop This Shortcut**.
   *Защо:* за да не се запише страница с грешка (напр. „404: Not Found“) като скрипт.
5. След този **End If**: **Set Name** → входът трябва да е **Contents of URL** (не Text: натисни го → **Select Variable** → Get Contents of URL) → натисни **Name** → напиши `School Widget.js`.
6. **Save File** → натисни **›** → изключи **Ask Where to Save** → натисни папката → **iCloud Drive** → **Scriptable** → **Open**. **Overwrite If File Exists** остава **изключено**: инсталиран School Widget никога не се презаписва (той се обновява сам).
7. **Show Notification** → `School Widget е инсталиран`

**4.** Под последното **End If**: **Show Notification** → `Отварям School Widget…`

**5. Run Script** (действието на **Scriptable**: в Search Actions напиши `Run Script` и избери това с иконата на Scriptable)
1. Натисни **Script** → избери **School Widget**.
2. Натисни **›** → включи **Run In App** (в по-старите версии: **Show When Run**). *Защо:* School Widget се отваря в Scriptable и показва страницата за програмата; без това би тръгнал скрит, без екран.
3. **Parameter** остави празно.

Горе вдясно **Done**.

## Как трябва да изглежда (като текст)
```
Get School Widget.js from Scriptable (Error If Not Found: off)
If File does not have any value
  Show notification "Изтеглям School Widget…"
  Get contents of https://batvani.github.io/…/school-widget.js
  Get text from Contents of URL
  If Text contains id: uchilishte-widget
  Otherwise
    Show alert "School Widget не можа да се изтегли…"
    Stop this shortcut
  End If
  Set name of Contents of URL to School Widget.js
  Save Renamed Item to Scriptable (Overwrite If File Exists: off)
  Show notification "School Widget е инсталиран"
Otherwise
End If
Show notification "Отварям School Widget…"
Run Script School Widget (Run In App: on)
```

**Скриптът в Scriptable трябва да се казва точно „School Widget“.** Ако се казва другояче, прекият път не го намира и тегли нов (а School Widget показва, че трябва да се преименува).

## Проба (1 минута)
1. Пусни прекия път (в Shortcuts го натисни).
2. **Трябва да видиш:** известие „Отварям School Widget…“, после Scriptable се отваря сам с School Widget (при теб: менюто или програмата ти, тя не се пипа).
3. **Ако не стане:** снимка на екрана с грешката и на прекия път (целия, с отворените ›).

## Споделяне
Shortcuts → задръж пръст върху **School Widget Installer** → **Share** → **Copy iCloud Link** → постави линка в чата. Той влиза в `install/index.html` (`SHORTCUT_LINK`), оттам в страницата за инсталиране и README.
