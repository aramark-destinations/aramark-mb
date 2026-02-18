# Quote Block (Base)

Display quotations with optional attribution and automatic formatting.

## Features

- ✅ Semantic `<blockquote>` markup
- ✅ Automatic quotation mark insertion
- ✅ Attribution with em-dash prefix
- ✅ `<cite>` conversion for italicized attributions
- ✅ Lifecycle hooks (onBefore/onAfter)
- ✅ Custom events (quote:before, quote:after)
- ✅ Responsive typography

## Basic Usage

```javascript
import { decorate } from './quote.js';

export default (block) => decorate(block);
```

## With Hooks

```javascript
import { decorate as baseDecorate } from '../../blocks/quote/quote.js';

const hooks = {
  onBefore: ({ block }) => {
    // Add custom classes
    block.classList.add('custom-quote');
  },
  onAfter: ({ block }) => {
    // Track quote views
    console.log('Quote displayed');
  }
};

export default (block) => baseDecorate(block, hooks);
```

## Authoring

### Simple Quote

```
|                          Quote                           |
|----------------------------------------------------------|
| This is the quotation text that will be displayed.       |
```

### Quote with Attribution

```
|                          Quote                           |
|----------------------------------------------------------|
| This is the quotation text that will be displayed.       |
| John Doe, *Company Name*                                 |
```

The second row becomes the attribution. Text in `*italics*` is wrapped in `<cite>` tags.

## HTML Output

### Simple Quote

```html
<div class="quote block">
  <blockquote>
    <div class="quote-quotation">
      <p>"This is the quotation text."</p>
    </div>
  </blockquote>
</div>
```

### With Attribution

```html
<div class="quote block">
  <blockquote>
    <div class="quote-quotation">
      <p>"This is the quotation text."</p>
    </div>
    <div class="quote-attribution">
      <p>—John Doe, <cite>Company Name</cite></p>
    </div>
  </blockquote>
</div>
```

## Extension Points

### Hooks

- `onBefore({ block, options })` - Before quote decoration
- `onAfter({ block, options })` - After quote decoration

### Events

- `quote:before` - Fired before decoration
- `quote:after` - Fired after decoration

## CSS Custom Properties

Override these in your extension:

```css
.quote blockquote {
  --quote-max-width: 900px;
  --quote-font-size: 120%;
  --quote-padding: 24px;
}
```

## Accessibility

- Proper semantic markup with `<blockquote>`
- `<cite>` tags for attributions
- Readable contrast ratios
- Responsive font sizing

## Browser Support

- Modern browsers (ES6+)
- CSS custom properties
- `:first-child`, `:last-child` pseudo-classes
