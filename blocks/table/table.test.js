import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../scripts/aem.js', () => ({
  readBlockConfig: jest.fn(() => ({})),
}));

jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
  readVariant: jest.fn(),
}));

// ─── normaliseText ────────────────────────────────────────────────────────────

describe('normaliseText', () => {
  let normaliseText;

  beforeEach(async () => {
    jest.resetModules();
    ({ normaliseText } = await import('./table.js'));
  });

  it('trims leading and trailing whitespace', () => {
    expect(normaliseText('  hello  ')).toBe('hello');
  });

  it('replaces non-breaking spaces (\u00a0) with regular spaces', () => {
    expect(normaliseText('hello\u00a0world')).toBe('hello world');
  });

  it('returns empty string for empty input', () => {
    expect(normaliseText('')).toBe('');
  });

  it('returns empty string when called with no argument', () => {
    expect(normaliseText()).toBe('');
  });
});

// ─── isNumericContent ─────────────────────────────────────────────────────────

describe('isNumericContent', () => {
  let isNumericContent;

  beforeEach(async () => {
    jest.resetModules();
    ({ isNumericContent } = await import('./table.js'));
  });

  it('returns true for integer', () => {
    expect(isNumericContent('42')).toBe(true);
  });

  it('returns true for decimal (US format)', () => {
    expect(isNumericContent('1,234.56')).toBe(true);
  });

  it('returns true for decimal (EU format)', () => {
    expect(isNumericContent('1.234,56')).toBe(true);
  });

  it('returns true for negative number', () => {
    expect(isNumericContent('-99')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(isNumericContent('hello')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isNumericContent('')).toBe(false);
  });

  it('returns false for mixed alphanumeric', () => {
    expect(isNumericContent('12abc')).toBe(false);
  });
});

// ─── shouldRenderRowHeader ────────────────────────────────────────────────────

describe('shouldRenderRowHeader', () => {
  let shouldRenderRowHeader;

  function makeCell(attrs = {}) {
    const cell = document.createElement('td');
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'dataset') {
        Object.entries(v).forEach(([dk, dv]) => { cell.dataset[dk] = dv; });
      } else if (k === 'className') {
        cell.className = v;
      } else {
        cell.setAttribute(k, v);
      }
    });
    return cell;
  }

  beforeEach(async () => {
    jest.resetModules();
    ({ shouldRenderRowHeader } = await import('./table.js'));
  });

  it('returns false when index is not 0', () => {
    expect(shouldRenderRowHeader(makeCell(), 1)).toBe(false);
  });

  it('returns false when cell has colspan attribute', () => {
    expect(shouldRenderRowHeader(makeCell({ colspan: '2' }), 0)).toBe(false);
  });

  it('returns false when dataset.rowHeader is "false"', () => {
    expect(shouldRenderRowHeader(makeCell({ dataset: { rowHeader: 'false' } }), 0)).toBe(false);
  });

  it('returns true when dataset.rowHeader is "true"', () => {
    expect(shouldRenderRowHeader(makeCell({ dataset: { rowHeader: 'true' } }), 0)).toBe(true);
  });

  it('returns true when role="rowheader"', () => {
    expect(shouldRenderRowHeader(makeCell({ role: 'rowheader' }), 0)).toBe(true);
  });

  it('returns true when classList contains row-header', () => {
    expect(shouldRenderRowHeader(makeCell({ className: 'row-header' }), 0)).toBe(true);
  });

  it('returns false for plain first cell with no hints', () => {
    expect(shouldRenderRowHeader(makeCell(), 0)).toBe(false);
  });
});

// ─── decorate — lifecycle ─────────────────────────────────────────────────────

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'table';
    block.innerHTML = `
      <div><div>Header 1</div><div>Header 2</div></div>
      <div><div>Cell 1</div><div>Cell 2</div></div>`;
    document.body.appendChild(block);
    ({ decorate } = await import('./table.js'));
  });

  it('fires table:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('table:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires table:after event', async () => {
    const listener = jest.fn();
    block.addEventListener('table:after', listener);
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

  it('renders a <table> element', async () => {
    await decorate(block);
    expect(block.querySelector('table')).not.toBeNull();
  });
});
