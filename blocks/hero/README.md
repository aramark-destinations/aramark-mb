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

## See Also

- [Carousel Block](../carousel/README.md) - Multi-slide hero
