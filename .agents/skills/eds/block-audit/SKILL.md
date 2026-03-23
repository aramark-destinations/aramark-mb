---
name: eds/block-audit
description: Validate a block against solution design requirements, compare implementation to spec, and audit CSS for proper token usage.
when_to_use: after implementing or modifying a block, before creating a PR, or when reviewing someone else's block implementation
version: 1.0.0
---

# EDS Block Audit

## Overview

This skill performs a comprehensive audit of a block against the solution design. It combines three checks into one pass:

1. **Structure & convention validation** — file naming, Pattern A compliance, README
2. **Spec alignment** — compare implementation against `ticket-details.md` and the block's README
3. **Token usage audit** — scan CSS for hard-coded values that should use tokens

**Output:** A structured PASS/FAIL/WARNING report per category.

---

## Pre-flight

- [ ] Identify the block to audit (e.g., `blocks/cards/`)
- [ ] Read the block's `ticket-details.md` (source of truth for requirements)
- [ ] Read the block's `README.md` for documented use cases and fields

---

## Step 1: Structure Validation

Check the block directory against naming and file conventions.

| Check | Expected | How to verify |
|---|---|---|
| Directory path | `/blocks/{blockname}/` (lowercase, hyphenated) | `ls blocks/{blockname}/` |
| JS file | `{blockname}.js` exists | File present |
| CSS file | `{blockname}.css` exists | File present |
| SCSS file | `{blockname}.scss` exists (source for CSS) | File present |
| README | `README.md` exists and documents use cases | File present, not empty |
| UE JSON schema | `_{blockname}.json` exists (if block has author-configurable fields) | File present |

**Result:** PASS if all required files exist. FAIL if JS or CSS missing. WARNING if README or UE schema missing.

---

## Step 2: JavaScript — Pattern A Compliance

Read `{blockname}.js` and verify the following:

### 2a. Export signature

```js
// REQUIRED: named export with options parameter
export function decorate(block, options = {}) { ... }

// REQUIRED: default export wiring hooks from window
export default (block) => decorate(block, window.{BlockName}?.hooks);
```

- `{BlockName}` is the PascalCase version of the block name (e.g., `Cards`, `VideoHero`, `UgcGallery`)
- The `options = {}` default parameter is required

### 2b. Lifecycle hooks and events

Inside `decorate()`, verify this structure:

```js
export function decorate(block, options = {}) {
  const ctx = { block, options };

  // BEFORE hooks — must come before block logic
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('{block-name}:before', { detail: ctx, bubbles: true }));

  // ... block logic ...
  readVariant(block);

  // AFTER hooks — must come after block logic
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('{block-name}:after', { detail: ctx, bubbles: true }));
}
```

### 2c. Imports

Verify imports use correct paths from block directory:
- `../../scripts/aem.js` — for `createOptimizedPicture`, `readBlockConfig`, `loadCSS`, `toClassName`
- `../../scripts/scripts.js` — for `moveInstrumentation`, `readVariant`, `moveAttributes`
- `../../scripts/baici/utils/config.js` — for `readConfig`, `readKeyValueConfig`, `readUeConfig`
- `../../scripts/baici/utils/utils.js` — for `fetchSvg`, `debounce`

### 2d. No site-specific code

- No brand-specific logic inside shared blocks
- No hard-coded brand names, URLs, or property-specific values
- Brand differentiation must happen via tokens or brand-level block overrides

**Result:** PASS/FAIL per sub-check. Any FAIL in 2a or 2b is a blocking issue.

---

## Step 3: CSS Token Audit

Read `{blockname}.scss` (or `.css`) and scan for hard-coded values that should use design tokens.

### What to flag

| Pattern | Should be | Token source |
|---|---|---|
| Hex colors (`#fff`, `#004d99`) | `var(--color-*)` | `root-tokens.scss` |
| `rgb()` / `rgba()` / `hsl()` / `hsla()` | `var(--color-*)` | `root-tokens.scss` |
| Pixel font sizes (`16px`, `1.2rem`) | `var(--font-size-*)` | `styles.scss` |
| Pixel spacing (`8px`, `1rem` for padding/margin/gap) | `var(--spacing-*)` | `styles.scss` |
| Font family strings (`'Roboto'`, `sans-serif`) | `var(--font-family-*)` | `styles.scss` |
| Font weight numbers (`400`, `700`) | `var(--font-weight-*)` | `root-tokens.scss` |
| Border radius values (`4px`, `50%`) | `var(--radius-*)` | `root-tokens.scss` |
| Z-index numbers (`10`, `100`, `9999`) | `var(--z-index-*)` | `styles.scss` |
| Box shadow values | `var(--shadow-*)` | `styles.scss` |
| Transition durations (`0.3s`) | `var(--transition-duration-*)` | `root-tokens.scss` |

### Exceptions (do NOT flag)

- `0` or `0px` — zero values don't need tokens
- `100%`, `50%` — percentage layout values are fine
- `1px` for borders — acceptable as structural, not brand-related
- Values inside `calc()` expressions that combine tokens
- `transparent`, `inherit`, `currentColor`, `initial`, `unset`
- Media query breakpoint values (CSS custom properties can't be used in media queries)
- Values inside `:root` declarations (these ARE token definitions)

### Report format

For each violation, report:
```
Line {N}: {property}: {value}
  Suggested: {property}: var(--{token-name})
```

**Result:** PASS if zero violations. WARNING if 1-3 violations. FAIL if 4+ violations.

---

## Step 4: Spec Alignment

Read the block's `ticket-details.md` and `README.md` as the source of truth for requirements. Compare against the implementation.

### 4a. Use cases

List each use case from `ticket-details.md` / README. For each, verify the implementation supports it:

```
| Use Case | Implemented? | Notes |
|---|---|---|
| {use case 1} | YES/NO/PARTIAL | {explanation} |
| {use case 2} | YES/NO/PARTIAL | {explanation} |
```

### 4b. Configurable fields

List each configurable field documented in the README. Verify it exists in:
- The UE JSON schema (`_{blockname}.json`)
- The JS implementation (read/used in `decorate()`)

### 4c. Content Fragment integration

If the block consumes Content Fragments, verify:
- Block renders CF data correctly
- Common card fields use standard names: `title`, `eyebrow`, `shortDescription`, `images`, `button1Link`, `button1Text`, `button1Style`, `button1ThemeColor`, `button2Link`, `button2Text`, `button2Style`, `button2ThemeColor`

### 4d. Design details

Check any specific requirements in `ticket-details.md` (e.g., "responsive iframe embed", "two scroll states", "lightbox with carousel controls").

**Result:** PASS if all spec items covered. WARNING if minor gaps. FAIL if major use cases missing.

---

## Step 5: Developer Alignment Checklist

Walk through the applicable items below. These reflect the platform conventions for all blocks in this repo. Mark each as:

- **PASS** — requirement met
- **FAIL** — requirement not met
- **N/A** — not applicable to this block

### General Block Requirements
- [ ] Directory follows `/blocks/{blockname}/` convention
- [ ] Has `{blockname}.js` with `decorate(block)` export
- [ ] Has `{blockname}.css`
- [ ] BEM-style CSS classes (`.{blockname}-{element}`)
- [ ] README documents use cases and configuration
- [ ] Part of shared global library (no site-specific code)
- [ ] Brand differentiation via tokens only
- [ ] Uses semantic design tokens (not hard-coded values)
- [ ] Supports Root + Brand token cascade

### Responsive Design
- [ ] Renders correctly across breakpoints (xxs through xxl)
- [ ] Content fluidly expands within margins
- [ ] Columns stack vertically at mobile widths (if applicable)
- [ ] Respects 1440px max-width

### Authoring Contract
- [ ] Works with Universal Editor in-context editing
- [ ] Author-facing fields are clear and documented
- [ ] Composable — not bound to specific templates
- [ ] Structure/content/presentation decoupled
- [ ] Content Fragment integration works where specified

### Performance
- [ ] Third-party scripts load asynchronously
- [ ] Images use optimized URLs
- [ ] No unnecessary JavaScript
- [ ] Video uses appropriate embed method

### Accessibility (WCAG 2.1)
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG requirements
- [ ] Semantic HTML structure
- [ ] Works with assistive technologies
- [ ] Alt text fields available for images

---

## Step 6: Generate Report

Output a structured report with this format:

```
# Block Audit Report: {blockname}
Date: {date}

## Summary
| Category | Result |
|---|---|
| Structure | PASS/FAIL/WARNING |
| Pattern A Compliance | PASS/FAIL |
| CSS Token Usage | PASS/FAIL/WARNING ({N} violations) |
| Spec Alignment | PASS/FAIL/WARNING |
| Developer Checklist | {N}/{M} items passed |
| Accessibility Basics | PASS/FAIL/WARNING |

## Overall: GO / NO-GO

## Details
{detailed findings per category}

## Remediation
{prioritized list of items to fix}
```

---

## Anti-Patterns

| Do NOT | Do instead |
|--------|-----------|
| Audit only the CSS and skip the JS | Run all steps — structure, JS, CSS, spec, checklist |
| Flag `0` or `100%` as token violations | Only flag values that have corresponding tokens |
| Accept "it works" as spec alignment | Compare every use case and field from `ticket-details.md` and the block's README |
| Skip the UE JSON schema check | UE schema IS the authoring contract — it must match the spec |
| Audit a brand-override block with this skill | This skill is for shared blocks in `/blocks/` only |
