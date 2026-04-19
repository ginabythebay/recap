import argparse
import json
import os
import re
import signal
import subprocess
import sys
import webbrowser
from pathlib import Path

from flask import Flask, abort, jsonify, send_from_directory

CACHE_DIR = Path.home() / ".cache" / "pr-review"
STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "static"
DEFAULT_PORT = 7483
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")

app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="/static")


@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/api/sessions")
def list_sessions():
    sessions = []
    for entry in CACHE_DIR.iterdir():
        if not entry.is_dir() or not UUID_RE.match(entry.name):
            continue
        reports_file = entry / "reports.json"
        if not reports_file.exists():
            continue
        try:
            data = json.loads(reports_file.read_text())
        except (json.JSONDecodeError, OSError):
            continue
        summary = data.get("summary", "")
        first_line = summary.split("\n", 1)[0].strip()
        first_line = re.sub(r"^#+\s*", "", first_line)
        snippet = first_line[:80] + ("..." if len(first_line) > 80 else "")
        cwd = data.get("cwd", "")
        repo = os.path.basename(cwd) if cwd else ""
        sessions.append({
            "id": entry.name,
            "timestamp": data.get("timestamp", ""),
            "repo": repo,
            "snippet": snippet,
        })
    sessions.sort(key=lambda s: s["timestamp"], reverse=True)
    return jsonify(sessions)


@app.route("/api/sessions/<session_id>")
def get_session(session_id):
    if not UUID_RE.match(session_id):
        abort(400, "Invalid session ID")
    review_file = CACHE_DIR / session_id / "review.html"
    if not review_file.exists():
        abort(404, "Session not found")
    return review_file.read_text(), 200, {"Content-Type": "text/html; charset=utf-8"}


def find_pid_on_port(port):
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"],
            capture_output=True, text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            return int(result.stdout.strip().split("\n")[0])
    except (subprocess.SubprocessError, ValueError):
        pass
    return None


def main():
    parser = argparse.ArgumentParser(description="Browse pr-review sessions")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--replace", action="store_true",
                        help="Kill existing instance and restart")
    args = parser.parse_args()

    existing_pid = find_pid_on_port(args.port)
    if existing_pid:
        if args.replace:
            os.kill(existing_pid, signal.SIGTERM)
            print(f"Stopped previous instance (pid {existing_pid})")
        else:
            print(f"Port {args.port} in use (pid {existing_pid}). "
                  f"Run with --replace to restart.", file=sys.stderr)
            sys.exit(1)

    webbrowser.open(f"http://localhost:{args.port}")
    app.run(host="127.0.0.1", port=args.port)
