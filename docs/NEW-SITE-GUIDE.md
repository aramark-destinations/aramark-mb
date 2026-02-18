# New Site Setup Guide
## NEEDS TO BE UPDATED - OUTDATED AS OF 2/16
## Overview

This guide walks through creating a new property site in the Aramark MB multi-site EDS platform.

## Prerequisites

- Access to SharePoint for content repository
- Access to Bynder for digital assets
- Azure DevOps access for deployment pipelines
- Understanding of EDS Block Extensibility Framework

## Site Creation Process

### Step 1: Create Site Directory Structure

```bash
# Create site folder
mkdir -p brands/{brand-name}/blocks
mkdir -p brands/{brand-name}/scripts
mkdir -p brands/{brand-name}/styles

# Create site README
touch brands/{brand-name}/README.md
```

Example for "Grand Canyon North":

```bash
mkdir -p brands/grand-canyon-north/blocks
mkdir -p brands/grand-canyon-north/scripts
mkdir -p brands/grand-canyon-north/styles
touch brands/grand-canyon-north/README.md
```

### Step 2: Configure SharePoint Mountpoint

Update `fstab.yaml` to add content source:

```yaml
mountpoints:
  /: https://drive.google.com/drive/folders/root-folder-id
  
  # Lake Powell (existing)
  /brands/lake-powell: https://adobe.sharepoint.com/:f:/r/brands/NationsVacations/Shared%20Documents/lake-powell
  
  # Grand Canyon North (new)
  /brands/grand-canyon-north: https://adobe.sharepoint.com/:f:/r/brands/NationsVacations/Shared%20Documents/grand-canyon-north
```

**Important:** SharePoint folder must exist before adding to `fstab.yaml`

### Step 3: Create Site Configuration

Create `brands/{brand-name}/config.json`:

```json
{
  "siteName": "Grand Canyon North",
  "siteId": "grand-canyon-north",
  "brand": "aramark-mb",
  "locale": "en-US",
  "theme": {
    "primaryColor": "#0066cc",
    "secondaryColor": "#ff6600",
    "fontFamily": "Arial, sans-serif"
  },
  "features": {
    "bookingWidget": true,
    "weatherWidget": true,
    "mapIntegration": true
  },
  "analytics": {
    "googleAnalytics": "GA-XXXXXXXXX",
    "adobeAnalytics": "RSID-XXXXXXXXX"
  },
  "bynder": {
    "portalId": "grand-canyon-north",
    "assetPrefix": "/grandcanyon"
  }
}
```

### Step 4: Create Site README

Document site-specific information in `brands/{brand-name}/README.md`:

```markdown
# Grand Canyon North Site

## Overview
Grand Canyon North is a premier vacation destination offering cabins and lodging near the North Rim of the Grand Canyon.

## Site Details
- **Launch Date:** Q2 2024
- **Content Manager:** Jane Smith
- **SharePoint:** [Content Folder](https://sharepoint.com/...)
- **Bynder:** [Asset Portal](https://bynder.com/...)

## Site-Specific Blocks
This site currently has no custom block overrides. All blocks use the shared Aramark MB extensions from `/blocks/`.

## Theme Customization
- Primary Color: #0066cc (Lake Blue)
- Secondary Color: #ff6600 (Sunset Orange)
- Font: Arial

## Features Enabled
- ✅ Booking Widget
- ✅ Weather Integration
- ✅ Map Integration
- ✅ Photo Gallery
- ❌ Virtual Tours (coming Q3)

## Contact
- Developer: dev-team@nationsrentals.com
- Content: content-team@nationsrentals.com
```

### Step 5: Add Site-Specific Styles (Optional)

Create `brands/{brand-name}/styles/styles.css` if needed:

```css
/* Grand Canyon North Site Styles */

/* Import base Aramark MB styles */
@import url('../../styles/styles.css');

/* Site-specific CSS variables */
:root {
  --site-primary-color: #0066cc;
  --site-secondary-color: #ff6600;
  --site-font-family: Arial, sans-serif;
}

/* Override global header for this site */
.header {
  background-color: var(--site-primary-color);
}

/* Site-specific utility classes */
.canyon-accent {
  color: var(--site-secondary-color);
}
```

### Step 6: Add Site-Specific Scripts (Optional)

Create `brands/{brand-name}/scripts/scripts.js` if needed:

```javascript
/**
 * Grand Canyon North Site Scripts
 * Site-specific JavaScript that runs after core EDS scripts
 */

import { loadScript } from '../../scripts/aem.js';

// Load site-specific booking widget
async function loadBookingWidget() {
  await loadScript('/brands/grand-canyon-north/scripts/booking-widget.js');
  window.BookingWidget?.init({
    property: 'grand-canyon-north',
    apiEndpoint: '/api/bookings'
  });
}

// Initialize site-specific features
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadBookingWidget();
  });
} else {
  loadBookingWidget();
}
```

### Step 7: Create Block Overrides (If Needed)

Only create site-specific block overrides if the site truly needs custom behavior that can't be achieved through hooks or CSS.

Example: Custom hero for Grand Canyon North

```bash
mkdir -p brands/grand-canyon-north/blocks/hero
```

Create `brands/grand-canyon-north/blocks/hero/hero.js`:

```javascript
/**
 * Grand Canyon North Hero Override
 * Adds property-specific booking integration
 */

import { decorate as nvDecorate } from '../../../blocks/hero/hero.js';

const canyonHooks = {
  onAfter: ({ block }) => {
    // Add property-specific booking button
    const cta = block.querySelector('.button-container');
    if (cta) {
      const bookingBtn = document.createElement('a');
      bookingBtn.href = '#book-now';
      bookingBtn.className = 'button secondary';
      bookingBtn.textContent = 'Check Availability';
      bookingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.BookingWidget?.open();
      });
      cta.append(bookingBtn);
    }
  }
};

export default (block) => nvDecorate(block, canyonHooks);
```

Create `brands/grand-canyon-north/blocks/hero/hero.css`:

```css
/* Import Aramark MB hero styles */
@import url('../../../blocks/hero/hero.css');

/* Grand Canyon North hero overrides */
.hero {
  /* Marina-specific styling */
  --hero-overlay-opacity: 0.6;
}

.hero .button.secondary {
  background-color: var(--site-secondary-color);
}
```

### Step 8: Test Site Resolution

Verify the site resolver correctly detects your new site:

1. Create a test page at `/brands/{brand-name}/test.html`
2. Add a block (e.g., hero)
3. Load the page in a browser
3. Check browser console for:
   ```
   [Site Resolver] Current site: grand-canyon-north
   [Site Resolver] Resolved block 'hero' to: /blocks/hero/hero.js
   ```

### Step 9: Content Setup

1. **Create SharePoint Folder Structure:**
   ```
   /brands/grand-canyon-north/
   ├── index (homepage)
   ├── about
   ├── lodging/
   │   ├── cabins
   │   └── camping
   ├── activities
   └── contact
   ```

2. **Upload Assets to Bynder:**
   - Create collection: "Grand Canyon North"
   - Upload site-specific photos
   - Tag with property: "grand-canyon-north"

3. **Create Initial Content:**
   - Author homepage in Universal Editor
   - Create navigation structure
   - Add hero images from Bynder

### Step 10: Configure Deployment

Add site to deployment pipeline (example for Azure):

```yaml
# .github/workflows/deploy-sites.yml
jobs:
  deploy:
    strategy:
      matrix:
        site: [lake-powell, grand-canyon-north]  # Add new site
    steps:
      - name: Deploy ${{ matrix.site }}
        run: |
          aem up --site ${{ matrix.site }}
```

### Step 11: Testing Checklist

Before launching the new site:

- [ ] Site resolver detects site correctly
- [ ] All blocks load from correct paths
- [ ] Site-specific styles applied
- [ ] Site-specific scripts execute
- [ ] SharePoint content loads
- [ ] Bynder assets display correctly
- [ ] Universal Editor works
- [ ] Navigation functions
- [ ] Mobile responsive
- [ ] Analytics tracking works
- [ ] SEO metadata correct
- [ ] Performance acceptable (Lighthouse > 90)

### Step 12: Documentation

Update project documentation:

1. **Add to main README:**
   ```markdown
   ## Sites
   - Lake Powell - `/brands/lake-powell/`
   - Grand Canyon North - `/brands/grand-canyon-north/` (NEW)
   ```

2. **Update site inventory:**
   Create/update `/docs/SITES.md` with site registry

3. **Share with team:**
   - Notify content team
   - Update runbook
   - Add to team wiki

## Site Hierarchy

Understanding path resolution:

```
Request: /brands/grand-canyon-north/index.html
Block: hero

Resolution order:
1. /brands/grand-canyon-north/blocks/hero/hero.js  ← Site-specific (if exists)
2. /blocks/hero/hero.js                            ← Root/shared ✓

CSS resolution:
1. /brands/grand-canyon-north/blocks/hero/hero.css ← Site-specific (if exists)
2. /blocks/hero/hero.css                           ← Root/shared ✓
```

## When to Create Site Overrides

### ✅ Create Site Override When:
- Site needs **unique business logic** (custom booking integration)
- Site requires **different data sources** (site-specific API)
- Site has **incompatible design** with shared blocks
- Legal/compliance requires **site-specific behavior**

### ❌ Use Shared Blocks + Hooks When:
- Only need **different colors/fonts** (use CSS variables)
- Only need **different content** (that's what authors do)
- Only need **slight variations** (use hooks in shared extension)
- Only need **analytics tags** (use shared extension + config)

## Example: Complete Site Setup Script

```bash
#!/bin/bash
# Create new EDS site

SITE_NAME="grand-canyon-north"
SITE_TITLE="Grand Canyon North"

echo "Creating new site: $SITE_TITLE ($SITE_NAME)"

# 1. Create directories
mkdir -p "brands/$SITE_NAME/blocks"
mkdir -p "brands/$SITE_NAME/scripts"
mkdir -p "brands/$SITE_NAME/styles"

# 2. Create config.json
cat > "brands/$SITE_NAME/config.json" <<EOF
{
  "siteName": "$SITE_TITLE",
  "siteId": "$SITE_NAME",
  "brand": "aramark-mb",
  "locale": "en-US"
}
EOF

# 3. Create README.md
cat > "brands/$SITE_NAME/README.md" <<EOF
# $SITE_TITLE Site

## Overview
[Add site description]

## Launch Date
TBD

## Contact
- Content: content-team@nationsrentals.com
- Dev: dev-team@nationsrentals.com
EOF

# 4. Update fstab.yaml (manual step required)
echo ""
echo "✅ Site structure created at: brands/$SITE_NAME/"
echo ""
echo "⚠️  Manual steps required:"
echo "1. Add SharePoint mountpoint to fstab.yaml"
echo "2. Create SharePoint content folder"
echo "3. Configure Bynder portal"
echo "4. Update deployment pipeline"
echo ""
echo "See docs/NEW-SITE-GUIDE.md for complete instructions"
```

## Troubleshooting

### Site Not Detected

**Symptom:** Console shows "Current site: null"

**Solution:** Check URL pattern matches `/brands/{brand-name}/`

### Blocks Not Loading

**Symptom:** 404 errors for block files

**Solution:** 
1. Check block exists in one of the resolution paths
2. Verify file naming: `/blocks/{block}/{block}.js`
3. Check import paths are correct

### Styles Not Applied

**Symptom:** Site looks unstyled or wrong colors

**Solution:**
1. Verify `@import` paths in CSS
2. Check CSS custom property values
3. Inspect with browser dev tools
4. Verify site-specific CSS loaded after base

### SharePoint Content Not Loading

**Symptom:** Content doesn't appear on pages

**Solution:**
1. Verify SharePoint folder exists and has content
2. Check `fstab.yaml` mountpoint URL is correct
3. Verify permissions on SharePoint folder
4. Test mountpoint with `aem up`

## Resources

- [Block Extensibility Guide](/docs/BLOCK-EXTENSIBILITY-GUIDE.md)
- [Migration Guide](/docs/MIGRATION-GUIDE.md)
- [EDS Documentation](https://www.aem.live/docs/)
- AI Skill: `@new-site` for guided setup

## Next Steps After Site Creation

1. **Content Strategy** - Plan page hierarchy
2. **Asset Collection** - Gather photos, videos from property
3. **SEO Setup** - Configure metadata, sitemaps
4. **Analytics** - Set up tracking, goals
5. **Performance** - Optimize images, lazy loading
6. **Accessibility** - WCAG compliance audit
7. **Launch Plan** - Staging, QA, production rollout
