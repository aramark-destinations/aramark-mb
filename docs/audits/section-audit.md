# Block Audit Report: section
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (3 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/22 items passed |
| Accessibility Basics | PASS |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `section.js` | yes | yes |
| `section.css` | yes | yes |
| `section.scss` | yes | yes |
| `README.md` | yes | yes |
| `ticket-details.md` | yes | yes |
| `_section.json` | expected (block has author-configurable fields) | NO |

The block has a rich set of author-configurable fields (Section Type, Background Color, Opacity Overlays, Linear Gradient, Section Theme Style) all described in `ticket-details.md`, but no `_section.json` UE schema file exists. This is a structural gap — the authoring contract is not formally defined.

**Result: WARNING** — UE JSON schema missing.

---

### Pattern A Compliance

**2a. Export signature**

```js
export function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.Section?.hooks);
```

Named export with `options = {}` default: PASS. Default export wired to `window.Section?.hooks`: PASS. PascalCase matches block name (`Section`): PASS.

**2b. Lifecycle hooks and events**

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('section:before', { detail: ctx, bubbles: true }));
// ... block logic ...
readVariant(block);
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('section:after', { detail: ctx, bubbles: true }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS. `section:before`/`section:after` events with `bubbles: true`: PASS. `readVariant(block)` called: PASS.

**2c. Imports**

Only `readVariant` from `../../scripts/scripts.js` is imported. Appropriate for this block's needs. No use of `aem.js` utilities, which is correct since the block reads from `dataset` attributes rather than block config rows.

**2d. No site-specific code**

No brand-specific logic detected. Overlay/gradient values are computed from configurable data attributes. PASS.

**Result: PASS**

---

### CSS Token Audit

Scanning `section.scss`:

**Violations:**

Line 44 (`.section.bg-light`): `background-color: var(--color-neutral-50, #fff)`
  Suggested: `background-color: var(--color-neutral-50)` — the `#fff` fallback is a hard-coded color value embedded in a token reference. The fallback should itself reference another token, not a raw hex value.

Line 48 (`.section.bg-light-2`): `background-color: var(--color-neutral-100, #f5f5f5)`
  Suggested: `background-color: var(--color-neutral-100)` — same pattern; `#f5f5f5` is a hard-coded fallback.

Line 69 (`.section.theme-dark`): `--section-text-color: var(--color-neutral-50, #fff)` and `--section-heading-color: var(--color-neutral-50, #fff)`
  Suggested: remove `#fff` fallbacks and rely solely on the token.

Note: Hex values used as `var()` fallbacks in `:root`-like local custom property declarations are borderline; however since these appear in rule blocks (not a `:root` block) and the fallback is a raw color, they are flagged.

**Result: WARNING (3 violations)**

---

### Spec Alignment

Source of truth: `ticket-details.md`

**4a. Use cases**

| Use Case | Implemented? | Notes |
|---|---|---|
| Section Type: Full-width (viewport bg, constrained inner) | YES | `section-full-width` adds `100vw` + inner `max-width` |
| Section Type: Contained (max grid width) | YES | `section-contained` sets `max-width` |
| Section Type: Full-Bleed (viewport bg, near-full content) | YES | `section-full-bleed` sets `100vw` + `padding: 0 var(--spacing-064)` |
| Background Image | YES | Applied via `block.style.backgroundImage` from `dataset.backgroundimage` |
| Background Color swatches (Dark/Light/Light2/Brand/Tertiary) | YES | `bg-dark`, `bg-light`, `bg-light-2`, `bg-brand`, `bg-tertiary` classes |
| Full Overlay (Darken 20/40, Lighten 20/40) | YES | `OVERLAY_MAP` maps values to rgba and injects `.section-overlay` div |
| Linear Gradient (4 directions, start/end opacity) | YES | `GRADIENT_DIRECTIONS` + gradient div injected |
| Section Theme Style (Dark/Light/Light2/Brand/Tertiary) | YES | `.theme-dark`, `.theme-light`, etc. applied |
| Background Alt text field | NO | `ticket-details.md` specifies an "Alt" text field for the background image, but the JS reads only `dataset.backgroundimage` — no alt attribute is applied to an element or otherwise consumed |
| Background Video | NO | `ticket-details.md` references background video as a future option (implied by the background group), but there is no video background implementation in the block |

**4b. Configurable fields**

The ticket describes Section Type, Background Image, Alt, Color, Opacity Overlays, Linear Gradient (with start/end opacity), and Section Theme Style. All are consumed in JS via `dataset.*` attributes. However, no `_section.json` defines these as UE-authored fields.

**4c. Design details**

The ticket references base styling from a Figma design (Grid & Spacing, theme styles). Theme classes are present. No hard-coded pixel spacing for grid is used (relies on tokens `--layout-max-width` and `--spacing-*`).

**Result: WARNING** — Background image alt text not consumed; no background video support; UE schema missing.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/section/` convention
- [PASS] Has `section.js` with `decorate(block)` export
- [PASS] Has `section.css`
- [PASS] BEM-style CSS classes (`.section-overlay`, `.section-gradient`, `.section-full-width`, etc.)
- [PASS] README documents use cases and configuration
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [WARNING] Uses semantic design tokens — 3 raw hex fallback values in token calls
- [PASS] Supports Root + Brand token cascade

#### Responsive Design
- [WARNING] No explicit responsive breakpoints in SCSS for the section container itself (relies on child blocks for layout responsiveness — acceptable but noted)
- [PASS] Content width constrained via `--layout-max-width` token
- [N/A] Column stacking not applicable to section container
- [PASS] Respects 1440px max-width via `--layout-max-width` token

#### Authoring Contract
- [FAIL] No `_section.json` UE schema — authoring contract not formally defined
- [PASS] Author-facing fields documented in README and ticket-details.md
- [PASS] Composable — not bound to specific templates
- [PASS] Structure/content/presentation decoupled

#### Performance
- [N/A] No third-party scripts
- [N/A] No images in this block
- [PASS] No unnecessary JavaScript
- [N/A] No video in this block

#### Accessibility (WCAG 2.1)
- [PASS] Keyboard navigation — section is a structural container
- [PASS] Color contrast controlled via theme tokens
- [PASS] Semantic HTML — acts as container with contextual class names
- [PASS] No interactive elements; works with assistive technologies
- [FAIL] Background image alt text not applied (no alt text consumed from config)

**Checklist: 17/22 items passed (3 FAIL, 2 WARNING, 0 N/A counted)**

---

## Remediation

**Priority 1 — Blocking**

1. **Create `_section.json` UE schema.** The block has at least 7 configurable author fields (Section Type, Background Image, Alt, Color, Full Overlay, Linear Gradient with start/end opacity, Section Theme Style). None are currently defined in a UE model. This means authors cannot configure the block in Universal Editor.

**Priority 2 — High**

2. **Consume background image alt text.** `ticket-details.md` specifies an "Alt" field for the background image. The JS reads `dataset.backgroundimage` but never applies alt text. When a background image is set as an `<img>` element (or when the SCSS/JS solution transitions to a picture element), alt text must be applied for accessibility compliance.

3. **Remove hard-coded hex fallbacks from token calls.** Three instances of raw hex values (`#fff`, `#f5f5f5`, `#333`) are used as fallbacks inside `var()` calls. Replace with either no fallback (preferred) or another token reference:
   - Line 44: `var(--color-neutral-50, #fff)` → `var(--color-neutral-50)`
   - Line 48: `var(--color-neutral-100, #f5f5f5)` → `var(--color-neutral-100)`
   - Lines 70, 75, 82, 83: `var(--color-neutral-50, #fff)`, `var(--color-neutral-900, #000)`, `var(--color-neutral-800, #333)` → remove hex fallbacks

**Priority 3 — Medium**

4. **README gap: section type and theme fields not fully documented.** The README lists only "Section Name" and "Style" authoring fields, but the implementation supports Section Type, Background Image, Background Color, Overlays, Gradient, and Theme Style. README should be updated to reflect the full authoring surface once the UE schema is created.

5. **Background video support.** `ticket-details.md` implies background video as a background type (image, color, video are the three options described in the solution design). There is no video background implementation. This may be a planned future item but should be tracked.
