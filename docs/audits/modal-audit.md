# Block Audit Report: modal
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | FAIL |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 16/22 items passed |

## Overall: NO-GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `modal.js` | PASS | Present |
| `modal.css` | PASS | Present |
| `modal.scss` | PASS | Present |
| `README.md` | PASS | Present and well documented |
| `_modal.json` | PASS | Present in `blocks/modal/_modal.json` |
| `ticket-details.md` | WARNING | Not present |

All required files are present. `ticket-details.md` is missing; README is used as the reference.

---

### Pattern A Compliance

The modal block is explicitly documented as a non-traditional utility block:

> "This is not a traditional block, so there is no decorate function. Instead, links to a /modals/ path are automatically transformed into a modal."

#### 2a. Export signature — FAIL

- No `export function decorate(block, options = {})` — FAIL (by design, intentional)
- No `export default (block) => decorate(block, window.Modal?.hooks)` — FAIL (by design)

The block exports `createModal(contentNodes)` and `openModal(fragmentUrl)` as its public API, which is intentional. The deviation from Pattern A is architecturally justified and documented in code.

#### 2b. Lifecycle hooks and events — FAIL (N/A by design)

No `ctx`, no `onBefore`/`onAfter` hooks, no `modal:before`/`modal:after` events dispatched. Not applicable for a utility/library block.

#### 2c. Imports

| Import | Path | Result |
|---|---|---|
| `loadFragment` | `../fragment/fragment.js` | PASS — valid cross-block import |
| `buildBlock`, `decorateBlock`, `loadBlock`, `loadCSS` | `../../scripts/aem.js` | PASS |

All import paths are correct.

#### 2d. No site-specific code

PASS — no brand names, hard-coded URLs, or property-specific values. `window.hlx.codeBasePath` is the standard EDS platform variable.

---

### CSS Token Audit

Reviewed `modal.scss` (and confirmed against compiled `modal.css`). All values use CSS custom properties.

Notable usages:
- Spacing: `var(--spacing-024)`, `var(--spacing-032)`, `var(--spacing-048)`, `var(--spacing-064)`
- Color: `var(--color-grey-900)` inside `color-mix()`, `var(--dark-color)`, `var(--text-color)`
- Layout: `var(--layout-max-width-narrow)`, `var(--header-height)`
- Sizing: `var(--sizing-024)`, `var(--weight-s)`, `var(--weight-m)`, `var(--line-height-none)`

**Potentially ambiguous values reviewed:**
- `border-radius: 0` — zero value, exempt
- `padding: 0` — zero value, exempt
- `margin: 0` — zero value, exempt
- `background-color: transparent` — exempt keyword
- `background-color: currentcolor` — exempt keyword
- `color-mix(in srgb, var(--color-grey-900) 75%, transparent)` — uses a token with a `transparent` keyword; no raw hex or rgb values outside this expression
- Media query breakpoint `900px` — exempt
- `calc()` expressions — all use `var()` references inside calc; exempt

No violations found.

**Result: PASS (0 violations)**

---

### Spec Alignment

No `ticket-details.md`. Alignment assessed from README and `_modal.json`.

#### Use cases from README

| Use Case | Implemented | Notes |
|---|---|---|
| Fragment-based content loaded from `/modals/` paths | PASS | `openModal(fragmentUrl)` calls `loadFragment()` |
| Native `<dialog>` element with backdrop | PASS | `dialog` element used; `::backdrop` styled in CSS |
| Close button with accessible label | PASS | `aria-label="Close"` on close button |
| Click-outside-to-close | PASS | Bounds check on dialog click event |
| Body scroll lock when modal is open | PASS | `modal-open` class on `<body>` |
| Programmatic API (`createModal`, `openModal`) | PASS | Both exported and documented |
| Modal removed from DOM on close | PASS | `block.remove()` in `dialog close` listener |
| Scroll reset on modal open | PASS | `dialogContent.scrollTop = 0` via setTimeout |

#### UE schema alignment

The `_modal.json` schema defines `link` (aem-content) and `linkText` (text) fields. However, `modal.js` has no `decorate()` function that reads these fields. The schema appears to define the modal as an authored block trigger (where a link + text would launch a modal), but the JS implementation only provides a programmatic API. This creates a disconnect — the schema suggests author-configurable behavior that is not implemented.

**Result: WARNING** — core programmatic use cases fully implemented; authored `link`/`linkText` fields not consumed by any JS logic.

---

### Developer Checklist

#### Conventions and Code Quality
| Item | Result |
|---|---|
| Directory convention (`/blocks/modal/`) | PASS |
| `decorate(block)` export | FAIL — intentional utility block; no decorate function |
| `modal.css` present | PASS |
| BEM CSS class naming | PASS — `.modal-content`, `.close-button`, `.icon-close` |
| README documents use cases and API | PASS |
| No site-specific code | PASS |
| Token usage in CSS | PASS — 0 violations |
| Root + Brand token cascade supported | PASS |

#### Responsive
| Item | Result |
|---|---|
| Breakpoints present | PASS — 900px breakpoint adjusts width and padding |
| Fluid width | PASS — `calc(100vw - var(--spacing-048))` |
| Max-width respected | PASS — `var(--layout-max-width-narrow)` |
| Column stacking | N/A |

#### Authoring
| Item | Result |
|---|---|
| UE in-context editing | WARNING — `_modal.json` defines fields not consumed by any JS |
| Clear authoring fields | WARNING — `link`/`linkText` fields not documented as non-functional in README |
| Composable — usable by other blocks via API | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | PASS — `loadFragment()` handles fragment-sourced content |

#### Performance
| Item | Result |
|---|---|
| Async scripts | PASS — `createModal` and `openModal` are async |
| CSS loaded lazily | PASS — `loadCSS()` called at runtime in `createModal` |
| No unnecessary JS | PASS |
| Video embed | N/A |

#### Accessibility
| Item | Result |
|---|---|
| Keyboard navigation | PASS — native `<dialog>` provides built-in focus trap |
| Close button accessible label | PASS — `aria-label="Close"` present |
| Semantic HTML | PASS — native `<dialog>` element used |
| Screen reader announcement on open | WARNING — relies on browser's native dialog behavior; no explicit `aria-live` or `role="alertdialog"` |
| Alt text | N/A — no images |

---

## Remediation

**Priority 1 — FAIL (Pattern A): Noted as intentional, no code change required, but documentation needed**

1. **Document Pattern A deviation in README** — Add a note explaining that the modal is a utility block with a programmatic API, not a decorated block. This prevents future developers from incorrectly expecting a `decorate()` function.

**Priority 2 — Should Fix**

2. **Reconcile `_modal.json` with implementation** — Either:
   - Remove `link` and `linkText` fields from `_modal.json` since they are never consumed, or
   - Implement a `decorate()` function that reads these fields and calls `openModal()` when the block is present in the authored page, enabling author-triggered modals without JavaScript.
3. **Add `ticket-details.md`** — Document the block requirements for traceability.

**Priority 3 — Advisory**

4. **Screen reader announcement** — Consider adding `role="alertdialog"` or an `aria-live` region announcement when the modal opens for improved AT support beyond native dialog behavior.
5. **Rule-based modal triggers** — If session-storage-gated popups (e.g., "show once per session") are a planned use case, document the extension point in the README.
