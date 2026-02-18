---
name: EDS Block Creation
description: Create a new EDS block following the extensibility framework pattern
when_to_use: when creating a new block from scratch with base + extension pattern
version: 1.0.0
---

# EDS Block Creation

## Overview
Creates a new EDS block following the Block Extensibility Framework with implementation in `/blocks/` and optional brand overrides in `/brands/{brand}/blocks/`.

**Note:** This skill is archived as the project now uses a simplified 2-tier architecture. New blocks are created directly in `/blocks/` with full implementations, not split between base and extension layers.

## When to Use
- Creating a new block from scratch
- Need both base (reusable) and extension (site-specific) layers
- Want lifecycle hooks and event dispatching built-in

## Implementation Steps

### 1. Create Block Structure
```bash
mkdir -p blocks/{block-name}
```

### 2. Generate block.js
Create `blocks/{block-name}/{block-name}.js`:
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

### 3. Generate block.css
Create `blocks/{block-name}/{block-name}.css` with core styles

### 4. Create README.md
Document the block's usage, variants, and extension points via lifecycle hooks

### 5. Brand Override Example (Optional)
If a brand needs customization:

```bash
mkdir -p brands/{brand}/blocks/{block-name}
```

Then create `brands/{brand}/blocks/{block-name}/{block-name}.js`:
```javascript
import { decorate as rootDecorate } from '../../../blocks/{block-name}/{block-name}.js';

const hooks = {
  onBefore: ({ block }) => {
    // Brand-specific: before logic
  },
  onAfter: ({ block }) => {
    // Brand-specific: after logic
  },
};

export function decorate(block) {
  return rootDecorate(block, hooks);
}

export default (block) => decorate(block);
```

### 6. Create Brand CSS Override (Optional)
In the same directory, create `brands/{brand}/blocks/{block-name}/{block-name}.css`:
```css
/* Brand-specific overrides */
/* Root styles from /blocks/{block-name}/{block-name}.css load automatically */
```

**Important:** Brand directories only need a `blocks/` subdirectory when they have block overrides.

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
