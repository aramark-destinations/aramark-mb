import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  readVariant: jest.fn(),
  moveInstrumentation: jest.fn(),
}));

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'hero';
    block.innerHTML = '<div><div><picture><img src="/img.jpg" alt="Hero"></picture></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./hero.js'));
  });

  it('fires hero:before event', () => {
    const listener = jest.fn();
    block.addEventListener('hero:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires hero:after event', () => {
    const listener = jest.fn();
    block.addEventListener('hero:after', listener);
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
