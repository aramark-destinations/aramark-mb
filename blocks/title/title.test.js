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
    block.className = 'title';
    block.innerHTML = '<div><div><h2>My Title</h2></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./title.js'));
  });

  it('fires title:before event', () => {
    const listener = jest.fn();
    block.addEventListener('title:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires title:after event', () => {
    const listener = jest.fn();
    block.addEventListener('title:after', listener);
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
