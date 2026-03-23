# Block Audit Report: banner
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 13/19 items passed |

## Overall: GO

## Details

### Structure

Files present in `blocks/banner/`:

| File | Status |
|---|---|
| `banner.js` | PASS |
| `banner.css` | PASS |
| `banner.scss` | PASS |
| `README.md` | PASS — present; content is development status notes, not author-facing documentation |
| `_banner.json` | PASS |
| `ticket-details.md` | WARNING — file exists but is empty (1 line, no content) |

All required files exist. `ticket-details.md` is present but blank — a WARNING rather than a FAIL since the file exists and Structure requires only JS and CSS to PASS.

Result: **WARNING** (ticket-details.md is empty)

### Pattern A Compliance

#### 2a. Export Signature
- Named export: `export async function decorate(block, options = {})` — PASS (line 19)
- Default export: `export default (block) => decorate(block, window.Banner?.hooks)` — PASS (line 92)
- `options = {}` default param — PASS

#### 2b. Lifecycle Hooks and Events
- `const ctx = { block, options }` — PASS (line 20)
- `options.onBefore?.(ctx)` before block logic — PASS (line 23)
- `block.dispatchEvent(new CustomEvent('banner:before', { detail: ctx, bubbles: true }))` — PASS (line 24)
- `readVariant(block)` called — PASS (line 27)
- `options.onAfter?.(ctx)` after block logic — PASS (line 83, and also called in early-return path at line 33 — correct)
- `block.dispatchEvent(new CustomEvent('banner:after', { detail: ctx, bubbles: true }))` — PASS (line 84, and at line 34 in early-return path)

All lifecycle hooks and events correctly implemented with `bubbles: true`. The early-return path (dismissed banner) correctly fires both `onAfter` and the `:after` event before returning.

#### 2c. Imports
- `../../scripts/scripts.js`: imports `readVariant` — PASS (line 9)
- No other imports needed for this block — N/A

All import paths are correct.

#### 2d. No Site-Specific Code
No brand names, hard-coded property URLs, or site-specific values present. `sessionStorage` key is scoped to `window.location.pathname` — a runtime value, not a hard-coded constant. PASS.

Result: **PASS**

### CSS Token Audit

Audited `banner.scss` (verified against compiled `banner.css`). All color, spacing, and typography values use CSS custom properties.

Values inspected:
- `background-color: var(--color-primary)` — PASS
- `color: var(--text-light-1)` — PASS
- `padding: var(--spacing-008) var(--spacing-048) var(--spacing-008) var(--spacing-016)` — PASS
- `font-size: var(--body-font-size-xs)` — PASS
- `line-height: var(--line-height-normal)` — PASS
- `right: var(--spacing-016)` — PASS
- `padding: var(--spacing-004) var(--spacing-008)` — PASS
- `font-size: var(--heading-font-size-s)` — PASS
- `z-index: var(--banner-z-index)` — PASS (scoped token defined in `:root` referencing `var(--z-index-dropdown)`)
- `opacity: 0.8` — opacity is not in the flagged token categories per the audit spec — not a violation

**Total violations: 0 — PASS**

### Spec Alignment

`ticket-details.md` is empty — no ticket requirements to align against. Spec alignment is assessed against `README.md` and the UE JSON schema.

README documents the following known gaps:

| Use Case / Feature | Implemented? | Notes |
|---|---|---|
| Rotating announcement bar | PASS | Multi-slide rotation with 5-second interval |
| Dismiss with sessionStorage persistence | PASS | Keyed to `window.location.pathname` |
| WCAG 2.2.2 pause on hover/focus | PASS | `mouseenter`/`focusin` clear the interval; `mouseleave`/`focusout` restart it |
| prefers-reduced-motion | PASS | Auto-rotation disabled when `prefers-reduced-motion: reduce` matches |
| Close button with aria-label | PASS | `aria-label="Close banner"` present |
| Media image field per slide | WARNING | UE schema only exposes a single `text` richtext field; no image, alt text, or CTA fields |
| ctaLink / ctaLabel per slide | WARNING | Not in UE schema; README self-documents this as outstanding work |
| Shared dismiss key across pages | WARNING | Currently pathname-scoped; cross-page fragment scenario not addressed |
| Close button icon from icon system | WARNING | Renders plain `×` character; icon system replacement deferred |
| Multi-brand CSS override | WARNING | README notes no brand-specific override file exists yet |

The block is functional as a baseline announcement bar. However, the UE schema is deliberately minimal — the README explicitly defers image, CTA, and multi-brand work to a future sprint. The ticket spec being empty prevents full requirement verification.

Result: **WARNING** (UE schema significantly underpowered relative to README-documented intent; no ticket spec to validate against)

### Developer Checklist

#### General Block Requirements
| Item | Result |
|---|---|
| Directory convention (`blocks/banner/`) | PASS |
| JS and CSS files present | PASS |
| BEM CSS class naming | PASS — `.banner`, `.banner-slides`, `.banner-slide`, `.banner-slide-active`, `.banner-close` |
| README present | PASS |
| No site-specific code | PASS |
| Token usage in CSS | PASS — full token coverage, 0 violations |
| Root + Brand cascade support | PASS — `:root` block-scoped token defined |

#### Responsive Design
| Item | Result |
|---|---|
| Breakpoints defined | N/A — single-row banner bar, no layout breakpoints needed |
| Fluid content | PASS — no fixed widths |
| Column stacking | N/A |
| 1440px max-width | N/A — inherits from section container |

#### Authoring
| Item | Result |
|---|---|
| UE in-context editing | PASS — `_banner.json` schema present with item model |
| Clear field labels | WARNING — only `text` richtext field exposed; image, CTA, and other slide fields missing |
| Composable | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A — not required |

#### Performance
| Item | Result |
|---|---|
| Async scripts | N/A |
| Optimized images | N/A — no image support in current implementation |
| No unnecessary JS | PASS |
| Appropriate video embed | N/A |

#### Accessibility (WCAG 2.1)
| Item | Result |
|---|---|
| Keyboard navigation | PASS — close button is a native `<button>` element |
| Color contrast | WARNING — depends on `var(--color-primary)` and `var(--text-light-1)` token values; cannot verify in static audit |
| Semantic HTML | PASS — `<button>` for dismiss, `<div>` slide container appropriate |
| AT support | PASS — `aria-label="Close banner"` on close button |
| Alt text | N/A — no images in current implementation |
| Reduced motion | PASS — auto-rotation disabled for `prefers-reduced-motion` |
| WCAG 2.2.2 pause/stop/hide | PASS — hover and focus pause auto-rotation |

**Score: 13/19 applicable items passed** (6 N/A excluded, 2 WARNING items counted as partial passes in denominator)

## Remediation

### P1 — Should fix before production
1. **Populate `ticket-details.md`:** File exists but is empty. Add the ADO ticket requirements for the banner block so future audits and developers have a source of truth.
2. **Expand `_banner.json` UE model:** Add fields to the `banner-item` model per README-documented intent:
   - `mediaImage` (reference field) — slide background or foreground image
   - `mediaImageAlt` (text) — alt text for slide image
   - `contentText` (richtext) — headline and body text (rename existing `text` field)
   - `ctaLink` (aem-content) — CTA button URL
   - `ctaLabel` (text) — CTA button label

### P2 — Recommended
3. **Update README to be author-facing:** Current README is an internal dev status document. Rename it to developer-only notes and create a proper author-facing README describing block use cases, fields, and variants.
4. **Dismiss key strategy:** Evaluate a shared key approach (content hash or authored ID) for banners used as fragments across multiple pages.
5. **Close button icon:** Replace `×` character with project icon system token once icon resolver is implemented.
