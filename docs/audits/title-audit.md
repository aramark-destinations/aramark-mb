# Block Audit Report: title
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | PASS |
| Developer Checklist | 18/20 items passed |
| Accessibility Basics | PASS |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `title.js` | yes | yes |
| `title.css` | yes | yes |
| `title.scss` | yes | yes |
| `README.md` | yes | yes |
| `ticket-details.md` | yes | yes |
| `_title.json` | expected (has author-configurable fields) | NO |

The block has two documented authoring fields: Title (text) and Title Type (heading level select). The README's Authoring Fields table documents these. However, no `_title.json` UE schema exists to expose these fields in Universal Editor.

**Result: WARNING** — UE JSON schema missing despite documented author-configurable fields.

---

### Pattern A Compliance

**2a. Export signature**

```js
export function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.Title?.hooks);
```

Named export with `options = {}` default: PASS. Default export wired to `window.Title?.hooks`: PASS. PascalCase `Title` matches block name: PASS.

**2b. Lifecycle hooks and events**

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('title:before', { detail: ctx, bubbles: true }));
// ... block logic ...
readVariant(block);
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('title:after', { detail: ctx, bubbles: true }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS. Events with `bubbles: true`: PASS. `readVariant(block)` called: PASS.

**2c. Imports**

```js
import { readVariant } from '../../scripts/scripts.js';
```

Correct path. PASS. No `aem.js` imports needed — correct for this block.

**2d. No site-specific code**

No brand-specific logic. PASS.

**Result: PASS**

---

### CSS Token Audit

Scanning `title.scss`:

```scss
.title {
  h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
  }
}

.section.dark,
.section.brand,
.section.tertiary {
  .title {
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-light-1);
    }
  }
}
```

`margin-top: 0` — zero value is explicitly exempted per skill rules. PASS.
`color: var(--text-light-1)` — token reference. PASS.

No violations.

**Result: PASS (0 violations)**

---

### Spec Alignment

Source of truth: `ticket-details.md` and README.

**4a. Use cases**

| Use Case | Implemented? | Notes |
|---|---|---|
| Configurable heading level (H1–H4) | YES | README documents H1–H4 via `titleType` field; AEM applies heading tag |
| Section theme Dark = Text/Light/1 | YES | `.section.dark .title` applies `var(--text-light-1)` |
| Section theme Light = Text/Dark/1 | YES | Inherited from body (no override needed) |
| Section theme Light2 = Text/Dark/1 | YES | Inherited from body |
| Section theme Brand = Text/Light/1 | YES | `.section.brand .title` applies `var(--text-light-1)` |
| Section theme Tertiary = Text/Light/1 | YES | `.section.tertiary .title` applies `var(--text-light-1)` |
| Variant support (e.g., `title-centered`) | YES | `readVariant(block)` called in `decorate()` |

**4b. Configurable fields**

The README documents two fields:
- `Title` (text) — heading text content
- `Title Type` (select: h1, h2, h3, h4)

Neither field is defined in a `_title.json` UE schema. The README notes that `titleType` is "applied by AEM as the heading tag" — this suggests these fields may be handled natively by AEM's Universal Editor text/title component rather than through a custom block model. However, per the skill convention, a UE schema should be present if there are author-configurable fields.

**4c. Design details**

The `ticket-details.md` references Figma design for base styling and lists theme color values. The CSS implementation matches the specified color tokens per theme:
- `Text/Light/1` → `var(--text-light-1)` for dark/brand/tertiary themes
- Default/light/light2 → inherits body default (Text/Dark/1)

One minor gap: `ticket-details.md` and README both reference a "Light 2" theme class (`light2`), but the CSS targets `.section.dark`, `.section.brand`, `.section.tertiary` — there is no special rule for `.section.light` or `.section.light-2`, as these inherit correctly. This is intentional (correct by inheritance) but could be documented more explicitly in the README.

**Result: PASS**

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/title/` convention
- [PASS] Has `title.js` with `decorate(block)` export
- [PASS] Has `title.css`
- [PASS] BEM-style CSS — `.title` is the block class; heading elements are standard HTML, BEM element classes not needed here
- [PASS] README documents use cases, authoring fields, section themes, and customization
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [PASS] Uses semantic design tokens exclusively
- [PASS] Supports Root + Brand token cascade via `--text-light-1`

#### Responsive Design
- [PASS] No fixed-width constraints; heading content is naturally fluid
- [PASS] No column structures in this block
- [N/A] No columns to stack
- [PASS] No layout max-width override needed

#### Authoring Contract
- [FAIL] No `_title.json` UE schema despite documented author-configurable fields (Title text, Title Type heading level)
- [PASS] Author-facing fields documented in README
- [PASS] Composable — used standalone and within other components
- [PASS] Structure/content/presentation decoupled
- [N/A] No Content Fragment integration

#### Performance
- [N/A] No third-party scripts
- [N/A] No images
- [PASS] Minimal JavaScript — single `readVariant` call, correct
- [N/A] No video

#### Accessibility (WCAG 2.1)
- [PASS] Keyboard navigation — no interactive elements
- [PASS] Color contrast — theme tokens manage light/dark contrast
- [PASS] Semantic HTML — native heading elements rendered by AEM
- [PASS] Assistive technology compatible
- [N/A] No image alt text concerns

**Checklist: 18/20 applicable items passed (1 FAIL)**

---

## Remediation

**Priority 1 — Blocking**

1. **Create `_title.json` UE schema.** The block has two author-configurable fields documented in the README: Title text and Title Type (heading level). Without a UE schema, these fields are not exposed in Universal Editor. A minimal model should define:
   - `title` (text field) — heading text
   - `titleType` (select: h1, h2, h3, h4) — heading level

**Priority 2 — Low**

2. **README clarification on Light/Light2 themes.** The README lists `light` and `light2` in the Section Themes table with `--text-dark-1` tokens, but notes they are "inherited from body." Consider adding a comment in the CSS to make this explicit, or add explicit rules for completeness.
