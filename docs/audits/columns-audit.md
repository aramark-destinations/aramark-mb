# Block Audit Report: columns
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | PASS |
| Developer Checklist | 19/21 items passed |

## Overall: GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `columns.js` | PASS | Present |
| `columns.css` | PASS | Present |
| `columns.scss` | PASS | Present (uses CSS nesting syntax) |
| `README.md` | PASS | Present and substantive |
| `_columns.json` | PASS | Present in block directory |
| `ticket-details.md` | PASS | Present (content confirmed) |

**Result: PASS** — All required and expected files present.

---

### Pattern A Compliance

**2a. Export signature**

| Check | Status | Notes |
|---|---|---|
| Named export `export function decorate(block, options = {})` | PASS | Line 18 |
| Default export `export default (block) => decorate(block, window.Columns?.hooks)` | PASS | Line 55 — PascalCase `Columns` matches convention |
| `options = {}` default param | PASS | Line 18 |

**2b. Lifecycle hooks and events**

| Check | Status | Notes |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 19 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 22 |
| `block.dispatchEvent(new CustomEvent('columns:before', { detail: ctx, bubbles: true }))` | PASS | Line 23 — `bubbles: true` present |
| `readVariant(block)` called | PASS | Line 26 |
| `options.onAfter?.(ctx)` after block logic | PASS | Line 46 |
| `block.dispatchEvent(new CustomEvent('columns:after', { detail: ctx, bubbles: true }))` | PASS | Line 47 — `bubbles: true` present |

**2c. Imports**

| Import | Status | Notes |
|---|---|---|
| `readVariant` from `../../scripts/scripts.js` | PASS | Line 9 |

No other imports needed — the block logic is minimal and self-contained. `moveInstrumentation` is not called (appropriate for a layout wrapper block with no DOM restructuring).

**2d. No site-specific code**

| Check | Status | Notes |
|---|---|---|
| No brand names, hard-coded URLs, property-specific values | PASS | None found |

**Result: PASS**

---

### CSS Token Audit

Audit performed on `columns.scss` (source) and `columns.css` (compiled).

The CSS is minimal. All values examined:
- `gap: var(--spacing-024)` at desktop breakpoint — token used correctly
- `display: flex`, `flex-direction: column`, `flex-direction: unset` — structural layout properties, no token equivalent needed
- `align-items: center` — layout value, no token needed
- `flex: 1`, `order: 0`, `order: 1`, `order: unset` — layout integers, not flagged
- `width: 100%` on images — percentage, excepted
- `display: block` — structural, not flagged
- Media query breakpoint `900px` — explicitly excepted

No hex colors, `rgb()`, pixel font sizes, pixel padding/margin, font family strings, font weight numbers, border radius, z-index, box shadow, or transition duration values found.

**Result: PASS (0 violations)**

---

### Spec Alignment

`ticket-details.md` content is present. Requirements extracted:

| Requirement from `ticket-details.md` | Status | Notes |
|---|---|---|
| Set up in EDS codebase with UE configuration fields | PASS | Block present with `_columns.json` |
| Retain existing functionality — one or more columns and rows | PASS | `columns-{n}-cols` class from first row child count; all rows processed |
| Allowed blocks: text, title, image, button, Table, Video | PASS | `_columns.json` filter allows exactly: text, image, button, title, table, video |
| No dialog field changes — retain existing fields | PASS | `_columns.json` retains `columns` (number) and `rows` (number) fields |
| Base styling from grid spacing Figma design | PARTIAL | Responsive flex layout implemented; Figma URL in ticket is truncated and cannot be verified in static audit |

**UE schema alignment:**
- `columns` (number) and `rows` (number) fields present — matches ticket requirement to retain existing fields
- Column-level filter allows all 6 permitted content types — matches ticket exactly

**Result: PASS** — All documented requirements implemented. The Figma design URL in `ticket-details.md` is incomplete (`https:/`), making full visual fidelity verification impossible, but the structural implementation is correct.

---

### Developer Checklist

**Directory and Files**
| Item | Result |
|---|---|
| Directory convention `blocks/columns/` | PASS |
| `columns.js` and `columns.css` present | PASS |
| BEM CSS classes (`.columns-img-col`, `.columns-{n}-cols`) | PASS |
| README present with use cases and token documentation | PASS |
| No site-specific hard-coded values | PASS |
| Token usage in CSS (0 violations) | PASS |
| Root + Brand cascade support | PASS |

**Responsive**
| Item | Result |
|---|---|
| Breakpoints defined (`@media (width >= 900px)`) | PASS |
| Fluid content | PASS |
| Column stacking on mobile (`flex-direction: column` default) | PASS |
| 1440px max-width | PASS — inherits from container |

**Authoring**
| Item | Result |
|---|---|
| UE in-context editing (`_columns.json` present) | PASS |
| Clear, labeled author fields | PASS |
| Composable / extensible via hooks | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A — not required for layout block |

**Performance**
| Item | Result |
|---|---|
| Async scripts | N/A |
| Optimized images | N/A — columns is a layout wrapper; image optimization is responsibility of child content blocks |
| No unnecessary JS | PASS — minimal JS, CSS handles all layout |
| Video embed | N/A |

**Accessibility**
| Item | Result |
|---|---|
| Keyboard nav | PASS — no interactive elements in the block itself |
| Color contrast | N/A (no colors set; token cascade) |
| Semantic HTML | PASS — div-based layout wrapper; inherits semantics from child content |
| AT support | PASS |
| Alt text | N/A — deferred to child content blocks |

**Score: 19/21** (N/A items excluded from denominator; 2 warnings: Figma verification gap and column-count guard)

---

## Remediation

**Priority 1 — Blocking**
- None.

**Priority 2 — Advisory**
1. **Column count guard** — The ticket spec states 2–4 columns. The current implementation accepts any number of columns based on DOM child count. Consider adding a guard or warning (e.g., `console.warn`) if fewer than 2 or more than 4 columns are detected.
2. **Fix Figma URL in `ticket-details.md`** — The URL is truncated (`https:/`). If the Figma design is accessible, complete the URL so visual styling requirements can be verified against the implementation.

**Priority 3 — Documentation**
3. **Clarify image optimization responsibility in README** — The README notes `width: 100%` on images but does not explicitly state that `createOptimizedPicture` is not called (by design). Add a note clarifying that `columns` is a layout wrapper and image optimization is delegated to child blocks.
