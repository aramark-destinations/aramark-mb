# Styles

Global CSS for the project, including the three-layer design token system and base page styles. Brand-specific tokens live in `/brands/{brand}/tokens.css` and are loaded at runtime by `scripts/scripts.js`.

## Token Loading Order

The CSS import chain ensures tokens are available before any styles are applied:

```
styles.css
  └── @import fixed-tokens.css
        └── @import root-tokens.css
              (brand tokens loaded at runtime via loadCSS())
```

## Files

### `root-tokens.css` — Configurable Base Tokens

Brand-configurable design tokens. These are the values you change when setting up or customising a brand at the default/fallback level. Includes:

- Base colors (`--color-primary`, `--color-secondary`, alert colors, grey scale)
- Border radius scale (`--radius-xs` → `--radius-full`)
- Text colors for light and dark surfaces
- Typography settings (font families, weights, line heights)
- Layout tokens (max-width, nav height)
- Button primitives (padding, border radius, font weight)

> **Do not define derived or computed values here.** This file is for raw, hand-picked brand values only.

### `fixed-tokens.css` — Derived & Constant Tokens

Auto-generated tokens derived from `root-tokens.css` via `color-mix()`. Should not need editing per brand. Includes:

- Color shade scales (50–950) for primary, secondary, and alert colors
- Sizing and spacing scales (`--sizing-*`, `--spacing-*`)
- Stroke weights and aspect ratios
- Z-index scale
- Semantic tokens for surfaces, text, strokes, and icons (mapped from the base palette)

> These tokens flow from brand base colors automatically. Adding a new color family requires only a base variable in `root-tokens.css` plus a shade block here.

### `styles.css` — Global Page Styles

Main stylesheet loaded by `head.html`. Responsibilities:

- Imports `fixed-tokens.css` (which imports `root-tokens.css`)
- Maps legacy token names (`--background-color`, `--text-color`, etc.) to the new semantic token system for backwards compatibility with existing blocks
- Defines responsive font sizes and heading sizes
- Sets base typographic and layout styles (body, headings, links, buttons, sections)
- Defines fallback fonts (`roboto-fallback`, `roboto-condensed-fallback`) for CLS prevention

### `fonts.css` — Web Font Loading

Loaded asynchronously after first paint (via `scripts.js → loadFonts()`). Contains `@font-face` rules for Roboto and Roboto Condensed. Not included in the critical path to avoid render-blocking.

### `lazy-styles.css` — Below-the-Fold Styles

Loaded during the lazy phase (after LCP) for non-critical, below-the-fold styles. Currently a placeholder — populate with styles that do not affect the initial viewport, or remove the `loadCSS()` call in `scripts.js` if unused.

## Brand Token Override Pattern

Brand tokens in `/brands/{brand}/tokens.css` are loaded before first paint in `loadEager()`:

```js
await loadCSS(`${window.hlx.codeBasePath}/brands/${brand}/tokens.css`);
```

They override only the variables they declare in `:root`, leaving all other tokens at their default values from `root-tokens.css`.

## Adding a New Token

1. **Configurable value** (changes per brand): add to `root-tokens.css`.
2. **Derived from existing tokens** (computed via `color-mix` or aliasing): add to `fixed-tokens.css`.
3. **Brand-specific override**: add to `brands/{brand}/tokens.css`.
