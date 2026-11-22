# School Widget: makes the one-tap install link from a finished timetable (ai/INSTRUCTIONS.md).
# Compact JSON → deflate (raw) → base64url, after "#z=" (browsers never send what follows "#").
# Usage: put the timetable into TIMETABLE below and run it; or: python3 encode.py timetable.json
import base64, json, sys, zlib

TIMETABLE = None  # the finished timetable (a dict), when not given as a file

def link(timetable, page="https://batvani.github.io/school-widget/install/"):
    raw = json.dumps(timetable, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    c = zlib.compressobj(9, zlib.DEFLATED, -15)
    z = c.compress(raw) + c.flush()
    return page + "#z=" + base64.urlsafe_b64encode(z).decode("ascii").rstrip("=")

if __name__ == "__main__":
    t = json.load(open(sys.argv[1], encoding="utf-8")) if len(sys.argv) > 1 else TIMETABLE
    print(link(t))
