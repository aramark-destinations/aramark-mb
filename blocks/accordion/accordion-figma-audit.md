# Accordion — Figma Audit

**Figma file:** https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design
**Node URL:** https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=4368-17381
**Audit date:** 2026-03-29
**Block:** `blocks/accordion/`

---

## Token Matches

| Figma property | Value | CSS Token |
|---|---|---|
| Title text color | `#041526` (text/dark/1) | `var(--color-text-primary)` → `var(--text-dark-1)` → `var(--color-grey-900)` ✓ |
| Body text color | `#041526` (text/dark/1) | `var(--color-text-primary)` (via `--accordion-body-color`) ✓ |
| Border color | `#e7ecf1` (stroke/light/2) | `var(--stroke-light-2)` → `var(--color-grey-100)` ✓ |
| Title / body font family | Inter | `var(--body-font-family)` ✓ |
| Title font weight | 700 | `var(--font-weight-bold)` ✓ |
| Title font size | 18px | `var(--body-font-size-m)` — 18px at mobile, 22px at desktop ✓ |
| Body/expanded font size | 14px | `var(--body-font-size-xs)` — 14px at mobile, 17px at desktop ✓ |
| Body font weight (Light) | 300 | `var(--font-weight-light)` ✓ |
| Title line-height | 28px (~1.56 at 18px) | `var(--line-height-normal)` — 1.6 × 18 = 28.8, rounds to 28 ✓ |
| Body line-height | 22px (~1.57 at 14px) | `var(--line-height-normal)` — 1.6 × 14 = 22.4, rounds to 22 ✓ |
| Title letter-spacing | -0.36px (-2% of 18px) | `var(--letter-spacing-tight)` – `-0.02em` ✓ |
| Body letter-spacing | -0.28px (-2% of 14px) | `var(--letter-spacing-tight)` – same token ✓ |
| Body font weight (Light) | 300 | `var(--font-weight-light)` ✓ (added in staging) |
| Title line-height | 28px at 18px (~1.56) | `var(--line-height-normal)` — 1.6 × 18px = 28.8px; Figma rounds to 28px ✓ |
| Body line-height | 22px at 14px (~1.57) | `var(--line-height-normal)` — 1.6 × 14px = 22.4px; Figma rounds to 22px ✓ |
| Header padding (vertical) | 16px | `var(--spacing-016)` ✓ |
| Body expanded padding-top | 8px | `var(--spacing-008)` ✓ |
| Body expanded padding-bottom | 24px | `var(--spacing-024)` ✓ |
| Body expanded padding-right | 40px (spacing/040) | `var(--spacing-040)` ✓ |
| Icon-to-title gap | 8px | `var(--spacing-008)` (structural; see notes) |
| Accordion items gap | 0px | `var(--spacing-000)` / border-only separation ✓ |
| Toggle icon size | 24px | `var(--icons-size-icon-medium)` ✓ |

---

## Token Gaps

No outstanding token gaps. All Figma values resolved to existing or newly added system tokens.

---

## Structural Notes

- **Letter-spacing (`-0.02em` / `--letter-spacing-tight`)**: The Figma variable definitions show both `Body/1/Bold` and `Body/3/Light` share `letterSpacing: -2` — Figma's percentage notation for `-2% of font size`. This is a single consistent rule across the body text scale; `-0.36px` and `-0.28px` are just the computed values at 18px and 14px. Added `--letter-spacing-tight: -0.02em` to `styles/root-tokens.scss` as a system token using `em` so it scales with font size.
- **Line-height (1.6 rounding)**: Both body text style line heights (~1.56–1.57) are Figma rounding `--line-height-normal: 1.6` to whole pixel values. No gap — use `var(--line-height-normal)`.
- **Title text-transform**: Current block applies `text-transform: uppercase`. Figma shows mixed-case "Section Title" with no text-transform. This is likely the most visible visual gap — review with design to confirm whether uppercase is an intentional brand override or should be removed.
- **Font family (`--font-family-display`)**: The current block references `--font-family-display`, which is not defined in the design token system. Figma uses Inter throughout (the body font). Fixed in SCSS to reference `var(--body-font-family)` directly.
- **Border color (`--color-neutral-400`)**: The old border token resolved to `#727f96` (mid-grey). Figma specifies `#e7ecf1` (stroke/light/2). Fixed in SCSS to use `var(--stroke-light-2)`.
- **Icon positioning**: Current implementation uses `position: absolute` with a hardcoded `top` offset on `summary::after`. Figma designs the row as a flex container with `justify-content: space-between` and `align-items: center`. The absolute approach is functionally viable; `top` offset updated to align with the new `--spacing-016` padding.
- **Title padding-right (30px)**: Exists purely to offset the absolutely-positioned toggle icon. In a flex-based implementation this would not be needed. Retained for now; revisit if the layout migrates to flex.
- **Subtitle variant**: The current block has `--accordion-subtitle-*` tokens not reflected in this Figma node. These likely serve a variant not captured in node `4368:17381`. No token changes required for the subtitle values beyond the font-family fix.
