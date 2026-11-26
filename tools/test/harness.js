// The one test harness: test(name, fn) runs fn (async or not), prints "  ok  name" or "  FAIL name" with
// the first lines of the error; finish() prints "N passed, M failed" (the line all.js reads) and exits
// with 1 on a failure. testSync is for files that don't await anything.
let passed = 0, failed = 0;
function ok(name) { passed++; console.log("  ok  " + name); }
function bad(name, e) { failed++; console.log("  FAIL " + name + "\n       " + (e.stack || e).toString().split("\n").slice(0, 5).join("\n       ")); }
async function test(name, fn) { try { await fn(); ok(name); } catch (e) { bad(name, e); } }
function testSync(name, fn) { try { fn(); ok(name); } catch (e) { bad(name, e); } }
function finish() { console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed ? 1 : 0); }
module.exports = { test, testSync, finish };
