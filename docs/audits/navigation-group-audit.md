# Block Audit Report: navigation-group
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | FAIL |
| CSS Token Usage | WARNING (1 violation) |
| Spec Alignment | WARNING |
| Developer Checklist | 18/25 items passed |

## Overall: NO-GO

---

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `navigation-group.js` | YES | YES |
| `navigation-group.css` | YES | YES |
| `navigation-group.scss` | YES | YES |
| `README.md` | YES | YES |
| `_navigation-group.json` | YES | NO — not in block dir; not found in `models/` fallback |
| `ticket-details.md` | YES | NO |

Result: WARNING — JS and CSS are both present. `_navigation-group.json` is absent from the block directory and no fallback exists under `models/`. `ticket-details.md` is missing.

---

### Pattern A Compliance

#### 2a. Export signature

| Check | Status |
|---|---|
| Named export `export async function decorate(block, options = {})` | PASS — line 136 |
| Default export `export default (block) => decorate(block, window.NavigationGroup?.hooks)` | PASS — line 253 |
| `options = {}` default parameter | PASS |
| `window.NavigationGroup?.hooks` — PascalCase matches `navigation-group` | PASS |

#### 2b. Lifecycle hooks and events

| Check | Status |
|---|---|
| `const ctx = { block, options }` | PASS — line 137 |
| `options.onBefore?.(ctx)` before block logic | PASS — line 140 |
| `block.dispatchEvent(new CustomEvent('navigation-group:before', { detail: ctx, bubbles: true }))` | PASS — line 141, `bubbles: true` present |
| `readVariant(block)` called | FAIL — not imported and not called anywhere in `decorate()` |
| `options.onAfter?.(ctx)` after block logic | PASS — line 244 |
| `li.dispatchEvent(new CustomEvent('navigation-group:after', { detail: ctx, bubbles: true }))` | PASS — line 245, dispatched on `li` after `ctx.block = li`, `bubbles: true` present |

`readVariant` is neither imported from `../../scripts/scripts.js` nor called inside `decorate()`. This is a required Pattern A step and constitutes a FAIL.

#### 2c. Imports

| Symbol | Expected source | Actual source | Status |
|---|---|---|---|
| `moveInstrumentation` | `../../scripts/scripts.js` | `../../scripts/scripts.js` | PASS |
| `readConfig`, `readKeyValueConfig`, `readUeConfig` | `../../scripts/baici/utils/config.js` | `../../scripts/baici/utils/config.js` | PASS |
| `fetchSvg`, `debounce` | `../../scripts/baici/utils/utils.js` | `../../scripts/baici/utils/utils.js` | PASS |
| `extractAueConfig` | `../../scripts/aem.js` | `../../scripts/aem.js` | PASS |
| `readVariant` | `../../scripts/scripts.js` | **not imported** | FAIL |
| `updateSubMenuHeight` | n/a — sibling block | `../navigation/navigation.js` | WARNING — cross-block dependency |

#### 2d. No site-specific code

No brand names, hard-coded domain URLs, or property-specific values found. `window.adobeDataLayer` usage is a platform-standard analytics integration. PASS.

---

### CSS Token Audit

Audited `navigation-group.scss`. All custom property definitions inside the `:root, .dropin-design` block are exempt. Media query breakpoints (`768px`) are exempt.

| File | Line | Violation | Suggested Fix |
|---|---|---|---|
| `navigation-group.scss` | 75 | `gap: 8px` — pixel spacing value outside `:root` on `.navigation-group-button` / `a.navigation-group-link` rule | Replace with `var(--spacing-008)` or the project's equivalent spacing token |

Note: The prior audit cited `transition: 0.3s` as a violation — this is incorrect. The actual source at lines 41–44 uses `var(--transition-duration-normal)`, which is a valid token reference. No violation there.

Total: 1 violation. Result: WARNING.

---

### Spec Alignment

`ticket-details.md` is absent; assessment is based on `README.md` only.

| Use Case | Implemented | Notes |
|---|---|---|
| Group title as non-interactive button (`is-header-only: true`) | PASS | `button.navigation-group-button` rendered (line 193) |
| Group title as navigable link (`is-header-only: false`) | PASS | `a.navigation-group-link` rendered (line 201) |
| Mobile toggle expand/collapse | PASS | `toggleGroupMenu()` gated on `isMobile.matches` |
| `aria-expanded` state management | PASS | Set in `openGroupMenu()` / `closeGroupMenu()` |
| Screen reader live region on open/close | PASS | `update:live:region` dispatched on `window` |
| Escape key closes group (debounced 100 ms) | PASS | Keydown handler on lines 232–240 |
| UE re-decoration via `decorate:navigation:group` event | PASS | Module-level listener with `data-navigationGroupListenerAttached` guard |
| Adobe Analytics `nav_link_click` push | PASS | Lines 116–125 |
| UE config reading via `readGroupUeConfig` / `extractAueConfig` | PASS | Lines 158–161 |
| Item description as `aria-description` | PASS | Line 99 |
| `open-in-new-tab` support on group items | PASS | Lines 102–105 |

No `_navigation-group.json` exists to cross-validate UE field definitions.

Result: WARNING — all documented use cases appear implemented; formal spec cannot be verified without `ticket-details.md`, and UE schema is absent.

---

### Developer Checklist

#### Convention and Files
| Item | Result |
|---|---|
| Directory follows `/blocks/navigation-group/` convention | PASS |
| JS and CSS files present | PASS |
| BEM CSS class names | PASS — `.navigation-group`, `.navigation-group-list`, `.navigation-group-button`, `.navigation-group-button-title`, `.navigation-group-button-icon`, `.navigation-group-link` |
| README present and thorough | PASS |
| No site-specific code | PASS |
| CSS token usage | WARNING — 1 raw pixel value (`gap: 8px`) |
| Root+Brand cascade via `@layer base` | PASS |

#### Responsive Design
| Item | Result |
|---|---|
| Breakpoints defined | PASS — 767px mobile, 768px desktop |
| Fluid content | PASS |
| Column stacking | PASS — flex-direction column on mobile |
| 1440px max-width | N/A — contained within parent navigation layout |

#### Authoring Contract
| Item | Result |
|---|---|
| UE in-context editing supported | PASS — `readGroupUeConfig()`, `extractAueConfig()` |
| UE schema file present | FAIL — `_navigation-group.json` absent |
| Composable structure | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| Async decoration function | PASS — `async function decorate` |
| Optimized images | N/A |
| No unnecessary JS | PASS |
| Video embed | N/A |

#### Accessibility (WCAG 2.1)
| Item | Result |
|---|---|
| Keyboard navigation | PASS — Escape handler with debounce, focus management |
| Color contrast | PASS — inherits via CSS token chain |
| Semantic HTML | PASS — `<ul role="menu">`, `<li role="menuitem">`, `aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-label` |
| AT support | PASS — `update:live:region` live region announcements |
| Alt text | N/A |

---

## Remediation

**Priority 1 — NO-GO blocker**

1. **Add `readVariant(block)` call** — Import `readVariant` from `../../scripts/scripts.js` and call `readVariant(block)` inside `decorate()` after the `before` lifecycle event fires but before block rendering logic. This is a required Pattern A step and is the sole blocker for a GO verdict.

**Priority 2 — Should fix**

2. **Create `_navigation-group.json`** — Add a UE schema file to `blocks/navigation-group/` defining at minimum `title`, `link`, and `is-header-only` fields so authors can configure the block via Universal Editor.
3. **Add `ticket-details.md`** — Document the source ADO ticket requirements so spec alignment can be formally verified.
4. **Fix `gap: 8px`** — Replace with `var(--spacing-008)` or the project's equivalent spacing token (`navigation-group.scss` line 75 / `navigation-group.css` line 70).

**Priority 3 — Consider**

5. **Decouple from sibling block** — The import of `updateSubMenuHeight` from `../navigation/navigation.js` creates a hard runtime dependency. Consider moving this utility to a shared script or injecting it via `options` to keep blocks independently deployable.
