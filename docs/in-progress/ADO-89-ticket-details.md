# ADO-89 — Typography: Align Font Families and Tokens to Figma Spec

**Branch:** `ado-89-text`
**Status:** In review

---

## Scope

Update the global typography token system to match the Figma design specification for the Aramark Destinations platform.

### Font Family Changes

- Replace legacy Roboto (body) and Roboto Condensed (headings) with **Inter** (body) and **Montserrat** (headings/display/testimonial).
- Both font families are declared as a single variable weight range `@font-face` block using existing self-hosted woff2 files in `/fonts/`.

### New Typography Tokens (added to `styles/styles.scss`)

| Token group | Tokens added |
|---|---|
| Body line-heights | `--body-line-height-m/s/xs/xxs` |
| Body font weights | `--body-font-weight-light/regular/medium` |
| Body letter-spacing | `--body-letter-spacing: -0.02em` |
| Display | `--display-font-size`, `--display-line-height`, `--display-letter-spacing` |
| Heading (Figma-aligned sizes) | `--heading-font-size-h1/h2/h3/h4` |
| Eyebrow | `--eyebrow-font-family/weight/size-s/m/l/line-height/letter-spacing/text-transform` |
| Details/micro-text | `--details-font-size/line-height/font-weight-light/dark` |
| Testimonial/quote | `--testimonial-font-family/size/weight/line-height` |
| Input | `--input-font-weight-light/heavy`, `--input-font-size-base/error`, `--input-line-height-base/error` |

### Base Token Additions (`styles/root-tokens.scss`)

- `--font-weight-thin: 100`
- `--font-weight-light: 300`

### Utility Classes (added to `styles/typography.scss`)

`.text-display`, `.eyebrow`, `.eyebrow-s`, `.eyebrow-m`, `.eyebrow-l`, `.text-details`, `.text-details-dark`, `.text-testimonial`

### Heading Line-Height Fix

`--heading-line-height` corrected from `1.3em` → `1.3` (unitless) to prevent line-height compounding in descendant elements.

---

## Post-Audit TODOs (from Figma typography audit — 2026-03-25)

| # | Finding | Action | Status |
|---|---|---|---|
| 1 | `--font-weight-semibold` (600) not present in Figma type system. Was used in `table` block for caption, `tbody th`, and `.table-cell--row-header`. | Removed token; updated all usages to `var(--font-weight-bold)`. Confirm with design that 700 is correct for table row headers. | Done — needs design sign-off |
| 2 | `@font-face` weight range was `100 900`; Figma max weight is 700 (Bold). Weights 800–900 are unused. | Capped range to `100 700` for both Inter and Montserrat. | Done |
| 3 | Figma `Desktop/Testimonial` and `Mobile/Testimonial` use **Montserrat Thin Italic (100)**. No italic `@font-face` is declared — italic is intentionally browser-synthesized. | Confirm with design that browser-synthesized italic is acceptable for Testimonial/Quote rendering. If dedicated italic woff2 is required, a new `@font-face` block with `font-style: italic` will be needed. | Pending design confirmation |

---

## Out of Scope

- **ARCHITECTURE-TODO #5** — Moving font-family tokens into `root-tokens.scss` for brand override support. No brand-override intent for fonts at this time; tracked in `docs/project/TODOS.md`.
- Applying `.text-testimonial` to Quote block and `.eyebrow` to Banner/Hero — tracked as follow-up in `docs/project/TODOS.md`.

---

## Reference

- Figma audit: `docs/audits/FIGMA-TYPOGRAPHY-AUDIT-2026-03-25.md`
