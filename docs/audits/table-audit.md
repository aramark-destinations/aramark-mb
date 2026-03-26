# Block Audit Report: table
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 20/23 items passed |

## Overall: GO (with remediation items)

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `table.js` | YES | YES |
| `table.css` | YES | YES |
| `table.scss` | YES | YES |
| `README.md` | YES | YES |
| `ticket-details.md` | YES | NO |
| `_table.json` | YES | YES — at `blocks/table/_table.json` |

All required files (JS, CSS) are present. `ticket-details.md` is absent. The README is comprehensive and covers variants, HTML output, and accessibility notes. The UE schema is well-structured with 1–5 column row models.

**Result: WARNING** — ticket-details.md missing.

---

### Pattern A Compliance

#### 2a. Export Signature

| Check | Status | Notes |
|---|---|---|
| Named export `export async function decorate(block, options = {})` | PASS | Line 237 — `async` is appropriate (function structure uses await-compatible patterns) |
| Default export `export default (block) => decorate(block, window.Table?.hooks)` | PASS | Line 284 |
| `options = {}` default param | PASS | Line 237 |
| PascalCase global hook name (`window.Table`) | PASS | Matches block name |

#### 2b. Lifecycle Hooks and Events

| Check | Status | Notes |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 238 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 241 |
| `block.dispatchEvent(new CustomEvent('table:before', { detail: ctx, bubbles: true }))` | PASS | Line 242 — `bubbles: true` present |
| `readVariant(block)` called | PASS | Line 84 inside `buildTableStructure()` helper — functionally correct |
| `options.onAfter?.(ctx)` after block logic | PASS | Lines 261 (early return path) and 275 |
| `block.dispatchEvent(new CustomEvent('table:after', { detail: ctx, bubbles: true }))` | PASS | Lines 262 (early return path) and 276 — `bubbles: true` present |

Note: `readVariant(block)` is called inside the `buildTableStructure` helper rather than directly inside `decorate()`. It is called before any DOM manipulation and the result is equivalent. Both the early-return path (empty table) and the normal path correctly fire `onAfter` and `table:after`.

#### 2c. Imports

| Import | Expected Path | Actual Path | Status |
|---|---|---|---|
| `readBlockConfig` | `../../scripts/aem.js` | `../../scripts/aem.js` | PASS |
| `moveInstrumentation` | `../../scripts/scripts.js` | `../../scripts/scripts.js` | PASS |
| `readVariant` | `../../scripts/scripts.js` | `../../scripts/scripts.js` | PASS |

All imports use correct canonical paths.

#### 2d. No Site-Specific Code

No brand names, hard-coded URLs, or property-specific values detected. Constants (`SCROLL_INSTRUCTIONS`, `PLACEHOLDER_GLYPH`, `PLACEHOLDER_TEXT`) are generic. ResizeObserver and requestAnimationFrame usage is standard browser API.

**Pattern A overall result: PASS**

---

### CSS Token Audit

Audited `table.scss` and `table.css` (168 lines each; SCSS is the source).

**Violations:**

| Line | Value | Suggested Fix |
|---|---|---|
| Line 123 (`.table-cell--row-header`) | `font-weight: 600` | `font-weight: var(--font-weight-bold)` (semibold/600 removed from token system — not in Figma) |
| Line 141 (`.table.block table td p + p`) | `margin-top: 0.25em` | Consider `var(--spacing-004)` if a 4px equivalent token exists, or define a block-scoped token `--table-paragraph-gap: 0.25em` |

**Accepted exceptions (not flagged):**
- `outline: 2px solid var(...)` — `2px` is a `1px`-class border structural value, exempt.
- `outline-offset: 2px` — structural, exempt.
- `width: 1px; height: 1px; margin: -1px` — visually-hidden pattern, structural/accessibility utility, exempt.
- `width: 3rem` on overflow indicator — this is a layout structural value; arguable. Not flagged as it's a single decorative indicator width, not spacing/padding.
- `transition: opacity 0.2s ease` (line 38) — **this is a flaggable transition duration.** Raw `0.2s` should use `var(--transition-duration-fast)` or equivalent. Counted as a third issue but below the WARNING threshold at 2 clear violations.
- `border-top: 2px solid`, `border-bottom: 2px solid`, `border-bottom: 1px solid` — `1px`/`2px` borders are structural exceptions.
- `@media (width >= 600px)`, `@media (width >= 900px)`, `@media (width <= 600px)` — media query breakpoints, exempt.

**Total violations: 2.** `font-weight: 600` and `margin-top: 0.25em`. The `transition: 0.2s` is a borderline case noted below.

**Result: WARNING (2 violations)**

**Borderline — not counted in total but noted:**
- Line 38: `transition: opacity 0.2s ease` — raw `0.2s` duration. Recommend `var(--transition-duration-fast)` for consistency.

---

### Spec Alignment

`ticket-details.md` is absent. Assessment based on `README.md`, `_table.json`, and solution design.

#### Use Case Coverage

| Use Case | Implemented | Notes |
|---|---|---|
| Tabular data presentation with semantic markup | PASS | `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` with proper scope attributes |
| Automatic header row detection | PASS | First row promoted to `<thead>` by default |
| No-header variant | PASS | `no-header` class disables thead |
| Striped variant | PASS | `.striped tbody tr:nth-child(odd)` |
| Bordered variant | PASS | `.bordered table th, td` with border |
| Cell merging (`colspan`/`rowspan`) | PASS | `copyAttributes` transfers colspan/rowspan from source cells |
| Row header cells (`<th scope="row">`) | PASS | `shouldRenderRowHeader` detects and marks row headers |
| Caption support | PASS | From block config or `data-caption` attribute |
| Empty cell placeholder | PASS | Visually-hidden `span.visually-hidden` with "No data available" text |
| Numeric cell detection | PASS | `isNumericContent` auto-adds `.table-cell--numeric` for right-alignment |
| Horizontal scroll on overflow | PASS | `.table-wrapper` with overflow indicators and keyboard focus |
| Responsive font sizing | PASS | xs → s → m at 600px and 900px |

#### UE Schema Alignment (`_table.json`)

| Schema Field | Implemented | Notes |
|---|---|---|
| `classes` multiselect (striped, bordered, no-header) | PASS | `config.classes.split(',')` applies variants |
| `filter` select (1–5 columns) | PASS | Drives which row item model is used in UE |
| Column content fields (column1text–column5text) | PASS | Richtext fields per column count |
| Caption | NOT in schema | Caption is read from `data-caption` dataset but no UE field exists |
| `header-row` config | NOT in schema | Read from `readBlockConfig` but not author-configurable in UE |

**Result: WARNING** — ticket-details.md absent; caption and header-row fields not exposed in UE schema.

---

### Developer Checklist

#### General Block Requirements
| Item | Result |
|---|---|
| Directory convention `/blocks/table/` | PASS |
| JS and CSS files present | PASS |
| BEM CSS classes (`.table-wrapper`, `.table-cell--numeric`, `.table-cell--empty`, `.table-cell--row-header`, `.table-overflow-indicator`, `.table-scroll-instructions`) | PASS |
| README present and comprehensive | PASS |
| No site-specific code | PASS |
| Token usage in CSS | WARNING — 2 violations (`font-weight: 600`, `margin-top: 0.25em`) |
| Root + Brand token cascade supported | PASS |

#### Responsive Design
| Item | Result |
|---|---|
| Font sizing responsive via media queries (600px, 900px) | PASS |
| Content width fluid — `width: 100%` | PASS |
| Column stacking | N/A — table uses horizontal scroll, not stacking |
| 1440px max-width | N/A — inherits container |

#### Authoring
| Item | Result |
|---|---|
| UE schema present (`_table.json`) with row models | PASS |
| Author fields clear (Options, Columns, cell content) | PASS |
| Composable | PASS |
| Structure/content/presentation decoupled | PASS |
| Caption not in UE schema | WARNING |

#### Performance
| Item | Result |
|---|---|
| No third-party scripts | N/A |
| DOM manipulation uses `replaceChildren` (efficient) | PASS |
| ResizeObserver with cleanup | PASS |
| No video | N/A |

#### Accessibility
| Item | Result |
|---|---|
| Keyboard navigation on scroll wrapper (`tabindex="0"`, `role="region"`) | PASS |
| `aria-describedby` linking scroll wrapper to instructions | PASS |
| Visually-hidden scroll instructions | PASS |
| `scope="col"` on column headers | PASS |
| `scope="row"` on detected row headers | PASS |
| Empty cell placeholder with hidden text "No data available" | PASS |
| Color contrast via tokens | PASS |
| Semantic HTML | PASS |

---

## Remediation

**Priority 1 — Should Fix**

1. **Replace `font-weight: 600` with a token.** Line 123 (`.table-cell--row-header`) uses a raw font weight number.
   - Fix: `font-weight: var(--font-weight-bold)` — `--font-weight-semibold` (600) was removed from the token system as it is not present in the Figma type system (ADO-89).

2. **Replace `margin-top: 0.25em` with a token or block-scoped variable.** Line 141 (`.table.block table td p + p`) uses a raw em value.
   - Fix: `margin-top: var(--spacing-004)` if a 4px-equivalent token exists, or define `--table-paragraph-spacing: 0.25em` in a `:root` block or the table block scope.

3. **Add `ticket-details.md`** documenting the ADO ticket requirements per project convention.

**Priority 2 — Nice to Have**

4. **Add `caption` field to `_table.json` UE schema.** The JS supports caption via `data-caption` attribute and `readBlockConfig`, but authors cannot set it from Universal Editor. Add a `text` field named `caption` to the `table` model.

5. **Replace `transition: opacity 0.2s ease` with a token.** Line 38 — raw `0.2s` transition duration should use `var(--transition-duration-fast)` for consistency with the rest of the token system.

6. **Evaluate multiple visual header row support.** Only the first row is promoted to `<thead>`. If authors need to express stacked header groups, a variant class or explicit per-row marker (via data attributes) should be documented and supported.
