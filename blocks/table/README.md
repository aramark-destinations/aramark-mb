# Table Block (Base)

Recreate accessible tables with semantic markup, responsive design, and variant support.

## Features

- ✅ Semantic `<table>` markup with `<thead>` and `<tbody>`
- ✅ Automatic header row detection
- ✅ Proper `scope` attributes for accessibility
- ✅ Responsive font sizing
- ✅ Horizontal scrolling on overflow
- ✅ Multiple variants (no-header, striped, bordered)
- ✅ Lifecycle hooks (onBefore/onAfter)
- ✅ Custom events (table:before, table:after)

## Basic Usage

```javascript
import { decorate } from './table.js';

export default (block) => decorate(block);
```

## With Hooks

```javascript
import { decorate as baseDecorate } from '../../blocks/table/table.js';

const hooks = {
  onBefore: ({ block }) => {
    // Add custom sorting functionality
  },
  onAfter: ({ block }) => {
    // Track table usage
    console.log('Table displayed');
  }
};

export default (block) => baseDecorate(block, hooks);
```

## Authoring

### Standard Table (with header)

```
|                          Table                           |
|----------------------------------------------------------|
| Header 1   | Header 2   | Header 3                      |
| Data 1     | Data 2     | Data 3                        |
| Data 4     | Data 5     | Data 6                        |
```

### No Header Variant

```
|                     Table (no-header)                    |
|----------------------------------------------------------|
| Data 1     | Data 2     | Data 3                        |
| Data 4     | Data 5     | Data 6                        |
```

### Striped Variant

```
|                     Table (striped)                      |
|----------------------------------------------------------|
| Header 1   | Header 2   | Header 3                      |
| Data 1     | Data 2     | Data 3                        |
| Data 4     | Data 5     | Data 6                        |
```

### Bordered Variant

```
|                     Table (bordered)                     |
|----------------------------------------------------------|
| Header 1   | Header 2   | Header 3                      |
| Data 1     | Data 2     | Data 3                        |
| Data 4     | Data 5     | Data 6                        |
```

## HTML Output

```html
<div class="table block">
  <table>
    <thead>
      <tr>
        <th scope="column">Header 1</th>
        <th scope="column">Header 2</th>
        <th scope="column">Header 3</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 3</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Variants

### no-header
Renders all rows as data rows (no `<thead>`).

### striped
Alternating row background colors for better readability.

### bordered
Adds borders around all cells.

## Extension Points

### Hooks

- `onBefore({ block, options })` - Before table decoration
- `onAfter({ block, options })` - After table decoration

### Events

- `table:before` - Fired before decoration
- `table:after` - Fired after decoration

## CSS Custom Properties

Override these in your extension:

```css
.table {
  --table-border-width: 1px;
  --table-border-color: currentColor;
  --table-header-weight: 700;
  --table-cell-padding: 0.5em;
  --table-striped-bg: var(--overlay-background-color);
}
```

## Accessibility

- Semantic `<table>`, `<thead>`, `<tbody>` elements
- `scope="column"` on header cells
- Proper heading hierarchy
- Keyboard navigation supported
- Screen reader friendly

## Performance

- Horizontal scroll container for wide tables
- Responsive font sizing with media queries
- Efficient DOM manipulation using `replaceChildren`

## Browser Support

- Modern browsers (ES6+)
- CSS Grid and Flexbox
- `:nth-child` pseudo-classes
- CSS custom properties
