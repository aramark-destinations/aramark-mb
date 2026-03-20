# Title Base Block

Base implementation of the title/heading block with extensibility support.

## Features

- **Semantic headings** — h1 through h6 selectable by authors
- **Section theme support** — heading color automatically adapts to parent section theme
- **Variant support** — author-assigned variant classes set via `readVariant` (e.g., `title title-centered`)
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration (bubble up the DOM)

## Authoring Fields

| Field | Type | Description |
|-------|------|-------------|
| Title | text | Heading text content |
| Title Type | select | Heading level: h1, h2, h3, h4, h5, h6 (UE model updated to include h5/h6) |

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
      const heading = ctx.block.querySelector('h1, h2, h3, h4, h5, h6');
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

## Section Themes

Heading color responds to the parent section's theme class:

| Section theme | Heading color token |
|---------------|---------------------|
| (default)     | `--text-dark-1` (inherited from body) |
| `light`       | `--text-dark-1` (inherited from body) |
| `light2`      | `--text-dark-1` (inherited from body) |
| `dark`        | `--text-light-1` |
| `brand`       | `--text-light-1` |
| `tertiary`    | `--text-light-1` |

Themes are applied by AEM via section metadata. No block-level configuration needed.

## See Also

- [Text Block](../text/README.md) - Rich text body content
