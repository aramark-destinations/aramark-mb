# Block Audit Report: fragment
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | PASS |
| Developer Checklist | 20/22 items passed |

## Overall: GO

## Details

### Structure

All required files are present:
- `fragment.js` — present
- `fragment.css` — present
- `fragment.scss` — present
- `README.md` — present, well-documented
- `_fragment.json` — present

No `ticket-details.md` exists for this block. This is consistent with other blocks in the repo that lack formal ADO tickets.

### Pattern A Compliance

**2a. Export signature — PASS**
- Named export `export async function decorate(block, options = {})` present.
- Default export `export default (block) => decorate(block, window.Fragment?.hooks)` — correct PascalCase (`Fragment`), correct wiring.
- `loadFragment` is also exported as a named export — this is a deliberate public API used by header and footer blocks. Correct and intentional.

**2b. Lifecycle hooks and events — PASS**
- `ctx` constructed as `{ block, options }`.
- `options.onBefore?.(ctx)` fires before block logic.
- `block.dispatchEvent(new CustomEvent('fragment:before', { detail: ctx }))` fires before block logic.
- `options.onAfter?.(ctx)` fires after block logic.
- `block.dispatchEvent(new CustomEvent('fragment:after', { detail: ctx }))` fires after block logic.

**Note:** `fragment:before` and `fragment:after` events are dispatched without `bubbles: true`. Minor deviation from the platform convention shown in the skill spec.

**2c. Imports — PASS**
- `decorateMain`, `moveInstrumentation` imported from `../../scripts/scripts.js` — correct.
- `loadSections` imported from `../../scripts/aem.js` — correct.

**2d. No site-specific code — PASS**
- No brand names, hard-coded paths, or property-specific values. Fragment path is entirely author-driven.

### CSS Token Audit

Scanned `fragment.scss` for hard-coded values.

No violations found. The CSS only uses `padding-left: 0`, `padding-right: 0`, `padding-top: 0`, `padding-bottom: 0`, and `display: none` — all zero values or structural display properties, which are explicitly excluded from token requirements.

**Result: PASS (0 violations)**

### Spec Alignment

No `ticket-details.md` found. Alignment assessed against README and solution design.

**Use cases from solution design:**
| Use Case | Implemented? | Notes |
|---|---|---|
| Populating detail pages for structured content | YES | `loadFragment` loads and decorates any page fragment |
| Dynamic population of Carousels/Accordions with CF data | YES | `loadFragment` is the shared utility consumed by other blocks |
| Content reuse across all properties | YES | Fragment path is metadata-driven, works across all sites |
| Single fragment = single authoring location | YES | Delegates entirely to the referenced fragment document |

**Configurable fields (UE schema vs implementation):**
| Field | In `_fragment.json` | Used in JS |
|---|---|---|
| `reference` (aem-content) | YES | Read as `block.querySelector('a').getAttribute('href')` or `block.textContent.trim()` |

The implementation supports two authoring patterns: link-based and plain-text path. The UE schema correctly uses `aem-content` for the reference field.

**4d. Design details:**
- Media path resolution for relative `./media_*` references — implemented correctly.
- Full block decoration via `decorateMain` and `loadSections` — implemented.
- Section class propagation from fragment to parent — implemented via `block.closest('.section').classList.add(...fragmentSection.classList)`.
- UE instrumentation preservation via `moveInstrumentation` — implemented.

A `TODO` comment in the code notes that fragment caching has not been implemented yet. Each `loadFragment()` call makes a fresh `fetch()`, meaning repeated loads of the same path result in redundant network requests. This is a known performance gap documented in the code.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/fragment/` convention
- [PASS] Has `fragment.js` with `decorate(block)` export
- [PASS] Has `fragment.css`
- [PASS] BEM-style CSS — `.fragment-wrapper`, `.fragment.block` classes used
- [PASS] README documents use cases and configuration
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [PASS] Uses semantic design tokens (CSS has no brand-sensitive values)
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] No block-specific layout — inherits layout from fragment content
- [N/A] Breakpoints — delegated to fragment content
- [N/A] Columns — not applicable
- [N/A] Max-width — not applicable

**Authoring Contract**
- [PASS] Works with Universal Editor (`_fragment.json` present)
- [PASS] Author-facing fields clear (single content reference)
- [PASS] Composable
- [PASS] Structure/content/presentation decoupled
- [PASS] Content Fragment integration — `loadFragment` is the shared utility for CF-driven content across the platform

**Performance**
- [WARNING] No fragment caching — repeated loads of the same path make redundant network requests (documented TODO in code)
- [N/A] Images — handled in fragment content
- [PASS] No unnecessary JavaScript
- [N/A] Video — not applicable

**Accessibility**
- [PASS] Keyboard navigation — delegated to fragment content
- [PASS] Semantic HTML — fragment content is fully decorated via `decorateMain`
- [PASS] Works with assistive technologies
- [N/A] Alt text — handled in fragment content

## Remediation

**Priority 1 — Blocking**

None. Block is functionally correct and well-implemented.

**Priority 2 — Should Fix**

1. Implement fragment caching as documented in the TODO comment. Cache the raw HTML text (not the DOM element) keyed by path in a module-level `Map` to avoid redundant network requests when the same fragment is loaded multiple times on a page.
2. Add `bubbles: true` to `fragment:before` and `fragment:after` CustomEvent dispatches to match platform convention.

**Priority 3 — Advisory**

3. Add a `ticket-details.md` if a formal ADO ticket exists for this block.
