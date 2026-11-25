# The web server behind tools/serve.sh: like `python3 -m http.server`, but every text file is
# sent as UTF-8 (without it Safari shows the Bulgarian letters as gibberish, seen on the phone)
# and never cached, so the iPhone always gets the newest file. Only the files the phone needs are
# served (anyone on the same Wi-Fi can reach the server): never the repo's history, notes or fixtures.
# Usage: python3 tools/serve.py <port> <address>
import http.server, os, sys, urllib.parse

ALLOWED = ("/school-widget.js",)
# the landing page, as Pages serves it (pages.yml): landing/<file> at the site root
LANDING = ("index.html", "demo.js", "widgets.js", "widgets.css", "page.js")
def allowed(path):
    p = urllib.parse.unquote(urllib.parse.urlsplit(path).path)
    if ".." in p.split("/"): return False
    return p in ALLOWED or p == "/install" or p.startswith("/install/") or p == "/" or p[1:] in LANDING

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/plain; charset=utf-8",   # shown as text in Safari, ready to copy
        ".json": "application/json; charset=utf-8",
        ".md": "text/plain; charset=utf-8",
        ".txt": "text/plain; charset=utf-8",
        ".html": "text/html; charset=utf-8",
    }
    def translate_path(self, path):
        p = urllib.parse.unquote(urllib.parse.urlsplit(path).path)
        if p == "/" or p[1:] in LANDING:
            return os.path.join(os.getcwd(), "landing", p[1:] or "index.html")
        return super().translate_path(path)
    def guess_type(self, path):
        # the landing page's scripts must run (the other .js is shown as text, ready to copy)
        if path.startswith(os.path.join(os.getcwd(), "landing")) and path.endswith(".js"): return "text/javascript; charset=utf-8"
        return super().guess_type(path)
    def send_head(self):
        if not allowed(self.path):
            self.send_error(404)
            return None
        return super().send_head()
    def list_directory(self, path):
        self.send_error(404)
        return None
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

if __name__ == "__main__":
    port, addr = int(sys.argv[1]), sys.argv[2]
    http.server.ThreadingHTTPServer((addr, port), Handler).serve_forever()
