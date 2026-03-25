---
name: pre-merge-check
description: Orchestrator skill — runs all compliance checks before a PR is merged. Use as the final quality gate before merging any PR.
---

# Pre-Merge Check

## Overview

This skill is the final quality gate before merging a PR. It orchestrates checks from other skills and adds PR-specific validations. Run this after all development is complete and the PR is ready for review.

**This skill calls:**
- `eds/block-audit` — for any modified blocks
- `eds/quality-audit` — if a testable URL is available

---

## Pre-flight

- [ ] All development work is complete
- [ ] Code is committed and pushed to the feature branch
- [ ] PR is open against `main` (or `staging`)

---

## Step 1: Identify Changes

Determine what changed in this PR to scope the remaining checks.

```bash
# List all changed files compared to main
git diff --name-only main...HEAD

# Categorize changes
git diff --name-only main...HEAD | grep '^blocks/'      # Block changes
git diff --name-only main...HEAD | grep '^brands/'      # Brand/token changes
git diff --name-only main...HEAD | grep '^styles/'      # Global style changes
git diff --name-only main...HEAD | grep '^scripts/'     # Script changes
git diff --name-only main...HEAD | grep '^models/'      # UE model changes
git diff --name-only main...HEAD | grep '\.json$'       # JSON changes (schemas)
```

Record which blocks were modified — these will be individually audited in Step 3.

---

## Step 2: Automated Checks

Run all automated tooling. Every check must pass.

### 2a. Lint

```bash
pnpm lint
```

**Must pass with zero errors and zero warnings.** This is enforced by the Husky pre-commit hook, but verify explicitly.

### 2b. Tests

```bash
pnpm test
```

**All tests must pass.** If no tests exist yet (`jest.config.js` missing), note this as a WARNING, not a blocker.

### 2c. CSS Build

```bash
pnpm build:css
```

**Must complete without errors.** Verify that every `.scss` file has a corresponding `.css` file in the same directory.

### 2d. JSON Schema Build (if schemas changed)

If any `_*.json` files were modified (block schemas or model files):

```bash
pnpm build:json
```

**Must complete without errors.** Verify that root `component-models.json`, `component-definition.json`, and `component-filters.json` are up to date.

### Results

| Check | Command | Result |
|---|---|---|
| Lint | `pnpm lint` | PASS/FAIL |
| Tests | `pnpm test` | PASS/FAIL/WARNING (no tests) |
| CSS Build | `pnpm build:css` | PASS/FAIL |
| JSON Build | `pnpm build:json` | PASS/FAIL/N-A |

**If any FAIL:** Stop here. Fix the failures before continuing.

---

## Step 3: Block Validation (if blocks changed)

For each block that was modified in this PR, run an abbreviated `eds/block-audit`. Focus on:

### Per-block checklist

- [ ] **Pattern A compliance:** `export function decorate(block, options = {})` with lifecycle hooks + `export default (block) => decorate(block, window.{Name}?.hooks)`
- [ ] **CSS token usage:** No hard-coded hex colors, font sizes, spacing, or font families — all must use `var(--token)` references
- [ ] **BEM class naming:** CSS classes follow `.{blockname}-{element}` pattern
- [ ] **README exists:** `blocks/{blockname}/README.md` is present and up to date
- [ ] **UE JSON schema:** `_{blockname}.json` exists if block has author-configurable fields
- [ ] **No site-specific code:** No brand names, property-specific URLs, or hard-coded configurations in shared blocks
- [ ] **Accessibility basics:** Semantic HTML, alt text fields for images, keyboard support for interactive elements

If a block fails any check, record the specific issue for the PR review.

---

## Step 4: Token Validation (if tokens changed)

If any files in `styles/` or `brands/` were modified:

### Root token changes (`styles/root-tokens.scss` or `styles/fixed-tokens.scss`)

- [ ] Change is intentional and coordinated (root token changes affect ALL brands)
- [ ] No tokens were removed that are still referenced by blocks
- [ ] Derived tokens in `fixed-tokens.scss` still calculate correctly
- [ ] All existing brands still render correctly after the change

### Brand token changes (`brands/{brand}/tokens.css`)

- [ ] Only tokens that differ from root are included (no unnecessary overrides)
- [ ] Token values are valid (hex colors, font stacks with fallbacks)
- [ ] No `!important` used
- [ ] Brand cascade works: `pnpm start:brand {brand}` renders correctly

---

## Step 5: Branch and Commit Hygiene

### 5a. Branch naming

Branch name must follow: `ADO-{ticket}-{block/element/feature}`

Examples:
- `ADO-94-cards` (cards block work)
- `ADO-120-carousel-scroll` (carousel scroll fix)
- `ADO-200-brand-tokens` (brand token work)

The third segment is the **what** (block/feature name), not the commit type.

**Check:**
```bash
git branch --show-current
```

### 5b. Sensitive files

Verify no sensitive files are staged:

```bash
# These should NEVER be committed
git diff --name-only main...HEAD | grep -E '\.env$|\.env\.local|credentials|secrets|\.key$|\.pem$'
```

**If any match:** FAIL — remove from the PR immediately.

### 5c. Generated files

Verify generated files are up to date (not stale):

- [ ] `component-models.json` matches aggregated block schemas
- [ ] `component-definition.json` is current
- [ ] `component-filters.json` is current
- [ ] All `.css` files match their `.scss` sources

---

## Step 6: Generate Report

```
# Pre-Merge Check Report
Branch: {branch-name}
PR: #{pr-number} (if applicable)
Date: {date}
Changed files: {count}

## Automated Checks
| Check | Result |
|---|---|
| Lint | PASS/FAIL |
| Tests | PASS/FAIL/WARNING |
| CSS Build | PASS/FAIL |
| JSON Build | PASS/FAIL/N-A |

## Block Validation
| Block | Pattern A | Tokens | BEM | README | UE Schema | A11y |
|---|---|---|---|---|---|---|
| {block1} | PASS/FAIL | PASS/FAIL | PASS/FAIL | PASS/FAIL | PASS/FAIL | PASS/FAIL |
| {block2} | ... | ... | ... | ... | ... | ... |

## Token Validation
| Check | Result |
|---|---|
| Root tokens | PASS/FAIL/N-A |
| Brand tokens | PASS/FAIL/N-A |

## Hygiene
| Check | Result |
|---|---|
| Branch naming | PASS/FAIL |
| No sensitive files | PASS/FAIL |
| Generated files current | PASS/FAIL |

## Overall: GO / NO-GO

## Issues to Resolve (if NO-GO)
1. {issue + fix}
...
```

---

## Anti-Patterns

| Do NOT | Do instead |
|--------|-----------|
| Skip lint because "it passed in pre-commit" | Run explicitly — pre-commit can be bypassed with `--no-verify` |
| Merge with failing tests | Fix tests first — green CI is a hard requirement |
| Skip block audit because "it's a small change" | Small changes can break Pattern A or introduce hard-coded values |
| Commit `.env` files | Add to `.gitignore`, use `.env.example` for templates |
| Push stale `component-models.json` | Always run `pnpm build:json` after schema changes |
| Approve a NO-GO report | Every issue must be resolved before merge |
