# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Recap is a local browser-based viewer for pr-review sessions stored in `~/.cache/pr-review/`. It's a Python/Flask server serving a vanilla JS frontend. See `docs/plan.md` for the full design and `UBIQUITOUS_LANGUAGE.md` for domain terminology.

## Stack

- Python with Flask, managed via `uv`
- Vanilla JavaScript frontend (no framework, no build step)
- Package layout: `src/recap/`

## Commands

```bash
uv run recap              # Start the server and open browser
uv run recap --replace    # Kill existing instance and restart
uv run pytest             # Run tests
uv run pytest -x          # Stop on first failure
uv run pytest path::test  # Run a single test
```

## Architecture

- `src/recap/server.py` — Flask app, API routes, CLI entry point (`main()`)
- `static/` — Frontend assets (index.html, app.js, style.css) served by Flask
- The server reads session data from `~/.cache/pr-review/` (UUID directories)
- Session list is built from `reports.json` files; detail view serves `review.html` in an iframe
- Default port: 7483

## Data source

Each session in `~/.cache/pr-review/<uuid>/` contains:
- `reports.json` — structured review data (id, timestamp, cwd, agents, reports, summary, diff)
- `review.html` — self-contained HTML report with its own styles and dark mode
- `session.jsonl` — chat history
