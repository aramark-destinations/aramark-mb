# unbranded Brand

This directory contains unbranded brand-specific configuration and overrides.

## Structure

```
brands/unbranded/
├── README.md        # This file
├── tokens.css       # Brand design tokens (CSS custom properties) - PRIMARY styling mechanism
├── blocks/          # (Optional) Created only when overriding specific block behavior
│   └── {block}/     # Override block logic from /blocks (root)
└── scripts/         # (Optional) Brand-specific scripts if needed
```

## Brand Styling via Design Tokens

**Primary customization method:** Override CSS custom properties in `tokens.css`

unbranded's visual identity (colors, typography, spacing) is controlled through design tokens that override root values from `/styles/root-tokens.css`.

### How It Works

1. Root tokens are defined in `/styles/root-tokens.css` (imported via the `styles.css` → `fixed-tokens.css` → `root-tokens.css` chain)
2. `scripts.js` detects the unbranded brand (via AEM metadata or URL path)
3. `loadCSS()` injects `brands/unbranded/tokens.css` before first paint
4. Brand tokens override root tokens via CSS cascade

### Example: `tokens.css`
```css
/* unbranded Brand Tokens */
:root {
  /* Brand Colors — override root-tokens.css values */
  --color-primary: #0066cc;
  --color-secondary: #1a4d2e;

  /* All derived tokens (shades, surfaces, strokes) in fixed-tokens.css
     automatically recalculate from these base values. */

  /* Optional overrides (uncomment as needed):
  --color-grey-50: #f5f7fa;
  --radius-s: 6px;
  --button-border-radius: 4px;
  */
}
```

All blocks automatically use these tokens. No block-specific CSS needed for color/typography changes.

## Block Behavior Overrides (Rare)

Only create block overrides when you need to change **behavior** or **structure**, not styling.

**When to use:** Custom analytics, unique interactions, additional DOM elements
**When NOT to use:** Colors, fonts, spacing (use `tokens.css` instead)

### Pattern: Override Block with Lifecycle Hooks

1. Create directory: `brands/unbranded/blocks/{block-name}/`
2. Create `{block-name}.js` that imports from `/blocks/{block-name}/{block-name}.js`
3. Add unbranded-specific hooks

**Example:** Adding analytics tracking to hero block
```javascript
// brands/unbranded/blocks/hero/hero.js
import { decorate as rootDecorate } from '../../../blocks/hero/hero.js';

const lakePowellHooks = {
  onBefore: ({ block }) => {
    // Add brand identifier
    block.dataset.brand = 'unbranded';
  },
  onAfter: ({ block }) => {
    // Track hero impressions
    block.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        window.analytics?.track('hero_cta_click', { brand: 'unbranded' });
      });
    });
  }
};

export default (block) => rootDecorate(block, lakePowellHooks);
```

### Block CSS Overrides (Very Rare)

Only create if tokens cannot achieve the desired styling:

```css
/* brands/unbranded/blocks/hero/hero.css */
/* Only structural differences, not colors/fonts (those use tokens) */
.hero {
  /* Example: unbranded needs different layout */
  grid-template-columns: 2fr 1fr; /* Different from root */
}
```

## Quick Reference

| Customization Type | Method | File Location |
|-------------------|--------|---------------|
| Colors, fonts, spacing | Design tokens | `tokens.css` |
| Analytics, tracking | Block hooks | `blocks/{block}/{block}.js` |
| Layout structure | Block CSS (rare) | `blocks/{block}/{block}.css` |

**Best Practice:** Start with `tokens.css`. Only create block overrides if tokens are insufficient.

## Related Docs

- [Brand Setup Guide](/docs/BRAND-SETUP-GUIDE.md) - How new brands are added
- [Block Extensibility Guide](/docs/BLOCK-EXTENSIBILITY-GUIDE.md) - Block override patterns

## TODOs

- Brand token values are placeholders — final brand colors need confirmation
- Font family tokens (`--body-font-family`, `--heading-font-family`) not yet in `root-tokens.css` — see [ARCHITECTURE-TODO.md](/docs/ARCHITECTURE-TODO.md) #5
