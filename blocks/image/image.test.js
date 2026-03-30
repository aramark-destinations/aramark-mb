import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

let mockMoveInstrumentation = jest.fn();
let mockFetchDmAltText = jest.fn().mockResolvedValue(null);

jest.mock('../../scripts/scripts.js', () => ({
  readVariant: jest.fn(),
  moveInstrumentation: (...args) => mockMoveInstrumentation(...args),
}));

// Use real createDmPicture from utils (no mock — tested in utils.test.js);
// mock fetchDmAltText for gating tests
jest.mock('../../scripts/baici/utils/utils.js', () => {
  const actual = jest.requireActual('../../scripts/baici/utils/utils.js');
  return {
    ...actual,
    createDmPicture: actual.createDmPicture,
    fetchDmAltText: (...args) => mockFetchDmAltText(...args),
  };
});

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'image';
    block.innerHTML = '<div><div><picture><img src="/img.jpg" alt="Test"></picture></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./image.js'));
  });

  it('fires image:before event', () => {
    const listener = jest.fn();
    block.addEventListener('image:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires image:after event', () => {
    const listener = jest.fn();
    block.addEventListener('image:after', listener);
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

  it('passes { block, options } context to onBefore', () => {
    const onBefore = jest.fn();
    const options = { onBefore };
    decorate(block, options);
    expect(onBefore).toHaveBeenCalledWith({ block, options });
  });

  it('passes { block, options } context to onAfter', () => {
    const onAfter = jest.fn();
    const options = { onAfter };
    decorate(block, options);
    expect(onAfter).toHaveBeenCalledWith({ block, options });
  });

  it('event detail contains { block, options } context', () => {
    const listener = jest.fn();
    block.addEventListener('image:before', listener);
    const options = {};
    decorate(block, options);
    expect(listener.mock.calls[0][0].detail).toEqual({ block, options });
  });
});

describe('decorate — core logic', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';

    mockMoveInstrumentation = jest.fn();
    mockFetchDmAltText = jest.fn().mockResolvedValue(null);

    block = document.createElement('div');
    block.className = 'image';
    block.innerHTML = '<div><div><picture><img src="/img.jpg" alt="Test alt"></picture></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./image.js'));
  });

  it('replaces the original picture with a DM picture element', () => {
    decorate(block);
    expect(block.querySelector('picture source[type="image/webp"]')).not.toBeNull();
  });

  it('prefers data-imagealt over img.alt', () => {
    block.dataset.imagealt = 'Override from data attr';
    decorate(block);
    expect(block.querySelector('img').getAttribute('alt')).toBe('Override from data attr');
  });

  it('falls back to img.alt when data-imagealt is absent', () => {
    decorate(block);
    expect(block.querySelector('img').getAttribute('alt')).toBe('Test alt');
  });

  it('uses empty string when both data-imagealt and img.alt are absent', () => {
    block.innerHTML = '<div><div><picture><img src="/img.jpg"></picture></div></div>';
    decorate(block);
    expect(block.querySelector('img').getAttribute('alt')).toBe('');
  });

  it('does not throw when no picture element is present', () => {
    block.innerHTML = '<div><div>No image here</div></div>';
    expect(() => decorate(block)).not.toThrow();
  });

  it('calls moveInstrumentation with original and DM img', () => {
    decorate(block);
    expect(mockMoveInstrumentation).toHaveBeenCalledTimes(1);
    const [originalImg, dmImg] = mockMoveInstrumentation.mock.calls[0];
    expect(originalImg.tagName).toBe('IMG');
    expect(originalImg.getAttribute('src')).toContain('/img.jpg');
    expect(dmImg.tagName).toBe('IMG');
  });
});

const DM_SRC = '/adobe/dynamicmedia/deliver/dm-aid--563d8af3-3378-46c8-9d9a-51ca0b943a26/image.jpg';

describe('decorate — DM picture output', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    mockMoveInstrumentation = jest.fn();
    mockFetchDmAltText = jest.fn().mockResolvedValue(null);

    block = document.createElement('div');
    block.className = 'image';
    block.innerHTML = `<div><div><picture><img src="${DM_SRC}" alt="DM image"></picture></div></div>`;
    document.body.appendChild(block);
    ({ decorate } = await import('./image.js'));
  });

  it('generates WebP <source> elements with DM preferwebp param', () => {
    decorate(block);
    const sources = block.querySelectorAll('source[type="image/webp"]');
    expect(sources.length).toBe(3);
    sources.forEach((source) => {
      expect(source.getAttribute('srcset')).toContain('preferwebp=true');
      expect(source.getAttribute('srcset')).toContain(DM_SRC);
      expect(source.getAttribute('srcset')).not.toContain('format=webply');
    });
  });

  it('generates WebP sources at 375, 768, and 1200 widths', () => {
    decorate(block);
    const sources = [...block.querySelectorAll('source[type="image/webp"]')];
    const srcsets = sources.map((s) => s.getAttribute('srcset'));
    expect(srcsets.some((s) => s.includes('width=375'))).toBe(true);
    expect(srcsets.some((s) => s.includes('width=768'))).toBe(true);
    expect(srcsets.some((s) => s.includes('width=1200'))).toBe(true);
  });

  it('fallback img src uses DM quality param, not EDS format param', () => {
    decorate(block);
    const img = block.querySelector('img');
    expect(img.getAttribute('src')).toContain('quality=85');
    expect(img.getAttribute('src')).not.toContain('format=');
    expect(img.getAttribute('src')).not.toContain('optimize=medium');
  });

  it('applies alt text to DM picture', () => {
    decorate(block);
    const img = block.querySelector('img');
    expect(img.getAttribute('alt')).toBe('DM image');
  });

  it('respects data-imagealt override for DM URLs', () => {
    block.dataset.imagealt = 'Override alt';
    decorate(block);
    const img = block.querySelector('img');
    expect(img.getAttribute('alt')).toBe('Override alt');
  });

  it('calls moveInstrumentation for DM URLs', () => {
    decorate(block);
    expect(mockMoveInstrumentation).toHaveBeenCalledTimes(1);
  });
});

describe('decorate — imageAltFromDam', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    mockMoveInstrumentation = jest.fn();
    mockFetchDmAltText = jest.fn().mockResolvedValue(null);

    block = document.createElement('div');
    block.className = 'image';
    block.innerHTML = `<div><div><picture><img src="${DM_SRC}" alt="Manual alt"></picture></div></div>`;
    document.body.appendChild(block);
    ({ decorate } = await import('./image.js'));
  });

  it('calls fetchDmAltText and updates alt when imagealtfromdam is not set', async () => {
    mockFetchDmAltText = jest.fn().mockResolvedValue('Alt from DAM');
    decorate(block);
    await Promise.resolve();
    expect(mockFetchDmAltText).toHaveBeenCalledTimes(1);
    expect(block.querySelector('img').getAttribute('alt')).toBe('Alt from DAM');
  });

  it('does not call fetchDmAltText when imagealtfromdam is "false"', () => {
    mockFetchDmAltText = jest.fn().mockResolvedValue('Alt from DAM');
    block.dataset.imagealtfromdam = 'false';
    decorate(block);
    expect(mockFetchDmAltText).not.toHaveBeenCalled();
  });

  it('preserves manual alt when fetchDmAltText returns null', async () => {
    mockFetchDmAltText = jest.fn().mockResolvedValue(null);
    decorate(block);
    await Promise.resolve();
    expect(block.querySelector('img').getAttribute('alt')).toBe('Manual alt');
  });

  it('preserves manual alt when fetchDmAltText returns empty string', async () => {
    mockFetchDmAltText = jest.fn().mockResolvedValue('');
    decorate(block);
    await Promise.resolve();
    expect(block.querySelector('img').getAttribute('alt')).toBe('Manual alt');
  });
});
