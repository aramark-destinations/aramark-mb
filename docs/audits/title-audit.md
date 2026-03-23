# Block Audit Report: title
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | PASS |
| Developer Checklist | 19/21 items passed |

## Overall: GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `title.js` | required | YES |
| `title.css` | required | YES |
| `title.scss` | expected | YES |
| `README.md` | expected | YES |
| `ticket-details.md` | expected | YES |
| `_title.json` | expected | YES — in `/models/_title.json` (fallback location) |

All required files are present. The UE schema (`_title.json`) is in the `/models/` fallback directory rather than in the block directory itself. It contains a correct `title` model with `title` (text) and `titleType` (select) fields.

**Result: WARNING** — `_title.json` only in fallback `/models/` location, not co-located in block directory.

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
readVariant(block);
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('title:after', { detail: ctx, bubbles: true }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS. Events with `bubbles: true`: PASS. `readVariant(block)` called: PASS. All six Pattern A lifecycle requirements are met.

**2c. Imports**

```js
import { readVariant } from '../../scripts/scripts.js';
```

Correct relative path. PASS. No other EDS utility imports required for this block.

**2d. No site-specific code** — PASS. No brand names, hard-coded URLs, or property-specific values. The `ticket-details.md` contains Figma links for documentation purposes only; these do not appear in the block code.

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

- `margin-top: 0` — value is `0`; exempt per audit rules.
- `color: var(--text-light-1)` — uses design token. PASS.

No hard-coded colors, font sizes, spacing values, font families, font weights, border radii, z-index values, box shadows, or transition durations.

**Result: PASS (0 violations)**

---

### Spec Alignment

Source of truth: `ticket-details.md` and README.

**Use cases**

| Use Case | Implemented | Notes |
|---|---|---|
| Heading block with UE Title component | PASS | `_title.json` defines `title` model with AEM component type |
| Author selects heading level (h1–h4) | PASS | `titleType` select field with h1/h2/h3/h4 options |
| Author edits heading text | PASS | `title` text field in model |
| Dark theme → Text/Light/1 | PASS | `.section.dark .title h1...h6 { color: var(--text-light-1) }` |
| Brand theme → Text/Light/1 | PASS | `.section.brand .title h1...h6 { color: var(--text-light-1) }` |
| Tertiary theme → Text/Light/1 | PASS | `.section.tertiary .title h1...h6 { color: var(--text-light-1) }` |
| Light/Light2/default → Text/Dark/1 | PASS | Inherited from body styles; no override needed |
| Figma design token alignment | PASS | All theme colors map to design tokens |

**UE schema field alignment**

| README field | `/models/_title.json` field | Match |
|---|---|---|
| Title (text) | `title` — component: text | PASS |
| Title Type (select, h1–h4) | `titleType` — component: select, options: h1/h2/h3/h4 | PASS |

**Result: PASS** — All ticket requirements implemented; UE schema matches documented authoring fields.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/title/` convention
- [PASS] `title.js` and `title.css` present
- [PASS] BEM CSS class (`.title`)
- [PASS] README documents use cases, authoring fields, section themes, and customization
- [PASS] No site-specific code
- [PASS] Token-only CSS
- [PASS] Root+Brand cascade supported via `--text-light-1`
- [PASS] `readVariant` called — variant classes (e.g., `title-centered`) can be applied

#### Responsive Design
- [PASS] Fluid content — heading elements are naturally responsive
- [N/A] No fixed-width values or responsive breakpoints needed
- [N/A] No column stacking
- [N/A] Max-width delegated to parent layout

#### Authoring Contract
- [PASS] UE in-context editing — `_title.json` model with `title` and `titleType` fields
- [PASS] Clear authoring fields — well-labelled in model
- [PASS] Composable — placed standalone or embedded in other blocks
- [PASS] Structure/content/presentation decoupled
- [N/A] CF integration not required

#### Performance
- [PASS] Minimal JavaScript — single `readVariant` call plus lifecycle hooks
- [N/A] No third-party scripts, images, or video

#### Accessibility
- [PASS] Semantic HTML — AEM renders native `h1`–`h4` heading elements
- [PASS] Color contrast — theme tokens align light/dark contrast pairs per design
- [N/A] No interactive elements requiring keyboard navigation

**Checklist: 19/21 applicable items** (0 FAIL)

---

## Remediation

### Priority 1 — Structure (WARNING, low severity)

1. **Consider co-locating `_title.json` in `blocks/title/`** if the project convention requires the UE schema to live alongside the block files. The current location in `/models/` is a supported fallback but differs from blocks that carry their own schema. Confirm the intended convention and apply consistently across the codebase.

### Priority 2 — Documentation (minor)

2. **Add CSS comment for Light/Light2 theme inheritance.** The README's Section Themes table correctly lists `light` and `light2` as inheriting `--text-dark-1` from the body. Adding a brief CSS comment in `title.scss` to make this explicit (e.g., `/* .section.light and .section.light2 inherit body default -- no rule needed */`) would aid future maintainers.
