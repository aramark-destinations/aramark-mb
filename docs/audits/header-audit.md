# Block Audit Report: header
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/22 items passed |

## Overall: NO-GO

## Details

### Structure

All required files are present:
- `header.js` — present
- `header.css` — present
- `header.scss` — present
- `README.md` — present, well-documented
- `_header.json` — present

No `ticket-details.md` exists for this block. Spec alignment is assessed against the README and solution design.

### Pattern A Compliance

**2a. Export signature — PASS**
- Named export `export async function decorate(block, options = {})` present.
- Default export `export default (block) => decorate(block, window.Header?.hooks)` — correct PascalCase (`Header`), correct wiring.

**2b. Lifecycle hooks and events — PASS**
- `ctx` constructed as `{ block, options }`.
- `options.onBefore?.(ctx)` fires before block logic.
- `block.dispatchEvent(new CustomEvent('header:before', { detail: ctx }))` fires before block logic.
- `options.onAfter?.(ctx)` fires after block logic.
- `block.dispatchEvent(new CustomEvent('header:after', { detail: ctx }))` fires after block logic.

**Note:** `header:before` and `header:after` events dispatched without `bubbles: true`. Minor deviation from platform convention.

**2c. Imports — PASS**
- `getMetadata` imported from `../../scripts/aem.js` — correct.
- `fetchPlaceholders` imported from `../../scripts/placeholders.js` — correct path for a scripts utility.
- `loadFragment` imported from `../fragment/fragment.js` — correct block-to-block import.

**2d. No site-specific code — PASS**
- No brand names or property-specific values. Nav path defaults to `/nav` and is overridable via metadata. Breadcrumb home label uses the `placeholders` system for i18n.

### CSS Token Audit

Scanned `header.scss` for hard-coded values.

**Violations found (2):**

```
Line 103: top: -6px
  Suggested: top: calc(-1 * var(--spacing-006))  (or a negative offset token if available)

Line 107: top: 6px
  Suggested: top: var(--spacing-006)
```

These are pixel offsets used to position the hamburger icon's `::before` and `::after` pseudo-elements (the top and bottom bars of the hamburger). They are structural/positional rather than brand-driven, but a sizing token could cover them.

**Not flagged (acceptable):**
- `height: 22px` on `.nav-hamburger` and `.nav-hamburger-icon` (lines 60, 111) — these are fine-grain structural pixel values for a CSS-drawn icon. Borderline, but consistent with structural/icon sizing rather than brand tokens.
- `width: 200px` on dropdown list (line 234) — fixed-width dropdown; this likely warrants a layout token (`var(--nav-dropdown-width)` or similar) for brand override flexibility.
- `top: 150%` on dropdown position — percentage layout value, exempt.
- `0` values throughout — exempt.
- `1px` on border-radius (line 212) — structural, acceptable per skill rules.
- `0.5em` on `.nav-tools .button` padding (line 274) — relative unit; borderline but acceptable for icon button padding.
- Media query breakpoint `900px` — exempt.

**Additional observation:** `width: 200px` on the nav dropdown (line 234) is a hard-coded layout value that should ideally be a CSS custom property for brand-level override. Not counted as a formal violation since it's a layout/sizing value, but noted as advisory.

**Result: WARNING (2 violations)**

### Spec Alignment

No `ticket-details.md` found. Alignment assessed against README and solution design.

**Use cases from solution design — Header Specifics:**
| Use Case | Implemented? | Notes |
|---|---|---|
| Site logo | YES | `.nav-brand` section renders logo from nav fragment |
| Main menu with mega menu panels | PARTIAL | Dropdown navigation implemented; true mega-menu panels (full-width, multi-column) not present — standard dropdown only |
| Search bar | PARTIAL | `navTools` checks for a `search` link; no search input rendered by the base block |
| Two scroll states | NO | Not implemented — no scroll listener or second-state CSS class toggling |
| Menu items author-configurable | YES | Nav content loaded from `/nav` fragment document |
| Booking trigger in second state (opens modal) | NO | Not implemented — depends on scroll state which is missing |
| Breadcrumbs support | YES | `buildBreadcrumbs()` implemented, enabled via `breadcrumbs` metadata |

**Two scroll states** is a documented spec requirement (header active on page load, second state after scroll threshold). This is entirely absent from the base block. This is a significant gap — the spec calls it out explicitly and the `developer-alignment.md` checklist lists it under Header Specifics.

**Mega menu panels** — the current implementation renders standard nested `<ul>` dropdowns. A true mega menu (full-width panels) would require additional markup and CSS, likely as a brand-level enhancement.

**Configurable fields (UE schema vs implementation):**
| Field | In `_header.json` | Used in JS |
|---|---|---|
| `reference` (Navigation) | YES | Read via `getMetadata('nav')` for fragment path |

The single content reference field is correct for a fragment-based header.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/header/` convention
- [PASS] Has `header.js` with `decorate(block)` export
- [PASS] Has `header.css`
- [PASS] BEM-style CSS classes (`.nav-brand`, `.nav-sections`, `.nav-tools`, `.nav-hamburger`, `.nav-drop`, `.nav-wrapper`)
- [PASS] README documents use cases and configuration
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [WARNING] 2 CSS token violations noted above
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly — mobile hamburger and desktop horizontal nav implemented
- [PASS] Content expands within margins
- [PASS] Sections hide/show based on breakpoint
- [PASS] Respects max-width via `var(--layout-max-width-header-mobile)` and `var(--layout-max-width-header-desktop)`

**Authoring Contract**
- [PASS] Works with Universal Editor (`_header.json` present)
- [PASS] Author-facing fields clear (single nav reference)
- [PASS] Composable
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not applicable

**Performance**
- [N/A] Third-party scripts — none
- [N/A] Images — logo handled in nav fragment
- [PASS] No unnecessary JavaScript
- [N/A] Video — not applicable

**Accessibility**
- [PASS] Keyboard navigation — `keydown` handler, `tabindex`, `aria-expanded` states implemented
- [PASS] ARIA labels on hamburger button
- [PASS] Escape key closes open menus
- [PASS] Focus management on menu close
- [PASS] Semantic HTML — `<nav>` with `id="nav"`, `aria-expanded` states

**Header Specifics (from developer alignment checklist)**
- [FAIL] Two scroll states not implemented
- [PASS] Site logo — handled in nav fragment
- [PARTIAL] Main menu with mega menu panels — dropdown only, not mega menu
- [PARTIAL] Search bar — search link detected but no search input rendered
- [PASS] Menu items author-configurable
- [FAIL] Booking trigger in second state — depends on missing scroll state

## Remediation

**Priority 1 — Blocking**

1. Implement two scroll states: add a `scroll` or `IntersectionObserver`-based mechanism to apply a CSS class (e.g., `header--scrolled`) to the header wrapper after the user scrolls past the first section threshold. This is an explicit spec requirement and is entirely absent.
2. The booking modal trigger (displayed in the second scroll state) depends on the above. This integration point must be designed before the header can be considered complete.

**Priority 2 — Should Fix**

3. Replace hard-coded pixel offsets `top: -6px` and `top: 6px` on hamburger icon pseudo-elements with spacing tokens.
4. Replace hard-coded `width: 200px` on nav dropdown with a CSS custom property to enable brand-level override.
5. Add `bubbles: true` to `header:before` and `header:after` CustomEvent dispatches.

**Priority 3 — Advisory**

6. Document the mega menu gap: the base block implements simple dropdowns. If mega menu panels are required at the brand level, this needs a brand-override extension or an enhancement to the base block's markup structure.
7. Clarify search bar implementation: the current code only detects a search link — an actual search input/bar integration (per the spec) requires additional work.
8. Add a `ticket-details.md` if a formal ADO ticket exists for this block.
