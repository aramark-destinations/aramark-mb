# Block Migration Guide

> **⚠️ ARCHIVED:** This guide described the migration from simple blocks to a 3-tier architecture with `/libs/`. 
> The project has since been simplified to a 2-tier architecture. This document is kept for historical reference only.
>
> **For current development patterns, see:**
> - [Block Extensibility Guide](BLOCK-EXTENSIBILITY-GUIDE.md) - Current 2-tier architecture
> - [Architecture Simplification Plan](ARCHITECTURE-SIMPLIFICATION-PLAN.md) - Why we changed

---

## Historical Context: 3-Tier to 2-Tier Migration (Completed February 2026)

This project originally implemented a 3-tier block resolution system:
1. Brand-specific (`/brands/{brand}/blocks/`)
2. Project shared (`/blocks/`)
3. Base library (`/libs/blocks/`)

**Decision:** Simplified to 2-tier (removed `/libs/`) because:
- Only 2 sites/brands needed (not the many originally anticipated)
- Reduced complexity and maintenance overhead
- Easier for developers to understand and modify

**Current Architecture:** See [BLOCK-EXTENSIBILITY-GUIDE.md](BLOCK-EXTENSIBILITY-GUIDE.md)

---

## Original Migration Guide Content (Archived)

## Example: Migrating the Columns Block

We'll migrate `/blocks/columns/` as a complete example.

### Step 1: Analyze Current Block

```javascript
// Current: /blocks/columns/columns.js
export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // Setup background images
  cols.forEach((col) => {
    const pic = col.querySelector('picture');
    if (pic) {
      const picWrapper = pic.closest('div');
      if (picWrapper && picWrapper.children.length === 1) {
        picWrapper.classList.add('columns-img-col');
        picWrapper.closest('.columns > div').classList.add('columns-row-img');
      }
    }
  });
}
```

**Identify:**
- ✅ Core logic: Add cols classes, find pictures, setup image columns
- ✅ No site-specific logic (good candidate for base block)
- ✅ No external dependencies (easy to extract)

### Step 2: Create Base Block

Create: `/libs/blocks/columns/base.js`

```javascript
/**
 * Base Columns Block
 * Creates responsive column layouts with optional background images
 * 
 * Extension Points:
 * - onBefore: Modify structure before column detection
 * - onAfter: Add behaviors after columns setup
 * 
 * Events:
 * - columns:before - Before column processing
 * - columns:after - After column setup complete
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // Lifecycle: Before
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('columns:before', { detail: ctx }));

  // Core: Count and classify columns
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // Core: Setup background images
  cols.forEach((col) => {
    const pic = col.querySelector('picture');
    if (pic) {
      const picWrapper = pic.closest('div');
      if (picWrapper && picWrapper.children.length === 1) {
        picWrapper.classList.add('columns-img-col');
        picWrapper.closest('.columns > div').classList.add('columns-row-img');
      }
    }
  });

  // Lifecycle: After
  ctx.columnCount = cols.length;
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('columns:after', { detail: ctx }));
}

// Support global hooks
export default (block) => decorate(block, window.Columns?.hooks);
```

### Step 3: Create Base Styles

Create: `/libs/blocks/columns/base.css`

```css
/* Base Columns Block Styles */

.columns > div {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.columns img {
  width: 100%;
  height: auto;
}

.columns > div > div {
  flex: 1;
}

/* Multi-column layouts on desktop */
@media (min-width: 768px) {
  .columns > div {
    flex-direction: row;
    gap: 2rem;
  }

  .columns-2-cols > div > div {
    flex: 0 0 calc(50% - 1rem);
  }

  .columns-3-cols > div > div {
    flex: 0 0 calc(33.333% - 1.333rem);
  }

  .columns-4-cols > div > div {
    flex: 0 0 calc(25% - 1.5rem);
  }
}

/* Background image columns */
.columns-img-col {
  position: relative;
  background-size: cover;
  background-position: center;
  min-height: 300px;
}

.columns-img-col picture {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.columns-img-col picture img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
```

### Step 4: Document Extension Points

Create: `/libs/blocks/columns/CHANGELOG.md`

```markdown
# Columns Block Changelog

## v1.0.0 - Initial Base Block

### Features
- Responsive column layouts (1-4 columns)
- Background image support
- Mobile-first flex layout

### Extension Points

#### onBefore Hook
Use to modify block structure before column detection

Example: Add wrapper elements
\`\`\`javascript
onBefore: ({ block }) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'columns-wrapper';
  block.replaceChildren(wrapper);
  wrapper.append(...block.children);
}
\`\`\`

#### onAfter Hook
Use to add behaviors after columns are set up

Example: Add parallax effect
\`\`\`javascript
onAfter: ({ block, columnCount }) => {
  if (block.querySelector('.columns-img-col')) {
    // Add parallax scroll listener
  }
}
\`\`\`

### Events
- `columns:before` - Dispatched before column processing
- `columns:after` - Dispatched after setup (detail includes columnCount)

### CSS Custom Properties
- `--columns-gap-mobile`: Gap between columns on mobile (default: 1rem)
- `--columns-gap-desktop`: Gap between columns on desktop (default: 2rem)
- `--columns-img-min-height`: Min height for image columns (default: 300px)
```

### Step 5: Convert Existing Block to Extension

Update: `/blocks/columns/columns.js`

```javascript
/**
 * aramark-mb Columns Extension
 * Adds site-specific column behaviors
 */

import { decorate as baseDecorate } from '../../libs/blocks/columns/base.js';

const hooks = {
  onBefore: ({ block }) => {
    // Example: Add variant classes from block attributes
    if (block.dataset.align) {
      block.classList.add(`columns-align-${block.dataset.align}`);
    }
  },
  onAfter: ({ block, columnCount }) => {
    // Example: Add analytics tracking
    window.analytics?.track('columns_loaded', { 
      count: columnCount,
      hasImages: !!block.querySelector('.columns-img-col')
    });

    // Example: Add hover effects to columns
    block.querySelectorAll('.columns > div > div').forEach(col => {
      col.addEventListener('mouseenter', () => {
        col.classList.add('hover');
      });
      col.addEventListener('mouseleave', () => {
        col.classList.remove('hover');
      });
    });
  },
};

export function decorate(block) {
  return baseDecorate(block, hooks);
}

export default (block) => decorate(block);
```

### Step 6: Update Extension Styles

Update: `/blocks/columns/columns.css`

```css
/* Import base styles */
@import url('../../libs/blocks/columns/base.css');

/* aramark-mb Overrides */

:root {
  --columns-gap-mobile: 1.5rem;
  --columns-gap-desktop: 3rem;
}

/* Alignment variants */
.columns-align-center > div > div {
  text-align: center;
}

.columns-align-right > div > div {
  text-align: right;
}

/* Hover effects */
.columns > div > div {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.columns > div > div.hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Brand-specific styling */
.columns {
  --columns-brand-color: #0066cc;
}

.columns h2 {
  color: var(--columns-brand-color);
}
```

### Step 7: Test Migration

1. **Test base block in isolation:**
   ```javascript
   // In browser console on page with columns block
   import { decorate } from '/libs/blocks/columns/base.js';
   const block = document.querySelector('.columns');
   decorate(block);
   ```

2. **Verify lifecycle hooks:**
   ```javascript
   // Add test hooks
   const testHooks = {
     onBefore: () => console.log('onBefore fired'),
     onAfter: (ctx) => console.log('onAfter fired', ctx)
   };
   decorate(block, testHooks);
   ```

3. **Check events:**
   ```javascript
   block.addEventListener('columns:before', (e) => console.log('Event:', e.detail));
   block.addEventListener('columns:after', (e) => console.log('Event:', e.detail));
   ```

4. **Test full extension:**
   - Load page normally
   - Verify columns render correctly
   - Test hover effects work
   - Check console for analytics events
   - Confirm no regressions

5. **Test Universal Editor:**
   - Open page in Universal Editor
   - Edit columns block content
   - Verify changes save correctly
   - Confirm no editor errors

## Migration Checklist

Use this checklist for each block migration:

### Analysis Phase
- [ ] Read existing block code
- [ ] Identify core vs site-specific logic
- [ ] Note external dependencies
- [ ] Check for Universal Editor requirements
- [ ] Document current behavior

### Base Block Creation
- [ ] Create `/libs/blocks/{block}/` directory
- [ ] Create `base.js` with lifecycle hooks
- [ ] Add event dispatching
- [ ] Create `base.css` with core styles
- [ ] Create `CHANGELOG.md` documenting v1.0.0
- [ ] Test base block independently

### Extension Conversion
- [ ] Update extension to import base
- [ ] Move site logic to hooks
- [ ] Add CSS `@import` statement
- [ ] Keep only overrides in extension CSS
- [ ] Test extension with base

### Validation
- [ ] Hooks fire in correct order
- [ ] Events dispatch properly
- [ ] No visual regressions
- [ ] Analytics/tracking works
- [ ] Universal Editor compatible
- [ ] Mobile responsive
- [ ] Accessibility maintained

### Documentation
- [ ] Extension points documented
- [ ] Examples in CHANGELOG.md
- [ ] CSS variables documented
- [ ] Common patterns noted

## Common Migration Patterns

### Pattern 1: Simple Block (No Site Logic)

If block has no site-specific logic, you can:

1. Move entire block to `/libs/blocks/{block}/base.js`
2. Create minimal extension wrapper:

```javascript
// /blocks/{block}/{block}.js
import { decorate as baseDecorate } from '../../libs/blocks/{block}/base.js';
export default (block) => baseDecorate(block);
```

### Pattern 2: Analytics-Heavy Block

Separate analytics from core logic:

```javascript
// Base: Pure rendering logic
onAfter: ({ block }) => {
  // Setup complete
}

// Extension: Analytics
onAfter: ({ block }) => {
  block.addEventListener('click', trackClick);
  trackImpression(block);
}
```

### Pattern 3: Variant-Based Block

Use `onBefore` to classify variants:

```javascript
onBefore: ({ block }) => {
  const variant = block.dataset.variant || 'default';
  block.classList.add(`${block.dataset.blockName}--${variant}`);
}
```

### Pattern 4: API-Dependent Block

Load data in `onBefore`, render in `onAfter`:

```javascript
onBefore: async ({ block, options }) => {
  options.data = await fetch('/api/data').then(r => r.json());
},
onAfter: ({ block, options }) => {
  renderData(block, options.data);
}
```

## Next Blocks to Migrate

Recommended migration order based on complexity:

1. **columns** (Simple, no dependencies) ← Start here
2. **fragment** (Simple import block)
3. **footer** (Moderate, navigation logic)
4. **header** (Complex, navigation + mobile menu)

## Rollback Plan

If migration causes issues:

1. **Keep original files** as `.bak` during testing
2. **Revert extension** by restoring original:
   ```bash
   mv blocks/{block}/{block}.js.bak blocks/{block}/{block}.js
   ```
3. **Test with base disabled** by commenting import:
   ```javascript
   // import { decorate as baseDecorate } from '../../libs/blocks/{block}/base.js';
   ```

## Questions?

- Check `/docs/BLOCK-EXTENSIBILITY-GUIDE.md` for architecture details
- Review migrated blocks: `hero`, `cards` as examples
- Use AI skills: `@block-extension` for guidance
