# Title Base Block

Base implementation of the title/heading block with extensibility support.

## Features

- **Semantic headings** — h1 through h4 selectable by authors
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Authoring Fields

| Field | Type | Description |
|-------|------|-------------|
| Title | text | Heading text content |
| Title Type | select | Heading level: h1, h2, h3, h4 |

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/title/title.js';

export default function decorateTitle(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/title/title.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Add anchor ID from heading text
      const heading = ctx.block.querySelector('h1, h2, h3, h4');
      if (heading) heading.id = heading.textContent.toLowerCase().replace(/\s+/g, '-');
    }
  });
}
```

## Structure

```html
<div class="title">
  <div>
    <div><h2>Heading Text</h2></div>
  </div>
</div>
```

## Customization Points

### Via Hooks

- **onBefore**: Add anchor IDs, inject decorative elements
- **onAfter**: Add scroll-spy, animate on scroll

### Via Events

- **title:before**: Fired before title setup
- **title:after**: Fired after title ready

### Via Property Overrides

Create `/brands/{property}/blocks/title/title.js` to:
- Add decorative underlines or icons
- Implement animated reveal effects
- Add table-of-contents anchor support

## See Also

- [Text Block](../text/README.md) - Rich text body content
