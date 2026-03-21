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
    block.className = 'columns';
    block.innerHTML = '<div><div><p>Col 1</p></div><div><p>Col 2</p></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./columns.js'));
  });

  it('fires columns:before event', () => {
    const listener = jest.fn();
    block.addEventListener('columns:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires columns:after event', () => {
    const listener = jest.fn();
    block.addEventListener('columns:after', listener);
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

  it('adds columns-N-cols class to the block based on column count', () => {
    decorate(block);
    expect(block.classList.contains('columns-2-cols')).toBe(true);
  });
});
