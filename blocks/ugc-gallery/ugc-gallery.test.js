import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../scripts/aem.js', () => ({
  readBlockConfig: jest.fn(() => ({})),
  loadScript: jest.fn(() => Promise.resolve()),
}));

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'ugc-gallery';
    document.body.appendChild(block);
    ({ decorate } = await import('./ugc-gallery.js'));
  });

  it('fires ugc-gallery:before event', () => {
    const listener = jest.fn();
    block.addEventListener('ugc-gallery:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires ugc-gallery:after event', () => {
    const listener = jest.fn();
    block.addEventListener('ugc-gallery:after', listener);
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
