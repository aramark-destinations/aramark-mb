# Nations Vacations - Multi-Site EDS Platform

A scalable Adobe Edge Delivery Services (EDS) platform for Nations Vacations' portfolio of vacation rental properties, built on the EDS Block Extensibility Framework.

## Overview

This project enables multiple vacation property sites to share a common base library of blocks while maintaining flexibility for property-specific customizations.

### Current Sites

- **Lake Powell** - `/sites/lake-powell/` - Premier houseboat and watercraft rental destination

### Architecture Benefits

✅ **Reusable Components** - Base blocks in `/libs/blocks/` shared across all properties  
✅ **Brand Consistency** - Nations Vacations extensions in `/blocks/` ensure cohesive experience  
✅ **Property Flexibility** - Site-specific overrides in `/sites/{site}/blocks/` when needed  
✅ **Upgrade Safety** - Base block improvements automatically benefit all sites  
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
open http://localhost:3000/sites/lake-powell/
```

## Project Structure

```
eds/
├── libs/blocks/              # Base blocks (reusable, upgradeable)
│   ├── hero/
│   │   ├── base.js          # Core implementation + lifecycle hooks
│   │   ├── base.css         # Base styles
│   │   └── CHANGELOG.md     # Version history & extension points
│   └── cards/
│       ├── base.js
│       ├── base.css
│       └── CHANGELOG.md
│
├── blocks/                   # Nations Vacations extensions
│   ├── hero/
│   │   ├── hero.js          # Wraps base + adds NV-specific hooks
│   │   └── hero.css         # Imports base + adds NV styling
│   └── cards/
│       ├── cards.js
│       └── cards.css
│
├── sites/                    # Property-specific sites
│   └── lake-powell/
│       ├── blocks/           # Lake Powell overrides (only if needed)
│       ├── config.json       # Site configuration
│       └── README.md         # Site documentation
│
├── scripts/
│   ├── site-resolver.js      # Multi-site path resolution
│   ├── aem.js               # Core EDS framework
│   └── scripts.js           # Global utilities
│
├── docs/                     # Documentation
│   ├── BLOCK-EXTENSIBILITY-GUIDE.md  # Framework architecture
│   ├── MIGRATION-GUIDE.md            # Block migration steps
│   └── NEW-SITE-GUIDE.md             # Creating new sites
│
└── .agents/skills/eds/       # AI automation skills
    ├── block-creation/       # Create new blocks
    ├── block-extension/      # Extend existing blocks
    └── site-spinup/          # Launch new sites
```

## Block Resolution System

When a page requests a block (e.g., "hero"), the system checks paths in priority order:

```
1. /sites/lake-powell/blocks/hero/hero.js  ← Site-specific override
2. /blocks/hero/hero.js                     ← Nations Vacations shared
3. /libs/blocks/hero/base.js                ← Base implementation
```

**Result:** Sites automatically get base improvements while retaining customizations.

## Key Concepts

### Base Blocks (`/libs/blocks/`)

Foundation blocks with:
- Core functionality all sites need
- Lifecycle hooks (`onBefore`, `onAfter`)
- Event dispatching for extension
- Semantic HTML structure
- Accessibility built-in

**Example:** Hero block provides image handling, text layout, CTA buttons

### Extensions (`/blocks/`)

Nations Vacations brand layer with:
- Brand-specific styling
- Analytics integration
- Common animations/interactions
- Shared business logic

**Example:** Hero extension adds NV brand colors, booking analytics

### Overrides (`/sites/{site}/blocks/`)

Property-specific customizations:
- Unique integrations (booking widgets)
- Property-specific data sources
- Compliance requirements
- Specialized UI needs

**Example:** Lake Powell hero adds marina-specific booking flow

## Development Workflow

### Creating a New Block

```bash
# Option 1: Use CLI (recommended)
eds-cli install @blueacornici/eds-feature-card

# Option 2: Use AI skill
# In VS Code: @block-creation "testimonial block with star ratings"

# Option 3: Manual creation
# See: docs/BLOCK-EXTENSIBILITY-GUIDE.md
```

### Extending an Existing Block

```javascript
// blocks/hero/hero.js
import { decorate as baseDecorate } from '../../libs/blocks/hero/base.js';

const hooks = {
  onBefore: ({ block }) => {
    // Runs before base block logic
  },
  onAfter: ({ block }) => {
    // Runs after base block logic
  }
};

export default (block) => baseDecorate(block, hooks);
```

See: `docs/BLOCK-EXTENSIBILITY-GUIDE.md` for complete patterns

### Migrating an Existing Block

1. Create base block in `/libs/blocks/{block}/`
2. Add lifecycle hooks and events
3. Convert existing block to extension wrapper
4. Test base + extension together
5. Document in CHANGELOG.md

See: `docs/MIGRATION-GUIDE.md` for step-by-step guide

### Creating a New Site

```bash
# Create site structure
mkdir -p sites/{site-name}/{blocks,scripts,styles}

# Configure content source in fstab.yaml
# Create config.json with site settings
# Add to deployment pipeline
```

See: `docs/NEW-SITE-GUIDE.md` for complete process

## Available Blocks

### ✅ Migrated to Framework

- **Hero** - Large banner with image, headline, CTA
- **Cards** - Grid of content cards with images
- _More blocks being migrated..._

### 🔄 Using Legacy Pattern

- **Columns** - Multi-column layouts
- **Footer** - Site footer with navigation
- **Header** - Site header with navigation
- **Fragment** - Reusable content fragments

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

✅ Use lifecycle hooks for customization  
✅ Import and extend base blocks  
✅ Document extension points in CHANGELOG.md  
✅ Test base blocks independently  
✅ Use CSS custom properties for theming  
✅ Preserve Universal Editor compatibility  

❌ Don't modify `/libs/blocks/` directly  
❌ Don't duplicate base block logic  
❌ Don't use `!important` in CSS  
❌ Don't create site overrides unless necessary  

### Testing

```bash
# Run local server
npm run up

# Test specific site
open http://localhost:3000/sites/lake-powell/

# Validate block resolution
# Check browser console for: "[Site Resolver] Current site: lake-powell"
```

## Deployment

### Staging

```bash
# Deploy to staging
aem up --stage

# Test at: https://main--nations-vacations--{org}.aem.page/sites/lake-powell/
```

### Production

```bash
# Deploy to production
aem publish

# Live at: https://www.lakepowell.com/
```

## Contributing

### Adding a New Block

1. Create base block in `/libs/blocks/`
2. Create Nations Vacations extension in `/blocks/`
3. Document in CHANGELOG.md
4. Add examples to guides
5. Create PR for review

### Migrating Existing Block

1. Follow Migration Guide process
2. Test thoroughly (no regressions)
3. Update documentation
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
- **Migration Help** → See [Migration Guide](docs/MIGRATION-GUIDE.md)
- **New Site Questions** → See [New Site Guide](docs/NEW-SITE-GUIDE.md)
- **AI Assistance** → Use skills: `@block-creation`, `@block-extension`, `@new-site`
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
