# Block Audit Report: search
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

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `search.js` | YES | YES |
| `search.css` | YES | YES |
| `search.scss` | YES | YES |
| `README.md` | YES | YES |
| `_search.json` | YES | YES — at `blocks/search/_search.json` |
| `ticket-details.md` | YES | NO |

All required files (JS, CSS) are present. `ticket-details.md` is absent. README is solid and documents usage, customisation points, and placeholder keys.

**Result: WARNING** — ticket-details.md missing.

---

### Pattern A Compliance

#### 2a. Export Signature

| Check | Status | Notes |
|---|---|---|
| Named export `export async function decorate(block, options = {})` | PASS | Line 261 |
| Default export `export default (block) => decorate(block, window.Search?.hooks)` | PASS | Line 291 |
| `options = {}` default param | PASS | Line 261 |
| PascalCase global hook name (`window.Search`) | PASS | Matches block name |

#### 2b. Lifecycle Hooks and Events

| Check | Status | Notes |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 262 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 265 |
| `block.dispatchEvent(new CustomEvent('search:before', { detail: ctx, bubbles: true }))` | PASS | Line 266 — `bubbles: true` present |
| `readVariant(block)` called | PASS | Line 269 |
| `options.onAfter?.(ctx)` after block logic | PASS | Line 287 |
| `block.dispatchEvent(new CustomEvent('search:after', { detail: ctx, bubbles: true }))` | PASS | Line 288 — `bubbles: true` present |

All lifecycle hooks and events are fully implemented.

#### 2c. Imports

| Import | Expected Path | Actual Path | Status |
|---|---|---|---|
| `createOptimizedPicture` | `../../scripts/aem.js` | `../../scripts/aem.js` | PASS |
| `decorateIcons` | `../../scripts/aem.js` | `../../scripts/aem.js` | PASS |
| `readVariant` | `../../scripts/scripts.js` | `../../scripts/scripts.js` | PASS |
| `fetchPlaceholders` | `../../scripts/aem.js` or `../../scripts/scripts.js` | `../../scripts/placeholders.js` | WARNING |

`fetchPlaceholders` is imported from `../../scripts/placeholders.js`. This path is not in the canonical import map (aem.js, scripts.js, baici/utils/config.js, baici/utils/utils.js). If `placeholders.js` is a valid project utility, this is acceptable but should be explicitly acknowledged. If it should come from `aem.js`, the import should be corrected.

#### 2d. No Site-Specific Code

No brand names, hard-coded URLs, or property-specific values detected. The fallback `window.hlx.codeBasePath` reference is a standard EDS platform API. `fetchPlaceholders` returns locale-aware strings, not brand-specific values.

**Pattern A overall result: WARNING** — non-canonical `placeholders.js` import path requires verification. All lifecycle hooks and export signatures are correct.

---

### CSS Token Audit

Audited `search.scss` (143 lines). All values outside `:root` use CSS custom properties.

**`:root` block (lines 1–4):** Defines `--search-icon-gap: 1ch` and `--search-result-indent: 34px`. These are local token definitions inside `:root` and are exempt from flagging per audit rules.

**Outside `:root`:**
- All spacing uses `var(--spacing-*)`, `var(--sizing-*)`, or `calc()` expressions referencing the `--search-result-indent` token.
- All colors use `var(--background-color)`, `var(--text-color)`, `var(--link-color)`, `var(--link-hover-color)`, `var(--color-grey-200)`, `currentcolor`, `transparent`, `unset`.
- All typography uses `var(--body-font-size-*)`.
- All transitions use `var(--transition-duration-fast)`.
- `minmax(278px, 1fr)` on line 35 is inside a `grid-template-columns` layout expression — treated as a structural breakpoint value, not a spacing token violation.

No hex colors, no raw `rgb()`, no raw font sizes, no raw spacing values outside `:root`.

**Result: PASS (0 violations)**

---

### Spec Alignment

`ticket-details.md` is absent. Assessment is based on `README.md` and `_search.json`.

| Use Case | Implemented | Notes |
|---|---|---|
| Full-text search against site query index | PASS | `fetchData` fetches from `query-index.json` or custom source |
| Result highlighting of matched terms | PASS | `highlightTextElements` wraps matches in `<mark>` |
| Header/metadata ranked results | PASS | `foundInHeader` vs `foundInMeta` prioritisation in `filterData` |
| URL state management (`?q=term`) | PASS | `searchParams` + `window.history.replaceState` |
| Optimised result images | PASS | `createOptimizedPicture` called on line 101 |
| Keyboard support — Escape clears search | PASS | `keyup` Escape handler on input (line 239) |
| Minimal variant (CSS) | PASS | `.search.minimal` variant fully implemented |
| Custom data source via link in block | PASS | `block.querySelector('a[href]')?.href` fallback on line 271 |
| Placeholder keys (`searchPlaceholder`, `searchNoResults`) | PASS | Both consumed from `fetchPlaceholders()` |

**UE schema alignment (`_search.json`):**

| Schema Field | Used in JS |
|---|---|
| `index` (text) | Read via block link href |
| `classes` multiselect (minimal) | Applied via `readVariant(block)` |

The `index` field in the schema is a text field, but the JS reads the data source from a hyperlink in block content (`block.querySelector('a[href]')`), not from a `data-index` attribute. There is a minor schema/implementation mismatch — the author sets an Index text field in UE, but the JS reads a link element. Verify whether `dataset.index` is also handled.

**Result: WARNING** — ticket-details.md absent (full spec unverifiable); minor schema/implementation mismatch on `index` field consumption.

---

### Developer Checklist

#### General Block Requirements
| Item | Result |
|---|---|
| Directory convention `/blocks/search/` | PASS |
| JS and CSS files present | PASS |
| BEM CSS classes (`.search-box`, `.search-input`, `.search-results`, `.search-result-title`, `.search-result-image`) | PASS |
| README present and informative | PASS |
| No site-specific code | PASS |
| Token usage in CSS | PASS |
| Root + Brand token cascade supported | PASS |

#### Responsive Design
| Item | Result |
|---|---|
| Fluid grid via `auto-fill minmax` | PASS |
| No fixed widths | PASS |
| Column stacking | PASS — grid auto-fills and wraps |
| 1440px max-width | N/A — handled by parent section |

#### Authoring
| Item | Result |
|---|---|
| UE schema present (`_search.json`) | PASS |
| Author fields clear (Index source, Minimal variant) | PASS |
| Composable — placeable in any section | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| Async data fetch | PASS — `fetchData` is async |
| Optimised images | PASS — `createOptimizedPicture` used |
| `fetchData` called on every keystroke (no caching) | WARNING — search index re-fetched on each qualifying input event |
| Third-party scripts | N/A |

#### Accessibility
| Item | Result |
|---|---|
| Keyboard navigation | PASS — Escape clears search |
| Semantic HTML | PASS — `<input type="search">`, `<ul>`, `<li>`, `<mark>` |
| `aria-label` on search input | PASS — matches placeholder text |
| Alt text on result images | WARNING — `createOptimizedPicture` called with empty alt `''` (line 101); should derive from result data |
| AT support | PASS |

---

## Remediation

**Priority 1 — Should Fix**

1. **Add `ticket-details.md`** with ADO ticket requirements per project convention.

2. **Verify `placeholders.js` import path.** `fetchPlaceholders` is imported from `../../scripts/placeholders.js`. Confirm this module exists and is sanctioned in the project. If `fetchPlaceholders` should come from `aem.js`, update the import.

3. **Clarify `index` field consumption.** The `_search.json` schema exposes an `index` text field, but the JS reads the data source from a block hyperlink (`block.querySelector('a[href]')`). Verify whether `block.dataset.index` is also handled or whether the schema field is redundant.

**Priority 2 — Nice to Have**

4. **Add in-memory caching to `fetchData`.** The search index is re-fetched on every qualifying keystroke. Cache the result per `source` URL in a module-level Map to avoid repeated network requests within a page session.

5. **Populate alt text on result images.** Line 101 passes an empty string as the alt argument to `createOptimizedPicture`. If the query index includes an image alt field, pass it through for improved accessibility.

6. **Remove inaccurate README cross-reference.** The README "See Also" section links to the Header block. Verify this is intentional; if not, remove or replace.
