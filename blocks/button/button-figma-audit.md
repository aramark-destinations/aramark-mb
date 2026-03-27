# Button — Figma Audit

**Figma file:** https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design
**Node URL:** https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=51-125
**Audit date:** 2026-03-24
**Block:** `blocks/button/`

---

## Token Matches

| Figma property | Value | CSS Token |
|---|---|---|
| Black fill | `#041526` | `--color-grey-900` |
| White fill | `#FFFFFF` | `--color-base-white` |
| Border radius (Rectangular) | `8px` | `--radius-s` |
| Border radius (Pill) | `999px` | `--radius-full` |
| Gap (icon + label) | `8px` | `--spacing-008` |
| Padding — Large Rectangular | `8px 24px` | `var(--spacing-008) var(--spacing-024)` |
| Padding — Medium Rectangular | `8px 16px` | `var(--spacing-008) var(--spacing-016)` |
| Padding — Small Rectangular | `8px 12px` | `var(--spacing-008) var(--spacing-012)` |
| Padding — Large Pill | `8px 32px` | `var(--spacing-008) var(--spacing-032)` |
| Padding — Medium Pill | `8px 24px` | `var(--spacing-008) var(--spacing-024)` |
| Padding — Small Pill | `8px 16px` | `var(--spacing-008) var(--spacing-016)` |
| Height — Large | `56px` | `--sizing-056` |
| Height — Medium | `40px` | `--sizing-040` |
| Height — Small | `32px` | `--sizing-032` |
| Font family | Inter | `--body-font-family` |
| Font weight (all variants) | `700` | `--font-weight-bold` |
| Stroke weight (outlined) | `1px` | `--weight-s` |
| Transition duration | `0.2s` | `--button-transition` / `--transition-duration-fast` |

---

## Token Gaps

| Figma property | Value | Location | Action |
|---|---|---|---|
| Primary fill | `#B04C1A` | `brands/lake-powell/tokens.css` | Update `--color-primary` in brand file (current: `#0066cc`) |
| Secondary fill | `#174355` | `brands/lake-powell/tokens.css` | Update `--color-secondary` in brand file (current: `#1a4d2e`) |
| Letter spacing | `-2%` → `-0.02em` | `button.scss` | Applied as `letter-spacing: -0.02em`; promote to `--letter-spacing-tight` in `root-tokens.scss` |
| Font size — Large | `16px` | `button.scss` | Hardcoded; promote to `--font-size-body-2` in `root-tokens.scss` |
| Font size — Medium | `14px` | `button.scss` | Hardcoded; promote to `--font-size-body-3` in `root-tokens.scss` |
| Font size — Small | `12px` | `button.scss` | Hardcoded; promote to `--font-size-body-4` in `root-tokens.scss` |

> **Note on brand colors:** Root token values (`--color-primary: #eb002a`, `--color-secondary: #022035`) are unbranded placeholders — mismatches with Figma there are expected and are not gaps. The gaps above are in `brands/lake-powell/tokens.css`, which must align with the Figma design.

---

## SCSS Issues Found

The following hardcoded or mismatched values were found in `button.scss` and have been corrected:

| Line | Before | After |
|---|---|---|
| `border-radius` | `var(--border-radius)` — undefined token | `var(--radius-s)` |
| `font-weight` | `600` — hardcoded | `var(--font-weight-bold)` (Figma: 700) |
| `transition` | `0.2s` — hardcoded duration | `var(--button-transition)` |
| `color-black` text | `var(--color-neutral-50)` — off-white `#f6f9fb` | `var(--color-base-white)` — pure white per Figma |
| `color-white` bg | `var(--color-neutral-50)` — off-white `#f6f9fb` | `var(--color-base-white)` — pure white per Figma |
| `color-white` text | `var(--color-neutral-900)` | `var(--color-grey-900)` — canonical token |

---

## Structural Notes

- The component set has **2 shapes** (Rectangular, Pill), **2 styles** (Filled, Outlined), **3 sizes** (Large, Medium, Small), and **4 colors** (Primary, Secondary, Black, White) — 48 variants total.
- The current `button.scss` covers color variants and an outlined style but **does not implement size classes** (`size-large`, `size-medium`, `size-small`) or a **pill shape class**. These are unimplemented variants.
- All button text uses **Inter Bold (700)** — the body font, not the heading font (Montserrat). The current SCSS hardcodes `600` which differs from Figma.
- Outlined buttons have a **1px solid border** using the same color as the fill variant. No border on filled buttons (transparent).
- The Figma `--button-font-weight` root token is set to `--font-weight-medium` (500), which conflicts with the Figma spec of 700. The token value should also be updated to `var(--font-weight-bold)`.