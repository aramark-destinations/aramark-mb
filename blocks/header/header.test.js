import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// header.js captures window.matchMedia at module level — mock it first
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
});

jest.mock('../../scripts/aem.js', () => ({
  getMetadata: jest.fn(() => ''),
}));

jest.mock('../../scripts/placeholders.js', () => ({
  fetchPlaceholders: jest.fn(() => Promise.resolve({ breadcrumbsHomeLabel: 'Home' })),
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

    // Create a minimal nav fragment with brand, sections, tools children
    const fragment = document.createElement('div');
    fragment.innerHTML = `
      <div class="nav-brand"><a href="/">Home</a></div>
      <div class="nav-sections">
        <div class="default-content-wrapper"><ul><li>Item</li></ul></div>
      </div>
      <div class="nav-tools"></div>
    `;
    mockLoadFragment.mockResolvedValue(fragment);

    block = document.createElement('div');
    block.className = 'header';
    document.body.appendChild(block);

    ({ decorate } = await import('./header.js'));
  });

  it('fires header:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('header:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires header:after event', async () => {
    const listener = jest.fn();
    block.addEventListener('header:after', listener);
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

  it('renders a nav element with id=nav', async () => {
    await decorate(block);
    expect(block.querySelector('nav#nav')).not.toBeNull();
  });

  it('renders a hamburger button', async () => {
    await decorate(block);
    expect(block.querySelector('.nav-hamburger button')).not.toBeNull();
  });
});
