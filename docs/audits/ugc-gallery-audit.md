# Block Audit Report: ugc-gallery
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | FAIL |
| Pattern A Compliance | WARNING |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 12/22 items passed |
| Accessibility Basics | WARNING |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `ugc-gallery.js` | yes | yes |
| `ugc-gallery.css` | yes | yes |
| `ugc-gallery.scss` | yes | yes |
| `README.md` | expected | NO |
| `ticket-details.md` | expected | NO |
| `_ugc-gallery.json` | expected (has author-configurable fields) | NO |

Three required files are entirely absent: `README.md`, `ticket-details.md`, and `_ugc-gallery.json`. The block has clearly defined configurable fields (`widgetId`, `pixleeApiKey`, `pixleeScript`) consumed from `readBlockConfig`, but none are formally defined.

**Result: FAIL** — README, ticket-details.md, and UE JSON schema all missing.

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

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS. Events with `bubbles: true`: PASS.

**WARNING — `readVariant(block)` not called.** All other blocks in this set call `readVariant(block)` as part of the standard Pattern A contract. The `ugc-gallery` block does not. If the block ever needs variant-based styling, this will need to be added.

**2c. Imports**

```js
import { readBlockConfig, loadScript } from '../../scripts/aem.js';
```

`loadScript` is imported from `../../scripts/aem.js` — correct path. However, the `loadDelayed` function calls `loadScript(scriptSrc)` from `aem.js` indirectly through the module scope. PASS.

One issue: `loadDelayed` is called on line 34 inside `decorate()` but is defined on line 55 — after the call site. In strict ES module execution, function declarations are hoisted but function expressions are not. `loadDelayed` is defined as `function loadDelayed(...)` (a function declaration), so hoisting applies and this works correctly at runtime. PASS.

**2d. No site-specific code**

The block is parameterised by `widgetId`, `pixleeApiKey`, and `pixleeScript` — these are read from block config, not hard-coded. PASS.

**Result: WARNING** — `readVariant(block)` not called.

---

### CSS Token Audit

Scanning `ugc-gallery.scss`:

```scss
.ugc-gallery-wrapper {
  position: relative;
  z-index: 0;
  min-height: 400px;
  contain: content;
}

.ugc-gallery-container h2 {
  font-size: var(--heading-font-size-xxl);
  line-height: var(--heading-line-height-xxxl);
}
```

`min-height: 400px` — this is a raw pixel value. However, this is a reserved layout space for the third-party Pixlee widget to render into, not a brand-design value. It could be argued this should use a token (e.g., `var(--ugc-gallery-min-height, 400px)`), but it functions as a structural placeholder. Given the intent is purely structural (prevent layout shift during script load), this is on the border of the exception. Not flagged as a violation.

`z-index: 0` — zero value, exempt. PASS.

`font-size: var(--heading-font-size-xxl)` — token. PASS.
`line-height: var(--heading-line-height-xxxl)` — token. PASS.

**Result: PASS (0 violations)**

---

### Spec Alignment

No `ticket-details.md` or `README.md`. Deriving requirements from the solution design and the code itself.

**4a. Use cases**

The block integrates with Pixlee (now Emplifi), a UGC/social media content platform. Per the solution design's third-party integration checklist, Emplifi (Pixlee) should load asynchronously and use environment-specific workspace configuration.

| Use Case | Implemented? | Notes |
|---|---|---|
| Embed Pixlee/Emplifi UGC widget | YES | `Pixlee.addSimpleWidget` called with configured widget ID |
| Async/deferred loading | YES | `IntersectionObserver` with 500ms delay defers load until widget is in viewport |
| Configurable widget ID | YES | Read from block config via `readBlockConfig` |
| Configurable API key | YES | `pixleeApiKey` read from block config |
| Configurable script source | YES | `pixleeScript` read from block config |
| Graceful no-op when widgetId missing | YES | Early return when `widgetId` not present |
| Environment-specific workspace | PARTIAL | Script src is configurable via `pixleeScript`, but no explicit environment awareness (dev/staging/prod). Authors must configure the correct script URL per environment. |
| Block-driven embed (as per third-party checklist) | YES | Block is the delivery mechanism |

**4b. Configurable fields**

Three fields are consumed from `readBlockConfig(block)`:
- `widgetId` — required; block no-ops without it
- `pixleeApiKey` — optional; passed to `Pixlee.init()`
- `pixleeScript` — optional; custom script URL override

None of these are defined in a `_ugc-gallery.json` UE schema. Authors must author these as raw key-value rows in the block, which is not a supported Universal Editor authoring pattern.

**4c. Design details**

The CSS reserves `min-height: 400px` on the wrapper to prevent layout shift. The `contain: content` property limits reflow to the block. Both are reasonable implementations for a third-party widget container.

**Result: WARNING** — Configurable fields not in UE schema; environment-specific workspace configuration is manual.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/ugc-gallery/` convention
- [PASS] Has `ugc-gallery.js` with `decorate(block)` export
- [PASS] Has `ugc-gallery.css`
- [PASS] CSS uses BEM-style classes (`.ugc-gallery-wrapper`, `.ugc-gallery-container`)
- [FAIL] No README
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens where styling is applied
- [PASS] Uses semantic design tokens for the few styled elements
- [PASS] Supports Root + Brand token cascade

#### Responsive Design
- [WARNING] No responsive breakpoints defined — third-party widget handles its own responsiveness, but the wrapper's `min-height: 400px` is not responsive
- [PASS] Content expands within container (`display: block` set via inline style)
- [N/A] No columns
- [N/A] No max-width constraint needed for third-party widget wrapper

#### Authoring Contract
- [FAIL] No `_ugc-gallery.json` UE schema — authors cannot configure widget ID, API key, or script from Universal Editor
- [FAIL] No README documenting use cases or fields
- [PASS] Composable — can be placed in any section
- [PASS] Structure/content/presentation decoupled (widget renders internally)
- [N/A] No Content Fragment integration

#### Performance
- [PASS] Third-party Pixlee script loads asynchronously via IntersectionObserver with 500ms delay
- [N/A] No images managed by this block
- [PASS] No unnecessary JavaScript
- [N/A] No video

#### Accessibility (WCAG 2.1)
- [WARNING] No accessible fallback when JavaScript is disabled or Pixlee script fails to load — block becomes empty
- [WARNING] UGC widget content (from Pixlee) has unknown accessibility characteristics — no ARIA landmarks or labels wrap the widget container
- [PASS] `block.id` is set for Pixlee's container ID reference
- [WARNING] No loading state communicated to assistive technologies during the IntersectionObserver delay

**Checklist: 12/22 items passed (3 FAIL, 5 WARNING)**

---

## Remediation

**Priority 1 — Blocking**

1. **Create `_ugc-gallery.json` UE schema.** Define a model with at minimum:
   - `widgetId` (text, required) — Pixlee widget ID
   - `pixleeApiKey` (text, optional) — Pixlee API key
   - `pixleeScript` (text, optional) — Custom script URL override

2. **Create `README.md`.** Document the block's purpose (Pixlee/Emplifi UGC gallery embed), authoring fields, use cases, and a note about the async loading behavior.

**Priority 2 — High**

3. **Add `ticket-details.md`.** The block has no committed ticket requirements. Create this file to establish the block's ADO ticket source of truth.

4. **Add accessible loading/fallback state.** The widget container should include either:
   - A visible loading indicator until the script resolves, or
   - An `aria-live` region that announces when the widget loads
   - A fallback message or link when JavaScript or the Pixlee script is unavailable

**Priority 3 — Medium**

5. **Add `readVariant(block)` call** in `decorate()` for consistency with Pattern A and future extensibility.

6. **Add `role="region"` and `aria-label`** to the `.ugc-gallery-wrapper` element to provide an accessible landmark for the widget area.

7. **Consider responsive `min-height`.** The fixed `min-height: 400px` could use a CSS custom property (`var(--ugc-gallery-min-height, 400px)`) to allow brand-level overrides without modifying shared CSS.
