---
name: EDS Block Extension
description: Extend an existing base block with site-specific customizations
when_to_use: when you need to customize a base block without modifying its core logic
version: 1.0.0
---

# EDS Block Extension

## Overview
Extends an existing root block from `/blocks/` by adding brand-specific hooks and styles while preserving the root implementation.

**Note:** This skill is archived as the project now uses a simplified 2-tier architecture. Brand overrides are created in `brands/{brand}/blocks/{blockname}/` (directory created on-demand) by importing from `/blocks/`.

## When to Use
- Customizing a root block for your brand
- Adding brand-specific behavior (analytics, animations, variants)
- Overriding styles while maintaining root functionality
- When NOT to use: If you need to fundamentally change block behavior (modify the root block in `/blocks/` instead)

## Quick Reference

### Extension Pattern
```javascript
import { decorate as rootDecorate } from '../../../blocks/{block}/{block}.js';

const hooks = {
  onBefore: ({ block, options }) => {
    // Runs before root block logic
  },
  onAfter: ({ block, options }) => {
    // Runs after root block logic
  },
};

export default (block) => rootDecorate(block, hooks);
```

## Implementation

### Step 1: Import Root Block
```javascript
import { decorate as rootDecorate } from '../../../blocks/{block-name}/{block-name}.js';
```

### Step 2: Define Local Hooks
```javascript
const hooks = {
  onBefore: ({ block }) => {
    // Brand-specific pre-processing
    // - Add variant classes
    // - Filter or modify initial DOM
    // - Set up data attributes
  },
  onAfter: ({ block }) => {
    // Brand-specific post-processing
    // - Add event listeners
    // - Integrate analytics
    // - Apply animations
    // - Enhance accessibility
  },
};
```

### Step 3: Export Decorated Function
```javascript
export function decorate(block) {
  return rootDecorate(block, hooks);
}

export default (block) => decorate(block);
```

### Step 4: Create Brand CSS Override
Create this in `/brands/{brand}/blocks/{block-name}/{block-name}.css`:
```css
/* Brand-specific overrides */
/* Root styles from /blocks/{block-name}/{block-name}.css load automatically */
```

## Common Extension Patterns

### Adding Variants
```javascript
onBefore: ({ block }) => {
  const variant = block.dataset.variant;
  if (variant) {
    block.classList.add(`${block.dataset.blockName}--${variant}`);
  }
}
```

### Analytics Integration
```javascript
onAfter: ({ block }) => {
  block.addEventListener('click', (e) => {
    const target = e.target.closest('[data-analytics]');
    if (target) {
      // Send analytics event
      window.analytics?.track('block_interaction', {
        block: block.dataset.blockName,
        action: target.dataset.analytics
      });
    }
  });
}
```

### Adding Animations
```javascript
onAfter: ({ block }) => {
  if (!block.classList.contains('no-animate')) {
    block.classList.add('fade-in');
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    });
    
    observer.observe(block);
  }
}
```

### Conditional Loading
```javascript
onBefore: ({ block }) => {
  // Skip heavy processing on mobile
  if (window.innerWidth < 768 && block.dataset.desktopOnly) {
    block.style.display = 'none';
    return;
  }
}
```

## Event Listening

Listen to base block events:
```javascript
block.addEventListener('{block-name}:before', (e) => {
  console.log('Base block starting', e.detail);
});

block.addEventListener('{block-name}:after', (e) => {
  console.log('Base block completed', e.detail);
});
```

## Testing Extensions

1. **Verify root behavior**: Ensure root block works without brand extension
2. **Test hooks**: Confirm onBefore/onAfter execute in correct order
3. **Check events**: Verify block events fire properly
4. **Test overrides**: Ensure CSS overrides don't break root styles
5. **Universal Editor**: Test in authoring environment

## Common Mistakes

❌ **Don't modify ctx.block structure in onBefore** (breaks root logic)
✅ **Do add classes, data attributes, or event listeners**

❌ **Don't override root block directly** (loses upgrade path)
✅ **Do use hooks for customization**

❌ **Don't use !important in CSS** (makes debugging hard)
✅ **Do use specificity and CSS custom properties**
