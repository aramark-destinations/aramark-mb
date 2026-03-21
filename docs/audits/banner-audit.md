# Block Audit Report: banner
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | FAIL |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 11/19 items passed |

## Overall: NO-GO

## Details

### Structure

Files present:
- `banner.js` — present
- `banner.css` — present
- `_banner.json` — present
- `NOTES.md` — present (development notes, NOT a README)

Files missing:
- `banner.scss` — MISSING. CSS is authored directly in `banner.css` with no SCSS source file. This breaks the project convention of SCSS as source.
- `README.md` — MISSING. `NOTES.md` is a developer-facing status file, not an author-facing README documenting use cases and configuration. The audit skill requires a README.
- `ticket-details.md` — MISSING. No ADO ticket requirements file committed to the block directory.

Result: FAIL (missing SCSS source file, missing README.md, missing ticket-details.md)

### Pattern A Compliance

**2a. Export signature**
- Named export `export async function decorate(block, options = {})` — PASS
- Default export `export default (block) => decorate(block, window.Banner?.hooks)` — PASS
- `options = {}` default parameter present — PASS

**2b. Lifecycle hooks and events**
- `ctx = { block, options }` — PASS
- `options.onBefore?.(ctx)` before block logic — PASS
- `block.dispatchEvent(new CustomEvent('banner:before', { detail: ctx }))` — PASS
- `readVariant(block)` called — PASS
- `options.onAfter?.(ctx)` after block logic — PASS (note: also called in the early-return path, which is correct)
- `block.dispatchEvent(new CustomEvent('banner:after', { detail: ctx }))` — PASS

**2c. Imports**
- `readVariant` from `../../scripts/scripts.js` — PASS
- No other block utility imports needed — PASS

**2d. No site-specific code**
- No brand-specific logic, URLs, or hard-coded property values — PASS

Result: PASS

### CSS Token Audit

Scanned `banner.css` (no SCSS source file exists).

**Line 3:** `z-index: 10`
  Suggested: `z-index: var(--z-index-banner)` or `var(--z-index-above-content)` — hard-coded z-index should use a token from the z-index scale

**Line 49:** `opacity: 0.8`
  Suggested: Opacity values are borderline; if this is a design-system-level opacity, consider `var(--opacity-muted)` or similar. Not a blocking violation but worth reviewing.

Note: The CSS makes good use of tokens (`var(--color-primary)`, `var(--text-light-1)`, `var(--spacing-008)`, `var(--spacing-048)`, `var(--spacing-016)`, `var(--spacing-004)`, `var(--body-font-size-xs)`, `var(--line-height-normal)`, `var(--heading-font-size-s)`). Token coverage is otherwise strong.

The `z-index: 10` is the primary token violation.

Result: WARNING (2 violations — z-index hard-coded value; opacity borderline)

### Spec Alignment

No `ticket-details.md` or `README.md` exists for this block. Spec alignment is assessed against `NOTES.md` and the UE JSON schema.

Known gaps identified in `NOTES.md`:

| Use Case | Implemented? | Notes |
|---|---|---|
| Rotating announcement bar | YES | Multi-slide rotation with 5-second interval implemented |
| Dismiss with sessionStorage persistence | YES | Implemented and keyed to pathname |
| WCAG 2.2.2 pause on hover/focus | YES | Implemented (pause on mouseenter/focusin) — contradicts NOTES.md which says it was missing; implementation is correct |
| prefers-reduced-motion | YES | Implemented — also contradicts NOTES.md; implementation is correct |
| Close button | YES | Renders `×` character; icon replacement is deferred (per NOTES.md) |
| mediaImage slide field | NO | UE schema only exposes a single `text` richtext field per slide; no image, alt, or CTA fields |
| ctaLink / ctaLabel fields | NO | Not in UE schema; NOTES.md explicitly flags this as outstanding work |
| Shared dismiss key strategy | NO | Currently scoped to pathname only; cross-page banner fragments need a shared key |

The UE schema is significantly underpowered — authors cannot configure slide images or CTA buttons via Universal Editor. This is a material gap for a production announcement bar.

Result: WARNING (authoring contract is incomplete; NOTES.md self-documents the gaps)

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/banner/` convention
- [PASS] Has `banner.js` with `decorate(block)` export
- [PASS] Has `banner.css`
- [PASS] BEM-style CSS classes (`.banner-slides`, `.banner-slide`, `.banner-slide-active`, `.banner-close`)
- [FAIL] README documents use cases and configuration — NOTES.md is not a README
- [PASS] Part of shared global library (no site-specific code)
- [PASS] Brand differentiation via tokens only
- [WARNING] Uses semantic design tokens — mostly; z-index hard-coded
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly across breakpoints (single-row bar, no complex layout)
- [PASS] Content fluidly expands within margins
- [N/A] Columns stack vertically at mobile widths
- [PASS] Respects 1440px max-width (inherits from container)

**Authoring Contract**
- [PASS] Works with Universal Editor in-context editing
- [FAIL] Author-facing fields are clear and documented — UE schema exposes only `text` richtext; image and CTA fields missing
- [PASS] Composable — not bound to specific templates
- [PASS] Structure/content/presentation decoupled

**Performance**
- [N/A] Third-party scripts
- [N/A] Images use optimized URLs (no image support in current implementation)
- [PASS] No unnecessary JavaScript
- [N/A] Video

**Accessibility (WCAG 2.1)**
- [PASS] Auto-rotation pauses on hover/focus (implemented despite NOTES.md claim)
- [PASS] Dismiss button has `aria-label="Close banner"`
- [PASS] Respects prefers-reduced-motion
- [WARNING] Color contrast — depends on `var(--color-primary)` and `var(--text-light-1)` token values; not verifiable in static audit
- [N/A] Alt text fields — no image support in current schema

Score: 11/19 applicable items passed.

## Remediation

**Priority 1 — Blocking (must fix before GO)**
1. Create `README.md` documenting block use cases, authoring fields, and behavior. The `NOTES.md` file is an internal dev artifact, not authoring documentation.
2. Create `banner.scss` as the SCSS source file. Rename/refactor `banner.css` — the compiled CSS should be generated from SCSS, not hand-authored.
3. Create `ticket-details.md` with the ADO ticket requirements for this block.
4. Expand `_banner.json` UE model to include `mediaImage` (reference), `mediaImageAlt` (text), `ctaLink` (aem-content), and `ctaLabel` (text) fields on the `banner-item` model, as documented in `NOTES.md`.

**Priority 2 — Should fix**
5. Replace `z-index: 10` with a token (`var(--z-index-banner)` or `var(--z-index-above-content)`).
6. Resolve dismiss key strategy for banners used as shared fragments across multiple pages.

**Priority 3 — Deferred**
7. Replace close button `×` character with the project icon system (`:ph-x:` or equivalent) once the icon resolver is available.
