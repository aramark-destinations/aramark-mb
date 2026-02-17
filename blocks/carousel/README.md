# Carousel Base Block

Base implementation of the carousel/slideshow block with extensibility support.

## Features

- **Responsive carousel** - Touch/swipe support on mobile
- **Navigation controls** - Previous/next buttons
- **Slide indicators** - Clickable dots for direct navigation
- **Keyboard accessible** - Full keyboard navigation support
- **Intersection Observer** - Automatic active slide detection
- **ARIA attributes** - Screen reader friendly
- **Lifecycle hooks** for customization (onBefore/onAfter)
- **Events** dispatched before and after decoration

## Usage

### Basic Usage

```javascript
import decorate from '../../blocks/carousel/carousel.js';

export default async function decorateCarousel(block) {
  await decorate(block);
}
```

### With Lifecycle Hooks

```javascript
import { decorate as decorateBase, showSlide } from '../../blocks/carousel/carousel.js';

export default async function decorate(block) {
  await decorateBase(block, {
    onBefore: (ctx) => {
      // Add custom classes
      ctx.block.classList.add('custom-carousel');
    },
    onAfter: (ctx) => {
      // Add auto-play
      let currentSlide = 0;
      setInterval(() => {
        currentSlide = (currentSlide + 1) % ctx.block.querySelectorAll('.carousel-slide').length;
        showSlide(ctx.block, currentSlide);
      }, 5000);
    }
  });
}
```

### Programmatic Control

```javascript
import { showSlide } from '../../blocks/carousel/carousel.js';

// Show specific slide
const carousel = document.querySelector('.carousel');
showSlide(carousel, 2); // Show third slide

// With custom animation
showSlide(carousel, 0, 'auto'); // Instant
showSlide(carousel, 1, 'smooth'); // Smooth scroll
```

## Structure

Each row becomes a slide:

```html
<div class="carousel">
  <div>
    <div><img src="slide1.jpg"></div>
    <div><h2>Slide 1 Title</h2><p>Content</p></div>
  </div>
  <div>
    <div><img src="slide2.jpg"></div>
    <div><h2>Slide 2 Title</h2><p>Content</p></div>
  </div>
</div>
```

## Features

### Navigation
- Previous/Next buttons
- Slide indicator dots
- Keyboard navigation
- Touch/swipe gestures

### Accessibility
- ARIA roles and labels
- Keyboard focus management
- Screen reader announcements
- Proper tabindex handling

### Responsive
- Works on all screen sizes
- Touch-optimized for mobile
- Smooth scrolling

## Customization Points

### Via Hooks

- **onBefore**: Modify structure, add loading states
- **onAfter**: Add auto-play, custom navigation, tracking

### Via Events

- **carousel:before**: Fired before carousel setup
- **carousel:after**: Fired after carousel ready

### Via Property Overrides

Create `/brands/{property}/blocks/carousel/carousel.js` to:
- Implement auto-play with custom timing
- Add fade transitions
- Customize navigation button styles
- Add thumbnail navigation
- Implement lazy loading for slides

## Common Enhancements

### Auto-Play

```javascript
onAfter: (ctx) => {
  let currentSlide = 0;
  const slides = ctx.block.querySelectorAll('.carousel-slide');
  
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(ctx.block, currentSlide);
  }, 5000);
  
  // Pause on hover
  ctx.block.addEventListener('mouseenter', () => clearInterval(interval));
}
```

### Lazy Load Slides

```javascript
onAfter: (ctx) => {
  const slides = ctx.block.querySelectorAll('.carousel-slide');
  slides.forEach((slide, idx) => {
    if (idx > 0) { // Skip first slide
      const imgs = slide.querySelectorAll('img');
      imgs.forEach(img => {
        img.loading = 'lazy';
      });
    }
  });
}
```

### Slide Change Tracking

```javascript
onAfter: (ctx) => {
  ctx.block.addEventListener('carousel:slidechange', (e) => {
    console.log('Slide changed to:', e.detail.slideIndex);
    // Send analytics event
  });
}
```

## Placeholder Keys

Customize text via placeholders:
- `carousel` - Carousel ARIA label
- `carouselSlideControls` - Navigation ARIA label
- `previousSlide` - Previous button label
- `nextSlide` - Next button label
- `showSlide` - Indicator button label prefix
- `of` - "of" text in labels

## See Also

- [Hero Block](../hero/README.md) - Single-slide hero images
- [Cards Block](../cards/README.md) - Card layouts
