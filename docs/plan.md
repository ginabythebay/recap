# Recap: PR Review Browser

## Context

`pr-review` is a CLI tool that stores AI code reviews in `~/.cache/pr-review/`. Each session is a UUID directory containing `reports.json` (structured review data), `session.jsonl` (chat history), and `review.html` (self-contained HTML report). ~45 sessions exist today. Recap is a local browser-based viewer for these reviews.

## Stack

- **Server:** Python with Flask, managed via `uv`
- **Frontend:** Vanilla JavaScript, no build step
- **Project structure:** `src/recap/` package directory

## Architecture

```
recap/
├── pyproject.toml            # uv project, Flask dependency, [project.scripts] entry
├── src/
│   └── recap/
│       ├── __init__.py
│       └── server.py         # Flask app, API routes, CLI entry point
└── static/
    ├── index.html            # Single-page app shell
    ├── app.js                # Client-side logic
    └── style.css             # Styling with dark mode support
```

## Server (src/recap/server.py)

Flask app with a `main()` entry point.

### Routes

| Route | Returns |
|---|---|
| `GET /` | Serves `static/index.html` |
| `GET /api/sessions` | JSON list of sessions, sorted newest-first |
| `GET /api/sessions/<id>` | The session's `review.html` content |

### Session listing (`GET /api/sessions`)

- List directories in `~/.cache/pr-review/` matching UUID pattern (8-4-4-4-12 hex)
- For each, read `reports.json` and extract: `id`, `timestamp`, repo name (basename of `cwd`), summary snippet (first ~80 chars)
- Return sorted newest-first

### Detail view (`GET /api/sessions/<id>`)

- Read and return the raw `review.html` from the session directory
- Frontend displays it in an `<iframe>`

## Frontend (static/)

Two-panel layout:
- **Left panel:** Scrollable session list — each entry shows date/time, repo name, summary snippet. Clicking highlights and loads detail.
- **Right panel:** `<iframe>` displaying the selected session's `review.html`.
- **Dark mode:** `prefers-color-scheme` media query on the app shell. The iframe content already has its own dark mode support.

## CLI

### Installation

```
uv tool install .
```

Registers `recap` command globally via `[project.scripts]` in `pyproject.toml`:
```toml
[project.scripts]
recap = "recap.server:main"
```

### Usage

```
recap [--port PORT] [--replace]
```

- Default port: **7483**
- Starts Flask on `localhost:7483`, opens browser via `webbrowser.open()`
- Runs until Ctrl-C

### Port conflict handling

- If port 7483 is in use: print error with PID — `"Port 7483 in use (pid 12345). Run with --replace to restart."`
- `--replace` flag: find the process holding the port via `lsof -ti :PORT`, kill it, print `"Stopped previous instance (pid 12345)"`, then start normally

## Future considerations (not in scope)

- **Live updates (v2):** Watch for new session directories and update the UI
- **Search/filter** across reviews

## Verification

1. `recap` — browser opens to `http://localhost:7483`
2. Left panel shows sessions sorted newest-first with repo name and summary
3. Click a session — right panel iframe shows the review HTML
4. Content matches opening `~/.cache/pr-review/<id>/review.html` directly
5. Test oldest and newest sessions
6. Run `recap` again without `--replace` — get clear error with PID
7. Run `recap --replace` — old instance killed, new one starts
8. Toggle system dark/light mode — app shell and iframe both adapt
