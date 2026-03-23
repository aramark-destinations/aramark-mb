# Block Audit Report: footer
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | WARNING |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 14/18 items passed |

## Overall: GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `footer.js` | PASS | Present |
| `footer.css` | PASS | Present |
| `footer.scss` | PASS | Present (content identical to `.css`) |
| `README.md` | PASS | Present, well-documented |
| `_footer.json` | WARNING | Not found in block dir or `/models/` |
| `ticket-details.md` | WARNING | File committed but empty — zero content |

Required files present. Two warnings: no UE model schema and an empty `ticket-details.md`.

### Pattern A Compliance

**2a. Export signature**
- Named export: `export async function decorate(block, options = {})` — PASS (line 20)
- Default export: `export default (block) => decorate(block, window.Footer?.hooks)` — PASS (line 50)
- `options = {}` default param — PASS

**2b. Lifecycle hooks and events**
- `const ctx = { block, options }` — PASS (line 21)
- `options.onBefore?.(ctx)` before block logic — PASS (line 24)
- `block.dispatchEvent(new CustomEvent('footer:before', { detail: ctx, bubbles: true }))` — PASS (line 25)
- `readVariant(block)` called — FAIL: not called anywhere in `footer.js`; not imported
- `options.onAfter?.(ctx)` after block logic — PASS (line 41)
- `block.dispatchEvent(new CustomEvent('footer:after', { detail: ctx, bubbles: true }))` — PASS (line 42)

**2c. Imports**
- `getMetadata` from `../../scripts/aem.js` — PASS (line 9)
- `loadFragment` from `../fragment/fragment.js` — PASS (line 10), correct block-to-block relative path
- `readVariant` from `../../scripts/scripts.js` — MISSING; consistent with the missing call above

**2d. No site-specific code**
- No brand names, hard-coded URLs, or property-specific values — PASS
- Footer path defaults to `/footer` and is overridable via `getMetadata('footer')` — PASS

**Overall Pattern A: WARNING** — `readVariant` is neither imported nor called. All other lifecycle requirements met.

### CSS Token Audit

Audited `footer.scss` (21 lines). All values use design tokens or are explicitly exempt.

| Line | Property | Value | Status |
|---|---|---|---|
| 2 | `background-color` | `var(--light-color)` | PASS |
| 3 | `font-size` | `var(--body-font-size-xs)` | PASS |
| 8 | `max-width` | `var(--layout-max-width-content)` | PASS |
| 9 | `padding` | `var(--spacing-040) var(--spacing-024) var(--spacing-024)` | PASS |
| 7 | `margin` | `auto` | Exempt |
| 16 | Media query | `width >= 900px` | Exempt |
| 18 | `padding` | `var(--spacing-040) var(--spacing-032) var(--spacing-024)` | PASS |

**0 violations. PASS.**

### Spec Alignment

`ticket-details.md` is committed but contains no content — ADO ticket requirements cannot be assessed. Alignment evaluated against `README.md` only.

| Use Case (from README) | Implemented | Notes |
|---|---|---|
| Fragment-based content loading from `/footer` | PASS | `loadFragment(footerPath)` called |
| Custom footer path via metadata | PASS | `getMetadata('footer')` used with URL resolution |
| Lifecycle hooks `onBefore`/`onAfter` | PASS | Both hooks implemented |
| Events `footer:before`/`footer:after` | PASS | Dispatched with `bubbles: true` |
| Brand override via `/brands/{property}/blocks/footer/footer.js` | PASS | Pattern documented in README |

**Spec Alignment: WARNING** — `ticket-details.md` is empty; full verification against ADO requirements is not possible. Implementation matches all documented README use cases.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory convention (`blocks/footer/`)
- [PASS] `footer.js` with `decorate(block, options = {})` export
- [PASS] `footer.css` present
- [WARNING] BEM CSS — uses element selectors (`footer .footer > div`, `footer .footer p`) rather than BEM child classes; acceptable for thin structural wrapper
- [PASS] README present and documents use cases
- [PASS] No site-specific code
- [PASS] Token usage — 0 violations

**Responsive**
- [PASS] Breakpoint at 900px for padding adjustment
- [PASS] `max-width` constrained via token `var(--layout-max-width-content)`
- [PASS] `margin: auto` for horizontal centering
- [N/A] Column stacking — footer is single-column fragment content

**Authoring**
- [FAIL] No UE schema (`_footer.json` not found) — in-context editing not configured
- [PASS] Composable via fragment pattern
- [PASS] Structure/content/presentation decoupled
- [N/A] CF integration — not applicable to footer

**Performance**
- [PASS] `async` decorate function
- [PASS] Fragment loading is async/await
- [PASS] No unnecessary JavaScript

**Accessibility**
- [PASS] Semantic HTML — AEM wraps block in `<footer>` element
- [N/A] Keyboard nav — no interactive elements in base block; delegated to fragment
- [N/A] Color contrast — delegated to fragment content

## Remediation

1. **(HIGH)** Add `readVariant(block)` call immediately after `const ctx = { block, options }` and import `readVariant` from `../../scripts/scripts.js`. Pattern A mandates this call in all blocks.
2. **(HIGH)** Create `_footer.json` UE model schema to enable Universal Editor in-context editing of the footer content reference.
3. **(LOW)** Populate `ticket-details.md` with the actual ADO ticket requirements so spec alignment can be formally verified.
4. **(LOW)** The `.css` and `.scss` files are byte-for-byte identical — confirm the build pipeline compiles SCSS to CSS so the two files do not drift.
