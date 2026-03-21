import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  decorateMain: jest.fn(),
  moveInstrumentation: jest.fn(),
}));

jest.mock('../../scripts/aem.js', () => ({
  loadSections: jest.fn(() => Promise.resolve()),
}));

// ─── loadFragment ─────────────────────────────────────────────────────────────

describe('loadFragment', () => {
  let loadFragment;

  beforeEach(async () => {
    jest.resetModules();
    global.fetch = jest.fn();
    ({ loadFragment } = await import('./fragment.js'));
  });

  it('returns null for non-absolute paths (no leading /)', async () => {
    const result = await loadFragment('relative/path');
    expect(result).toBeNull();
  });

  it('returns null for empty path', async () => {
    const result = await loadFragment('');
    expect(result).toBeNull();
  });

  it('returns null when fetch response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const result = await loadFragment('/some-path');
    expect(result).toBeNull();
  });

  it('returns a <main> element when fetch succeeds', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<div class="section"><div class="block">content</div></div>'),
    });
    const result = await loadFragment('/some-path');
    expect(result).not.toBeNull();
    expect(result.tagName).toBe('MAIN');
  });

  it('fetches <path>.plain.html', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    await loadFragment('/my-fragment');
    expect(global.fetch).toHaveBeenCalledWith('/my-fragment.plain.html');
  });
});

// ─── decorate — lifecycle ─────────────────────────────────────────────────────

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'fragment';
    block.innerHTML = '<div><a href="/fragment-path">Fragment</a></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./fragment.js'));
  });

  it('fires fragment:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('fragment:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires fragment:after event', async () => {
    const listener = jest.fn();
    block.addEventListener('fragment:after', listener);
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
