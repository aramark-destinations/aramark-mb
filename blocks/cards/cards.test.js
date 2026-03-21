import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockCreateOptimizedPicture = jest.fn();

jest.mock('../../scripts/aem.js', () => ({
  createOptimizedPicture: mockCreateOptimizedPicture,
}));

jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
  readVariant: jest.fn(),
}));

jest.mock('../../scripts/analytics.js', () => ({
  pushAnalyticsEvent: jest.fn(),
}));

// ─── sanitizeCSSClass ─────────────────────────────────────────────────────────

describe('sanitizeCSSClass', () => {
  let sanitizeCSSClass;

  beforeEach(async () => {
    jest.resetModules();
    ({ sanitizeCSSClass } = await import('./cards.js'));
  });

  it('returns empty string for null/undefined', () => {
    expect(sanitizeCSSClass(null)).toBe('');
    expect(sanitizeCSSClass(undefined)).toBe('');
  });

  it('strips invalid characters from a class name', () => {
    expect(sanitizeCSSClass('my-class!')).toBe('my-class');
  });

  it('handles multiple space-separated classes', () => {
    expect(sanitizeCSSClass('foo bar')).toBe('foo bar');
  });

  it('filters out classes that contain "script"', () => {
    expect(sanitizeCSSClass('myclass script')).toBe('myclass');
  });

  it('preserves hyphens and underscores', () => {
    expect(sanitizeCSSClass('my-class_name')).toBe('my-class_name');
  });
});

// ─── isLikelyURL ─────────────────────────────────────────────────────────────

describe('isLikelyURL', () => {
  let isLikelyURL;

  beforeEach(async () => {
    jest.resetModules();
    ({ isLikelyURL } = await import('./cards.js'));
  });

  it('returns false for null/undefined', () => {
    expect(isLikelyURL(null)).toBe(false);
    expect(isLikelyURL(undefined)).toBe(false);
  });

  it('returns true for https:// URLs', () => {
    expect(isLikelyURL('https://example.com')).toBe(true);
  });

  it('returns true for http:// URLs', () => {
    expect(isLikelyURL('http://example.com')).toBe(true);
  });

  it('returns true for root-relative paths', () => {
    expect(isLikelyURL('/page/path')).toBe(true);
  });

  it('returns true for relative paths starting with ./', () => {
    expect(isLikelyURL('./page')).toBe(true);
  });

  it('returns true for mailto: links', () => {
    expect(isLikelyURL('mailto:test@example.com')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(isLikelyURL('just some text')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isLikelyURL('')).toBe(false);
  });
});

// ─── decorate — lifecycle ─────────────────────────────────────────────────────

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    // createOptimizedPicture must return a real element with querySelector
    const pic = document.createElement('picture');
    pic.appendChild(document.createElement('img'));
    mockCreateOptimizedPicture.mockReturnValue(pic);

    block = document.createElement('div');
    block.className = 'cards';
    block.innerHTML = `
      <div>
        <div><picture><img src="/img.jpg" alt="Card"></picture></div>
        <div><p>Card body text</p></div>
      </div>`;
    document.body.appendChild(block);
    ({ decorate } = await import('./cards.js'));
  });

  it('fires cards:before event', () => {
    const listener = jest.fn();
    block.addEventListener('cards:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires cards:after event', () => {
    const listener = jest.fn();
    block.addEventListener('cards:after', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls onBefore hook when provided', () => {
    const onBefore = jest.fn();
    decorate(block, { onBefore });
    expect(onBefore).toHaveBeenCalledTimes(1);
  });

  it('calls onAfter hook when provided', () => {
    const onAfter = jest.fn();
    decorate(block, { onAfter });
    expect(onAfter).toHaveBeenCalledTimes(1);
  });

  it('renders a <ul> list of cards', () => {
    decorate(block);
    expect(block.querySelector('ul')).not.toBeNull();
  });
});
