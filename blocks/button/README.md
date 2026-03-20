# Button Base Block

Base implementation of the button/CTA block with extensibility support.

## Features

- **Link rendering** with optional type modifier (`primary`, `secondary`)
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Authoring Fields

| Field | Type | Description |
|-------|------|-------------|
| Link | aem-content | Target URL or page reference |
| Text | text | Visible label for the button |
| Title | text | Accessible title (tooltip) |
| Type | select | Visual variant: default, primary, secondary |

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/button/button.js';

export default function decorateButton(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/button/button.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Add tracking attributes
      ctx.block.querySelector('a')?.setAttribute('data-analytics', 'cta');
    },
    onAfter: (ctx) => {
      // Attach click handler
    }
  });
}
```

## Structure

```html
<div class="button">
  <div>
    <div><a href="/path" class="primary">Label</a></div>
  </div>
</div>
```

## Customization Points

### Via Hooks

- **onBefore**: Modify link attributes, add tracking
- **onAfter**: Attach event listeners, add icons

### Via Events

- **button:before**: Fired before button setup
- **button:after**: Fired after button ready

### Via Property Overrides

Create `/brands/{property}/blocks/button/button.js` to:
- Add icon support
- Implement custom analytics events
- Add loading/disabled states

## Variants

- **primary** — Branded primary button style
- **secondary** — Outlined/secondary button style

## Accessibility

- Renders as native `<a>` elements for built-in keyboard and screen reader support
- Inherits link focus styles from global CSS
- Button text provides accessible label; `title` attribute adds tooltip

## Token Dependencies

| Token | Purpose |
|-------|---------|
| `--spacing-002` | Vertical padding |
| `--spacing-008` | Horizontal padding |
| `--border-radius` | Button border radius |
| `--link-color` | Default background and secondary border color |
| `--link-hover-color` | Hover background |
| `--background-color` | Default text color |
| `--color-brand-primary` | Primary variant background |

## See Also

- [Hero Block](../hero/README.md) - Hero with CTA button
