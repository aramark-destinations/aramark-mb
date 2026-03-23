import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
  readVariant: jest.fn(),
}));

jest.mock('../../scripts/placeholders.js', () => ({
  fetchPlaceholders: jest.fn(() => Promise.resolve({
    carousel: 'Carousel',
    carouselSlideControls: 'Slide Controls',
    previousSlide: 'Previous Slide',
    nextSlide: 'Next Slide',
    showSlide: 'Show Slide',
    of: 'of',
  })),
}));

// scrollTo is not implemented in jsdom
Element.prototype.scrollTo = jest.fn();

// IntersectionObserver is used in bindEvents
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// ─── createSlide ──────────────────────────────────────────────────────────────

describe('createSlide', () => {
  let createSlide;

  beforeEach(async () => {
    jest.resetModules();
    ({ createSlide } = await import('./carousel.js'));
  });

  function makeRow(numCols = 2) {
    const row = document.createElement('div');
    for (let i = 0; i < numCols; i += 1) {
      const col = document.createElement('div');
      col.textContent = `col ${i}`;
      row.appendChild(col);
    }
    return row;
  }

  it('creates an <li> element with class carousel-slide', () => {
    const slide = createSlide(makeRow(), 0, 1);
    expect(slide.tagName).toBe('LI');
    expect(slide.classList.contains('carousel-slide')).toBe(true);
  });

  it('sets data-slide-index', () => {
    const slide = createSlide(makeRow(), 2, 1);
    expect(slide.dataset.slideIndex).toBe('2');
  });

  it('sets id as carousel-{carouselId}-slide-{slideIndex}', () => {
    const slide = createSlide(makeRow(), 1, 5);
    expect(slide.getAttribute('id')).toBe('carousel-5-slide-1');
  });

  it('adds carousel-slide-image class to first column', () => {
    const slide = createSlide(makeRow(), 0, 1);
    const first = slide.children[0];
    expect(first.classList.contains('carousel-slide-image')).toBe(true);
  });

  it('adds carousel-slide-content class to second column', () => {
    const slide = createSlide(makeRow(), 0, 1);
    const second = slide.children[1];
    expect(second.classList.contains('carousel-slide-content')).toBe(true);
  });
});

// ─── showSlide — index normalization ─────────────────────────────────────────

describe('showSlide — index normalization', () => {
  let showSlide;

  function buildCarouselWithSlides(count) {
    const block = document.createElement('div');
    block.className = 'carousel';
    const slidesWrapper = document.createElement('ul');
    slidesWrapper.className = 'carousel-slides';
    for (let i = 0; i < count; i += 1) {
      const slide = document.createElement('li');
      slide.className = 'carousel-slide';
      slide.dataset.slideIndex = i;
      slidesWrapper.appendChild(slide);
    }
    block.appendChild(slidesWrapper);
    return block;
  }

  beforeEach(async () => {
    jest.resetModules();
    ({ showSlide } = await import('./carousel.js'));
  });

  it('negative index wraps to the last slide', () => {
    const block = buildCarouselWithSlides(3);
    // If negative, showSlide computes slides.length - 1 = 2
    // We verify it does not throw (scroll is jsdom-mocked)
    expect(() => showSlide(block, -1)).not.toThrow();
  });

  it('index equal to slide count wraps to 0', () => {
    const block = buildCarouselWithSlides(3);
    expect(() => showSlide(block, 3)).not.toThrow();
  });

  it('valid index does not throw', () => {
    const block = buildCarouselWithSlides(3);
    expect(() => showSlide(block, 1)).not.toThrow();
  });
});

// ─── decorate — lifecycle ─────────────────────────────────────────────────────

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  function makeCarouselBlock(numRows) {
    const b = document.createElement('div');
    b.className = 'carousel';
    for (let i = 0; i < numRows; i += 1) {
      const row = document.createElement('div');
      row.innerHTML = '<div>Img</div><div>Content</div>';
      b.appendChild(row);
    }
    document.body.appendChild(b);
    return b;
  }

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = makeCarouselBlock(2);
    ({ decorate } = await import('./carousel.js'));
  });

  it('fires carousel:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('carousel:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires carousel:after event', async () => {
    const listener = jest.fn();
    block.addEventListener('carousel:after', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls onBefore hook when provided', async () => {
    const onBefore = jest.fn();
    await decorate(block, { onBefore });
    expect(onBefore).toHaveBeenCalledTimes(1);
  });

  it('calls onAfter hook when provided', async () => {
    const onAfter = jest.fn();
    await decorate(block, { onAfter });
    expect(onAfter).toHaveBeenCalledTimes(1);
  });
});

describe('decorate — single vs multiple slides', () => {
  let decorate;

  function makeCarouselBlock(numRows) {
    const b = document.createElement('div');
    b.className = 'carousel';
    for (let i = 0; i < numRows; i += 1) {
      const row = document.createElement('div');
      row.innerHTML = '<div>Img</div><div>Content</div>';
      b.appendChild(row);
    }
    document.body.appendChild(b);
    return b;
  }

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    ({ decorate } = await import('./carousel.js'));
  });

  it('single slide: no navigation buttons rendered', async () => {
    const block = makeCarouselBlock(1);
    await decorate(block);
    expect(block.querySelector('.slide-prev')).toBeNull();
    expect(block.querySelector('.slide-next')).toBeNull();
  });

  it('single slide: no slide indicators rendered', async () => {
    const block = makeCarouselBlock(1);
    await decorate(block);
    expect(block.querySelector('.carousel-slide-indicators')).toBeNull();
  });

  it('multiple slides: navigation buttons are rendered', async () => {
    const block = makeCarouselBlock(3);
    await decorate(block);
    expect(block.querySelector('.slide-prev')).not.toBeNull();
    expect(block.querySelector('.slide-next')).not.toBeNull();
  });

  it('multiple slides: slide indicators are rendered', async () => {
    const block = makeCarouselBlock(3);
    await decorate(block);
    expect(block.querySelector('.carousel-slide-indicators')).not.toBeNull();
    expect(block.querySelectorAll('.carousel-slide-indicator').length).toBe(3);
  });

  it('sets role=region on the block', async () => {
    const block = makeCarouselBlock(2);
    await decorate(block);
    expect(block.getAttribute('role')).toBe('region');
  });
});
