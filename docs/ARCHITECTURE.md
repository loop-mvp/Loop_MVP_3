# Architecture

## Overview

Loop MVP 3 is a React + Vite application with lightweight server-side API routes for OpenAI and website analysis. The main application logic currently lives in a single large app shell:

- [src/App.jsx](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/App.jsx)

## Main layers

### Frontend

- React-based UI
- single-app-shell workflow management
- homepage, project setup, workspace, review, projects hub, and intelligence screens

### AI layer

- OpenAI Responses API integration
- website analysis route
- staged generation for:
  - context
  - Product Truth
  - Core Narrative
  - GTM
  - assets

### Persistence layer

- local storage snapshotting for resilience
- Supabase-backed `loop_projects` persistence when configured

## Key files

### App shell

- [src/App.jsx](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/App.jsx)

Responsibilities:

- screen routing
- project state
- workspace state
- AI flow orchestration
- persistence orchestration
- review and feedback flow wiring

### OpenAI client

- [src/openaiClient.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/openaiClient.js)

Responsibilities:

- direct or proxied OpenAI requests
- website analysis client call

### Server-side OpenAI route

- [api/openai.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/api/openai.js)

Responsibilities:

- server-side OpenAI proxy for production-style environments

### Website analysis route

- [api/website-context.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/api/website-context.js)

Responsibilities:

- URL normalization
- multi-page crawl
- page classification
- structured evidence extraction
- OpenAI-backed website context analysis

### Project storage

- [src/projectStore.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/projectStore.js)
- [src/supabaseClient.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/supabaseClient.js)

Responsibilities:

- Supabase connection
- project listing, saving, deletion
- snapshot merging and content preservation

## Persistence model

Loop uses two persistence paths:

### Local persistence

- local storage stores the current app snapshot
- in-progress projects are force-persisted on key transitions and page hide/unload

### Remote persistence

- Supabase stores project snapshots in `loop_projects`
- autosave runs while working in:
  - workspace
  - context review
  - review routing

## High-level UI areas

- homepage and intake
- AI context review
- workspace
- projects hub
- review routing
- review center
- narrative intelligence

## Important current architectural note

This MVP still centralizes a large amount of logic in `App.jsx`. That is acceptable for rapid iteration, but a future cleanup should gradually separate:

- AI workflow logic
- persistence logic
- project lifecycle logic
- screen components
- shared state helpers
