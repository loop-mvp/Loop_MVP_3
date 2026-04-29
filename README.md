# Loop MVP 3

Loop is a narrative operating system for product-led teams. It helps founders, PMMs, and GTM teams move from product truth to core narrative, GTM planning, assets, review, and feedback in one workspace.

This repo contains the current Loop MVP application built with React, Vite, Supabase, and OpenAI-powered workflow logic.

## What the product does

- Collects lightweight product inputs from the homepage or project setup flow
- Optionally analyzes a live website URL to ground the draft
- Generates structured AI context, Product Truth, Core Narrative, GTM direction, and starter assets
- Opens a workspace for refining sections across:
  - Product Truth
  - Core Narrative
  - GTM
- Persists projects locally and, when configured correctly, to Supabase
- Supports review routing, feedback capture, and next-version iteration

## Core flows

- Homepage / intake
- AI context review
- Workspace editing and improvement
- Review routing and review center
- Projects hub and project reopening
- Feedback and narrative intelligence

## Tech stack

- React 19
- Vite 8
- Supabase
- OpenAI Responses API
- Local Vite middleware for website analysis during localhost development

## Local development

### Requirements

- Node.js 18+
- npm
- OpenAI API key
- Optional: Supabase project with the `loop_projects` schema

### Install

```powershell
npm install
```

### Configure env

Create or update `.env.local` with:

```env
VITE_OPENAI_API_KEY=your_openai_key
VITE_OPENAI_MODEL=gpt-5-mini
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Notes:

- OpenAI is required for AI drafting and website analysis.
- Supabase is optional for local development, but required for live cross-session project persistence.

### Run locally

```powershell
npm run dev
```

Open the app at the local Vite URL shown in the terminal.

### Build

```powershell
npm run build
```

## Supabase setup

If Supabase is configured, run:

- [supabase/loop_mvp_schema.sql](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/supabase/loop_mvp_schema.sql)

in the Supabase SQL Editor to create the `loop_projects` table, trigger, and policies.

Without that schema, Loop can still save locally but live project saves may fail.

## Project structure

```text
api/         Server-side routes for OpenAI and website analysis
public/      Static public assets
scripts/     Local scripts and asset generation helpers
src/         App UI, state, AI flows, persistence, and feedback modules
supabase/    SQL schema for required backend tables and policies
demo-assets/ Mockups, references, and demo materials
```

## Key files

- [src/App.jsx](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/App.jsx)
- [src/openaiClient.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/openaiClient.js)
- [src/projectStore.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/projectStore.js)
- [src/supabaseClient.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/src/supabaseClient.js)
- [api/openai.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/api/openai.js)
- [api/website-context.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/api/website-context.js)
- [vite.config.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/vite.config.js)

## Documentation

- [CHANGELOG.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/CHANGELOG.md)
- [docs/SETUP.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/SETUP.md)
- [docs/ARCHITECTURE.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/ARCHITECTURE.md)
- [docs/AI_WORKFLOW.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/AI_WORKFLOW.md)
- [docs/ROADMAP.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/ROADMAP.md)
- [docs/PRODUCT_LOGIC.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/PRODUCT_LOGIC.md)
- [docs/END_TO_END_PRODUCT_FLOW.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/END_TO_END_PRODUCT_FLOW.md)
- [CONTRIBUTING.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/CONTRIBUTING.md)

## Repo Helpers

- `npm run roadmap:snapshot`
  - creates a versioned roadmap snapshot in `docs/roadmaps/`
  - updates the current roadmap pointer in `docs/ROADMAP.md`
  - adds a changelog note for that roadmap snapshot

## Current repo scope

This repository contains:

- runtime product code
- Supabase schema
- mockups and design references
- demo assets and workflow artifacts

Future cleanup can separate reference assets more aggressively, but this README intentionally avoids changing runtime structure.
