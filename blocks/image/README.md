# Image Block

Standalone image block with responsive picture output and Universal Editor authoring support.

## Features

- **Responsive image** output via `createOptimizedPicture` — generates `<source>` elements at 375, 768, and 1200px widths with WebP and fallback formats
- **Alt text** applied from the authored `imageAlt` field, with optional auto-population from DAM asset metadata via the `imageAltFromDam` checkbox
- **UE instrumentation preserved** via `moveInstrumentation` when the picture element is replaced during decoration
- **Lifecycle hooks** for site-level customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Authoring Fields

| Field | Type | Description |
|---|---|---|
| Image | reference | DAM asset reference |
| Alt Text | text | Accessible description of the image |
| Get Alternative Text from DAM | checkbox | When checked, populates Alt Text from the DAM asset's metadata description and disables manual editing. Default: checked. |

## Rendered Structure

```html
<div class="image block">
  <div>
    <div>
      <picture>
        <source type="image/webp" srcset="image.jpg?width=375&format=webply&optimize=medium">
        <source type="image/webp" srcset="image.jpg?width=768&format=webply&optimize=medium">
        <source type="image/webp" srcset="image.jpg?width=1200&format=webply&optimize=medium">
        <source srcset="image.jpg?width=375&format=jpg&optimize=medium">
        <source srcset="image.jpg?width=768&format=jpg&optimize=medium">
        <img loading="lazy" alt="Description" src="image.jpg?width=1200&format=jpg&optimize=medium">
      </picture>
    </div>
  </div>
</div>
```

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
      // Example: force eager loading for above-the-fold images
      ctx.block.querySelector('img')?.setAttribute('loading', 'eager');
    },
    onAfter: (ctx) => {
      // Example: attach lightbox behaviour
    },
  });
}
```

## Customization

### Via Hooks

- **onBefore**: Runs before picture optimization. Use to override loading strategy or inspect the original `<img>`.
- **onAfter**: Runs after the optimized picture has replaced the original. Use to attach interactions (lightbox, zoom, etc.).

### Via Events

- **image:before**: Fired before image setup
- **image:after**: Fired after the optimized picture is in the DOM

### Via Property Overrides

Create `/brands/{property}/blocks/image/image.js` to:
- Change responsive breakpoints
- Add caption support
- Implement lightbox/modal behaviour
- Add zoom interactions

## See Also

- [Hero Block](../hero/README.md) — Full-width image with text overlay
- [Cards Block](../cards/README.md) — Image within a card layout
