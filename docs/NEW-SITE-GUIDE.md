# New Site Setup Guide

## Overview

This guide walks through creating a new property site in the Nations Vacations multi-site EDS platform.

## Prerequisites

- Access to SharePoint for content repository
- Access to Bynder for digital assets
- Azure DevOps access for deployment pipelines
- Understanding of EDS Block Extensibility Framework

## Site Creation Process

### Step 1: Create Site Directory Structure

```bash
# Create site folder
mkdir -p sites/{site-name}/blocks
mkdir -p sites/{site-name}/scripts
mkdir -p sites/{site-name}/styles

# Create site README
touch sites/{site-name}/README.md
```

Example for "Bullfrog Marina":

```bash
mkdir -p sites/bullfrog-marina/blocks
mkdir -p sites/bullfrog-marina/scripts
mkdir -p sites/bullfrog-marina/styles
touch sites/bullfrog-marina/README.md
```

### Step 2: Configure SharePoint Mountpoint

Update `fstab.yaml` to add content source:

```yaml
mountpoints:
  /: https://drive.google.com/drive/folders/root-folder-id
  
  # Lake Powell (existing)
  /sites/lake-powell: https://adobe.sharepoint.com/:f:/r/sites/NationsVacations/Shared%20Documents/lake-powell
  
  # Bullfrog Marina (new)
  /sites/bullfrog-marina: https://adobe.sharepoint.com/:f:/r/sites/NationsVacations/Shared%20Documents/bullfrog-marina
```

**Important:** SharePoint folder must exist before adding to `fstab.yaml`

### Step 3: Create Site Configuration

Create `sites/{site-name}/config.json`:

```json
{
  "siteName": "Bullfrog Marina",
  "siteId": "bullfrog-marina",
  "brand": "nations-vacations",
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
    "portalId": "bullfrog-marina",
    "assetPrefix": "/bullfrog"
  }
}
```

### Step 4: Create Site README

Document site-specific information in `sites/{site-name}/README.md`:

```markdown
# Bullfrog Marina Site

## Overview
Bullfrog Marina is a premier houseboat rental destination on Lake Powell.

## Site Details
- **Launch Date:** Q2 2024
- **Content Manager:** Jane Smith
- **SharePoint:** [Content Folder](https://sharepoint.com/...)
- **Bynder:** [Asset Portal](https://bynder.com/...)

## Site-Specific Blocks
This site currently has no custom block overrides. All blocks use the shared Nations Vacations extensions from `/blocks/`.

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

Create `sites/{site-name}/styles/styles.css` if needed:

```css
/* Bullfrog Marina Site Styles */

/* Import base Nations Vacations styles */
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
.bullfrog-accent {
  color: var(--site-secondary-color);
}
```

### Step 6: Add Site-Specific Scripts (Optional)

Create `sites/{site-name}/scripts/scripts.js` if needed:

```javascript
/**
 * Bullfrog Marina Site Scripts
 * Site-specific JavaScript that runs after core EDS scripts
 */

import { loadScript } from '../../scripts/aem.js';

// Load site-specific booking widget
async function loadBookingWidget() {
  await loadScript('/sites/bullfrog-marina/scripts/booking-widget.js');
  window.BookingWidget?.init({
    property: 'bullfrog-marina',
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

Example: Custom hero for Bullfrog Marina

```bash
mkdir -p sites/bullfrog-marina/blocks/hero
```

Create `sites/bullfrog-marina/blocks/hero/hero.js`:

```javascript
/**
 * Bullfrog Marina Hero Override
 * Adds marina-specific booking integration
 */

import { decorate as nvDecorate } from '../../../blocks/hero/hero.js';

const bullfrogHooks = {
  onAfter: ({ block }) => {
    // Add marina-specific booking button
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

export default (block) => nvDecorate(block, bullfrogHooks);
```

Create `sites/bullfrog-marina/blocks/hero/hero.css`:

```css
/* Import Nations Vacations hero styles */
@import url('../../../blocks/hero/hero.css');

/* Bullfrog Marina hero overrides */
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

1. Create a test page at `/sites/{site-name}/test.html`
2. Add a block (e.g., hero)
3. Load the page in a browser
4. Check browser console for:
   ```
   [Site Resolver] Current site: bullfrog-marina
   [Site Resolver] Resolved block 'hero' to: /blocks/hero/hero.js
   ```

### Step 9: Content Setup

1. **Create SharePoint Folder Structure:**
   ```
   /sites/bullfrog-marina/
   ├── index (homepage)
   ├── about
   ├── rentals/
   │   ├── houseboats
   │   └── powerboats
   ├── amenities
   └── contact
   ```

2. **Upload Assets to Bynder:**
   - Create collection: "Bullfrog Marina"
   - Upload site-specific photos
   - Tag with property: "bullfrog-marina"

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
        site: [lake-powell, bullfrog-marina]  # Add new site
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
   - Lake Powell - `/sites/lake-powell/`
   - Bullfrog Marina - `/sites/bullfrog-marina/` (NEW)
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
Request: /sites/bullfrog-marina/index.html
Block: hero

Resolution order:
1. /sites/bullfrog-marina/blocks/hero/hero.js  ← Site-specific (if exists)
2. /blocks/hero/hero.js                         ← Nations Vacations shared
3. /libs/blocks/hero/base.js                    ← Base framework block

CSS resolution:
1. /sites/bullfrog-marina/blocks/hero/hero.css ← Site-specific
2. /blocks/hero/hero.css                        ← NV shared (imports base)
3. /libs/blocks/hero/base.css                   ← Base styles
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

SITE_NAME="bullfrog-marina"
SITE_TITLE="Bullfrog Marina"

echo "Creating new site: $SITE_TITLE ($SITE_NAME)"

# 1. Create directories
mkdir -p "sites/$SITE_NAME/blocks"
mkdir -p "sites/$SITE_NAME/scripts"
mkdir -p "sites/$SITE_NAME/styles"

# 2. Create config.json
cat > "sites/$SITE_NAME/config.json" <<EOF
{
  "siteName": "$SITE_TITLE",
  "siteId": "$SITE_NAME",
  "brand": "nations-vacations",
  "locale": "en-US"
}
EOF

# 3. Create README.md
cat > "sites/$SITE_NAME/README.md" <<EOF
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
echo "✅ Site structure created at: sites/$SITE_NAME/"
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

**Solution:** Check URL pattern matches `/sites/{site-name}/`

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
