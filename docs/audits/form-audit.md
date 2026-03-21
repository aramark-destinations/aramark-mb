# Block Audit Report: form
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/22 items passed |

## Overall: NO-GO

## Details

### Structure

All required files are present:
- `form.js` — present
- `form-fields.js` — present (companion module)
- `form.css` — present
- `form.scss` — present
- `README.md` — present, adequately documented
- `_form.json` — present

No `ticket-details.md` exists for this block. Spec alignment is assessed against the README and solution design.

### Pattern A Compliance

**2a. Export signature — PASS**
- Named export `export async function decorate(block, options = {})` present.
- Default export `export default (block) => decorate(block, window.Form?.hooks)` — correct PascalCase (`Form`), correct wiring.

**2b. Lifecycle hooks and events — PASS**
- `ctx` constructed as `{ block, options }`.
- `options.onBefore?.(ctx)` fires before block logic.
- `block.dispatchEvent(new CustomEvent('form:before', { detail: ctx }))` fires before block logic.
- `options.onAfter?.(ctx)` fires after block logic.
- `block.dispatchEvent(new CustomEvent('form:after', { detail: ctx }))` fires after block logic.
- `readVariant(block)` called at start of block logic.

**Note:** `form:before` and `form:after` events are dispatched without `bubbles: true`. Minor deviation from platform convention.

**2c. Imports — PASS**
- `createField` imported from `./form-fields.js` — local module, correct.
- `readVariant` imported from `../../scripts/scripts.js` — correct.
- `form-fields.js` imports `toClassName` from `../../scripts/aem.js` — correct.

**2d. No site-specific code — PASS**
- No brand names or property-specific values. Form endpoint and definition URL are entirely author-configured at runtime.

### CSS Token Audit

Scanned `form.scss` for hard-coded values.

**Violations found (2):**

```
Line 22: margin-top: 0.25em
  Suggested: margin-top: var(--spacing-*)  (review available spacing tokens)

Line 30: gap: 0.25em var(--spacing-024)
  Suggested: gap: var(--spacing-*) var(--spacing-024)
```

`0.25em` is a relative unit tied to the local font-size rather than a design token. These appear on form selection-wrapper spacing.

**Not flagged (acceptable):**
- `margin-top: 0` — zero value, exempt.
- `padding: 0` — zero value, exempt.
- `border: none` — structural reset, exempt.
- `gap: 1ch` — character-relative unit for selection wrapper spacing, borderline; no token equivalent expected.
- `max-width: 50vw`, `max-width: 33vw` — viewport-relative layout values, no token equivalent.
- `color: firebrick` on required field indicator (line 122) — **this IS a violation**: a named color used for the required-field asterisk. Should use `var(--color-error)` or equivalent semantic token.

**Revised violation count: 3**

```
Line 122: color: firebrick
  Suggested: color: var(--color-error)
```

**Result: WARNING (3 violations)**

### Spec Alignment

No `ticket-details.md` found. Alignment assessed against README and solution design.

**Use cases from solution design (Forms — Custom):**
| Use Case | Implemented? | Notes |
|---|---|---|
| Email-only subscribe forms | PARTIAL | Base block supports any JSON-defined form; subscribe form type not explicitly differentiated |
| General contact forms | YES | JSON-driven field rendering handles any contact form definition |
| RFP forms for large event booking | PARTIAL | Complex forms supported via JSON definition and fieldset grouping |
| Works across all property sites | YES | No site-specific code; endpoint entirely configurable |
| Configurable endpoint or property code differentiation | PARTIAL | Submit URL is authored as a link in the block; no property-code mechanism in base |

**Configurable fields (UE schema vs implementation):**
| Field | In `_form.json` | Used in JS |
|---|---|---|
| `reference` (aem-content — form definition) | YES | Read as `block.querySelectorAll('a')` — first `.json` URL |
| `action` (Action URL) | YES | Read as second link in `block.querySelectorAll('a')` |

The UE schema models a `reference` (content reference) and a text `action` field, but the JS implementation reads two `<a>` elements from the block's rendered HTML. The mapping between UE fields and rendered DOM anchors should be explicitly verified — the authoring contract depends on AEM rendering both fields as anchor elements.

**4d. Design details:**
- Form validation with focus management on first invalid field — implemented.
- Responsive two-column and three-column fieldset layout — implemented via CSS grid.
- Toggle (switch) field type — implemented in `form-fields.js`.
- Confirmation redirect after successful submission — implemented via `form.dataset.confirmation`.

The README does not document the full range of supported field types (heading, plaintext, toggle, fieldset, confirmation) — these exist in `form-fields.js` but are undocumented for authors.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/form/` convention
- [PASS] Has `form.js` with `decorate(block)` export
- [PASS] Has `form.css`
- [PASS] BEM-style CSS classes (`.form`, `.field-wrapper`, `.selection-wrapper`, `.toggle-wrapper`)
- [WARNING] README does not document all supported field types (heading, plaintext, toggle, fieldset, confirmation)
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [WARNING] 3 CSS token violations noted above
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly — single column at mobile, 2-column at 600px, 3-column at 900px
- [PASS] Content expands within margins
- [PASS] Columns stack vertically at mobile
- [N/A] Max-width — form width constrained by `50vw`/`33vw` at breakpoints

**Authoring Contract**
- [PASS] Works with Universal Editor (`_form.json` present)
- [WARNING] Authoring contract relies on two `<a>` elements in rendered DOM; mapping from UE fields to DOM anchors not verified
- [PASS] Composable
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not applicable

**Performance**
- [N/A] Third-party scripts — none
- [N/A] Images — not applicable
- [PASS] No unnecessary JavaScript
- [N/A] Video — not applicable

**Accessibility**
- [PASS] Keyboard navigation — form fields are native HTML inputs
- [FAIL] `color: firebrick` for required field indicator fails token requirement and may not meet WCAG contrast if overridden by brand layer
- [PASS] Semantic HTML — `<form>`, `<fieldset>`, `<legend>`, `<label>` used correctly
- [PASS] `aria-labelledby` applied to textarea and input fields
- [PASS] Focus management on validation failure

## Remediation

**Priority 1 — Blocking**

1. Replace `color: firebrick` (line 122 in `form.scss`) with `var(--color-error)` or an equivalent semantic error color token. This is both a token violation and a potential accessibility issue.

**Priority 2 — Should Fix**

2. Replace `0.25em` spacing values (lines 22, 30) with design spacing tokens.
3. Add `bubbles: true` to `form:before` and `form:after` CustomEvent dispatches.
4. Verify and document the authoring contract: confirm AEM renders the `reference` and `action` UE fields as `<a>` elements accessible to `block.querySelectorAll('a')`.

**Priority 3 — Advisory**

5. Expand README to document all supported field types: `heading`, `plaintext`, `toggle`, `fieldset`, `confirmation`, `text-area`, `select`, `checkbox`, `radio`, `submit`.
6. Add a `ticket-details.md` if a formal ADO ticket exists for this block.
7. Consider adding a `propertyCode` field to `_form.json` to support the spec requirement for property-code-based endpoint differentiation.
