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
    block.className = 'quote';
    block.innerHTML = '<div><div><p>Quote text here.</p></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./quote.js'));
  });

  it('fires quote:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('quote:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires quote:after event', async () => {
    const listener = jest.fn();
    block.addEventListener('quote:after', listener);
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
