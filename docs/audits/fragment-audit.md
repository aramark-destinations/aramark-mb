# Block Audit Report: fragment
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | FAIL |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 13/18 items passed |

## Overall: NO-GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `fragment.js` | PASS | Present |
| `fragment.css` | PASS | Present |
| `fragment.scss` | PASS | Present (content identical to `.css`) |
| `README.md` | PASS | Present, well-documented |
| `_fragment.json` | WARNING | Not found in block dir or `/models/` |
| `ticket-details.md` | WARNING | File committed but empty — zero content |

Required JS and CSS files are present. Two warnings: no UE model schema and an empty `ticket-details.md`.

### Pattern A Compliance

**2a. Export signature**
- Named export: `export async function decorate(block, options = {})` — PASS (line 66)
- Default export: `export default (block) => decorate(block, window.Fragment?.hooks)` — PASS (line 96)
- `options = {}` default param — PASS
- Additional named export `loadFragment` — PASS; intentional public API consumed by header and footer blocks

**2b. Lifecycle hooks and events**
- `const ctx = { block, options }` — PASS (line 67)
- `options.onBefore?.(ctx)` before block logic — PASS (line 70)
- `block.dispatchEvent(new CustomEvent('fragment:before', { detail: ctx }))` — FAIL: dispatched WITHOUT `bubbles: true` (line 71)
- `readVariant(block)` called — FAIL: not called; not imported from `../../scripts/scripts.js`
- `options.onAfter?.(ctx)` after block logic — PASS (line 87)
- `block.dispatchEvent(new CustomEvent('fragment:after', { detail: ctx }))` — FAIL: dispatched WITHOUT `bubbles: true` (line 88)

**2c. Imports**
- `decorateMain`, `moveInstrumentation` from `../../scripts/scripts.js` — PASS (lines 10–12)
- `loadSections` from `../../scripts/aem.js` — PASS (lines 14–16)
- `readVariant` from `../../scripts/scripts.js` — MISSING; consistent with the missing call above

**2d. No site-specific code**
- No brand names, hard-coded paths, or property-specific values — PASS

**Overall Pattern A: FAIL** — `bubbles: true` is absent from both CustomEvent dispatches, and `readVariant` is neither imported nor called. These are required Pattern A items.

### CSS Token Audit

Audited `fragment.scss` (17 lines). The CSS only sets padding to `0` and `display: none` — all zero values and structural display properties, which are explicitly exempt from token requirements.

| Line | Property | Value | Status |
|---|---|---|---|
| 3 | `padding-left` | `0` | Exempt |
| 4 | `padding-right` | `0` | Exempt |
| 8 | `padding-top` | `0` | Exempt |
| 12 | `padding-bottom` | `0` | Exempt |
| 16 | `display` | `none` | Exempt |

**0 violations. PASS.**

### Spec Alignment

`ticket-details.md` is committed but contains no content. Alignment evaluated against `README.md` only.

| Use Case (from README) | Implemented | Notes |
|---|---|---|
| Include content from other pages as fragments | PASS | `loadFragment(path)` fetches `.plain.html` and decorates |
| Async loading of fragment HTML | PASS | `fetch()` + `await resp.text()` |
| Automatic media URL fixing for `./media_*` references | PASS | `resetAttribute` corrects `img[src]` and `source[srcset]` |
| Full block decoration via `decorateMain` + `loadSections` | PASS | Both called on the constructed `<main>` element |
| Section class propagation to parent section | PASS | `block.closest('.section').classList.add(...fragmentSection.classList)` |
| UE instrumentation preservation | PASS | `moveInstrumentation(block, block.parentElement)` called |
| Lifecycle hooks `onBefore`/`onAfter` | PASS | Both hooks implemented |
| Events `fragment:before`/`fragment:after` | WARNING | Dispatched but missing `bubbles: true` — events will not propagate beyond the fragment element |

**Known gap documented in code:** Fragment caching is not implemented. A `TODO` comment in `fragment.js` (lines 18–26) explicitly documents that each `loadFragment()` call makes a fresh `fetch()`, causing redundant network requests when the same fragment path is loaded multiple times. The comment includes the intended solution.

**Spec Alignment: WARNING** — `ticket-details.md` is empty; full ADO verification not possible. All README use cases implemented except event bubbling.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory convention (`blocks/fragment/`)
- [PASS] `fragment.js` with `decorate(block, options = {})` export
- [PASS] `fragment.css` present
- [PASS] CSS has no BEM violations — structural-only rules with no class hierarchy needed
- [PASS] README present and documents use cases
- [PASS] No site-specific code
- [PASS] Token usage — 0 violations

**Responsive**
- [N/A] Breakpoints — fragment inherits layout from loaded content
- [N/A] Columns — not applicable
- [N/A] Max-width — not applicable

**Authoring**
- [FAIL] No UE schema (`_fragment.json` not found) — in-context editing not configured
- [PASS] Composable — single content reference pattern
- [PASS] Structure/content/presentation decoupled
- [PASS] CF integration — `loadFragment` is the platform utility for CF-backed content across other blocks

**Performance**
- [FAIL] No fragment caching — redundant network requests when same path loaded multiple times (documented TODO)
- [PASS] Fragment loading is async/await
- [PASS] No unnecessary JavaScript

**Accessibility**
- [PASS] Semantic HTML — fragment content is fully decorated via `decorateMain`
- [N/A] Keyboard nav — delegated to fragment content
- [N/A] Color contrast — delegated to fragment content
- [N/A] Alt text — delegated to fragment content

## Remediation

1. **(HIGH — Pattern A FAIL)** Add `bubbles: true` to both CustomEvent dispatches:
   - Line 71: `block.dispatchEvent(new CustomEvent('fragment:before', { detail: ctx, bubbles: true }))`
   - Line 88: `block.dispatchEvent(new CustomEvent('fragment:after', { detail: ctx, bubbles: true }))`
2. **(HIGH — Pattern A FAIL)** Add `readVariant` import from `../../scripts/scripts.js` and call `readVariant(block)` after `const ctx = { block, options }`.
3. **(HIGH)** Create `_fragment.json` UE model schema to enable Universal Editor in-context editing of the fragment content reference.
4. **(MEDIUM)** Implement fragment caching as documented in the TODO comment (lines 18–26). Cache the raw HTML text keyed by path in a module-level `Map` to avoid redundant fetches. Do not cache the DOM element — callers mutate it.
5. **(LOW)** Populate `ticket-details.md` with the actual ADO ticket requirements.
6. **(LOW)** The `.css` and `.scss` files are byte-for-byte identical — confirm the build pipeline compiles SCSS to CSS so the files do not drift.
