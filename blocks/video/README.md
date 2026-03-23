# Video Base Block

Base implementation of the video block with extensibility support. Handles YouTube, Vimeo, and direct MP4/DAM-hosted videos with placeholder images, lazy loading, and comprehensive analytics tracking.

## Features

- **YouTube embed** with privacy-enhanced parameters and IFrame Player API analytics
- **Vimeo embed** with Player SDK analytics
- **MP4/direct video** with native HTML5 player and optional captions
- **Placeholder image** with accessible play button overlay
- **Lazy loading** via IntersectionObserver when no placeholder is present
- **Full-width mode** for hero/background video use cases
- **Analytics tracking** — play, pause, complete, progress milestones (25/50/75%), fullscreen events via Adobe Data Layer
- **Instrumentation preserved** via `moveInstrumentation`
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Authoring Fields

| Field | Type | Description |
|-------|------|-------------|
| Video Source | aem-content | DAM path for MP4 or full YouTube/Vimeo URL |
| Options | multiselect | AutoPlay variant |
| Placeholder Image | reference | Optional poster/thumbnail image from DAM |
| Placeholder Image Alt Text | text | Alt text for the placeholder image |

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/video/video.js';

export default function decorateVideo(block) {
  decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase } from '../../blocks/video/video.js';

export default function decorate(block) {
  decorateBase(block, {
    onBefore: (ctx) => {
      // Force full-width for hero context
      ctx.block.classList.add('full-width');
    },
    onAfter: (ctx) => {
      // Add custom analytics or overlay
    }
  });
}
```

## Structure

The block auto-detects video type from the source URL:

```html
<div class="video">
  <div>
    <div><a href="https://youtube.com/watch?v=...">Video Title</a></div>
    <div><picture><!-- placeholder image --></picture></div>
  </div>
</div>
```

With placeholder, becomes:

```html
<div class="video placeholder">
  <div class="video-placeholder">
    <picture><img src="..." alt="..."></picture>
    <div class="video-placeholder-play">
      <button type="button" title="Play"></button>
    </div>
  </div>
</div>
```

After clicking play (YouTube example):

```html
<div class="video">
  <div style="padding-bottom: 56.25%; ...">
    <iframe src="https://www.youtube.com/embed/..." ...></iframe>
  </div>
</div>
```

## Variants

- **full-width** — Expands video to full container width (used for background video in Hero)

## Customization Points

### Via Hooks

- **onBefore**: Modify block attributes, force full-width, add custom classes
- **onAfter**: Attach custom analytics, add overlay elements, modify player configuration

### Via Events

- **video:before**: Fired before video setup
- **video:after**: Fired after video ready

### Via Property Overrides

Create `/brands/{property}/blocks/video/video.js` to:
- Customize player parameters (e.g. enable autoplay for a property)
- Add property-specific analytics events
- Implement custom placeholder designs
- Add video gallery or playlist behavior

## Accessibility

- Play button meets WCAG 2.5.5 minimum touch target size (48px mobile, scaling up)
- Focus indicator meets WCAG 2.4.7 (3px solid outline with offset)
- MP4 videos support WebVTT captions track
- Videos include `aria-label` from title text when available
- Autoplay is disabled by default

## Token Dependencies

| Token | Purpose |
|-------|---------|
| `--layout-max-width-narrow` | Default max width constraint |
| `--aspect-ratio-video` | 16:9 aspect ratio for placeholder/loading |
| `--spacing-024` | Default vertical margin (mobile) |
| `--spacing-032` | Vertical margin (tablet) |
| `--spacing-048` | Vertical margin / play button size (desktop) |
| `--spacing-064` | Play button size (tablet) |
| `--spacing-080` | Play button size (desktop) |
| `--radius-s` | Error message border radius |
| `--focus-ring-color` | Play button focus ring color |
| `--video-play-bg` | Play button background |
| `--video-play-bg-hover` | Play button hover background |
| `--video-play-icon-color` | Play button triangle color |

## See Also

- [Hero Block](../hero/README.md) — Full-width section that may contain video
- [Columns Block](../columns/README.md) — Video within a column layout
