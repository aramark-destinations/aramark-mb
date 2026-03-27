# Image Block

Standalone image block with responsive picture output and Universal Editor authoring support.

## Features

- **Responsive image** output via `createOptimizedPicture` — generates `<source>` elements at 375, 768, and 1200px widths with WebP and fallback formats
- **Alt text** applied from the authored `imageAlt` field; `imageAltFromDam` field is present in the model for future auto-population from DAM asset metadata (see [DAM Alt Text](#dam-alt-text) below)
- **UE instrumentation preserved** via `moveInstrumentation` when the picture element is replaced during decoration
- **Lifecycle hooks** for site-level customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Authoring Fields

| Field | Type | Description |
|---|---|---|
| Image | reference | DAM asset reference |
| Alt Text | text | Accessible description of the image |
| Get Alternative Text from DAM | boolean | Intended to auto-populate Alt Text from the DAM asset's metadata description and disable manual editing. **Pending:** behavior depends on xwalk plugin support; not yet active. Default: checked. |

## Rendered Structure

```html
<div class="image block">
  <div>
    <div>
      <picture>
        <source type="image/webp" srcset="image.jpg?width=375&format=webply&optimize=medium">
        <source type="image/webp" srcset="image.jpg?width=768&format=webply&optimize=medium">
        <source type="image/webp" srcset="image.jpg?width=1200&format=webply&optimize=medium">
        <source srcset="image.jpg?width=375&format=jpg&optimize=medium">
        <source srcset="image.jpg?width=768&format=jpg&optimize=medium">
        <img loading="lazy" alt="Description" src="image.jpg?width=1200&format=jpg&optimize=medium">
      </picture>
    </div>
  </div>
</div>
```

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/image/image.js';

export default function decorateImage(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/image/image.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Example: inspect the original <img> before optimization
      // e.g., read data attributes or log diagnostics
    },
    onAfter: (ctx) => {
      // Example: force eager loading for above-the-fold images
      ctx.block.querySelector('img')?.setAttribute('loading', 'eager');
    },
  });
}
```

## Customization

### Via Hooks

- **onBefore**: Runs before picture optimization. Use to override loading strategy or inspect the original `<img>`.
- **onAfter**: Runs after the optimized picture has replaced the original. Use to attach interactions (lightbox, zoom, etc.).

### Via Events

- **image:before**: Fired before image setup
- **image:after**: Fired after the optimized picture is in the DOM

### Via Property Overrides

Create `/brands/{property}/blocks/image/image.js` to:
- Change responsive breakpoints
- Add caption support
- Implement lightbox/modal behaviour
- Add zoom interactions

## Accessibility

- Alt text applied from authored `imageAlt` field for screen readers
- Image renders as `display: block` to prevent inline spacing issues
- Responsive width (100%) ensures proper scaling across viewports

## DAM Alt Text

### Current State

The `imageAltFromDam` boolean field exists in the UE schema (`models/_image.json`) and appears in the Author dialog. However, it is **not yet active in JavaScript rendering** — the block currently reads alt text from `block.dataset.imagealt` (set by UE from the `imageAlt` field) with a fallback to the existing `img.alt` attribute.

### Why It's Deferred

AEM's xwalk plugin does not currently support conditional field behavior (disabling the `imageAlt` text field and populating it from DAM asset metadata based on a sibling boolean field's state). Until that capability is available, the checkbox has no runtime effect.

### Future Implementation Options

#### Option A — xwalk/UE Plugin Enhancement (Recommended)

When the xwalk plugin adds support for computed/conditional field states in the UE dialog, this can be implemented natively without any JavaScript changes to the block. The dialog would:
1. Fetch the DAM asset metadata description when `imageAltFromDam` is checked
2. Populate and disable the `imageAlt` text field
3. The authored value would flow through to `block.dataset.imagealt` as usual

This is the preferred path — zero runtime overhead and fully author-controlled.

#### Option B — AEM Dynamic Media

When the project migrates to AEM Dynamic Media, asset metadata (including `alt` text) can be accessed via the Assets HTTP API at content-publish time or embedded in delivery URLs. This would allow the xwalk integration or a content transformation step to inject the correct alt text before the page is served, with no client-side fetch required.

#### Option C — Runtime Fetch (Not Recommended)

At decoration time, the block JS could fetch the asset metadata from the AEM Assets HTTP API using the image `src` path, then apply the returned `dc:description` or similar field as the alt text. Drawbacks:
- Adds an async network request per image on every page load
- Requires authentication configuration for the Assets API in the delivery environment
- Introduces timing complexity (alt text applied after initial render)

### When Implementing

Once Option A or B is viable, update `image.js` to read `block.dataset.imagealtfromdam` to gate the behavior, and update this section accordingly.

## Token Dependencies

No custom tokens currently used. Base styles use standard CSS properties.

## See Also

- [Hero Block](../hero/README.md) — Full-width image with text overlay
- [Cards Block](../cards/README.md) — Image within a card layout
