# Block Audit Report: tabs
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | FAIL (4 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/23 items passed |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `tabs.js` | YES | YES |
| `tabs.css` | YES | YES |
| `tabs.scss` | YES | YES |
| `README.md` | YES | YES |
| `ticket-details.md` | YES | NO |
| `_tabs.json` | YES | YES — at `blocks/tabs/_tabs.json` |

All required files (JS, CSS) are present. `ticket-details.md` is absent. The README is present but incomplete — it documents basic usage and hooks but omits six block-level configuration options that are implemented in JS. It also documents an `onTabClick` hook that does not exist in the code.

**Result: WARNING** — ticket-details.md absent; README accuracy issues.

---

### Pattern A Compliance

#### 2a. Export Signature

| Check | Status | Notes |
|---|---|---|
| Named export `export async function decorate(block, options = {})` | PASS | Line 194 |
| Default export `export default (block) => decorate(block, window.Tabs?.hooks)` | PASS | Line 481 |
| `options = {}` default param | PASS | Line 194 |
| PascalCase global hook name (`window.Tabs`) | PASS | Matches block name |

#### 2b. Lifecycle Hooks and Events

| Check | Status | Notes |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 195 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 198 |
| `block.dispatchEvent(new CustomEvent('tabs:before', { detail: ctx, bubbles: true }))` | PASS | Line 199 — `bubbles: true` present |
| `readVariant(block)` called | PASS | Line 328 |
| `options.onAfter?.(ctx)` after block logic | PASS | Line 472 |
| `block.dispatchEvent(new CustomEvent('tabs:after', { detail: ctx, bubbles: true }))` | PASS | Line 473 — `bubbles: true` present |

All lifecycle hooks and events are fully and correctly implemented.

#### 2c. Imports

| Import | Expected Path | Actual Path | Status |
|---|---|---|---|
| `readBlockConfig` | `../../scripts/aem.js` | `../../scripts/aem.js` | PASS |
| `readVariant` | `../../scripts/scripts.js` | `../../scripts/scripts.js` | PASS |

Note: `moveInstrumentation` is not imported. The README claims "Instrumentation preserved via `moveInstrumentation`" but the code does not import or call this function. The block does remove `data-aue-*` attributes from tab button child elements (lines 403–405) but does not transfer instrumentation from source rows to output elements. This is a README inaccuracy, not an import error.

#### 2d. No Site-Specific Code

Analytics events dispatch to `window.adobeDataLayer` (Adobe Data Layer) — this is an accepted platform-wide integration pattern, not site-specific. The AEM Cloud hostname check (`window.location.hostname.includes('adobeaemcloud.com')`) is an accepted pattern for suppressing analytics in preview/author environments. No brand names or property-specific values detected.

**Pattern A overall result: PASS**

---

### CSS Token Audit

Audited `tabs.scss` (253 lines). The following violations were found outside `:root`:

**Violations:**

| Line | File | Value | Suggested Fix |
|---|---|---|---|
| 247 | `tabs.scss` | `border-bottom: 1px solid var(--color-border, #dadada)` | `border-bottom: 1px solid var(--color-border)` — remove `#dadada` hex fallback |
| 210 | `tabs.scss` | `padding: 1rem` (`.tabs.mobile-accordion button[role='tab']`) | `padding: var(--spacing-016)` or appropriate spacing token |
| 102 | `tabs.scss` | `transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out` | `transition: opacity var(--transition-duration-normal, 0.3s) ease-in-out, visibility var(--transition-duration-normal, 0.3s) ease-in-out` |
| 227 | `tabs.scss` | `transition: transform 0.2s` (accordion icon) | `transition: transform var(--transition-duration-fast)` |

**Accepted exceptions (not flagged):**
- `:root` block (lines 1–6): `--tabs-list-min-width: 200px`, `--tabs-panel-padding: var(--spacing-024)`, `--tabs-accordion-icon-size: 1.5em` — all inside `:root`, exempt.
- `gap: 0.5ch` (line 13) — character-unit gap; borderline but treated as a structural optical alignment value.
- `margin-top: -1px`, `margin-left: -1px` — negative `1px` offsets for border collapse; structural border alignment, exempt.
- `border: 1px solid var(--color-border)` — `1px` border is a structural exception.
- `border-radius: 0` — value `0`, exempt.
- `z-index: 1`, `z-index: 2` — these should ideally use `var(--z-index-*)` tokens; however only 2 instances are present and are within the WARNING threshold. Noted below.
- `width: 0`, `height: 0` — value `0`, exempt.
- `transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out` on line 106 in `.tabs-transition-slide` — same pattern as line 102 violation, counted once.
- `transform: translateX(-20px)` — pixel transform value on slide transition. Should use a token or block-scoped variable.

**Additional observations (not counted in violation total):**
- `z-index: 1` (line 46 and line 144) — raw z-index values should use `var(--z-index-*)` tokens.
- `transform: translateX(-20px)` (line 114) — raw pixel transform for slide animation.
- `font-weight: bold` (lines 39, 209) — keyword `bold` is generally acceptable as it maps to `700` and is a CSS keyword, not a raw number.

**Total violations: 4** (`#dadada` hex fallback, `padding: 1rem`, `transition: 0.3s`, `transition: 0.2s`).

**Result: FAIL (4 violations)**

---

### Spec Alignment

`ticket-details.md` is absent. Assessment based on `README.md`, `_tabs.json`, and implementation.

#### Use Case Coverage

| Use Case | Implemented | Notes |
|---|---|---|
| Accessible tab interface with ARIA roles | PASS | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Keyboard navigation (Arrow keys, Home, End) | PASS | `handleKeydown` with full arrow key, Home, End support |
| Tab activation on click | PASS | Click listener on each button calls `activateTab` |
| Vertical layout variant | PASS | `tabs-vertical` class + flex layout |
| Mobile accordion / stack-on-mobile | PASS | `stackOnMobile` flag + `buildLayout(isMobileMode)` + media query listener |
| URL hash deep linking | PASS | `allowHashDeepLinks` flag, slug generation, `hashchange` listener |
| Hover activation | PASS | `activateOnHover` flag + `mouseover` listener |
| Transition styles (fade / slide / none) | PASS | `tabs-transition-{style}` classes + CSS transitions |
| Prefers-reduced-motion support | PASS | `window.matchMedia('prefers-reduced-motion: reduce')` check + CSS media query |
| Analytics integration | PASS | `tabs_interaction` and `tabs_deep_link` dispatched to `window.adobeDataLayer` |

#### UE Schema Alignment (`_tabs.json`)

The `_tabs.json` defines a `tabs-item` model for individual tab panels. There is no `tabs` block-level model in the schema.

| Field / Config | In Schema | Read in JS | Status |
|---|---|---|---|
| Tab Title (per item) | PASS (`title` field) | Used as button label | PASS |
| Heading (per item) | PASS (`contentHeading` field) | Used in panel | PASS |
| Heading Type (per item) | PASS (`contentHeadingType` field) | Used in panel | PASS |
| Image (per item) | PASS (`contentImage` field) | Used in panel | PASS |
| Content richtext (per item) | PASS (`contentRichtext` field) | Used in panel | PASS |
| `layoutVariant` (block-level) | NOT in schema | Read from single-col DOM rows or `config.layoutvariant` | WARNING |
| `stackOnMobile` (block-level) | NOT in schema | Read from single-col DOM rows or `config.stackonmobile` | WARNING |
| `allowHashDeepLinks` (block-level) | NOT in schema | Read from single-col DOM rows or `config.allowhashdeeplinks` | WARNING |
| `activateOnHover` (block-level) | NOT in schema | Read from single-col DOM rows | WARNING |
| `transitionStyle` (block-level) | NOT in schema | Read from single-col DOM rows or `config.transitionstyle` | WARNING |
| `analyticsCategory` (block-level) | NOT in schema | Read from single-col DOM rows | WARNING |

Six block-level configuration options are implemented but not exposed in the UE schema. Authors using Universal Editor cannot configure layout variant, transition style, mobile stacking, deep linking, hover activation, or analytics category.

**README accuracy issues:**
- Documents `onTabClick` hook (`options.onTabClick?.({ block, button, tabpanel, i })`) — this is not implemented in `decorate()`. The hook is documented but the code does not call it.
- Documents `tabs:change` custom event — this is not dispatched in the current implementation. Only `tabs:before` and `tabs:after` are dispatched.
- Claims "Instrumentation preserved via `moveInstrumentation`" — `moveInstrumentation` is not imported or called.

**Result: WARNING** — ticket-details.md absent; 6 block-level config fields missing from UE schema; README documents 3 features that are not implemented.

---

### Developer Checklist

#### General Block Requirements
| Item | Result |
|---|---|
| Directory convention `/blocks/tabs/` | PASS |
| JS and CSS files present | PASS |
| BEM CSS classes (`.tabs-list`, `.tabs-tab`, `.tabs-panel`, `.tabs-vertical`, `.mobile-accordion`, `.tabs-transition-*`) | PASS |
| README present | PASS |
| README accuracy | FAIL — documents `onTabClick`, `tabs:change`, `moveInstrumentation` that are not implemented |
| No site-specific code | PASS |
| Token usage in CSS | FAIL — 4 violations |
| Root + Brand token cascade supported | PASS |

#### Responsive Design
| Item | Result |
|---|---|
| Font sizing responsive via media queries (600px, 900px) | PASS |
| Content fluidly expands within panels | PASS |
| Mobile accordion stacks at 600px | PASS |
| 1440px max-width | N/A — inherits container |

#### Authoring
| Item | Result |
|---|---|
| UE schema present (`_tabs.json`) for tab items | PASS |
| Block-level config fields in UE schema | FAIL — 6 fields missing |
| Composable | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| No third-party scripts | N/A |
| ResizeObserver / media query listener | PASS — `mediaQuery.addEventListener` used for responsive layout |
| No unnecessary JavaScript | PASS |
| No video | N/A |

#### Accessibility
| Item | Result |
|---|---|
| Keyboard navigation (Arrow, Home, End) | PASS |
| ARIA roles (`tablist`, `tab`, `tabpanel`) | PASS |
| ARIA states (`aria-selected`, `aria-controls`, `aria-labelledby`, `aria-hidden`) | PASS |
| `aria-expanded` in mobile accordion mode | PASS |
| Focus management on tab activation | PASS — `buttons[index].focus()` called in `activateTab` |
| `prefers-reduced-motion` respected | PASS |

---

## Remediation

**Priority 1 — Blocking (must fix before GO)**

1. **Fix 4 CSS token violations:**
   - **Line 247**: Remove `#dadada` hex fallback from `var(--color-border, #dadada)` → `var(--color-border)`.
   - **Line 210**: Replace `padding: 1rem` on `.tabs.mobile-accordion button[role='tab']` → `padding: var(--spacing-016)` or equivalent.
   - **Lines 102 / 106**: Replace raw `0.3s` transition durations → `var(--transition-duration-normal)` or `var(--transition-duration-slow)` as appropriate.
   - **Line 227**: Replace `transition: transform 0.2s` → `transition: transform var(--transition-duration-fast)`.

**Priority 2 — High**

2. **Add block-level configuration fields to `_tabs.json` UE schema.** Authors cannot configure the following from Universal Editor. Add a `tabs` model with fields:
   - `layoutVariant` — select (horizontal / vertical)
   - `stackOnMobile` — boolean/checkbox
   - `allowHashDeepLinks` — boolean/checkbox
   - `activateOnHover` — boolean/checkbox
   - `transitionStyle` — select (fade / slide / none)
   - `analyticsCategory` — text

3. **Correct README to reflect actual implementation.** Remove or implement the following documented but non-existent features:
   - `onTabClick` hook — either implement `options.onTabClick?.({ block, button, tabpanel, index })` inside the click handler, or remove from README.
   - `tabs:change` custom event — either dispatch on tab activation or remove from README.
   - "Instrumentation preserved via `moveInstrumentation`" — remove claim or import and call `moveInstrumentation` when moving tab heading content to buttons.

**Priority 3 — Medium**

4. **Add `ticket-details.md`** with ADO ticket requirements per project convention.

5. **Consider additional z-index tokens.** `z-index: 1` appears in two places (`.tabs-list button`, `.tabs-vertical .tabs-list`). If the project has a `var(--z-index-raised)` or similar token, apply it for consistency.

6. **Replace `transform: translateX(-20px)` with a token or block-scoped variable.** Line 114 on the slide transition uses a hard-coded pixel offset. Define `--tabs-slide-offset: -20px` in the `:root` block for this file, or use a named spacing token.
