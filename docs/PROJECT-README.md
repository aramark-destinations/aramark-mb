# Aramark MB - Multi-Brand EDS Platform

A scalable Adobe Edge Delivery Services (EDS) platform for Aramark MB's portfolio of vacation rental properties.

## Overview

This project enables multiple vacation property sites to share a common library of blocks while maintaining flexibility for brand-specific customizations.

### Current Brands

- **Lake Powell** - Repoless EDS site (`lake-powell`) - Premier houseboat and watercraft rental destination
- **Unbranded** - Repoless EDS site (`unbranded`) - Default/shared brand

### Architecture Benefits

- **Reusable Components** - Root blocks in `/blocks/` shared across all brands
- **Brand Flexibility** - Brand-specific overrides in `/brands/{brand}/blocks/` when needed
- **Design Token System** - Layered token architecture (root → fixed/derived → brand) enables theming without code changes
- **Simplified Maintenance** - 2-tier architecture for clarity
- **Rapid Deployment** - New brands launch quickly using existing blocks

## Quick Start

### For Content Authors

1. **Access Universal Editor** - Open AEM Author environment
2. **Edit Content** - Navigate to your site, click Edit
3. **Use Blocks** - Add hero, cards, columns from block library
4. **Publish** - Preview changes, then publish

### For Developers

```bash
# Install dependencies
pnpm install

# Run local development server for a specific brand
pnpm start:brand lake-powell

# Or for unbranded
pnpm start:brand unbranded
```

## Project Structure

```
eds/
├── blocks/                   # Root blocks (shared across all brands)
│   ├── hero/
│   │   ├── hero.js          # Implementation with lifecycle hooks
│   │   ├── hero.css         # Styles
│   │   └── README.md        # Documentation & usage
│   └── cards/
│       ├── cards.js
│       ├── cards.css
│       └── README.md
│
├── brands/                   # Brand-specific overrides
│   └── lake-powell/
│       ├── blocks/           # Lake Powell overrides (only if needed)
│       ├── tokens.css        # Brand design tokens
│       └── README.md         # Brand documentation
│
├── styles/
│   ├── styles.css            # Global styles, legacy aliases, @import entry for token chain
│   ├── fixed-tokens.css      # Derived tokens (color shades, semantic surfaces)
│   ├── root-tokens.css       # Configurable root design tokens
│   ├── fonts.css             # Web font definitions
│   └── lazy-styles.css       # Below-the-fold styles (placeholder)
│
├── scripts/
│   ├── site-resolver.js      # Brand detection + multi-brand path resolution (2-tier)
│   ├── aem.js               # Core EDS framework
│   └── scripts.js           # Global utilities + brand token loading
│
├── models/                   # Universal Editor JSON schemas
│
├── docs/                     # Documentation
│   ├── BLOCK-EXTENSIBILITY-GUIDE.md  # Framework architecture & patterns
│   ├── BLOCK-RENDERING-BUILD-CONFIG.md # Build pipeline & deployment
│   ├── FED-SOLUTION-DESIGN.md        # Design token system architecture
│   ├── BRAND-SETUP-GUIDE.md          # Adding new brand sites
│   ├── ARCHITECTURE-TODO.md          # Tracked TODOs and open decisions
│   └── PROJECT-README.md             # This file
│
└── tools/
    └── sidekick/
        └── config.json       # Sidekick configuration
```

## Block Resolution System

When a page requests a block (e.g., "hero"), the system checks paths in priority order:

```
1. /brands/lake-powell/blocks/hero/hero.js  ← Brand-specific override
2. /blocks/hero/hero.js                     ← Root/shared
```

**Result:** Brands can override root blocks when needed, otherwise use shared implementation.

## Key Concepts

### Root Blocks (`/blocks/`)

Foundation blocks with:
- Core functionality for all brands
- Lifecycle hooks (`onBefore`, `onAfter`)
- Event dispatching for extension
- Semantic HTML structure
- Accessibility built-in

**Example:** Hero block provides image handling, text layout, CTA buttons

### Brand Overrides (`/brands/{brand}/blocks/`)

Brand-specific customizations:
- Unique integrations (booking widgets)
- Brand-specific data sources
- Compliance requirements
- Specialized UI needs

**Example:** Lake Powell hero adds marina-specific booking flow

### Design Token Chain

```
head.html → styles.css → fixed-tokens.css → root-tokens.css   (static @import chain)
scripts.js → site-resolver.js → loadCSS(brand/tokens.css)      (runtime JS injection)
```

Brand detection: AEM page metadata `brand` field (production) or URL path `/brands/{brand}/` (local dev fallback).

## Development Workflow

### Creating a Block

```bash
# Create root block
mkdir -p blocks/newblock
# Create blocks/newblock/newblock.js (with lifecycle hooks)
# Create blocks/newblock/newblock.css
# Create blocks/newblock/README.md
```

### Extending a Block for a Brand

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

### Adding a New Brand

See: `docs/BRAND-SETUP-GUIDE.md` for the complete process.

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
| [Block Rendering & Build Config](docs/BLOCK-RENDERING-BUILD-CONFIG.md) | Build pipeline, deployment, token architecture |
| [FED Solution Design](docs/FED-SOLUTION-DESIGN.md) | Design token system, App Builder, governance |
| [Brand Setup Guide](docs/BRAND-SETUP-GUIDE.md) | Complete process for launching new brand sites |
| [Architecture TODO](docs/ARCHITECTURE-TODO.md) | Open technical decisions and tracked items |

## AI Automation

This project includes AI skills for common tasks:

### Active Skills

- **@site-spinup** - Set up new brand site structure

> **Note:** `block-creation` and `block-extension` skills are archived (in `.agents/_archive/`). Only `site-spinup` is currently active in `.agents/skills/eds/`.

## Technologies

- **Adobe Edge Delivery Services** - Content delivery platform
- **Universal Editor** - WYSIWYG content authoring
- **AEM Author** - Content source (markup via `author-p179307-e1885056.adobeaemcloud.com`)
- **pnpm** (v10.28.2) - Package manager

## Code Quality

### Best Practices

- Use lifecycle hooks for site-specific customization
- Keep root blocks generic and reusable
- Document changes in block README.md files
- Test blocks independently
- Use CSS custom properties for theming
- Preserve Universal Editor compatibility

### Linting

```bash
pnpm lint          # Run all linters
pnpm lint:js       # JavaScript/JSON linting
pnpm lint:css      # CSS linting
```

## Deployment

EDS deploys automatically on merge to `main`. No manual deployment commands needed.

- **Branch Preview**: Each brand site gets its own preview at `https://{branch}--{brand}--{org}.aem.page/`
- **Production**: Merge to `main` → automatic deployment to edge network
- **Rollback**: `git revert` + merge to `main`

## Contributing

### Adding a New Block

1. Create block in `/blocks/` with lifecycle hooks
2. Add CSS and documentation (README.md)
3. Add Universal Editor model in `/models/`
4. Test in both root and brand contexts
5. Create PR for review

### Modifying Existing Block

1. Update block in `/blocks/` or create brand override in `/brands/{brand}/blocks/`
2. Test thoroughly (no regressions)
3. Update documentation (README.md)
4. Submit PR with before/after comparison

### Adding a New Brand

Follow the [Brand Setup Guide](docs/BRAND-SETUP-GUIDE.md). Each brand is registered as a repoless EDS site via the `admin.hlx.page` config API — no `fstab.yaml` changes needed.

## Support

### Getting Help

- **Architecture Questions** → See [Block Extensibility Guide](docs/BLOCK-EXTENSIBILITY-GUIDE.md)
- **New Brand Setup** → See [Brand Setup Guide](docs/BRAND-SETUP-GUIDE.md)
- **Bug Reports** → Create issue in repository
- **Feature Requests** → Create issue with enhancement label

### Common Issues

#### Block Not Loading
Check browser console for 404 errors → Verify file paths and naming

#### Hooks Not Firing
Ensure hook names correct (`onBefore`, `onAfter`) → Check base block dispatches events

#### Styles Not Applied
Check CSS specificity → Use browser dev tools → Verify token definitions

#### Universal Editor Issues
Verify `moveInstrumentation` preserved → Check block dataset attributes

See troubleshooting sections in documentation guides.

## Roadmap

### Phase 1: Foundation (Complete)
- Multi-brand architecture
- Block extensibility framework
- Site resolver system
- Design token system (root → fixed → brand)
- Brand token loading via JS runtime
- Hero and Cards blocks migrated
- AI automation skills
- Comprehensive documentation

### Phase 2: Block Library
- Migrate remaining blocks (columns, footer, header, fragment)
- Create new brand-specific blocks
- Build test suite for base blocks
- Performance optimization

### Phase 3: Integration
- Advanced Universal Editor features
- Analytics dashboard
- A/B testing framework

### Phase 4: Expansion
- Launch additional brand sites

---

**Getting Started:** New to the project? Start with the [Block Extensibility Guide](docs/BLOCK-EXTENSIBILITY-GUIDE.md)

**Adding Brands:** Follow the [Brand Setup Guide](docs/BRAND-SETUP-GUIDE.md)
