# Block Audit Report: navigation
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | FAIL |
| CSS Token Usage | FAIL (7 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/24 items passed |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `navigation.js` | YES | YES |
| `navigation.css` | YES | YES |
| `navigation.scss` | YES | YES |
| `README.md` | YES | YES |
| `_navigation.json` | YES | YES |
| `ticket-details.md` | YES | NO |

Additional files present: `navigation-ue.scss`, `navigation-ue.css` — these are supplemental UE authoring styles, acceptable.

Result: WARNING — All core required files present. `ticket-details.md` is missing. README is thorough and documents integration, events, and exported utilities.

---

### Pattern A Compliance

#### 2a. Export signature

The navigation block is an **auto-block** that exports `autoBlockNavigationFragment()` rather than a `decorate()` function. There is no `export function decorate(block, options = {})` and no Pattern A default export.

- No `export function decorate(block, options = {})` — FAIL
- No `export default (block) => decorate(block, window.Navigation?.hooks)` — FAIL

This is an intentional architectural decision: navigation is initialized as a fragment-wrapping auto-block, not via the standard block decoration pipeline. The README documents this pattern.

#### 2b. Lifecycle hooks and events

No `before`/`after` lifecycle hooks are dispatched in the auto-block flow. Events are dispatched for section open/close (`update:live:region`) and analytics (`nav_link_click`), but these are behavioral events, not Pattern A lifecycle events — FAIL (by design).

#### 2c. Imports

- `../../scripts/aem.js` — `loadCSS`, `toCamelCase`, `readBlockConfig` — PASS
- `../../scripts/baici/utils/utils.js` — `fetchSvg` — PASS
- `../../scripts/scripts.js` — `moveInstrumentation` — PASS
- `toClassName` is re-implemented locally as a private function rather than imported from `../../scripts/aem.js`. This is a minor duplication — WARNING.

#### 2d. No site-specific code

No brand-specific logic found. Adobe Data Layer (`window.adobeDataLayer`) usage is platform-standard — PASS.

---

### CSS Token Audit

**Violations found in `navigation.scss`:**

```
Line 13 (within :root): --nav-section-button-background: #fff;
  — Inside :root, exempt per skill rules (token definition)

Line 13: --nav-section-button-border: 3px solid var(--color-neutral-300);
  — "3px" hard-coded within a :root token definition — exempt

Line 15: --nav-section-button-border-active: 3px solid var(--color-brand-500);
  — "3px" hard-coded within a :root token definition — exempt

Line 19: --nav-dropdown-bg: var(--color-neutral-50, #fff);
  — fallback #fff within a :root definition — exempt

Line 22: --nav-dropdown-box-shadow: var(--dropdown-box-shadow, 0 0.2rem 0.4rem rgb(0 0 0 / 7.5%));
  — fallback rgb() within a :root definition — exempt

Line 61: gap: 8px;
  Suggested: gap: var(--spacing-008)

Line 86: transition: max-height 0.3s ease, min-height 0.3s ease;
  Suggested: transition: max-height var(--transition-duration-fast) ease, min-height var(--transition-duration-fast) ease

Line 105: background: var(--nav-section-active-overlay, rgb(222 0 0 / 25%));
  — fallback rgb() used as a default value in live CSS (not a :root definition). Flagged.
  Suggested: background: var(--nav-section-active-overlay, var(--color-overlay-default))

Line 159: top: 64px;
  Suggested: top: var(--spacing-064)

Line 167: transform: translate(-35px, 0);
  — magic number offset; no corresponding token. Flag as WARNING.
  Suggested: consider var(--navigation-submenu-offset) or inline offset token

Line 168: box-shadow: var(--nav-dropdown-box-shadow, 0 0.2rem 0.4rem rgb(0 0 0 / 7.5%));
  — fallback rgb() in live CSS rule (not :root).
  Suggested: use var(--shadow-dropdown) or ensure --nav-dropdown-box-shadow is always defined
```

Counting only non-`:root` violations outside the exempt categories:
1. Line 61: `gap: 8px`
2. Line 86: `transition: max-height 0.3s ease, min-height 0.3s ease`
3. Line 105: fallback `rgb(222 0 0 / 25%)` in live CSS
4. Line 159: `top: 64px`
5. Line 167: `transform: translate(-35px, 0)` — magic number
6. Line 168: fallback `rgb(0 0 0 / 7.5%)` in live CSS

Also in `navigation-group.scss` (part of this block family, reviewed together):
7. Line 43: `transition: max-height 0.3s ease, min-height 0.3s ease`

Total: 7 violations. Result: FAIL (4+ violations threshold exceeded).

---

### Spec Alignment

`ticket-details.md` is absent. The README and solution design documentation were used as reference.

The solution design specifies a Header block with a two-scroll-state navigation, mega menu, site logo, and search bar. The navigation block handles the mega menu flyout panel logic. Alignment was evaluated against that scope.

| Use Case | Implemented? | Notes |
|---|---|---|
| Multi-level flyout navigation menu | YES | Section > Group > Item hierarchy implemented |
| Author-configurable menu items | YES | Via navigation-section, navigation-group, navigation-item sub-blocks |
| Two scroll states in header | PARTIAL | Navigation block itself has no scroll state logic; must be implemented in a header block that wraps navigation |
| Mega menu panels | YES | Section submenu with group columns implemented |
| Auto-block fragment wrapping | YES | `autoBlockNavigationFragment()` handles this |
| Universal Editor in-context editing | YES | UE detection, `navigation-ue.css` loading, `data-aue-*` attribute handling |
| Keyboard navigation (Escape, focus management) | YES | `closeOnEscape`, focus returned to trigger button |
| Analytics data layer integration | YES | `window.adobeDataLayer` push on section link click |
| Screen reader announcements | YES | `update:live:region` custom event dispatched on open/close |
| Section link-only navigation items (no dropdown) | YES | `noChildren && link` path renders `<a>` instead of button |

UE JSON schema (`_navigation.json`) defines `navigation-section`, `navigation-group`, `navigation-item`, and `navigation-group-item` models with appropriate fields — well aligned with the JS implementation.

Result: WARNING — Two-scroll-state behavior is not part of this block (must be in a wrapping header block). This is acceptable if the header block handles it, but the dependency is undocumented.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/navigation/` convention
- [FAIL] No `decorate(block)` export — intentional auto-block architecture
- [PASS] Has `navigation.css`
- [PASS] BEM-style CSS classes (`.navigation-section`, `.navigation-section-button`, `.navigation-section-submenu`, `.navigation-overlay`)
- [PASS] README thoroughly documents integration and behavior
- [PASS] Part of shared global library — no site-specific code
- [PASS] Brand differentiation via CSS custom properties in `:root` layer
- [FAIL] 7 hard-coded values found in CSS that should use tokens
- [PASS] Root + Brand token cascade supported via `@layer base` and CSS custom property structure

#### Responsive Design
- [PASS] Mobile-first — column layout stacks vertically by default, switches to row at 768px
- [PASS] Content fluidity via flex layout
- [PASS] Columns stack vertically at mobile widths
- [WARNING] 1440px max-width not enforced within the navigation block (relies on parent header container)
- [PASS] Full-width option not applicable for navigation

#### Authoring Contract
- [PASS] Universal Editor in-context editing supported
- [PASS] Author-facing fields clear and documented in UE schema
- [PASS] Composable — fragment-based, not bound to a specific template
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not applicable to navigation

#### Performance
- [N/A] Third-party scripts — none
- [N/A] Images — SVG icons loaded via `fetchSvg`
- [PASS] No unnecessary JavaScript
- [N/A] Video — none

#### Accessibility (WCAG 2.1)
- [PASS] Keyboard navigation — Escape closes flyout, focus returns to trigger
- [PASS] `aria-expanded`, `aria-controls`, `aria-haspopup`, `role="menubar"`, `role="menu"`, `role="menuitem"` all present
- [PASS] Semantic HTML structure — `<ul>`, `<li>`, `<button>`, `<a>` used appropriately
- [PASS] `update:live:region` dispatched for screen reader announcements
- [N/A] Alt text — no images

---

## Remediation

**Priority 1 — Blocking**
1. Add `ticket-details.md` to document requirements and intended behavior.
2. Fix CSS token violations (7 items):
   - Replace `gap: 8px` with `var(--spacing-008)`
   - Replace `0.3s` transition durations with `var(--transition-duration-fast)` or equivalent token
   - Replace `top: 64px` with `var(--spacing-064)`
   - Replace hard-coded `rgb()` fallback values in live CSS rules with token references
   - Replace magic number `translate(-35px, 0)` with a named CSS custom property

**Priority 2 — Should Fix**
3. Remove the local re-implementation of `toClassName()` and import it from `../../scripts/aem.js`.
4. Document the two-scroll-state dependency in the README — make it explicit that the navigation block requires a wrapping header block to implement scroll-state switching.

**Priority 3 — Nice to Have**
5. Add Pattern A lifecycle hooks (`onBefore`/`onAfter`) and events (`navigation:before`, `navigation:after`) to `autoBlockNavigationFragment()` for consistency with the rest of the block library.
