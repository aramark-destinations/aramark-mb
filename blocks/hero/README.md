# Hero Base Block

Base implementation of the hero/banner block with extensibility support.

## Features

- **Full-width banner** with image and text overlay
- **Semantic structure** - Automatic classification of image and text content
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/hero/hero.js';

export default function decorateHero(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/hero/hero.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Add parallax class
      ctx.block.classList.add('hero-parallax');
    },
    onAfter: (ctx) => {
      // Add scroll indicator
    }
  });
}
```

## Structure

```html
<div class="hero">
  <div>
    <div class="hero-image"><picture>...</picture></div>
    <div class="hero-text"><h1>Heading</h1></div>
  </div>
</div>
```

## Customization Points

### Via Hooks

- **onBefore**: Add variant classes, modify structure
- **onAfter**: Add parallax effects, scroll animations, CTAs

### Via Events

- **hero:before**: Fired before hero setup
- **hero:after**: Fired after hero ready

### Via Property Overrides

Create `/brands/{property}/blocks/hero/hero.js` to:
- Add video backgrounds
- Implement parallax scrolling
- Add property-specific CTAs

## Breadcrumb Integration

The Hero block supports an optional breadcrumb trail rendered at the bottom of the hero image. Breadcrumbs are not an independently placeable block — they are toggled on via the Hero block configuration.

The breadcrumbs are positioned in a flex row that spans the full hero width (`align-self: stretch`) with `justify-content: flex-start`, placing them in the bottom-left corner of the hero. Text color is always white in this context, overriding the breadcrumbs component's default Mode=Light dark text.

The breadcrumb trail is dynamically constructed from site structure. Each crumb label comes from the page's `Breadcrumb Title` metadata field, falling back to the page `Title`. The first crumb is always "Home" linked to the property homepage.

See [`blocks/breadcrumbs/`](../breadcrumbs/) for the breadcrumbs block and [`blocks/breadcrumbs/breadcrumbs-figma-audit.md`](../breadcrumbs/breadcrumbs-figma-audit.md) for the Figma spec.

## See Also

- [Carousel Block](../carousel/README.md) - Multi-slide hero
- [Breadcrumbs Block](../breadcrumbs/README.md) - Breadcrumb trail (hero-embedded)
