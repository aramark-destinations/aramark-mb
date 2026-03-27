import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

describe('button decorate', () => {
  let decorate;
  let block;

  const buildBlock = ({ type = '', color = '', size = '', shape = '' } = {}) => {
    const b = document.createElement('div');
    b.className = ['button', type, color, size, shape].filter(Boolean).join(' ');
    b.innerHTML = '<div><div><p><a href="/page">Click me</a></p></div></div>';
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

  it('adds default filled class to block when no style class present', () => {
    decorate(block);
    expect(block.classList.contains('filled')).toBe(true);
  });

  it('adds default color-primary class to block when no color class present', () => {
    decorate(block);
    expect(block.classList.contains('color-primary')).toBe(true);
  });

  it('adds default size-large class to block when no size class present', () => {
    decorate(block);
    expect(block.classList.contains('size-large')).toBe(true);
  });

  it('does not add default style class when outlined is already present', () => {
    document.body.innerHTML = '';
    const b = buildBlock({ type: 'outlined' });
    decorate(b);
    expect(b.classList.contains('outlined')).toBe(true);
    expect(b.classList.contains('filled')).toBe(false);
  });

  it('does not add default color class when color-tertiary is already present', () => {
    document.body.innerHTML = '';
    const b = buildBlock({ color: 'color-tertiary' });
    decorate(b);
    expect(b.classList.contains('color-tertiary')).toBe(true);
    expect(b.classList.contains('color-primary')).toBe(false);
  });

  it('does not add default size class when size-small is already present', () => {
    document.body.innerHTML = '';
    const b = buildBlock({ size: 'size-small' });
    decorate(b);
    expect(b.classList.contains('size-small')).toBe(true);
    expect(b.classList.contains('size-large')).toBe(false);
  });

  it('retains shape-pill class when present on block', () => {
    document.body.innerHTML = '';
    const b = buildBlock({ shape: 'shape-pill' });
    decorate(b);
    expect(b.classList.contains('shape-pill')).toBe(true);
  });

  it('applies all authored classes and no defaults when all are present', () => {
    document.body.innerHTML = '';
    const b = buildBlock({
      type: 'outlined', color: 'color-secondary', size: 'size-small', shape: 'shape-pill',
    });
    decorate(b);
    expect(b.classList.contains('outlined')).toBe(true);
    expect(b.classList.contains('color-secondary')).toBe(true);
    expect(b.classList.contains('size-small')).toBe(true);
    expect(b.classList.contains('shape-pill')).toBe(true);
    expect(b.classList.contains('filled')).toBe(false);
    expect(b.classList.contains('color-primary')).toBe(false);
    expect(b.classList.contains('size-large')).toBe(false);
  });

  it('removes stale content rows (no <a>) as defense for old authored content', () => {
    document.body.innerHTML = '';
    const b = document.createElement('div');
    b.className = 'button';
    b.innerHTML = `
      <div><div><p><a href="/page">Click me</a></p></div></div>
      <div><div><p>stale-row</p></div></div>
    `;
    document.body.appendChild(b);
    decorate(b);
    expect(b.querySelectorAll(':scope > div').length).toBe(1);
  });

  it('sets aria-label from title attribute when title is present', () => {
    document.body.innerHTML = '';
    const b = document.createElement('div');
    b.className = 'button';
    b.innerHTML = '<div><div><p><a href="/page" title="Book a reservation">Book now</a></p></div></div>';
    document.body.appendChild(b);
    decorate(b);
    expect(b.querySelector('a').getAttribute('aria-label')).toBe('Book a reservation');
  });

  it('does not set aria-label when title is absent', () => {
    document.body.innerHTML = '';
    const b = buildBlock();
    decorate(b);
    expect(b.querySelector('a').getAttribute('aria-label')).toBeNull();
  });
});
