# Breadcrumbs — Figma Audit

**Figma file:** https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design
**Component node:** https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=177-849
**In-hero usage node:** https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=9430-6087
**Audit date:** 2026-03-24
**Block:** `blocks/breadcrumbs/`

---

## Component Overview

The Breadcrumbs component is a `COMPONENT_SET` with two variant axes:

- **Amount** — 2 / 3 / 4 / 5 (number of crumb items)
- **Mode** — Light / Dark (text color theme)

It renders as a flat row of text nodes: `Category / Category / ... / Page Title`. The component is not placed standalone — it is embedded inside the Hero block as a boolean toggle (`Breadcrumbs#9473:0`).

---

## Token Matches

| Figma property | Value | CSS Token |
|---|---|---|
| Mode=Light text color | `#041526` | `--text-dark-1` (= `--color-grey-900`) |
| Mode=Dark text color | `#FFFFFF` | `--text-light-1` (= `--color-base-white`) |
| Separator color | Same as text | `currentColor` |
| Item gap | `8px` | `--spacing-008` |
| Page Title font weight | `700` | `--font-weight-bold` |

---

## Token Gaps

These values have no semantic token equivalent.

| Figma property | Value | Suggested token |
|---|---|---|
| Category link font weight | `300` (Light) | `--font-weight-light` |
| Font size | `12px` | `--font-size-xs` |
| Letter spacing | `-2%` (`-0.02em`) | `--letter-spacing-tight` |
| Line height | `1.5em` | (closest existing: `--line-height-normal: 1.6` — near-match, no gap needed) |

---

## In-Hero Usage (node `9430:6087`)

The hero wraps the breadcrumbs in a **"Breadcrumbs Frame"** container:

| Property | Value | Notes |
|---|---|---|
| Container layout | `mode: row` | |
| `justifyContent` | `flex-start` | Aligns breadcrumbs to the left edge |
| `alignItems` | `center` | |
| `alignSelf` | `stretch` | Spans full hero width |
| `sizing` | `horizontal: fill, vertical: hug` | |
| Breadcrumbs instance sizing | `horizontal: fill` | Fills the container row |
| In-hero text color | `#FFFFFF` | Instance override — white on dark hero image |

The instance uses `Amount=3, Mode=Light` but overrides text fills to white (#FFFFFF). This confirms the hero always renders breadcrumbs in white regardless of variant mode name. The Mode naming in the component set maps as:
- **Mode=Light** → dark text (`#041526`, `--text-dark-1`) — for light backgrounds
- **Mode=Dark** → white text (`#FFFFFF`, `--text-light-1`) — for dark/image backgrounds

The hero wrapper layout (`justifyContent: flex-start`, `alignSelf: stretch`) is the hero block's responsibility, not breadcrumbs.

---

## Structural Notes

- **No standalone background.** The breadcrumbs component has no fill of its own — it floats over the hero image. The existing `.section.breadcrumbs-container` background styling is not present in Figma.
- **No `text-transform: uppercase`.** Figma text is sentence/title case. The existing SCSS uppercase transform conflicts with the design.
- **Separator is `currentColor`.** Figma renders `/` separators as text nodes with the same fill as the category links. The CSS pseudo-element separator should use `currentColor` rather than a hardcoded grey.
- **Link color is not `--link-color`.** Breadcrumb links in Figma use the theme text color (`--text-dark-1` or `--text-light-1`), not the primary brand link color. They are navigational labels, not inline body links.
- **Gap is 8px, not 4px.** The existing SCSS uses `--spacing-xsmall` (4px). Figma shows 8px gap (`--spacing-008`).
- **Font size 12px / weight 300.** Neither has a token yet — candidates added to block SCSS.
- **Hero placement layout.** In the hero, the breadcrumbs frame uses `justifyContent: flex-start, alignItems: center, alignSelf: stretch` — controlled by the hero block, not breadcrumbs.
