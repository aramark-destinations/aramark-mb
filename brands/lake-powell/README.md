# Lake Powell Site

This directory contains Lake Powell brand-specific configuration and overrides.

## Structure

```
brands/lake-powell/
├── README.md        # This file
├── tokens.css       # Brand design tokens (CSS custom properties) - PRIMARY styling mechanism
├── config.json      # (Optional) Brand configuration (analytics, integrations, etc.)
├── blocks/          # (Optional) Created only when overriding specific block behavior
│   └── {block}/     # Override block logic from /blocks (root)
└── scripts/         # (Optional) Brand-specific scripts if needed
```

**Note:** Subdirectories and config files are created on-demand, not by default.

## Brand Styling via Design Tokens

**Primary customization method:** Override CSS custom properties in `tokens.css`

Lake Powell's visual identity (colors, typography, spacing) is controlled through design tokens that override root values from `/styles/styles.css`.

### Example: `tokens.css`
```css
/* Lake Powell Brand Tokens */
:root {
  /* Brand Colors */
  --color-primary-base: #0066cc;
  --color-primary-light: #3385d6;
  --color-primary-dark: #004d99;
  
  /* Typography */
  --font-family-heading: 'Custom Brand Font', serif;
  
  /* Spacing overrides (if needed) */
  --spacing-section-vertical: 4rem;
}
```

All blocks automatically use these tokens. No block-specific CSS needed for color/typography changes.

## Block Behavior Overrides (Rare)

Only create block overrides when you need to change **behavior** or **structure**, not styling.

**When to use:** Custom analytics, unique interactions, additional DOM elements  
**When NOT to use:** Colors, fonts, spacing (use `tokens.css` instead)

### Pattern: Override Block with Lifecycle Hooks

1. Create directory: `brands/lake-powell/blocks/{block-name}/`
2. Create `{block-name}.js` that imports from `/blocks/{block-name}/{block-name}.js`
3. Add Lake Powell-specific hooks

**Example:** Adding analytics tracking to hero block
```javascript
// brands/lake-powell/blocks/hero/hero.js
import { decorate as rootDecorate } from '../../../blocks/hero/hero.js';

const lakePowellHooks = {
  onBefore: ({ block }) => {
    // Add brand identifier
    block.dataset.brand = 'lake-powell';
  },
  onAfter: ({ block }) => {
    // Track hero impressions
    block.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        window.analytics?.track('hero_cta_click', { brand: 'lake-powell' });
      });
    });
  }
};

export default (block) => rootDecorate(block, lakePowellHooks);
```

### Block CSS Overrides (Very Rare)

Only create if tokens cannot achieve the desired styling:

```css
/* brands/lake-powell/blocks/hero/hero.css */
/* Only structural differences, not colors/fonts (those use tokens) */
.hero {
  /* Example: Lake Powell needs different layout */
  grid-template-columns: 2fr 1fr; /* Different from root */
}
```

## Brand Configuration

Create `config.json` for brand-specific integrations:

```json
{
  "brand": "lake-powell",
  "analytics": {
    "googleAnalyticsId": "GA-XXXXXXX",
    "adobeAnalyticsId": "..."
  },
  "integrations": {
    "bynder": {
      "portalId": "...",
      "assetPrefix": "lake-powell"
    },
    "booking": {
      "widgetEnabled": true,
      "apiEndpoint": "..."
    }
  }
}
```

## Quick Reference

| Customization Type | Method | File Location |
|-------------------|--------|---------------|
| Colors, fonts, spacing | Design tokens | `tokens.css` |
| Analytics, tracking | Block hooks | `blocks/{block}/{block}.js` |
| Integrations, features | Configuration | `config.json` |
| Layout structure | Block CSS (rare) | `blocks/{block}/{block}.css` |

**Best Practice:** Start with `tokens.css`. Only create block overrides if tokens are insufficient.
