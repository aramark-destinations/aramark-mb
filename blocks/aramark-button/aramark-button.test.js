import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  readVariant: jest.fn(),
  moveInstrumentation: jest.fn(),
}));

jest.mock('../../scripts/aem.js', () => ({
  extractAueConfig: jest.fn(() => ({})),
}));

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'aramark-button';
    block.innerHTML = '<div><div><p><a href="/page">Click me</a></p></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./aramark-button.js'));
  });

  it('fires aramark-button:before event', () => {
    const listener = jest.fn();
    block.addEventListener('aramark-button:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires aramark-button:after event', () => {
    const listener = jest.fn();
    block.addEventListener('aramark-button:after', listener);
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

  it('applies default filled style class to link', () => {
    decorate(block);
    const link = block.querySelector('a');
    expect(link.classList.contains('filled')).toBe(true);
  });

  it('applies default primary color class to link', () => {
    decorate(block);
    const link = block.querySelector('a');
    expect(link.classList.contains('color-primary')).toBe(true);
  });

  it('applies default large size class to link', () => {
    decorate(block);
    const link = block.querySelector('a');
    expect(link.classList.contains('size-large')).toBe(true);
  });
});
