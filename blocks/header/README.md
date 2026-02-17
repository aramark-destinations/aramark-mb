# Header Base Block

Base implementation of the header/navigation block with extensibility support.

## Features

- **Responsive navigation** with desktop and mobile layouts
- **Hamburger menu** for mobile devices
- **Dropdown navigation** for nested menu items
- **Breadcrumbs support** (when metadata enabled)
- **Accessibility** with keyboard navigation and ARIA attributes
- **Fragment-based** content loading from `/nav` document
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Usage

### Basic Usage (Direct Import)

```javascript
import decorate from '../../blocks/header/header.js';

export default async function decorateHeader(block) {
  await decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/header/header.js';

export default async function decorate(block) {
  await decorateBase(block, {
    onBefore: (ctx) => {
      // Inject custom navigation items
      console.log('Header decoration starting');
    },
    onAfter: (ctx) => {
      // Add analytics tracking to nav links
      const nav = ctx.block.querySelector('nav');
      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          // Track navigation clicks
        });
      });
    }
  });
}
```

### With Event Listeners

```javascript
import decorate from '../../blocks/header/header.js';

export default async function decorateHeader(block) {
  block.addEventListener('header:before', (e) => {
    console.log('Header decoration starting', e.detail);
  });
  
  block.addEventListener('header:after', (e) => {
    console.log('Header decoration complete', e.detail);
  });
  
  await decorate(block);
}
```

## Structure

The header block expects a navigation fragment at `/nav` (or custom path via metadata):

```
/nav
├── Brand section
├── Navigation sections (with optional dropdowns)
└── Tools section
```

## Metadata

- `nav` - Custom path to navigation fragment
- `breadcrumbs` - Set to "true" to enable breadcrumbs

## Customization Points

### Via Hooks

- **onBefore**: Modify block before decoration
- **onAfter**: Enhance navigation after decoration

### Via Events

- **header:before**: Fired before decoration starts
- **header:after**: Fired after decoration completes

### Via Property Overrides

Create `/brands/{property}/blocks/header/header.js` to:
- Add property-specific navigation items
- Customize navigation behavior
- Add tracking or analytics
- Modify hamburger menu behavior

## Navigation Structure

The block supports three main sections:

1. **Brand** (`nav-brand`) - Logo/brand link
2. **Sections** (`nav-sections`) - Main navigation with dropdowns
3. **Tools** (`nav-tools`) - Utility links (search, account, etc.)

## Responsive Behavior

- **Desktop (≥900px)**: Horizontal navigation with hover dropdowns
- **Mobile (<900px)**: Hamburger menu with slide-out navigation

## Accessibility

- Keyboard navigation support
- ARIA labels and expanded states
- Focus management
- Escape key to close menus

## See Also

- [Footer Base Block](../footer/README.md)
- [Fragment Block](../../blocks/fragment/README.md)
