import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

// Must be set before module import because search.js reads window.location.search at module level
global.window.hlx = { codeBasePath: '' };

jest.mock('../../scripts/aem.js', () => ({
  createOptimizedPicture: jest.fn(),
  decorateIcons: jest.fn(),
}));

jest.mock('../../scripts/scripts.js', () => ({
  readVariant: jest.fn(),
}));

jest.mock('../../scripts/placeholders.js', () => ({
  fetchPlaceholders: jest.fn(() => Promise.resolve({
    searchPlaceholder: 'Search...',
    searchNoResults: 'No results found.',
  })),
}));

// ─── highlightTextElements ───────────────────────────────────────────────────

describe('highlightTextElements', () => {
  let highlightTextElements;

  beforeEach(async () => {
    jest.resetModules();
    ({ highlightTextElements } = await import('./search.js'));
  });

  it('wraps matching text in a <mark> element', () => {
    const el = document.createElement('p');
    el.textContent = 'Hello world';
    highlightTextElements(['world'], [el]);
    expect(el.querySelector('mark')).not.toBeNull();
    expect(el.querySelector('mark').textContent).toBe('world');
  });

  it('is case-insensitive', () => {
    const el = document.createElement('p');
    el.textContent = 'Hello World';
    highlightTextElements(['hello'], [el]);
    expect(el.querySelector('mark').textContent).toBe('Hello');
  });

  it('leaves element unchanged when no match', () => {
    const el = document.createElement('p');
    el.textContent = 'Hello world';
    highlightTextElements(['xyz'], [el]);
    expect(el.querySelector('mark')).toBeNull();
    expect(el.textContent).toBe('Hello world');
  });

  it('handles multiple terms', () => {
    const el = document.createElement('p');
    el.textContent = 'foo and bar';
    highlightTextElements(['foo', 'bar'], [el]);
    const marks = el.querySelectorAll('mark');
    expect(marks.length).toBe(2);
  });

  it('skips null or empty elements gracefully', () => {
    expect(() => highlightTextElements(['term'], [null])).not.toThrow();
  });
});

// ─── filterData ──────────────────────────────────────────────────────────────

describe('filterData', () => {
  let filterData;

  const data = [
    {
      title: 'Apple Recipes', header: 'Apple Recipes', description: 'Tasty fruit', path: '/apple',
    },
    {
      title: 'Banana Guide', header: 'Banana Guide', description: 'Yellow fruit about apples', path: '/banana',
    },
    {
      title: 'Cherry Tips', header: 'Cherry Tips', description: 'Red fruit', path: '/cherry',
    },
  ];

  beforeEach(async () => {
    jest.resetModules();
    ({ filterData } = await import('./search.js'));
  });

  it('returns results that match the header', () => {
    const results = filterData(['apple'], data);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].path).toBe('/apple');
  });

  it('returns meta matches when term is not in header', () => {
    // 'fruit' appears in descriptions but not in headers
    const results = filterData(['fruit'], data);
    expect(results.length).toBe(3);
  });

  it('places header matches before meta-only matches', () => {
    // 'apple' matches banana's description too
    const results = filterData(['apple'], data);
    const paths = results.map((r) => r.path);
    expect(paths.indexOf('/apple')).toBeLessThan(paths.indexOf('/banana'));
  });

  it('returns empty array when no term matches', () => {
    const results = filterData(['zzznotfound'], data);
    expect(results).toEqual([]);
  });

  it('is case-insensitive against result data (terms are pre-lowercased by caller)', () => {
    // filterData callers lowercase terms before passing them in; the function
    // lowercases the result data for comparison. Pass a lowercase term.
    const results = filterData(['apple'], data);
    expect(results.some((r) => r.path === '/apple')).toBe(true);
  });
});

// ─── fetchData ───────────────────────────────────────────────────────────────

describe('fetchData', () => {
  let fetchData;

  beforeEach(async () => {
    jest.resetModules();
    global.fetch = jest.fn();
    ({ fetchData } = await import('./search.js'));
  });

  it('returns json.data on success', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ title: 'Test' }] }),
    });
    const result = await fetchData('/index.json');
    expect(result).toEqual([{ title: 'Test' }]);
  });

  it('returns null when response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const result = await fetchData('/index.json');
    expect(result).toBeNull();
  });

  it('returns null when json body is empty/falsy', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    });
    const result = await fetchData('/index.json');
    expect(result).toBeNull();
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
    block.className = 'search';
    document.body.appendChild(block);

    ({ decorate } = await import('./search.js'));
  });

  it('fires search:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('search:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires search:after event', async () => {
    const listener = jest.fn();
    block.addEventListener('search:after', listener);
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

  it('renders a search input', async () => {
    await decorate(block);
    expect(block.querySelector('input[type="search"]')).not.toBeNull();
  });

  it('renders a search results container', async () => {
    await decorate(block);
    expect(block.querySelector('.search-results')).not.toBeNull();
  });
});
