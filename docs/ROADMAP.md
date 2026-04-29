# Roadmap

Current roadmap for Loop MVP 3.

## Roadmap Version

- Current version: `2026-04-29`
- Snapshot file: [docs/roadmaps/ROADMAP_v2026-04-29.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/roadmaps/ROADMAP_v2026-04-29.md)

## How this should be maintained

When the roadmap changes in a meaningful way:

1. update this file as the current roadmap
2. create a new snapshot in `docs/roadmaps/`
3. use a date-based version name like `ROADMAP_vYYYY-MM-DD.md`
4. add a short note in [CHANGELOG.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/CHANGELOG.md)
5. prefer running `npm run roadmap:snapshot` so the snapshot, pointers, and changelog note stay in sync

This keeps the active plan clean while preserving roadmap history over time.

## Current Product Direction

Loop is moving from an AI-assisted narrative MVP into a more operational narrative and launch platform.

The near-term focus is:

- make workspace creation cleaner and more context-aware
- centralize review, approvals, and launch control in `Readiness`
- keep AI useful, page-aware, and cost-conscious
- improve assets from content generation toward template-fill, preview, and review
- preserve versioning while making versions more context-aware

## Phase 2

Goal: finish the operational workflow so launch work is structured, reviewable, and scalable.

Status: operationally complete. Future work here should be polish and refinement rather than a workflow redesign.

### 2.1 Readiness

- make `Readiness` the true launch-control surface
- tighten explicit `Go Live` conditions from Readiness row states
- keep review, blockers, dropped items, and approvals centralized there
- continue improving row actions and launch visibility

### 2.2 Assets

- make `Assets` feel more operational and less generic
- support `Fill Template` and `Preview` as the core asset actions
- keep related assets visible in the workspace that informs them
- improve asset-level status handling inside Readiness

### 2.3 Version Context

- add a `Build New Version` setup flow
- require version context before creating the new version
- support dropdowns plus custom values for:
  - audience / user
  - market / segment
  - primary channel
  - competitive lens
  - version purpose

### 2.4 Workflow Clarity

- keep workspace for creating and refining
- keep Readiness for review, approval, and launch control
- keep External Feedback for post-launch narrative health
- keep `Close Loop` only after launch plus enough external signal

### Phase 2 Completion Notes

- `Readiness` is now the central operational control surface
- `Go Live` is gated by explicit Readiness conditions
- workspace assets now support `Fill Template` and `Preview`
- new versions now capture version context before creation

## Phase 3

Goal: deepen Loop’s intelligence layer without destabilizing narrative generation or blowing up cost.

Status: active next development phase.

### 3.1 Page-Specific Intelligence

- strengthen page-aware right rail guidance
- make AI guidance more relevant by workspace and page state
- show the most important next move instead of generic advice

### 3.2 Drift and Gap Detection

- detect narrative drift between Product Truth, Core Narrative, GTM, and Assets
- detect missing proof, use cases, message hierarchy, and launch inputs
- make these visible as actionable guidance, not just background logic

### 3.3 Readiness Intelligence

- surface launch blockers clearly
- distinguish content blockers from launch blockers
- recommend what should be reviewed, delayed, dropped, or approved next

### 3.4 Cost-Aware AI Architecture

- keep deterministic workflow logic as automation
- use AI only where judgment is needed
- make AI more scoped, page-aware, and trigger-based
- avoid touching homepage narrative generation unless necessary

## Future Enterprise Direction

Goal: support larger teams, more governed launches, and more strategic variation without losing product clarity.

### Enterprise themes

- one product with multiple context-aware narrative versions
- stronger approval and review governance
- better asset system with template-aware output and preview
- version-aware readiness and external signal tracking
- clearer AI cost control and premium intelligence layers

## What not to overbuild yet

- a full branching narrative tree beyond the current version model
- deep research everywhere by default
- heavy AI in deterministic workflow transitions
- design-tool complexity that turns Loop into a full creative suite too early
