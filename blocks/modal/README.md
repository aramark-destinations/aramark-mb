# Modal Block

Utility block for displaying content in dialog overlays. This is not a traditional block — it has no `decorate` function and is instead used programmatically.

## Features

- **Fragment-based content** loaded from `/modals/` paths
- **Native dialog element** with backdrop
- **Close button** with accessible labeling
- **Click-outside-to-close** behavior
- **Body scroll lock** when modal is open
- **Programmatic API** for use by other blocks

## Usage

### Opening a Modal from a Fragment

```javascript
import { openModal } from '../../blocks/modal/modal.js';

// Open a modal with content from a fragment path
openModal('/modals/contact');
```

### Creating a Custom Modal

```javascript
import { createModal } from '../../blocks/modal/modal.js';

const content = document.createElement('div');
content.innerHTML = '<h2>Custom Content</h2><p>Hello world</p>';

const { showModal } = await createModal([content]);
showModal();
```

## API

### `openModal(fragmentUrl)`
Loads a fragment and displays it in a modal dialog.

### `createModal(contentNodes)`
Creates a modal with custom DOM nodes. Returns `{ block, showModal }`.

## Structure

The modal uses the native `<dialog>` element:

```html
<div class="modal block">
  <dialog>
    <button class="close-button" aria-label="Close">
      <span class="icon icon-close"></span>
    </button>
    <div class="modal-content">
      <!-- Fragment or custom content -->
    </div>
  </dialog>
</div>
```

## Notes

- The close icon is rendered via CSS pseudo-elements (no SVG dependency required)
- Modals are appended to `<main>` and removed from the DOM on close
- The `modal-open` class is added to `<body>` when a modal is visible

## See Also

- [Fragment Block](../fragment/README.md) - Content fragments
- [Form Block](../form/README.md) - Forms in modals
