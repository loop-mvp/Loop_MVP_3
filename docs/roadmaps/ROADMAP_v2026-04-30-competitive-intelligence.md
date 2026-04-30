# Roadmap Snapshot v2026-04-30-competitive-intelligence
This file captures the roadmap state as of `2026-04-30-competitive-intelligence`.
## Roadmap Version

- Current version: `2026-04-30-phase5-complete`
- Snapshot file: [docs/roadmaps/ROADMAP_v2026-04-30-phase5-complete.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/roadmaps/ROADMAP_v2026-04-30-phase5-complete.md)

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
- keep `Competitive Intelligence` lightweight inside `GTM` so differentiation, proof, and messaging risk stay current without adding a heavy research workflow
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

Status: operationally complete for MVP. The intelligence layer now includes page-aware diagnostics, stronger drift/gap surfacing, clearer readiness blocker splits, and more operational right-rail actions without changing homepage narrative generation.

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

### Phase 3 Completion Notes

- Product Truth, Core Narrative, GTM, Assets, Readiness, and External Feedback now each have their own intelligence focus
- the right rail now combines page-specific drift, gap, and next-step diagnosis with operational actions
- Readiness now separates launch blockers from content blockers so PMMs can act faster
- GTM now includes a lightweight `Competitive Intelligence` subsection that keeps the top 2 competitor comparison tied to the same product, narrative, and launch context
- homepage narrative generation remains intentionally stable while the intelligence layer works around the workflow
- deeper cost-aware AI architecture still comes after this MVP intelligence layer is stable

## Phase 4

Goal: complete the internal feedback loop so PMMs can route reviews cleanly, teams only see relevant sections, and feedback flows back into Readiness without extra coordination overhead.

Status: operationally complete for MVP. Loop now supports default team routing by section, reviewer overrides for named individuals, PMM-only internal feedback oversight, and team-scoped reviewer views that feed Readiness automatically.

### 4.1 Default Review Routing

- auto-route sections and asset review areas to default teams
- keep PMM override available when a specific reviewer should be added
- preserve routing and reviewer ownership in project state

### 4.2 Reviewer-Scoped View

- show reviewers only the sections assigned to their team
- attach only the relevant review parameters to each section
- support section-level comments plus approve, needs work, delay, and drop decisions

### 4.3 PMM Internal Feedback Overview

- give PMMs one owner-only overview of response progress
- show assigned teams, delays, dropped items, and sections needing re-review
- make it easy to reopen the right workspace section or jump into a reviewer view

### 4.4 Readiness Return Flow

- push review decisions back into Readiness automatically
- keep PMM re-review and resend centered from one control layer
- keep internal feedback operational without turning it into a second editing workspace

### Phase 4 Completion Notes

- review routing now defaults by section ownership instead of forcing PMM to assign everything manually
- PMMs can still add a named reviewer beyond the default team assignment
- Internal Feedback now has distinct owner and reviewer views
- reviewer feedback is section-scoped and parameter-specific
- Readiness remains the launch-control layer while Internal Feedback handles review-progress oversight

## Phase 5

Goal: complete the post-launch side of Loop so market signal can be captured, interpreted, and used to close the narrative cycle honestly.

Status: operationally complete for MVP. Loop now supports lightweight external feedback capture, grouped signal interpretation, and close-loop gating based on launch plus enough post-launch signal.

### 5.1 External Feedback Capture

- support lightweight market-signal capture inside Loop
- capture source team, channel, signal type, severity, and note
- tie signals back to the active narrative version

### 5.2 Narrative Intelligence From Signal

- group signals into resonance, objections, confusion, and other feedback patterns
- show which source and signal type are appearing most often
- turn post-launch input into a usable narrative-intelligence readout

### 5.3 Close Loop Logic

- only allow `Close Loop` after launch is live
- require a minimum signal threshold before closing the cycle
- summarize enough post-launch signal so the next version starts from evidence instead of guesswork

### Phase 5 Completion Notes

- External Feedback is now a working MVP surface instead of a placeholder infographic
- Loop now uses lightweight structured signal capture rather than waiting on deeper integrations
- `Close Loop` is now gated by launch plus enough source coverage and signal volume
- the MVP loop now spans creation, readiness, internal feedback, launch, external feedback, and loop closure

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
