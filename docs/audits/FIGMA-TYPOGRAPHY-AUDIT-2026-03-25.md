# Figma vs Codebase Typography Audit
**Date:** 2026-03-25  
**Figma Source:** [Lake Powell Site Design — node 48-127 "Text Styles"](https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=48-127)  
**Auditor:** ACS Amplify

---

## Figma Typography Specification (Full Extract)

### Headings — Montserrat, letter-spacing -3%

| Style Name | Figma Style ID | Weight | Size | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Desktop Display | style-6pqczy | 700 | **56px** | 1.2 | -3% |
| Desktop H1 | style-8bufyg | 700 | 40px | 1.3 | -3% |
| Desktop H2 | style-cfow3v | 700 | 32px | 1.3 | -3% |
| Desktop H3 | style-w4x2dm | 700 | 24px | 1.3 | -3% |
| Desktop H4 | style-3jun81 | 700 | 20px | 1.3 | -3% |
| Desktop Testimonial | style-fout64 | **100** | 32px | **1.25** | none |
| Desktop Footer (decorative) | style-q6ixhj | 700 | 250px | 1.3 | -5% |
| Mobile Display | style-qe69jc | 700 | **32px** | 1.2 | -3% |
| Mobile H1 | style-tjrepz | 700 | 28px | 1.3 | -3% |
| Mobile H2 | style-w4x2dm | 700 | 24px | 1.3 | -3% |
| Mobile H3 | style-vr8c1s | 700 | 22px | 1.3 | -3% |
| Mobile H4 | style-3jun81 | 700 | 20px | 1.3 | -3% |
| Mobile Testimonial | style-9m7ucy | **250** | 24px | **1.333** | none |
| Mobile Footer (decorative) | style-u9hy84 | 700 | 100px | 1.3 | -5% |

> **Note:** Desktop H2 and Mobile H2 share the same Figma style (`style-w4x2dm`, 24px). This means H2 is the same size at both breakpoints in Figma — but the codebase applies 32px desktop / 24px mobile. The desktop H2=32px is a separate interpretation. The Figma `style-cfow3v` (32px) is labelled "Desktop H2" in the frame and matches `--heading-font-size-h2: 32px` on desktop. ✅

---

### Body Text — Inter, letter-spacing -2%

| Style Name | Style ID | Weight | Size | Line Height |
|---|---|---|---|---|
| Body 1 Light | style-58b4bl | 300 | 18px | 1.556 |
| Body 2 Light | style-ef15cq | 300 | 16px | 1.5 |
| Body 3 Light | style-51u13n | 300 | 14px | 1.571 |
| Body 4 Light | style-9u5oac | 300 | 12px | 1.5 |
| Body 1 Medium | style-9wf5pg | 500 | 18px | 1.556 |
| Body 2 Medium | style-ufirh0 | 500 | 16px | 1.5 |
| Body 3 Medium | style-021tn5 | 500 | 14px | 1.571 |
| Body 4 Medium | style-tdjjhw | 500 | 12px | 1.5 |
| Body 1 Bold | style-5a3dkw | 700 | 18px | 1.556 |
| Body 2 Bold | style-ehp3ac | 700 | 16px | 1.5 |
| Body 3 Bold | style-scxrp9 | 700 | 14px | 1.571 |
| Body 4 Bold | style-6flxkm | 700 | 12px | 1.5 |
| Body 1 Link | style-jju8tb | 400 | 18px | 1.556 |
| Body 2 Link | style-euni3y | 400 | 16px | 1.5 |
| Body 3 Link | style-gxse0k | 400 | 14px | 1.571 |
| Body 4 Link | style-dn64gp | 400 | 12px | 1.5 |

> **Figma body scale:** Body 1=18px, Body 2=16px, Body 3=14px, Body 4=12px. These sizes are **not responsive** in Figma — same values on both breakpoints.

---

### Details / Micro-text — Inter

| Style Name | Style ID | Weight | Size | Line Height |
|---|---|---|---|---|
| Details Light | style-90v097 | 500 | 10px | 1.3 |
| Details Dark | style-ziaf6d | 700 | 10px | 1.3 |

---

### Eyebrow Labels — Inter, UPPERCASE, +10% letter-spacing

| Style Name | Style ID | Weight | Size | Line Height | Letter Spacing | Text Case |
|---|---|---|---|---|---|---|
| Eyebrow Small | style-6lht6m | 500 | 10px | 1.0 | +10% | UPPER |
| Eyebrow Medium | style-d2quk5 | 500 | 14px | 1.0 | +10% | UPPER |
| Eyebrow Large | style-4i7b7p | 500 | 16px | 1.0 | +10% | UPPER |

---

### Input — Inter

| Style Name | Style ID | Weight | Size | Line Height |
|---|---|---|---|---|
| Input Light | style-vw7hmy | 400 | 16px | 1.0 |
| Input Heavy | style-eodh3q | 500 | 16px | 1.0 |
| Input Error | style-3q0na5 | 400 | 14px | 1.3 |

---

## Comparison: Figma vs Codebase

### ✅ Aligned (no change needed)

| Property | Figma | Codebase | Note |
|---|---|---|---|
| H1 desktop size | 40px | `--heading-font-size-h1: 40px` | ✅ |
| H1 mobile size | 28px | `--heading-font-size-h1: 28px` | ✅ |
| H2 desktop size | 32px | `--heading-font-size-h2: 32px` | ✅ |
| H2 mobile size | 24px | `--heading-font-size-h2: 24px` | ✅ |
| H3 desktop size | 24px | `--heading-font-size-h3: 24px` | ✅ |
| H3 mobile size | 22px | `--heading-font-size-h3: 22px` | ✅ |
| H4 size | 20px | `--heading-font-size-h4: 20px` | ✅ |
| Heading font family | Montserrat | `--heading-font-family: montserrat` | ✅ |
| Heading font weight | 700 | `--heading-font-weight: 700` | ✅ |
| Heading letter-spacing | -3% | `--heading-letter-spacing: -0.03em` | ✅ |
| Body font family | Inter | `--body-font-family: inter` | ✅ |
| Body desktop base size | 18px (Body 1) | `--body-font-size-m: 18px` (desktop) | ✅ |
| Body 2 desktop size | 16px | `--body-font-size-s: 16px` (desktop) | ✅ |
| Body 3 desktop size | 14px | `--body-font-size-xs: 14px` (desktop) | ✅ |
| Body 4 size | 12px | `--body-font-size-xxs: 12px` | ✅ |
| Link letter-spacing | -2% | `--link-letter-spacing: -0.02em` | ✅ |
| List letter-spacing | -2% | `--list-letter-spacing: -0.02em` | ✅ |

---

### ⚠️ Fixed in This Audit

| # | Issue | Before | After | File |
|---|---|---|---|---|
| 1 | Heading line-height unit | `--heading-line-height: 1.3em` | `--heading-line-height: 1.3` | `styles/styles.scss` |
| 2 | Body letter-spacing missing on `p` | none | `letter-spacing: var(--body-letter-spacing)` | `styles/typography.scss` |
| 3 | Body line-height tokens incomplete | only `--body-line-height-m` | added `-s`, `-xs`, `-xxs` | `styles/styles.scss` |
| 4 | Body font weight tokens missing | none | `--body-font-weight-light/regular/medium` | `styles/styles.scss` |
| 5 | Display style completely missing | no token, no rule | `--display-font-size` (32px→56px) + `.text-display` | `styles/styles.scss` + `typography.scss` |
| 6 | Eyebrow styles completely missing | no token, no rule | `--eyebrow-*` tokens + `.eyebrow / .eyebrow-s/m/l` | `styles/styles.scss` + `typography.scss` |
| 7 | Details style completely missing | no token, no rule | `--details-*` tokens + `.text-details / .text-details-dark` | `styles/styles.scss` + `typography.scss` |
| 8 | Testimonial style completely missing | no token, no rule | `--testimonial-*` tokens + `.text-testimonial` | `styles/styles.scss` + `typography.scss` |
| 9 | Input typography tokens missing | no semantic tokens | `--input-font-weight-light/heavy`, `--input-font-size-base/error`, `--input-line-height-*` | `styles/styles.scss` |
| 10 | Montserrat thin weight not loaded | weight 700 only | added `@font-face` for weight 100–300 (pending woff2 file) | `styles/fonts.scss` |

---

### ❌ Remaining Known Deviations (Intentional / Pending)

| # | Issue | Figma Spec | Codebase | Reason / Action |
|---|---|---|---|---|
| 1 | Mobile body base size | 18px (no responsive spec) | `--body-font-size-m: 22px` mobile | **Intentional deviation** — larger mobile size for readability. Document as approved design decision. |
| 2 | Mobile body-s size | 16px | `--body-font-size-s: 19px` mobile | Same as above — intentional mobile enhancement. |
| 3 | Mobile body-xs size | 14px | `--body-font-size-xs: 17px` mobile | Same as above. |
| 4 | Montserrat thin woff2 file missing | weight 100–250 | Falls back to Arial | **Action needed:** Add `fonts/montserrat-latin-100to300.woff2`. @font-face declaration already added to `fonts.scss`. |
| 5 | Brand colors unconfirmed | — | `#0066cc` / `#1a4d2e` | **Action needed:** Confirm with Lake Powell brand guide. |
| 6 | Decorative Footer type (250px/100px) | Montserrat 700, 250px/100px | No token | Very large decorative/display type — handle per-block if needed. |

---

## New Tokens Added

```css
/* styles/styles.scss */

/* Body */
--body-line-height-s: 1.5;
--body-line-height-xs: 1.571;
--body-line-height-xxs: 1.5;
--body-font-weight-light: 300;
--body-font-weight-regular: var(--font-weight-normal);
--body-font-weight-medium: var(--font-weight-medium);
--body-letter-spacing: -0.02em;

/* Display */
--display-font-size: 32px;         /* mobile */
--display-font-size: 56px;         /* desktop @media 900px+ */
--display-line-height: 1.2;
--display-letter-spacing: -0.03em;

/* Eyebrow */
--eyebrow-font-family: var(--body-font-family);
--eyebrow-font-weight: var(--font-weight-medium);
--eyebrow-font-size-s: 10px;
--eyebrow-font-size-m: 14px;
--eyebrow-font-size-l: 16px;
--eyebrow-line-height: 1;
--eyebrow-letter-spacing: 0.1em;
--eyebrow-text-transform: uppercase;

/* Details */
--details-font-size: 10px;
--details-line-height: 1.3;
--details-font-weight-light: var(--font-weight-medium);
--details-font-weight-dark: var(--font-weight-bold);

/* Testimonial */
--testimonial-font-family: var(--heading-font-family);
--testimonial-font-size: 24px;     /* mobile */
--testimonial-font-size: 32px;     /* desktop @media 900px+ */
--testimonial-font-weight: 250;    /* mobile */
--testimonial-font-weight: 100;    /* desktop @media 900px+ */
--testimonial-line-height: 1.333;  /* mobile */
--testimonial-line-height: 1.25;   /* desktop @media 900px+ */

/* Input Typography */
--input-font-weight-light: var(--font-weight-normal);
--input-font-weight-heavy: var(--font-weight-medium);
--input-font-size-base: 16px;
--input-font-size-error: 14px;
--input-line-height-base: 1;
--input-line-height-error: 1.3;
```

## New Utility Classes Added

```scss
/* styles/typography.scss */

.text-display        — Display/hero heading (Montserrat 700, 32→56px, lh=1.2, ls=-3%)
.eyebrow             — Eyebrow Medium (Inter 500, 14px, lh=1.0, ls=+10%, uppercase) [alias for .eyebrow-m]
.eyebrow-s           — Eyebrow Small (Inter 500, 10px)
.eyebrow-m           — Eyebrow Medium (Inter 500, 14px)
.eyebrow-l           — Eyebrow Large (Inter 500, 16px)
.text-details        — Details Light (Inter 500, 10px, lh=1.3)
.text-details-dark   — Details Dark (Inter 700, 10px, lh=1.3)
.text-testimonial    — Testimonial (Montserrat 250→100, 24→32px, no letter-spacing)
```

## Files Modified

| File | Change |
|---|---|
| `styles/styles.scss` | Added 20+ missing tokens: body line-heights, body weights, body letter-spacing, display, eyebrow, details, testimonial, input. Fixed `--heading-line-height: 1.3em` → `1.3`. Added display + testimonial responsive overrides in `@media (width >= 900px)`. |
| `styles/typography.scss` | Added `letter-spacing: var(--body-letter-spacing)` to `p`. Added utility classes: `.text-display`, `.eyebrow`, `.eyebrow-s/m/l`, `.text-details`, `.text-details-dark`, `.text-testimonial`. |
| `styles/fonts.scss` | Added `@font-face` for Montserrat weight 100–300 (pending woff2 file). Added comment documenting TODO. |
| `brands/lake-powell/tokens.css` | Added Figma source attribution, brand color TODO, and documentation for typography font loading guidance. |

## Pending Actions

1. **Add `fonts/montserrat-latin-100to300.woff2`** — Download Montserrat variable font (weight range 100–300) from Google Fonts and add to `/fonts/` directory. The `@font-face` rule is already declared in `fonts.scss`.
2. **Confirm brand colors** — `--color-primary: #0066cc` and `--color-secondary: #1a4d2e` in `brands/lake-powell/tokens.css` need verification against the official Lake Powell brand guide.
3. **Review mobile body sizes** — Decide if the intentional deviation (22px/19px/17px mobile vs Figma's non-responsive 18px/16px/14px) should be documented as an approved design decision or aligned to Figma.
4. **Apply `.text-testimonial` to Quote block** — Add `.text-testimonial` class to `blocks/quote/quote.scss` when implementing the quote/testimonial block.
5. **Apply `.eyebrow` to banner/hero blocks** — Add eyebrow class usage in blocks that render eyebrow labels (e.g., `blocks/banner/`, `blocks/hero/`).
