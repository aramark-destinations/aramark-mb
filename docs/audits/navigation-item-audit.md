# Block Audit Report: navigation-item
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | FAIL |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 18/24 items passed |

## Overall: NO-GO

---

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `navigation-item.js` | YES | YES |
| `navigation-item.css` | YES | YES |
| `navigation-item.scss` | YES | YES |
| `README.md` | YES | YES |
| `_navigation-item.json` | YES | NO — not in block dir; not found in `models/` fallback |
| `ticket-details.md` | YES | NO |

Result: WARNING — JS and CSS are both present. `_navigation-item.json` is absent from the block directory and no fallback exists under `models/`. `ticket-details.md` is missing.

---

### Pattern A Compliance

#### 2a. Export signature

| Check | Status |
|---|---|
| Named export `export async function decorate(block, options = {})` | PASS — line 21 |
| Default export `export default (block) => decorate(block, window.NavigationItem?.hooks)` | PASS — line 90 |
| `options = {}` default parameter | PASS |
| `window.NavigationItem?.hooks` — PascalCase matches `navigation-item` | PASS |

#### 2b. Lifecycle hooks and events

| Check | Status |
|---|---|
| `const ctx = { block, options }` | PASS — line 22 |
| `options.onBefore?.(ctx)` before block logic | PASS — line 25 |
| `block.dispatchEvent(new CustomEvent('navigation-item:before', { detail: ctx, bubbles: true }))` | PASS — line 26, `bubbles: true` present |
| `readVariant(block)` called | FAIL — not imported and not called anywhere in `decorate()` |
| `options.onAfter?.(ctx)` after block logic | PASS — line 81 |
| `li.dispatchEvent(new CustomEvent('navigation-item:after', { detail: ctx, bubbles: true }))` | PASS — line 82, dispatched on `li` after `ctx.block = li`, `bubbles: true` present |

`readVariant` is neither imported from `../../scripts/scripts.js` nor called inside `decorate()`. This is a required Pattern A step and constitutes a FAIL.

#### 2c. Imports

| Symbol | Expected source | Actual source | Status |
|---|---|---|---|
| `moveInstrumentation` | `../../scripts/scripts.js` | `../../scripts/scripts.js` | PASS |
| `readBlockConfig` | `../../scripts/aem.js` | `../../scripts/aem.js` | PASS |
| `debounce` | `../../scripts/baici/utils/utils.js` | `../../scripts/baici/utils/utils.js` | PASS |
| `readVariant` | `../../scripts/scripts.js` | **not imported** | FAIL |
| `updateSubMenuHeight` | n/a — sibling block | `../navigation/navigation.js` | WARNING — cross-block dependency |

#### 2d. No site-specific code

No brand names, hard-coded domain URLs, or property-specific values found. `window.adobeDataLayer` usage is a platform-standard analytics integration. PASS.

---

### CSS Token Audit

Audited `navigation-item.scss`. All custom property definitions inside the `:root, .dropin-design` block are exempt. Media query breakpoint (`768px`) is exempt.

No violations found outside the `:root` block. All spacing, color, font, and dimension values use CSS custom properties:
- `var(--nav-item-min-width)`, `var(--nav-item-color)`, `var(--nav-item-font)` — token-based
- `var(--nav-item-padding, 0)` — token with `0` fallback (exempt)
- `var(--nav-item-desktop-min-width)`, `var(--nav-item-desktop-padding)` — responsive tokens
- `0` values — exempt
- `fit-content` — layout keyword, not a brand/spacing value; exempt
- `inline-block` — display value, exempt

Result: PASS (0 violations).

---

### Spec Alignment

`ticket-details.md` is absent; assessment is based on `README.md` only.

| Use Case | Implemented | Notes |
|---|---|---|
| Single navigable menu item (`<li role="menuitem"><a>`) | PASS | Lines 49–52 |
| Configurable link text (`title`) | PASS | Line 38 |
| Configurable URL (`link`) | PASS | Line 37 |
| Optional description as tooltip | PASS | `title` attribute set on anchor (line 41); see accessibility note below |
| Open in new tab (`open-in-new-tab: true`) | PASS | `target="_blank"`, `rel="noopener noreferrer"` (lines 45–47) |
| Keyboard Escape closes parent flyout (debounced 100 ms) | PASS | `keyup` Escape dispatches `close:navigation:section` (lines 56–62) |
| Adobe Analytics `nav_link_click` push on click | PASS | Lines 64–74 |
| UE re-decoration via `decorate:navigation:item` event | PASS | Module-level listener with `data-navigationItemListenerAttached` guard |

No `_navigation-item.json` exists to cross-validate UE field definitions.

Result: WARNING — all documented use cases appear implemented; formal spec cannot be verified without `ticket-details.md`, and UE schema is absent.

---

### Developer Checklist

#### Convention and Files
| Item | Result |
|---|---|
| Directory follows `/blocks/navigation-item/` convention | PASS |
| JS and CSS files present | PASS |
| BEM CSS class names | PASS — `.navigation-item` |
| README present and thorough | PASS |
| No site-specific code | PASS |
| CSS token usage | PASS — 0 violations |
| Root+Brand cascade via `@layer base` | PASS |

#### Responsive Design
| Item | Result |
|---|---|
| Breakpoints defined | PASS — 768px desktop breakpoint |
| Fluid content | PASS |
| Column stacking | N/A — handled by parent navigation layout |
| 1440px max-width | N/A — contained within parent navigation layout |

#### Authoring Contract
| Item | Result |
|---|---|
| UE in-context editing supported | WARNING — block uses `readBlockConfig` (document authoring); no UE-specific config reader |
| UE schema file present | FAIL — `_navigation-item.json` absent |
| Composable structure | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| Async decoration function | PASS — `async function decorate` |
| Optimized images | N/A |
| No unnecessary JS | PASS — minimal, focused implementation |
| Video embed | N/A |

#### Accessibility (WCAG 2.1)
| Item | Result |
|---|---|
| Keyboard navigation | PASS — Escape handler with debounce |
| Color contrast | PASS — inherits via CSS token chain |
| Semantic HTML | PASS — `<li role="menuitem">`, `<a>` used correctly |
| AT support | WARNING — description uses `title` attribute, which has poor screen reader support; `aria-describedby` with a visually hidden element would be more reliable |
| Alt text | N/A |

---

## Remediation

**Priority 1 — NO-GO blocker**

1. **Add `readVariant(block)` call** — Import `readVariant` from `../../scripts/scripts.js` and call `readVariant(block)` inside `decorate()` after the `before` lifecycle event fires but before block rendering logic. This is a required Pattern A step and is the sole blocker for a GO verdict.

**Priority 2 — Should fix**

2. **Create `_navigation-item.json`** — Add a UE schema file to `blocks/navigation-item/` defining `title`, `link`, `description`, and `open-in-new-tab` fields so authors can configure the block via Universal Editor.
3. **Add `ticket-details.md`** — Document the source ADO ticket requirements so spec alignment can be formally verified.
4. **Improve description accessibility** — Replace the `title` attribute on the anchor with `aria-describedby` referencing a visually hidden `<span>`, or use `aria-description` (as done in the sibling navigation-group block). The HTML `title` attribute is not reliably announced by screen readers and is not keyboard-accessible.

**Priority 3 — Consider**

5. **Decouple from sibling block** — The import of `updateSubMenuHeight` from `../navigation/navigation.js` creates a hard runtime dependency. Consider moving this utility to a shared script or injecting it via `options`.
6. **Pass hooks in `decorateMenuItem`** — The internal `decorateMenuItem()` function (used for UE re-decoration) calls `decorate(item)` without passing options. If `window.NavigationItem?.hooks` are set, they will not fire during UE re-decoration. Consider using `decorate(item, window.NavigationItem?.hooks)` for consistency.
