# Setup

## Requirements

- Node.js 18+
- npm
- OpenAI API key
- Optional: Supabase project

## Install dependencies

```powershell
npm install
```

## Environment variables

Create `.env.local` in the repo root:

```env
VITE_OPENAI_API_KEY=your_openai_key
VITE_OPENAI_MODEL=gpt-5-mini
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## OpenAI

Loop uses the OpenAI Responses API for:

- website analysis
- AI context generation
- Product Truth generation
- Core Narrative generation
- GTM generation
- starter asset generation
- some feedback normalization flows

## Supabase

Supabase is used for persisted project storage across sessions.

Run the SQL in:

- [supabase/loop_mvp_schema.sql](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/supabase/loop_mvp_schema.sql)

inside Supabase SQL Editor.

That file creates:

- `public.loop_projects`
- `updated_at` trigger
- row-level security policies

Without this step, the app can still save locally but remote project sync may fail.

## Start the app

```powershell
npm run dev
```

## Build the app

```powershell
npm run build
```

## Local website analysis note

In localhost development, the Vite config includes local middleware so `/api/website-context` works without deployment. If website analysis stops working locally, restart the dev server after changes to:

- [vite.config.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/vite.config.js)

## Common problems

### Website analysis returns weak or missing source data

- confirm the URL is valid
- confirm the OpenAI key is present
- restart `npm run dev` after config changes
- check whether the site blocks fetches or requires client-side rendering

### Supabase connected but project saves fail

- verify `loop_projects` exists
- verify RLS policies were created
- verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Build verification in restricted environments

Some local tooling environments may block Vite helper process spawning. In normal local development this should not affect the app itself, but it may affect automated verification workflows.
