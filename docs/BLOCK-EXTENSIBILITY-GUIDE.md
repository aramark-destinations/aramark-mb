# EDS Block Extensibility Framework - Implementation Guide

## Overview

This project implements a **2-tier block resolution system** to enable:
- **Shared root blocks** in `/blocks/` for project-wide implementations
- **Site-specific overrides** in `/brands/{brand}/blocks/` for individual properties (Lake Powell, etc.)

## Architecture

### Block Resolution Order

When EDS loads a block, it checks paths in this priority order:

1. **Site-Specific Override** → `/brands/{brand}/blocks/{block}/{block}.js`
2. **Root/Shared Block** → `/blocks/{block}/{block}.js`

### Directory Structure

```
eds/
├── blocks/                   # Root blocks (shared across all sites)
│   ├── hero/
│   │   ├── hero.js          # Core hero implementation with lifecycle hooks
│   │   ├── hero.css         # Hero styles
│   │   └── README.md        # Documentation & usage examples
│   └── cards/
│       ├── cards.js
│       ├── cards.css
│       └── README.md
│
└── brands/                    # Per-property overrides
    └── lake-powell/
        ├── blocks/           # Lake Powell-specific block overrides
        │   └── hero/         # Only created if LP needs custom hero
        │       ├── hero.js
        │       └── hero.css
        ├── tokens.css        # Brand design tokens
        └── README.md
```

## Block Implementation Pattern

### Standard Block Template (in /blocks/)

```javascript
/**
 * {BlockName} Block
 * - Provides lifecycle hooks (onBefore/onAfter) for site-specific extensions
 * - Dispatches before/after events for advanced customization
 */

import { someHelper } from '../../scripts/aem.js';

export default function decorate(block, options = {}) {
  const ctx = { block, options };

  // Lifecycle hook + event (before core logic)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('{block}:before', { detail: ctx }));

  // === CORE BLOCK LOGIC ===
  // Your block's main functionality goes here

  // Lifecycle hook + event (after core logic)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('{block}:after', { detail: ctx }));
}
```

### Key Features

- **Lifecycle Hooks**: `onBefore` and `onAfter` for extension points
- **Events**: `{block}:before` and `{block}:after` for event-driven customization
- **Context Object**: `{ block, options }` passed to all hooks
- **Global Hooks**: Optional `window.{BlockName}?.hooks` for cross-cutting concerns

## Extension Pattern

### Site-Specific Override Template (in /brands/{brand}/blocks/)

```javascript
/**
 * Site-Specific {BlockName} Override
 * - Imports root block implementation
 * - Adds site-specific customizations via hooks
 */

import decorateRoot from '../../../blocks/{block}/{block}.js';

export default function decorate(block) {
  // Use root implementation with site-specific hooks
  decorateRoot(block, {
    onBefore: ({ block, options }) => {
      // Runs BEFORE root block logic
      // - Add variant classes
      // - Modify initial DOM structure
      // - Set data attributes
    },
    onAfter: ({ block, options }) => {
      // Runs AFTER root block logic
      // - Add event listeners
      // - Integrate analytics
      // - Apply animations
    },
  });
}
```

### CSS Override

```css
/* Add site-specific overrides (root styles load automatically) */
.{block}--variant {
  /* Custom styles for this site */
}
```

## Creating a New Block

### 1. Create Root Block (in /blocks/)

- [ ] Create `/blocks/{block}/` directory
- [ ] Create `{block}.js` with lifecycle hooks (onBefore/onAfter)
- [ ] Add event dispatching (`{block}:before`, `{block}:after`)
- [ ] Create `{block}.css` with styles
- [ ] Document in `README.md` (usage, extension points, examples)

### 2. Create Site Override (Optional - only if needed)

- [ ] Create `/brands/{brand}/blocks/{block}/` directory
- [ ] Import root decorate function
- [ ] Define site-specific hooks
- [ ] Move site-specific logic to hooks
- [ ] Test that root + override works together

### 3. Test

- [ ] Block works in root context
- [ ] Site override hooks execute in correct order
- [ ] Events fire properly
- [ ] Universal Editor compatibility maintained
- [ ] No regressions in existing functionality

## Extending an Existing Block

### Creating Blocks Manually

```bash
# Create a new block directly
mkdir -p blocks/feature-card
# Create blocks/feature-card/feature-card.js (with lifecycle hooks)
# Create blocks/feature-card/feature-card.css
# Create blocks/feature-card/README.md (usage documentation)
```

## Creating Site-Specific Overrides

Example: Lake Powell needs a custom hero

```bash
mkdir -p brands/lake-powell/blocks/hero
```

```javascript
// brands/lake-powell/blocks/hero/hero.js
import decorateRoot from '../../../blocks/hero/hero.js';

export default function decorate(block) {
  // Use root implementation with Lake Powell-specific hooks
  decorateRoot(block, {
    onBefore: ({ block }) => {
      // Lake Powell specific: add branding
      block.classList.add('lake-powell-hero');
    },
    onAfter: ({ block }) => {
      // Lake Powell specific: add booking widget
      const widget = document.createElement('div');
      widget.className = 'booking-widget';
      block.append(widget);
    }
  });
}
```

```css
/* brands/lake-powell/blocks/hero/hero.css */
.lake-powell-hero {
  /* Lake Powell branding overrides (root styles load automatically) */
  --hero-primary-color: #0066cc;
}
```

## Best Practices

### DO

- Use lifecycle hooks for site-specific customization
- Keep root blocks generic and reusable
- Document extension points in README.md
- Test blocks in both root and site contexts
- Use CSS custom properties for theming
- Add analytics in `onAfter` hooks
- Use semantic HTML in block implementations

### DON'T

- Duplicate root block logic in site overrides
- Use `!important` in CSS (makes debugging hard)
- Modify block DOM structure in `onBefore` (can break logic)
- Create site-specific overrides unless truly necessary
- Hard-code site-specific values in root blocks

## Common Patterns

### Variant Classes

```javascript
onBefore: ({ block }) => {
  if (block.dataset.variant) {
    block.classList.add(`${block.dataset.blockName}--${block.dataset.variant}`);
  }
}
```

### Analytics

```javascript
onAfter: ({ block }) => {
  block.addEventListener('click', (e) => {
    window.analytics?.track('block_click', {
      block: block.dataset.blockName,
      target: e.target.tagName
    });
  });
}
```

### Conditional Loading

```javascript
onBefore: ({ block }) => {
  if (window.innerWidth < 768 && block.dataset.desktopOnly) {
    block.remove();
    return;
  }
}
```

### Animations

```javascript
onAfter: ({ block }) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  });
  observer.observe(block);
}
```

## Tools

### AI Skills (in `.agents/skills/eds/`)

| Skill | Purpose |
|-------|---------|
| `site-spinup` | Create new brand site with override structure |
| `block-development` | Scaffold and develop blocks to spec |
| `block-audit` | Audit a block against solution design requirements |
| `block-testing` | Generate unit tests for blocks |
| `block-readme` | Generate/update block README documentation |
| `scaffold-cf-model` | Scaffold a Content Fragment model |
| `pre-merge-check` | Comprehensive pre-merge compliance checks |
| `create-brand-tokens` | Create brand token overrides for a new property |

## Troubleshooting

### Block Not Loading

1. Check console for 404 errors
2. Verify path resolution in `scripts/site-resolver.js`
3. Confirm file exists in expected location
4. Check import paths are correct

### Hooks Not Firing

1. Verify hook names: `onBefore`, `onAfter` (case-sensitive)
2. Check root block dispatches events
3. Ensure site override passes hooks correctly
4. Test root block in isolation first

### Styles Not Applied

1. Check CSS specificity (avoid !important)
2. Verify CSS file is loading (check Network tab)
3. Test with browser dev tools
4. Confirm CSS custom properties are defined

### Universal Editor Issues

1. Verify instrumentation preserved (`moveInstrumentation`)
2. Check block dataset attributes maintained
3. Test authoring after migration
4. Confirm events don't break editor

## Resources

- [EDS Block Collection](https://www.aem.live/developer/block-collection)
- [EDS Documentation](https://www.aem.live/docs/)
- [Universal Editor](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring.html)
- [Brand Setup Guide](BRAND-SETUP-GUIDE.md)
- Project AI Skills: `.agents/skills/eds/`

## Support

For questions or issues:
1. Check block README.md for usage documentation
2. Review this guide's troubleshooting section
3. Test root block in isolation
4. Create an issue in the repository

## Unknowns & TODOs

- Zero test files exist — see [TODOS.md](project/TODOS.md) #15
- `buildAutoBlocks()` is a stub — see [TODOS.md](project/TODOS.md) #7
