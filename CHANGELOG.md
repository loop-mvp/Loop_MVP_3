# Changelog

This file tracks meaningful product, platform, and documentation changes in Loop MVP 3.

## 2026-04-30

### Platform

- Completed the MVP Phase 3 intelligence pass in the workspace right rail.
- Added more operational page actions so AI guidance can open the relevant section before running the prompt.
- Tightened Readiness logic so launch blockers, content blockers, and review blockers are separated more clearly for Go Live decisions.

### AI / Workflow

- Added stronger drift and gap signals for:
  - audience / persona gaps
  - message hierarchy gaps
  - channel priority gaps
  - why-now gaps
- Expanded page intelligence so Product Truth, Core Narrative, GTM, Assets, Readiness, and External Feedback each carry:
  - focus tags
  - priority actions
  - more actionable recommendations
- Kept the homepage narrative generation flow stable while making the workflow intelligence more useful and more operational.

### Documentation / Repo

- Updated [docs/ROADMAP.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/ROADMAP.md) to mark Phase 3 operationally complete for MVP.

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
- Started the first deeper Phase 3 intelligence pass in the right rail with:
  - stronger page-specific drift and gap detection
  - page-specific focus tags
  - AI priority actions by workspace
  - clearer readiness and external-feedback guidance without changing homepage draft generation

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

## 2026-04-30-phase3-pass-1

### Documentation / Repo

- Roadmap snapshot updated: [docs/roadmaps/ROADMAP_v2026-04-30-phase3-pass-1.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/roadmaps/ROADMAP_v2026-04-30-phase3-pass-1.md)
- Roadmap snapshot created.

## 2026-04-30-phase3-complete

### Documentation / Repo

- Roadmap snapshot updated: [docs/roadmaps/ROADMAP_v2026-04-30-phase3-complete.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/roadmaps/ROADMAP_v2026-04-30-phase3-complete.md)
- Roadmap snapshot created.

## 2026-04-30-phase4-complete

### Platform / Runtime

- Completed the MVP internal feedback system inside [src/App.jsx](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/App.jsx):
  - default review routing now follows section ownership by team
  - PMM can still override the default by adding a named reviewer
  - reviewer-scoped feedback view now shows only assigned sections and section-relevant parameters
  - PMM-only Internal Feedback overview now tracks team response, delays, dropped items, and re-review work
  - sending review now routes PMM into the internal-feedback control flow instead of dropping them back into a generic board
- Updated legacy review scoring surfaces to use:
  - `Clarity`
  - `Relevance`
  - `Differentiation`
  - `Credibility`
  - `Usability`
  instead of the older generic `Value` field.
- Added section-to-workspace routing helpers so PMM can jump back to the correct workspace section from Internal Feedback.

### Documentation / Repo

- Phase 4 added to the live roadmap in [docs/ROADMAP.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/ROADMAP.md)
- Roadmap snapshot updated: [docs/roadmaps/ROADMAP_v2026-04-30-phase4-complete.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/roadmaps/ROADMAP_v2026-04-30-phase4-complete.md)
