# Block Audit Report: ugc-gallery
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | FAIL |
| Pattern A Compliance | WARNING |
| CSS Token Usage | WARNING (1 violation) |
| Spec Alignment | WARNING |
| Developer Checklist | 11/21 items passed |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `ugc-gallery.js` | required | YES |
| `ugc-gallery.css` | required | YES |
| `ugc-gallery.scss` | expected | YES |
| `README.md` | expected | NO |
| `ticket-details.md` | expected | NO |
| `_ugc-gallery.json` | expected | NO — absent from block directory and `/models/` fallback |

All three optional/expected files are absent. The block has clearly configurable fields (`widgetId`, `pixleeApiKey`, `pixleeScript`) consumed via `readBlockConfig`, but no UE schema exists to expose them in Universal Editor.

**Result: FAIL** — README, `ticket-details.md`, and `_ugc-gallery.json` all missing.

---

### Pattern A Compliance

**2a. Export signature**

```js
export function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.UgcGallery?.hooks);
```

Named export with `options = {}` default: PASS. Default export wired to `window.UgcGallery?.hooks`: PASS. PascalCase `UgcGallery` matches block name: PASS.

**2b. Lifecycle hooks and events**

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('ugc-gallery:before', { detail: ctx, bubbles: true }));
// ... block logic ...
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('ugc-gallery:after', { detail: ctx, bubbles: true }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS — present in both the early-return path (no `widgetId`) and the normal path. Events with `bubbles: true`: PASS.

`readVariant(block)` not called — WARNING. Pattern A requires `readVariant` to be called. The block has no defined variants today but the call is required for forward compatibility and Pattern A compliance.

**2c. Imports**

```js
import { readBlockConfig, loadScript } from '../../scripts/aem.js';
```

Correct relative path. PASS. `readBlockConfig` is used to extract `widgetId`, `pixleeApiKey`, and `pixleeScript`. `loadScript` is used in `loadUgc()` to load the Pixlee third-party script. Both imports are correct and used.

Note: `loadDelayed` (a function declaration) is called on line 34 but defined on line 55. Function declarations are hoisted in JavaScript — this works correctly at runtime.

**2d. No site-specific code**

The block integrates with Pixlee (now Emplifi), a specific third-party UGC platform. `window.Pixlee`, `Pixlee.init`, `Pixlee.addSimpleWidget`, and `Pixlee.resizeWidget` are hard-coded vendor API calls. The widget ID, API key, and script URL are configurable via block config, so no credential or URL is hard-coded — PASS on that front. However, the vendor name `Pixlee` is hard-coded throughout and cannot be swapped at the brand level without modifying this base block. This is inherent to the block's purpose (a Pixlee integration block) but is a coupling concern.

**Result: WARNING** — `readVariant` not imported or called; Pixlee vendor coupling in base block (acceptable for this block's purpose, but documented).

---

### CSS Token Audit

Scanning `ugc-gallery.scss`:

```scss
.ugc-gallery-wrapper {
  position: relative;
  z-index: 0;
  min-height: 400px;   /* Line 4 — VIOLATION */
  contain: content;
}

.ugc-gallery-container h2 {
  font-size: var(--heading-font-size-xxl);
  line-height: var(--heading-line-height-xxxl);
}
```

**Violations:**

| Line | Value | Issue | Suggested Fix |
|---|---|---|---|
| 4 | `min-height: 400px` | Hard-coded pixel spacing value — not a structural zero or `1px` border | `min-height: var(--ugc-gallery-min-height, 400px)` |

- `z-index: 0` — exempt (value is `0`).
- `font-size: var(--heading-font-size-xxl)` — token. PASS.
- `line-height: var(--heading-line-height-xxxl)` — token. PASS.

**Result: WARNING (1 violation)**

---

### Spec Alignment

No `ticket-details.md` or `README.md` present. Assessment is based on the code implementation and general solution design context.

**Inferred use cases**

| Use Case | Implemented | Notes |
|---|---|---|
| Embed Pixlee/Emplifi UGC widget | PASS | `Pixlee.addSimpleWidget({ containerId, widgetId })` called |
| Deferred/lazy loading until viewport entry | PASS | `IntersectionObserver` with 500ms delay in `loadDelayed()` |
| Configurable widget ID (required) | PASS | Read from `readBlockConfig(block).widgetId` |
| Configurable Pixlee API key | PASS | Read from `readBlockConfig(block).pixleeApiKey` |
| Configurable script source URL | PASS | Read from `readBlockConfig(block).pixleeScript` |
| Graceful no-op when widgetId absent | PASS | Early return path with after-hooks dispatched |
| Unique container ID per block instance | PASS | `ugc-${ugcNumber}` module-level counter |
| UE schema for author configuration | FAIL | No `_ugc-gallery.json`; authors must use raw key-value rows |
| README documentation | FAIL | Absent |
| Variant support | FAIL | `readVariant` not called |

**Result: WARNING** — Core Pixlee integration logic is correctly implemented; authoring infrastructure (UE schema, documentation) is entirely absent.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/ugc-gallery/` convention
- [PASS] `ugc-gallery.js` and `ugc-gallery.css` present
- [PASS] BEM-style CSS classes (`.ugc-gallery-wrapper`, `.ugc-gallery-container`)
- [FAIL] README missing
- [PASS] No hard-coded credentials or site-specific URLs
- [PASS] Token usage for font-size and line-height
- [FAIL] `min-height: 400px` — hard-coded pixel value, not a token
- [FAIL] `readVariant` not called — variant classes cannot be applied

#### Responsive Design
- [FAIL] No responsive breakpoints — `min-height: 400px` is not responsive; no layout adjustments for different viewports
- [PASS] Block is a passthrough container; Pixlee widget manages its own internal layout
- [N/A] No column stacking needed
- [N/A] No max-width constraint needed for third-party widget wrapper

#### Authoring Contract
- [FAIL] No `_ugc-gallery.json` UE schema — `widgetId`, `pixleeApiKey`, `pixleeScript` cannot be configured in Universal Editor
- [FAIL] No README documenting authoring fields or block purpose
- [PASS] Composable — can be placed in any section
- [PASS] Structure/content/presentation decoupled (config read via `readBlockConfig`)
- [N/A] CF integration not required

#### Performance
- [PASS] Third-party script deferred via IntersectionObserver with 500ms delay
- [PASS] No script loaded until widget enters viewport
- [PASS] No unnecessary JS execution at page load
- [N/A] No images or video managed by this block

#### Accessibility
- [FAIL] No accessible fallback when `widgetId` is missing or Pixlee script fails — block is empty
- [FAIL] No `role` or `aria-label` on the widget container to provide an accessible landmark
- [FAIL] No loading state communicated to assistive technologies during deferred load
- [PASS] `block.id` is set correctly for Pixlee's container reference

**Checklist: 11/21 applicable items** (7 FAIL)

---

## Remediation

### Priority 1 — Blocking (required for GO)

1. **Create `_ugc-gallery.json` UE schema.** Define a model with:
   - `widgetId` (text, required) — Pixlee widget ID
   - `pixleeApiKey` (text, optional) — Pixlee API key
   - `pixleeScript` (text, optional) — Custom script URL override
   Without this, authors cannot configure the block from Universal Editor.

2. **Create `README.md`.** Document the block's purpose (Pixlee/Emplifi UGC gallery widget embed), authoring fields, configuration requirements, lazy loading behavior, and any environment-specific setup notes.

3. **Create `ticket-details.md`.** Add the ADO ticket requirements to establish the formal specification record.

### Priority 2 — Pattern A (WARNING)

4. **Import and call `readVariant(block)`** in `decorate()`. Add `import { readVariant } from '../../scripts/scripts.js';` and call `readVariant(block);` between the before-event dispatch and block logic.

### Priority 3 — CSS Tokens (WARNING)

5. **Replace `min-height: 400px`** (line 4 in both `.scss` and `.css`) with `min-height: var(--ugc-gallery-min-height, 400px)` to allow brand-level override of the reserved widget height.

### Priority 4 — Accessibility

6. **Add accessible landmark** to the widget container. Add `role="region"` and `aria-label="User-generated content gallery"` (or equivalent) to the `.ugc-gallery-wrapper` element.

7. **Add accessible fallback.** When Pixlee fails to load or `widgetId` is absent, ensure the container is not silently empty. Consider a visually-hidden fallback message or a visible loading/error indicator.
