# Aramark Button Block

# Note:

Name of block can be changed and basic styles for the button block can be handled by making changes in base styles.

A project-specific rich button block for AEM Universal Editor + Crosswalk (xwalk) authoring.
Provides author-controlled style, color, size, and shape variants beyond what the OOTB
`button` default content component supports.

---

## Why This Block Exists — Design Decision

### The OOTB `button` Component Cannot Be Extended via `/blocks/button`

In AEM Edge Delivery Services with Universal Editor + xwalk authoring, the built-in `Button`
component is registered as **default content** — not a block:

```json
// component-definition.json (OOTB pattern)
{
  "id": "button",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/button/v1/button"
      }
    }
  }
}
```

Because it uses `core/franklin/components/button/v1/button` (not `block/v1/block`), the EDS
runtime renders it as a plain `<a>` tag decorated by `decorateButtons()` — **it never generates
a `<div class="button block">` wrapper**, so `/blocks/button/button.js` and
`/blocks/button/button.css` are never loaded.

Even if we explicitly change the "resourceType": "core/franklin/components/button/v1/button" to blocck it messes with core model button and nor give desired results.

> **Engineering guidance (Adobe):** _"Simply extending `_button.json` in a project does not work
> as expected. The way you did this does not work. This is how buttons/links work in Edge Delivery
> Services. The default button model is built to accomplish this. If you want to go beyond you would
> need to work with section styles or a custom block."_

Creating `/blocks/button/button.js` does **not** override the OOTB Button in UE/xwalk. It creates
a parallel, un-wired block that can conflict with the default model's `id: "button"` and produce
inconsistent author experiences.

### The Correct Pattern: New Named Block

The Adobe-recommended approach for richer button behavior in UE/xwalk is to introduce a
**new custom block** with its own `id`, `resourceType: "core/franklin/components/block/v1/block"`,
model, definition, and filters. This is exactly what `aramark-button` implements:

| Concern                    | OOTB `button`                        | `aramark-button`                                  |
| -------------------------- | ------------------------------------ | ------------------------------------------------- |
| resourceType               | `button/v1/button` (default content) | `block/v1/block` (proper block)                   |
| Block JS/CSS loaded?       | ❌ Never                             | ✅ Always                                         |
| Author-selectable style    | ❌ Not supported                     | ✅ Filled / Outlined / Text-only                  |
| Author-selectable color    | ❌ Not supported                     | ✅ Primary / Secondary / Tertiary / Black / White |
| Author-selectable size     | ❌ Not supported                     | ✅ Large / Medium / Small                         |
| Author-selectable shape    | ❌ Not supported                     | ✅ Rectangular / Pill                             |
| Conflicts with OOTB Button | —                                    | ✅ None — separate `id`                           |

The OOTB `button` is preserved for simple inline CTAs. Authors get `aramark-button` when richer,
project-specific button behavior is needed.

---

## Block Row Structure

When authored in UE, the block fields are serialized as positional rows in the rendered HTML.
The `decorate()` function reads them by position after the link row:

```
| Aramark Button             |   ← block header (block name)
|----------------------------|
| https://example.com        |   Row 0 — Link (rendered as <a> by decorateButtons)
| filled                     |   Row 1 — Button Style  (filled | outlined | text-only)
| primary                    |   Row 2 — Button Color  (primary | secondary | tertiary | black | white)
| large                      |   Row 3 — Button Size   (large | medium | small)
| rectangular                |   Row 4 — Button Shape  (rectangular | pill)
```

**Defaults** (applied when a row is empty or absent):

| Field        | Default                                |
| ------------ | -------------------------------------- |
| Button Style | `filled`                               |
| Button Color | `primary`                              |
| Button Size  | `large`                                |
| Button Shape | `rectangular` (no shape class applied) |

After reading, the config rows are **removed from the DOM** — only the link row remains visible.

---

## CSS Classes Applied to `<a>`

The `decorate()` function adds CSS classes directly to the `<a>` element:

```
.filled | .outlined | .text-only         ← Button Style
.color-primary | .color-secondary | ...   ← Button Color
.size-large | .size-medium | .size-small  ← Button Size
.shape-pill                               ← Button Shape (pill only)
```

Example output for a Tertiary / Large / Pill / Outlined button:

```html
<div class="aramark-button-wrapper">
  <div class="aramark-button block">
    <div>
      <div>
        <a href="/path" class="button outlined color-tertiary size-large shape-pill">
          Button Text
        </a>
      </div>
    </div>
  </div>
</div>
```

---

## CSS Custom Properties

Override these in `brands/{brand}/tokens.css` or a global stylesheet — **not** in this file:

```css
/* Button color tokens (set per brand) */
--color-brand-primary: ...;
--color-brand-primary-dark: ...;
--color-brand-secondary: ...;
--color-brand-secondary-dark: ...;
--color-brand-tertiary: ...;
--color-brand-tertiary-dark: ...;

/* Button transition */
--button-transition: 200ms;

/* Spacing & radius tokens used by button */
--spacing-008: 8px;
--spacing-012: 12px;
--spacing-016: 16px;
--spacing-024: 24px;
--spacing-032: 32px;
--spacing-040: 40px;
--spacing-056: 56px;
--radius-s: 4px;
--radius-full: 9999px;
```

---

## UE Model: `_aramark-button.json`

The block's UE authoring model, definition, and filters are declared in `_aramark-button.json`
and aggregated into the root `component-models.json`, `component-definition.json`, and
`component-filters.json` at build time via the xwalk aggregation pattern.

Key fields exposed to authors:

| Field                     | Component     | Values                                     |
| ------------------------- | ------------- | ------------------------------------------ |
| Button Link               | `aem-content` | Page path, DAM asset, or fragment          |
| Button Text               | `text`        | Display label                              |
| Button Screen Reader Text | `text`        | Accessible `title` attribute               |
| Button Style              | `select`      | Filled, Outlined, Text-only                |
| Button Color              | `select`      | Primary, Secondary, Tertiary, Black, White |
| Button Size               | `select`      | Large, Medium, Small                       |
| Button Shape              | `select`      | Rectangular, Pill                          |

---

## Lifecycle Hooks

Hooks can be injected globally via `window.AramarkButton.hooks` or passed directly to `decorate()`:

```javascript
// Global hook injection (e.g. from a brand override or analytics script)
window.AramarkButton = {
  hooks: {
    onBefore: ({ block }) => {
      // Runs before any class decoration
      block.dataset.analyticsComponent = 'aramark-button';
    },
    onAfter: ({ block }) => {
      // Runs after class decoration and row cleanup
      console.log('aramark-button decorated');
    },
  },
};
```

### Custom Events

The block dispatches two DOM events that bubble up the tree:

- `aramark-button:before` — fired before decoration, `event.detail = { block, options }`
- `aramark-button:after` — fired after decoration, `event.detail = { block, options }`

```javascript
document.addEventListener('aramark-button:after', ({ detail }) => {
  const { block } = detail;
  // e.g. send analytics event
});
```

---

## Brand Override (via Extensibility Framework)

To override button JS behaviour for a specific brand without modifying this file:

1. Create `brands/{brand}/blocks/aramark-button/aramark-button.js`
2. Add `'aramark-button'` to `brands/{brand}/overrides.js`
3. Import and extend the base `decorate()`:

```javascript
// brands/lake-powell/blocks/aramark-button/aramark-button.js
import { decorate as baseDecorate } from '../../../../blocks/aramark-button/aramark-button.js';

export default (block) =>
  baseDecorate(block, {
    onBefore: ({ block: b }) => {
      b.dataset.brand = 'lake-powell';
    },
  });
```

To override CSS only, create `brands/{brand}/blocks/aramark-button/aramark-button.css`.
Brand CSS is loaded after shared CSS (via DOM order), so brand rules override without `!important`.

---

## What NOT to Do

| ❌ Don't                                                                  | ✅ Do instead                            |
| ------------------------------------------------------------------------- | ---------------------------------------- |
| Create `/blocks/button/button.js` to override the OOTB Button in UE/xwalk | Use `aramark-button` as a separate block |
| Reuse `id: "button"` in a custom `_button.json` block                     | Use a unique id (`aramark-button`)       |
| Modify the OOTB Button entries in `component-models.json`                 | Add new entries alongside them           |
| Add variant CSS to the OOTB `.button` selector globally                   | Scope overrides to `.aramark-button`     |
| Put brand color tokens in `aramark-button.css`                            | Put them in `brands/{brand}/tokens.css`  |

---

## Files

| File                     | Purpose                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `aramark-button.js`      | Block decorator — reads positional rows, applies CSS classes, fires lifecycle events |
| `aramark-button.css`     | Compiled CSS (generated from SCSS, do not edit directly)                             |
| `aramark-button.scss`    | SCSS source — edit this for style changes                                            |
| `_aramark-button.json`   | UE model, definition, and filter fragment — aggregated at build time                 |
| `aramark-button.test.js` | Jest unit tests                                                                      |

---

## Testing

```bash
pnpm jest blocks/aramark-button/aramark-button.test.js
```

All 11 tests cover: lifecycle events, default class values, positional row reading (style, color,
size, shape), and DOM cleanup of config rows.
