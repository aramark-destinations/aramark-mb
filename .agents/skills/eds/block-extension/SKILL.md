---
name: EDS Block Extension
description: Extend an existing base block with site-specific customizations
when_to_use: when you need to customize a base block without modifying its core logic
version: 1.0.0
---

# EDS Block Extension

## Overview
Extends an existing base block from `/libs/blocks/` by adding site-specific hooks and styles while preserving the base implementation.

## When to Use
- Customizing a base block for your site
- Adding site-specific behavior (analytics, animations, variants)
- Overriding styles while maintaining base functionality
- When NOT to use: If you need to fundamentally change block behavior (consider forking to `/libs/blocks/` instead)

## Quick Reference

### Extension Pattern
```javascript
import { decorate as baseDecorate } from '../../libs/blocks/{block}/base.js';

const hooks = {
  onBefore: ({ block, options }) => {
    // Runs before base block logic
  },
  onAfter: ({ block, options }) => {
    // Runs after base block logic
  },
};

export default (block) => baseDecorate(block, hooks);
```

## Implementation

### Step 1: Import Base Block
```javascript
import { decorate as baseDecorate } from '../../libs/blocks/{block-name}/base.js';
```

### Step 2: Define Local Hooks
```javascript
const hooks = {
  onBefore: ({ block }) => {
    // Site-specific pre-processing
    // - Add variant classes
    // - Filter or modify initial DOM
    // - Set up data attributes
  },
  onAfter: ({ block }) => {
    // Site-specific post-processing
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
  return baseDecorate(block, hooks);
}

export default (block) => decorate(block);
```

### Step 4: Create Extension CSS
```css
/* Import base styles */
@import url('../../libs/blocks/{block-name}/base.css');

/* Add site-specific overrides */
.{block-name}--variant {
  /* Custom styles */
}
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

1. **Verify base behavior**: Ensure base block works without extension
2. **Test hooks**: Confirm onBefore/onAfter execute in correct order
3. **Check events**: Verify block events fire properly
4. **Test overrides**: Ensure CSS overrides don't break base styles
5. **Universal Editor**: Test in authoring environment

## Common Mistakes

❌ **Don't modify ctx.block structure in onBefore** (breaks base logic)
✅ **Do add classes, data attributes, or event listeners**

❌ **Don't override base.js directly** (loses upgrade path)
✅ **Do use hooks for customization**

❌ **Don't use !important in CSS** (makes debugging hard)
✅ **Do use specificity and CSS custom properties**
