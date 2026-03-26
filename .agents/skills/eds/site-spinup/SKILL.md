---
name: site-spinup
description: Rapidly create a new brand site using the 2-tier multi-site framework. Use when launching a new brand site.
---

# EDS Site Spinup

## Overview
Quickly scaffold a new brand site in the framework. Uses a streamlined 2-tier architecture:
- **Tier 1:** `brands/{brand}/blocks` (brand-specific overrides)
- **Tier 2:** `/blocks` (shared/root blocks)

Primary customization via design tokens, with optional block behavior overrides using lifecycle hooks.

## When to Use
- Launching a new property site/brand
- Creating a brand variant (e.g., seasonal microsites)
- Setting up staging/preview environments with different branding

## Quick Start

### 1. Create Brand Directory
```bash
mkdir -p brands/{{brand}}
# Subdirectories (blocks/, scripts/, config.json) are created only when needed
```

### 2. Add Brand README
Create `brands/{{brand}}/README.md`:
```markdown
# {Site Name}

Brand-specific configuration and overrides for {Site Name}.

## Structure
```
brands/{{brand}}/
├── README.md        # This file
├── tokens.css       # Brand design tokens (PRIMARY styling mechanism)
├── config.json      # (Optional) Brand configuration (analytics, integrations)
├── blocks/          # (Optional) Block behavior overrides only
└── scripts/         # (Optional) Brand-specific scripts if needed
```

## Branding
- Primary Color: {hex}
- Font Family: {font-name}
- Logo: /brands/{{brand}}/icons/logo.svg

## Block Overrides
Currently none. Use design tokens for styling customization.
```

### 3. Create Design Tokens (PRIMARY CUSTOMIZATION)
Create `brands/{{brand}}/tokens.css`:
```css
/* {Brand Name} Design Tokens */
:root {
  /* Brand Colors */
  --color-primary-base: #...;
  --color-primary-light: #...;
  --color-primary-dark: #...;
  --color-secondary-base: #...;
  
  /* Typography */
  --font-family-heading: '{Brand Font}', serif;
  --font-family-body: system-ui, sans-serif;
  
  /* Spacing (if needed) */
  --spacing-section-vertical: 4rem;
  --spacing-content-max-width: 1200px;
}
```

**Note:** Design tokens automatically apply to all blocks. No block-specific CSS needed for colors/fonts.

### 4. Register Repoless EDS Site
Register the brand as its own EDS site via the `admin.hlx.page` config API. No `fstab.yaml` needed.

**Step 1: Create the site**
```bash
curl -X PUT \
  "https://admin.hlx.page/config/{org}/sites/{{brand}}.json" \
  -H "x-auth-token: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": {
        "owner": "{org}",
        "repo": "{repo}",
        "source": {
            "type": "github",
            "url": "https://github.com/{org}/{repo}"
        }
    },
    "content": {
        "source": {
            "type": "markup",
            "url": "https://author-p{program}-e{env}.adobeaemcloud.com"
        }
    }
}'
```

**Step 2: Configure content path mappings**
```bash
curl -X POST \
  "https://admin.hlx.page/config/{org}/sites/{{brand}}/public.json" \
  -H "x-auth-token: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": {
        "mappings": [
            "/content/{{brand}}/:/"
        ],
        "includes": [
            "/content/{{brand}}/"
        ]
    }
}'
```

The brand's preview URL will be: `https://main--{{brand}}--{org}.aem.page/`

### 5. Create Brand Configuration (Optional)
Create `brands/{{brand}}/config.json` for integrations:
```json
{
  "brand": "{{brand}}",
  "analytics": {
    "googleAnalyticsId": "GA-XXXXXXX"
  },
  "integrations": {
    "booking": {
      "widgetEnabled": true,
      "apiEndpoint": "..."
    }
  }
}
```

### 6. Create Block Overrides (Only When Needed)
**When to use:** Custom analytics, unique interactions, additional DOM elements  
**When NOT to use:** Colors, fonts, spacing (use `tokens.css` instead)

```bash
# Example: Override hero block for custom analytics
mkdir -p brands/{{brand}}/blocks/hero
```

```javascript
// brands/{{brand}}/blocks/hero/hero.js
import { decorate as rootDecorate } from '../../../blocks/hero/hero.js';

const {brandName}Hooks = {
  onBefore: ({ block }) => {
    // Add brand identifier
    block.dataset.brand = '{{brand}}';
  },
  onAfter: ({ block }) => {
    // Add brand-specific tracking
    block.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        window.analytics?.track('hero_cta_click', { 
          brand: '{{brand}}' 
        });
      });
    });
  }
};

export default (block) => rootDecorate(block, {brandName}Hooks);
```

## Block Resolution Order

The `site-resolver.js` script checks paths in this order:
1. `brands/{{brand}}/blocks/{block}` - Brand-specific override
2. `/blocks/{block}` - Root/shared implementation

**CSS Resolution:** Same order as JS. Both paths are tried automatically.

## Content Structure

### In AEM Author
```
/content/
  └── {{brand}}/
      ├── index (homepage)
      ├── activities/
      ├── lodging/
      └── ...
```

### Published Structure (Repoless EDS Site)
Each brand's content is mapped to the site root via `public.paths` config:
- AEM path `/content/{{brand}}/` → site root `/`
- Preview URL: `https://main--{{brand}}--{org}.aem.page/`

```
/                     (mapped from /content/{{brand}}/)
  ├── index.html
  ├── activities/
  ├── lodging/
  └── ...
```

## Customization Decision Tree

```
Need to customize for brand?
├─ Colors, fonts, spacing?
│  └─ Use: tokens.css
├─ Analytics, tracking?
│  └─ Use: Block hooks (onAfter)
├─ Additional DOM elements?
│  └─ Use: Block hooks (onBefore/onAfter)
├─ Different layout structure?
│  └─ Use: Block CSS override (rare)
└─ Configuration data?
   └─ Use: config.json
```

## Common Implementation Patterns

### Example 1: Design Tokens Only (Most Common)
```css
/* brands/{{brand}}/tokens.css */
:root {
  --color-primary-base: #004d99;
  --color-primary-light: #0066cc;
  --font-family-heading: 'Montserrat', sans-serif;
}
```
**Result:** All blocks automatically use these colors/fonts. No other files needed.

### Example 2: Hero with Brand Logo
```javascript
// brands/{{brand}}/blocks/hero/hero.js
import { decorate as rootDecorate } from '../../../blocks/hero/hero.js';

export default (block) => rootDecorate(block, {
  onBefore: ({ block }) => {
    // Prepend brand logo
    const logo = document.createElement('img');
    logo.src = '/brands/{{brand}}/icons/logo.svg';
    logo.alt = '{Brand Name}';
    logo.classList.add('brand-logo');
    block.prepend(logo);
  }
});
```

### Example 3: Header with Brand-Specific Navigation
```javascript
// brands/{{brand}}/blocks/header/header.js
import { decorate as rootDecorate } from '../../../blocks/header/header.js';

export default (block) => rootDecorate(block, {
  onAfter: ({ block }) => {
    // Add brand-specific nav item
    const nav = block.querySelector('nav');
    if (nav) {
      const specialLink = document.createElement('a');
      specialLink.href = '/brands/{{brand}}/seasonal-offer';
      specialLink.textContent = 'Seasonal Offer';
      specialLink.classList.add('special-offer-link');
      nav.append(specialLink);
    }
  }
});
```

### Example 4: Block with Analytics Tracking
```javascript
// brands/{{brand}}/blocks/cards/cards.js
import { decorate as rootDecorate } from '../../../blocks/cards/cards.js';

export default (block) => rootDecorate(block, {
  onAfter: ({ block }) => {
    // Track card clicks
    block.querySelectorAll('.card a').forEach(link => {
      link.addEventListener('click', (e) => {
        const cardTitle = e.target.closest('.card')
          ?.querySelector('h3')?.textContent;
        window.analytics?.track('card_click', {
          brand: '{{brand}}',
          card: cardTitle
        });
      });
    });
  }
});
```

## Testing New Brand Site

### 1. Local Development
```bash
# Start local dev server for the brand
pnpm start:brand {{brand}}

# Opens browser at http://localhost:3000 proxying the brand's EDS site
```

### 2. Verify Block Resolution
Check browser console for block load paths:
```
Loading block: /brands/{{brand}}/blocks/hero/hero.js ✓
Fallback to: /blocks/hero/hero.js
```

### 3. Test Design Tokens
Inspect elements to verify CSS variables:
```css
/* Should see brand-specific values */
color: var(--color-primary-base); /* Your brand color */
font-family: var(--font-family-heading); /* Your brand font */
```

### 4. Test in Universal Editor
1. Open AEM authoring environment
2. Navigate to `/content/{{brand}}/{{brand}}/`
3. Open page in Universal Editor
4. Verify blocks load correctly
5. Test inline editing and block configuration

### 5. Performance Check
```bash
# Run Lighthouse audit
npm run lint

# Check key metrics:
# - LCP < 2.5s (hero/header performance)
# - No duplicate resource loading
# - Proper CSS cascade (tokens → blocks)
```

## Deployment Checklist

- [ ] Brand directory created in `brands/{{brand}}/`
- [ ] Brand README.md documented
- [ ] Design tokens created in `tokens.css`
- [ ] Repoless EDS site registered via admin.hlx.page config API
- [ ] config.json created (if needed)
- [ ] Block overrides created (if needed)
- [ ] Local testing completed (`pnpm start:brand {{brand}}`)
- [ ] Block resolution verified in console
- [ ] Design tokens verified in DevTools
- [ ] Content created in AEM (`/content/{{brand}}/`)
- [ ] Universal Editor tested
- [ ] Performance validated (Lighthouse)
- [ ] DNS/domain configured (if applicable)

## Maintenance

### When Root Blocks Are Updated
1. Review block README in `/blocks/{block}/`
2. Test brand-specific overrides still work
3. Update brand hooks if needed
4. **No changes needed if only using root blocks**

### Brand Decommissioning
To archive a brand:
```bash
# 1. Move to archive
mkdir -p brands/_archived
mv brands/{{brand}} brands/_archived/

# 2. Remove the repoless EDS site registration
# Delete the site via: curl -X DELETE "https://admin.hlx.page/config/{org}/sites/{{brand}}.json" -H "x-auth-token: $AUTH_TOKEN"

# 3. Archive AEM content
# Move /content/{{{brand}}} to archive in AEM

# 4. Document in project README
```

## Quick Reference

| Task | Primary Tool/File |
|------|------------------|
| Brand colors/fonts | `tokens.css` |
| Custom analytics | Block hooks (`onAfter`) |
| Additional DOM | Block hooks (`onBefore`/`onAfter`) |
| Layout structure | Block CSS (rare) |
| Integrations | `config.json` |
| Resolution order | `site-resolver.js` (automatic) |

## Tips & Best Practices

1. **Start Simple:** Begin with `tokens.css` only. Add overrides only when necessary.
2. **Lifecycle Hooks:** Use `onBefore` for DOM prep, `onAfter` for enhancements.
3. **Testing:** Always test in both local (`pnpm start:brand {{brand}}`) and Universal Editor.
4. **Documentation:** Update brand README.md when adding overrides.
5. **Performance:** Each override adds HTTP requests. Use tokens when possible.
6. **Version Control:** Commit brand directory with descriptive commit message.

## Related Documentation

- [Brand README](../../brands/{{brand}}/README.md) - Reference implementation
- [site-resolver.js](../../scripts/site-resolver.js) - Block resolution logic
- [AEM EDS Documentation](https://www.aem.live/docs/)
- [Universal Editor Guide](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring)
