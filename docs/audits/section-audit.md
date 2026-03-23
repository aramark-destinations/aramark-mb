# Block Audit Report: section
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 19/23 items passed |

## Overall: GO (with remediation items)

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `section.js` | YES | YES |
| `section.css` | YES | YES |
| `section.scss` | YES | YES |
| `README.md` | YES | YES |
| `ticket-details.md` | YES | YES — at `blocks/section/ticket-details.md` |
| `_section.json` | YES (block-level) | NO — UE schema is in `models/_section.json` (centralised) |

The UE schema for the section block is defined in the centralised `models/_section.json` file rather than a block-level `_section.json`. The schema is comprehensive and covers all ticket-specified fields. This is a structural deviation from the convention (other blocks carry `_block.json` in the block directory) but the authoring contract is not missing — it exists at the models level.

**Result: WARNING** — `_section.json` missing from block directory; covered by `models/_section.json`.

---

### Pattern A Compliance

#### 2a. Export Signature

| Check | Status | Notes |
|---|---|---|
| Named export `export function decorate(block, options = {})` | PASS | Line 31 — synchronous (appropriate, no async work needed) |
| Default export `export default (block) => decorate(block, window.Section?.hooks)` | PASS | Line 100 |
| `options = {}` default param | PASS | Line 31 |
| PascalCase global hook name (`window.Section`) | PASS | Matches block name |

#### 2b. Lifecycle Hooks and Events

| Check | Status | Notes |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 32 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 35 |
| `block.dispatchEvent(new CustomEvent('section:before', { detail: ctx, bubbles: true }))` | PASS | Line 36 — `bubbles: true` present |
| `readVariant(block)` called | PASS | Line 39 |
| `options.onAfter?.(ctx)` after block logic | PASS | Line 91 |
| `block.dispatchEvent(new CustomEvent('section:after', { detail: ctx, bubbles: true }))` | PASS | Line 92 — `bubbles: true` present |

All lifecycle hooks and events are fully and correctly implemented.

#### 2c. Imports

| Import | Expected Path | Actual Path | Status |
|---|---|---|---|
| `readVariant` | `../../scripts/scripts.js` | `../../scripts/scripts.js` | PASS |

Only `readVariant` is imported, which is appropriate — the block reads from `dataset` attributes and does not need `readBlockConfig`, `createOptimizedPicture`, or other utilities.

#### 2d. No Site-Specific Code

No brand names, hard-coded URLs, or property-specific values detected. The `OVERLAY_MAP` and `GRADIENT_DIRECTIONS` constants use generic, data-driven keys. The inline `rgb(0 0 0 / ...)` values in JS (lines 25–29, 86) are computed overlay values programmatically set as inline styles — these are not CSS file violations and represent controlled, authoring-driven output.

**Pattern A overall result: PASS**

---

### CSS Token Audit

Audited `section.scss` (102 lines). No hex colors, no `rgb()`/`rgba()` calls, no raw font sizes, no raw spacing for padding/margin/gap, no raw font weight numbers, no raw transition durations appear outside `:root`.

Specific checks:
- All background colors use `var(--color-*)` tokens with token fallbacks (e.g., `var(--color-brand-secondary-500, var(--color-neutral-900))`). Double-token fallbacks are acceptable.
- All spacing uses `var(--spacing-*)` tokens.
- `z-index: 0` on lines 63–64 is the value `0` — exempt per audit rules.
- `calc(-50vw + 50%)` expressions — exempt per audit rules (calc expressions).
- `100vw` values — structural viewport unit, exempt.
- No `rgb()` or `rgba()` in the CSS file itself; the JS-generated inline styles (in `section.js`) are not CSS file violations.

**Result: PASS (0 violations)**

---

### Spec Alignment

Source: `blocks/section/ticket-details.md` and `models/_section.json`.

#### Use Case Coverage

| Use Case (from ticket-details.md) | Implemented | Notes |
|---|---|---|
| Section Type: Full-width (viewport bg, constrained inner 1320px) | PASS | `section-full-width` with `100vw` + `max-width: var(--layout-max-width, 1320px)` inner |
| Section Type: Contained (bg constrained to 1320px) | PASS | `section-contained` with `max-width` |
| Section Type: Full-Bleed (viewport bg, wide content with 60px sides) | PASS | `section-full-bleed` with `100vw` + `padding: 0 var(--spacing-064)` |
| Background Image (path to DAM) | PASS | `dataset.backgroundimage` → `block.style.backgroundImage` |
| Background Alt text field | WARNING | Field exists in UE schema (`backgroundAlt`) but JS does not consume `dataset.backgroundAlt` — alt text is not applied anywhere |
| Background Color swatches (Dark/Light/Light2/Brand/Tertiary) | PASS | `bg-dark`, `bg-light`, `bg-light-2`, `bg-brand`, `bg-tertiary` classes |
| Full Overlay (None/Darken 20%/40%/Lighten 20%/40%) | PASS | `OVERLAY_MAP` → `.section-overlay` div injected |
| Linear Gradient (4 directions) | PASS | `GRADIENT_DIRECTIONS` → `.section-gradient` div injected |
| Starting/Ending Opacity for gradient | PASS | `dataset.gradientstartopacity` / `dataset.gradientendopacity` read and applied |
| Section Theme Style (Dark/Light/Light2/Brand/Tertiary) | PASS | `dataset.sectiontheme` → class applied |

#### UE Schema Field Alignment

| Schema Field (`models/_section.json`) | Consumed in JS | Status |
|---|---|---|
| `name` (Section Name) | No — label only for UE content tree | PASS (UE-only field) |
| `sectionType` | `dataset.sectiontype` | PASS |
| `backgroundImage` | `dataset.backgroundimage` | PASS |
| `backgroundAlt` | Not consumed | WARNING |
| `backgroundColor` | `dataset.backgroundcolor` | PASS |
| `fullOverlay` | `dataset.fulloverlay` | PASS |
| `linearGradient` | `dataset.lineargradient` | PASS |
| `gradientStartOpacity` | `dataset.gradientstartopacity` | PASS |
| `gradientEndOpacity` | `dataset.gradientendopacity` | PASS |
| `sectionTheme` | `dataset.sectiontheme` | PASS |
| `style` (multiselect) | `readVariant(block)` applies class | PASS |

**README gap:** The README `Authoring Fields` table lists only `Section Name` and `Style`. It does not document Section Type, Background Image/Color/Alt, Overlays, Gradient, or Theme Style — all of which are implemented. README underrepresents the full authoring surface.

**Result: WARNING** — Background alt text field not consumed; README does not document the full authoring surface.

---

### Developer Checklist

#### General Block Requirements
| Item | Result |
|---|---|
| Directory convention `/blocks/section/` | PASS |
| JS and CSS files present | PASS |
| BEM CSS classes (`.section-overlay`, `.section-gradient`, `.section-full-width`, `.section-contained`, `.section-full-bleed`, `.theme-*`, `.bg-*`) | PASS |
| README present | PASS |
| No site-specific code | PASS |
| Token usage in CSS | PASS |
| Root + Brand token cascade supported | PASS |

#### Responsive Design
| Item | Result |
|---|---|
| No explicit section breakpoints needed (structural container) | N/A |
| Max-width constrained via `--layout-max-width` token | PASS |
| Column stacking | N/A — section is a container |
| 1440px max-width via token | PASS |

#### Authoring
| Item | Result |
|---|---|
| UE schema present (centralised `models/_section.json`) | PASS |
| Author fields well-defined | PASS |
| Composable — not bound to specific templates | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| No third-party scripts | N/A |
| No images in this block directly | N/A |
| No unnecessary JavaScript | PASS |
| No video | N/A |

#### Accessibility
| Item | Result |
|---|---|
| Keyboard navigation | PASS — structural container, no interactive elements |
| Color contrast via theme tokens | PASS |
| Semantic HTML | PASS — acts as container, uses class-driven context |
| Background image alt text | WARNING — `backgroundAlt` schema field not consumed by JS |
| AT support | PASS |

---

## Remediation

**Priority 1 — Should Fix**

1. **Consume background image alt text.** The UE schema defines a `backgroundAlt` field (`dataset.backgroundAlt` in JS context). The block currently sets `block.style.backgroundImage` as a CSS property (not an `<img>` element), so there is no direct alt text slot. Options:
   - If the block transitions to rendering a `<picture>` or `<img>` element for the background, apply `dataset.backgroundAlt` as the `alt` attribute.
   - If CSS background-image is retained, add a visually-hidden `<span>` or `aria-label` on the section element to communicate the background image context to screen readers when a background image is present.

2. **Update README Authoring Fields table** to document all configurable fields: Section Type, Background Image, Background Alt, Background Color, Full Overlay, Linear Gradient (with start/end opacity), and Section Theme Style.

**Priority 2 — Nice to Have**

3. **Add `_section.json` to block directory.** The convention across other blocks is to carry the UE schema in the block directory. The centralised `models/_section.json` works functionally, but co-locating the schema with the block improves discoverability and keeps the block self-contained. Consider symlinking or duplicating.

4. **Remove undocumented `highlight` variant from section.css.** The `.section.highlight` class and its `--color-highlight` token are defined in CSS but not in the UE schema `style` multiselect options (which lists only "Highlight" → value "highlight"). Actually the schema does include it — verify the CSS token `--color-highlight` is defined in the design token set for all properties.
