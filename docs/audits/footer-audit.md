# Block Audit Report: footer
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/22 items passed |

## Overall: NO-GO

## Details

### Structure

All required files are present:
- `footer.js` — present
- `footer.css` — present
- `footer.scss` — present
- `README.md` — present, well-documented
- `_footer.json` — present

No `ticket-details.md` exists for this block. Spec alignment is assessed against the README and solution design.

### Pattern A Compliance

**2a. Export signature — PASS**
- Named export `export async function decorate(block, options = {})` present.
- Default export `export default (block) => decorate(block, window.Footer?.hooks)` — correct PascalCase (`Footer`), correct wiring.

**2b. Lifecycle hooks and events — PASS**
- `ctx` constructed as `{ block, options }`.
- `options.onBefore?.(ctx)` fires before block logic.
- `block.dispatchEvent(new CustomEvent('footer:before', { detail: ctx }))` fires before block logic.
- `options.onAfter?.(ctx)` fires after block logic.
- `block.dispatchEvent(new CustomEvent('footer:after', { detail: ctx }))` fires after block logic.

**Note:** `footer:before` and `footer:after` events are dispatched without `bubbles: true`. This is a minor deviation from the platform convention shown in the skill spec.

**2c. Imports — PASS**
- `getMetadata` imported from `../../scripts/aem.js` — correct.
- `loadFragment` imported from `../fragment/fragment.js` — correct relative path for block-to-block import.

**2d. No site-specific code — PASS**
- No brand names, property-specific URLs, or hard-coded values. Footer path defaults to `/footer` and is overridable via metadata.

### CSS Token Audit

Scanned `footer.scss` for hard-coded values.

No violations found. All values use tokens:
- `var(--light-color)` for background
- `var(--body-font-size-xs)` for font size
- `var(--layout-max-width-content)` for max-width
- `var(--spacing-040)`, `var(--spacing-024)`, `var(--spacing-032)` for padding

The single media query breakpoint `(width >= 900px)` is acceptable — CSS custom properties cannot be used in media queries per skill exception rules.

**Result: PASS (0 violations)**

### Spec Alignment

No `ticket-details.md` found. Alignment assessed against README and solution design.

**Use cases from solution design:**
| Use Case | Implemented? | Notes |
|---|---|---|
| Navigation links in footer | PARTIAL | Block delegates fully to fragment content; no explicit handling |
| Social links | PARTIAL | Delegated to fragment content |
| Newsletter subscribe form | NO | No form integration in this base block; requires brand override |
| Ownership/affiliation badges | PARTIAL | Delegated to fragment content |
| Copyright | PARTIAL | Delegated to fragment; README shows dynamic copyright year via `onAfter` hook |
| Subscribe form to property-specific endpoints | NO | Not implemented in base; requires brand-level override |

The footer block is architecturally correct as a thin fragment loader — all content is authored in the `/footer` fragment document. However, the spec calls out subscribe form submission to property-specific endpoints as a footer requirement. There is no mechanism in the base block or UE schema to configure a submit endpoint. This must be addressed at the brand-override level, which is acceptable but should be explicitly documented.

**Configurable fields (UE schema vs implementation):**
| Field | In `_footer.json` | Used in JS |
|---|---|---|
| `reference` (aem-content) | YES | Read via `getMetadata('footer')` for fragment path |

The UE schema exposes a single `aem-content` reference field. This is appropriate for a fragment-based block.

**4d. Design details:**
- Two scroll states (active until scroll / after scroll threshold) documented in solution design for the header — this is not a footer requirement, so N/A here.
- The base implementation correctly uses `getMetadata('footer')` for the fragment path, enabling per-property footer overrides via page metadata.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/footer/` convention
- [PASS] Has `footer.js` with `decorate(block)` export
- [PASS] Has `footer.css`
- [WARNING] BEM-style CSS — footer uses element selectors (`footer .footer > div`, `footer .footer p`) rather than BEM classes on child elements; acceptable for structural layout but not fully BEM
- [PASS] README documents use cases and configuration
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [PASS] Uses semantic design tokens
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly across breakpoints — mobile and desktop padding handled
- [PASS] Content expands within margins
- [N/A] Columns — not applicable
- [PASS] Respects max-width via `var(--layout-max-width-content)`

**Authoring Contract**
- [PASS] Works with Universal Editor (`_footer.json` present)
- [WARNING] Author-facing fields limited — only a content reference; newsletter subscribe endpoint not configurable from UE
- [PASS] Composable
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not applicable to footer

**Performance**
- [N/A] Third-party scripts — none
- [N/A] Images — handled in fragment content
- [PASS] No unnecessary JavaScript
- [N/A] Video — not applicable

**Accessibility**
- [PASS] Keyboard navigation — delegated to fragment content
- [PASS] Semantic HTML — uses `<footer>` element
- [PASS] Works with assistive technologies
- [WARNING] Alt text for images — handled in fragment content, not enforced by block

## Remediation

**Priority 1 — Blocking**

None. Block is functionally correct for a base implementation.

**Priority 2 — Should Fix**

1. Add `bubbles: true` to `footer:before` and `footer:after` CustomEvent dispatches to match platform convention.
2. Document in the README (or a `ticket-details.md` if an ADO ticket exists) how property-specific newsletter subscribe endpoints should be configured — either via UE schema field addition or brand-level override pattern.

**Priority 3 — Advisory**

3. Consider adding a `subscribeEndpoint` field to `_footer.json` to expose the newsletter form submit URL as a configurable UE field, aligning with the spec requirement that "subscription form submits to property-specific endpoints."
4. Add a `ticket-details.md` if a formal ADO ticket exists for this block.
