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

## See Also

- [Tabs Block](../tabs/README.md) - Tabbed content interface
