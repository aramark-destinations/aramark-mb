# Search Base Block

Base implementation of the full-text search block with extensibility support.

## Features

- **Full-text search** against the site query index
- **Result highlighting** of matched search terms
- **Ranked results** with header matches prioritized over metadata
- **URL state management** via query parameters (`?q=term`)
- **Optimized result images** via `createOptimizedPicture`
- **Keyboard support** — Escape clears search
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/search/search.js';

export default async function decorateSearch(block) {
  await decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/search/search.js';

export default async function decorate(block) {
  await decorateBase(block, {
    onBefore: (ctx) => {
      // Add custom search styling
    },
    onAfter: (ctx) => {
      // Add analytics tracking for search queries
    }
  });
}
```

### Custom Data Source

Provide a link in the block content to use a custom search index:

```html
<div class="search">
  <div><a href="/custom-query-index.json">Search Index</a></div>
</div>
```

If no link is provided, defaults to `/query-index.json`.

## API

### `fetchData(source)`
Exported utility to fetch and parse search index data.

## Customization Points

### Via Hooks

- **onBefore**: Add custom UI elements, modify search container
- **onAfter**: Add analytics, custom result rendering

### Via Events

- **search:before**: Fired before search setup
- **search:after**: Fired after search ready

### Via Property Overrides

Create `/brands/{property}/blocks/search/search.js` to:
- Add faceted search filters
- Customize result rendering
- Add search suggestions/autocomplete

## Placeholder Keys

Customize text via placeholders:
- `searchPlaceholder` - Input placeholder text (default: "Search...")
- `searchNoResults` - No results message (default: "No results found.")

## See Also

- [Header Block](../header/README.md) - Navigation with search link
