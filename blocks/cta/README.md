# Button Block

> **Note:** This block was renamed from `button` to `cta` in the codebase to avoid conflicting with the OOTB AEM `button` component. All codebase references use `cta`. The OOTB `button` component remains unchanged. Figma design files and designer-facing documentation continue to use the name "Button" — that is intentional and correct.

A project-specific rich button block for AEM Universal Editor + xwalk authoring.
Provides author-controlled style, color, size, and shape variants via `block/v1/block` —
replacing the OOTB `button/v1/button` default content component which cannot be customized.

---

## Why `block/v1/block` Instead of the OOTB Button

The OOTB `button/v1/button` resource type renders buttons as default content — plain `<a>` tags
styled by `styles/styles.css`. Because it never generates a `<div class="button block">` wrapper,
`blocks/button/button.js` and `blocks/button/button.css` are never loaded by the EDS runtime.

By switching to `core/franklin/components/block/v1/block` with `"name": "CTA"` in the template,
EDS generates a proper block table in the document and loads `blocks/cta/cta.js` and
`blocks/cta/cta.css` — giving full decoration and styling control.

The OOTB inline button behavior (links styled as buttons in default content) is handled by
`styles/styles.css` and is unaffected by this block.

---

## Block Row Structure

When authored in UE, the block fields are serialized as positional rows in the rendered HTML.
The `decorate()` function reads them by position after the link row:

```
| Button                     |   ← block header
|----------------------------|
| https://example.com        |   Row 0 — Link (rendered as <a> by field collapse)
| filled                     |   Row 1 — Button Style  (filled | outlined | text-only)
| primary                    |   Row 2 — Button Color  (primary | secondary | tertiary | black | white)
| large                      |   Row 3 — Button Size   (large | medium | small)
| rectangular                |   Row 4 — Button Shape  (rectangular | pill)
```

**Defaults** (applied when a row is empty or absent):

| Field        | Default         |
|-------------|-----------------|
| Button Style | `filled`        |
| Button Color | `primary`       |
| Button Size  | `large`         |
| Button Shape | `rectangular`   |

After reading, the config rows are **removed from the DOM** — only the link row remains visible.

---

## CSS Classes Applied to `<a>`

```
.filled | .outlined | .text-only          ← Button Style
.color-primary | .color-secondary | ...    ← Button Color
.size-large | .size-medium | .size-small   ← Button Size
.shape-pill                                ← Button Shape (pill only)
```

Example output for a Tertiary / Large / Pill / Outlined button:

```html
<div class="button-wrapper">
  <div class="button block">
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

## UE Model

Fields exposed to authors are defined in `blocks/cta/_cta.json` and aggregated into the root
`component-models.json` at build time via `pnpm build:json`.

| Field                     | Component     | Values                                     |
|--------------------------|---------------|--------------------------------------------|
| Button Link               | `aem-content` | Page path, DAM asset, or fragment          |
| Button Text               | `text`        | Display label                              |
| Button Screen Reader Text | `text`        | Accessible `title` attribute               |
| Button Style              | `select`      | Filled, Outlined, Text-only                |
| Button Color              | `select`      | Primary, Secondary, Tertiary, Black, White |
| Button Size               | `select`      | Large, Medium, Small                       |
| Button Shape              | `select`      | Rectangular, Pill                          |

---

## Lifecycle Hooks

```javascript
// Global hook injection (e.g. from a brand override or analytics script)
window.Cta = {
  hooks: {
    onBefore: ({ block }) => {
      block.dataset.analyticsComponent = 'cta';
    },
    onAfter: ({ block }) => {
      // post-decoration logic
    },
  },
};
```

### Custom Events

| Event       | When fired                             |
|------------|----------------------------------------|
| `cta:before` | Before class decoration              |
| `cta:after`  | After class decoration and row cleanup |

---

## CSS Custom Properties

Override in `brands/{brand}/tokens.css` — not in this file:

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
