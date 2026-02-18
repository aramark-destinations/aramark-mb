# Tabs Base Block

Base implementation of the tabbed content block with extensibility support.

## Features

- **Accessible tab interface** with ARIA roles, labels, and states
- **Keyboard navigation** support
- **Tab change events** for tracking and custom behavior
- **onTabClick hook** for intercepting tab interactions
- **Instrumentation preserved** via `moveInstrumentation`
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before, after decoration, and on tab change

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/tabs/tabs.js';

export default async function decorateTabs(block) {
  await decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/tabs/tabs.js';

export default async function decorate(block) {
  await decorateBase(block, {
    onBefore: (ctx) => {
      // Add custom styling class
      ctx.block.classList.add('custom-tabs');
    },
    onAfter: (ctx) => {
      // Track tab views
    },
    onTabClick: ({ block, button, tabpanel, i }) => {
      // Custom tab click behavior
    }
  });
}
```

## Structure

The first cell of each row is the tab title, remaining content becomes the panel:

```html
<div class="tabs">
  <div>
    <div><h3>Tab 1</h3></div>
    <div>Tab 1 content</div>
  </div>
  <div>
    <div><h3>Tab 2</h3></div>
    <div>Tab 2 content</div>
  </div>
</div>
```

## Customization Points

### Via Hooks

- **onBefore**: Modify structure before tab processing
- **onAfter**: Add tracking, custom behavior
- **onTabClick**: Intercept individual tab clicks

### Via Events

- **tabs:before**: Fired before tab setup
- **tabs:after**: Fired after tabs ready
- **tabs:change**: Fired on tab switch (detail: `{ button, tabpanel, index }`)

### Via Property Overrides

Create `/brands/{property}/blocks/tabs/tabs.js` to:
- Add vertical tab layouts
- Implement animated transitions
- Add deep linking to tabs

## See Also

- [Accordion Block](../accordion/README.md) - Collapsible content
