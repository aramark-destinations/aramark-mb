# Block Audit Report: quote
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | WARNING |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 19/23 items passed |

## Overall: GO (with remediation items)

---

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

Result: WARNING — All core required files are present. `ticket-details.md` is the only missing file.

---

### Pattern A Compliance

#### 2a. Export signature

| Check | Status |
|---|---|
| Named export `export async function decorate(block, options = {})` | PASS — line 16 |
| Default export `export default (block) => decorate(block, window.Quote?.hooks)` | PASS — line 56 |
| `options = {}` default parameter | PASS |
| `window.Quote?.hooks` — PascalCase matches `quote` | PASS |

#### 2b. Lifecycle hooks and events

| Check | Status |
|---|---|
| `const ctx = { block, options }` | PASS — line 17 |
| `options.onBefore?.(ctx)` before block logic | PASS — line 20 |
| `block.dispatchEvent(new CustomEvent('quote:before', { detail: ctx, bubbles: true }))` | WARNING — line 21, `bubbles: true` is **missing** from the event options |
| `readVariant(block)` called | PASS — line 23, called between before and after hooks |
| `options.onAfter?.(ctx)` after block logic | PASS — line 47 |
| `block.dispatchEvent(new CustomEvent('quote:after', { detail: ctx, bubbles: true }))` | WARNING — line 48, `bubbles: true` is **missing** from the event options |

`readVariant(block)` is present and correctly called after the before hook. Both `quote:before` and `quote:after` events are missing `bubbles: true`. This is a pattern inconsistency with the navigation family blocks.

Overall: WARNING (pattern is structurally sound; only `bubbles: true` is missing).

#### 2c. Imports

| Symbol | Expected source | Actual source | Status |
|---|---|---|---|
| `readVariant` | `../../scripts/scripts.js` | `../../scripts/scripts.js` | PASS |

No other imports are required for this block's functionality. PASS.

#### 2d. No site-specific code

No brand names, hard-coded domain URLs, or property-specific values found. PASS.

---

### CSS Token Audit

Audited `quote.scss` (and compiled `quote.css`). Media query breakpoint (`900px`) is exempt.

The custom property `--quote-highlight-font-size: 120%` is defined **inside `:root`** (line 2 of `quote.scss`). Per audit rules, values inside `:root` are exempt regardless of type. This is **not a violation**.

All other values use CSS custom properties correctly:
- `var(--spacing-024)`, `var(--spacing-032)` — spacing tokens
- `var(--layout-max-width-narrow)` — layout token
- `var(--line-height-none)` — typography token
- `var(--quote-highlight-font-size)` — references the `:root`-defined custom property
- `0` values, `0.5ch` text-indent/padding-right — `ch` is a relative unit tied to the current font, not a hard-coded pixel value; exempt
- `right` text-align — layout keyword; exempt

Result: PASS (0 violations).

---

### Spec Alignment

`ticket-details.md` is absent; assessment is based on `README.md` and `_quote.json`.

| Use Case | Implemented | Notes |
|---|---|---|
| Semantic `<blockquote>` markup | PASS | Created at line 25 |
| Quotation text with automatic opening/closing quote marks | PASS | CSS `content: '"'` / `content: '"'` via `p:first-child::before` / `p:last-child::after` |
| Optional attribution | PASS | Second row of block becomes attribution element |
| Attribution em-dash prefix | PASS | CSS `content: '—'` via `.quote-attribution p:first-child::before` |
| `<cite>` conversion for italicized attribution text | PASS | `<em>` elements replaced with `<cite>` (lines 35–40) |
| Responsive layout (padding adjusts at breakpoint) | PASS | `@media (width >= 900px)` with responsive spacing tokens |
| Variant support | PASS | `readVariant(block)` called (line 23) |
| Lifecycle hooks and custom events | PASS | `onBefore`/`onAfter`, `quote:before`/`quote:after` |

UE schema (`_quote.json`) defines two fields: `quotation` (richtext) and `attribution` (richtext). The `decorate()` function reads these positionally as `block.children[0]` and `block.children[1]`, consistent with EDS document authoring. Field names align with implementation. PASS.

Result: WARNING — all use cases are implemented; formal spec cannot be verified without `ticket-details.md`.

---

### Developer Checklist

#### Convention and Files
| Item | Result |
|---|---|
| Directory follows `/blocks/quote/` convention | PASS |
| JS and CSS files present | PASS |
| BEM CSS class names | PASS — `.quote-quotation`, `.quote-attribution` |
| README present and thorough | PASS — documents use cases, HTML output, hooks, events, and accessibility |
| No site-specific code | PASS |
| CSS token usage | PASS — 0 violations |
| Root+Brand cascade | PASS — `:root` custom property defined for overridability |

#### Responsive Design
| Item | Result |
|---|---|
| Breakpoints defined | PASS — `900px` breakpoint adjusts padding |
| Fluid content | PASS — `max-width` with `margin: 0 auto` |
| Column stacking | N/A — single-column block |
| 1440px max-width | PASS — `var(--layout-max-width-narrow)` constrains width |

#### Authoring Contract
| Item | Result |
|---|---|
| UE in-context editing | PASS — `_quote.json` defines authoring model |
| UE schema field labels clear | PASS — "Quotation" and "Attribution" are descriptive |
| Composable | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| Async decoration | PASS — `async function decorate` (no awaited calls, but async allows future extension) |
| Optimized images | N/A |
| No unnecessary JS | PASS — minimal, focused implementation |
| Video embed | N/A |

#### Accessibility (WCAG 2.1)
| Item | Result |
|---|---|
| Keyboard navigation | N/A — static content block |
| Color contrast | PASS — inherits via CSS token chain |
| Semantic HTML | PASS — `<blockquote>`, `<cite>` provide correct semantic structure |
| AT support | N/A — no interactive elements |
| Alt text | N/A — no images |

---

## Remediation

**Priority 1 — Should fix**

1. **Add `bubbles: true` to both custom events** — `quote:before` (line 21) and `quote:after` (line 48) are dispatched without `bubbles: true`. Add `bubbles: true` to the event init objects to match the pattern used across the block library:
   ```js
   block.dispatchEvent(new CustomEvent('quote:before', { detail: ctx, bubbles: true }));
   // ...
   block.dispatchEvent(new CustomEvent('quote:after', { detail: ctx, bubbles: true }));
   ```
2. **Add `ticket-details.md`** — Document the source ADO ticket requirements so spec alignment can be formally verified.

**Priority 2 — Consider**

3. **Clean up README "CSS Custom Properties" section** — The README lists `--quote-max-width`, `--quote-font-size`, and `--quote-padding` as override targets in a code example, but none of these custom properties exist in the block's SCSS. The only defined custom property is `--quote-highlight-font-size`. Either implement the listed properties or remove the misleading example to avoid author confusion.
