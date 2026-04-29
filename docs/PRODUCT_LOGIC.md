# Product Logic

## Purpose

This document explains how Loop behaves as a product, in plain operational terms rather than code-level implementation detail.

## High-level product model

Loop is designed to help a user move through a narrative workflow in this order:

1. provide product inputs
2. optionally ground the story using a website URL
3. review AI context
4. generate a first draft
5. refine inside the workspace
6. request review and capture feedback
7. publish and improve the next version

## Main product areas

### Homepage / intake

The homepage acts as the first lightweight intake point.

The user can enter:

- product name
- product description
- website URL
- audience
- category
- wow factor

This information is used to start the AI workflow and create or update the active project.

### AI context review

Before the full draft is accepted, Loop presents an AI context review step.

This step exists so the user can confirm:

- product category
- target audience
- core use case
- market type
- assumptions

The goal is to prevent weak website analysis or vague inputs from silently shaping the whole narrative.

### Workspace

The main workspace is the core operating area.

It is organized into:

- Product Truth
  - Context
  - Customer
  - Product
  - Market
- Core Narrative
  - Positioning
  - Messaging
  - Value
- GTM
  - Strategy
  - Story
  - Assets

The center panel shows only the selected subsection canvas.

### Review and feedback

Loop supports:

- internal review routing
- review queues
- section-level feedback
- PMM follow-up
- confidence and analytics surfaces

This allows the narrative to improve through real review instead of one-time drafting.

### Projects hub

The Projects hub is where saved projects and versions can be reopened.

Projects are grouped into families so the user can:

- reopen unfinished work
- inspect versions
- start the next version of a narrative

## AI logic as product behavior

Loop’s AI is not meant to be one single draft button only. From the user’s point of view, the AI should do four jobs:

### 1. Understand

Interpret the typed product information and optional website evidence.

### 2. Draft

Generate:

- Product Truth
- Core Narrative
- GTM direction
- starter assets

### 3. Review

Highlight risks, gaps, weak proof, or sections that need improvement.

### 4. Improve

Help the user refine sections and support next-version iteration.

## Save logic as product behavior

From the product perspective, Loop should feel safe even if the user leaves before finishing.

Expected behavior:

- draft work should be saved automatically
- incomplete work should still appear in Projects
- local persistence should protect in-progress work
- remote persistence should sync when Supabase is available

The visible save badge in the workspace header exists to make this behavior understandable to the user.

## Lifecycle states

A project can roughly be understood as moving through:

- draft / in progress
- live
- closed

The project lifecycle is inferred from workflow progress and feedback completion rather than a single manual status field alone.

## Product assumptions

The current MVP assumes:

- one user can act on behalf of multiple review teams
- AI provides a strong first draft, not a final source of truth
- website grounding improves draft quality but may still need user correction
- persistence and reopening unfinished work are critical to trust

## Important UX principles

### Keep humans in control

Loop should help the user think faster, not hide important narrative decisions.

### Ground before drafting

Weak grounding creates weak drafts, so context review is a core product step.

### Save constantly

Users should not fear losing work if they close the tab or leave mid-flow.

### Make status visible

The user should understand:

- whether the project is saved
- whether AI is still working
- whether review is requested
- whether the project is ready to publish

## What this doc is for

Use this document when:

- onboarding a new engineer
- aligning product and engineering
- explaining why certain screens or steps exist
- reviewing whether a proposed change affects core product behavior
