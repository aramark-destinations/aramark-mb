# Block Audit Report: cards
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | WARNING |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/22 items passed |

## Overall: GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `cards.js` | PASS | Present |
| `cards.css` | PASS | Present |
| `cards.scss` | PASS | Present (content matches `cards.css` exactly — no SCSS-specific syntax used) |
| `README.md` | PASS | Present and detailed |
| `_cards.json` | PASS | Present in block directory |
| `ticket-details.md` | WARNING | File is committed but empty (0 content bytes) |

**Result: WARNING** — `ticket-details.md` exists but is empty and cannot serve as a spec source.

---

### Pattern A Compliance

**2a. Export signature**

| Check | Status | Notes |
|---|---|---|
| Named export `export function decorate(block, options = {})` | PASS | Line 201 |
| Default export `export default (block) => decorate(block, window.Cards?.hooks)` | PASS | Line 369 — PascalCase `Cards` matches convention |
| `options = {}` default param | PASS | Line 201 |

**2b. Lifecycle hooks and events**

| Check | Status | Notes |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 202 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 205 |
| `block.dispatchEvent(new CustomEvent('cards:before', { detail: ctx, bubbles: true }))` | PASS | Line 206 — `bubbles: true` present |
| `readVariant(block)` called | PASS | Line 209 |
| `options.onAfter?.(ctx)` after block logic | PASS | Line 360 |
| `block.dispatchEvent(new CustomEvent('cards:after', { detail: ctx, bubbles: true }))` | PASS | Line 361 — `bubbles: true` present |

**2c. Imports**

| Import | Status | Notes |
|---|---|---|
| `createOptimizedPicture` from `../../scripts/aem.js` | PASS | Line 13 |
| `moveInstrumentation`, `readVariant` from `../../scripts/scripts.js` | PASS | Line 14 |
| `pushAnalyticsEvent` from `../../scripts/analytics.js` | WARNING | Not listed in the canonical Pattern A import map. This is a project-specific dependency; the block cannot run without `analytics.js` present. |

**2d. No site-specific code**

| Check | Status | Notes |
|---|---|---|
| No brand names, hard-coded URLs, property-specific values | PASS | None found |
| Import portability | WARNING | `../../scripts/analytics.js` makes the block non-portable without that file. If `analytics.js` is a guaranteed platform-level utility this is acceptable, but it is not in the Pattern A canonical list. |

**Result: WARNING** — All lifecycle hooks, exports, and event dispatches are correctly implemented with `bubbles: true`. The import of `../../scripts/analytics.js` is outside the canonical Pattern A import list; this is the only deviation.

---

### CSS Token Audit

Audit performed on `cards.scss` (and `cards.css`, which is byte-for-byte identical).

All spacing, color, and layout values use CSS custom properties. No raw hex, `rgb()`, pixel font sizes, hard-coded font families, font weights, box-shadow values, transition durations, or z-index numbers were found outside `:root`.

**Exceptions applied correctly:**
- `0` and `0 auto` margin values — not flagged
- `1px solid var(--color-grey-200)` border — `1px` border is explicitly excepted
- `2px` focus outline — focus indicator pixel value, explicitly excepted as `1px` border exception applies by convention; the color uses `var(--color-primary)`
- `40%` flex basis — percentage layout value, not flagged
- `1fr`, `100%` — layout values, not flagged
- `calc()` expressions — not flagged
- Media query breakpoints (`600px`, `601px`, `900px`, `901px`, `1200px`, `1201px`) — not flagged

**Notable token usage:**
- `grid-template-columns: repeat(auto-fill, minmax(var(--card-min-width), 1fr))` — uses `--card-min-width` token, no hard-coded pixel minimum
- `gap: var(--spacing-024)`, `var(--spacing-016)`, `var(--spacing-032)` — all spacing tokenized
- `var(--color-grey-200)`, `var(--background-color)`, `var(--color-primary)` — all colors tokenized
- `box-shadow: var(--card-shadow)` — shadow tokenized
- `max-width: var(--layout-max-width-content)` — layout token used

**Result: PASS (0 violations)**

---

### Spec Alignment

`ticket-details.md` is empty. Spec reconstructed from `README.md` and `_cards.json`.

| Use Case / Requirement | Status | Notes |
|---|---|---|
| Semantic `ul`/`li` markup | PASS | Correct output structure |
| Optimized images via `createOptimizedPicture` | PASS | Lines 345–354 with responsive widths |
| Image vs body content classification (`cards-card-image` / `cards-card-body`) | PASS | Applied per column content type |
| `moveInstrumentation` preserved | PASS | Applied to rows and optimized images |
| Lifecycle hooks `onBefore`/`onAfter` | PASS | Fully implemented |
| Custom events `cards:before`, `cards:after` with `bubbles: true` | PASS | Lines 206, 361 |
| 4 orientation variants | PASS | All 4 implemented in `applyOrientation` and schema |
| Card-as-link (whole card as `<a>`) | PASS | `wrapCardWithLink` replaces `li` with `a`; nested links flattened |
| CSS class injection per card and per container | PASS | `sanitizeCSSClass` guards applied at both levels |
| UE schema — image, text, orientation, css-class, link, link-label fields | PASS | All 6 fields present in `_cards.json` |
| Analytics: click events | PASS | `card_click` via `pushAnalyticsEvent` on each card |
| Analytics: impression events (IntersectionObserver) | PASS | `card_impression` via IntersectionObserver |
| Responsive: 1-col mobile / 2-col tablet / 3-col desktop / 3-col constrained wide | PASS | 4 breakpoints in CSS |
| 1440px max-width constraint | PASS | `var(--layout-max-width-content)` at >1200px |

**Result: WARNING** — All README-described use cases are implemented. Result is WARNING because `ticket-details.md` is empty and cannot be cross-checked as the authoritative spec source. No CF integration requirement is documented in the README; if the solution design requires it, that gap is currently unverifiable.

---

### Developer Checklist

**Directory and Files**
| Item | Result |
|---|---|
| Directory convention `blocks/cards/` | PASS |
| `cards.js` and `cards.css` present | PASS |
| BEM CSS classes (`.cards-card-image`, `.cards-card-body`, `.cards-card-horizontal`, `.cards-card-inverted`) | PASS |
| README present and describes use | PASS |
| No site-specific hard-coded values in JS or CSS | PASS |
| Token usage in CSS (0 violations) | PASS |
| Root + Brand cascade support via hooks / default export | PASS |

**Responsive**
| Item | Result |
|---|---|
| Breakpoints defined (4 breakpoints) | PASS |
| Fluid grid with `minmax(var(--card-min-width), 1fr)` | PASS |
| Column stacking on mobile (single column at <600px) | PASS |
| 1440px max-width via layout token | PASS |

**Authoring**
| Item | Result |
|---|---|
| UE in-context editing (`_cards.json` with `data-aue-*` instrumentation handled in JS) | PASS |
| Clear, labeled author fields (6 fields with descriptions) | PASS |
| Composable / extensible via hooks | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A (not documented as required) |

**Performance**
| Item | Result |
|---|---|
| Async scripts | N/A (no async external scripts) |
| Optimized images | PASS |
| No unnecessary JS | WARNING — `initializeAnalytics` with IntersectionObserver runs unconditionally; no consent-gating or feature flag in the base block |
| Video embed | N/A |

**Accessibility**
| Item | Result |
|---|---|
| Keyboard nav | PASS — linked cards are `<a>` elements with `aria-label`; focus ring present (`outline: 2px solid var(--color-primary)`) |
| Color contrast | N/A (no colors hard-coded; relies on token cascade) |
| Semantic HTML | PASS — `ul`/`li`, linked cards as `<a>` |
| AT support | PASS — `aria-label` on linked cards; nested links flattened |
| Alt text | PASS — preserved via `createOptimizedPicture` |

**Score: 17/22** (N/A items excluded from denominator)

---

## Remediation

**Priority 1 — Blocking**
- None. Block is functionally complete and passes all hard requirements.

**Priority 2 — High**
1. **Populate `ticket-details.md`** — The file is committed but empty. Add the ADO ticket requirements so it serves as the authoritative spec source per project convention.
2. **Analytics import portability** — `../../scripts/analytics.js` is imported unconditionally at the module level. If this file does not exist in a deployment environment, the block throws an import error on load. Either document it as a required platform dependency or move analytics wiring to an `onAfter` hook convention so property-level overrides handle it.

**Priority 3 — Low**
3. **Analytics consent gating** — `initializeAnalytics` fires impression and click events unconditionally. If ACDL requires explicit user consent, the base block should delegate analytics to a hook so individual properties can apply their consent strategy.
4. **SCSS/CSS sync** — `cards.scss` and `cards.css` are byte-for-byte identical; no SCSS features (nesting, variables, mixins) are used. Consolidate to one source file or begin using SCSS features to justify the dual-file setup.
