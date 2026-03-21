# Block Audit Report: quote
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (1 violation) |
| Spec Alignment | PASS |
| Developer Checklist | 20/23 items passed |

## Overall: GO (with remediation items)

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `quote.js` | YES | YES |
| `quote.css` | YES | YES |
| `quote.scss` | YES | YES |
| `README.md` | YES | YES |
| `_quote.json` | YES | YES |
| `ticket-details.md` | YES | NO |

Result: WARNING — All core required files are present. `ticket-details.md` is missing. README is comprehensive and documents authoring, HTML output, hooks, and accessibility.

---

### Pattern A Compliance

#### 2a. Export signature

```js
export async function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.Quote?.hooks);
```

Both required forms are present — PASS.
- `options = {}` default parameter — PASS
- `window.Quote?.hooks` — PascalCase of `quote` — PASS

#### 2b. Lifecycle hooks and events

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('quote:before', { detail: ctx }));

readVariant(block);
// ... block decoration logic ...

options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('quote:after', { detail: ctx }));
```

Both before and after hooks and events are present — PASS. Note: `bubbles: true` is NOT set on the events, unlike `navigation-group` and `navigation-item`. Minor inconsistency with those blocks.

`readVariant(block)` is called correctly within the block logic, between the before and after hooks — PASS.

#### 2c. Imports

- `../../scripts/scripts.js` — `readVariant` — PASS

No other imports required for this block's functionality.

#### 2d. No site-specific code

No brand-specific logic found — PASS.

---

### CSS Token Audit

**Violation found in `quote.scss`:**

```
Line 18: font-size: 120%;
  — Percentage font size; this is a relative scaling value.
  Suggested: consider var(--font-size-quote) or a named scale token if one exists;
  if no token exists, a named custom property (e.g., --quote-font-scale: 120%) should be defined
```

Note: `120%` as a relative `font-size` is a borderline case. It is not an absolute pixel or rem value, so it does not map cleanly to a font-size token. However, it is a hard-coded visual choice that should be expressed as a named custom property to allow brand-level overrides. Flagged as a WARNING rather than a FAIL.

All other values in `quote.scss` use CSS custom properties correctly:
- `var(--spacing-024)`, `var(--spacing-032)` — spacing tokens
- `var(--layout-max-width-narrow)` — layout token
- `var(--line-height-none)` — typography token
- Media query breakpoint (`900px`) — acceptable exception

Total: 1 violation. Result: WARNING (1–3 violations).

---

### Spec Alignment

`ticket-details.md` is absent. The README and solution design were used as reference.

The solution design specifies: "Outputs author-entered text with quote markup and styling."

| Use Case | Implemented? | Notes |
|---|---|---|
| Semantic `<blockquote>` markup | YES | `blockquote` element created |
| Quotation text with automatic quote marks | YES | CSS `content: '"'` / `content: '"'` pseudo-elements via `p:first-child::before` / `p:last-child::after` |
| Optional attribution with em-dash prefix | YES | CSS `content: '—'` via `p:first-child::before` on attribution |
| `<cite>` conversion for italicized attribution text | YES | `<em>` elements in attribution replaced with `<cite>` |
| Responsive layout | YES | Max-width and padding adjust at 900px breakpoint |
| Variant support | YES | `readVariant(block)` called |

UE JSON schema (`_quote.json`) defines `quotation` (richtext) and `attribution` (richtext) fields — both are read and used in `decorate()` via positional child selection (`block.children[0]` and `block.children[1]`). Alignment is implicit rather than via named field reading, but consistent with EDS document authoring patterns — PASS.

Result: PASS

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/quote/` convention
- [PASS] Has `decorate(block, options = {})` export with Pattern A default export
- [PASS] Has `quote.css`
- [PASS] BEM-style CSS classes (`.quote-quotation`, `.quote-attribution`)
- [PASS] README comprehensively documents use cases, HTML output, hooks, and accessibility
- [PASS] Part of shared global library — no site-specific code
- [PASS] Brand differentiation via tokens (spacing, max-width use tokens)
- [WARNING] `font-size: 120%` is not expressed as a token — 1 violation
- [PASS] Supports Root + Brand token cascade

#### Responsive Design
- [PASS] Padding adjusts at 900px breakpoint
- [PASS] `max-width: var(--layout-max-width-narrow)` with `margin: 0 auto` — fluid and centered
- [N/A] Column stacking — not applicable
- [PASS] Respects max-width constraint

#### Authoring Contract
- [PASS] Works with Universal Editor — `_quote.json` defines authoring model
- [PASS] Author-facing fields (`quotation`, `attribution`) are clear
- [PASS] Composable — not bound to specific templates
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not specified for this block

#### Performance
- [N/A] Third-party scripts — none
- [N/A] Images — none
- [PASS] No unnecessary JavaScript — minimal, focused implementation
- [N/A] Video — none

#### Accessibility (WCAG 2.1)
- [N/A] Keyboard navigation — static content block
- [PASS] `<blockquote>` and `<cite>` provide semantic structure
- [PASS] Semantic HTML — proper use of `blockquote`, `cite`
- [N/A] Screen reader assistive tech — no interactive elements
- [N/A] Alt text — no images

---

## Remediation

**Priority 1 — Blocking**
1. Add `ticket-details.md` documenting requirements for this block.

**Priority 2 — Should Fix**
2. Replace the hard-coded `font-size: 120%` with a named CSS custom property (e.g., `--quote-font-scale: 120%` defined in the block's `:root` layer, or a system-level `var(--font-size-quote)` token) to allow brand-level overrides.
3. Add `bubbles: true` to `quote:before` and `quote:after` events for consistency with other blocks in the library.

**Priority 3 — Nice to Have**
4. The README includes inline CSS property suggestions (e.g., `--quote-max-width`, `--quote-font-size`) that reference non-existent tokens. Either implement these as CSS custom properties in the SCSS or remove the CSS custom property table from the README to avoid confusion.
