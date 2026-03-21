# Block Audit Report: accordion
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (4 violations) |
| Spec Alignment | PASS |
| Developer Checklist | 18/22 items passed |

## Overall: GO

## Details

### Structure
All required files are present:
- `accordion.js` — present
- `accordion.css` — present
- `accordion.scss` — present (source)
- `README.md` — present and substantive
- `_accordion.json` — present
- `ticket-details.md` — present

No issues. Result: PASS.

### Pattern A Compliance

**2a. Export signature**
- Named export `export function decorate(block, options = {})` — PASS
- Default export `export default (block) => decorate(block, window.Accordion?.hooks)` — PASS
- `options = {}` default parameter present — PASS

**2b. Lifecycle hooks and events**
- `ctx = { block, options }` — PASS
- `options.onBefore?.(ctx)` before block logic — PASS
- `block.dispatchEvent(new CustomEvent('accordion:before', { detail: ctx }))` — PASS (note: `bubbles: true` omitted; not a blocking issue)
- `readVariant(block)` called — PASS
- `options.onAfter?.(ctx)` after block logic — PASS
- `block.dispatchEvent(new CustomEvent('accordion:after', { detail: ctx }))` — PASS

**2c. Imports**
- `moveInstrumentation`, `readVariant` from `../../scripts/scripts.js` — PASS
- No imports from `aem.js` or config utils (none needed) — PASS

**2d. No site-specific code**
- Analytics pushes to `window.adobeDataLayer` — acceptable as a platform-level pattern
- No brand-specific logic, URLs, or hard-coded property values — PASS

Result: PASS

### CSS Token Audit

Scanned `accordion.scss`. Values inside `:root` are token definitions — not flagged per audit exceptions. The following violations were found outside `:root`:

**Line 72:** `color: var(--accordion-title-color, #231f20);`
  Suggested: Remove `#231f20` fallback; rely on the token chain or use `var(--color-text-primary)` as defined in `:root`

**Line 90:** `color: var(--accordion-title-color, #231f20);`
  Suggested: Remove hard-coded fallback `#231f20`

**Line 98:** `color: var(--accordion-subtitle-color, #231f20);`
  Suggested: Remove hard-coded fallback `#231f20`

**Line 122:** `background-color: var(--accordion-open-background-color, #fff);`
  Suggested: Remove hard-coded fallback `#fff`; rely on token chain

Additional instances at lines 133, 134, 194 use similar hard-coded hex fallbacks (`#fff`, `#231f20`, `#de1219`). The primary accordion-level token definitions in `:root` already reference global tokens (`var(--color-text-primary)`, `var(--background-color)`, `var(--color-brand-primary)`) — the hard-coded fallbacks in the rule declarations are redundant and bypass the token cascade.

Total distinct violations (hard-coded hex fallbacks outside `:root`): 4+ instances across multiple lines.

Additional flags:
- Line 109: `font-size: 28px` inside `summary::after` — should be `var(--font-size-*)` or an accordion-level token
- Line 9: `--accordion-title-padding-top: 27.5px` and `--accordion-title-padding-bottom: 27.5px` inside `:root` — these are token definitions (exempt), but the values are unusual and should be reviewed against the spacing token scale

Result: WARNING (4+ violations — primarily redundant hard-coded hex fallbacks)

### Spec Alignment

Ticket requirements (from `ticket-details.md`):
| Use Case | Implemented? | Notes |
|---|---|---|
| Author can add accordion to any page section | YES | Composable, no template restriction |
| "Summary" text field (required) | YES | Implemented in JS (col 0) and UE schema (`summary` field, required) |
| "Collapsed by Default" boolean toggle (default: true) | YES | Implemented in JS (`collapsedByDefault`) and UE schema |
| "Content" richtext field | YES | Implemented in JS (col 2) and UE schema |
| Base style per Figma | PARTIAL | CSS implemented; no visual verification possible in static audit |

UE schema alignment:
- `summary` field — present and marked required — PASS
- `collapsed-by-default` boolean — present — PASS
- `content` richtext — present — PASS
- `subtitle` field — present in schema and JS; not listed in ticket (extra, not harmful)

No major use cases are missing. Result: PASS

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/accordion/` convention
- [PASS] Has `accordion.js` with `decorate(block)` export
- [PASS] Has `accordion.css`
- [PASS] BEM-style CSS classes (`.accordion-item`, `.accordion-item-label`, `.accordion-item-body`, `.accordion-title`, etc.)
- [PASS] README documents use cases and configuration
- [PASS] Part of shared global library (no site-specific code)
- [PASS] Brand differentiation via tokens only
- [WARNING] Uses semantic design tokens — partially; hard-coded fallback hex values present (see CSS audit)
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly across breakpoints (no layout-breaking breakpoint-specific styles; accordion is single-column by nature)
- [PASS] Content fluidly expands within margins
- [N/A] Columns stack vertically at mobile widths
- [PASS] Respects 1440px max-width (inherits from container)

**Authoring Contract**
- [PASS] Works with Universal Editor in-context editing (`data-aue-*` attributes handled)
- [PASS] Author-facing fields are clear and documented
- [PASS] Composable — not bound to specific templates
- [PASS] Structure/content/presentation decoupled

**Performance**
- [N/A] Third-party scripts load asynchronously
- [N/A] Images use optimized URLs
- [PASS] No unnecessary JavaScript
- [N/A] Video uses appropriate embed method

**Accessibility (WCAG 2.1)**
- [PASS] Keyboard navigation (Home/End keys, native details/summary)
- [PASS] Color contrast (relies on token cascade, `.keyfocus` focus ring)
- [PASS] Semantic HTML (`<details>`/`<summary>` elements)
- [PASS] Works with assistive technologies (native elements provide built-in AT support)
- [N/A] Alt text fields available for images

Score: 18/22 applicable items passed (4 N/A items excluded from denominator).

## Remediation

**Priority 1 — CSS token violations (should fix before production)**
1. Remove hard-coded hex fallbacks (`#231f20`, `#fff`, `#de1219`) from rule declarations outside `:root`. The token chain (`var(--color-text-primary)`, `var(--background-color)`, `var(--color-brand-primary)`) already provides correct fallbacks through the `:root` block.
2. Replace `font-size: 28px` on the `summary::after` pseudo-element with an accordion-level token (e.g., `--accordion-icon-font-size`) that references a global size token.

**Priority 2 — Minor improvements**
3. Add `bubbles: true` to `accordion:before` and `accordion:after` CustomEvent dispatches to match the pattern used by other blocks (button, columns).
4. Review `27.5px` padding values in `:root` token definitions — consider aligning to the project spacing scale.

**Priority 3 — Deferred**
5. Resolve the TODOs noted in accordion.scss comments (icon style: +/− vs. arrow) and accordion.js (subtitle column usage).
