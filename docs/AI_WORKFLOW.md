# AI Workflow

## Purpose

Loop uses AI to ground, draft, review, and improve product narrative work. The workflow is intentionally multi-step so the product does not jump from a weak input directly to a final story.

## Current workflow

### 1. Intake

Loop collects:

- product name
- product description
- optional website URL
- audience
- category
- wow factor

## 2. Website analysis

If a website URL is provided, Loop calls:

- [api/website-context.js](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/api/website-context.js)

That route:

- normalizes the URL
- fetches the homepage
- identifies useful same-domain links
- crawls a limited number of important pages
- classifies pages
- extracts evidence such as:
  - hero copy
  - headings
  - features
  - CTAs
  - proof signals
  - raw text
- sends the structured corpus to OpenAI

## 3. AI context generation

Loop generates a structured product context:

- product category
- target audience
- core use case
- market type
- assumptions

## 4. Context review

The user reviews the inferred context before drafting continues.

This is important because:

- weak website extraction should not silently control the draft
- direct facts and assumptions need human review
- the user can correct category, audience, or use case before narrative generation

## 5. Draft generation

Loop then generates:

- Product Truth
- Core Narrative
- GTM
- starter assets

The draft is staged rather than treated as final.

## 6. Workspace refinement

Inside the workspace, the user can:

- refine sections manually
- use improve mode
- request feedback
- publish

## 7. Feedback and review

Later AI logic supports:

- feedback normalization
- issue aggregation
- improvement suggestions

## AI design principles

- grounding first
- structured extraction before summarization
- human review before committing to the draft
- persistence at each meaningful step
- local fallback behavior when remote services fail

## Current limitations

- some sites may still be weakly analyzable
- JS-rendered sites can be harder to interpret than fully server-rendered pages
- the extraction logic is still MVP-level, not full production crawling infrastructure

## Direction going forward

To strengthen AI further, the next upgrades should focus on:

- better evidence scoring
- clearer fact vs inference separation
- stronger page weighting
- better support for JS-heavy websites
- output verification against extracted evidence
