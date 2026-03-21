# Block Audit Report: text
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | WARNING |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | PASS |
| Developer Checklist | 17/20 items passed |
| Accessibility Basics | PASS |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `text.js` | yes | yes |
| `text.css` | yes | yes |
| `text.scss` | yes | yes |
| `README.md` | yes | yes |
| `ticket-details.md` | not present | NO |
| `_text.json` | not required (no author-configurable fields) | N/A |

The text block has no author-configurable fields — content is edited inline via the Universal Editor rich text editor, so no UE JSON schema is expected. The README correctly documents this. `ticket-details.md` is absent; the solution design specifies this as a boilerplate block with no known authoring customisation route.

**Result: WARNING** — `ticket-details.md` absent.

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
block.dispatchEvent(new CustomEvent('text:before', { detail: ctx }));
// ... block logic (no DOM changes) ...
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('text:after', { detail: ctx }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS.

**WARNING — events missing `bubbles: true`:**
Both `text:before` and `text:after` are dispatched without `{ bubbles: true }`. All other blocks in this codebase dispatch their lifecycle events with `bubbles: true`. Omitting `bubbles` means parent elements cannot listen for these events via event delegation, which breaks the extensibility contract.

`readVariant(block)` is not called. For the text block this is acceptable — there are no documented variants and the block's CSS does not apply variant-based classes. PASS (N/A).

**2c. Imports**

No imports — the text block has no dependencies. This is correct for a content-passthrough block.

**2d. No site-specific code**

No logic at all — PASS.

**Result: WARNING** — `bubbles: true` missing on both lifecycle events.

---

### CSS Token Audit

Scanning `text.scss`:

```scss
.text {
  max-width: var(--layout-max-width-content);
}
```

Single rule uses a layout token. No violations.

**Result: PASS (0 violations)**

---

### Spec Alignment

Source of truth: solution design and README (no `ticket-details.md`).

**4a. Use cases**

| Use Case | Implemented? | Notes |
|---|---|---|
| Rich text content on all pages | YES | AEM renders rich text directly; block is a passthrough with max-width constraint |
| Standalone or within other components | YES | Block is composable |
| No known route to enhance or modify (per solution design) | YES | Block correctly defers to AEM's built-in rich text rendering |

**4b. Configurable fields**

None expected — the solution design explicitly states "No known route to enhance or modify" for the Text component. The README correctly documents inline editing only.

**4c. Design details**

The single CSS rule constrains text content to `--layout-max-width-content`, which is the appropriate content-width token. This is correct.

**Result: PASS**

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/text/` convention
- [PASS] Has `text.js` with `decorate(block)` export
- [PASS] Has `text.css`
- [PASS] BEM-style CSS — single rule, no child elements requiring BEM (appropriate for this block)
- [PASS] README documents use cases and configuration
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [PASS] Uses semantic design tokens
- [PASS] Supports Root + Brand token cascade

#### Responsive Design
- [PASS] Content fluidly expands within `--layout-max-width-content` constraint
- [PASS] No fixed-width values
- [N/A] No columns to stack
- [PASS] No hard max-width; relies on token

#### Authoring Contract
- [PASS] Works with Universal Editor inline editing
- [PASS] No configurable fields needed — documented correctly
- [PASS] Composable — used standalone and embedded in other blocks
- [PASS] Structure/content/presentation decoupled
- [N/A] No Content Fragment integration

#### Performance
- [N/A] No third-party scripts
- [N/A] No images
- [PASS] No JavaScript beyond lifecycle hooks (minimal and correct)
- [N/A] No video

#### Accessibility (WCAG 2.1)
- [PASS] Keyboard navigation — no interactive elements; text content is natively accessible
- [PASS] Color contrast — inherits from tokens
- [PASS] Semantic HTML — renders author content as-is
- [PASS] Assistive technology compatible
- [FAIL] `bubbles: true` missing on events — breaks event delegation for parent-level accessibility enhancements

**Checklist: 17/20 applicable items passed (1 FAIL, 1 WARNING)**

---

## Remediation

**Priority 1 — High**

1. **Add `bubbles: true` to both lifecycle events.** This is a convention violation that breaks the extensibility contract:
   ```js
   // Change:
   block.dispatchEvent(new CustomEvent('text:before', { detail: ctx }));
   // To:
   block.dispatchEvent(new CustomEvent('text:before', { detail: ctx, bubbles: true }));
   ```
   Apply the same fix to `text:after`.

**Priority 2 — Low**

2. **Add `ticket-details.md`.** For consistency with the block directory convention used across this codebase, a minimal `ticket-details.md` should be added (even if it simply references the solution design and notes that the block has no author-configurable fields).
