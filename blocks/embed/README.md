# Embed Block (Base)

Embeds videos and social media posts directly on your page with support for lazy loading and placeholder images.

## Supported Platforms

- **YouTube** (youtube.com, youtu.be)
- **Vimeo** (vimeo.com) 
- **Twitter/X** (twitter.com, x.com)
- **Generic iframes** (any URL not matching above)

## Features

- ✅ Lazy loading with IntersectionObserver
- ✅ Placeholder image with click-to-play
- ✅ Autoplay on user interaction
- ✅ Lifecycle hooks (onBefore/onAfter)
- ✅ Custom events (embed:before, embed:after)
- ✅ Configurable embed providers

## Basic Usage

```javascript
import { decorate } from './embed.js';

export default (block) => decorate(block);
```

## With Hooks

```javascript
import { decorate as baseDecorate } from '../../blocks/embed/embed.js';

const hooks = {
  onBefore: ({ block }) => {
    // Add analytics tracking
    block.dataset.tracked = 'embed';
  },
  onAfter: ({ block }) => {
    // Custom post-processing
    console.log('Embed loaded');
  }
};

export default (block) => baseDecorate(block, hooks);
```

## Custom Embed Providers

Add custom embed configurations:

```javascript
const customConfig = [
  {
    match: ['dailymotion'],
    embed: (url, autoplay) => {
      const videoId = url.pathname.split('/')[2];
      return `<iframe src="https://www.dailymotion.com/embed/video/${videoId}" 
        frameborder="0" allowfullscreen></iframe>`;
    }
  }
];

export default (block) => baseDecorate(block, { embedsConfig: customConfig });
```

## Authoring

### With Placeholder Image

```
|                           Embed                           |
|------------------------------------------------------------|
| ![Preview](https://example.com/preview.jpg)                |
| https://www.youtube.com/watch?v=VIDEO_ID                   |
```

### Without Placeholder (Auto-play on scroll)

```
|                           Embed                           |
|------------------------------------------------------------|
| https://www.youtube.com/watch?v=VIDEO_ID                   |
```

## Extension Points

### Hooks

- `onBefore({ block, options })` - Before embed setup
- `onAfter({ block, options })` - After embed setup

### Events

- `embed:before` - Fired before decoration
- `embed:after` - Fired after decoration

### Options

- `embedsConfig` - Array of embed provider configurations
  ```javascript
  {
    match: ['platform'],     // URL matchers
    embed: (url, autoplay)   // Embed function returning HTML
  }
  ```

## CSS Custom Properties

Override these in your extension:

```css
.embed {
  --embed-max-width: 800px;
  --embed-margin: 32px auto;
  --embed-aspect-ratio: 16 / 9;
}
```

## Accessibility

- Play button includes `title` attribute
- Iframes include descriptive `title` attributes
- Keyboard navigation supported

## Performance

- Lazy loading via IntersectionObserver
- Scripts loaded on-demand (Twitter)
- Placeholder images prevent layout shift

## Browser Support

- Modern browsers (ES6+)
- IntersectionObserver required (widely supported)
- Fallback to immediate load if observer unavailable
