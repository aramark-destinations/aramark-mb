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

## Out of Scope

- **ARCHITECTURE-TODO #5** — Moving font-family tokens into `root-tokens.scss` for brand override support. No brand-override intent for fonts at this time; tracked in `docs/project/TODOS.md`.
- Applying `.text-testimonial` to Quote block and `.eyebrow` to Banner/Hero — tracked as follow-up in `docs/project/TODOS.md`.

---

## Reference

- Figma audit: `docs/audits/FIGMA-TYPOGRAPHY-AUDIT-2026-03-25.md`
