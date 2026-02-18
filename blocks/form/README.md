# Form Base Block

Base implementation of the form block with extensibility support.

## Features

- **Dynamic form generation** from JSON data
- **Field grouping** into fieldsets
- **Form validation** with focus management
- **Async submission** with loading state
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/form/form.js';

export default async function decorateForm(block) {
  await decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/form/form.js';

export default async function decorate(block) {
  await decorateBase(block, {
    onBefore: (ctx) => {
      // Add form variant class
      ctx.block.classList.add('contact-form');
    },
    onAfter: (ctx) => {
      // Add custom validation or tracking
    }
  });
}
```

## Structure

The block expects two links: one to the form definition JSON, and one for the submit endpoint:

```html
<div class="form">
  <div>
    <div><a href="/forms/contact.json">Form Definition</a></div>
    <div><a href="/api/submit">Submit Endpoint</a></div>
  </div>
</div>
```

## Customization Points

### Via Hooks

- **onBefore**: Add form classes, inject hidden fields
- **onAfter**: Add custom validation, analytics tracking

### Via Events

- **form:before**: Fired before form setup
- **form:after**: Fired after form ready

### Via Property Overrides

Create `/brands/{property}/blocks/form/form.js` to:
- Add custom field types
- Implement multi-step forms
- Add property-specific validation rules

## See Also

- [Modal Block](../modal/README.md) - Display forms in modals
