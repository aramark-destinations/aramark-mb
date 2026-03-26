# Design Standards

## Breakpoint System

The canonical breakpoint system for this project:

| Name | Range | Pixel Value |
|---|---|---|
| `xxs` | ≤ 360px | `max-width: 360px` |
| `xs` | 360–640px | `min-width: 361px` and `max-width: 640px` |
| `sm` | 640–768px | `min-width: 641px` and `max-width: 768px` |
| `md` | 768–881px | `min-width: 769px` and `max-width: 881px` |
| `md-lg` | 881–1024px | `min-width: 882px` and `max-width: 1024px` |
| `lg` | 1024–1280px | `min-width: 1025px` and `max-width: 1280px` |
| `xl` | 1281–1440px | `min-width: 1281px` and `max-width: 1440px` |
| `xxl` | ≥ 1440px | `min-width: 1441px` |

**Max content width:** 1440px

**Important:** SCSS breakpoint variables (e.g., `$breakpoint-md`) are **not yet implemented** as of 2026-03-25. Use pixel values directly in CSS/SCSS, but add a comment noting they are pending the breakpoints partial:

```scss
// TODO: replace with $breakpoint-md once breakpoints partial is implemented
@media (min-width: 769px) {
  ...
}
```

## CSS Token Cascade

All visual styling uses design tokens. The cascade is:

```
styles/root-tokens.scss          ← Default values for all sites
brands/{brand}/tokens.css ← Brand-specific overrides (only values that differ)
```

Rules:
- **Never hard-code color, font, or spacing values** — always use a CSS custom property from the token system
- Brand overrides live in `brands/{brand}/tokens.css` — only values that differ from root need to be listed
- A new brand requires only a `tokens.css` file in `brands/{brand}/`; no other infrastructure changes

## Multi-Brand

Multiple destination sites share one block library. Brand identity is expressed entirely through token overrides.

- Brand detection is handled by `scripts/site-resolver.js`
- Each brand maps to a directory: `brands/lake-powell/`, `brands/unbranded/`, etc.
- The `tokens.css` in each brand directory overrides only the root values that differ for that brand
- Agents must **not** create brand-specific block variants for visual differences that can be handled by tokens alone

## Image Standards

Responsive images use these breakpoints for `srcset`/`sizes`:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px
- Large desktop: 1440px

Use WebP format with JPEG fallback. Decorative images must use `alt=""`.

---

*Last Updated: 2026-03-25*
