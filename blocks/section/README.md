# Section Block

Base implementation of the page section container with extensibility support.

## Features

- **Page layout container** — groups blocks within a named section
- **Style variants** — `highlight` applies a branded background
- **Content tree label** — the Section Name field labels the section in the UE content tree
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Authoring Fields

| Field | Type | Description |
|-------|------|-------------|
| Section Name | text | Label shown in the Content Tree |
| Style | multiselect | Visual variants (e.g. `highlight`) |

## Allowed Children

Sections may contain: `text`, `image`, `button`, `title`, `hero`, `cards`, `columns`, `fragment`

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/section/section.js';

export default function decorateSection(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/section/section.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Add data attribute from section name
      const name = ctx.block.dataset.name;
      if (name) ctx.block.setAttribute('data-section', name);
    }
  });
}
```

## Structure

```html
<div class="section highlight" data-name="Featured Content">
  <!-- child blocks -->
</div>
```

## Customization Points

### Via Hooks

- **onBefore**: Add custom data attributes, modify class list
- **onAfter**: Initialise section-level animations or scroll triggers

### Via Events

- **section:before**: Fired before section setup
- **section:after**: Fired after section ready

### Via Property Overrides

Create `/brands/{property}/blocks/section/section.js` to:
- Add additional style variants
- Implement full-width or constrained layout modes
- Add background image or video support

## See Also

- [Columns Block](../columns/README.md) - Multi-column layout within a section
- [Hero Block](../hero/README.md) - Full-width section alternative
