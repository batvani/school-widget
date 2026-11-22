# Прекият път „School Widget Installer“ · how to build it

Прекият път (Shortcut) запазва програмата от линка в папката на Scriptable, изтегля School Widget, ако го няма, и го отваря. Прави се веднъж, на iPhone (Shortcuts не може да се направи на компютър), и после се споделя с линк. Около 15 минути. Имената на бутоните са както ги показва iOS 18 на английски.

**Преди това:** Scriptable е инсталиран и отворен поне веднъж (така има папка Scriptable в iCloud Drive).

## Създаване
1. Отвори **Shortcuts** → долу **Shortcuts** → горе вдясно **+**.
2. Горе натисни **New Shortcut** → **Rename** → напиши `School Widget Installer` → **Done** на клавиатурата.

## Действията (по реда им)
Всяко действие се добавя от полето **Search Actions** долу: напиши името и натисни действието. Сините думи в действие са полета: натисни ги, за да ги смениш. Стрелката **›** в края на действие показва още настройки.

**1. Програмата идва от линка или от копираното**
1. Натисни **ⓘ** долу → включи **Show in Share Sheet** → **Done**. Горе се появява блок **Receive … input from Share Sheet**.
2. В него натисни синия текст с типовете (напр. **Images and 18 more**) → **Clear** → включи само **Text** → **Done**.
3. Натисни **Continue** след „If there's no input:“ → избери **Get Clipboard**.

*Защо:* страницата подава програмата като текст; „Ако нищо не стане“ я копира, тогава прекият път я взима от копираното.

**2. Set Name** → `Set name of Shortcut Input to Name`
- Натисни **Name** → напиши `uchilishte-import.txt`.

**3. Save File** → `Save Renamed Item to …`
1. Натисни **›** → изключи **Ask Where to Save**.
2. Натисни папката (**Shortcuts**) → **iCloud Drive** → **Scriptable** → **Open**.
3. Включи **Overwrite If File Exists**.

**4. Show Notification** → натисни **Hello World!** → напиши `Програмата е запазена`.

**5. Get File from Folder** → `Get File Path from Shortcuts`
1. Натисни **Shortcuts** → **iCloud Drive** → **Scriptable** → **Open**.
2. Натисни **File Path** → напиши `School Widget.js`, **точно така** (главни S и W, интервал, `.js`): същото име като в действие 10, иначе прекият път не намира инсталирания School Widget и го тегли пак („School Widget-2“).
3. Натисни **›** → изключи **Error If Not Found**.

**6. If** → `If File Condition`
- Натисни **Condition** → **does not have any value**. (Ако пише друго вместо **File**, натисни го → **Select Variable** → натисни действие 5.)
- Под **If** се появяват **Otherwise** и **End If**. Действия 7–11 (заедно с проверката в 8а) трябва да са **между If и Otherwise**: добави ги и ги провлачи нагоре, ако отидат под End If.

**7. Show Notification** → `Изтеглям School Widget…`

**8. Get Contents of URL** → натисни **URL** → напиши
`https://batvani.github.io/school-widget/school-widget.js`

**8а. Проверка на изтегленото** (за да не се запише страница с грешка, напр. „404: Not Found“, като скрипт):
1. **Get Text from Input** → входът трябва да е **Contents of URL** (ако не е: натисни го → **Select Variable** → действие 8).
2. **If** → входът е **Text**; **Condition** → **contains** → напиши `id: uchilishte-widget`.
3. Между този **If** и неговото **Otherwise** не слагай нищо.
4. Между неговите **Otherwise** и **End If**: **Show Alert** → `School Widget не можа да се изтегли. Провери интернета и опитай пак.` (натисни **›** → изключи **Show Cancel Button**), после **Stop This Shortcut**.
5. Действия 9–11 са **след** този End If (но преди Otherwise на голямото If от действие 6). В действие 9 входът трябва да е **Contents of URL** (не Text): натисни го → **Select Variable** → действие 8.

**9. Set Name** → `Set name of Contents of URL to Name`
- Натисни **Name** → напиши `School Widget.js`.

**10. Save File** → както в действие 3 (**Ask Where to Save** изключено, папка **Scriptable**), но **Overwrite If File Exists** остава **изключено**: инсталиран School Widget никога не се презаписва (той се обновява сам).

**11. Show Notification** → `School Widget е инсталиран`

**12.** Под **End If**: **Show Notification** → `Отварям Scriptable…`

**13. Run Script** (действието на **Scriptable**: в Search Actions напиши `Run Script` и избери това с иконата на Scriptable)
1. Натисни **Script** → избери **School Widget**.
2. Натисни **›** → включи **Run In App** (в по-старите версии: **Show When Run**). *Защо:* School Widget се отваря в Scriptable и показва „Провери програмата“; без това би тръгнал скрит, без екран.
3. **Parameter** остави празно.

*Защо не линк:* така не трябва Safari и не се пита „Open in Scriptable?“.

Ако **School Widget** още го няма в списъка (първа инсталация на нов телефон), пусни прекия път веднъж, за да го изтегли, и после избери скрипта.

Горе вдясно **Done**.

## Как трябва да изглежда (като текст)
```
Receive Text input from Share Sheet
  If there's no input: Get Clipboard
Set name of Shortcut Input to uchilishte-import.txt
Save Renamed Item to Scriptable (Overwrite If File Exists: on)
Show notification "Програмата е запазена"
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
Show notification "Отварям Scriptable…"
Run Script School Widget (Run In App: on)
```

**Скриптът в Scriptable трябва да се казва точно „School Widget“.** Ако твоят се казва другояче, прекият път не го намира и тегли нов.

## Проба (2 минути)
1. На компютъра пусни `sh tools/serve.sh` и отвори в Safari на iPhone адреса за проба, който ще ти дам (страницата за инсталиране с примерна програма).
2. Натисни **Инсталирай** → **Open** („Open in Shortcuts?“).
3. Първия път: **Allow** за папката на Scriptable (и за github.com, ако School Widget липсва; при теб го има, затова не би трябвало да пита).
4. **Трябва да видиш:** известия „Програмата е запазена“ и „Отварям Scriptable…“, после Scriptable се отваря сам с School Widget и „Провери програмата“ с примерната програма.
5. Натисни **Отказ**: твоята програма остава непроменена.
6. **Ако не стане:** снимка на екрана с грешката и на прекия път (целия, с отворените ›).

## Споделяне (T8)
Shortcuts → задръж пръст върху **School Widget Installer** → **Share** → **Copy iCloud Link** → постави линка в чата. Той влиза в `install/index.html` (`SHORTCUT_LINK`), оттам в страницата за инсталиране, инструкциите за AI и README.
