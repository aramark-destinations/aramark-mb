# Aramark MB - Multi-Site EDS Platform

A scalable Adobe Edge Delivery Services (EDS) platform for Aramark MB' portfolio of vacation rental properties.

## Overview

This project enables multiple vacation property sites to share a common library of blocks while maintaining flexibility for property-specific customizations.

### Current Sites

- **Lake Powell** - `/brands/lake-powell/` - Premier houseboat and watercraft rental destination

### Architecture Benefits

✅ **Reusable Components** - Root blocks in `/blocks/` shared across all properties  
✅ **Property Flexibility** - Site-specific overrides in `/brands/{brand}/blocks/` when needed  
✅ **Simplified Maintenance** - 2-tier architecture for clarity  
✅ **Rapid Deployment** - New properties launch quickly using existing blocks  

## Quick Start

### For Content Authors

1. **Access Universal Editor** - 
2. **Edit Content** - Navigate to your site, click Edit
3. **Use Blocks** - Add hero, cards, columns from block library
4. **Publish** - Preview changes, then publish

### For Developers

```bash
# Install dependencies
npm install

# Install EDS CLI globally
npm install -g @blueacornici/eds-cli

# Run local development server
npm run up

# Access site locally
open http://localhost:3000/brands/lake-powell/
```

## Project Structure

```
eds/
├── blocks/                   # Root blocks (shared across all sites)
│   ├── hero/
│   │   ├── hero.js          # Implementation with lifecycle hooks
│   │   ├── hero.css         # Styles
│   │   └── README.md        # Documentation & usage
│   └── cards/
│       ├── cards.js
│       ├── cards.css
│       └── README.md
│
├── brands/                   # Property-specific brands
│   └── lake-powell/
│       ├── blocks/           # Lake Powell overrides (only if needed)
│       ├── config.json       # Site configuration
│       └── README.md         # Site documentation
│
├── scripts/
│   ├── site-resolver.js      # Multi-site path resolution (2-tier)
│   ├── aem.js               # Core EDS framework
│   └── scripts.js           # Global utilities
│
├── docs/                     # Documentation
│   ├── BLOCK-EXTENSIBILITY-GUIDE.md      # Framework architecture
│   ├── ARCHITECTURE-SIMPLIFICATION-PLAN.md  # 2-tier migration
│   └── NEW-SITE-GUIDE.md                 # Creating new sites
│
└── tools/
    └── migrate-blocks.js     # Block migration utility
```

## Block Resolution System

When a page requests a block (e.g., "hero"), the system checks paths in priority order:

```
1. /brands/lake-powell/blocks/hero/hero.js  ← Site-specific override
2. /blocks/hero/hero.js                     ← Root/shared ✓
```

**Result:** Sites can override root blocks when needed, otherwise use shared implementation.

## Key Concepts

### Root Blocks (`/blocks/`)

Foundation blocks with:
- Core functionality for all sites
- Lifecycle hooks (`onBefore`, `onAfter`)
- Event dispatching for extension
- Semantic HTML structure
- Accessibility built-in

**Example:** Hero block provides image handling, text layout, CTA buttons

### Site Overrides (`/brands/{brand}/blocks/`)

Site-specific customizations with:

Aramark MB brand layer with:
- Brand-specific styling
- Analytics integration
- Common animations/interactions
- Shared business logic

**Example:** Hero extension adds NV brand colors, booking analytics

### Overrides (`/brands/{brand}/blocks/`)

Property-specific customizations:
- Unique integrations (booking widgets)
- Property-specific data sources
- Compliance requirements
- Specialized UI needs

**Example:** Lake Powell hero adds marina-specific booking flow

## Development Workflow

### Creating a New Block

### Creating a Block

```bash
# Create root block
mkdir -p blocks/newblock
# Create blocks/newblock/newblock.js (with lifecycle hooks)
# Create blocks/newblock/newblock.css
# Create blocks/newblock/README.md
```

### Extending a Block for a Site

```javascript
// brands/lake-powell/blocks/hero/hero.js
import decorateRoot from '../../../blocks/hero/hero.js';

export default function decorate(block) {
  decorateRoot(block, {
    onBefore: ({ block }) => {
      // Runs before root block logic
    },
    onAfter: ({ block }) => {
      // Runs after root block logic
    }
  });
}
```

See: `docs/BLOCK-EXTENSIBILITY-GUIDE.md` for complete patterns

### Creating a New Site

```bash
# Create site structure
mkdir -p brands/{brand-name}/{blocks,scripts,styles}

# Configure content source in fstab.yaml
# Create config.json with site settings
# Add to deployment pipeline
```

See: `docs/NEW-SITE-GUIDE.md` for complete process

## Available Blocks

- **Accordion** - Collapsible content sections
- **Cards** - Grid of content cards with images
- **Carousel** - Image/content carousel
- **Columns** - Multi-column layouts
- **Embed** - YouTube, Vimeo, Twitter embeds
- **Footer** - Site footer with navigation
- **Fragment** - Reusable content fragments
- **Header** - Site header with navigation
- **Hero** - Large banner with image, headline, CTA
- **Modal** - Modal/dialog overlays
- **Quote** - Blockquote styling
- **Search** - Search functionality
- **Table** - Data tables
- **Tabs** - Tabbed content
- **Video** - Video embeds with placeholder

## Documentation

| Guide | Purpose |
|-------|---------|
| [Block Extensibility Guide](docs/BLOCK-EXTENSIBILITY-GUIDE.md) | Framework architecture, patterns, best practices |
| [Migration Guide](docs/MIGRATION-GUIDE.md) | Step-by-step block migration with examples |
| [New Site Guide](docs/NEW-SITE-GUIDE.md) | Complete process for launching new property sites |

## AI Automation

This project includes Superpowers AI skills for common tasks:

### Skills Available

- **@block-creation** - Create new base + extension blocks
- **@block-extension** - Extend existing blocks with hooks
- **@new-site** - Set up new property site structure

### Usage

In VS Code with GitHub Copilot:

```
@block-creation "testimonial block with star ratings and author photos"

@block-extension "add parallax scroll effect to hero block"

@new-site "Create Bullfrog Marina site"
```

## Technologies

- **Adobe Edge Delivery Services** - Content delivery platform
- **Universal Editor** - WYSIWYG content authoring
- **SharePoint** - Content repository
- **Bynder** - Digital asset management
- **@blueacornici/eds-cli** - Block scaffolding tool

## Code Quality

### Best Practices

✅ Use lifecycle hooks for site-specific customization  
✅ Keep root blocks generic and reusable  
✅ Document changes in block README.md files  
✅ Test blocks independently  
✅ Use CSS custom properties for theming  
✅ Preserve Universal Editor compatibility  

❌ Don't hard-code site-specific logic in root blocks  
❌ Don't duplicate root block logic in site overrides  
❌ Don't use `!important` in CSS  
❌ Don't create site overrides unless necessary  

### Testing

```bash
# Run local server
npm run up

# Test specific site
open http://localhost:3000/brands/lake-powell/

# Validate block resolution
# Check browser console for: "[Site Resolver] Current site: lake-powell"
```

## Deployment

### Staging

```bash
# Deploy to staging
aem up --stage

# Test at: https://main--aramark-mb--{org}.aem.page/brands/lake-powell/
```

### Production

```bash
# Deploy to production
aem publish

# Live at: https://www.lakepowell.com/
```

## Contributing

### Adding a New Block

1. Create block in `/blocks/` with lifecycle hooks
2. Add CSS and documentation (README.md)
3. Add Universal Editor model in `/models/`
4. Test in both root and site contexts
5. Create PR for review

### Modifying Existing Block

1. Update block in `/blocks/` or create site override in `/brands/{brand}/blocks/`
2. Test thoroughly (no regressions)
3. Update documentation (README.md)
4. Submit PR with before/after comparison

### Creating New Site

1. Follow New Site Guide
2. Configure SharePoint + Bynder
3. Update deployment pipeline
4. Document in site README
5. Submit PR

## Support

### Getting Help

- **Architecture Questions** → See [Block Extensibility Guide](docs/BLOCK-EXTENSIBILITY-GUIDE.md)
- **New Site Questions** → See [New Site Guide](docs/NEW-SITE-GUIDE.md)
- **Bug Reports** → Create issue in repository
- **Feature Requests** → Create issue with enhancement label

### Common Issues

#### Block Not Loading
Check browser console for 404 errors → Verify file paths and naming

#### Hooks Not Firing
Ensure hook names correct (`onBefore`, `onAfter`) → Check base block dispatches events

#### Styles Not Applied
Verify `@import` path correct → Check CSS specificity → Use browser dev tools

#### Universal Editor Issues
Verify `moveInstrumentation` preserved → Check block dataset attributes

See troubleshooting sections in documentation guides.

## Roadmap

### Phase 1: Foundation
- ✅ Multi-site architecture
- ✅ Block extensibility framework
- ✅ Site resolver system
- ✅ Hero and Cards blocks migrated
- ✅ AI automation skills
- ✅ Comprehensive documentation

### Phase 2: Block Library
- Migrate remaining blocks (columns, footer, header, fragment)
- Create new property-specific blocks
- Build test suite for base blocks
- Performance optimization

### Phase 3: Integration
- Bynder DAM integration patterns
- Advanced Universal Editor features
- Analytics dashboard
- A/B testing framework

### Phase 4: Expansion
- Launch additional property sites


**Getting Started:** New to the project? Start with the [Block Extensibility Guide](docs/BLOCK-EXTENSIBILITY-GUIDE.md)

**Creating Blocks:** See [Migration Guide](docs/MIGRATION-GUIDE.md) for examples

**Launching Sites:** Follow [New Site Guide](docs/NEW-SITE-GUIDE.md) process
