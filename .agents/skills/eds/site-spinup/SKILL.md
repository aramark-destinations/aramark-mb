---
name: EDS Site Spinup
description: Rapidly create a new site using the multi-site framework
when_to_use: when launching a new vacation property site (post-Lake Powell)
version: 1.0.0
---

# EDS Site Spinup

## Overview
Quickly scaffold a new site in the multi-site Nations Vacations framework, leveraging shared blocks from `/libs/blocks/` and `/blocks/` with site-specific overrides.

## When to Use
- Launching a new vacation property site
- Creating a site variant (e.g., seasonal microsites)
- Setting up staging/preview environments with different branding

## Quick Start

### 1. Create Site Directory
```bash
mkdir -p sites/{site-name}/blocks
mkdir -p sites/{site-name}/styles
mkdir -p sites/{site-name}/scripts
```

### 2. Add Site README
Create `sites/{site-name}/README.md`:
```markdown
# {Site Name}

Site-specific blocks, styles, and scripts for {Site Name}.

## Block Overrides
- List any blocks that have site-specific overrides

## Branding
- Colors: ...
- Fonts: ...
- Logo: ...
```

### 3. Update fstab.yaml
Add mountpoint:
```yaml
/sites/{site-name}:
  url: "https://author-{your-instance}.adobeaemcloud.com/bin/franklin.delivery/{org}/{repo}/main/sites/{site-name}"
  type: "markup"
  suffix: ".html"
```

### 4. Create Site-Specific Blocks (Optional)
Only if you need to override shared blocks:

```bash
# Create override for specific block
mkdir -p sites/{site-name}/blocks/hero
```

```javascript
// sites/{site-name}/blocks/hero/hero.js
import { decorate as sharedDecorate } from '../../../blocks/hero/hero.js';

const {siteName}Hooks = {
  onBefore: ({ block }) => {
    block.classList.add('{site-name}-hero');
  }
};

export default (block) => sharedDecorate(block, {siteName}Hooks);
```

### 5. Create Site Styles (Optional)
```css
/* sites/{site-name}/styles/{site-name}.css */
:root {
  /* Site-specific CSS variables */
  --site-primary-color: #...;
  --site-font-family: ...;
}
```

## Site Resolution Order

When loading blocks, EDS checks in this order:
1. `sites/{site-name}/blocks/{block}` - Site-specific override
2. `/blocks/{block}` - Shared extension
3. `/libs/blocks/{block}` - Base implementation

## Content Structure

### In AEM Author
```
/content/
  └── nations-vacations/
      └── {site-name}/
          ├── index (homepage)
          ├── activities/
          ├── lodging/
          └── ...
```

### Published Structure
```
/sites/{site-name}/
  ├── index.html (homepage)
  ├── activities/
  ├── lodging/
  └── ...
```

## Configuration Files

### paths.json (Optional)
If site needs custom path mappings:
```json
{
  "mappings": [
    "/content/nations-vacations/{site-name}:/sites/{site-name}/",
    "/content/nations-vacations/{site-name}/configuration:/sites/{site-name}/.helix/config.json"
  ],
  "includes": [
    "/content/nations-vacations/{site-name}/"
  ]
}
```

## Common Site Overrides

### Hero Block with Site Branding
```javascript
// sites/{site-name}/blocks/hero/hero.js
import { decorate as baseDecorate } from '../../../blocks/hero/hero.js';

export default (block) => baseDecorate(block, {
  onBefore: ({ block }) => {
    // Add site logo
    const logo = document.createElement('img');
    logo.src = '/sites/{site-name}/icons/logo.svg';
    logo.alt = '{Site Name}';
    logo.classList.add('site-logo');
    block.prepend(logo);
  }
});
```

### Site-Specific Header/Footer
```javascript
// sites/{site-name}/blocks/header/header.js
import { decorate as baseDecorate } from '../../../blocks/header/header.js';

export default (block) => baseDecorate(block, {
  onAfter: ({ block }) => {
    // Add site-specific nav items
    const nav = block.querySelector('nav');
    const siteLinks = document.createElement('div');
    siteLinks.innerHTML = '<a href="/sites/{site-name}/special">Special Offer</a>';
    nav.append(siteLinks);
  }
});
```

## Testing New Site

1. **Local Development**
   ```bash
   aem up
   # Visit http://localhost:3000/sites/{site-name}/
   ```

2. **Verify Block Resolution**
   - Check browser console for block load paths
   - Confirm correct resolution order

3. **Test in Universal Editor**
   - Open pages in AEM authoring
   - Verify blocks load correctly
   - Test inline editing

4. **Check Performance**
   - Run Lighthouse on site pages
   - Verify no duplicate resource loading
   - Check LCP for hero/header

## Deployment Checklist

- [ ] Site directory created in `sites/{site-name}/`
- [ ] fstab.yaml mountpoint added
- [ ] Site README documented
- [ ] Block overrides created (if needed)
- [ ] Site styles configured
- [ ] Content created in AEM
- [ ] Local testing completed
- [ ] Universal Editor tested
- [ ] Performance validated
- [ ] DNS/domain configured (if applicable)

## Updating Existing Sites

When base blocks are updated:
1. Review CHANGELOG.md in `/libs/blocks/{block}/`
2. Test site-specific overrides still work
3. Update site hooks if needed
4. No changes required if only using base blocks

## Site Decommissioning

To archive a site:
1. Move to `sites/_archived/{site-name}/`
2. Remove fstab.yaml mountpoint
3. Archive content in AEM
4. Document in project README
