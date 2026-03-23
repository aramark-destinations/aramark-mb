# Accordion Base Block

Base implementation of the accordion/collapsible block with extensibility support.

## Features

- **Native details/summary** elements for built-in accessibility
- **Keyboard accessible** - No additional JS needed for open/close
- **Instrumentation preserved** via `moveInstrumentation`
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/accordion/accordion.js';

export default function decorateAccordion(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/accordion/accordion.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Add custom classes before processing
    },
    onAfter: (ctx) => {
      // Open first item by default
      ctx.block.querySelector('details')?.setAttribute('open', '');
    }
  });
}
```

## Structure

Each row becomes a collapsible item:

```html
<div class="accordion">
  <div>
    <div>Summary Label</div>
    <div>Body Content</div>
  </div>
</div>
```

Becomes:

```html
<details class="accordion-item">
  <summary class="accordion-item-label">Summary Label</summary>
  <div class="accordion-item-body">Body Content</div>
</details>
```

## Customization Points

### Via Hooks

- **onBefore**: Modify structure before accordion processing
- **onAfter**: Open specific items, add animations, add tracking

### Via Events

- **accordion:before**: Fired before accordion setup
- **accordion:after**: Fired after accordion ready

### Via Property Overrides

Create `/brands/{property}/blocks/accordion/accordion.js` to:
- Control single/multi open behavior
- Add custom animations
- Implement expand-all/collapse-all controls

## Variants

- **collapsed-by-default** — Per-item boolean controlling initial open/closed state (default: true/collapsed)
- **no-motion** — Automatically applied when `prefers-reduced-motion: reduce` is detected

## Accessibility

- Uses native `<details>`/`<summary>` elements for built-in keyboard and screen reader support
- Home/End keyboard navigation between accordion summaries
- Respects `prefers-reduced-motion` (disables CSS transitions)
- Focus outline meets WCAG 2.4.7 via `.keyfocus` selector
- Minimum 48px touch target height for summary elements

## Token Dependencies

| Token | Purpose |
|-------|---------|
| `--accordion-title-color` | Title text color |
| `--accordion-title-padding` | Title container padding |
| `--accordion-title-font` | Title font shorthand |
| `--accordion-title-text-transform` | Title text transform |
| `--accordion-title-letter-spacing` | Title letter spacing |
| `--accordion-subtitle-font` | Subtitle font shorthand |
| `--accordion-border` | Item border style |
| `--accordion-open-background-color` | Open item summary background |
| `--accordion-open-body-background-color` | Open item body background |
| `--accordion-body-padding` | Body content padding |
| `--accordion-body-color` | Body text color |
| `--color-text-primary` | Base text color reference |
| `--font-family-display` | Display font family |
| `--color-neutral-400` | Border color reference |
| `--focus-outline` | Focus ring style |
| `--color-brand-primary` | Focus ring color fallback |

## See Also

- [Tabs Block](../tabs/README.md) - Tabbed content interface
