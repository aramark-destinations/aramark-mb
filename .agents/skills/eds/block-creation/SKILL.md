---
name: EDS Block Creation
description: Create a new EDS block following the extensibility framework pattern
when_to_use: when creating a new block from scratch with base + extension pattern
version: 1.0.0
---

# EDS Block Creation

## Overview
Creates a new EDS block following the Block Extensibility Framework with base implementation in `/libs/blocks/` and site extension in `/blocks/`.

## When to Use
- Creating a new block from scratch
- Need both base (reusable) and extension (site-specific) layers
- Want lifecycle hooks and event dispatching built-in

## Implementation Steps

### 1. Create Base Block Structure
```bash
mkdir -p libs/blocks/{block-name}
```

### 2. Generate base.js
Create `libs/blocks/{block-name}/base.js`:
```javascript
/**
 * Base {BlockName} Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('{block-name}:before', { detail: ctx }));

  // === BLOCK-SPECIFIC LOGIC HERE ===
  // Add your block's core functionality
  
  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('{block-name}:after', { detail: ctx }));
}

export default (block) => decorate(block, window.{BlockName}?.hooks);
```

### 3. Generate base.css
Create `libs/blocks/{block-name}/base.css` with core styles

### 4. Create CHANGELOG.md
Document the base block's version, features, and extension points

### 5. Generate Extension Wrapper
Create `blocks/{block-name}/{block-name}.js`:
```javascript
import { decorate as baseDecorate } from '../../libs/blocks/{block-name}/base.js';

const hooks = {
  onBefore: ({ block }) => {
    // Site-specific: before logic
  },
  onAfter: ({ block }) => {
    // Site-specific: after logic
  },
};

export function decorate(block) {
  return baseDecorate(block, hooks);
}

export default (block) => decorate(block);
```

### 6. Create Extension CSS
Create `blocks/{block-name}/{block-name}.css`:
```css
@import url('../../libs/blocks/{block-name}/base.css');

/* Site-specific overrides */
```

## Common Patterns

### Adding Variants
```javascript
onBefore: ({ block }) => {
  if (block.dataset.variant) {
    block.classList.add(`{block-name}--${block.dataset.variant}`);
  }
}
```

### Image Optimization
```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';

// In block logic
block.querySelectorAll('img').forEach((img) => {
  const pic = createOptimizedPicture(img.src, img.alt);
  img.replaceWith(pic);
});
```

### Analytics Tracking
```javascript
onAfter: ({ block }) => {
  block.addEventListener('click', (e) => {
    // Track interaction
  });
}
```

## Testing
1. Test base block in isolation
2. Test extension hooks
3. Test event dispatching
4. Verify Universal Editor compatibility
