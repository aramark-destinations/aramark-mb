# Block Audit Report: accordion
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | FAIL (5 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/21 items passed |

## Overall: NO-GO

## Details

### Structure

All required files are present in `blocks/accordion/`:

| File | Status |
|---|---|
| `accordion.js` | PASS |
| `accordion.css` | PASS |
| `accordion.scss` | PASS |
| `README.md` | PASS |
| `_accordion.json` | PASS |
| `ticket-details.md` | PASS |

No missing files. Result: PASS.

### Pattern A Compliance

#### 2a. Export Signature
- Named export: `export function decorate(block, options = {})` — PASS (line 24)
- Default export: `export default (block) => decorate(block, window.Accordion?.hooks)` — PASS (line 163)
- `options = {}` default param — PASS

#### 2b. Lifecycle Hooks and Events
- `const ctx = { block, options }` — PASS (line 25)
- `options.onBefore?.(ctx)` before block logic — PASS (line 28)
- `block.dispatchEvent(new CustomEvent('accordion:before', { detail: ctx, bubbles: true }))` — PASS (line 29)
- `readVariant(block)` called — PASS (line 32)
- `options.onAfter?.(ctx)` after block logic — PASS (line 154)
- `block.dispatchEvent(new CustomEvent('accordion:after', { detail: ctx, bubbles: true }))` — PASS (line 155)

All lifecycle hooks and events correctly implemented with `bubbles: true`.

#### 2c. Imports
- `../../scripts/scripts.js`: imports `moveInstrumentation`, `readVariant` — PASS (line 15)
- No imports from `../../scripts/aem.js` — N/A (none required)
- No imports from `../../scripts/baici/utils/config.js` — N/A
- No imports from `../../scripts/baici/utils/utils.js` — N/A

All import paths are correct.

#### 2d. No Site-Specific Code
`window.adobeDataLayer` usage (lines 113–129) is a platform-standard analytics layer — acceptable. No brand names, hard-coded property URLs, or site-specific values present. PASS.

Result: **PASS**

### CSS Token Audit

Audited `accordion.scss` (and verified against compiled `accordion.css`). All violations are outside `:root`. Values inside the `:root` block are token definitions and are exempt.

| # | File Location | Violation | Suggested Fix |
|---|---|---|---|
| 1 | SCSS line 95 / CSS line 88 | `margin: 8px 0 0` on `.accordion-subtitle` | `var(--spacing-008)` |
| 2 | SCSS line 72 / CSS line 68 | `transition: background-color 0.2s` on `summary` | `var(--transition-duration-fast, 0.2s)` |
| 3 | SCSS line 116 / CSS line 108 | `transition: transform 0.2s ease-out` on `summary::after` | `var(--transition-duration-fast, 0.2s)` |
| 4 | SCSS line 105 / CSS line 97 | `font-weight: 300` on `summary::after` | `var(--font-weight-light)` |
| 5 | SCSS line 108 / CSS line 100 | `top: 25px` on `summary::after` (icon positioning) | `var(--spacing-025)` or introduce `--accordion-icon-top` scoped token |

**Total violations: 5 — FAIL (threshold: ≥4)**

Note: `min-height: 48px` on `.accordion-title-container` is a structural accessibility constraint (minimum touch target), not a design token value — not counted. `margin-bottom: 0.8em` uses relative units — not counted. No hard-coded hex colors were found anywhere in the file.

### Spec Alignment

Ticket (`ticket-details.md`) requirements:

| Use Case | Implemented? | Notes |
|---|---|---|
| Author can add accordion to any page section | PASS | Composable block, no template restriction |
| Summary text field (required) | PASS | Col 0 mapped to `<h4 class="accordion-title">` |
| Collapsed by Default boolean toggle (default: true) | PASS | `data-collapsedByDefault` dataset or col 3 fallback |
| Content richtext field | PASS | Col 2 mapped to `.accordion-item-body` |
| Analytics events | PASS | `accordion_panel_expanded` / `accordion_panel_collapsed` pushed to `window.adobeDataLayer` |

UE schema (`_accordion.json`) field alignment with README:

| JSON Field | Ticket | README | Notes |
|---|---|---|---|
| `summary` (text, required) | PASS | PASS | Matches |
| `subtitle` (text, optional) | Not in ticket | PASS | Undocumented extension — present in JS and schema but not in ticket spec |
| `content` (richtext) | PASS | PASS | Matches |
| `collapsed-by-default` (boolean) | PASS | PASS | Matches |

Minor gap: The subtitle column is an undocumented extension relative to the ticket spec. Low risk, but should be reconciled. Ticket notes "Analytics Events: TBD" — analytics are implemented ahead of that specification. Both are positive deviations.

Result: **WARNING** (minor undocumented extension; no major use cases missing)

### Developer Checklist

#### General Block Requirements
| Item | Result |
|---|---|
| Directory convention (`blocks/accordion/`) | PASS |
| JS and CSS files present | PASS |
| BEM CSS class naming | PASS — `.accordion`, `.accordion-item`, `.accordion-item-label`, `.accordion-item-body`, `.accordion-title`, `.accordion-subtitle` |
| README present and substantive | PASS |
| No site-specific code | PASS |
| Token usage in CSS | FAIL — 5 hard-coded values outside `:root` (see CSS audit) |
| Root + Brand cascade support | PASS — `:root` token block defined; brand overrides can target block-scoped tokens |

#### Responsive Design
| Item | Result |
|---|---|
| Breakpoints defined | N/A — single-column block by nature |
| Fluid content | PASS — no fixed widths |
| Column stacking | N/A |
| 1440px max-width | N/A — inherits from section container |

#### Authoring
| Item | Result |
|---|---|
| UE in-context editing | PASS — `moveInstrumentation` called for rows, summary, and subtitle |
| Clear field labels | PASS — JSON model fields are well-labeled and described |
| Composable | PASS — named `decorate` export enables re-use in other blocks |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A — not required by ticket |

#### Performance
| Item | Result |
|---|---|
| Async scripts | N/A — no async dependencies |
| Optimized images | N/A — no images in block |
| No unnecessary JS | PASS |
| Appropriate video embed | N/A |

#### Accessibility (WCAG 2.1)
| Item | Result |
|---|---|
| Keyboard navigation | PASS — native `<details>`/`<summary>` with Home/End key handlers |
| Color contrast | PASS — semantic color tokens; no hard-coded colors |
| Semantic HTML | PASS — `<details>`, `<summary>`, `<h4>`, `<h5>` |
| AT support | PASS — browser-native support for `<details>`/`<summary>` |
| Alt text | N/A — no images |
| Reduced motion | PASS — `prefers-reduced-motion` check applies `.no-motion` class to disable transitions |
| Minimum touch target | PASS — `min-height: 48px` on `.accordion-title-container` |
| Focus visible | PASS — `.keyfocus summary:focus` outline via `var(--focus-outline)` token |

**Score: 17/21 applicable items passed** (4 N/A excluded from denominator, 1 FAIL on token usage)

## Remediation

### P1 — Blocking (required before GO)
1. **Fix 5 CSS token violations in `accordion.scss`:**
   - `margin: 8px 0 0` on `.accordion-subtitle` → `var(--spacing-008)`
   - `transition: background-color 0.2s` on `summary` → `var(--transition-duration-fast, 0.2s)`
   - `transition: transform 0.2s ease-out` on `summary::after` → `var(--transition-duration-fast, 0.2s)`
   - `font-weight: 300` on `summary::after` → `var(--font-weight-light)` (consider adding `--accordion-icon-font-weight` scoped token in `:root`)
   - `top: 25px` on `summary::after` → `var(--spacing-025)` or introduce `--accordion-icon-top` scoped token in `:root`

### P2 — Recommended (before production)
2. **Reconcile subtitle column with ticket spec:** The ticket does not list subtitle as a dialog field. Confirm with stakeholders whether subtitle is a supported authoring feature or an internal implementation detail, and update `ticket-details.md` accordingly.
3. **Resolve open TODO comments:** Decide icon style (+/− vs. chevron arrow) and subtitle column usage before production sign-off. These are flagged in both `accordion.js` and `accordion.scss`.
