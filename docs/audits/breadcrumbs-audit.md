# Block Audit Report: breadcrumbs
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | ~~FAIL~~ → **PASS** *(validated 2026-03-20: named export, lifecycle hooks, before/after events, and readVariant all confirmed present)* |
| CSS Token Usage | WARNING (3 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 15/21 items passed |

## Overall: NO-GO
*(Pattern A is now resolved; remaining blockers: CSS token violations and spec gaps — see Details below)*

## Details

### Structure

Files present:
- `breadcrumbs.js` — present
- `breadcrumbs.css` — present
- `breadcrumbs.scss` — present (source)
- `README.md` — present and comprehensive
- `_breadcrumbs.json` — present
- `breadcrumbs.test.js` — present (bonus)
- `ticket-details.md` — present

All required files exist. Result: PASS

### Pattern A Compliance

**2a. Export signature**
- The `decorate` function is exported as `export default async function decorate(block)` — this is a **default export only**, not a named export.
- There is **no named export** `export function decorate(block, options = {})`.
- There is **no Pattern A default export** wiring `window.Breadcrumbs?.hooks`.
- The `options = {}` parameter and lifecycle hooks are entirely absent.

This is a direct violation of the Pattern A contract required by the project. The function signature `export default async function decorate(block)` is a plain EDS block default export, not the extensible Pattern A form.

**2b. Lifecycle hooks and events**
- No `ctx = { block, options }` — FAIL
- No `options.onBefore?.(ctx)` — FAIL
- No `block.dispatchEvent(new CustomEvent('breadcrumbs:before', ...))` — FAIL
- No `options.onAfter?.(ctx)` — FAIL
- No `block.dispatchEvent(new CustomEvent('breadcrumbs:after', ...))` — FAIL
- `readVariant(block)` is not called — FAIL

**2c. Imports**
- `getMetadata` imported from `../../scripts/aem.js` — PASS
- `getBrandCode` imported from `../../scripts/baici/utils/utils.js` — PASS
- No import of `readVariant` or `moveInstrumentation` from `../../scripts/scripts.js` — expected imports for Pattern A blocks are absent

**2d. No site-specific code**
- `getBrandCode()` is used for analytics brand identification and localStorage brand-scoping. This is a platform utility, not site-specific code — PASS
- `STORAGE_KEY = 'kaiBreadcrumbContext'` uses a "kai" prefix that appears to be from a prior project or brand context. This key name should be reviewed for alignment with the project's namespace conventions.
- No hard-coded brand names or property-specific URLs — PASS

Result: FAIL (missing named export, missing lifecycle hooks and before/after events, missing `readVariant` call — all blocking Pattern A requirements)

### CSS Token Audit

Scanned `breadcrumbs.scss`.

**Line 24:** `background-color: var(--color-neutral-100, #f3f4f6);`
  Suggested: Remove `#f3f4f6` fallback; rely on `var(--color-neutral-100)` token directly

**Line 52:** `color: var(--color-neutral-500, #6b7280);`
  Suggested: Remove `#6b7280` fallback; rely on `var(--color-neutral-500)` token directly

**Line 58:** `color: var(--link-color, #06c);`
  Suggested: Remove `#06c` fallback; rely on `var(--link-color)` token directly

Additional instances at lines 64 (`#0052a3`), 69 (`#06c`) follow the same pattern of hard-coded hex fallbacks inside token declarations outside `:root`.

Print media query (lines 106, 111) uses hard-coded `#000` which is acceptable in print context as a contrast override.

Result: WARNING (3 primary violations — hard-coded hex fallbacks on color tokens; additional instances present)

### Spec Alignment

Ticket requirements (from `ticket-details.md`):

| Use Case | Implemented? | Notes |
|---|---|---|
| Not available to add to pages on its own | PARTIAL | UE schema allows standalone block addition; ticket states it should only be accessible via the Hero block |
| Author includes Breadcrumb via the Hero Block | NO | No Hero integration implemented; breadcrumb is a standalone block |
| No dialog configurations | PARTIAL | UE schema adds `breadcrumb-label-override` and `breadcrumb-parent-override` fields, which the ticket says should have no configurations |
| First link is always "Home" linked to property homepage | YES | Implemented |
| Text value from "Breadcrumb Title" page metadata, fallback to "Title" | PARTIAL | Implementation reads `breadcrumb` metadata (JSON hierarchy) and `og:title`; the ticket specifies a "Breadcrumb Title" metadata field specifically |
| Displays in bottom left corner of Hero | NO | Styling/placement in Hero not implemented |
| Section theme color (white/black based on section theme) | NO | No theme-aware color variant implemented |

The block is a capable standalone breadcrumb with advanced features (PDP category context, analytics, overrides), but it diverges significantly from the ticket spec which calls for a simpler Hero-embedded component with no author configuration fields.

The README and implementation reflect an expanded, feature-rich design that was not specified in the ticket. This is not necessarily wrong, but the Hero integration and theme-aware styling are missing.

Result: WARNING (Hero integration, theme-aware styling, and Hero-only placement are unimplemented; the block's standalone authoring model contradicts the ticket's "no configurations" directive)

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/breadcrumbs/` convention
- [FAIL] Pattern A export signature not implemented
- [PASS] Has `breadcrumbs.css`
- [PASS] BEM-style CSS classes (`.breadcrumbs-list`, `.breadcrumbs-item`, `.breadcrumbs-link`, `.breadcrumbs-current`)
- [PASS] README documents use cases and configuration (comprehensive)
- [PASS] Part of shared global library
- [PASS] Brand differentiation via tokens only
- [WARNING] CSS token fallbacks include hard-coded hex values
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Mobile-first responsive design implemented
- [PASS] Content fluidly expands within margins
- [N/A] Column stacking
- [PASS] Respects 1440px max-width (inherits from container)

**Authoring Contract**
- [PASS] Works with Universal Editor (dataset fields read correctly)
- [PASS] Author-facing fields documented
- [PASS] Composable — standalone block
- [PASS] Structure/content/presentation decoupled

**Performance**
- [N/A] Third-party scripts
- [N/A] Images
- [PASS] No unnecessary JavaScript
- [N/A] Video

**Accessibility (WCAG 2.1)**
- [PASS] Keyboard navigation (all links focusable)
- [PASS] Color contrast (relies on token cascade)
- [PASS] Semantic HTML (`<nav>`, `<ol>`, `<li>`, `aria-current="page"`, `aria-label="Breadcrumb"`)
- [PASS] Works with assistive technologies
- [N/A] Alt text

Score: 15/21 applicable items passed (1 FAIL on Pattern A, 1 WARNING on tokens).

## Remediation

**Priority 1 — Blocking (must fix before GO)**
1. Refactor `breadcrumbs.js` to implement Pattern A:
   - Change `export default async function decorate(block)` to `export async function decorate(block, options = {})`
   - Add `ctx = { block, options }`, `onBefore`/`onAfter` hooks, and `breadcrumbs:before`/`breadcrumbs:after` CustomEvent dispatches
   - Add `export default (block) => decorate(block, window.Breadcrumbs?.hooks)`
   - Add `readVariant(block)` call

**Priority 2 — Spec gaps (should fix)**
2. Implement Hero block integration — per the ticket, breadcrumbs should be accessible through the Hero block, not as a standalone drop-in. Coordinate with Hero block development.
3. Implement section theme-aware color (white text on dark themes, black text on light themes) using CSS class or token overrides.
4. Reconsider the UE schema — the ticket states no dialog configurations. Either align the schema to have no fields (relying on page metadata only) or formally document the deviation as an intentional enhancement.
5. Rename the localStorage key from `kaiBreadcrumbContext` to a namespace consistent with this project.

**Priority 3 — CSS cleanup**
6. Remove hard-coded hex fallbacks from `breadcrumbs.scss` — rely on the token cascade without redundant fallback values.
