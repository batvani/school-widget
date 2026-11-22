#!/bin/sh
# Serves the repo folder on the PC's Wi-Fi address, so the iPhone (same Wi-Fi) can open the
# script in Safari and copy it into Scriptable, before a release. Stop it with Ctrl+C.
# Usage: sh tools/serve.sh [port]   (default 8000)
cd "$(dirname "$0")/.." || exit 1
PORT="${1:-8000}"
IP=$(ip -4 route get 1.1.1.1 2>/dev/null | sed -n 's/.* src \([0-9.]*\).*/\1/p')
[ -n "$IP" ] || IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -n "$IP" ] || { echo "No network address found: is the PC on Wi-Fi?"; exit 1; }
echo "On the iPhone (same Wi-Fi), open in Safari:"
echo "  http://$IP:$PORT/school-widget.js"
[ -d install ] && echo "  http://$IP:$PORT/install/"
echo "If the page doesn't load: the firewall may block port $PORT. Allow it once with"
echo "  sudo firewall-cmd --add-port=$PORT/tcp      (until the next restart)"
echo "Ctrl+C stops the server."
exec python3 tools/serve.py "$PORT" "$IP"
