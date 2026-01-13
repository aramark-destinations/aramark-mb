# Lake Powell Site

This directory contains Lake Powell-specific blocks and overrides.

## Structure

```
sites/lake-powell/
├── blocks/          # Site-specific block overrides
│   └── {block}/     # Override any block from /blocks or /libs/blocks
├── styles/          # Site-specific styles (if needed)
└── scripts/         # Site-specific scripts (if needed)
```

## Block Override Pattern

To override a block for Lake Powell only:

1. Create `sites/lake-powell/blocks/{block-name}/` directory
2. Create `{block-name}.js` that imports from either:
   - `/blocks/{block-name}/{block-name}.js` (shared extension)
   - `/libs/blocks/{block-name}/base.js` (base block)
3. Add your Lake Powell-specific hooks
4. Create `{block-name}.css` with Lake Powell-specific styles

Example:
```javascript
// sites/lake-powell/blocks/hero/hero.js
import { decorate as baseDecorate } from '../../../blocks/hero/hero.js';

const lakePowell Hooks = {
  onBefore: ({ block }) => {
    // Lake Powell specific customizations
    block.classList.add('lake-powell-hero');
  }
};

export default (block) => baseDecorate(block, lakePowellHooks);
```
