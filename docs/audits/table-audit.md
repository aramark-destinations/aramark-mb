# Block Audit Report: table
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (3 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 19/22 items passed |
| Accessibility Basics | PASS |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `table.js` | yes | yes |
| `table.css` | yes | yes |
| `table.scss` | yes | yes |
| `README.md` | yes | yes |
| `ticket-details.md` | no (not present) | NO |
| `_table.json` | yes (author-configurable fields) | yes |

No `ticket-details.md` is present. The README is comprehensive and serves as the functional spec. The UE JSON schema (`_table.json`) is present and well-structured with column count selection, striped/bordered/no-header variants.

**Result: PASS** — All required files present. `ticket-details.md` absence is noted (README covers requirements).

---

### Pattern A Compliance

**2a. Export signature**

```js
export async function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.Table?.hooks);
```

Named export with `options = {}` default: PASS. `async` on the named export is acceptable — it returns a Promise. Default export wired to `window.Table?.hooks`: PASS. PascalCase `Table` matches block name: PASS.

**2b. Lifecycle hooks and events**

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('table:before', { detail: ctx, bubbles: true }));
// ... block logic ...
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('table:after', { detail: ctx, bubbles: true }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS. `table:before`/`table:after` events with `bubbles: true`: PASS. Note: `readVariant(block)` is called inside `buildTableStructure()` (a helper), not directly inside `decorate()` — functionally equivalent but slightly indirect. PASS.

**2c. Imports**

```js
import { readBlockConfig } from '../../scripts/aem.js';
import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';
```

Both imports use correct paths. PASS.

**2d. No site-specific code**

No brand-specific logic. PASS.

**Result: PASS**

---

### CSS Token Audit

Scanning `table.scss`:

**Violations:**

Line 80: `font-weight: 600`
  Suggested: `font-weight: var(--font-weight-semibold)` (or equivalent token) — raw font weight number should use a token.

Line 94: `font-weight: 700`
  Suggested: `font-weight: var(--font-weight-bold)` — raw font weight number.

Line 99: `padding: 0.75rem`
  Suggested: `padding: var(--spacing-012)` (or the nearest spacing token for 12px/0.75rem) — raw rem spacing value should use a spacing token.

Additional note: `margin-bottom: 0.75rem` on line 81 (caption) and `margin-top: 0.25em` on line 144 (paragraph spacing) are also raw spacing values. However, these are micro-spacing adjustments that may not have direct token equivalents — flagged for review.

**Result: WARNING (3 violations)** — font-weight values and cell padding use raw values.

---

### Spec Alignment

No `ticket-details.md` present. Using solution design and README as source of truth.

**4a. Use cases**

| Use Case | Implemented? | Notes |
|---|---|---|
| Tabular data presentation | YES | Full semantic table with thead/tbody |
| Configurable table styles (striped, bordered) | YES | Variant classes applied via UE schema multiselect |
| No-header variant | YES | `no-header` class skips thead |
| Multiple/apparent header rows | PARTIAL | Only a single `<thead>` row is supported; multiple header rows not implemented |
| Cell merging (colspan/rowspan) | YES | `copyAttributes` transfers colspan/rowspan from source cells |
| Small elements (buttons) in cells | YES | `hasMeaningfulChild` check preserves rich content including buttons |
| Horizontal scroll for overflow | YES | `.table-wrapper` with `overflow: auto hidden` and overflow indicators |
| Caption support | YES | Caption from config or data attribute |
| Row header support | YES | `shouldRenderRowHeader` logic for `<th scope="row">` cells |

**4b. Configurable fields (UE schema)**

| Field | In `_table.json` | Used in JS |
|---|---|---|
| Options (striped, bordered, no-header) | YES | YES — via `config.classes` split |
| Columns (1–5 column variants) | YES | YES — filter controls row item type |
| Column content (column1text–column5text) | YES | YES — rendered as row cell content |

The UE schema covers 1–5 column row models. A caption field is not in the UE schema but is consumed from a `data-caption` attribute — this is a minor gap between the schema and the full capability.

**4c. Design details**

The solution design notes needs for "configurable table styles, multiple/apparent header rows, cell merging, small elements (buttons) in cells." Multiple header rows (stacked visual headers) are not directly supported — only one `<thead>` row is created regardless of how many rows are in the source. This is a partial gap.

**Result: WARNING** — Multiple header row stacking not supported; caption not in UE schema.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/table/` convention
- [PASS] Has `table.js` with `decorate(block)` export
- [PASS] Has `table.css`
- [PASS] BEM-style CSS classes (`.table-wrapper`, `.table-cell--numeric`, `.table-cell--empty`, `.table-cell--row-header`, `.table-overflow-indicator`)
- [PASS] README documents use cases and configuration
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [WARNING] 3 raw font-weight and spacing values in CSS
- [PASS] Supports Root + Brand token cascade

#### Responsive Design
- [PASS] Font sizing responsive via media queries (xs → s → m at 600px, 900px)
- [PASS] Content fluidly expands — `width: 100%` on table and wrapper
- [N/A] Column stacking not applicable (table scrolls horizontally)
- [PASS] No fixed max-width; inherits container constraints

#### Authoring Contract
- [PASS] Works with Universal Editor — `_table.json` present with row/column models
- [PASS] Author-facing fields clear and documented
- [PASS] Composable — not bound to specific templates
- [PASS] Structure/content/presentation decoupled
- [N/A] No Content Fragment integration required for this block

#### Performance
- [N/A] No third-party scripts
- [N/A] No image optimization concerns
- [PASS] No unnecessary JavaScript — DOM manipulation is efficient with `replaceChildren`
- [N/A] No video

#### Accessibility (WCAG 2.1)
- [PASS] Keyboard navigation — scroll wrapper has `tabindex="0"` and `role="region"`
- [PASS] Color contrast via tokens
- [PASS] Semantic HTML — `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`, `<th scope="row">`
- [PASS] Screen reader support — `aria-describedby` on scroll wrapper, visually-hidden scroll instructions, placeholder text for empty cells
- [N/A] No images in this block

**Checklist: 19/22 items passed (0 FAIL, 3 WARNING/N/A)**

---

## Remediation

**Priority 1 — High**

1. **Replace raw font-weight and spacing values with tokens.**
   - `font-weight: 600` (caption, line 80) → `var(--font-weight-semibold)` or equivalent
   - `font-weight: 700` (`th`, line 94) → `var(--font-weight-bold)` or equivalent
   - `padding: 0.75rem` (cell padding, line 99) → `var(--spacing-012)` or nearest spacing token
   - Also review `margin-bottom: 0.75rem` (caption) and `margin-top: 0.25em` (paragraph)

**Priority 2 — Medium**

2. **Add caption field to `_table.json` UE schema.** The JS supports caption via `data-caption` attribute and `readBlockConfig`, but authors cannot set it from Universal Editor. Add a `text` field named `caption` to the `table` model.

3. **Evaluate multiple header row support.** The solution design calls for "multiple/apparent header rows." The current implementation only promotes the first row to `<thead>`. If stacked visual headers (e.g., a group header row + column header row) are needed, a variant class or explicit row marking mechanism should be added.

**Priority 3 — Low**

4. **Add `ticket-details.md`.** All other blocks in the set have a committed `ticket-details.md` as the ADO ticket source of truth. The table block is missing this file.
