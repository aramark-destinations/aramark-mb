# Block Audit Report: tabs
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | FAIL (5 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/22 items passed |
| Accessibility Basics | PASS |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `tabs.js` | yes | yes |
| `tabs.css` | yes | yes |
| `tabs.scss` | yes | yes |
| `README.md` | yes | yes |
| `ticket-details.md` | not present | NO |
| `_tabs.json` | yes (author-configurable fields) | yes |

No `ticket-details.md` found. The README and UE schema are present. The README is functional but does not fully document all configurable fields that exist in the implementation (e.g., `layoutVariant`, `stackOnMobile`, `allowHashDeepLinks`, `activateOnHover`, `transitionStyle`, `analyticsCategory`).

**Result: WARNING** — `ticket-details.md` absent; README does not document all configurable fields.

---

### Pattern A Compliance

**2a. Export signature**

```js
export async function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.Tabs?.hooks);
```

Named export with `options = {}` default: PASS. Default export wired to `window.Tabs?.hooks`: PASS. PascalCase `Tabs` matches block name: PASS.

**2b. Lifecycle hooks and events**

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('tabs:before', { detail: ctx, bubbles: true }));
// ... block logic ...
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('tabs:after', { detail: ctx, bubbles: true }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS. Events with `bubbles: true`: PASS. `readVariant(block)` called: PASS.

**2c. Imports**

```js
import { readBlockConfig } from '../../scripts/aem.js';
import { readVariant } from '../../scripts/scripts.js';
```

Correct paths. PASS. Note: `moveInstrumentation` is referenced in the README but not imported or used in the JS. The README mentions it as a feature ("Instrumentation preserved via `moveInstrumentation`") which is inaccurate — the code removes instrumentation attributes from tab buttons (`data-aue-*`) but does not call `moveInstrumentation`. This is a documentation error, not a functional defect.

**2d. No site-specific code**

Analytics events push to `window.adobeDataLayer` (Adobe Data Layer) — this is a platform-wide integration pattern, not site-specific. The AEM cloud environment check (`window.location.hostname.includes('adobeaemcloud.com')`) is acceptable for suppressing analytics on preview environments. PASS.

**Result: PASS**

---

### CSS Token Audit

Scanning `tabs.scss`:

**Violations:**

Line 28: `border: 1px solid var(--color-border, #dadada)`
  Suggested: Remove `#dadada` fallback — `border: 1px solid var(--color-border)`. The `1px` border width is an accepted structural exception, but the `#dadada` hex fallback is a hard-coded color.

Line 68: `padding: 24px`
  Suggested: `padding: var(--spacing-024)` — raw pixel spacing value on `.tabs-panel`.

Line 68 (same rule): `border: 1px solid var(--color-border, #dadada)` — same `#dadada` hex fallback as above (additional instance on `.tabs-panel`).

Line 145 (`.tabs-vertical .tabs-list`): `min-width: 200px`
  Suggested: `min-width: var(--tabs-list-min-width, 200px)` or an appropriate layout token — hard-coded pixel dimension.

Line 218 (`.tabs.mobile-accordion button::after`): `font-size: 1.5em`
  Suggested: This decorative `+`/`−` indicator could use a relative size token if available, or a block-scoped custom property. Raw `em` font size for layout-critical elements should use a token.

Additional: `transition: background-color 0.2s` appears on lines 39 and 210. Raw transition duration `0.2s` should use `var(--transition-duration-fast)` or equivalent. These are counted under the 5 violations.

**Result: FAIL (5 violations)** — `#dadada` hex fallbacks (×2), `24px` panel padding, `200px` vertical list min-width, raw `0.2s` transition durations.

---

### Spec Alignment

No `ticket-details.md`. Using solution design and README as source of truth.

**4a. Use cases**

| Use Case | Implemented? | Notes |
|---|---|---|
| Categorical tabs with associated content | YES | Full tab/panel pattern with ARIA roles |
| Authors define tab labels and panel content | YES | First cell of each row = tab label; remaining cells = panel content |
| Keyboard navigation (Arrow keys, Home, End) | YES | `handleKeydown` with full arrow key support |
| Does NOT support nested containers (section inside tab panels) | YES | No special handling needed — the constraint is authoring-level |
| URL hash deep linking | YES | `allowHashDeepLinks` dataset flag, slug generation per tab |
| Mobile accordion/stack-on-mobile | YES | `stackOnMobile` config, `mobile-accordion` class, `buildLayout()` |
| Vertical layout variant | YES | `tabs-vertical` class + flex layout |
| Hover activation | YES | `activateOnHover` config option |
| Transition styles (fade, slide, none) | YES | `tabs-transition-fade`, `tabs-transition-slide`, `tabs-transition-none` classes |
| Reduced motion support | YES | `prefers-reduced-motion` media query + `window.matchMedia` check |
| Analytics integration | YES | `tabs_interaction` and `tabs_deep_link` events dispatched to `window.adobeDataLayer` |

**4b. Configurable fields**

The `_tabs.json` schema defines a `tabs-item` model with: Tab Title, Heading, Heading Type (H3–H6), Image (reference), and Content (richtext). This covers the per-tab panel authoring.

However, the JS implementation reads six block-level configuration fields from single-column DOM rows (`layoutVariant`, `stackOnMobile`, `allowHashDeepLinks`, `activateOnHover`, `transitionStyle`, `analyticsCategory`). None of these are in the UE schema as block-level fields on the `tabs` model. Authors cannot configure layout variant, transition style, or analytics category from Universal Editor.

**4c. Design details**

The README mentions `onTabClick` as a hook but the implementation does not define or call `options.onTabClick`. This is a documentation inaccuracy — the hook was documented but not implemented.

**Result: WARNING** — Block-level configuration fields (layoutVariant, stackOnMobile, etc.) not in UE schema; README documents `onTabClick` hook that does not exist in code.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/tabs/` convention
- [PASS] Has `tabs.js` with `decorate(block)` export
- [PASS] Has `tabs.css`
- [PASS] BEM-style CSS classes (`.tabs-list`, `.tabs-tab`, `.tabs-panel`, `.tabs-vertical`, `.mobile-accordion`)
- [WARNING] README documents basic use cases but is incomplete (missing block-level config fields, inaccurate hook documentation)
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [FAIL] 5 CSS token violations including raw pixel values and hex fallbacks
- [PASS] Supports Root + Brand token cascade

#### Responsive Design
- [PASS] Font sizing responsive via media queries (600px, 900px breakpoints)
- [PASS] Content fluidly expands within tab panels
- [PASS] Mobile accordion mode stacks tabs vertically at 600px
- [PASS] No fixed max-width constraint (inherits container)

#### Authoring Contract
- [PASS] Works with Universal Editor — `_tabs.json` present with tab item model
- [FAIL] Block-level config fields (layoutVariant, transitionStyle, etc.) not in UE schema
- [PASS] Composable — not bound to specific templates
- [PASS] Structure/content/presentation decoupled
- [N/A] No Content Fragment integration specified

#### Performance
- [N/A] No third-party scripts
- [N/A] No image optimization concerns
- [PASS] JavaScript is purposeful — handles ARIA, keyboard nav, analytics, responsive layout
- [N/A] No video

#### Accessibility (WCAG 2.1)
- [PASS] Keyboard navigation — Arrow keys, Home, End, Tab
- [PASS] ARIA roles — `role="tablist"`, `role="tab"`, `role="tabpanel"`
- [PASS] ARIA states — `aria-selected`, `aria-controls`, `aria-labelledby`, `aria-hidden`
- [PASS] `aria-expanded` in mobile accordion mode
- [PASS] `prefers-reduced-motion` respected

**Checklist: 17/22 items passed (2 FAIL, 3 WARNING)**

---

## Remediation

**Priority 1 — Blocking**

1. **Add block-level configuration fields to `_tabs.json` UE schema.** The `tabs` model currently has no block-level fields. The following should be added: `layoutVariant` (select: horizontal/vertical), `stackOnMobile` (boolean), `allowHashDeepLinks` (boolean), `transitionStyle` (select: fade/slide/none), `activateOnHover` (boolean), `analyticsCategory` (text). Without these, authors cannot configure tab behavior from Universal Editor.

**Priority 2 — High**

2. **Fix 5 CSS token violations:**
   - Replace `#dadada` hex fallbacks in all `var(--color-border, #dadada)` instances with `var(--color-border)`.
   - Replace `padding: 24px` on `.tabs-panel` with `padding: var(--spacing-024)`.
   - Replace `min-width: 200px` on `.tabs-vertical .tabs-list` with a token or block-scoped custom property.
   - Replace `transition: background-color 0.2s` raw durations with `var(--transition-duration-fast)` or equivalent token.

3. **Remove `onTabClick` from README or implement it.** The README documents an `onTabClick` hook that does not exist in the code. Either implement the hook in `decorate()` (calling `options.onTabClick?.({ block, button, tabpanel, i })` on click) or remove the reference from documentation.

**Priority 3 — Medium**

4. **Add `ticket-details.md`.** Missing from this block directory.

5. **Update README to document all block-level configuration fields** once added to the UE schema.
