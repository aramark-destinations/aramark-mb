import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

let mockMoveInstrumentation = jest.fn();

jest.mock('../../scripts/scripts.js', () => ({
  readVariant: jest.fn(),
  moveInstrumentation: (...args) => mockMoveInstrumentation(...args),
}));

let mockCreateOptimizedPicture = jest.fn(() => {
  const pic = document.createElement('picture');
  pic.appendChild(document.createElement('img'));
  return pic;
});

jest.mock('../../scripts/aem.js', () => ({
  createOptimizedPicture: (...args) => mockCreateOptimizedPicture(...args),
}));

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
});

describe('decorate — core logic', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';

    const optimizedPic = document.createElement('picture');
    optimizedPic.appendChild(document.createElement('img'));
    mockCreateOptimizedPicture = jest.fn().mockReturnValue(optimizedPic);
    mockMoveInstrumentation = jest.fn();

    block = document.createElement('div');
    block.className = 'image';
    block.innerHTML = '<div><div><picture><img src="/img.jpg" alt="Test alt"></picture></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./image.js'));
  });

  it('replaces picture with optimized picture', () => {
    decorate(block);
    expect(mockCreateOptimizedPicture).toHaveBeenCalledTimes(1);
    expect(mockCreateOptimizedPicture).toHaveBeenCalledWith(
      expect.stringContaining('/img.jpg'),
      'Test alt',
      false,
      [{ width: '375' }, { width: '768' }, { width: '1200' }],
    );
  });

  it('prefers data-imagealt over img.alt', () => {
    block.dataset.imagealt = 'Override from data attr';
    decorate(block);
    expect(mockCreateOptimizedPicture).toHaveBeenCalledWith(
      expect.any(String),
      'Override from data attr',
      false,
      expect.any(Array),
    );
  });

  it('falls back to img.alt when data-imagealt is absent', () => {
    decorate(block);
    expect(mockCreateOptimizedPicture).toHaveBeenCalledWith(
      expect.any(String),
      'Test alt',
      false,
      expect.any(Array),
    );
  });

  it('does not throw when no picture element is present', () => {
    block.innerHTML = '<div><div>No image here</div></div>';
    expect(() => decorate(block)).not.toThrow();
    expect(mockCreateOptimizedPicture).not.toHaveBeenCalled();
  });

  it('calls moveInstrumentation with original and optimized img', () => {
    decorate(block);
    expect(mockMoveInstrumentation).toHaveBeenCalledTimes(1);
    const [originalImg, optimizedImg] = mockMoveInstrumentation.mock.calls[0];
    expect(originalImg.tagName).toBe('IMG');
    expect(originalImg.getAttribute('src')).toContain('/img.jpg');
    expect(optimizedImg.tagName).toBe('IMG');
  });
});
