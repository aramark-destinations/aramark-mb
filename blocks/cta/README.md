# Button Block

> **Note:** This block was renamed from `button` to `cta` in the codebase to avoid conflicting with the OOTB AEM `button` component. All codebase references use `cta`. The OOTB `button` component remains unchanged. Figma design files and designer-facing documentation continue to use the name "Button" — that is intentional and correct.

A project-specific styled CTA block for AEM Universal Editor. Renders one or more linked buttons with author-controlled style, color, size, and shape via UE `classes_*` fields.

## Features

- **3 style variants** — Filled, Outlined, Text-only
- **5 color variants** — Primary, Secondary, Tertiary, Black, White
- **3 size variants** — Large, Medium, Small
- **2 shape variants** — Rectangular, Pill
- **Accessible** — mirrors `title` attribute to `aria-label` on the link
- **Lifecycle hooks** — `onBefore` / `onAfter` for brand customization
- **Events** — `cta:before` / `cta:after` dispatched on the block element

## Why `block/v1/block` Instead of the OOTB Button

The OOTB `button/v1/button` resource type renders buttons as default content — plain `<a>` tags styled by `styles/styles.css`. Because it never generates a `<div class="cta block">` wrapper, `blocks/cta/cta.js` and `blocks/cta/cta.css` are never loaded by the EDS runtime.

By switching to `core/franklin/components/block/v1/block` with `"name": "CTA"` in the template, EDS generates a proper block wrapper and loads the block JS and CSS — giving full decoration and styling control.

The OOTB inline button behavior (links styled as buttons in default content) is handled by `styles/styles.css` and is unaffected by this block.

## Usage

### Brand Override

```javascript
// brands/{brand}/blocks/cta/cta.js
import { decorate as rootDecorate } from '../../../blocks/cta/cta.js';

export default (block) => rootDecorate(block, {
  onBefore: ({ block: b }) => {
    // Brand-specific setup before decoration
  },
  onAfter: ({ block: b }) => {
    // Brand-specific enhancements after decoration
  },
});
```

### Global Hook (inline script or delayed.js)

```javascript
window.Cta = {
  hooks: {
    onBefore: ({ block }) => {
      block.dataset.analyticsComponent = 'cta';
    },
    onAfter: ({ block }) => { /* post-decoration logic */ },
  },
};
```

## Variants

Variant classes are authored via UE `classes_*` fields and rendered as CSS classes on the block wrapper by AEM delivery. JS applies defaults if no authored class is present.

### Style (`classes_type`)

| Class | Behavior | Default |
|-------|----------|---------|
| `filled` | Solid background fill | ✓ |
| `outlined` | Transparent background, colored border and text | |
| `text-only` | No background or border, link-style text | |

### Color (`classes_color`)

| Class | Tokens used |
|-------|------------|
| `color-primary` *(default)* | `--color-brand-primary` |
| `color-secondary` | `--color-brand-secondary` |
| `color-tertiary` | `--color-brand-tertiary` |
| `color-black` | `--color-neutral-900` |
| `color-white` | `--color-base-white` |

### Size (`classes_size`)

| Class | Min-height | Font size |
|-------|-----------|-----------|
| `size-large` *(default)* | `--spacing-056` (56px) | 16px |
| `size-medium` | `--spacing-040` (40px) | 14px |
| `size-small` | `--spacing-032` (32px) | 12px |

### Shape (`classes_shape`)

| Class | Effect |
|-------|--------|
| *(none — rectangular default)* | `border-radius: var(--radius-s)` |
| `shape-pill` | `border-radius: var(--radius-full)`, increased horizontal padding |

## Universal Editor Fields

Defined in `blocks/cta/_cta.json`, aggregated into `component-models.json` via `pnpm build:json`.

| Field | UE Label | Type | Notes |
|-------|----------|------|-------|
| `link` | Button Link | `aem-content` | Page path, DAM asset, or fragment ref |
| `linkText` | Button Text | `text` | Display label for the `<a>` |
| `linkTitle` | Button Screen Reader Text | `text` | Rendered as `title` attr → `aria-label` |
| `classes_type` | Button Style | `select` | `filled` \| `outlined` \| `text-only` |
| `classes_color` | Button Color | `select` | `color-primary` … `color-white` |
| `classes_size` | Button Size | `select` | `size-large` \| `size-medium` \| `size-small` |
| `classes_shape` | Button Shape | `select` | `""` (rectangular) \| `shape-pill` |

`classes_*` fields are rendered by AEM as CSS classes on the block wrapper element — they do not appear as content rows in the DOM.

## DOM Structure

AEM delivers the block with variant classes already on the wrapper. After `decorate()`:

```html
<div class="cta block filled color-primary size-large">
  <div>
    <div>
      <a href="/path">Button Text</a>
    </div>
  </div>
</div>
```

With `linkTitle` set and `shape-pill` authored:

```html
<div class="cta block filled color-primary size-large shape-pill">
  <div>
    <div>
      <a href="/path" title="Book now" aria-label="Book now">Button Text</a>
    </div>
  </div>
</div>
```

Any rows without an `<a>` element are removed by `decorate()` as a defense for stale authored content.

## CSS Classes

| Class | Applied by | Description |
|-------|-----------|-------------|
| `.cta` | AEM | Block root — flex container, wraps buttons |
| `.filled` | AEM / JS default | Solid background fill style |
| `.outlined` | AEM | Transparent bg, bordered style |
| `.text-only` | AEM | Link-style, no bg or border |
| `.color-primary` | AEM / JS default | Brand primary color tokens |
| `.color-secondary` | AEM | Brand secondary color tokens |
| `.color-tertiary` | AEM | Brand tertiary color tokens |
| `.color-black` | AEM | Neutral-900 tokens |
| `.color-white` | AEM | White tokens |
| `.size-large` | AEM / JS default | 56px min-height, 16px font |
| `.size-medium` | AEM | 40px min-height, 14px font |
| `.size-small` | AEM | 32px min-height, 12px font |
| `.shape-pill` | AEM | Full border-radius, wider padding |

## Lifecycle Hooks

### `onBefore`
Called before default application. Block's authored classes are already present on `block.classList`. Use for: injecting additional classes, modifying DOM before decoration, analytics instrumentation.

### `onAfter`
Called after all decoration is complete: defaults applied, stale rows removed, `aria-label` set. Use for: analytics tracking, adding brand-specific elements, post-render interactions.

## Events

| Event | When | Bubbles |
|-------|------|---------|
| `cta:before` | Before decoration | Yes |
| `cta:after` | After decoration | Yes |

Both events carry `detail: { block, options }`.

## Analytics

No analytics events are fired by this block. Instrument via `onBefore`/`onAfter` hooks or by listening to `cta:after` on a parent element.

## CSS Custom Properties

Override in `brands/{brand}/tokens.css`:

```css
--color-brand-primary: ...;
--color-brand-primary-dark: ...;
--color-brand-secondary: ...;
--color-brand-secondary-dark: ...;
--color-brand-tertiary: ...;
--color-brand-tertiary-dark: ...;
--button-transition: 200ms;
```

## See Also

- [Hero Block](../hero/README.md) — Hero with inline CTA buttons
- [Section Block](../section/README.md) — Section context that affects button color inheritance
- [Extensibility Guide](../../docs/BLOCK-EXTENSIBILITY-GUIDE.md)
