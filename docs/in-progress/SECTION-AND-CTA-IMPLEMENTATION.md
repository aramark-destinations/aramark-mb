# Section Background + CTA Block Implementation Plan

**Project:** Aramark Multi-Brand EDS
**Date:** 2026-03-15
**Status:** Pending implementation

---

## Overview

Two parallel workstreams that together replace all remaining promotional layout gaps identified in `CTA-ANALYSIS.md`.

**Workstream A — Section model expansion:** Makes the AEM section component fully configurable for background treatment (image, video, color, overlay) and content width/alignment. The section is the only AEM component that can contain nested blocks, so background concerns belong here — not in blocks.

**Workstream B — CTA block:** A new block for promotional content layouts (image beside text, icon beside text, centered text + buttons). Does not own backgrounds — relies on the section for that.

**Key architectural decision:** The `cta--bgimage` variant from the original CTA analysis is eliminated. It is replaced by a Section (with `backgroundImage` configured) containing a `CTA (buttons)` block. Same visual result, cleaner separation of concerns: backgrounds are always configurable independently of content layout.

---

## Separation of Concerns

| Concern | Owner |
|---|---|
| Background image | Section |
| Background video | Section |
| Background color | Section |
| Background overlay (dark/light scrim) | Section |
| Content width / containment | Section |
| Content alignment (left/center/right) | Section |
| Image beside text (media layout) | CTA block |
| Icon beside text | CTA block |
| Centered text + buttons | CTA block |

---

## Workstream A: Section Model Expansion

### A1. component-models.json

Replace the current `"id": "section"` entry with the following. All new fields are additive — existing `name` and `style` fields are preserved.

```json
{
  "id": "section",
  "fields": [
    {
      "component": "text",
      "name": "name",
      "label": "Section Name",
      "description": "The label shown for this section in the Content Tree"
    },
    {
      "component": "multiselect",
      "name": "style",
      "label": "Style",
      "options": [
        { "name": "Highlight", "value": "highlight" },
        { "name": "Dark", "value": "dark" },
        { "name": "Light", "value": "light" }
      ]
    },
    {
      "component": "reference",
      "name": "backgroundImage",
      "label": "Background Image",
      "multi": false
    },
    {
      "component": "text",
      "name": "backgroundImageAlt",
      "label": "Background Image Alt Text",
      "valueType": "string"
    },
    {
      "component": "aem-content",
      "name": "backgroundVideo",
      "label": "Background Video",
      "description": "MP4 or WebM. Plays muted and looping. Overrides Background Image when present."
    },
    {
      "component": "reference",
      "name": "backgroundVideoFallback",
      "label": "Background Video Fallback Image",
      "description": "Shown before the video loads and on devices that do not autoplay.",
      "multi": false
    },
    {
      "component": "select",
      "name": "backgroundOverlay",
      "label": "Background Overlay",
      "description": "Semi-transparent scrim placed over the background to ensure text contrast.",
      "options": [
        { "name": "None", "value": "none" },
        { "name": "Dark", "value": "dark" },
        { "name": "Light", "value": "light" }
      ]
    },
    {
      "component": "select",
      "name": "contentWidth",
      "label": "Content Width",
      "options": [
        { "name": "Default (content-limited)", "value": "default" },
        { "name": "Narrow", "value": "narrow" },
        { "name": "Wide", "value": "wide" },
        { "name": "Full (edge-to-edge)", "value": "full" }
      ]
    },
    {
      "component": "select",
      "name": "contentAlign",
      "label": "Content Alignment",
      "options": [
        { "name": "Left", "value": "left" },
        { "name": "Center", "value": "center" },
        { "name": "Right", "value": "right" }
      ]
    }
  ]
}
```

### A2. scripts/scripts.js

Add a new `decorateSectionBackgrounds()` function and call it from `decorateMain()` after `decorateSections(main)`.

**Import addition** — `createOptimizedPicture` is already available from `aem.js`. No new import needed.

```js
function decorateSectionBackgrounds(main) {
  main.querySelectorAll('.section').forEach((section) => {
    const {
      backgroundImage,
      backgroundImageAlt = '',
      backgroundVideo,
      backgroundVideoFallback,
      backgroundOverlay,
      contentWidth,
      contentAlign,
    } = section.dataset;

    if (backgroundVideo) {
      const video = document.createElement('video');
      video.src = backgroundVideo;
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', '');
      video.setAttribute('loop', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('aria-hidden', 'true');
      if (backgroundVideoFallback) video.poster = backgroundVideoFallback;
      video.className = 'section-bg section-bg-video';
      section.prepend(video);
    } else if (backgroundImage) {
      const opt = createOptimizedPicture(backgroundImage, backgroundImageAlt, false, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '750' },
      ]);
      opt.className = 'section-bg section-bg-image';
      section.prepend(opt);
    }

    if (backgroundOverlay && backgroundOverlay !== 'none') {
      section.classList.add(`section--overlay-${backgroundOverlay}`);
    }
    if (contentWidth && contentWidth !== 'default') {
      section.classList.add(`section--width-${contentWidth}`);
    }
    if (contentAlign) {
      section.classList.add(`section--align-${contentAlign}`);
    }
  });
}
```

**Call site** — inside `decorateMain()`, after `decorateSections(main)`:

```js
export function decorateMain(main) {
  decorateButtons(main);
  decorateIcons(main);
  decorateExternalLinks(main);
  decorateVideos(main);
  decorateMediaWithLinks(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionBackgrounds(main); // ← add here
  decorateBlocks(main);
  a11yLinks(main);
}
```

### A3. CSS

Add to `styles/styles.css` (or a new `styles/sections.css` imported from `styles.css`):

```css
/* Section background media */
.section:has(.section-bg) {
  position: relative;
}

.section-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.section-bg-image picture,
.section-bg-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.section-bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Overlay scrim */
.section--overlay-dark::before,
.section--overlay-light::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.section--overlay-dark::before {
  background: rgba(0 0 0 / 0.45);
}

.section--overlay-light::before {
  background: rgba(255 255 255 / 0.45);
}

/* Ensure section content sits above the overlay */
.section--overlay-dark > :not(.section-bg),
.section--overlay-light > :not(.section-bg) {
  position: relative;
  z-index: 1;
}

/* Content width variants */
.section--width-narrow .section-wrapper {
  max-width: var(--layout-max-width-narrow);
}

.section--width-wide .section-wrapper {
  max-width: var(--layout-max-width-wide);
}

.section--width-full {
  padding-inline: 0;
}

.section--width-full .section-wrapper {
  max-width: unset;
  padding-inline: 0;
}

/* Content alignment */
.section--align-center {
  text-align: center;
}

.section--align-right {
  text-align: right;
}
```

---

## Workstream B: CTA Block

### B1. Variants

| Variant class | Layout | Use case |
|---|---|---|
| `cta--medialeft` | Image ~50% left, text + buttons right | Editorial split section |
| `cta--mediaright` | Image ~50% right, text + buttons left | Same, mirrored |
| `cta--buttons` | Centered text block + button row, no image | Promotional text break; often inside a bg-image section |
| `cta--iconleft` | Fixed-width icon left, text right | Feature callout / benefit list item |

The `bgimage` variant from `CTA-ANALYSIS.md` is **not implemented** — covered by Section + `cta--buttons`.

### B2. Authoring row structure (Google Doc / UE richtext)

| Row | Content | Semantic class produced |
|---|---|---|
| Row 0 | Picture or video link | `.cta-media` |
| Row 1 | Heading + body text | `.cta-content` |
| Row 2 | Button links | `.cta-actions` |

For `buttons` and `iconleft`, Row 0 is the first text block (no media row).

### B3. blocks/cta/cta.js

```js
import { createOptimizedPicture, moveInstrumentation } from '../../scripts/aem.js';
import { readVariant } from '../../scripts/scripts.js';

export default function decorate(block, options = {}) {
  const ctx = { block, options };
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('cta:before', { detail: ctx }));

  readVariant(block);
  const variant = block.dataset.variant;
  if (variant) block.classList.add(`cta--${variant}`);

  const rows = [...block.children];
  const semanticClasses = ['cta-media', 'cta-content', 'cta-actions'];

  rows.forEach((row, i) => {
    const cls = semanticClasses[i] ?? 'cta-row';
    row.className = cls;

    if (cls === 'cta-media') {
      const pic = row.querySelector('picture');
      if (pic) {
        const img = pic.querySelector('img');
        const opt = createOptimizedPicture(
          img.src,
          img.alt,
          false,
          [{ media: '(min-width: 900px)', width: '1200' }, { width: '600' }],
        );
        moveInstrumentation(pic, opt);
        pic.replaceWith(opt);
      }
    }
  });

  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('cta:after', { detail: ctx }));
}
```

### B4. blocks/cta/cta.css

```css
/* Base */
.cta {
  container-type: inline-size;
}

.cta-media picture,
.cta-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* medialeft */
.cta--medialeft {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  gap: var(--spacing-024);
}

.cta--medialeft .cta-media {
  grid-column: 1;
  grid-row: 1 / -1;
}

.cta--medialeft .cta-content {
  grid-column: 2;
  grid-row: 1;
}

.cta--medialeft .cta-actions {
  grid-column: 2;
  grid-row: 2;
}

/* mediaright — same grid, columns reversed */
.cta--mediaright {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  gap: var(--spacing-024);
}

.cta--mediaright .cta-media {
  grid-column: 2;
  grid-row: 1 / -1;
}

.cta--mediaright .cta-content {
  grid-column: 1;
  grid-row: 1;
}

.cta--mediaright .cta-actions {
  grid-column: 1;
  grid-row: 2;
}

/* buttons — centered, width-constrained */
.cta--buttons {
  text-align: center;
  max-width: var(--layout-max-width-narrow);
  margin-inline: auto;
}

.cta--buttons .cta-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-008);
}

/* iconleft — fixed icon column */
.cta--iconleft {
  display: grid;
  grid-template-columns: var(--sizing-048) 1fr;
  gap: var(--spacing-016);
  align-items: start;
}

.cta--iconleft .cta-media {
  grid-column: 1;
}

.cta--iconleft .cta-content,
.cta--iconleft .cta-actions {
  grid-column: 2;
}

/* Responsive: single column below 600px */
@container (max-width: 599px) {
  .cta--medialeft,
  .cta--mediaright {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .cta--medialeft .cta-media,
  .cta--mediaright .cta-media,
  .cta--medialeft .cta-content,
  .cta--mediaright .cta-content,
  .cta--medialeft .cta-actions,
  .cta--mediaright .cta-actions {
    grid-column: 1;
    grid-row: auto;
  }
}
```

### B5. component-definition.json

Add to the `"Blocks"` group array:

```json
{
  "title": "CTA",
  "id": "cta",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "CTA",
          "model": "cta"
        }
      }
    }
  }
}
```

### B6. component-filters.json

Add `"cta"` to the `"id": "section"` components array:

```json
{
  "id": "section",
  "components": [
    "text",
    "image",
    "button",
    "title",
    "hero",
    "cards",
    "columns",
    "cta",
    "fragment"
  ]
}
```

### B7. component-models.json

Add a new model entry for the CTA block. The variant is set via the block name field in the UE block toolbar (e.g., "CTA (medialeft)") — no separate model field needed.

```json
{
  "id": "cta",
  "fields": [
    {
      "component": "reference",
      "valueType": "string",
      "name": "media_image",
      "label": "Image",
      "multi": false
    },
    {
      "component": "text",
      "valueType": "string",
      "name": "media_imageAlt",
      "value": "",
      "label": "Image Alt Text"
    },
    {
      "component": "richtext",
      "name": "content_text",
      "value": "",
      "label": "Content",
      "valueType": "string"
    }
  ]
}
```

---

## Authoring Composition: bgimage pattern

The original `cta--bgimage` variant is replaced by composing a Section and a CTA block:

| Step | Action |
|---|---|
| 1 | Add a Section |
| 2 | In the Section panel: set **Background Image**, **Background Overlay: Dark** (or Light), **Content Width: Full** |
| 3 | Inside the section: insert a **CTA (buttons)** block with the heading, body, and buttons |

This produces a full-bleed background image with centered text overlaid — identical to the old `bgimage` variant, but with the background configurable independently of the block content.

The same section configuration works with any block — a `carousel`, `cards`, or plain text content can all sit inside a bg-image section.

---

## File Checklist

| File | Change |
|---|---|
| `component-models.json` | Expand section model; add cta model |
| `component-definition.json` | Add CTA to Blocks group |
| `component-filters.json` | Add `cta` to section filter |
| `scripts/scripts.js` | Add `decorateSectionBackgrounds()`, call from `decorateMain()` |
| `styles/styles.css` | Add section background + width + overlay CSS |
| `blocks/cta/cta.js` | New file |
| `blocks/cta/cta.css` | New file |

---

## Dependencies

- `readVariant()` — already implemented in `scripts/scripts.js` ✅
- `createOptimizedPicture()` — imported from `aem.js` ✅
- `moveInstrumentation()` — imported from `scripts/scripts.js` ✅
- CSS custom properties (`--layout-max-width-narrow`, `--sizing-048`, `--spacing-*`) — must exist in the brand token files before the CTA CSS is authored

---

## Multi-Brand Notes

- All CTA and section CSS values reference CSS custom properties only. No hardcoded colors, spacing, or sizes.
- Brand overrides go in `brands/{brand}/blocks/cta/cta.css`.
- Section CSS overrides can go in `brands/{brand}/styles/sections.css` if needed.
- The `backgroundOverlay` opacity values (`0.45`) may need brand-specific tuning — expose as a CSS custom property `--section-overlay-opacity` if multiple brands diverge.
