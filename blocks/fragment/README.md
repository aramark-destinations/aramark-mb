# Fragment Base Block

Base implementation of the fragment block with extensibility support.

## Features

- **Content reuse** - Include content from other pages as fragments
- **Fragment loading** - Async loading of fragment HTML
- **Media path resolution** - Automatic media URL fixing for fragments
- **Section decoration** - Full block decoration in fragments
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/fragment/fragment.js';

export default async function decorateFragment(block) {
  await decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/fragment/fragment.js';

export default async function decorate(block) {
  await decorateBase(block, {
    onBefore: (ctx) => {
      // Add loading indicator
      ctx.block.classList.add('loading');
    },
    onAfter: (ctx) => {
      // Remove loading indicator
      ctx.block.classList.remove('loading');
      // Track fragment load
    }
  });
}
```

### Load Fragment Programmatically

```javascript
import { loadFragment } from '../../blocks/fragment/fragment.js';

// Load fragment content
const fragment = await loadFragment('/fragments/my-content');
if (fragment) {
  document.querySelector('.container').append(...fragment.childNodes);
}
```

## Structure

The fragment block expects either:
- A link to the fragment page
- Plain text with the fragment path

```html
<div class="fragment">
  <div>
    <div><a href="/fragments/promo">Promo Fragment</a></div>
  </div>
</div>
```

## Customization Points

### Via Hooks

- **onBefore**: Add loading states or pre-validation
- **onAfter**: Track fragment loads, add analytics

### Via Events

- **fragment:before**: Fired before fragment loads
- **fragment:after**: Fired after fragment loads

### Via Property Overrides

Create `/brands/{property}/blocks/fragment/fragment.js` to:
- Customize fragment paths
- Add property-specific fragment logic
- Implement caching strategies
- Add custom error handling

## Common Use Cases

### Fragment Caching

```javascript
const fragmentCache = new Map();

onBefore: (ctx) => {
  const link = ctx.block.querySelector('a');
  const path = link?.getAttribute('href');
  if (fragmentCache.has(path)) {
    ctx.cachedFragment = fragmentCache.get(path);
  }
}
```

### Error Handling

```javascript
onAfter: (ctx) => {
  if (!ctx.block.querySelector('.section')) {
    // Fragment failed to load
    ctx.block.innerHTML = '<p>Content unavailable</p>';
  }
}
```

## See Also

- [Header Block](../header/README.md) - Uses fragment loading
- [Footer Block](../footer/README.md) - Uses fragment loading
