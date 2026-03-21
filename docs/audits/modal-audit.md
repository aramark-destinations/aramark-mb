# Block Audit Report: modal
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | FAIL |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 16/23 items passed |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `modal.js` | YES | YES |
| `modal.css` | YES | YES |
| `modal.scss` | YES | YES |
| `README.md` | YES | YES |
| `_modal.json` | YES | YES |
| `ticket-details.md` | YES | NO |

Result: WARNING — All required files are present. `ticket-details.md` is missing; README is present and documents the API, use cases, and HTML output structure adequately.

---

### Pattern A Compliance

#### 2a. Export signature

The modal block intentionally has **no `decorate()` function** — it is a utility/library block, not a traditional decorated block. It exports `createModal()` and `openModal()` named functions, and has **no default export** using the Pattern A form.

- No `export function decorate(block, options = {})` — FAIL
- No `export default (block) => decorate(block, window.Modal?.hooks)` — FAIL

This is a known architectural deviation explicitly documented in the block's source code comment:
> "This is not a traditional block, so there is no decorate function."

The deviation is intentional and documented. However, the block does not conform to Pattern A.

#### 2b. Lifecycle hooks and events

No `before`/`after` lifecycle hooks or custom events are dispatched — FAIL (N/A by design).

#### 2c. Imports

Imports are correct:
- `../../scripts/aem.js` — `buildBlock`, `decorateBlock`, `loadBlock`, `loadCSS` — PASS
- `../fragment/fragment.js` — `loadFragment` — PASS (valid cross-block import)

#### 2d. No site-specific code

No brand-specific logic, hard-coded brand names, or property-specific values found — PASS.

---

### CSS Token Audit

The `modal.scss` file was reviewed for hard-coded values. All spacing, color, and sizing values use CSS custom properties. No violations found.

Notable token-compliant usages:
- `var(--spacing-048)`, `var(--spacing-024)`, `var(--spacing-032)`, `var(--spacing-064)`
- `var(--color-grey-900)` (via `color-mix()`)
- `var(--layout-max-width-narrow)`, `var(--header-height)`
- `var(--weight-s)`, `var(--weight-m)`, `var(--dark-color)`, `var(--text-color)`
- `var(--sizing-024)`, `var(--line-height-none)`

Media query breakpoint (`900px`) — acceptable exception per skill rules.

Result: PASS (0 violations)

---

### Spec Alignment

`ticket-details.md` is absent for this block. The README and solution design documentation were used as the reference.

| Use Case | Implemented? | Notes |
|---|---|---|
| Dynamic modals (rule-based, popup after page load) | PARTIAL | Block provides the mechanism but rule-based trigger logic is not implemented in this block; must be handled by the consuming page/script |
| Modals triggered from links/buttons | YES | `openModal(fragmentUrl)` supports this |
| Content sourced from Experience Fragments | YES | `loadFragment(path)` fetches fragment content |
| Button "Open in Modal" behavior with XF link/path | YES | `openModal()` accepts any fragment URL |
| Native `<dialog>` element with backdrop | YES | Implemented |
| Close button with accessible label | YES | `aria-label="Close"` present |
| Click-outside-to-close | YES | Dialog click bounds check implemented |
| Body scroll lock | YES | `modal-open` class on body |
| Programmatic API (`createModal`, `openModal`) | YES | Both exported |

The UE JSON schema (`_modal.json`) defines a `link` and `linkText` field — however, the JS implementation does not have a `decorate()` function that reads these fields. The schema appears to be a placeholder and does not align with actual rendering logic. This is a minor gap.

Result: WARNING — Rule-based display mechanism is delegated outside the block; UE schema fields are not consumed by any decorate logic.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/modal/` convention
- [FAIL] No `decorate(block)` export — intentional utility block deviation
- [PASS] Has `modal.css`
- [PASS] BEM-style CSS classes (`.modal-content`, `.close-button`)
- [PASS] README documents use cases and API
- [PASS] Part of shared global library — no site-specific code
- [PASS] Brand differentiation via tokens only
- [PASS] Uses semantic design tokens — no hard-coded values
- [PASS] Supports Root + Brand token cascade

#### Responsive Design
- [PASS] Single breakpoint at 900px adjusts padding
- [PASS] Width uses `calc(100vw - var(--spacing-048))` — fluid
- [PASS] Respects max-width via `var(--layout-max-width-narrow)`
- [N/A] Column stacking — not applicable
- [PASS] Max-width respected

#### Authoring Contract
- [WARNING] UE JSON schema defines fields not consumed by the JS implementation
- [PASS] Author-facing fields documented in README
- [PASS] Composable — used by other blocks via API
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — handled via `loadFragment()`

#### Performance
- [N/A] Third-party scripts — none
- [N/A] Images — none
- [PASS] No unnecessary JavaScript
- [N/A] Video — none

#### Accessibility (WCAG 2.1)
- [PASS] Keyboard navigation — native `<dialog>` supports focus trap
- [PASS] Close button has `aria-label="Close"`
- [PASS] Semantic HTML — native `<dialog>` element used
- [WARNING] Screen reader announcement on open not explicitly implemented (relies on browser's native dialog behavior)
- [N/A] Alt text — no images

---

## Remediation

**Priority 1 — Blocking**
1. Add `ticket-details.md` to document the block's requirements and intended behavior.

**Priority 2 — Should Fix**
2. Align UE JSON schema with actual behavior: either remove the `link`/`linkText` fields from `_modal.json` (since they are never read by decorate logic), or document that these fields are only used in a future authoring context.
3. Document the intentional Pattern A deviation in the README so future developers understand why this block lacks a `decorate()` export.

**Priority 3 — Nice to Have**
4. Consider adding an `aria-live` or `role="status"` announcement when the modal opens for improved screen reader support beyond native dialog behavior.
5. Add rule-based display logic (e.g., session-storage-gated popup after page load) either in this block or as a documented extension point.
