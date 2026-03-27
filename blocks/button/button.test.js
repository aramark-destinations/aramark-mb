import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  readVariant: jest.fn(),
  moveInstrumentation: jest.fn(),
}));

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  const buildBlock = (linkType = '', linkColor = '', linkSize = '', linkShape = '') => {
    const b = document.createElement('div');
    b.className = 'button';
    b.innerHTML = `
      <div><div><p><a href="/page">Click me</a></p></div></div>
      ${linkType ? `<div><div><p>${linkType}</p></div></div>` : ''}
      ${linkColor ? `<div><div><p>${linkColor}</p></div></div>` : ''}
      ${linkSize ? `<div><div><p>${linkSize}</p></div></div>` : ''}
      ${linkShape ? `<div><div><p>${linkShape}</p></div></div>` : ''}
    `;
    document.body.appendChild(b);
    return b;
  };

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = buildBlock();
    ({ decorate } = await import('./button.js'));
  });

  it('fires button:before event', () => {
    const listener = jest.fn();
    block.addEventListener('button:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires button:after event', () => {
    const listener = jest.fn();
    block.addEventListener('button:after', listener);
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

  it('applies default filled style class to link when no rows provided', () => {
    decorate(block);
    const link = block.querySelector('a');
    expect(link.classList.contains('filled')).toBe(true);
  });

  it('applies default primary color class to link when no rows provided', () => {
    decorate(block);
    const link = block.querySelector('a');
    expect(link.classList.contains('color-primary')).toBe(true);
  });

  it('applies default large size class to link when no rows provided', () => {
    decorate(block);
    const link = block.querySelector('a');
    expect(link.classList.contains('size-large')).toBe(true);
  });

  it('applies outlined style from positional row', () => {
    document.body.innerHTML = '';
    const b = buildBlock('outlined');
    decorate(b);
    expect(b.querySelector('a').classList.contains('outlined')).toBe(true);
  });

  it('applies tertiary color from positional row', () => {
    document.body.innerHTML = '';
    const b = buildBlock('filled', 'tertiary');
    decorate(b);
    expect(b.querySelector('a').classList.contains('color-tertiary')).toBe(true);
  });

  it('applies pill shape from positional row', () => {
    document.body.innerHTML = '';
    const b = buildBlock('filled', 'primary', 'large', 'pill');
    decorate(b);
    expect(b.querySelector('a').classList.contains('shape-pill')).toBe(true);
  });

  it('removes config rows from DOM after decoration', () => {
    document.body.innerHTML = '';
    const b = buildBlock('filled', 'tertiary', 'large', 'pill');
    decorate(b);
    // Only the link row should remain
    expect(b.querySelectorAll(':scope > div').length).toBe(1);
  });
});
