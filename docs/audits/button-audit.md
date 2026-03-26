# Block Audit Report: button
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | FAIL (9 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 14/21 items passed |

## Overall: NO-GO

## Details

### Structure

Files present in `blocks/button/`:

| File | Status |
|---|---|
| `button.js` | PASS |
| `button.css` | PASS |
| `button.scss` | PASS |
| `README.md` | PASS |
| `ticket-details.md` | PASS |
| `_button.json` | WARNING — MISSING |

`_button.json` is absent. The block has author-configurable fields (link style, color) but no Universal Editor schema file exists to expose these as authoring dialogs.

Result: **WARNING** (missing UE JSON schema for a block with author-configurable fields)

### Pattern A Compliance

#### 2a. Export Signature
- Named export: `export function decorate(block, options = {})` — PASS (line 11)
- Default export: `export default (block) => decorate(block, window.Button?.hooks)` — PASS (line 44)
- `options = {}` default param — PASS

#### 2b. Lifecycle Hooks and Events
- `const ctx = { block, options }` — PASS (line 13)
- `options.onBefore?.(ctx)` before block logic — PASS (line 16)
- `block.dispatchEvent(new CustomEvent('button:before', { detail: ctx, bubbles: true }))` — PASS (line 17)
- `readVariant(block)` called — PASS (line 20)
- `options.onAfter?.(ctx)` after block logic — PASS (line 35)
- `block.dispatchEvent(new CustomEvent('button:after', { detail: ctx, bubbles: true }))` — PASS (line 36)

All lifecycle hooks and events correctly implemented with `bubbles: true`.

#### 2c. Imports
- `../../scripts/scripts.js`: imports `readVariant` — PASS (line 9)
- No other imports needed — N/A

All import paths are correct.

#### 2d. No Site-Specific Code
No brand names, hard-coded property URLs, or site-specific values present. PASS.

Result: **PASS**

### CSS Token Audit

Audited `button.scss` (verified against compiled `button.css`). The `color-black` and `color-white` variant blocks define CSS custom properties using `var(--token, #hardcoded-fallback)` patterns. These fallback values are hard-coded hex colors outside `:root` and are flaggable violations.

| # | File Location | Violation | Suggested Fix |
|---|---|---|---|
| 1 | SCSS/CSS line 13 | `font-weight: 600` on `.button a` | `var(--font-weight-bold)` — `--font-weight-semibold` (600) removed from token system (ADO-89) |
| 2 | SCSS/CSS line 15 | `transition: ... 0.2s ease` (three properties) on `.button a` | Replace `0.2s` with `var(--transition-duration-fast, 0.2s)` |
| 3 | SCSS/CSS line 77 | `--button-bg: var(--color-neutral-900, #000)` in `.color-black` | Remove `#000` fallback; rely on `var(--color-neutral-900)` |
| 4 | SCSS/CSS line 78 | `--button-bg-hover: var(--color-neutral-800, #333)` in `.color-black` | Remove `#333` fallback; rely on `var(--color-neutral-800)` |
| 5 | SCSS/CSS line 79 | `--button-text: var(--color-neutral-50, #fff)` in `.color-black` | Remove `#fff` fallback; rely on `var(--color-neutral-50)` |
| 6 | SCSS/CSS line 80 | `--button-border: var(--color-neutral-900, #000)` in `.color-black` | Remove `#000` fallback |
| 7 | SCSS/CSS line 81 | `--button-text-link: var(--color-neutral-900, #000)` in `.color-black` | Remove `#000` fallback |
| 8 | SCSS/CSS line 86 | `--button-bg: var(--color-neutral-50, #fff)` in `.color-white` | Remove `#fff` fallback |
| 9 | SCSS/CSS line 87 | `--button-bg-hover: var(--color-neutral-200, #e5e5e5)` in `.color-white` | Remove `#e5e5e5` fallback |

Additional violations (lines 88–90) in `.color-white`: `#000`, `#fff`, `#fff` fallbacks follow the same pattern — counted in total above.

**Total violations: 9+ — FAIL (threshold: ≥4)**

Note: Primary, secondary, and tertiary color variant blocks use no hard-coded fallbacks and are clean. The hex fallbacks in `color-black` and `color-white` were likely added as defensive fallbacks before the design token system was fully defined; they should be removed once the neutral token scale is confirmed in the project's CSS variables.

### Spec Alignment

Ticket (`ticket-details.md`) requirements:

| Use Case | Implemented? | Notes |
|---|---|---|
| Standalone block usable in sections, columns, tabs, accordions | PASS | Composable; no template restriction |
| Included in other components (Hero, Cards) | PASS | Named `decorate` export enables re-use |
| Multi-button multi-fieldset (add, reorder) | WARNING | JS reads multiple `<a>` elements from block rows; no explicit UE multi-fieldset schema exists since `_button.json` is missing |
| Button Link (Link / Download / Trigger Modal) | WARNING | Link field read from DOM; Download and modal trigger behaviors not implemented in JS |
| Button Text | PASS | Link text is authored content |
| Button Screen Reader Text | FAIL | No `aria-label` or separate accessible label field or JS handling |
| Button Style (Filled / Outlined / Text-only) | PASS | Implemented via `data-linktype`; CSS classes `filled`, `outlined`, `text-only` |
| Button Color (Primary / Secondary / Tertiary / Black / White) | PASS | Implemented via `data-linkcolor`; CSS classes `color-primary` through `color-white` |
| Default multi-button inline layout with ≥8px gap | PASS | `display: flex; flex-wrap: wrap; gap: var(--spacing-008)` |
| Buttons wrap to next line when overflow | PASS | `flex-wrap: wrap` implemented |
| Section theme variations | WARNING | Not implemented; no CSS cascade for section-level theme overrides |

Key gaps relative to ticket:
- **No `_button.json`** — authors cannot configure style, color, or any field via Universal Editor dialogs
- **Button Screen Reader Text** — the ticket's "Button Screen Reader Text" field has no corresponding implementation
- **Modal trigger behavior** — linking to an Experience Fragment to trigger a modal is not implemented

Result: **WARNING** (UE schema missing blocks the authoring contract; screen reader text and modal trigger are unimplemented ticket requirements)

### Developer Checklist

#### General Block Requirements
| Item | Result |
|---|---|
| Directory convention (`blocks/button/`) | PASS |
| JS and CSS files present | PASS |
| BEM CSS class naming | WARNING — `.button a` selector is not BEM-compliant; should be `.button-link` |
| README present and substantive | PASS |
| No site-specific code | PASS |
| Token usage in CSS | FAIL — 9 violations (hex fallbacks and font-weight/transition hard-coded) |
| Root + Brand cascade support | PASS — color variant custom properties enable brand override |

#### Responsive Design
| Item | Result |
|---|---|
| Breakpoints defined | N/A — inline flex layout handles wrapping without explicit breakpoints |
| Fluid content | PASS — flex with `flex-wrap: wrap` |
| Column stacking | N/A |
| 1440px max-width | N/A — inherits from container |

#### Authoring
| Item | Result |
|---|---|
| UE in-context editing | FAIL — no `_button.json` schema; no UE authoring contract |
| Clear field labels | FAIL — no schema fields defined |
| Composable | PASS — named `decorate` export and hook support |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| Async scripts | N/A |
| Optimized images | N/A |
| No unnecessary JS | PASS |
| Appropriate video embed | N/A |

#### Accessibility (WCAG 2.1)
| Item | Result |
|---|---|
| Keyboard navigation | PASS — native `<a>` elements |
| Color contrast | WARNING — relies on `var(--color-brand-primary)` etc.; unverifiable in static audit; `color-white` on light backgrounds may have contrast issues |
| Semantic HTML | PASS — anchor elements |
| AT support | WARNING — no accessible description/title field; screen reader text gap from ticket |
| Alt text | N/A |

**Score: 14/21 applicable items passed** (4 N/A excluded, 2 FAIL items, 2 WARNINGs)

## Remediation

### P1 — Blocking (required before GO)
1. **Create `_button.json` UE schema** exposing author-configurable fields. Minimum required fields per ticket:
   - `link` (aem-content) — button URL (page, download, or modal fragment)
   - `text` (text) — visible button label
   - `screenReaderText` (text) — accessible description (maps to `aria-label`)
   - `linktype` (select: filled / outlined / text-only) — button style
   - `linkcolor` (select: primary / secondary / tertiary / black / white) — button color
   - Use item-model pattern to support multiple buttons per block

2. **Implement Button Screen Reader Text in JS:** Read `data-linkscreenreadertext` or equivalent field value and apply as `aria-label` on the anchor element. This is a named ticket requirement.

3. **Fix 9 CSS token violations in `button.scss`:**
   - `font-weight: 600` → `var(--font-weight-bold)` (note: `--font-weight-semibold` removed from token system in ADO-89)
   - `transition: ... 0.2s ease` → `var(--transition-duration-fast, 0.2s)`
   - Remove all `#000`, `#333`, `#fff`, `#e5e5e5` hex fallbacks from `color-black` and `color-white` variant rules; rely on `var(--color-neutral-*)` token chain

### P2 — Recommended
4. **Implement modal trigger behavior:** When `data-linktype="trigger-modal"`, intercept click and open referenced Experience Fragment in a modal overlay rather than navigating.
5. **BEM class naming:** Rename `.button a` selector to `.button-link` for explicit BEM compliance.
6. **Section theme variations:** Add CSS cascade for section-level theme overrides (e.g., `.section.dark .button a` token overrides) per ticket Figma reference.
