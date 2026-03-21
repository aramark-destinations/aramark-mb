# Block Audit Report: search
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (3 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 19/24 items passed |

## Overall: GO (with remediation items)

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `search.js` | YES | YES |
| `search.css` | YES | YES |
| `search.scss` | YES | YES |
| `README.md` | YES | YES |
| `_search.json` | YES | YES |
| `ticket-details.md` | YES | NO |

Result: WARNING — All core required files are present. `ticket-details.md` is missing. README is solid and documents usage, customization points, and placeholder keys.

---

### Pattern A Compliance

#### 2a. Export signature

```js
export async function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.Search?.hooks);
```

Both required forms are present — PASS.
- `options = {}` default parameter — PASS
- `window.Search?.hooks` — PascalCase of `search` — PASS

#### 2b. Lifecycle hooks and events

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('search:before', { detail: ctx }));

readVariant(block);
// ... block decoration logic ...

options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('search:after', { detail: ctx }));
```

Both before and after hooks and events are present — PASS. `readVariant(block)` called correctly within the block logic — PASS.

Note: `bubbles: true` is NOT set on `search:before` and `search:after` events — minor inconsistency with navigation-group and navigation-item blocks.

#### 2c. Imports

- `../../scripts/aem.js` — `createOptimizedPicture`, `decorateIcons` — PASS
- `../../scripts/placeholders.js` — `fetchPlaceholders` — this import path is not in the documented canonical paths (`../../scripts/aem.js`, `../../scripts/scripts.js`, `../../scripts/baici/utils/config.js`, `../../scripts/baici/utils/utils.js`). If `placeholders.js` is a valid project script, this is acceptable; if it should be absorbed into another module, it should be reviewed — WARNING.
- `../../scripts/scripts.js` — `readVariant` — PASS

#### 2d. No site-specific code

No brand-specific logic found. Default source fallback to `/query-index.json` is a platform-standard EDS convention — PASS.

---

### CSS Token Audit

**Violations found in `search.scss`:**

```
Line 5: gap: 1ch;
  — '1ch' is a character-unit relative value, not a standard spacing token.
  Suggested: consider var(--spacing-008) or a named search-specific token if 1ch is intentional for optical alignment

Line 84: margin-left: 34px;
  — Hard-coded pixel margin with no corresponding token.
  Suggested: var(--spacing-032) as closest spacing token, or define --search-result-indent: 34px

Line 124: left: -34px;
  — Hard-coded negative pixel value (paired offset to the 34px margin above).
  Suggested: calc(-1 * var(--search-result-indent)) if a token is defined for the indent value
```

All other values in `search.scss` use CSS custom properties correctly:
- `var(--input-padding)`, `var(--input-border-radius)`, `var(--input-border-width)`, `var(--input-border-color)` — input tokens
- `var(--background-color)`, `var(--text-color)`, `var(--link-color)`, `var(--link-hover-color)` — color tokens
- `var(--body-font-size-s)`, `var(--body-font-size-m)` — typography tokens
- `var(--transition-duration-fast)` — transition token
- `var(--spacing-024)`, `var(--spacing-016)`, `var(--spacing-002)` — spacing tokens
- `var(--weight-s)`, `var(--color-grey-200)` — border tokens
- `var(--aspect-ratio-landscape)`, `var(--sizing-024)`, `var(--radius-circle)` — layout/sizing tokens

Total: 3 violations. Result: WARNING (1–3 violations).

---

### Spec Alignment

`ticket-details.md` is absent. README and solution design were used as reference.

The solution design specifies: "Full site search integrated with Elastic Search. Also used for filtering on listing pages (FAQs, Blogs)."

| Use Case | Implemented? | Notes |
|---|---|---|
| Full-text search against site query index | YES | Fetches from `query-index.json` or custom source |
| Result highlighting of matched terms | YES | `highlightTextElements()` wraps matches in `<mark>` |
| Header/metadata ranked results | YES | `foundInHeader` vs `foundInMeta` prioritization |
| URL state management (`?q=term`) | YES | `searchParams` / `window.history.replaceState` |
| Optimized result images | YES | `createOptimizedPicture` used |
| Keyboard Escape clears search | YES | `keyup` Escape handler on input |
| Minimal variant for header search | YES | `.search.minimal` variant implemented in CSS |
| Elastic Search integration | NO | Implementation uses the EDS `query-index.json` flat index; no Elastic Search adapter |
| Filtering on listing pages (FAQs, Blogs) | PARTIAL | The block provides keyword filtering logic but has no faceted filter UI; listing-page filtering is not implemented as a first-class feature |
| `searchPlaceholder` and `searchNoResults` placeholders | YES | Both consumed from `fetchPlaceholders()` |

The `_search.json` schema defines an `index` text field and a `classes` multiselect with a "minimal" option — both are read and used in `decorate()` (source URL from block content link, variant from `readVariant()`). Alignment is PASS for the implemented scope.

Result: WARNING — Elastic Search integration is absent; only EDS flat-index search is implemented. Listing-page faceted filtering is not addressed. These are significant gaps relative to the stated spec requirements.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/search/` convention
- [PASS] Has `decorate(block, options = {})` export with Pattern A default export
- [PASS] Has `search.css`
- [PASS] BEM-style CSS classes (`.search-box`, `.search-input`, `.search-results`, `.search-result-title`, `.search-result-image`)
- [PASS] README documents use cases and customization
- [PASS] Part of shared global library — no site-specific code
- [PASS] Brand differentiation via tokens (input, color, typography tokens used)
- [WARNING] 3 hard-coded values in CSS (`1ch` gap, `34px` margin/offset pair)
- [PASS] Supports Root + Brand token cascade

#### Responsive Design
- [PASS] `grid-template-columns: repeat(auto-fill, minmax(278px, 1fr))` — fluid responsive grid
- [PASS] No fixed widths — content fills available space
- [N/A] Column stacking — grid auto-fills and wraps
- [N/A] 1440px max-width — handled by parent container

#### Authoring Contract
- [PASS] Works with Universal Editor — `_search.json` defines authoring model
- [PASS] Author-facing fields (index source, minimal variant) are clear
- [PASS] Composable — can be placed in any section
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not applicable

#### Performance
- [N/A] Third-party scripts — none
- [PASS] Images use `createOptimizedPicture`
- [WARNING] `fetchData()` is called on every keystroke after 3 characters with no caching — data is re-fetched on every search event
- [N/A] Video — none

#### Accessibility (WCAG 2.1)
- [PASS] `<input type="search">` with `aria-label` matching placeholder
- [PASS] Keyboard — Escape clears search
- [PASS] `<mark>` elements used for highlighted matches (semantic)
- [PASS] Search icon rendered via `decorateIcons()` — icon-based, check alt text in icon SVG
- [N/A] Alt text — result images use `createOptimizedPicture` with empty alt (default); should accept alt text from query index data

---

## Remediation

**Priority 1 — Blocking**
1. Add `ticket-details.md` documenting requirements, including whether Elastic Search integration is in scope for this block or handled at a higher level.
2. Clarify the Elastic Search integration gap: if full-site Elastic Search is required, this block needs an adapter layer or the README should explicitly state the block only supports EDS query-index search, with Elastic Search handled by a brand-level override.

**Priority 2 — Should Fix**
3. Fix CSS token violations (3 items):
   - Replace `gap: 1ch` with a spacing token or a named custom property
   - Replace `margin-left: 34px` and `left: -34px` with a named custom property (e.g., `--search-result-indent: 34px`) defined in the block's token layer, so both usages reference the same source value
4. Add in-memory caching to `fetchData()` so the search index is fetched once per page session rather than on every keystroke.
5. Add `bubbles: true` to `search:before` and `search:after` events for consistency with the block library.

**Priority 3 — Nice to Have**
6. Pass the `import` path from `../../scripts/placeholders.js` through a review to confirm it aligns with the canonical project script paths.
7. Result images rendered via `createOptimizedPicture` use an empty alt string — if the query index includes `imageAlt` data, pass it to `createOptimizedPicture` for improved accessibility.
