import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
}));

jest.mock('../../scripts/aem.js', () => ({
  readBlockConfig: jest.fn(() => ({
    title: 'Nav Item',
    link: '/page',
    description: '',
    'open-in-new-tab': 'false',
  })),
}));

jest.mock('../../scripts/baici/utils/utils.js', () => ({
  debounce: jest.fn((fn) => fn),
}));

jest.mock('../navigation/navigation.js', () => ({
  updateSubMenuHeight: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
});

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    // navigation-item.js replaces block with an <li> — provide a section ancestor
    // so the replacement stays connected and events can bubble
    document.body.innerHTML = '<ul class="navigation-section-submenu"></ul>';
    block = document.createElement('div');
    block.className = 'navigation-item';
    block.setAttribute('role', 'menuitem');
    block.innerHTML = '<div><a href="/page">Nav Item</a></div>';
    document.querySelector('.navigation-section-submenu').appendChild(block);
    ({ decorate } = await import('./navigation-item.js'));
  });

  it('fires navigation-item:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('navigation-item:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires navigation-item:after event (bubbles from replacement li)', async () => {
    // after fires on the li that replaces block — listen on a stable ancestor
    const listener = jest.fn();
    document.body.addEventListener('navigation-item:after', listener);
    await decorate(block);
    document.body.removeEventListener('navigation-item:after', listener);
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

  it('replaces block with an <li> element', async () => {
    await decorate(block);
    expect(document.querySelector('li.navigation-item')).not.toBeNull();
  });
});
