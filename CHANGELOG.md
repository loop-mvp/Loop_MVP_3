# Changelog

This file tracks meaningful product, platform, and documentation changes in Loop MVP 3.

## 2026-04-29

### Platform

- Promoted `Assets` into a top-level workspace beside `Product Truth`, `Core Narrative`, and `GTM`.
- Split `Assets` into team-based subsections:
  - `Product Marketing`
  - `Sales`
  - `Marketing`
  - `Social`
  - `General`
- Simplified the workspace header so the current workspace is clearer and the canvas feels less crowded.
- Replaced workspace `Get Feedback` behavior with `Move to Readiness`.
- Removed workspace `Publish` behavior from the main authoring flow.
- Introduced `Readiness` as the central launch-control surface.
- Renamed the market-signal side of the flow toward `External Feedback`.
- Added a structured `Readiness Board` with launch-control rows for:
  - `Product Truth`
  - `Core Narrative`
  - `GTM`
  - `Product Marketing`
  - `Sales`
  - `Marketing`
  - `Social`
  - `General`
- Added explicit Readiness statuses:
  - `Draft`
  - `Ready for Review`
  - `Sent for Review`
  - `In Review`
  - `Approved`
  - `Needs Work`
  - `Delayed`
  - `Dropped`
- Made `Move to Readiness` explicitly register the active workspace or asset groups on the board.
- Added row-level Readiness actions:
  - `Open Workspace`
  - `Send for Review`
  - `Mark Dropped`
- Added the first page-specific right-rail intelligence pass so the AI panel changes by workspace instead of staying generic.
- Added explicit `Go Live` gating from Readiness conditions instead of relying only on broad review state.
- Added an operational asset workflow in workspace suggestions with:
  - `Fill Template`
  - `Preview`
- Added version-context setup for new versions so each next version can capture:
  - audience / user
  - market / segment
  - primary channel
  - competitive lens
  - version purpose
- Improved project persistence and save signaling so incomplete drafts are easier to recover and track.

### AI / Workflow

- Strengthened website analysis from simple single-page summarization to richer multi-page structured extraction.
- Kept homepage and initial narrative generation intact while shifting newer intelligence work into workflow guidance rather than core draft generation.
- Began separating deterministic launch workflow behavior from AI-guided diagnosis:
  - automation for status changes, readiness transitions, and save flow
  - AI for drift, gaps, guidance, and recommendations

### Documentation / Repo

- Roadmap snapshot updated: [docs/roadmaps/ROADMAP_v2026-04-29.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/roadmaps/ROADMAP_v2026-04-29.md)
- Added repo documentation for setup, architecture, AI workflow, product logic, and end-to-end flow.
- Added GitHub issue and PR templates.
- Added this changelog to start capturing meaningful repo and platform updates in one place.
- Added a versioned roadmap structure with:
  - [docs/ROADMAP.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/ROADMAP.md)
  - [docs/roadmaps/ROADMAP_v2026-04-29.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/roadmaps/ROADMAP_v2026-04-29.md)
- Added `npm run roadmap:snapshot` to automate roadmap snapshot creation, roadmap pointer updates, and changelog notes.

## Current Direction

### Phase 2

- Operational workflow layer is now in place:
  - Readiness as launch-control
  - explicit `Go Live` gating
  - asset template preview flow
  - version-context setup for new versions
- Remaining work in this layer is polish rather than structural workflow change.

### Phase 3

- Deepen the intelligence layer with better drift detection, gap detection, readiness intelligence, and more page-specific AI guidance.
- Design a more cost-efficient AI architecture after the workflow layer is stable.
