# Block Audit Report: navigation-group
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | PASS |
| Developer Checklist | 20/24 items passed |

## Overall: GO (with remediation items)

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `navigation-group.js` | YES | YES |
| `navigation-group.css` | YES | YES |
| `navigation-group.scss` | YES | YES |
| `README.md` | YES | YES |
| `_navigation-group.json` | Expected if standalone | NO — fields are defined in `_navigation.json` |
| `ticket-details.md` | YES | NO |

Result: WARNING — No standalone `_navigation-group.json` exists; the block's UE schema is defined inside `_navigation.json` (the parent navigation block's schema file). This is a valid architectural choice but deviates from the per-block convention. `ticket-details.md` is missing.

---

### Pattern A Compliance

#### 2a. Export signature

```js
export async function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.NavigationGroup?.hooks);
```

Both required forms are present — PASS.
- `options = {}` default parameter — PASS
- `window.NavigationGroup?.hooks` — PascalCase matches block name `navigation-group` — PASS

#### 2b. Lifecycle hooks and events

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('navigation-group:before', { detail: ctx, bubbles: true }));
// ... block logic ...
options.onAfter?.(ctx);
li.dispatchEvent(new CustomEvent('navigation-group:after', { detail: ctx, bubbles: true }));
```

Both before and after hooks present. Note: the `after` event is dispatched on `li` (the final decorated element) after `ctx.block = li` is set, which is correct. `bubbles: true` is set — PASS.

#### 2c. Imports

- `../../scripts/scripts.js` — `moveInstrumentation` — PASS
- `../../scripts/baici/utils/config.js` — `readConfig`, `readKeyValueConfig`, `readUeConfig` — PASS
- `../../scripts/baici/utils/utils.js` — `fetchSvg`, `debounce` — PASS
- `../../scripts/aem.js` — `extractAueConfig` — PASS
- `../navigation/navigation.js` — `updateSubMenuHeight` — cross-block import, acceptable for tightly coupled navigation family

#### 2d. No site-specific code

No brand-specific logic found. Adobe Data Layer usage is platform-standard — PASS.

---

### CSS Token Audit

**Violations found in `navigation-group.scss`:**

```
Line 43: transition: max-height 0.3s ease, min-height 0.3s ease;
  Suggested: transition: max-height var(--transition-duration-fast) ease, min-height var(--transition-duration-fast) ease

Line 75: gap: 8px;
  Suggested: gap: var(--spacing-008)
```

Total: 2 violations. Result: WARNING (1–3 violations).

All other values in the file correctly use CSS custom properties referencing the nav token system.

---

### Spec Alignment

`ticket-details.md` is absent. README and solution design were used as reference. The navigation-group block is a sub-component of the navigation system and its spec is derived from the overall navigation requirements.

| Use Case | Implemented? | Notes |
|---|---|---|
| Labeled group of navigation items within flyout | YES | Title rendered as button or link based on `is-header-only` |
| Desktop: always expanded, non-interactive header | YES | `pointer-events: none` via CSS at 768px+ |
| Mobile: toggle expand/collapse | YES | `toggleGroupMenu()` fires only when `isMobile.matches` |
| Optional navigable group title link | YES | `is-header-only: false` renders `a.navigation-group-link` |
| Analytics data layer on item click | YES | `nav_link_click` with `level: 'group-item'` |
| Screen reader live region announcement | YES | `update:live:region` dispatched on open/close |
| Universal Editor re-decoration support | YES | `decorate:navigation:group` and `decorate:navigation:group:items` listeners |
| UE in-context config reading | YES | `readGroupUeConfig()`, `extractAueConfig()` |
| `open-in-new-tab` for group items | YES | `target="_blank"` and `rel="noopener noreferrer"` set |
| Item description as accessible tooltip | YES | `aria-description` set on anchor |

UE fields (`title`, `link`, `is-header-only`) defined in `_navigation.json` model `navigation-group` are all read and used in `decorate()` — PASS.

Result: PASS

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/navigation-group/` convention
- [PASS] Has `decorate(block, options = {})` export with Pattern A default export
- [PASS] Has `navigation-group.css`
- [PASS] BEM-style CSS classes (`.navigation-group`, `.navigation-group-list`, `.navigation-group-button`, `.navigation-group-link`, `.navigation-group-button-title`, `.navigation-group-button-icon`)
- [PASS] README thoroughly documents integration and behavior
- [PASS] Part of shared global library — no site-specific code
- [PASS] Brand differentiation via CSS custom properties
- [WARNING] 2 hard-coded values in CSS (`0.3s` transition, `8px` gap)
- [PASS] Supports Root + Brand token cascade via `@layer base`

#### Responsive Design
- [PASS] Mobile behavior (collapsible) and desktop behavior (always expanded) are correctly differentiated
- [PASS] Grid layout integrates with parent navigation submenu grid (`grid-row: 1 / span var(--row-span, 1)`)
- [N/A] Column stacking — handled by parent navigation block
- [N/A] 1440px max-width — handled by parent navigation/header container

#### Authoring Contract
- [PASS] UE in-context editing supported via `readGroupUeConfig()` and `extractAueConfig()`
- [PASS] Author-facing fields documented in `_navigation.json` model
- [PASS] Composable — used within navigation section panels
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not applicable

#### Performance
- [N/A] Third-party scripts — none
- [N/A] Images — SVG icon loaded via `fetchSvg`
- [PASS] No unnecessary JavaScript
- [N/A] Video — none

#### Accessibility (WCAG 2.1)
- [PASS] Keyboard Escape handler with debounce
- [PASS] `aria-expanded`, `aria-label`, `aria-haspopup`, `aria-controls` on group trigger
- [PASS] `role="menu"` and `aria-label` on group list
- [PASS] `role="menuitem"` on item `<li>` elements
- [PASS] `update:live:region` dispatched for screen reader announcements

---

## Remediation

**Priority 1 — Blocking**
1. Add `ticket-details.md` documenting requirements for this sub-block.

**Priority 2 — Should Fix**
2. Fix CSS token violations (2 items):
   - Replace `transition: max-height 0.3s ease, min-height 0.3s ease` with `var(--transition-duration-fast)` or equivalent token
   - Replace `gap: 8px` with `var(--spacing-008)`
3. Consider adding a standalone `_navigation-group.json` or clearly documenting in the README that the UE schema for this block lives in `_navigation.json`.
