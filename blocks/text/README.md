# Text Base Block

Base implementation of the rich text body block with extensibility support.

## Features

- **Rich text content** rendered directly by AEM (no field model required)
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Authoring

The Text block uses AEM's built-in rich text editor. There are no custom fields — content is edited inline in the Universal Editor.

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/text/text.js';

export default function decorateText(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/text/text.js';

export default function decorate(block) {
  decorateBase(block, {
    onAfter: (ctx) => {
      // Open external links in new tab
      ctx.block.querySelectorAll('a[href^="http"]').forEach((link) => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    }
  });
}
```

## Structure

```html
<div class="text">
  <div>
    <div><p>Rich text content...</p></div>
  </div>
</div>
```

## Customization Points

### Via Hooks

- **onBefore**: Pre-process content, add wrapper classes
- **onAfter**: Enhance links, add read-more truncation

### Via Events

- **text:before**: Fired before text setup
- **text:after**: Fired after text ready

### Via Property Overrides

Create `/brands/{property}/blocks/text/text.js` to:
- Add external link indicators
- Implement read-more/collapse behaviour
- Add print-friendly formatting

## See Also

- [Title Block](../title/README.md) - Heading element
