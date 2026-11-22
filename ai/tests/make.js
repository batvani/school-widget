// Draws the AI test pictures (pictures/<n>.png or .jpg), writes what a correct import holds
// (expected/<n>.json) and the tester's answer sheet (answers.md).
// node ai/tests/make.js   (needs Playwright, in tools/preview)
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { S, T, DAYS, DAYS_FULL, TEACHERS, expected } = require("./timetables");
const D = (...a) => path.join(__dirname, ...a);
const h = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const code = c => c.split("@")[0];
let k = 0; const teacher = () => TEACHERS[k++ % TEACHERS.length];

// how each picture writes a subject
const SHORT = { БЕЛ: "Бълг. ез. и лит.", МАТ: "Математика", АЕ: "Англ. език", НЕ: "Немски език", ИЦ: "История", ГИ: "География", БЗО: "Биология", ХООС: "Химия", ФА: "Физика", ИТ: "Информ. техн.", ФВС: "Физ. възп.", ЧК: "Час на класа", ФИЛ: "Философия", ИИ: "Изобр. изк.", МУЗ: "Музика" };
const name = (t, c) => t.style === "school" ? c : t.style === "messy" ? c + "." : t.style === "rows" ? SHORT[c] : S[c];
const room = (t, c, cellCode) => t.missing && t.missing.includes(cellCode) ? "" : t.rooms[c] || "";
function cellHTML(t, c, di, p) {
  const cc = DAYS[di] + (p + 1);
  if (!c) return "<td></td>";
  if (c === "—") return `<td class="free">—</td>`;
  if (c === "АЕ/НЕ") return `<td><b>${t.split.code.join(" / ")}</b><i>${t.split.rooms.join(" / ")}</i></td>`;
  const r = room(t, c, cc), who = t.style === "columns" || t.style === "photo" ? `<s>${teacher()}</s>` : "";
  return `<td><b>${h(name(t, c))}</b>${r ? `<i>${t.style === "school" ? r : "ст. " + r}</i>` : ""}${who}</td>`;
}
const CSS = `body{margin:0;font:15px/1.25 Arial,sans-serif;color:#111;background:#fff}
table{border-collapse:collapse}td,th{border:1px solid #888;padding:6px 8px;text-align:center;vertical-align:middle}
th{background:#e8eef6}td b{display:block;font-weight:600}td i{display:block;font-style:normal;color:#444;font-size:13px}
td s{display:block;text-decoration:none;color:#666;font-size:12px}.free{color:#999}h1{font-size:20px;margin:0 0 10px}
.sheet{padding:24px;display:inline-block;background:#fff}`;

function page(t) {
  const n = Math.max(...t.week.map(d => d.length));
  const at = (di, p) => t.week[di][p];
  if (t.style === "rows") {
    const rows = DAYS_FULL.map((d, di) => `<tr><th>${d}</th>${[...Array(n)].map((_, p) => cellHTML(t, at(di, p), di, p)).join("")}</tr>`).join("");
    return `<div class="sheet"><h1>Седмично разписание — ${t.class} клас</h1><table><tr><th></th>${[...Array(n)].map((_, p) => `<th>${p + 1}</th>`).join("")}</tr>${rows}</table></div>`;
  }
  if (t.style === "school") {
    const classes = [...t.others.slice(0, 2), t.class, t.others[2]];
    const weekOf = c => c === t.class ? t.week : t.week.map((d, i) => t.week[(i + classes.indexOf(c) + 1) % 5].slice().reverse());
    const head = DAYS.map(d => `<th colspan="${n}">${d}</th>`).join("") + "</tr><tr><th>Клас</th>" + DAYS.map(() => [...Array(n)].map((_, p) => `<th>${p + 1}</th>`).join("")).join("");
    const rows = classes.map(c => { const w = weekOf(c); return `<tr><th>${c}</th>${DAYS.map((_, di) => [...Array(n)].map((_, p) => cellHTML(Object.assign({}, t, { week: w }), w[di][p], di, p)).join("")).join("")}</tr>`; }).join("");
    const bells = t.bells.map((b, i) => `${i + 1}. ${b[0]}–${b[1]}`).join(" &nbsp; ");
    return `<style>td,th{padding:4px 3px;font-size:12px}td b{font-size:12px}td i{font-size:11px}</style><div class="sheet"><h1>Седмично разписание на часовете, гимназиален етап, I срок</h1><table><tr><th rowspan="1"></th>${head}</tr>${rows}</table><p>Звънец: ${bells}</p></div>`;
  }
  // columns, photo, messy: periods as rows, days as columns, bells in the first column
  const rows = [...Array(n)].map((_, p) => `<tr><th>${p + 1}<br><small>${t.bells[p].join(" – ")}</small></th>${DAYS.map((_, di) => cellHTML(t, at(di, p), di, p)).join("")}</tr>`).join("");
  const title = t.style === "messy" ? `${t.class} кл.` : `Програма на ${t.class} клас — 2026/2027, I срок`;
  return `<div class="sheet"><h1>${title}</h1><table><tr><th>час</th>${DAYS_FULL.map(d => `<th>${d}</th>`).join("")}</tr>${rows}</table></div>`;
}
// a desk, a sheet of paper on it, seen from a phone held at an angle
const PHOTO = `body{background:radial-gradient(circle at 40% 30%,#8a6a4a,#4b3420)}
.desk{padding:70px 60px;perspective:1100px}.sheet{background:linear-gradient(105deg,#f7f3e8,#ece5d2 60%,#d9d0bb);
transform:rotateX(14deg) rotateY(-6deg) rotateZ(-4deg);box-shadow:18px 24px 30px rgba(0,0,0,.55);filter:blur(.7px) contrast(.9)}`;

function answers(t) {
  const e = expected(t), names = [...new Set(t.week.flat().filter(c => S[c] && c !== "БЕЛ" && c !== "ФВС"))];
  const a = [];
  if (t.style === "school") a.push(`Класът ми е **${t.class}**.`);
  a.push(`Аз съм в **${t.grade}. клас** (${t.class}).`);
  a.push("Имената: пълните имена на предметите, както следва: " + names.map(c => `${name(t, c)} = ${S[c]}`).join("; ") + ". Кратките имена: приеми каквито предложиш (стига да се побират).");
  a.push("БЕЛ и ФВС остават така (БЕЛ, ФВС). ФВС няма стая.");
  if (t.bellAnswer) a.push("Звънецът: " + t.bellAnswer);
  if (t.missing) a.push("Липсващите стаи: " + t.missing.map(cc => { const di = DAYS.indexOf(cc.slice(0, 2)), p = +cc.slice(2) - 1; return `${cc} е в стая ${t.rooms[t.week[di][p]]}`; }).join(", ") + ".");
  if (t.split) a.push(`„${t.split.code.join(" / ")}“ е разделен час: пази и двете групи, ${t.split.label[0]} в стая ${t.split.rooms[0]}, ${t.split.label[1]} в стая ${t.split.rooms[1]}.`);
  if (t.week.flat().includes("—")) a.push("„—“ е свободен час (дупка).");
  a.push("Няма важни (червени) часове. Почивните дни са като официалните, нищо различно. Седмиците не се редуват.");
  a.push("Накрая, когато таблицата е вярна: **Да**.");
  return `## ${t.n}. ${t.title}\n\nКартинка: \`pictures/${t.n}.${t.style === "photo" ? "jpg" : "png"}\`. Ако AI-ът пита нещо, отговори от списъка (копирай само нужното):\n\n${a.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nОчаква се: ${Object.values(e.week).flat().filter(c => c.name).length} часа в ${Object.keys(e.week).length} дни, ${e.bells.length} звънеца.\n`;
}

(async () => {
  for (const d of ["pictures", "expected"]) fs.mkdirSync(D(d), { recursive: true });
  const browser = await chromium.launch(), pg = await browser.newPage({ deviceScaleFactor: 2 });
  for (const t of T) {
    k = 0;
    const photo = t.style === "photo";
    await pg.setViewportSize({ width: t.style === "school" ? 1500 : 900, height: 600 });
    await pg.setContent(`<!DOCTYPE html><meta charset="utf-8"><style>${CSS}${photo ? PHOTO : ""}</style>${photo ? `<div class="desk">${page(t)}</div>` : page(t)}`);
    const el = await pg.$(photo ? ".desk" : ".sheet");
    await el.screenshot(photo ? { path: D("pictures", t.n + ".jpg"), type: "jpeg", quality: 62 } : { path: D("pictures", t.n + ".png") });
    fs.writeFileSync(D("expected", t.n + ".json"), JSON.stringify(expected(t), null, 1) + "\n");
  }
  await browser.close();
  fs.writeFileSync(D("answers.md"), `# Тестове с AI · отговорите\n\nЗа всяка картинка и всеки AI (ChatGPT, Gemini, Claude, Copilot): **нов чат** → постави промпта от \`ai/START.md\` → прикачи картинката → отговаряй на въпросите от списъка по-долу → накрая копирай целия последен отговор на AI-а и го запиши като \`ai/tests/results/<ai>-<n>.txt\` (например \`chatgpt-1.txt\`). Провери с \`node ai/tests/compare.js\`.\n\nПиши само това, което AI-ът пита; ако пита нещо, което го няма тук, отговори както би отговорил истински ученик и го отбележи.\n\n${T.map(answers).join("\n")}`);
  console.log(`${T.length} pictures → ai/tests/pictures/, expected/, answers.md`);
})().catch(e => { console.error(e); process.exit(1); });
