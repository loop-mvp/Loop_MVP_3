# Contributing to Loop MVP 3

## Working principles

- Keep changes scoped and easy to review.
- Prefer small, focused commits.
- Do not mix runtime changes with documentation-only cleanup unless the PR clearly explains both.
- If a change affects the platform, call that out explicitly in the PR description.

## Branch naming

Use short descriptive branches. Recommended patterns:

- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `chore/<short-name>`
- `codex/<short-name>`

## Pull requests

Every PR should include:

- what changed
- why it changed
- whether it affects platform behavior
- how it was tested
- screenshots for UI changes when useful

## Commit guidance

Use clear, human-readable commit messages such as:

- `Improve website analysis grounding`
- `Fix project persistence in projects hub`
- `Add setup and architecture docs`

## Local workflow

### Install

```powershell
npm install
```

### Run dev server

```powershell
npm run dev
```

### Build

```powershell
npm run build
```

## Environment

See [docs/SETUP.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/SETUP.md) for local env setup, OpenAI configuration, and Supabase schema setup.

## What counts as a platform change

Platform-affecting changes include:

- runtime UI behavior
- app logic
- AI workflow logic
- persistence
- build configuration
- API routes
- env handling

Safe non-platform work includes:

- documentation
- GitHub templates
- issue/PR process
- non-runtime repo organization
