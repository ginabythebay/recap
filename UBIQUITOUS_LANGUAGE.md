# Ubiquitous Language

## Core concepts

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Session** | A single pr-review run, stored as a UUID-named directory in `~/.cache/pr-review/`. Contains the review data, chat history, and rendered report. | Review, run, result |
| **Report** | The structured output of a session's review, stored in `reports.json`. Contains the summary, per-agent reports, diff, and metadata. | Result, output |
| **Agent report** | One section of a report produced by a specific review agent (Bug Hunter, Test Reviewer, Impact Analyzer, Code Quality). | Finding, section |
| **Summary** | The top-level synthesis across all agent reports within a single session. The first field users see. | Overview, recap |
| **Session list** | The left-panel UI showing all sessions ordered newest-first with timestamp, repo name, and summary snippet. | Sidebar, index, nav |
| **Detail view** | The right-panel UI showing the selected session's full review HTML in an iframe. | Content pane, main panel |

## Data files

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **reports.json** | Per-session file containing structured review data: id, timestamp, model, agents, diff, per-agent reports, summary, and cwd. | Data file, session data |
| **review.html** | Per-session self-contained HTML rendering of the review, with its own styles and dark mode support. | HTML report, rendered report |
| **session.jsonl** | Per-session JSONL chat history capturing the full conversation between pr-review and the model. | Chat log, transcript |
| **Cache directory** | `~/.cache/pr-review/` — the root directory containing all session directories. | Data dir, store |

## Relationships

- The **cache directory** contains zero or more **sessions** (UUID directories)
- A **session** contains exactly one **report** (`reports.json`), one **review.html**, and one **session.jsonl**
- A **report** contains one **summary** and one or more **agent reports**
- The **session list** is derived from reading **reports.json** from each **session**
- The **detail view** displays one **session's** **review.html**

## Flagged ambiguities

- **"Review"** could mean the act of running pr-review, the output of that run, or this app (recap) itself. Use **session** for a single pr-review run, **report** for its structured output, and **recap** for this application.
- **"Report"** could mean the top-level `reports.json` or an individual agent's output within it. Use **report** for the whole `reports.json` structure and **agent report** for a single agent's contribution.
