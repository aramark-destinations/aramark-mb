# Columns Base Block

Base implementation of the columns block with extensibility support.

## Features

- **Responsive columns** - Automatic column count detection
- **Image column detection** - Special styling for image-only columns
- **Flexible layouts** - Supports any number of columns
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/columns/columns.js';

export default function decorateColumns(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/columns/columns.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Add custom column classes before processing
      if (ctx.block.classList.contains('centered')) {
        ctx.block.style.textAlign = 'center';
      }
    },
    onAfter: (ctx) => {
      // Equalize column heights
      const cols = ctx.block.querySelectorAll(':scope > div > div');
      if (cols.length) {
        const maxHeight = Math.max(...Array.from(cols).map(c => c.offsetHeight));
        cols.forEach(col => col.style.minHeight = `${maxHeight}px`);
      }
    }
  });
}
```

## Structure

The columns block automatically detects the number of columns from the first row:

```html
<div class="columns">
  <div>
    <div>Column 1</div>
    <div>Column 2</div>
    <div>Column 3</div>
  </div>
</div>
```

Results in: `columns-3-cols` class

## Automatic Features

### Column Count Class
The block adds `columns-{n}-cols` class where {n} is the number of columns.

### Image Column Detection
Columns containing only an image get the`columns-img-col` class for special styling.

## Customization Points

### Via Hooks

- **onBefore**: Modify structure before column processing
- **onAfter**: Add custom behaviors, equalize heights, add animations

### Via Events

- **columns:before**: Fired before column processing
- **columns:after**: Fired after column processing

### Via Property Overrides

Create `/brands/{property}/blocks/columns/columns.js` to:
- Add property-specific column layouts
- Implement custom column behaviors
- Add parallax or animation effects
- Implement column sorting/filtering

## Common Enhancements

### Equal Height Columns

```javascript
onAfter: (ctx) => {
  const cols = ctx.block.querySelectorAll(':scope > div > div');
  const maxHeight = Math.max(...Array.from(cols).map(c => c.offsetHeight));
  cols.forEach(col => col.style.minHeight = `${maxHeight}px`);
}
```

### Lazy Load Images in Columns

```javascript
onAfter: (ctx) => {
  const images = ctx.block.querySelectorAll('img');
  images.forEach(img => {
    img.loading = 'lazy';
  });
}
```

### Column Animations

```javascript
onAfter: (ctx) => {
  const cols = ctx.block.querySelectorAll(':scope > div > div');
  cols.forEach((col, idx) => {
    col.style.animationDelay = `${idx * 0.1}s`;
    col.classList.add('fade-in');
  });
}
```

## CSS Classes

- `.columns-{n}-cols` - Number of columns (e.g., `columns-3-cols`)
- `.columns-img-col` - Applied to image-only columns

## Accessibility

- Stacks to single column on mobile for readability
- Image columns are reordered first on mobile for visual hierarchy
- Semantic structure preserved through column wrapper divs

## Token Dependencies

| Token | Purpose |
|-------|---------|
| `--spacing-024` | Column gap at desktop breakpoint |

## See Also

- [Cards Block](../cards/README.md) - Similar grid layout
