# Footer Base Block

Base implementation of the footer block with extensibility support.

## Features

- **Fragment-based** content loading from `/footer` document
- **Simple decoration** for footer content
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration
- **Metadata support** for custom footer paths

## Usage

### Basic Usage (Direct Import)

```javascript
import decorate from '../../blocks/footer/footer.js';

export default async function decorateFooter(block) {
  await decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/footer/footer.js';

export default async function decorate(block) {
  await decorateBase(block, {
    onBefore: (ctx) => {
      // Add custom footer processing
      console.log('Footer decoration starting');
    },
    onAfter: (ctx) => {
      // Add copyright year, analytics, etc.
      const footer = ctx.block.querySelector('div');
      const year = new Date().getFullYear();
      const copyright = footer.querySelector('.copyright');
      if (copyright) {
        copyright.textContent = copyright.textContent.replace('{year}', year);
      }
    }
  });
}
```

### With Event Listeners

```javascript
import decorate from '../../blocks/footer/footer.js';

export default async function decorateFooter(block) {
  block.addEventListener('footer:before', (e) => {
    console.log('Footer decoration starting', e.detail);
  });
  
  block.addEventListener('footer:after', (e) => {
    console.log('Footer decoration complete', e.detail);
    // Add tracking to footer links
  });
  
  await decorate(block);
}
```

## Structure

The footer block expects a footer fragment at `/footer` (or custom path via metadata):

```
/footer
└── Footer content (any structure)
```

## Metadata

- `footer` - Custom path to footer fragment (e.g., `/custom-footer`)

## Customization Points

### Via Hooks

- **onBefore**: Modify block before loading fragment
- **onAfter**: Enhance footer after fragment loads

### Via Events

- **footer:before**: Fired before decoration starts
- **footer:after**: Fired after decoration completes

### Via Property Overrides

Create `/brands/{property}/blocks/footer/footer.js` to:
- Add property-specific footer content
- Inject dynamic data (copyright year, etc.)
- Add tracking or analytics
- Customize footer structure

## Common Enhancements

### Dynamic Copyright Year

```javascript
onAfter: (ctx) => {
  const footer = ctx.block;
  const year = new Date().getFullYear();
  footer.innerHTML = footer.innerHTML.replace('{year}', year);
}
```

### Link Tracking

```javascript
onAfter: (ctx) => {
  ctx.block.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Track footer link clicks
      console.log('Footer link clicked:', e.target.href);
    });
  });
}
```

### Social Media Integration

```javascript
onAfter: (ctx) => {
  const socialLinks = ctx.block.querySelectorAll('.social a');
  socialLinks.forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
}
```

## See Also

- [Header Base Block](../header/README.md)
- [Fragment Block](../../blocks/fragment/README.md)
