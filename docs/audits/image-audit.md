# Block Audit Report: image
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/22 items passed |

## Overall: NO-GO

## Details

### Structure

Files present:
- `image.js` — present
- `image.css` — present
- `image.scss` — present
- `README.md` — present, adequately documented
- `ticket-details.md` — present (source of truth for requirements)
- `_image.json` — **MISSING**

The UE JSON schema (`_image.json`) is absent. The `ticket-details.md` explicitly requires a Universal Editor component with author-configurable fields including an image reference, alt text field, and a "Get Alternative Text from DAM" checkbox. Without `_image.json`, the authoring contract is unimplemented at the UE configuration layer.

**Result: WARNING** — JS, CSS, and README present; UE schema missing.

### Pattern A Compliance

**2a. Export signature — PASS**
- Named export `export function decorate(block, options = {})` present.
- Default export `export default (block) => decorate(block, window.Image?.hooks)` — correct PascalCase (`Image`), correct wiring.

**2b. Lifecycle hooks and events — PASS**
- `ctx` constructed as `{ block, options }`.
- `options.onBefore?.(ctx)` fires before block logic.
- `block.dispatchEvent(new CustomEvent('image:before', { detail: ctx, bubbles: true }))` — correct, includes `bubbles: true`.
- `options.onAfter?.(ctx)` fires after block logic.
- `block.dispatchEvent(new CustomEvent('image:after', { detail: ctx, bubbles: true }))` — correct, includes `bubbles: true`.
- `readVariant(block)` called at start of block logic.

**Note:** The image block is the only one among the seven audited blocks that correctly includes `bubbles: true` on its CustomEvent dispatches. This is the expected pattern.

**2c. Imports — PASS**
- `readVariant` imported from `../../scripts/scripts.js` — correct.

**2d. No site-specific code — PASS**
- No brand names or property-specific values.

### CSS Token Audit

Scanned `image.scss` for hard-coded values.

No violations found. The CSS uses:
- `display: block` — structural, not brand-sensitive.
- `width: 100%`, `height: auto` — percentage/auto layout values, exempt.
- `border-radius: var(--image-border-radius, 0)` — uses a CSS custom property with a `0` fallback. This is correct token usage; the fallback `0` is a zero value, which is exempt.

**Result: PASS (0 violations)**

### Spec Alignment

`ticket-details.md` present — used as source of truth.

**Requirements from ticket-details.md:**
| Requirement | Implemented? | Notes |
|---|---|---|
| Image block set up in EDS codebase | YES | `image.js`, `image.css`, `image.scss` all present |
| Universal Editor component with equivalent authoring | NO | `_image.json` is missing entirely |
| Keep existing fields (Image, Alt Text) | PARTIAL | Fields handled in JS via `block.dataset.imagealt`; no UE schema to define them |
| ADD: "Get Alternative Text from DAM" checkbox | NO | No UE schema field; checkbox logic not implemented |
| When checkbox checked: alt text populated from DAM metadata, field disabled | PARTIAL | JS reads `block.dataset.imagealt` for manual override; DAM alt text is assumed present on `<img>` by default (comment in code), but the checkbox UX is not implemented |
| If unchecked: existing value remains, field becomes editable | NO | No UE schema field; checkbox behavior not implemented |
| Block output: Source element, alt text, data attributes like Card component | PARTIAL | `picture` element rendered by AEM; alt text override applied; data attribute `data-imagealt` read in JS, but full output parity with Card component not verified |
| Base styling from Figma design using tokens | PARTIAL | `border-radius: var(--image-border-radius, 0)` uses a token; broader Figma styling not evidenced |
| Border radii from Figma spec | PARTIAL | Token `--image-border-radius` is referenced but its definition is not visible in this block's files |

**4b. Configurable fields — UE schema gap:**
The `ticket-details.md` explicitly requires UE dialog fields. None are present in `_image.json` because the file does not exist. This is the primary blocking issue.

**4d. Design details:**
- The ticket requires alt text logic: DAM metadata auto-populates alt text by default, with an author override option. The JS implements the override half (`block.dataset.imagealt` → `img.alt`) but the DAM auto-populate checkbox and UE field configuration are unimplemented.
- The ticket references Figma designs for styling. The current CSS is minimal (3 properties) — additional styles per the Figma spec may not yet be implemented.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/image/` convention
- [PASS] Has `image.js` with `decorate(block)` export
- [PASS] Has `image.css`
- [PASS] BEM-style CSS — `.image` block class; `img` child selector (acceptable for single-element block)
- [PASS] README documents use cases and configuration
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [PASS] Uses semantic design tokens (`var(--image-border-radius, 0)`)
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly — `width: 100%`, `height: auto` is inherently responsive
- [PASS] Content expands within margins
- [N/A] Columns — not applicable
- [N/A] Max-width — image fills container; container controls max-width

**Authoring Contract**
- [FAIL] `_image.json` is missing — UE authoring contract is not defined
- [FAIL] "Get Alt from DAM" checkbox field not in UE schema
- [PASS] Composable
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not applicable

**Performance**
- [N/A] Third-party scripts — none
- [PASS] Images use `<picture>` element (AEM-optimized)
- [PASS] No unnecessary JavaScript
- [N/A] Video — not applicable

**Accessibility**
- [PASS] Alt text override implemented in JS via `block.dataset.imagealt`
- [WARNING] "Get Alt from DAM" checkbox not implemented — authors cannot currently verify or override DAM alt text in UE
- [PASS] `display: block` prevents inline spacing issues
- [PASS] Semantic HTML — `<picture>` and `<img>` are correct

## Remediation

**Priority 1 — Blocking**

1. Create `_image.json` with the correct UE schema. Required fields per `ticket-details.md`:
   - `image` — content reference (DAM asset)
   - `imageAlt` — text field (Alt Text)
   - `getAltFromDam` — boolean/checkbox ("Get Alternative Text from DAM"), default: `true`
2. Implement the "Get Alt from DAM" checkbox behavior in `image.js`: when `getAltFromDam` is `false` (or the data attribute indicates manual override), apply `block.dataset.imagealt` to `img.alt`. When `true`, the DAM-populated alt text on the `<img>` should be preserved (current default behavior).

**Priority 2 — Should Fix**

3. Verify full block output parity with the Card component as specified in the ticket — confirm `<source>`, alt text, and data attributes are output consistently.
4. Expand CSS in `image.scss` to implement Figma design tokens for the standalone image, including any spacing, shadow, or additional border-radius variants referenced in the Figma spec.

**Priority 3 — Advisory**

5. Define `--image-border-radius` in the root or brand token files if not already defined; currently referenced in CSS with a `0` fallback but its authoritative definition is not visible in this block.
6. Expand README to document the DAM alt text checkbox behavior once implemented.
