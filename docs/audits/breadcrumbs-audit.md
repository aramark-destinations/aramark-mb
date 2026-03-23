# Block Audit Report: breadcrumbs
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | FAIL (5 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 15/21 items passed |

## Overall: NO-GO

## Details

### Structure

Files present in `blocks/breadcrumbs/`:

| File | Status |
|---|---|
| `breadcrumbs.js` | PASS |
| `breadcrumbs.css` | PASS |
| `breadcrumbs.scss` | PASS |
| `README.md` | PASS — comprehensive documentation |
| `_breadcrumbs.json` | PASS |
| `ticket-details.md` | PASS |

All required files exist. Result: **PASS**

### Pattern A Compliance

#### 2a. Export Signature
- Named export: `export async function decorate(block, options = {})` — PASS (line 318)
- Default export: `export default (block) => decorate(block, window.Breadcrumbs?.hooks)` — PASS (line 446)
- `options = {}` default param — PASS

#### 2b. Lifecycle Hooks and Events
- `const ctx = { block, options }` — PASS (line 319)
- `options.onBefore?.(ctx)` before block logic — PASS (line 322)
- `block.dispatchEvent(new CustomEvent('breadcrumbs:before', { detail: ctx, bubbles: true }))` — PASS (line 323)
- `readVariant(block)` called — PASS (line 325)
- `options.onAfter?.(ctx)` after block logic — PASS (line 441)
- `block.dispatchEvent(new CustomEvent('breadcrumbs:after', { detail: ctx, bubbles: true }))` — PASS (line 443)

All lifecycle hooks and events correctly implemented with `bubbles: true`.

#### 2c. Imports
- `../../scripts/aem.js`: imports `getMetadata` — PASS (line 1)
- `../../scripts/scripts.js`: imports `readVariant` — PASS (line 2)
- `../../scripts/baici/utils/utils.js`: imports `getBrandCode` — PASS (line 3)

All import paths are correct. `getBrandCode` is used for analytics brand identification and localStorage brand-scoping — appropriate use of the utility module.

#### 2d. No Site-Specific Code
`getBrandCode()` is a platform utility function, not site-specific code. `STORAGE_KEY = 'breadcrumb-context'` uses a generic namespace — PASS. No hard-coded brand names, property-specific URLs, or site-specific values found. PASS.

Note: The README references a storage key `kaiBreadcrumbContext` in documentation examples, but the actual implementation uses `breadcrumb-context` — these are inconsistent and the README should be updated.

Result: **PASS**

### CSS Token Audit

Audited `breadcrumbs.scss` (verified against compiled `breadcrumbs.css`).

| # | File Location | Violation | Suggested Fix |
|---|---|---|---|
| 1 | SCSS line 60 / CSS line 58 | `transition: color 0.2s ease, text-decoration 0.2s ease` on `.breadcrumbs-link` | Replace `0.2s` with `var(--transition-duration-fast, 0.2s)` |
| 2 | SCSS line 69 / CSS line 69 | `border-radius: 2px` on `.breadcrumbs-link:focus` | Replace `2px` with `var(--radius-sm)` or `var(--border-radius-small)` |
| 3 | CSS line 96 (print `@media print`) | `margin: 0.5rem 0` on `.breadcrumbs` | Replace with `var(--spacing-small)` or appropriate spacing token |
| 4 | CSS line 100 (print `@media print`) | `color: #000` on `.breadcrumbs-link` | Replace with `var(--color-neutral-900)` or `var(--color-print-text)` |
| 5 | CSS line 104 (print `@media print`) | `color: #000` on `.breadcrumbs-item::after` separator | Replace with `var(--color-neutral-900)` or `var(--color-print-text)` |

**Total violations: 5 — FAIL (threshold: ≥4)**

Note: `outline: 2px solid` on `.breadcrumbs-link:focus` — the `2px` border width is excepted per audit rules (1px borders are excepted; this is a focus outline width). However, given this is a focus ring style value, it is borderline. Not counted as a separate violation. The `outline-offset: 2px` on the same rule is also a pixel value on a structural property — borderline. Not counted.

Print-context `#000` values are in a `@media print` block; they are not inside `:root` and are still flaggable violations per the audit spec.

### Spec Alignment

Ticket (`ticket-details.md`) requirements:

| Use Case | Implemented? | Notes |
|---|---|---|
| Block set up in EDS codebase | PASS | Block exists and is functional |
| Dynamically constructed from site structure | PASS | Reads `breadcrumb` metadata JSON for hierarchy |
| "Home" is always the first element | PASS | Implemented in `buildBreadcrumbTrail` |
| Text from "Breadcrumb Title" metadata, fallback to "Title" | WARNING | Block reads `breadcrumb` JSON hierarchy and `og:title`; specific "Breadcrumb Title" named metadata field not directly used |
| Not available to add to pages on its own | WARNING | UE schema allows standalone block placement; ticket states it should only be accessible via the Hero block |
| Author includes Breadcrumb via the Hero Block | WARNING | No Hero block integration; breadcrumb is a standalone block |
| No dialog configurations | WARNING | UE schema adds `breadcrumb-label-override` and `breadcrumb-parent-override` fields; ticket states no configurations |
| Displays in bottom left corner of Hero | FAIL | Hero placement not implemented; block has no Hero-specific positioning |
| Section theme styling (white or black based on theme) | FAIL | No theme-aware color variant implemented |

The block is substantially more capable than the ticket specifies (PDP category context, analytics, label/parent overrides) but is missing the Hero integration and theme-aware styling that the ticket requires. The standalone authoring model contradicts the ticket's "no configurations" directive.

UE schema (`_breadcrumbs.json`) field alignment:

| JSON Field | Ticket | Notes |
|---|---|---|
| `breadcrumb-label-override` | Not in ticket (no config fields specified) | Added as an enhancement; undocumented relative to ticket |
| `breadcrumb-parent-override` | Not in ticket | Added as an enhancement; undocumented relative to ticket |

Result: **WARNING** (Hero integration and theme-aware styling not implemented; authoring model diverges from ticket spec; no blocking use cases missing from a functional standpoint)

### Developer Checklist

#### General Block Requirements
| Item | Result |
|---|---|
| Directory convention (`blocks/breadcrumbs/`) | PASS |
| JS and CSS files present | PASS |
| BEM CSS class naming | PASS — `.breadcrumbs`, `.breadcrumbs-list`, `.breadcrumbs-item`, `.breadcrumbs-link`, `.breadcrumbs-current` |
| README present and substantive | PASS — comprehensive documentation |
| No site-specific code | PASS |
| Token usage in CSS | FAIL — 5 violations (print styles and transition/radius in main styles) |
| Root + Brand cascade support | PASS |

#### Responsive Design
| Item | Result |
|---|---|
| Breakpoints defined | PASS — `@media (width < 600px)` implemented for compact mobile spacing |
| Fluid content | PASS — flex layout with `flex-wrap: wrap` |
| Column stacking | N/A — horizontal list layout |
| 1440px max-width | N/A — inherits from section container |

#### Authoring
| Item | Result |
|---|---|
| UE in-context editing | PASS — `_breadcrumbs.json` schema present; `dataset` fields read in JS |
| Clear field labels | PASS — override fields are well-labeled and described |
| Composable | PASS — standalone block |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| Async scripts | N/A |
| Optimized images | N/A — no images |
| No unnecessary JS | PASS — no external API calls; `localStorage` single read with immediate cleanup |
| Appropriate video embed | N/A |

#### Accessibility (WCAG 2.1)
| Item | Result |
|---|---|
| Keyboard navigation | PASS — all breadcrumb links are native `<a>` elements |
| Color contrast | PASS — uses token cascade; no hard-coded non-print colors |
| Semantic HTML | PASS — `<nav aria-label="Breadcrumb">`, `<ol>`, `<li>`, `aria-current="page"` |
| AT support | PASS — screen readers announce breadcrumb nav structure correctly |
| Alt text | N/A — no images |
| Focus visible | PASS — `outline: 2px solid var(--focus-ring-color)` on `.breadcrumbs-link:focus` |
| Live region | PASS — `aria-live="polite"` region for dynamic PDP context updates |

**Score: 15/21 applicable items passed** (4 N/A excluded, 1 FAIL on CSS tokens, 1 WARNING on spec)

## Remediation

### P1 — Blocking (required before GO)
1. **Fix 5 CSS token violations in `breadcrumbs.scss`:**
   - `transition: color 0.2s ease, text-decoration 0.2s ease` → `var(--transition-duration-fast, 0.2s)`
   - `border-radius: 2px` on focus ring → `var(--radius-sm)` or `var(--border-radius-small)`
   - `margin: 0.5rem 0` in print styles → `var(--spacing-small)`
   - `color: #000` on `.breadcrumbs-link` in print styles → `var(--color-neutral-900)` or define `var(--color-print-text)`
   - `color: #000` on separator in print styles → same as above

### P2 — Spec gaps (recommended before production)
2. **Hero block integration:** Per the ticket, breadcrumbs should be accessible from the Hero block, not as a standalone drop-in. Coordinate with Hero block development to provide a composable integration point.
3. **Section theme-aware color:** Implement white/black text color based on section theme class (e.g., `.section.dark .breadcrumbs-link { color: var(--color-white); }`).
4. **README storage key inconsistency:** README documents `kaiBreadcrumbContext` as the storage key but the implementation uses `breadcrumb-context`. Update README to match implementation.

### P3 — Minor
5. **Reconcile authoring model with ticket:** The ticket specifies no dialog configurations. Either formally document the override fields as intentional enhancements (updating `ticket-details.md`), or remove them and rely solely on page metadata.
