import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'text';
    block.innerHTML = '<div><div><p>Some text content</p></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./text.js'));
  });

  it('fires text:before event', () => {
    const listener = jest.fn();
    block.addEventListener('text:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires text:after event', () => {
    const listener = jest.fn();
    block.addEventListener('text:after', listener);
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
