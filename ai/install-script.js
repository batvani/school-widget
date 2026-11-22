// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: download;
// School Widget installer: saves your timetable next to your scripts, downloads "School Widget"
// from GitHub if it isn't there yet, and opens it. https://github.com/batvani/school-widget
// The AI puts your timetable in place of null below. You can delete this script afterwards.
const TIMETABLE = null;
const NAME = "School Widget", URL = "https://batvani.github.io/school-widget/school-widget.js";
async function say(title, msg, ok, cancel) {
  const a = new Alert(); a.title = title; a.message = msg; a.addAction(ok || "OK");
  if (cancel) a.addCancelAction(cancel);
  return (await a.presentAlert()) === 0;
}
async function main() {
  if (!TIMETABLE || typeof TIMETABLE !== "object") return say("Няма програма", "В този скрипт няма програма. Помоли AI-а за целия скрипт отново.\nThere is no timetable in this script: ask the AI for the whole script again.");
  if (!await say("Инсталиране на School Widget", "Ще:\n1. запазя програмата ти до скриптовете в Scriptable;\n2. изтегля School Widget от github.com (ако го няма);\n3. го отворя, за да провериш програмата и да натиснеш „Запази“.\n\nThis saves your timetable, downloads School Widget from github.com if needed, and opens it.", "Продължи", "Отказ")) return;
  const local = FileManager.local();
  let fm = local;
  try { if (local.isFileStoredIniCloud(module.filename)) fm = FileManager.iCloud(); } catch (e) { }
  const dir = module.filename.slice(0, module.filename.lastIndexOf("/")), target = fm.joinPath(dir, NAME + ".js");
  try { fm.writeString(fm.joinPath(dir, "uchilishte-import.txt"), "uchilishte:j:" + JSON.stringify(TIMETABLE)); }
  catch (e) { return say("Не стана", "Програмата не можа да се запази в папката на Scriptable (" + e + "). Отвори Scriptable веднъж и пусни този скрипт пак.\nCouldn't save into Scriptable's folder: open Scriptable once and run this script again."); }
  if (!fm.fileExists(target)) {
    let code;
    try { const r = new Request(URL); r.timeoutInterval = 30; code = await r.loadString(); }
    catch (e) { return say("Няма интернет", "School Widget не можа да се изтегли. Свържи се с интернет и пусни този скрипт пак.\nNo internet: connect and run this script again."); }
    if (!/^\/\/ id: uchilishte-widget;/m.test(code.split("\n").slice(0, 6).join("\n"))) return say("Не стана", "Изтегленият файл не е School Widget. Опитай пак по-късно.\nThe download isn't School Widget: try again later.");
    fm.writeString(target, code);
  }
  await say("Готово", "Сега се отваря School Widget (ако не се отвори: докосни School Widget в списъка на Scriptable). Провери програмата и натисни „Запази“. Този скрипт можеш да изтриеш.\nDone: School Widget opens now (if it doesn't, tap School Widget in Scriptable's list). Check the timetable and tap Запази. You can delete this script.", "Отвори School Widget");
  Safari.open("scriptable:///run/" + encodeURIComponent(NAME));
}
await main();
Script.complete();
