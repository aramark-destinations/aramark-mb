# Image Block

Standalone image block with responsive DM picture output and Universal Editor authoring support.

## Features

- **Responsive image** output via Dynamic Media with OpenAPI (`createDmPicture`) — generates WebP `<source>` elements at 375, 768, and 1200px widths with `preferwebp=true&quality=85`
- **DAM alt text auto-population** — when `imageAltFromDam` is checked (default), the block fetches `dc:description` from the DM Assets Metadata API and applies it as alt text after the picture renders (fire-and-update, non-blocking). Manual `imageAlt` remains as the initial value and fallback.
- **Alt text override** applied from the authored `imageAlt` field as the synchronous initial value
- **UE instrumentation preserved** via `moveInstrumentation` when the picture element is replaced during decoration
- **Lifecycle hooks** for site-level customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Variants

No predefined variants. `readVariant(block)` is called to expose any author-applied variant class via `block.dataset.variant` for use in `onBefore` / `onAfter` hooks or brand-level overrides.

## Universal Editor Fields

| Field | Schema name | Type | Description |
|---|---|---|---|
| Image | `image` | reference | DAM asset reference |
| Alt Text | `imageAlt` | text | Accessible description of the image |
| Get Alternative Text from DAM | `imageAltFromDam` | boolean | When checked, fetches `dc:description` from the DM Assets Metadata API after render and applies it as alt text. Manual `imageAlt` remains the initial value and fallback. Default: checked. |

> **Schema location:** `blocks/image/_image.json` (co-located with the block).

## Rendered Structure

All images are delivered via Dynamic Media with OpenAPI.

```html
<div class="image block">
  <div>
    <div>
      <picture>
        <source media="(min-width: 1200px)" type="image/webp" srcset="/adobe/dynamicmedia/deliver/dm-aid--{id}/image.jpg?width=1200&preferwebp=true&quality=85">
        <source media="(min-width: 768px)" type="image/webp" srcset="/adobe/dynamicmedia/deliver/dm-aid--{id}/image.jpg?width=768&preferwebp=true&quality=85">
        <source type="image/webp" srcset="/adobe/dynamicmedia/deliver/dm-aid--{id}/image.jpg?width=375&preferwebp=true&quality=85">
        <img loading="lazy" alt="Description" src="/adobe/dynamicmedia/deliver/dm-aid--{id}/image.jpg?width=375&quality=85">
      </picture>
    </div>
  </div>
</div>
```

## CSS Classes

| Class | Element | Description |
|---|---|---|
| `.image` | Block root | Applied by EDS to the block wrapper |

The block does not apply additional CSS classes to inner elements. The `<picture>` and `<img>` are targeted directly via descendant selectors in SCSS.

## Usage

### Brand Override

```javascript
// brands/{brand}/blocks/image/image.js
import { decorate as rootDecorate } from '../../../blocks/image/image.js';

export default (block) => rootDecorate(block, {
  onBefore: ({ block: b }) => {
    // Example: read a data attribute before optimization
  },
  onAfter: ({ block: b }) => {
    // Example: force eager loading for above-the-fold images
    b.querySelector('img')?.setAttribute('loading', 'eager');
  },
});
```

### Direct Usage

```javascript
import { decorate } from '../../blocks/image/image.js';

decorate(block);
```

## Lifecycle Hooks

### `onBefore`

Called before picture optimization. Context: `{ block, options }`.

The original `<picture>` and `<img>` are still in the DOM at this point. Use to:
- Read data attributes or logging diagnostics
- Override loading strategy
- Inject brand-specific wrapper elements before the `<picture>` is replaced

### `onAfter`

Called after the DM picture has replaced the original. Context: `{ block, options }`.

The new `<picture>` element is live in the DOM at this point. The `imageAltFromDam` fetch may still be pending. Use to:
- Force `loading="eager"` for above-the-fold images
- Attach lightbox, zoom, or interaction behaviors
- Add a caption element below the picture

## Events

| Event | When | Detail |
|---|---|---|
| `image:before` | Before picture optimization | `{ block, options }` |
| `image:after` | After optimized picture is in the DOM | `{ block, options }` |

## Analytics

No analytics events. The Image block dispatches no `pushAnalyticsEvent` calls.

## Customization

### Via Brand Override

Create `brands/{brand}/blocks/image/image.js` (see [Usage](#usage) above) to:
- Change responsive breakpoints passed to `createDmPicture`
- Add caption support
- Implement lightbox/modal behaviour
- Add zoom interactions
- Force eager loading for known hero-adjacent positions

## Accessibility

- Alt text applied from authored `imageAlt` field for screen readers
- Image renders as `display: block` to prevent inline spacing issues
- Responsive width (100%) ensures proper scaling across viewports

## DAM Alt Text

When `imageAltFromDam` is checked (the default), the block calls `fetchDmAltText(src)` after the picture is rendered. This fetches `dc:description` from the DM Assets Metadata API (`GET /adobe/assets/{assetId}/metadata`) and applies it as the `alt` attribute on the image.

Behavior:
- **Fire-and-update** — non-blocking; manual `imageAlt` is applied synchronously as the initial value and remains if the fetch fails or returns null
- **No-op when unchecked** — set `imageAltFromDam` to `false` in the UE dialog to use only the manual `imageAlt` field
- **Errors are silent** — network errors or missing `dc:description` leave the manual alt text in place
- **Cards/Search** — not yet wired; tracked in `docs/project/TODOS.md`

## DM with OpenAPI

All images are delivered via DM with OpenAPI (`/adobe/dynamicmedia/deliver/` paths). The block always uses `createDmPicture()` from `scripts/baici/utils/utils.js`, which generates DM-native query parameters (`preferwebp=true`, `quality=85`, `width`). `isDmUrl()` and `createDmPicture()` remain shared utilities also used by `blocks/cards/cards.js` and `blocks/search/search.js`.

## Token Dependencies

| Token | Used in | Default |
|---|---|---|
| `--image-border-radius` | `image.scss` — `img` border-radius | `0px` (defined in `styles/root-tokens.scss`) |

## See Also

- [Hero Block](../hero/README.md) — Full-width image with text overlay
- [Cards Block](../cards/README.md) — Image within a card layout
- [Authoring Guide](../../docs/authoring/image.md) — Author-facing documentation for Universal Editor
- [Block Extensibility Guide](../../docs/BLOCK-EXTENSIBILITY-GUIDE.md)
