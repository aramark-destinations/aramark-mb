# EDS Block Extensibility Framework - Implementation Guide

## Overview

This project implements Adobe's EDS Block Extensibility Framework to enable:
- **Reusable base blocks** in `/libs/blocks/` shared across all sites
- **Site-specific extensions** in `/blocks/` for Nations Vacations customizations
- **Per-property overrides** in `/sites/{site}/blocks/` for individual properties (Lake Powell, etc.)

## Architecture

### Block Resolution Order

When EDS loads a block, it checks paths in this priority order:

1. **Site-Specific** → `/sites/{site}/blocks/{block}/{block}.js`
2. **Shared Extension** → `/blocks/{block}/{block}.js`
3. **Base Library** → `/libs/blocks/{block}/base.js`

### Directory Structure

```
eds/
├── libs/blocks/              # Base blocks (reusable, upgradeable)
│   ├── hero/
│   │   ├── base.js          # Core hero logic + lifecycle hooks
│   │   ├── base.css         # Base hero styles
│   │   └── CHANGELOG.md     # Version history & extension points
│   └── cards/
│       ├── base.js
│       ├── base.css
│       └── CHANGELOG.md
│
├── blocks/                   # Site extensions (Nations Vacations shared)
│   ├── hero/
│   │   ├── hero.js          # Wraps base, adds NV-specific hooks
│   │   └── hero.css         # Imports base, adds NV overrides
│   └── cards/
│       ├── cards.js
│       └── cards.css
│
└── sites/                    # Per-property overrides
    └── lake-powell/
        ├── blocks/           # Lake Powell-specific block overrides
        │   └── hero/         # Only created if LP needs custom hero
        │       ├── hero.js
        │       └── hero.css
        └── README.md
```

## Base Block Pattern

### base.js Template

```javascript
/**
 * Base {BlockName} Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 */

export function decorate(block, options = {}) {
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

// Export with global hooks support
export default (block) => decorate(block, window.{BlockName}?.hooks);
```

### Key Features

- **Lifecycle Hooks**: `onBefore` and `onAfter` for extension points
- **Events**: `{block}:before` and `{block}:after` for event-driven customization
- **Context Object**: `{ block, options }` passed to all hooks
- **Global Hooks**: Optional `window.{BlockName}?.hooks` for cross-cutting concerns

## Extension Pattern

### Extension Template

```javascript
/**
 * Site-Specific {BlockName} Extension
 * - Imports base block
 * - Adds site-specific hooks
 */

import { decorate as baseDecorate } from '../../libs/blocks/{block}/base.js';

const hooks = {
  onBefore: ({ block, options }) => {
    // Runs BEFORE base block logic
    // - Add variant classes
    // - Modify initial DOM structure
    // - Set data attributes
  },
  onAfter: ({ block, options }) => {
    // Runs AFTER base block logic
    // - Add event listeners
    // - Integrate analytics
    // - Apply animations
  },
};

export function decorate(block) {
  return baseDecorate(block, hooks);
}

export default (block) => decorate(block);
```

### CSS Extension

```css
/* Import base styles first */
@import url('../../libs/blocks/{block}/base.css');

/* Add site-specific overrides */
.{block}--variant {
  /* Custom styles */
}
```

## Migration Checklist

When migrating an existing block to the framework:

### 1. Create Base Block

- [ ] Create `/libs/blocks/{block}/` directory
- [ ] Move core logic to `base.js` with lifecycle hooks
- [ ] Add event dispatching (`{block}:before`, `{block}:after`)
- [ ] Create `base.css` with core styles
- [ ] Document in `CHANGELOG.md` (version, features, extension points)

### 2. Convert Existing Block to Extension

- [ ] Import base decorate function
- [ ] Define local hooks object
- [ ] Move site-specific logic to hooks
- [ ] Test that base + extension works together

### 3. Update CSS

- [ ] Import base CSS with `@import url('../../libs/blocks/{block}/base.css')`
- [ ] Keep only site-specific overrides in extension CSS
- [ ] Test cascading works correctly

### 4. Test

- [ ] Base block works in isolation
- [ ] Extension hooks execute in correct order
- [ ] Events fire properly
- [ ] Universal Editor compatibility maintained
- [ ] No regressions in existing functionality

## Creating a New Block

### Using @blueacornici/eds-cli

```bash
# Install CLI (already installed globally)
npm i -g @blueacornici/eds-cli

# Scaffold a new block from a template
eds-cli install @blueacornici/eds-feature-card

# Creates:
# - /libs/blocks/feature-card/base.js
# - /libs/blocks/feature-card/base.css
# - /blocks/feature-card/feature-card.js
# - /blocks/feature-card/feature-card.css
```

### Manual Creation

1. Create base block files in `/libs/blocks/{block}/`
2. Follow the base.js template pattern
3. Create extension wrapper in `/blocks/{block}/`
4. Document in CHANGELOG.md

## Creating Site-Specific Overrides

Example: Lake Powell needs a custom hero

```bash
mkdir -p sites/lake-powell/blocks/hero
```

```javascript
// sites/lake-powell/blocks/hero/hero.js
import { decorate as nvDecorate } from '../../../blocks/hero/hero.js';

const lakePowellHooks = {
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
};

export default (block) => nvDecorate(block, lakePowellHooks);
```

```css
/* sites/lake-powell/blocks/hero/hero.css */
@import url('../../../blocks/hero/hero.css');

.lake-powell-hero {
  /* Lake Powell branding overrides */
  --hero-primary-color: #0066cc;
}
```

## Upgrading Base Blocks

When a base block in `/libs/blocks/` is updated:

1. **Check CHANGELOG.md** for breaking changes
2. **Test extensions** - ensure hooks still work
3. **Update hooks if needed** - adjust to new extension points
4. **No changes needed** if only using documented hooks

### Example Base Block Update

```javascript
// Before: /libs/blocks/hero/base.js v1.0.0
export function decorate(block, options = {}) {
  options.onBefore?.({ block });
  // logic
  options.onAfter?.({ block });
}

// After: /libs/blocks/hero/base.js v1.1.0
export function decorate(block, options = {}) {
  const ctx = { block, options, metadata: block.dataset };
  options.onBefore?.(ctx); // Now passes more context
  // improved logic
  options.onAfter?.(ctx);
}
```

Extensions automatically benefit from improvements without code changes!

## Best Practices

### ✅ DO

- Use lifecycle hooks for customization
- Import and extend base blocks
- Document extension points in CHANGELOG.md
- Test base blocks independently
- Use CSS custom properties for theming
- Add analytics in `onAfter` hooks
- Use semantic HTML in base blocks

### ❌ DON'T

- Modify `/libs/blocks/` directly (loses upgrade path)
- Duplicate base block logic
- Use `!important` in CSS (makes debugging hard)
- Modify block DOM structure in `onBefore` (breaks base logic)
- Create site-specific overrides unless necessary
- Fork blocks when hooks can solve the need

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

### Installed Tools

- **@blueacornici/eds-cli** - Block scaffolding CLI
- **Superpowers** - AI skills for block creation/extension

### AI Skills (in `.agents/skills/eds/`)

- **block-creation** - Scaffold new base + extension blocks
- **block-extension** - Extend existing base blocks
- **site-spinup** - Create new site with override structure

## Troubleshooting

### Block Not Loading

1. Check console for 404 errors
2. Verify path resolution in `scripts/site-resolver.js`
3. Confirm file exists in expected location
4. Check import paths are correct

### Hooks Not Firing

1. Verify hook names: `onBefore`, `onAfter` (case-sensitive)
2. Check base block dispatches events
3. Ensure extension passes hooks to baseDecorate
4. Test base block in isolation first

### Styles Not Applied

1. Confirm `@import url()` path is correct
2. Check CSS specificity (avoid !important)
3. Verify base.css loaded before extension CSS
4. Test with browser dev tools

### Universal Editor Issues

1. Verify instrumentation preserved (`moveInstrumentation`)
2. Check block dataset attributes maintained
3. Test authoring after migration
4. Confirm events don't break editor

## Resources

- [EDS Block Collection](https://www.aem.live/developer/block-collection)
- [EDS Documentation](https://www.aem.live/docs/)
- [Universal Editor](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring.html)
- Project Superpowers Skills: `.agents/skills/eds/`

## Support

For questions or issues:
1. Check block CHANGELOG.md for known issues
2. Review this guide's troubleshooting section
3. Test base block in isolation
4. Use AI skills for guidance: `@block-creation`, `@block-extension`
