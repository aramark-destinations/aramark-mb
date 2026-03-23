# Block Audit Report: text
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | WARNING |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 16/19 items passed |

## Overall: GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `text.js` | required | YES |
| `text.css` | required | YES |
| `text.scss` | expected | YES |
| `README.md` | expected | YES |
| `ticket-details.md` | expected | NO |
| `_text.json` | expected | YES — in `/models/_text.json` (fallback location) |

The UE schema at `/models/_text.json` has an empty `"models": []` array, which is correct — the text block has no author-configurable fields and is edited inline. `ticket-details.md` is absent from the block directory.

**Result: WARNING** — `ticket-details.md` missing; `_text.json` only in fallback `/models/` location, not in block directory.

---

### Pattern A Compliance

**2a. Export signature**

```js
export function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.Text?.hooks);
```

Named export with `options = {}` default: PASS. Default export wired to `window.Text?.hooks`: PASS. PascalCase `Text` matches block name: PASS.

**2b. Lifecycle hooks and events**

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('text:before', { detail: ctx, bubbles: true }));
// ... block logic (no DOM manipulation) ...
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('text:after', { detail: ctx, bubbles: true }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS. Events with `bubbles: true`: PASS.

`readVariant(block)` not called — WARNING. Pattern A requires `readVariant` to be called for variant class support. The text block has no defined variants today, but omitting the call means variant classes authored via UE will never be applied without a code change.

**2c. Imports**

No imports present. This is consistent with the block's intent — it is a content-passthrough block that requires no EDS utilities. However, `readVariant` from `../../scripts/scripts.js` should be imported and called per Pattern A.

**2d. No site-specific code** — PASS. No brand names, hard-coded URLs, or property-specific values.

**Result: WARNING** — `readVariant` not imported or called.

---

### CSS Token Audit

Scanning `text.scss`:

```scss
.text {
  max-width: var(--layout-max-width-content);
}
```

Single rule uses a layout token exclusively. No hard-coded colors, font sizes, spacing values, font families, font weights, border radii, z-index values, box shadows, or transition durations.

**Result: PASS (0 violations)**

---

### Spec Alignment

No `ticket-details.md` present. Assessment uses README as the specification source.

**Use cases**

| Use Case | Implemented | Notes |
|---|---|---|
| Rich text content rendered by AEM | PASS | Block is a passthrough; no DOM manipulation needed |
| Max-width content constraint | PASS | `max-width: var(--layout-max-width-content)` in CSS |
| Lifecycle hooks (onBefore/onAfter) | PASS | Both hooks present and dispatched |
| Before/after events with bubbling | PASS | `bubbles: true` on both events |
| UE inline editing (no field model) | PASS | `/models/_text.json` has empty model array |
| Property override support | PASS | README documents `/brands/{property}/blocks/text/text.js` path |

**Field alignment**

No author-configurable fields defined or expected. The README correctly documents inline UE editing with no field model.

**Result: WARNING** — Formal requirements cannot be verified without `ticket-details.md`; README and model are internally consistent.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/text/` convention
- [PASS] `text.js` and `text.css` present
- [PASS] BEM CSS class (`.text`)
- [PASS] README documents use cases and customization points
- [PASS] No site-specific code
- [PASS] Token-only CSS
- [PASS] Root+Brand cascade supported (single token)
- [FAIL] `readVariant` not called — variant class support absent

#### Responsive Design
- [PASS] Fluid content — single max-width token constraint, no fixed widths
- [N/A] No responsive breakpoints needed for a text-only block
- [N/A] No column stacking
- [N/A] Max-width delegated to layout token

#### Authoring Contract
- [PASS] UE inline editing (no field model needed; correct per design)
- [PASS] Composable — can be placed in any section or container
- [PASS] Structure/content/presentation decoupled
- [N/A] CF integration not required

#### Performance
- [PASS] No JavaScript beyond lifecycle hooks
- [N/A] No third-party scripts, images, or video

#### Accessibility
- [PASS] Semantic HTML — AEM renders native rich text elements
- [N/A] No interactive elements requiring keyboard navigation
- [N/A] Color contrast managed by global tokens
- [N/A] Alt text managed by AEM rich text editor

**Checklist: 16/19 applicable items** (1 FAIL on readVariant)

---

## Remediation

### Priority 1 — Pattern A (WARNING)

1. **Import and call `readVariant(block)`** in `text.js`. Add `import { readVariant } from '../../scripts/scripts.js';` and call `readVariant(block);` inside `decorate()` between the before-event dispatch and the after-event dispatch. This is required for Pattern A compliance and enables variant classes to be applied when authors assign them.

### Priority 2 — Structure (WARNING, low severity)

2. **Add `ticket-details.md`** to `blocks/text/`. Even a minimal file that records the ADO ticket reference and confirms "no author-configurable fields" satisfies the block directory convention.

3. **Consider copying `_text.json` into `blocks/text/`** if the codebase convention requires the UE schema to live alongside the block files. The current placement in `/models/` is a valid fallback but diverges from blocks that carry their own schema.
