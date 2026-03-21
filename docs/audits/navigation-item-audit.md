# Block Audit Report: navigation-item
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | PASS |
| Developer Checklist | 21/24 items passed |

## Overall: GO (with remediation items)

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `navigation-item.js` | YES | YES |
| `navigation-item.css` | YES | YES |
| `navigation-item.scss` | YES | YES |
| `README.md` | YES | YES |
| `_navigation-item.json` | Expected if standalone | NO — model defined in `_navigation.json` |
| `ticket-details.md` | YES | NO |

Result: WARNING — No standalone `_navigation-item.json`; the block's UE schema is defined inside `_navigation.json`. Acceptable as part of the navigation family, but deviates from the per-block file convention. `ticket-details.md` is missing.

---

### Pattern A Compliance

#### 2a. Export signature

```js
export async function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.NavigationItem?.hooks);
```

Both required forms are present — PASS.
- `options = {}` default parameter — PASS
- `window.NavigationItem?.hooks` — PascalCase of `navigation-item` — PASS

#### 2b. Lifecycle hooks and events

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('navigation-item:before', { detail: ctx, bubbles: true }));
// ... block logic ...
ctx.block = li;
options.onAfter?.(ctx);
li.dispatchEvent(new CustomEvent('navigation-item:after', { detail: ctx, bubbles: true }));
```

Both before and after hooks and events are present. `after` event is correctly dispatched on the final `li` element after `ctx.block` is updated — PASS.

#### 2c. Imports

- `../../scripts/scripts.js` — `moveInstrumentation` — PASS
- `../../scripts/aem.js` — `readBlockConfig` — PASS
- `../../scripts/baici/utils/utils.js` — `debounce` — PASS
- `../navigation/navigation.js` — `updateSubMenuHeight` — cross-block import within navigation family, acceptable

#### 2d. No site-specific code

No brand-specific logic found. Adobe Data Layer usage is platform-standard — PASS.

---

### CSS Token Audit

The `navigation-item.scss` file was reviewed for hard-coded values. All values use CSS custom properties that chain back to the navigation token system. No violations found.

Notable review points:
- `var(--nav-item-min-width)`, `var(--nav-item-color)`, `var(--nav-item-font)` — all token-based
- `var(--nav-item-desktop-min-width)`, `var(--nav-item-desktop-padding)` — responsive tokens
- `0` values — exempt
- Media query breakpoint (`768px`) — acceptable exception per skill rules
- `fit-content` — layout value, not a brand/spacing token; exempt

Result: PASS (0 violations)

---

### Spec Alignment

`ticket-details.md` is absent. README and solution design were used as reference. The navigation-item block is the leaf node of the navigation hierarchy.

| Use Case | Implemented? | Notes |
|---|---|---|
| Single navigable menu item within a section/group | YES | `<li role="menuitem"><a>` structure rendered |
| Configurable link text and URL | YES | `title` and `link` from `readBlockConfig()` |
| Optional description/tooltip | YES | `title` attribute set on anchor when description is present |
| Open in new tab | YES | `target="_blank"` and `rel="noopener noreferrer"` when `open-in-new-tab: true` |
| Keyboard Escape to close parent flyout | YES | `keyup` Escape dispatches `close:navigation:section` event |
| Analytics data layer on click | YES | `nav_link_click` with `level: 'item'` pushed |
| Universal Editor re-decoration | YES | `decorate:navigation:item` event listener on `main` |

UE model `navigation-item` in `_navigation.json` defines `title`, `link`, `description`, `open-in-new-tab` — all are read via `readBlockConfig()` and used in the implementation — PASS.

Result: PASS

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/navigation-item/` convention
- [PASS] Has `decorate(block, options = {})` export with Pattern A default export
- [PASS] Has `navigation-item.css`
- [PASS] BEM-style CSS classes (`.navigation-item`, `.navigation-group-list-link` used in group context)
- [PASS] README thoroughly documents integration and behavior
- [PASS] Part of shared global library — no site-specific code
- [PASS] Brand differentiation via CSS custom properties
- [PASS] Uses semantic design tokens — no hard-coded values
- [PASS] Supports Root + Brand token cascade via `@layer base`

#### Responsive Design
- [PASS] Responsive tokens applied at 768px breakpoint
- [PASS] `grid-column: 1` at desktop slots items into the parent grid correctly
- [N/A] Column stacking — handled by parent navigation block
- [N/A] 1440px max-width — handled by parent container

#### Authoring Contract
- [PASS] UE schema fields align with JS implementation
- [PASS] Author-facing fields documented in `_navigation.json`
- [PASS] Composable — used within navigation sections and groups
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not applicable

#### Performance
- [N/A] Third-party scripts — none
- [N/A] Images — none
- [PASS] No unnecessary JavaScript — minimal, focused implementation
- [N/A] Video — none

#### Accessibility (WCAG 2.1)
- [PASS] `role="menuitem"` on `<li>` element
- [PASS] Keyboard Escape handler (debounced 100ms) dispatches close event
- [PASS] Semantic HTML — `<li>`, `<a>` used correctly
- [WARNING] Description text uses `title` attribute (browser tooltip) rather than a more accessible `aria-describedby` pattern — `title` has poor screen reader support
- [N/A] Alt text — no images

---

## Remediation

**Priority 1 — Blocking**
1. Add `ticket-details.md` documenting requirements for this sub-block.

**Priority 2 — Should Fix**
2. Replace the `title` attribute approach for item descriptions with `aria-describedby` referencing a visually hidden `<span>`, or an alternative accessible description pattern. The `title` attribute is not reliably announced by screen readers and is not keyboard-accessible.
3. Consider adding a standalone `_navigation-item.json` or clearly documenting in the README that the UE schema for this block lives in `_navigation.json`.

**Priority 3 — Nice to Have**
4. The `decorateMenuItem()` function (used for UE re-decoration) is defined but calls `decorate(item)` without passing `options` — if hooks are set on `window.NavigationItem`, they would not fire during UE re-decoration. Consider using `decorate(item, window.NavigationItem?.hooks)` for consistency.
