// Nothing personal in the repo: every file git would publish (tracked, or new and not ignored) is
// searched for the words in a private list that is never in the repo itself:
//   locally  ~/.config/school-widget/private-words.txt  (or PRIVATE_WORDS_FILE=<file>)
//   GitHub   the repository secret PRIVATE_WORDS (the same lines), given to the test as an env variable
// One word or phrase per line, case ignored, "#" starts a comment. Pictures are not searched.
// Usage: node tools/test/privacy.test.js
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const ROOT = path.join(__dirname, "..", "..");

const file = process.env.PRIVATE_WORDS_FILE || path.join(os.homedir(), ".config", "school-widget", "private-words.txt");
const text = process.env.PRIVATE_WORDS || (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null);
if (text == null) {
  console.log(`privacy: skip, no word list (${file} or PRIVATE_WORDS)`);
  // the workflows set REQUIRE_PRIVATE_WORDS where the secret must be there (pushes to this repo, releases)
  process.exit(process.env.REQUIRE_PRIVATE_WORDS ? 1 : 0);
}
const words = text.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith("#")).map(s => s.toLowerCase());

const files = cp.execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { cwd: ROOT }).toString().split("\0")
  .filter(f => f && !/\.(png|jpe?g|gif|ico)$/i.test(f) && fs.existsSync(path.join(ROOT, f)) && fs.statSync(path.join(ROOT, f)).isFile());
const hits = [];
for (const f of files) {
  const body = fs.readFileSync(path.join(ROOT, f), "utf8").toLowerCase();
  for (const w of words) if (body.includes(w)) hits.push(`${f}: "${w}"`);
  if (words.some(w => f.toLowerCase().includes(w))) hits.push(`${f}: in the file name`);
}
// the words themselves are never printed in CI logs (they are a secret there)
const show = h => process.env.GITHUB_ACTIONS ? h.replace(/: ".*"$/, ": a private word") : h;
console.log(hits.length ? "privacy: FAIL\n  " + hits.map(show).join("\n  ") : `privacy: ok, ${files.length} files, ${words.length} words`);
console.log(`\n${hits.length ? 0 : 1} passed, ${hits.length ? 1 : 0} failed`);
process.exit(hits.length ? 1 : 0);
