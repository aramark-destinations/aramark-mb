---
name: pr-review
description: "Analyze an open GitHub PR locally — syncs branches, diffs changes, audits against project conventions, pulls developer notes from the PR description and comments, then produces a structured review doc in the relevant block directory (or docs/pr-reviews/ for non-block changes). Use when: reviewing a PR, preparing for a code review session, catching issues before merge, local code review without GitHub Copilot."
argument-hint: PR number to review (e.g. 42)
---

# PR Review

## Overview

This skill emulates a code review by syncing your local environment with the PR branch, diffing all changes, auditing against project conventions, and surfacing the developer's own notes. The output is a structured review doc saved in the relevant block directory (or `docs/pr-reviews/` for cross-cutting changes).

**Requires:** `gh` CLI authenticated (`gh auth status`). If not available, you can substitute manual `git` commands — the skill notes fallbacks throughout.

---

## Pre-flight

- [ ] PR number is known
- [ ] `gh` CLI is available: `gh auth status`
- [ ] Working tree is clean: `git status` (stash or commit any local changes first)

---

## Step 1: Fetch PR Metadata

```bash
gh pr view {PR_NUMBER} --json number,title,body,author,baseRefName,headRefName,state,labels,reviewDecision,reviews,comments
```

If `gh` is unavailable, ask the user to paste the PR description instead.

Record the following:
- **Title** and **PR number**
- **Author**
- **Base branch** (target — typically `main` or `staging`)
- **Head branch** (the feature branch)
- **PR body** — extract any "TODO", "outstanding", "follow-up", "known issue", or "needs review" notes from the developer
- **Existing review comments** — note any unresolved threads

---

## Step 2: Sync Branches

Fetch the latest from remote so the diff reflects the true state:

```bash
git fetch origin
```

Verify both branches exist on remote:

```bash
git branch -r | grep {BASE_BRANCH}
git branch -r | grep {HEAD_BRANCH}
```

---

## Step 3: Check Out the PR Branch

```bash
gh pr checkout {PR_NUMBER}
```

**Fallback without `gh`:**

```bash
git checkout {HEAD_BRANCH}
git pull origin {HEAD_BRANCH}
```

Then ensure the base is also up to date (needed for accurate diff):

```bash
git fetch origin {BASE_BRANCH}
```

---

## Step 4: Identify Changed Files

```bash
# All files changed in this PR
git diff --name-only origin/{BASE_BRANCH}...{HEAD_BRANCH}

# Categorize changes
git diff --name-only origin/{BASE_BRANCH}...{HEAD_BRANCH} | grep '^blocks/'
git diff --name-only origin/{BASE_BRANCH}...{HEAD_BRANCH} | grep '^brands/'
git diff --name-only origin/{BASE_BRANCH}...{HEAD_BRANCH} | grep '^styles/'
git diff --name-only origin/{BASE_BRANCH}...{HEAD_BRANCH} | grep '^scripts/'
git diff --name-only origin/{BASE_BRANCH}...{HEAD_BRANCH} | grep '^models/'
git diff --name-only origin/{BASE_BRANCH}...{HEAD_BRANCH} | grep '\.json$'
```

**Determine the primary context:**
- **Single block modified** → review doc goes to `blocks/{blockname}/pr-{PR_NUMBER}-review.md`
- **Multiple blocks or non-block changes** → review doc goes to `docs/pr-reviews/pr-{PR_NUMBER}-review.md`

Create `docs/pr-reviews/` if it does not exist.

---

## Step 5: Automated Checks

Run the following. Record PASS / FAIL / N-A for each.

### 5a. Lint

```bash
pnpm lint
```

Must produce zero errors and zero warnings.

### 5b. Tests

```bash
pnpm test
```

All tests must pass. If no tests exist for a changed block, record this as a **WARNING**.

### 5c. CSS Build

```bash
pnpm build:css
```

Must complete without errors. Every changed `.scss` file must have a corresponding `.css` file.

### 5d. JSON Schema Build (if `*.json` schema files changed)

```bash
pnpm build:json
```

Must complete without errors. Verify root `component-models.json`, `component-definition.json`, and `component-filters.json` are regenerated.

| Check | Result | Notes |
|---|---|---|
| Lint | PASS/FAIL | |
| Tests | PASS/FAIL/WARNING | |
| CSS Build | PASS/FAIL | |
| JSON Build | PASS/FAIL/N-A | |

**If any FAIL:** Record in the review doc as a **blocking issue**.

---

## Step 6: Load Project Knowledge & Reference Docs

Before reading any changed file, load the authoritative references so the audit is grounded in real project constraints — not generic best practices.

### 6a. Always load (for any PR)

Read these files in full:

| File | What it governs |
|---|---|
| `docs/project-knowledge/technical/technical-standards.md` | Block Pattern A definition, WCAG requirements, code style, testing state |
| `docs/project-knowledge/technical/platform-constraints.md` | No MSM, no Google Docs, ADO (not Jira), CI runs lint only |
| `docs/project-knowledge/governance/business-rules.md` | ADO branch naming, `ticket-details.md` convention, commit rules |
| `docs/BLOCK-EXTENSIBILITY-GUIDE.md` | Hook architecture, Pattern A deep-dive, lifecycle events |
| `docs/BLOCK-RENDERING-BUILD-CONFIG.md` | Token cascade, build pipeline, SCSS/CSS expectations |

### 6b. Load if blocks or styles were changed

| File | What it governs |
|---|---|
| `docs/project-knowledge/design/design-standards.md` | Breakpoints, token cascade rules, multi-brand constraints |
| `docs/project-knowledge/technical/performance-targets.md` | CWV thresholds, image breakpoints, component budgets, third-party loading rules |

### 6c. Load if a specific block was changed

For each changed block `{blockname}`:

- `blocks/{blockname}/ticket-details.md` — authoritative ADO requirements spec (read **first**)
- `docs/audits/{blockname}-audit.md` — prior audit findings (if it exists); surface any pre-existing NO-GO issues the PR should be resolving

### 6d. Check open project TODOs

Read `docs/project/TODOS.md`. If any open TODO is directly relevant to the PR's changes (e.g., a pending decision about brand tokens, a deferred feature now being implemented), flag it as a **context note** in the review doc.

---

## Step 7: Code Review — Changed Files

For **each file** in the diff, read it in full. Apply the relevant checklist, cross-referencing the knowledge docs loaded in Step 6.

### 7a. JavaScript files (`*.js` in `blocks/`)

**Pattern A** (authoritative definition: `docs/project-knowledge/technical/technical-standards.md`):

- [ ] Export signature: `export default function decorate(block, options = {})` (note: **named function**, not arrow)
- [ ] `window.{BlockName}?.hooks?.onBefore?.(block, options)` called **before** block logic
- [ ] `window.{BlockName}?.hooks?.onAfter?.(block, options)` called **after** block logic
- [ ] Lifecycle CustomEvent dispatched with `bubbles: true` and correct event name
- [ ] `{BlockName}` is PascalCase matching the block directory name (e.g., `Cards`, `UgcGallery`, `Carousel`)

**Imports:**

- [ ] Correct relative paths from block directory (`../../scripts/aem.js`, `../../scripts/scripts.js`, etc.)
- [ ] Import paths include `.js` extension (Airbnb ESLint rule)
- [ ] No unused imports

**Code style** (Airbnb config — `technical-standards.md`):

- [ ] Single quotes, not double quotes
- [ ] Arrow function params always have parens: `(x) =>`
- [ ] Max line length 100 characters
- [ ] `console.error`/`warn`/`info`/`debug` only — **never `console.log`**
- [ ] Unused params prefixed with `_`

**Platform constraints** (`platform-constraints.md`):

- [ ] No reference to MSM, live copies, or blueprint concepts
- [ ] No reference to Google Docs or SharePoint authoring
- [ ] No Adobe Commerce logic (`__dropins__`, cart, checkout)
- [ ] No hardcoded brand names, property-specific URLs, or site-specific values in shared blocks

**Accessibility** (`technical-standards.md` — WCAG 2.1 AA):

- [ ] All interactive elements reachable via keyboard
- [ ] `:focus-visible` not suppressed
- [ ] Images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Form inputs have associated `<label>` elements
- [ ] Dynamic content changes use `aria-live` or focus management
- [ ] Correct ARIA pattern for the block type (accordion, carousel, tabs, modal, breadcrumbs — see standards doc for specific roles)

**Performance** (`performance-targets.md`):

- [ ] No third-party libraries included without approval
- [ ] Third-party scripts load async or deferred — never render-blocking
- [ ] CSS-first approach — JS added only for behavior that cannot be achieved with CSS
- [ ] Hero images: `loading="eager"` and `fetchpriority="high"` (LCP candidate)

### 7b. SCSS / CSS files

**Token usage** (`design-standards.md`, `BLOCK-RENDERING-BUILD-CONFIG.md`):

- [ ] No hardcoded color values — no `#hex`, `rgb()`, `rgba()`, `hsl()` — must use `var(--color-*)`
- [ ] No hardcoded font sizes — must use `var(--font-size-*)`
- [ ] No hardcoded spacing in padding/margin/gap — must use `var(--spacing-*)`
- [ ] No hardcoded font families — must use `var(--font-family-*)`
- [ ] No hardcoded font weights — must use `var(--font-weight-*)`
- [ ] No hardcoded border-radius — must use `var(--radius-*)`
- [ ] No hardcoded z-index numbers — must use `var(--z-index-*)`
- [ ] No `!important` (unless inside a `brands/{brand}/tokens.css` override — not in shared blocks)

**BEM naming** (`docs/BLOCK-EXTENSIBILITY-GUIDE.md`):

- [ ] Classes follow `.{blockname}-{element}` pattern (e.g., `.cards-card-image`)
- [ ] No global class names that could collide across blocks

**Breakpoints** (`design-standards.md`):

- [ ] Breakpoint pixel values match the canonical system (xxs 360, xs 640, sm 768, md 881, md-lg 1024, lg 1280, xl 1440)
- [ ] If using raw pixel values, `// TODO: replace with $breakpoint-X once breakpoints partial is implemented` comment is present

**Multi-brand safety:**

- [ ] No styles in a shared block target a brand-specific class or attribute
- [ ] Brand overrides belong in `brands/{brand}/tokens.css`, not in block CSS

*Token exceptions: `0`/`0px`, `transparent`, `inherit`, `currentColor`, `1px` borders, `calc()` expressions combining tokens, media query breakpoint values.*

### 7c. JSON schema files (`_*.json`)

- [ ] Required fields present (`id`, `fields` or equivalent structure)
- [ ] Field naming matches what the block JS reads (camelCase keys)
- [ ] `pnpm build:json` has been run and root `component-models.json` / `component-definition.json` / `component-filters.json` are updated in the diff

### 7d. `ticket-details.md`

Already loaded in Step 6c. Check:

- Are all requirements listed in the spec represented in the implementation?
- Are there spec items flagged as out-of-scope that appear to have been implemented anyway?
- Are there acceptance criteria that are clearly not yet met?

### 7e. `README.md`

- [ ] README exists
- [ ] All variants and author-configurable fields are documented
- [ ] Content reflects the current state of the implementation (not the original spec)

### 7f. Prior audit findings (`docs/audits/{blockname}-audit.md`)

Cross-reference the prior audit (if it exists):

- Were the NO-GO items from the prior audit addressed by this PR?
- Has the block status changed from NO-GO → GO based on this PR's changes?
- Are any prior audit findings still unresolved and not mentioned in the PR?

---

## Step 8: Spec Alignment Check

Using `ticket-details.md` already loaded in Step 6c, map every requirement to the implementation:

| Requirement | Status | Notes |
|---|---|---|
| {requirement} | MET / PARTIAL / NOT MET | |

Flag any requirements marked "TODO" or "follow-up" in the ticket as **outstanding items**.

---

## Step 9: Developer Notes Extraction

From the PR body and any PR comments gathered in Step 1, extract:

1. **Known issues** — anything the developer flagged as broken, incomplete, or needing follow-up
2. **Out-of-scope notes** — items intentionally deferred to another ticket
3. **Review asks** — specific things the developer wants a reviewer to look at
4. **Open questions** — anything marked "?", "TBD", or "need feedback"

---

## Step 10: Branch & Commit Hygiene

**Branch naming** (`governance/business-rules.md`): must be `ADO-{ticket}-{block/element/feature}` — the third segment is the block or feature name, not the commit type.

```bash
# Confirm branch name
git branch --show-current

# Review commit messages: type(scope): description
git log origin/{BASE_BRANCH}...{HEAD_BRANCH} --oneline
```

- [ ] Branch follows `ADO-{ticket}-{block/element/feature}` pattern
- [ ] Commit messages follow `type(scope): description` format — valid types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`
- [ ] No merge commits (should be rebased)
- [ ] No `console.log`, `debugger`, or commented-out code

---

## Step 11: Produce the Review Doc

Save the review doc to the path determined in Step 4. Add an **Audit Sources** section so the reviewer knows what references were consulted.

Use this template:

```markdown
# PR #{PR_NUMBER} Review — {TITLE}

**Date:** {TODAY}
**Author:** {AUTHOR}
**Branch:** `{HEAD_BRANCH}` → `{BASE_BRANCH}`

---

## Audit Sources

This review was conducted against:
- `docs/project-knowledge/technical/technical-standards.md`
- `docs/project-knowledge/technical/platform-constraints.md`
- `docs/project-knowledge/governance/business-rules.md`
- `docs/project-knowledge/design/design-standards.md` *(if styles changed)*
- `docs/project-knowledge/technical/performance-targets.md` *(if blocks/styles changed)*
- `docs/BLOCK-EXTENSIBILITY-GUIDE.md`
- `docs/BLOCK-RENDERING-BUILD-CONFIG.md`
- `blocks/{blockname}/ticket-details.md` *(if block work)*
- `docs/audits/{blockname}-audit.md` *(if prior audit exists)*

---

## Summary

{One-paragraph summary of what this PR does.}

---

## Automated Checks

| Check | Result | Notes |
|---|---|---|
| Lint | PASS/FAIL | |
| Tests | PASS/FAIL/WARNING | |
| CSS Build | PASS/FAIL | |
| JSON Build | PASS/FAIL/N-A | |

---

## Developer Notes (from PR description)

> {Quoted or paraphrased developer notes, known issues, and open questions}

**Outstanding items flagged by developer:**
- [ ] {item}

---

## Code Review Findings

### Blocking Issues
{Issues that must be resolved before merge — e.g., broken Pattern A, hardcoded tokens, failing tests, platform constraint violations}

- [ ] {finding} — `{file}` line {N}

### Warnings
{Non-blocking but should be addressed — e.g., missing README section, minor token violations, missing breakpoint TODO comment}

- [ ] {finding}

### Informational
{Observations that don’t require action but are worth noting}

- {observation}

---

## Prior Audit Status

*From `docs/audits/{blockname}-audit.md`*

| Prior Finding | Resolved by this PR? |
|---|---|
| {finding} | YES / NO / PARTIAL |

**Block status after this PR:** NO-GO → {GO / still NO-GO}

---

## Spec Alignment

| Requirement | Status | Notes |
|---|---|---|
| {requirement} | MET / PARTIAL / NOT MET | |

---

## Action Items for Review Session

- [ ] {actionable next step}
- [ ] Discuss: {open question}
- [ ] Decide: {decision needed}

---

## Files Changed

{List of files with one-line descriptions of what changed}
```

---

## Step 12: Present and Collaborate

After saving the doc, summarize findings verbally:

1. **Blocking issues count** — number of things that must change
2. **Warnings count** — number of things worth improving
3. **Developer's own outstanding items** — what they already know about
4. **Top 1-3 things to discuss** — surface the highest-stakes open questions first

Then offer:
- To fix any blocking issue directly (`I can fix the Pattern A violation in carousel.js — want me to?`)
- To answer questions about findings
- To look deeper at any specific file or function
