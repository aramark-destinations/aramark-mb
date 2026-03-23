import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

jest.mock('../../scripts/aem.js', () => ({
  getMetadata: jest.fn(() => ''),
}));

// mock-prefixed — allowed in jest.mock factory
const mockLoadFragment = jest.fn();

jest.mock('../fragment/fragment.js', () => ({
  loadFragment: mockLoadFragment,
}));

// ─── decorate — lifecycle ─────────────────────────────────────────────────────

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';

    const fragment = document.createElement('div');
    fragment.innerHTML = '<div class="footer-content"><p>Footer text</p></div>';
    mockLoadFragment.mockResolvedValue(fragment);

    block = document.createElement('div');
    block.className = 'footer';
    document.body.appendChild(block);

    ({ decorate } = await import('./footer.js'));
  });

  it('fires footer:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('footer:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires footer:after event', async () => {
    const listener = jest.fn();
    block.addEventListener('footer:after', listener);
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

  it('appends fragment content to block', async () => {
    await decorate(block);
    expect(block.querySelector('.footer-content')).not.toBeNull();
  });
});
