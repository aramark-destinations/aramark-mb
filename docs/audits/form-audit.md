# Block Audit Report: form
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 15/19 items passed |

## Overall: GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `form.js` | PASS | Present |
| `form-fields.js` | PASS | Companion module present |
| `form.css` | PASS | Present |
| `form.scss` | PASS | Present |
| `README.md` | PASS | Present, adequately documented |
| `_form.json` | WARNING | Not found in block dir or `/models/` |
| `ticket-details.md` | WARNING | File committed but empty — zero content |

Required JS and CSS files are present. Two warnings: no UE model schema and an empty `ticket-details.md`.

### Pattern A Compliance

**2a. Export signature**
- Named export: `export async function decorate(block, options = {})` — PASS (line 88)
- Default export: `export default (block) => decorate(block, window.Form?.hooks)` — PASS (line 124)
- `options = {}` default param — PASS

**2b. Lifecycle hooks and events**
- `const ctx = { block, options }` — PASS (line 89)
- `options.onBefore?.(ctx)` before block logic — PASS (line 92)
- `block.dispatchEvent(new CustomEvent('form:before', { detail: ctx, bubbles: true }))` — PASS (line 93)
- `readVariant(block)` called — PASS (line 96); imported from `../../scripts/scripts.js`
- `options.onAfter?.(ctx)` after block logic — PASS (line 120)
- `block.dispatchEvent(new CustomEvent('form:after', { detail: ctx, bubbles: true }))` — PASS (line 121)

**2c. Imports**
- `createField` from `./form-fields.js` — PASS (line 8), local companion module
- `readVariant` from `../../scripts/scripts.js` — PASS (line 9)
- `toClassName` from `../../scripts/aem.js` — PASS in `form-fields.js` (line 1)

**2d. No site-specific code**
- No brand names, hard-coded URLs, or property-specific values — PASS
- Form definition URL and submit endpoint are entirely author-configured at runtime

**Overall Pattern A: PASS**

### CSS Token Audit

Audited `form.scss` (172 lines).

**Violations found (2):**

| Line | Selector | Property | Value | Suggested Fix |
|---|---|---|---|---|
| 129 | `.form .toggle-wrapper .switch` | `width` | `52px` | `var(--sizing-052)` or equivalent sizing token |
| 130 | `.form .toggle-wrapper .switch` | `height` | `28px` | `var(--sizing-028)` or equivalent sizing token |
| 133 | `.form .toggle-wrapper input` | `width` | `52px` | same as above — same toggle dimensions repeated |
| 134 | `.form .toggle-wrapper input` | `height` | `28px` | same as above |
| 143 | `.form .toggle-wrapper .slider` | `border-radius` | `28px` | `var(--radius-pill)` or `var(--radius-circle)` if token exists |

Note: lines 129–130 and 133–134 are the same two physical dimensions applied twice (once on `.switch`, once on the `input` within it). They count as 2 unique violations (width and height) with repeated application, giving a total of **2 violations with 4 affected declarations** for the toggle component, plus 1 additional for the slider `border-radius`.

Revised count treating unique hard-coded values: **3 hard-coded values** → `52px`, `28px`, `28px border-radius` → WARNING threshold.

**Not flagged (acceptable):**
- `margin: 0`, `padding: 0`, `border: none` — zero or structural reset values, exempt
- `gap: 1ch`, `margin-inline-start: 1ch`, `padding-left: 1ch` — character-relative units; no token equivalent exists
- `max-width: 50vw`, `max-width: 33vw` — viewport-relative layout values; no token equivalent expected
- `opacity: 0` on toggle input — structural/functional, exempt
- `grid-template-columns: repeat(2, auto)`, `repeat(3, auto)` — layout values, exempt
- Media query breakpoints `600px`, `900px` — exempt
- All `var(--*)` usages — compliant

**Result: WARNING (2–3 violations, primarily in the toggle switch component)**

### Spec Alignment

`ticket-details.md` is committed but contains no content. Alignment evaluated against `README.md` only.

| Use Case (from README) | Implemented | Notes |
|---|---|---|
| Dynamic form generation from JSON data | PASS | `createForm()` fetches `.json` and renders all fields |
| Field grouping into fieldsets | PASS | `fieldsets` queried and fields grouped by `data-fieldset` |
| Form validation with focus management | PASS | `checkValidity()` + `firstInvalidEl.focus()` on submit |
| Async submission with loading state | PASS | `data-submitting` attribute used; submit button disabled during request |
| Confirmation redirect after success | PASS | `form.dataset.confirmation` used for redirect |
| Lifecycle hooks `onBefore`/`onAfter` | PASS | Both hooks implemented |
| Events `form:before`/`form:after` | PASS | Dispatched with `bubbles: true` |

**Field types supported in `form-fields.js` (not all documented in README):**
Text, email, number, date, tel, select, checkbox, radio, textarea, toggle, heading, plaintext, fieldset, submit — the README only documents the block-level authoring contract, not the full field type catalogue. This is a documentation gap rather than an implementation gap.

**Spec Alignment: WARNING** — `ticket-details.md` is empty; full ADO requirement verification not possible. All README-documented use cases are implemented.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory convention (`blocks/form/`)
- [PASS] `form.js` with `decorate(block, options = {})` export
- [PASS] `form.css` present
- [PASS] BEM-style CSS classes — `.form`, `.field-wrapper`, `.selection-wrapper`, `.toggle-wrapper`, `.slider`, `.switch`
- [WARNING] README does not enumerate all supported field types (`heading`, `plaintext`, `toggle`, `fieldset`, `confirmation`)
- [PASS] No site-specific code
- [PASS] Token usage — minor violations in toggle component only

**Responsive**
- [PASS] Single column at mobile, 2-column fieldset at 600px, 3-column at 900px
- [PASS] Input max-width constrained by `50vw`/`33vw` at breakpoints
- [PASS] Columns stack at mobile via `grid-auto-flow: row` default
- [N/A] Overall page max-width — form inherits page layout

**Authoring**
- [FAIL] No UE schema (`_form.json` not found) — in-context editing not configured
- [PASS] Composable — form definition is a separate JSON document
- [PASS] Structure/content/presentation decoupled
- [N/A] CF integration — not applicable

**Performance**
- [PASS] `async` decorate function; form creation is async
- [PASS] `data-submitting` guard prevents duplicate submissions
- [PASS] No unnecessary JavaScript
- [N/A] Images/video — not applicable

**Accessibility**
- [PASS] Semantic HTML — `<form>`, `<fieldset>`, `<legend>`, `<label>`, `<button type="submit">` used correctly
- [PASS] `label[for]` association with inputs via `fd.Id`
- [PASS] Required field indicator marked via `data-required` attribute + CSS `::after`
- [PASS] `color: var(--color-error)` used for required asterisk — no raw color values
- [PASS] Focus management on first invalid field after failed submit
- [PASS] Scroll into view for first invalid field (`scrollIntoView({ behavior: 'smooth' })`)
- [PASS] Submit button disabled during async request

## Remediation

1. **(HIGH)** Create `_form.json` UE model schema to enable Universal Editor in-context editing and expose form definition reference and submit endpoint as configurable fields.
2. **(MEDIUM)** Replace hard-coded pixel dimensions in the toggle switch component — `52px` (width) and `28px` (height/border-radius) — with sizing tokens (e.g., `var(--sizing-052)`, `var(--sizing-028)`, `var(--radius-pill)`). Lines 129–130, 133–134, 143 in `form.scss`.
3. **(LOW)** Populate `ticket-details.md` with the actual ADO ticket requirements.
4. **(LOW)** Expand README to document all supported field types available in `form-fields.js` so authors and brand developers know what field types can be configured in the form JSON definition.
