# Block Audit Report: navigation
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | FAIL |
| CSS Token Usage | FAIL (5 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/23 items passed |

## Overall: NO-GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `navigation.js` | PASS | Present |
| `navigation.css` | PASS | Present |
| `navigation.scss` | PASS | Present |
| `README.md` | PASS | Present and thoroughly documented |
| `_navigation.json` | PASS | Present in `blocks/navigation/_navigation.json` |
| `ticket-details.md` | WARNING | Not present |

Additional files present: `navigation-ue.scss`, `navigation-ue.css` — supplemental UE authoring styles, acceptable.

All required files are present. `ticket-details.md` is missing; README is comprehensive and is used as the reference for spec alignment.

---

### Pattern A Compliance

The navigation block is an **auto-block** explicitly designed to bypass the standard block decoration pipeline. The README documents this architecture:

> "The Navigation block renders a multi-level flyout navigation menu from an authored AEM fragment. It works primarily as an auto-block: the `autoBlockNavigationFragment()` function wraps a section's content into a navigation block automatically during page decoration."

#### 2a. Export signature — FAIL (by design)

- No `export function decorate(block, options = {})` — FAIL
- No `export default (block) => decorate(block, window.Navigation?.hooks)` — FAIL

The block exports `autoBlockNavigationFragment()`, `resetMenuState()`, `closeAllSections()`, and `updateSubMenuHeight()` as its public API. This is an intentional architectural deviation from Pattern A.

#### 2b. Lifecycle hooks and events — FAIL (N/A by design)

No `before`/`after` Pattern A lifecycle hooks are dispatched. The block does dispatch behavioral events (`update:live:region`, `close:navigation:section`) and pushes analytics events to `window.adobeDataLayer` — these are operational events, not Pattern A lifecycle events.

#### 2c. Imports

| Import | Path | Result |
|---|---|---|
| `loadCSS`, `toCamelCase`, `toClassName`, `readBlockConfig` | `../../scripts/aem.js` | PASS |
| `fetchSvg` | `../../scripts/baici/utils/utils.js` | PASS |
| `moveInstrumentation` | `../../scripts/scripts.js` | PASS |

Note: `toClassName` is imported from `../../scripts/aem.js` and used at line 284 (`toClassName(className.trim())`). Import is correct.

#### 2d. No site-specific code

PASS — no brand-specific logic present. `window.adobeDataLayer` usage is platform-standard Adobe analytics integration.

---

### CSS Token Audit

The `:root`/`.dropin-design` block (lines 2–40) is entirely exempt — all pixel values, hex colors, and raw numbers there are token *definitions*, not violations.

Outside `:root`, the following violations were found in `navigation.scss`:

| Line | Hard-coded value | Context | Suggested fix |
|---|---|---|---|
| 65 | `letter-spacing: var(--nav-dropdown-letter-spacing, 1px)` | Live rule fallback — `1px` is the hardcoded fallback exposed when the token is undefined | Define `--nav-dropdown-letter-spacing` in `:root` so the fallback is never reached; or use `var(--letter-spacing-tight, 1px)` |
| 69 | `z-index: 1` | `.navigation-section-button` — raw z-index number outside `:root` | `var(--z-index-raised, 1)` |
| 112 | `z-index: 0` | `.navigation-overlay` — raw z-index number outside `:root` | `var(--z-index-base, 0)` |
| 126 | `gap: var(--nav-section-gap-desktop, 22px)` | Media query live rule fallback — `22px` hardcoded when token is undefined | Ensure `--nav-section-gap-desktop` is defined in `:root` (it is in `:root` at line 6, so this fallback is redundant and safe to remove) |
| 131 | `z-index: 1` | `.navigation-section` in media query — raw z-index | `var(--z-index-raised, 1)` |

**Count of violations outside `:root`: 5**

Note: Line 161 `padding: var(--nav-dropdown-padding-desktop, 11px 22px)` — the fallback `11px 22px` is a hardcoded spacing value but the token `--nav-dropdown-padding-desktop` is defined in `:root` at line 21, so the fallback will never be reached in practice. Advisory only, not counted as a violation.

**Result: FAIL (5 violations — threshold is 4+)**

---

### Spec Alignment

`ticket-details.md` is absent. Alignment assessed from README and `_navigation.json`.

#### Use cases from README

| Use Case | Implemented | Notes |
|---|---|---|
| Multi-level flyout navigation (section > group > item) | PASS | Full hierarchy implemented in JS and schema |
| Author-configurable section titles and links | PASS | `title`, `link`, `custom-classes` fields in schema |
| Mega menu panels with grouped items | PASS | Section submenu with group columns; CSS grid layout |
| Auto-block fragment wrapping | PASS | `autoBlockNavigationFragment()` handles wrapping |
| Universal Editor in-context editing | PASS | UE detection, `navigation-ue.css` loading, `data-aue-*` handling |
| Keyboard navigation (Escape, focus management) | PASS | `closeOnEscape`, focus returned to trigger on close |
| Section open/close animations | PASS | CSS transition on `max-height`/`min-height` |
| Analytics data layer integration | PASS | `window.adobeDataLayer` push on section link click |
| Screen reader announcements | PASS | `update:live:region` custom event dispatched on open/close |
| Section link-only items (no dropdown) | PASS | `noChildren && link` path renders `<a>` instead of `<button>` |
| Two scroll states in header | WARNING | Out of scope for this block; must be handled by a parent header block. Dependency is not documented in README. |

#### UE schema alignment (`_navigation.json`)

The schema defines four models: `navigation-section`, `navigation-group`, `navigation-item`, and `navigation-group-item`. All fields in the schema are actively consumed in JS via `readBlockConfig()` and `dataset` lookups. Schema and implementation are well aligned.

| Schema model | Fields | Used in JS |
|---|---|---|
| `navigation-section` | `name`, `title`, `link`, `custom-classes`, `type` | PASS — title used for button label, link for section link, custom-classes applied via `toClassName` |
| `navigation-group` | `name`, `title`, `link`, `is-header-only`, `classes` | PASS — loaded as child block |
| `navigation-item` | `name`, `title`, `link`, `description`, `open-in-new-tab`, `classes` | PASS — loaded as child block |
| `navigation-group-item` | same as navigation-item | PASS |

**Result: WARNING** — core functionality complete; scroll-state dependency on a parent header block is undocumented.

---

### Developer Checklist

#### Conventions and Code Quality
| Item | Result |
|---|---|
| Directory convention (`/blocks/navigation/`) | PASS |
| `decorate(block)` export | FAIL — intentional auto-block architecture |
| `navigation.css` present | PASS |
| BEM CSS class naming | PASS — `.navigation-section`, `.navigation-section-button`, `.navigation-section-submenu`, `.navigation-overlay`, `.navigation-section-button-icon` |
| README thoroughly documents integration and behavior | PASS |
| No site-specific code | PASS |
| Brand differentiation via CSS custom properties | PASS — `@layer base` with full custom property set in `:root` |
| Token usage in CSS | FAIL — 5 violations outside `:root` |
| Root + Brand token cascade supported | PASS |

#### Responsive
| Item | Result |
|---|---|
| Mobile-first layout | PASS — vertical stack by default, switches to row at 768px |
| Fluid content | PASS — flex layout adapts to available width |
| Column stacking on mobile | PASS |
| 1440px max-width | WARNING — navigation block does not enforce max-width; relies on parent header container |

#### Authoring
| Item | Result |
|---|---|
| UE in-context editing | PASS — UE detected, `navigation-ue.css` loaded, `data-aue-*` attributes handled |
| Clear authoring fields | PASS — schema fields are labeled and described |
| Composable | PASS — fragment-based, not bound to a template |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| CSS loaded asynchronously | PASS — `loadCSS()` called at runtime |
| No unnecessary JS | PASS |
| SVG icons | PASS — `fetchSvg()` used for chevron icon |
| Video | N/A |

#### Accessibility
| Item | Result |
|---|---|
| Keyboard navigation | PASS — Escape closes flyout; focus returns to trigger button |
| ARIA attributes | PASS — `aria-expanded`, `aria-controls`, `aria-haspopup`, `role="menubar"`, `role="menu"`, `role="menuitem"` all present |
| Semantic HTML | PASS — `<ul>`, `<li>`, `<button>`, `<a>` used correctly |
| Screen reader announcements | PASS — `update:live:region` dispatched on open/close |
| Touch targets | PASS — `--nav-touch-target: 44px` token defined in `:root` |

---

## Remediation

**Priority 1 — FAIL items (blocking)**

1. **Fix CSS token violations (5 items):**
   - Lines 69, 112, 131: Replace raw `z-index: 1` and `z-index: 0` with `var(--z-index-raised, 1)` and `var(--z-index-base, 0)` respectively.
   - Line 65: Remove the `1px` fallback from `letter-spacing` — the token `--nav-dropdown-letter-spacing` is defined in `:root` so the fallback is unreachable; simplify to `letter-spacing: var(--nav-dropdown-letter-spacing)`.
   - Line 126: Remove the `22px` fallback from `gap` — `--nav-section-gap-desktop` is defined in `:root`; simplify to `gap: var(--nav-section-gap-desktop)`.

**Priority 2 — Should Fix**

2. **Add `ticket-details.md`** — Document requirements for the navigation block for traceability.
3. **Document scroll-state dependency** — The README describes only the navigation block's own behavior. Add a note stating that two-scroll-state behavior (sticky header on scroll) must be implemented in a wrapping header block, and reference that block.

**Priority 3 — Advisory**

4. **Add Pattern A lifecycle hooks** — Consider adding `navigationFragment:before` and `navigationFragment:after` events to `autoBlockNavigationFragment()` for consistency with the rest of the block library. This would allow external scripts to hook into navigation initialization.
5. **Enforce `inert` removal on mobile close** — Confirm that `inert` state is consistently toggled on all submenu elements during `resetMenuState()` for mobile view; currently `resetMenuState()` only collapses `aria-expanded` without explicitly toggling `inert` on mobile panels.
