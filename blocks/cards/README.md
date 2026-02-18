# Cards Base Block

Base implementation of the cards grid block with extensibility support.

## Features

- **Semantic markup** - Renders as `ul`/`li` list
- **Optimized images** via `createOptimizedPicture`
- **Automatic classification** of card image vs body content
- **Instrumentation preserved** via `moveInstrumentation`
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/cards/cards.js';

export default function decorateCards(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/cards/cards.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Add grid variant class
      ctx.block.classList.add('cards-3-col');
    },
    onAfter: (ctx) => {
      // Add click tracking to card links
      ctx.block.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          // Track card click
        });
      });
    }
  });
}
```

## Structure

Each row becomes a card:

```html
<div class="cards">
  <div>
    <div><picture>...</picture></div>
    <div><h3>Title</h3><p>Description</p></div>
  </div>
</div>
```

Becomes:

```html
<ul>
  <li>
    <div class="cards-card-image"><picture>...</picture></div>
    <div class="cards-card-body"><h3>Title</h3><p>Description</p></div>
  </li>
</ul>
```

## Customization Points

### Via Hooks

- **onBefore**: Add grid classes, modify structure
- **onAfter**: Add click tracking, animations, lazy loading

### Via Events

- **cards:before**: Fired before card processing
- **cards:after**: Fired after cards ready

### Via Property Overrides

Create `/brands/{property}/blocks/cards/cards.js` to:
- Implement custom card layouts
- Add hover effects
- Add card filtering or sorting

## See Also

- [Columns Block](../columns/README.md) - Column layouts
- [Carousel Block](../carousel/README.md) - Slideshow layouts
