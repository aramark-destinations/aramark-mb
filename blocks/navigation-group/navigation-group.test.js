import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
}));

jest.mock('../../scripts/aem.js', () => ({
  extractAueConfig: jest.fn(() => ({})),
}));

jest.mock('../../scripts/baici/utils/config.js', () => ({
  readConfig: jest.fn(() => ({ title: 'Group', link: '/', 'is-header-only': 'true' })),
  readKeyValueConfig: jest.fn(() => ({})),
  readUeConfig: jest.fn(() => ({})),
}));

jest.mock('../../scripts/baici/utils/utils.js', () => ({
  fetchSvg: jest.fn(() => Promise.resolve('<svg></svg>')),
  debounce: jest.fn((fn) => fn),
}));

jest.mock('../navigation/navigation.js', () => ({
  updateSubMenuHeight: jest.fn(),
  resetMenuState: jest.fn(),
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
    // navigation-group replaces block with an <li> — need a connected parent
    document.body.innerHTML = '<ul class="navigation-wrapper"></ul>';
    block = document.createElement('div');
    block.className = 'navigation-group';
    block.innerHTML = '<div><div><p>Group title</p></div></div>';
    document.querySelector('.navigation-wrapper').appendChild(block);
    ({ decorate } = await import('./navigation-group.js'));
  });

  it('fires navigation-group:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('navigation-group:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires navigation-group:after event (bubbles from replacement li)', async () => {
    const listener = jest.fn();
    document.body.addEventListener('navigation-group:after', listener);
    await decorate(block);
    document.body.removeEventListener('navigation-group:after', listener);
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

  it('replaces block with an <li.navigation-group> element', async () => {
    await decorate(block);
    expect(document.querySelector('li.navigation-group')).not.toBeNull();
  });
});
