# End-to-End Product Flow

## Purpose

This document defines the recommended end-to-end product flow for Loop so the user journey feels like one connected operating system instead of overlapping modules.

It focuses on:

- states
- transitions
- triggers
- dependencies
- approval rules
- publish readiness
- feedback loop closure

This is a product logic spec, not a code implementation spec.

## Core principle

Loop should always know:

- what changed
- what depends on it
- what became stale
- what needs review
- what is approved
- what is publishable
- what should drive the next version

## Main product objects

Loop should treat these as first-class objects:

### 1. Narrative sections

Examples:

- Context
- Customer
- Product
- Market
- Positioning
- Messaging
- Value
- Strategy
- Story

### 2. Assets

Examples:

- homepage headline
- elevator pitch
- launch email
- messaging block
- future asset outputs

### 3. Feedback items

Examples:

- review comments
- improve requests
- approval notes
- post-launch market signal

### 4. Version

A published or in-progress narrative version with attached:

- section states
- asset states
- review states
- analytics baseline

## Required section states

Each narrative section should have one of these states:

- `draft`
- `ready_for_review`
- `in_review`
- `approved`
- `changed_after_approval`
- `blocked`

## Required asset states

Each asset should have one of these states:

- `not_started`
- `draft`
- `needs_review`
- `approved`
- `stale`
- `published`

## Required version states

Each project version should have one of these states:

- `drafting`
- `review_ready`
- `in_review`
- `approved_for_publish`
- `published`
- `measuring`
- `closed_loop`

## Required feedback states

Each feedback item should have one of these states:

- `new`
- `mapped`
- `converted_to_task`
- `resolved`
- `ignored`

## Dependency model

Loop should treat dependencies explicitly.

### Product Truth -> Core Narrative

If these change:

- Context
- Customer
- Product
- Market

Then these may become stale:

- Positioning
- Messaging
- Value

### Core Narrative -> GTM

If these change:

- Positioning
- Messaging
- Value

Then these may become stale:

- Strategy
- Story
- GTM-linked assets

### Narrative + GTM -> Assets

If these change:

- Positioning
- Messaging
- Value
- Strategy
- Story

Then these become stale:

- related generated assets

## User journey flow

### Stage 1. Intake

User enters:

- product name
- product description
- optional website URL
- audience
- category
- wow factor

#### Transition rule

When user clicks generate:

- create a project shell
- set version state to `drafting`
- trigger website analysis if URL exists
- trigger AI context generation

## Stage 2. AI context review

User reviews:

- category
- target audience
- use case
- market type
- assumptions

#### Transition rule

If user confirms:

- generate Product Truth
- generate Core Narrative
- open workspace

If user edits context:

- regenerate downstream draft from revised context

If user chooses manual build:

- open workspace without generated narrative

## Stage 3. Workspace drafting

The workspace is where the user edits sections.

#### Rules

- Each edited section remains `draft` until explicitly sent forward
- Loop should track `last_modified_at`
- Loop should track whether section content changed materially

#### Trigger

When a user changes an approved section:

- section becomes `changed_after_approval`
- dependent sections get `needs consistency check` internally
- dependent assets become `stale`

## Stage 4. Review preparation

When the user clicks `Get Feedback`:

Loop should not treat that as a generic action.

It should determine:

- which sections changed since last review
- which sections are already approved and unchanged
- which assets are stale

#### Transition rule

Only changed or newly ready sections should move to:

- `ready_for_review`

Version state becomes:

- `review_ready`

## Stage 5. Review routing

Loop assigns sections to review teams.

#### Rules

- routing is section-scoped, not global
- each section knows which team owns current review
- unchanged approved sections do not need full re-review

#### Transition rule

When review is sent:

- section state becomes `in_review`
- version state becomes `in_review`

## Stage 6. Review execution

Reviewers can:

- approve
- improve
- comment
- score

#### Transition rule

If approved:

- section state becomes `approved`

If improve requested:

- section state becomes `draft`
- feedback item created
- revision task created

## Stage 7. Feedback-to-revision mapping

This is one of the most important missing layers.

Every feedback item should be mapped to:

- section
- optional asset
- version
- severity
- issue type

#### Rules

Feedback must convert into one of:

- revision task
- no-op resolution
- tracked unresolved issue

#### Output

Loop should generate a revision queue such as:

- sharpen positioning claim
- add proof to homepage asset
- clarify buyer in messaging

## Stage 8. Asset generation and asset governance

Assets should not sit beside the narrative as independent drafts forever.

They should be governed by dependency logic.

#### Rules

When an asset is generated:

- state becomes `draft`

When an asset is reviewed:

- state becomes `approved`

When its parent narrative or GTM input changes:

- state becomes `stale`

#### Important rule

An approved asset can lose readiness without being deleted.

That is how the system should show:

- this exists
- but it is no longer aligned

## Stage 9. Approval logic

Approvals should be scoped.

#### Rules

- approval is granted at section or asset level
- approval remains valid until the approved object changes materially
- only changed items lose approval
- unchanged approved items stay approved

#### Why this matters

Without scoped approval, users feel forced to restart the whole workflow.

## Stage 10. Publish readiness gate

Publish should be a governed action.

Loop should calculate publish readiness based on:

- required sections completed
- required sections approved
- no critical open improve items
- required assets not stale
- version has final approval state

#### Transition rule

If all publish gates pass:

- version state becomes `approved_for_publish`

When user publishes:

- version state becomes `published`
- approved assets can become `published`
- a publish baseline is created

## Stage 11. Analytics and measurement

Analytics should attach to the published version, not to the workspace in the abstract.

#### Rules

Every analytics or feedback signal should map to:

- published version
- related narrative section when possible
- related asset when possible

#### This allows Loop to answer

- which version is live
- which narrative produced the result
- which asset set was used
- what changed compared with previous version

## Stage 12. Feedback loop closure

After publish, Loop should gather:

- internal feedback
- external signal
- performance outcomes
- asset performance

This should become structured next-version input.

#### Output

Loop should prepare:

- top issues
- weak sections
- stale assumptions
- recommended next-version focus

Version state becomes:

- `measuring`

And eventually:

- `closed_loop`

## Ideal trigger table

| Trigger | Immediate effect | Downstream effect |
|---|---|---|
| User edits Product Truth section | section becomes `draft` or `changed_after_approval` | related narrative sections may need consistency review |
| User edits Core Narrative section | section becomes `draft` or `changed_after_approval` | GTM and assets may become stale |
| User edits GTM section | section becomes `draft` or `changed_after_approval` | related assets may become stale |
| User requests feedback | changed sections move to `ready_for_review` | version becomes `review_ready` |
| Review sent | reviewed sections become `in_review` | version becomes `in_review` |
| Reviewer approves section | section becomes `approved` | publish readiness improves |
| Reviewer requests improve | revision task created | section returns to `draft` |
| Narrative changes after asset approval | asset becomes `stale` | publish readiness may drop |
| All required sections approved | version becomes `approved_for_publish` | publish CTA becomes valid |
| Version published | analytics baseline created | version moves to `published` then `measuring` |
| Feedback cycle ends | next-version recommendations created | version becomes `closed_loop` |

## What should be visible to the user

To make the journey feel connected, the user should always be able to see:

- current version state
- which sections are draft vs approved
- which assets are stale
- which feedback items are unresolved
- whether publish is blocked
- why publish is blocked

## Minimal MVP implementation order

To make the journey feel more connected without rebuilding everything at once:

### Phase 1

- section states
- asset states
- changed-after-approval logic

### Phase 2

- stale dependency logic
- review scoping for changed sections only

### Phase 3

- feedback-to-revision queue
- publish readiness gate

### Phase 4

- analytics linked to published version
- next-version seed logic

## Short summary

The ideal Loop journey is:

- grounded
- stateful
- dependency-aware
- approval-aware
- publish-gated
- version-linked
- feedback-closing

That is what will make Workspace, Assets, Review, Approvals, Feedback, and Analytics feel like one connected operating system.
