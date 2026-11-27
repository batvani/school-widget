// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: download;
// School Widget installer: downloads "School Widget" from GitHub (if it isn't there yet) and opens it.
// https://github.com/batvani/school-widget · You can delete this script afterwards.
const NAME = "School Widget", URL = "https://github.com/batvani/school-widget/releases/latest/download/school-widget.js";
async function say(title, msg, ok, cancel) {
  const a = new Alert(); a.title = title; a.message = msg; a.addAction(ok || "OK");
  if (cancel) a.addCancelAction(cancel);
  return (await a.presentAlert()) === 0;
}
async function main() {
  const local = FileManager.local();
  let fm = local;
  try { if (local.isFileStoredIniCloud(module.filename)) fm = FileManager.iCloud(); } catch (e) { }
  const dir = module.filename.slice(0, module.filename.lastIndexOf("/")), target = fm.joinPath(dir, NAME + ".js");
  if (!fm.fileExists(target)) {
    if (!await say("Инсталиране на School Widget", "Ще изтегля School Widget от github.com и ще го отворя.\n\nThis downloads School Widget from github.com and opens it.", "Продължи", "Отказ")) return;
    let code;
    try { const r = new Request(URL); r.timeoutInterval = 30; code = await r.loadString(); }
    catch (e) { return say("Няма интернет", "School Widget не можа да се изтегли. Свържи се с интернет и пусни този скрипт пак.\nNo internet: connect and run this script again."); }
    if (!/^\/\/ id: uchilishte-widget;/m.test(code.split("\n").slice(0, 6).join("\n"))) return say("Не стана", "Изтегленият файл не е School Widget. Опитай пак по-късно.\nThe download isn't School Widget: try again later.");
    try { fm.writeString(target, code); }
    catch (e) { return say("Не стана", "School Widget не можа да се запази (" + e + "). Отвори Scriptable веднъж и пусни този скрипт пак.\nCouldn't save it: open Scriptable once and run this script again."); }
  }
  await say("Готово", "School Widget е инсталиран. Сега се отваря: внеси програмата си. Този скрипт можеш да изтриеш.\nSchool Widget is installed and opens now: bring in your timetable. You can delete this script.", "Отвори School Widget");
  Safari.open("scriptable:///run/" + encodeURIComponent(NAME));
}
await main();
Script.complete();
