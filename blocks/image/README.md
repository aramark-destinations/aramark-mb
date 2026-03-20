# Image Base Block

Base implementation of the standalone image block with extensibility support.

## Features

- **Responsive image** rendered via AEM picture element
- **Alt text** applied from authored `imageAlt` field
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Authoring Fields

| Field | Type | Description |
|-------|------|-------------|
| Image | reference | DAM asset reference |
| Alt Text | text | Accessible description of the image |

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/image/image.js';

export default function decorateImage(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/image/image.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Add lazy loading override
      ctx.block.querySelector('img')?.setAttribute('loading', 'eager');
    },
    onAfter: (ctx) => {
      // Add lightbox trigger
    }
  });
}
```

## Structure

```html
<div class="image">
  <div>
    <div><picture><img src="..." alt="Description"></picture></div>
  </div>
</div>
```

## Customization Points

### Via Hooks

- **onBefore**: Override loading strategy, add aspect ratio
- **onAfter**: Attach lightbox, add captions

### Via Events

- **image:before**: Fired before image setup
- **image:after**: Fired after image ready

### Via Property Overrides

Create `/brands/{property}/blocks/image/image.js` to:
- Add caption support
- Implement lightbox/modal behaviour
- Add zoom interactions

## Accessibility

- Alt text applied from authored `imageAlt` field for screen readers
- Image renders as `display: block` to prevent inline spacing issues
- Responsive width (100%) ensures proper scaling across viewports

## Token Dependencies

No custom tokens currently used. Base styles use standard CSS properties.

## See Also

- [Hero Block](../hero/README.md) - Full-width image with text overlay
- [Cards Block](../cards/README.md) - Image within a card layout
