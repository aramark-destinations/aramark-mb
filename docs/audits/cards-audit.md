# Block Audit Report: cards
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (3 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/23 items passed |

## Overall: NO-GO

## Details

### Structure

Files present:
- `cards.js` — present
- `cards.css` — present
- `cards.scss` — present (source)
- `README.md` — present
- `_cards.json` — present

Files missing:
- `ticket-details.md` — MISSING. No ADO ticket requirements file committed to the block directory.

Result: WARNING (missing ticket-details.md — required per project convention)

### Pattern A Compliance

**2a. Export signature**
- Named export `export function decorate(block, options = {})` — PASS
- Default export `export default (block) => decorate(block, window.Cards?.hooks)` — PASS
- `options = {}` default parameter present — PASS

**2b. Lifecycle hooks and events**
- `ctx = { block, options }` — PASS
- `options.onBefore?.(ctx)` before block logic — PASS
- `block.dispatchEvent(new CustomEvent('cards:before', { detail: ctx }))` — PASS (note: `bubbles: true` omitted — minor inconsistency vs. button/columns)
- `readVariant(block)` called — PASS
- `options.onAfter?.(ctx)` after block logic — PASS
- `block.dispatchEvent(new CustomEvent('cards:after', { detail: ctx }))` — PASS

**2c. Imports**
- `createOptimizedPicture` from `../../scripts/aem.js` — PASS
- `moveInstrumentation`, `readVariant` from `../../scripts/scripts.js` — PASS
- `pushAnalyticsEvent` from `../../scripts/analytics.js` — PASS (project-level analytics utility)

**2d. No site-specific code**
- No brand-specific logic, URLs, or property-specific values — PASS
- Analytics via `pushAnalyticsEvent` utility wrapper — PASS

Result: PASS

### CSS Token Audit

Scanned `cards.scss`.

**Line 12:** `border: 1px solid var(--color-grey-200);`
  Note: `1px` borders are listed as acceptable exceptions in the audit skill. The token `var(--color-grey-200)` is used for the color — PASS on this line.

**Line 26:** `box-shadow: 0 4px 8px rgb(0 0 0 / 15%);`
  Suggested: `box-shadow: var(--shadow-card)` or `var(--shadow-sm)` — hard-coded shadow value should use a shadow token

**Line 30:** `outline: 2px solid var(--color-primary);`
  The `2px` here is a structural focus indicator value. Borderline — focus ring widths are often kept explicit. However, if a `--focus-outline-width` token exists, it should be used.

**Line 57:** `margin: var(--spacing-016);`  — PASS (uses token)

The `rgb()` shadow on line 26 is the clearest token violation. The `--color-grey-200` token reference (vs. `--color-neutral-200` naming convention) should also be confirmed as consistent with the project's token naming.

Additionally:
**Line 6:** `grid-template-columns: repeat(auto-fill, minmax(257px, 1fr));`
  The `257px` hard-coded minimum column width should ideally be a token or CSS variable (e.g., `var(--card-min-width, 257px)`) to allow brand-level customization.

Result: WARNING (3 violations — hard-coded box-shadow, `257px` grid min-width, and `2px` focus outline width)

### Spec Alignment

No `ticket-details.md` exists. Spec alignment assessed against README, solution design, and `_cards.json` schema.

| Use Case | Implemented? | Notes |
|---|---|---|
| Manual card fields: eyebrow, title, description, image, up to 2 CTAs | PARTIAL | Image, title, description implemented via richtext; dedicated eyebrow field absent from schema; 2 CTA fields absent |
| Dynamic population from Content Fragments | NO | No CF integration code; block is manually authored only |
| Common CF card fields (eyebrow, shortDescription, button1Link, etc.) | NO | UE schema uses a single `text` richtext field, not the standard CF card field names |
| Card orientations (image-above, image-left, text-left, text-above) | YES | All 4 orientations implemented and supported in schema |
| Card-as-link (whole card clickable) | YES | Implemented via `wrapCardWithLink` |
| CSS class injection per card | YES | `css-class` field in schema and handled in JS |
| Analytics (click + impression tracking) | YES | IntersectionObserver impressions and click events via `pushAnalyticsEvent` |
| Responsive grid layout | YES | 1-col mobile, 2-col tablet, 3-col desktop |

Key gaps:
- **No dedicated eyebrow field** — the schema uses a single richtext `text` field for all body content. There is no separate `eyebrow` field per the solution design spec for card fields.
- **No CTA fields** — no `button1Link`/`button1Text` or `button2Link`/`button2Text` fields. CTAs must be authored inline in richtext.
- **No Content Fragment integration** — the solution design explicitly requires cards to be dynamically populatable from CFs with standard field names. This is entirely absent.
- **README is sparse** — it describes the block structure and hooks but does not document the configurable fields, orientation options, or analytics events in detail.

Result: WARNING (CF integration absent; eyebrow and CTA fields missing from UE schema; ticket-details.md absent)

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/cards/` convention
- [PASS] Has `cards.js` with `decorate(block)` export
- [PASS] Has `cards.css`
- [PASS] BEM-style CSS classes (`.cards-card-image`, `.cards-card-body`, `.cards-card-horizontal`, `.cards-card-inverted`)
- [WARNING] README present but sparse — does not document CF integration, full field list, or analytics
- [PASS] Part of shared global library
- [PASS] Brand differentiation via tokens only
- [WARNING] CSS token violations present (shadow, grid min-width)
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly across breakpoints (1/2/3 column grid)
- [PASS] Content fluidly expands within margins
- [PASS] Columns stack vertically at mobile widths
- [PASS] Respects 1440px max-width (`var(--layout-max-width-content)` applied at wide breakpoint)

**Authoring Contract**
- [PASS] Works with Universal Editor in-context editing (`data-aue-*` handled)
- [WARNING] Author-facing fields documented but incomplete — no eyebrow, no explicit CTA fields
- [PASS] Composable — not bound to specific templates
- [PASS] Structure/content/presentation decoupled
- [FAIL] Content Fragment integration not implemented

**Performance**
- [N/A] Third-party scripts
- [PASS] Images use `createOptimizedPicture` for optimized URLs
- [PASS] No unnecessary JavaScript
- [N/A] Video

**Accessibility (WCAG 2.1)**
- [PASS] Keyboard navigation (linked cards use `<a>` with `aria-label`)
- [PASS] Color contrast (relies on token cascade)
- [PASS] Semantic HTML (`<ul>`/`<li>`, linked cards as `<a>` with ARIA)
- [PASS] Works with assistive technologies
- [PASS] Alt text available via image `alt` attribute

Score: 17/23 applicable items passed.

## Remediation

**Priority 1 — Blocking (must fix before GO)**
1. Add Content Fragment integration — implement CF data reading and rendering. Map standard CF card fields (`eyebrow`, `title`, `shortDescription`, `images`, `button1Link`, `button1Text`, `button1Style`, `button1ThemeColor`, `button2Link`, `button2Text`, `button2Style`, `button2ThemeColor`) to card elements.
2. Create `ticket-details.md` with the ADO ticket requirements for this block.

**Priority 2 — Should fix**
3. Expand `_cards.json` UE schema to add dedicated fields: `eyebrow` (text), `button1Link`/`button1Text`/`button1Style`/`button1ThemeColor`, `button2Link`/`button2Text`/`button2Style`/`button2ThemeColor`.
4. Expand README to document: all configurable fields, CF integration approach, orientation options, and analytics events dispatched.

**Priority 3 — CSS cleanup**
5. Replace `box-shadow: 0 4px 8px rgb(0 0 0 / 15%)` with a shadow token (`var(--shadow-card)` or equivalent).
6. Extract `257px` grid minimum into a CSS custom property (`--card-min-width`) to enable brand-level overrides.
7. Add `bubbles: true` to `cards:before` and `cards:after` CustomEvent dispatches for consistency with the pattern used by button and columns blocks.
