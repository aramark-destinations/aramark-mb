# Block Audit Report: button
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 15/21 items passed |

## Overall: NO-GO

## Details

### Structure

Files present:
- `button.js` — present
- `button.css` — present
- `button.scss` — present (source)
- `README.md` — present
- `ticket-details.md` — present

Files missing:
- `_button.json` — MISSING. The block has author-configurable fields (link style, color, type) but no UE JSON schema file. This means there is no Universal Editor authoring contract for this block.

Result: WARNING (missing UE JSON schema for a block that requires author configuration)

### Pattern A Compliance

**2a. Export signature**
- Named export `export function decorate(block, options = {})` — PASS
- Default export `export default (block) => decorate(block, window.Button?.hooks)` — PASS
- `options = {}` default parameter present — PASS

**2b. Lifecycle hooks and events**
- `ctx = { block, options }` — PASS
- `options.onBefore?.(ctx)` before block logic — PASS
- `block.dispatchEvent(new CustomEvent('button:before', { detail: ctx, bubbles: true }))` — PASS
- `readVariant(block)` called — PASS
- `options.onAfter?.(ctx)` after block logic — PASS
- `block.dispatchEvent(new CustomEvent('button:after', { detail: ctx, bubbles: true }))` — PASS

**2c. Imports**
- `readVariant` from `../../scripts/scripts.js` — PASS

**2d. No site-specific code**
- No brand-specific logic, URLs, or hard-coded property values — PASS

Result: PASS

### CSS Token Audit

Scanned `button.scss`. Values inside color variant rules use a pattern of `var(--token, #fallback)` — the fallbacks are the violations.

**Line 78:** `--button-bg: var(--color-neutral-900, #000);`
  Suggested: Remove `#000` fallback; rely on `var(--color-neutral-900)` token

**Line 87:** `--button-bg: var(--color-neutral-50, #fff);`
  Suggested: Remove `#fff` fallback; rely on `var(--color-neutral-50)` token

Additional instances of hard-coded hex fallbacks in the `color-black` and `color-white` variant blocks (lines 79, 80, 81, 87, 88, 89, 90, 91). These are all CSS custom property redefinitions within selector rules (not `:root`), so they are flaggable.

The primary, secondary, and tertiary color variant blocks use no hard-coded fallbacks and are clean.

The `font-weight: 600` on line 13 (`.button a`) should use a font-weight token (e.g., `var(--font-weight-semibold)`) per the token audit rules.

Result: WARNING (2+ violations — hard-coded hex fallbacks in color-black and color-white variants; font-weight hard-coded)

### Spec Alignment

Ticket requirements (from `ticket-details.md`):

| Use Case | Implemented? | Notes |
|---|---|---|
| Stand-alone block usable in sections, columns, tabs, accordions | YES | Composable, no template restriction |
| Multi-button fieldset (add, reorder multiple buttons) | PARTIAL | JS reads multiple `<a>` links from block rows; no explicit UE multi-fieldset schema |
| Button Link (Link / Download / Trigger Modal behaviors) | PARTIAL | `link` field read; modal trigger behavior not implemented |
| Button Text | YES | Link text is author content |
| Button Screen Reader Text | NO | No `aria-label` / `title` attribute field or handling in JS |
| Button Style (Filled / Outlined / Text-only) | YES | Implemented via `data-linktype` attribute and CSS classes |
| Button Color (Primary / Secondary / Tertiary / Black / White) | YES | Implemented via `data-linkcolor` attribute and CSS classes |
| Default multi-button inline layout with 8px+ gap | YES | `display: flex; flex-wrap: wrap; gap: var(--spacing-008)` |
| Buttons wrap to next line when overflow | YES | `flex-wrap: wrap` implemented |

Key gaps:
- **No UE JSON schema** — authors cannot configure style or color via Universal Editor dialogs. The implementation reads from `data-linktype` and `data-linkcolor` attributes, but there is no schema exposing these as authored fields.
- **Modal trigger behavior** — "Open in Modal" (linking to an Experience Fragment) is described in the ticket but not implemented in JS.
- **Button Screen Reader Text** — no field or JS handling for an accessible description/title attribute distinct from the link text.

Result: WARNING (UE schema missing blocks the authoring contract; modal trigger and screen reader text field not implemented)

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/button/` convention
- [PASS] Has `button.js` with `decorate(block)` export
- [PASS] Has `button.css`
- [PASS] BEM-style CSS classes (`.button`, `.button a`) — minimal BEM usage; could be more explicit
- [PASS] README documents use cases and configuration
- [PASS] Part of shared global library
- [PASS] Brand differentiation via tokens only
- [WARNING] CSS token fallbacks include hard-coded hex values (color-black, color-white variants)
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly across breakpoints
- [PASS] Content fluidly expands within margins (flex layout)
- [N/A] Column stacking
- [PASS] Respects 1440px max-width (inherits from container)

**Authoring Contract**
- [FAIL] No UE JSON schema — authors cannot configure button style or color via Universal Editor
- [FAIL] Author-facing fields not all documented in schema (style, color, screen reader text missing)
- [PASS] Composable — usable standalone or in other blocks
- [PASS] Structure/content/presentation decoupled

**Performance**
- [N/A] Third-party scripts
- [N/A] Images
- [PASS] No unnecessary JavaScript
- [N/A] Video

**Accessibility (WCAG 2.1)**
- [PASS] Keyboard navigation (native `<a>` elements)
- [PASS] Color contrast (relies on token cascade)
- [PASS] Semantic HTML (anchor elements)
- [PASS] Works with assistive technologies
- [N/A] Alt text

Score: 15/21 applicable items passed.

## Remediation

**Priority 1 — Blocking (must fix before GO)**
1. Create `_button.json` UE schema that exposes at minimum:
   - Per-button fields: link (`aem-content`), text, screen reader text, style (select: filled/outlined/text-only), color (select: primary/secondary/tertiary/black/white)
   - Multi-fieldset or item-model pattern to support multiple buttons
2. Implement Button Screen Reader Text field — read a `data-linkdescription` attribute and apply as `aria-label` or `aria-describedby` on the anchor.
3. Implement modal trigger behavior — when link type is "trigger modal", intercept click and open the referenced Experience Fragment in a modal rather than navigating.

**Priority 2 — CSS cleanup**
4. Remove hard-coded hex fallbacks (`#000`, `#fff`, `#333`, `#e5e5e5`) from color-black and color-white variant rules; rely on `var(--color-neutral-*)` token chain.
5. Replace `font-weight: 600` with `var(--font-weight-semibold)` or equivalent weight token.

**Priority 3 — Minor**
6. Improve BEM class naming — the current `.button a` selector could be `.button-link` for more explicit BEM compliance.
