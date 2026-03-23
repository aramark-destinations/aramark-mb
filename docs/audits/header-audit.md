# Block Audit Report: header
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | WARNING |
| CSS Token Usage | WARNING (3 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 14/20 items passed |

## Overall: GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `header.js` | PASS | Present |
| `header.css` | PASS | Present |
| `header.scss` | PASS | Present |
| `README.md` | PASS | Present, well-documented |
| `_header.json` | WARNING | Not found in block dir or `/models/` |
| `ticket-details.md` | WARNING | File committed but empty — zero content |

Required JS and CSS files are present. Two warnings: no UE model schema and an empty `ticket-details.md`.

### Pattern A Compliance

**2a. Export signature**
- Named export: `export async function decorate(block, options = {})` — PASS (line 188)
- Default export: `export default (block) => decorate(block, window.Header?.hooks)` — PASS (line 278)
- `options = {}` default param — PASS

**2b. Lifecycle hooks and events**
- `const ctx = { block, options }` — PASS (line 189)
- `options.onBefore?.(ctx)` before block logic — PASS (line 192)
- `block.dispatchEvent(new CustomEvent('header:before', { detail: ctx, bubbles: true }))` — PASS (line 193)
- `readVariant(block)` called — FAIL: not called; not imported from `../../scripts/scripts.js`
- `options.onAfter?.(ctx)` after block logic — PASS (line 269)
- `block.dispatchEvent(new CustomEvent('header:after', { detail: ctx, bubbles: true }))` — PASS (line 270)

**2c. Imports**
- `getMetadata` from `../../scripts/aem.js` — PASS (line 9)
- `fetchPlaceholders` from `../../scripts/placeholders.js` — PASS (line 10), correct utility path
- `loadFragment` from `../fragment/fragment.js` — PASS (line 11), correct block-to-block path
- `readVariant` from `../../scripts/scripts.js` — MISSING; consistent with the missing call

**2d. No site-specific code**
- No brand names or property-specific values — PASS
- Nav path defaults to `/nav`, overridable via `getMetadata('nav')` — PASS
- Breadcrumb home label uses `fetchPlaceholders()` for i18n — PASS

**Overall Pattern A: WARNING** — `readVariant` is neither imported nor called. All other lifecycle requirements met.

### CSS Token Audit

Audited `header.scss` (323 lines). Violations are pixel values used for the hamburger icon drawing and a fixed-width dropdown.

**Violations found:**

| Line | Selector | Property | Value | Suggested Fix |
|---|---|---|---|---|
| 60 | `.nav-hamburger` | `height` | `22px` | `var(--sizing-022)` or `var(--nav-hamburger-height)` |
| 104 | `.nav-hamburger-icon` (expanded) | `height` | `22px` | same token as above |
| 116 | `::before`/`::after` (expanded icon) | `top` | `3px` | `var(--spacing-002)` (nearest) or dedicated icon token |
| 117 | `::before`/`::after` (expanded icon) | `left` | `1px` | structural 1px, arguable exempt; flag as advisory |
| 125 | `::after` (expanded icon) | `bottom` | `3px` | same as `top: 3px` above |
| 241 | dropdown `> ul` | `width` | `200px` | `var(--nav-dropdown-width)` or layout token |

Grouping by unique hard-coded values: `22px` (hamburger height, used twice), `3px` (icon offset, used twice), `200px` (dropdown width). That is **3 unique violations**.

**Not flagged (acceptable):**
- `height: 22px` in `.nav-hamburger button` (line 59) — same structural icon height; counted in the `22px` group above
- `top: unset`, `bottom: unset` — `unset` is an exempt keyword
- `transform-origin: var(--spacing-002) 1px` (line 119) — the `1px` is a sub-pixel transform anchor, exempt per "1px borders" rule
- `border-radius: 0 1px 0 0` (line 211) — 1px border value, exempt
- `top: 150%` on dropdown position — percentage, exempt
- `padding: 0.5em` on `.nav-tools .button` (line 274) — relative em unit, no token equivalent for icon button padding; advisory only, not a formal violation
- `width: 0`, `height: 0` on dropdown arrow triangle — zero values, exempt
- All `var(--*)` usages — compliant
- Media query breakpoints `900px` — exempt

**Result: WARNING (3 violations)**

### Spec Alignment

`ticket-details.md` is committed but contains no content. Alignment evaluated against `README.md` only.

| Use Case (from README) | Implemented | Notes |
|---|---|---|
| Responsive navigation — desktop horizontal layout | PASS | `flexbox` layout at ≥900px |
| Responsive navigation — mobile hamburger menu | PASS | `toggleMenu()` with `aria-expanded` state |
| Dropdown navigation for nested menu items | PASS | `.nav-drop` class + `aria-expanded` toggling |
| Breadcrumbs support (via metadata) | PASS | `buildBreadcrumbs()` called when `breadcrumbs` metadata = `"true"` |
| Fragment-based nav loading from `/nav` | PASS | `loadFragment(navPath)` called |
| Custom nav path via metadata | PASS | `getMetadata('nav')` used |
| Keyboard navigation and ARIA attributes | PASS | `closeOnEscape`, `openOnKeydown`, `focusNavSection`, `tabindex` |
| Lifecycle hooks `onBefore`/`onAfter` | PASS | Both hooks implemented |
| Events `header:before`/`header:after` | PASS | Dispatched with `bubbles: true` |
| Two scroll states (active / scrolled threshold) | FAIL | Not implemented — no scroll listener or scroll-state CSS class |
| Booking trigger in second scroll state | FAIL | Depends on missing scroll state; not implemented |
| True mega menu panels (full-width, multi-column) | PARTIAL | Standard nested `<ul>` dropdowns only; no mega panel markup |

**Notable gaps:**

- **Two scroll states** are entirely absent from the base block. The spec documents that the header should have an active state on page load and a second state triggered after scrolling past a threshold (which can reveal a booking button). No `scroll` event listener, `IntersectionObserver`, or scroll-state CSS class is present.
- **Booking trigger** depends on the missing scroll state; it is not implemented.
- **Mega menu** — the current implementation renders simple `<ul>` dropdowns. Full-width multi-column mega menu panels would require additional markup and CSS, expected as a brand-override enhancement.

**Spec Alignment: WARNING** — ADO requirements unknown (empty ticket-details.md). Scroll state feature is missing and should be clarified whether it is a base-block or brand-override responsibility.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory convention (`blocks/header/`)
- [PASS] `header.js` with `decorate(block, options = {})` export
- [PASS] `header.css` present
- [PASS] BEM-style CSS — `.nav-brand`, `.nav-sections`, `.nav-tools`, `.nav-hamburger`, `.nav-drop`, `.nav-wrapper`, `.breadcrumbs`
- [PASS] README present and documents use cases, structure, and metadata
- [PASS] No site-specific code
- [WARNING] 3 CSS token violations (hamburger height, icon pixel offsets, dropdown width)

**Responsive**
- [PASS] Mobile grid layout with hamburger; desktop flex layout at 900px
- [PASS] `max-width` constrained via `var(--layout-max-width-header-mobile)` and `var(--layout-max-width-header-desktop)`
- [PASS] Nav sections hidden on mobile, visible on desktop
- [PASS] `matchMedia` listener updates layout on viewport resize

**Authoring**
- [FAIL] No UE schema (`_header.json` not found) — in-context editing not configured
- [PASS] Composable — nav content loaded from `/nav` fragment
- [PASS] Structure/content/presentation decoupled
- [N/A] CF integration — not applicable

**Performance**
- [PASS] `async` decorate function
- [PASS] Fragment loading is async/await
- [PASS] `matchMedia` listener is efficient (no scroll polling)
- [WARNING] Scroll state implementation will need to use `IntersectionObserver` (not `scroll` event) for performance when implemented

**Accessibility**
- [PASS] `<nav id="nav">` semantic element
- [PASS] Hamburger `<button>` with `aria-label="Open navigation"` / `"Close navigation"`
- [PASS] `aria-expanded` state on `<nav>` and nav drop items
- [PASS] Escape key closes open menus (`closeOnEscape`)
- [PASS] Focus lost closes menus (`closeOnFocusLost`)
- [PASS] Keyboard open/close for desktop dropdowns (`openOnKeydown`)
- [PASS] `tabindex` management for keyboard dropdown navigation
- [PASS] `aria-current="page"` on breadcrumb current item
- [FAIL] `readVariant(block)` not called — variant-based accessibility classes (e.g., high-contrast mode) would not be applied

## Remediation

1. **(HIGH)** Add `readVariant(block)` call after `const ctx = { block, options }` and import `readVariant` from `../../scripts/scripts.js`. Required by Pattern A.
2. **(HIGH)** Create `_header.json` UE model schema to enable Universal Editor in-context editing of the nav content reference.
3. **(MEDIUM)** Implement two scroll states: add an `IntersectionObserver` (not a `scroll` event) to apply a scroll-state modifier class (e.g., `header--scrolled`) to the `.nav-wrapper` after the user scrolls past the first section. Clarify with the team whether this is a base-block requirement or a brand-override concern.
4. **(MEDIUM)** Replace hard-coded pixel values with tokens:
   - `22px` hamburger height → `var(--sizing-022)` or `var(--nav-hamburger-height)` (lines 60, 104)
   - `3px` expanded icon offsets → `var(--spacing-002)` or nearest available token (lines 116, 125)
   - `200px` dropdown width → `var(--nav-dropdown-width)` CSS custom property (line 241)
5. **(LOW)** Populate `ticket-details.md` with the actual ADO ticket requirements.
6. **(LOW)** Document the mega menu gap in the README: the base block supports simple dropdowns; full mega panel behavior requires a brand-level override with additional markup.
7. **(LOW)** Document booking trigger integration point in the README: the second scroll state is expected to surface a booking CTA; brand overrides should know where to hook into this.
