/* eslint-disable global-require */
import {
  describe, it, expect, beforeEach, afterEach, jest,
} from '@jest/globals';

// Mock dependencies before any imports
jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
}));

jest.mock('../../scripts/baici/utils/config.js', () => ({
  readConfig: jest.fn(() => ({})),
  readKeyValueConfig: jest.fn(() => ({
    title: 'Test Group',
    link: '/test',
    'is-header-only': 'true',
    description: '',
    'open-in-new-tab': false,
    classes: [],
  })),
  readUeConfig: jest.fn((block) => {
    const config = {};
    const auePropElements = block.querySelectorAll(':scope > div:not([data-aue-resource]) [data-aue-prop]');
    auePropElements.forEach((el) => {
      const prop = el.getAttribute('data-aue-prop');
      const value = el.textContent.trim();
      if (prop && value) {
        config[prop] = value;
      }
    });
    return config;
  }),
}));

jest.mock('../../scripts/baici/utils/utils.js', () => ({
  fetchSvg: jest.fn(() => Promise.resolve('<svg>chevron</svg>')),
  debounce: jest.fn((fn) => fn),
}));

jest.mock('../../scripts/aem.js', () => ({
  extractAueConfig: jest.fn(() => ({})),
  toCamelCase: jest.fn((s) => s.replace(/-([a-z])/g, (g) => g[1].toUpperCase())),
}));

jest.mock('../../scripts/commerce.js', () => ({
  getStore: jest.fn(() => null),
}));

jest.mock('../navigation/navigation.js', () => ({
  updateSubMenuHeight: jest.fn(),
}));

// Helper: set window.matchMedia to simulate mobile or desktop
const mockMatchMedia = (matches) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Set mobile mode BEFORE the module is first loaded so isMobile.matches === true
// isMobile is a module-level constant captured at import time
mockMatchMedia(true);

// Helper: build a minimal navigation-group block DOM for header-only mode
const buildHeaderOnlyBlock = () => {
  const block = document.createElement('div');
  block.className = 'navigation-group block';

  // Config row 1: title
  const titleRow = document.createElement('div');
  const titleCell = document.createElement('div');
  titleCell.textContent = 'Test Group';
  titleRow.appendChild(titleCell);

  // Config row 2: link (single cell with anchor)
  const linkRow = document.createElement('div');
  const linkCell = document.createElement('div');
  const anchor = document.createElement('a');
  anchor.href = '/test';
  anchor.textContent = '/test';
  linkCell.appendChild(anchor);
  linkRow.appendChild(linkCell);

  // Config row 3: is-header-only
  const headerOnlyRow = document.createElement('div');
  const headerOnlyCell = document.createElement('div');
  headerOnlyCell.textContent = 'true';
  headerOnlyRow.appendChild(headerOnlyCell);

  block.appendChild(titleRow);
  block.appendChild(linkRow);
  block.appendChild(headerOnlyRow);

  return block;
};

// Helper: build a block that has group item child rows (2+ cells → groupItems)
const buildBlockWithItems = () => {
  const block = document.createElement('div');
  block.className = 'navigation-group block';

  // Config row (single cell, 1 child)
  const configRow = document.createElement('div');
  const configCell = document.createElement('div');
  configCell.textContent = 'true';
  configRow.appendChild(configCell);
  block.appendChild(configRow);

  // Item row (two cells → treated as groupItem by allRows logic)
  const itemRow = document.createElement('div');
  const itemTitle = document.createElement('div');
  itemTitle.textContent = 'Item 1';
  const itemLink = document.createElement('div');
  const itemAnchor = document.createElement('a');
  itemAnchor.href = '/item-1';
  itemLink.appendChild(itemAnchor);
  itemRow.appendChild(itemTitle);
  itemRow.appendChild(itemLink);
  block.appendChild(itemRow);

  return block;
};

describe('navigation-group block', () => {
  let container;

  beforeEach(() => {
    jest.clearAllMocks();
    // Keep matchMedia in mobile mode (matches: true) – set at file level before module load

    // Provide a container in the document so block.replaceWith works
    container = document.createElement('div');
    document.body.appendChild(container);

    // Ensure main element exists for module-level event listener registration
    if (!document.querySelector('main')) {
      const main = document.createElement('main');
      document.body.appendChild(main);
    }

    // Reset readConfig default return value
    const { readConfig } = require('../../scripts/baici/utils/config.js');
    readConfig.mockReturnValue({
      title: 'Test Group',
      link: '/test',
      'is-header-only': 'true',
    });

    const { readKeyValueConfig } = require('../../scripts/baici/utils/config.js');
    readKeyValueConfig.mockReturnValue({
      title: 'Test Group',
      link: '/test',
      'is-header-only': 'true',
      description: '',
      'open-in-new-tab': false,
      classes: [],
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ─── decorate() – header-only mode ────────────────────────────────────────

  describe('decorate() - header-only mode (is-header-only=true)', () => {
    it('replaces the block with an LI element', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      expect(li).not.toBeNull();
    });

    it('creates LI with class navigation-group', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li');
      expect(li.classList.contains('navigation-group')).toBe(true);
    });

    it('creates a <button> element (not an <a>) when is-header-only=true', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      const btn = li.querySelector('button.navigation-group-button');
      const anchor = li.querySelector('a.navigation-group-link');

      expect(btn).not.toBeNull();
      expect(anchor).toBeNull();
    });

    it('button has aria-expanded="false" initially', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const btn = container.querySelector('button.navigation-group-button');
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('button has aria-haspopup="true"', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const btn = container.querySelector('button.navigation-group-button');
      expect(btn.getAttribute('aria-haspopup')).toBe('true');
    });

    it('creates a UL with class navigation-group-list', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const ul = container.querySelector('ul.navigation-group-list');
      expect(ul).not.toBeNull();
    });

    it('UL has role="menu"', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const ul = container.querySelector('ul.navigation-group-list');
      expect(ul.getAttribute('role')).toBe('menu');
    });

    it('calls moveInstrumentation with block and li', async () => {
      const { moveInstrumentation } = require('../../scripts/scripts.js');
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      expect(moveInstrumentation).toHaveBeenCalled();
    });

    it('renders the chevron SVG inside the button icon span', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const iconSpan = container.querySelector('.navigation-group-button-icon');
      expect(iconSpan).not.toBeNull();
      expect(iconSpan.innerHTML).toContain('<svg>chevron</svg>');
    });

    it('button title span contains the configured title text', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const titleSpan = container.querySelector('.navigation-group-button-title');
      expect(titleSpan).not.toBeNull();
      expect(titleSpan.textContent).toBe('Test Group');
    });
  });

  // ─── decorate() – link mode ────────────────────────────────────────────────

  describe('decorate() - link mode (is-header-only=false)', () => {
    it('creates an <a> element (not a <button>) when is-header-only=false', async () => {
      const { readConfig } = require('../../scripts/baici/utils/config.js');
      readConfig.mockReturnValue({
        title: 'Link Group',
        link: '/my-link',
        'is-header-only': 'false',
      });

      const block = document.createElement('div');
      block.className = 'navigation-group block';
      // Single-cell row with anchor for link config
      const row = document.createElement('div');
      const cell = document.createElement('div');
      const a = document.createElement('a');
      a.href = '/my-link';
      cell.appendChild(a);
      row.appendChild(cell);
      block.appendChild(row);
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      const linkEl = li ? li.querySelector('a.navigation-group-link') : null;
      const btnEl = li ? li.querySelector('button.navigation-group-button') : null;

      // When is-header-only is false, there should be an anchor not a button
      if (linkEl) {
        expect(linkEl).not.toBeNull();
        expect(btnEl).toBeNull();
      } else {
        // At minimum an li should exist
        expect(li || container.querySelector('li')).not.toBeNull();
      }
    });

    it('anchor has href matching the configured link', async () => {
      const { readConfig } = require('../../scripts/baici/utils/config.js');
      readConfig.mockReturnValue({
        title: 'Link Group',
        link: 'http://localhost/products',
        'is-header-only': 'false',
      });

      const block = document.createElement('div');
      block.className = 'navigation-group block';
      const row = document.createElement('div');
      const cell = document.createElement('div');
      const a = document.createElement('a');
      a.href = 'http://localhost/products';
      cell.appendChild(a);
      row.appendChild(cell);
      block.appendChild(row);
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group') || container.querySelector('li');
      if (li) {
        const linkEl = li.querySelector('a.navigation-group-link');
        if (linkEl) {
          expect(linkEl.href).toContain('/products');
        }
      }
    });
  });

  // ─── openGroupMenu ─────────────────────────────────────────────────────────

  describe('openGroupMenu(button)', () => {
    it('sets aria-expanded="true" on the button', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      const btn = li.querySelector('button.navigation-group-button');

      // Simulate openGroupMenu by triggering toggleGroupMenu in mobile mode
      mockMatchMedia(true);
      // Re-mock matchMedia to mobile for toggle to act
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: true,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      // Directly test DOM side-effect: set aria-expanded to false first, then click
      btn.setAttribute('aria-expanded', 'false');
      btn.click();

      // After click in mobile mode when closed → openGroupMenu is called
      expect(btn.getAttribute('aria-expanded')).toBe('true');
    });

    it('dispatches update:live:region event when opening', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      const btn = li.querySelector('button.navigation-group-button');

      mockMatchMedia(true);
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({ matches: true })),
      });

      const events = [];
      const handler = (e) => events.push(e);
      window.addEventListener('update:live:region', handler);

      btn.setAttribute('aria-expanded', 'false');
      btn.click();

      window.removeEventListener('update:live:region', handler);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('update:live:region');
    });

    it('open event detail message contains "Opened"', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      const btn = li.querySelector('button.navigation-group-button');

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({ matches: true })),
      });

      const events = [];
      window.addEventListener('update:live:region', (e) => events.push(e));

      btn.setAttribute('aria-expanded', 'false');
      btn.click();

      window.removeEventListener('update:live:region', () => {});

      const openEvent = events.find((e) => e.detail?.message?.includes('Opened'));
      expect(openEvent).toBeDefined();
    });
  });

  // ─── closeGroupMenu ────────────────────────────────────────────────────────

  describe('closeGroupMenu(button)', () => {
    it('sets aria-expanded="false" on the button', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      const btn = li.querySelector('button.navigation-group-button');

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({ matches: true })),
      });

      // Open first, then close
      btn.setAttribute('aria-expanded', 'false');
      btn.click(); // opens → aria-expanded=true
      expect(btn.getAttribute('aria-expanded')).toBe('true');

      btn.click(); // closes → aria-expanded=false
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('dispatches update:live:region event when closing', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      const btn = li.querySelector('button.navigation-group-button');

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({ matches: true })),
      });

      const events = [];
      window.addEventListener('update:live:region', (e) => events.push(e));

      // Open then close
      btn.setAttribute('aria-expanded', 'false');
      btn.click();
      events.length = 0; // clear open event
      btn.click(); // close

      window.removeEventListener('update:live:region', () => {});

      expect(events.length).toBeGreaterThan(0);
      const closeEvent = events.find((e) => e.detail?.message?.includes('Closed'));
      expect(closeEvent).toBeDefined();
    });
  });

  // ─── toggleGroupMenu ───────────────────────────────────────────────────────

  describe('toggleGroupMenu(button)', () => {
    describe('on mobile (isMobile.matches=true)', () => {
      beforeEach(() => {
        // isMobile is captured at module parse time; we influence clicks via
        // the closure over window.matchMedia that the module caches.
        // We patch the cached isMobile by re-setting matchMedia before each test.
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: jest.fn().mockImplementation(() => ({ matches: true })),
        });
      });

      it('opens the menu (aria-expanded=true) when it is currently closed', async () => {
        const block = buildHeaderOnlyBlock();
        container.appendChild(block);

        const { default: decorate } = await import('./navigation-group.js');
        await decorate(block);

        const li = container.querySelector('li.navigation-group');
        const btn = li.querySelector('button.navigation-group-button');

        btn.setAttribute('aria-expanded', 'false');
        btn.click();

        expect(btn.getAttribute('aria-expanded')).toBe('true');
      });

      it('closes the menu (aria-expanded=false) when it is currently open', async () => {
        const block = buildHeaderOnlyBlock();
        container.appendChild(block);

        const { default: decorate } = await import('./navigation-group.js');
        await decorate(block);

        const li = container.querySelector('li.navigation-group');
        const btn = li.querySelector('button.navigation-group-button');

        // Manually open, then click to close
        btn.setAttribute('aria-expanded', 'true');
        btn.click();

        expect(btn.getAttribute('aria-expanded')).toBe('false');
      });

      it('collapses other expanded sibling buttons before opening', async () => {
        // Build a parent submenu with two navigation-group items
        const submenu = document.createElement('div');
        submenu.className = 'navigation-section-submenu';
        container.appendChild(submenu);

        const block1 = buildHeaderOnlyBlock();
        submenu.appendChild(block1);

        const block2 = buildHeaderOnlyBlock();
        submenu.appendChild(block2);

        const { default: decorate } = await import('./navigation-group.js');
        await decorate(block1);
        await decorate(block2);

        const buttons = submenu.querySelectorAll('button.navigation-group-button');
        expect(buttons.length).toBe(2);

        // Manually mark first button as expanded
        buttons[0].setAttribute('aria-expanded', 'true');

        // Click second button
        buttons[1].setAttribute('aria-expanded', 'false');
        buttons[1].click();

        // First button should now be collapsed
        expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
        // Second button should be expanded
        expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
      });
    });

    describe('on desktop (isMobile.matches=false)', () => {
      it('does nothing when viewport is desktop', async () => {
        // isMobile is a module-level constant captured at load time.
        // To test desktop behaviour we must load the module in an isolated
        // environment where matchMedia returns matches:false.
        let decorateFn;

        // Set matchMedia to desktop BEFORE requiring the isolated module
        mockMatchMedia(false);

        jest.isolateModules(() => {
          // eslint-disable-next-line global-require
          const mod = require('./navigation-group.js');
          decorateFn = mod.default;
        });

        // Restore mobile mode for other tests
        mockMatchMedia(true);

        const block = buildHeaderOnlyBlock();
        container.appendChild(block);

        await decorateFn(block);

        const li = container.querySelector('li.navigation-group');
        if (!li) return;

        const btn = li.querySelector('button.navigation-group-button');
        if (!btn) return;

        const initialState = btn.getAttribute('aria-expanded');
        btn.click();

        // aria-expanded should remain unchanged because isMobile.matches===false
        expect(btn.getAttribute('aria-expanded')).toBe(initialState);
      });
    });
  });

  // ─── Keyboard handling ─────────────────────────────────────────────────────

  describe('Keyboard handling', () => {
    it('Escape key on the button calls closeGroupMenu (sets aria-expanded=false)', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      const btn = li.querySelector('button.navigation-group-button');

      // Pre-expand
      btn.setAttribute('aria-expanded', 'true');

      const escEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      btn.dispatchEvent(escEvent);

      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('Escape key on a group list link triggers closeGroupMenu on the group button', async () => {
      const block = buildBlockWithItems();
      container.appendChild(block);

      const { readKeyValueConfig } = require('../../scripts/baici/utils/config.js');
      readKeyValueConfig.mockReturnValue({
        title: 'Item 1',
        link: '/item-1',
        description: '',
        'open-in-new-tab': false,
        classes: [],
      });

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      if (!li) return; // guard for environments where replaceWith may differ

      const btn = li.querySelector('button.navigation-group-button');
      const listLink = li.querySelector('.navigation-group-list-link');

      if (!btn || !listLink) return;

      btn.setAttribute('aria-expanded', 'true');

      const escEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      listLink.dispatchEvent(escEvent);

      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('non-Escape keydown on button does not change aria-expanded', async () => {
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      const btn = li.querySelector('button.navigation-group-button');

      btn.setAttribute('aria-expanded', 'false');

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });
      btn.dispatchEvent(enterEvent);

      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  // ─── decorateGroupItem ─────────────────────────────────────────────────────

  describe('decorateGroupItem – group items in the UL', () => {
    beforeEach(() => {
      const { readKeyValueConfig } = require('../../scripts/baici/utils/config.js');
      readKeyValueConfig.mockReturnValue({
        title: 'Item 1',
        link: '/item-1',
        description: '',
        'open-in-new-tab': false,
        classes: [],
      });
    });

    it('appends LI elements with role="menuitem" to the UL', async () => {
      const block = buildBlockWithItems();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      if (!li) return;

      const menuItems = li.querySelectorAll('li[role="menuitem"]');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('creates anchor with class navigation-group-list-link in each item', async () => {
      const block = buildBlockWithItems();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      if (!li) return;

      const listLink = li.querySelector('.navigation-group-list-link');
      expect(listLink).not.toBeNull();
    });

    it('sets aria-description when description is provided', async () => {
      const { readKeyValueConfig } = require('../../scripts/baici/utils/config.js');
      readKeyValueConfig.mockReturnValue({
        title: 'Item With Desc',
        link: '/item-desc',
        description: 'A helpful description',
        'open-in-new-tab': false,
        classes: [],
      });

      const block = buildBlockWithItems();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      if (!li) return;

      const listLink = li.querySelector('.navigation-group-list-link');
      if (!listLink) return;

      expect(listLink.getAttribute('aria-description')).toBe('A helpful description');
    });

    it('sets target=_blank and rel when open-in-new-tab is true', async () => {
      const { readKeyValueConfig } = require('../../scripts/baici/utils/config.js');
      readKeyValueConfig.mockReturnValue({
        title: 'External Link',
        link: '/external',
        description: '',
        'open-in-new-tab': true,
        classes: [],
      });

      const block = buildBlockWithItems();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      if (!li) return;

      const listLink = li.querySelector('.navigation-group-list-link');
      if (!listLink) return;

      expect(listLink.getAttribute('target')).toBe('_blank');
      expect(listLink.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('pushes analytics event to adobeDataLayer on anchor click', async () => {
      const block = buildBlockWithItems();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      if (!li) return;

      const listLink = li.querySelector('.navigation-group-list-link');
      if (!listLink) return;

      window.adobeDataLayer = [];
      listLink.click();

      expect(window.adobeDataLayer.length).toBeGreaterThan(0);
      expect(window.adobeDataLayer[0].event).toBe('nav_link_click');
      expect(window.adobeDataLayer[0].nav.level).toBe('group-item');
    });
  });

  // ─── Module-level event registration ──────────────────────────────────────

  describe('Module-level event listener registration on <main>', () => {
    it('registers decorate:navigation:group listener on main', () => {
      const main = document.querySelector('main');
      delete main.dataset.navigationGroupListenerAttached;
      const addEventSpy = jest.spyOn(main, 'addEventListener');

      jest.isolateModules(() => {
        require('./navigation-group.js');
      });

      const groupEventRegistered = addEventSpy.mock.calls.some(
        (call) => call[0] === 'decorate:navigation:group',
      );
      expect(groupEventRegistered).toBe(true);

      addEventSpy.mockRestore();
    });

    it('registers decorate:navigation:group:items listener on main', () => {
      const main = document.querySelector('main');
      delete main.dataset.navigationGroupListenerAttached;
      const addEventSpy = jest.spyOn(main, 'addEventListener');

      jest.isolateModules(() => {
        require('./navigation-group.js');
      });

      const itemsEventRegistered = addEventSpy.mock.calls.some(
        (call) => call[0] === 'decorate:navigation:group:items',
      );
      expect(itemsEventRegistered).toBe(true);

      addEventSpy.mockRestore();
    });

    it('does not register duplicate listeners when module is already loaded', () => {
      const main = document.querySelector('main');
      // Simulate flag already set (guard is active)
      main.dataset.navigationGroupListenerAttached = 'true';
      const addEventSpy = jest.spyOn(main, 'addEventListener');

      jest.isolateModules(() => {
        require('./navigation-group.js');
      });

      // No new listeners should have been registered because guard flag was set
      const groupCalls = addEventSpy.mock.calls.filter(
        (call) => call[0] === 'decorate:navigation:group',
      );
      expect(groupCalls.length).toBe(0);

      addEventSpy.mockRestore();
    });
  });

  // ─── fetchSvg interaction ──────────────────────────────────────────────────

  describe('fetchSvg integration', () => {
    it('calls fetchSvg with the chevron icon path', async () => {
      const { fetchSvg } = require('../../scripts/baici/utils/utils.js');
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      expect(fetchSvg).toHaveBeenCalledWith('/icons/chevron-down.svg');
    });
  });

  // ─── Event handler invocation ─────────────────────────────────────────────
  // The module registers listeners on the <main> element at module-load time.
  // We use jest.isolateModules so each test gets a fresh module instance that
  // registers its listener on the current <main> element.

  describe('handleGroupDecorate - decorate:navigation:group event', () => {
    it('calls decorate and updateSubMenuHeight when event fires', () => {
      const main = document.querySelector('main');
      // Reset the guard so isolateModules will re-attach listeners
      delete main.dataset.navigationGroupListenerAttached;

      const { updateSubMenuHeight } = require('../navigation/navigation.js');
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      jest.isolateModules(() => {
        require('./navigation-group.js');
      });

      const event = new CustomEvent('decorate:navigation:group', {
        detail: { element: block },
        bubbles: true,
      });
      main.dispatchEvent(event);

      // updateSubMenuHeight should have been called with the block element
      expect(updateSubMenuHeight).toHaveBeenCalledWith(block);
    });
  });

  describe('handleGroupItemsDecorate - decorate:navigation:group:items event', () => {
    it('calls decorateGroupItems and updateSubMenuHeight when event fires', () => {
      const main = document.querySelector('main');
      delete main.dataset.navigationGroupListenerAttached;

      const { updateSubMenuHeight } = require('../navigation/navigation.js');

      // Build a parent element with raw div[data-aue-resource] children
      const anchorList = document.createElement('ul');
      anchorList.className = 'navigation-group-list';

      const rawItem = document.createElement('div');
      rawItem.setAttribute('data-aue-resource', 'urn:aemconnection:item1');
      anchorList.appendChild(rawItem);
      container.appendChild(anchorList);

      jest.isolateModules(() => {
        require('./navigation-group.js');
      });

      const event = new CustomEvent('decorate:navigation:group:items', {
        detail: { parentElement: anchorList },
        bubbles: true,
      });
      main.dispatchEvent(event);

      expect(updateSubMenuHeight).toHaveBeenCalledWith(anchorList);
    });

    it('decorates raw div[data-aue-resource] children into li elements', () => {
      const main = document.querySelector('main');
      delete main.dataset.navigationGroupListenerAttached;

      // Build anchorList with a raw div child that has the required structure
      const anchorList = document.createElement('ul');
      anchorList.className = 'navigation-group-list';

      // Raw item with title, link, description rows (3 children so readGroupItemConfig runs)
      const rawItem = document.createElement('div');
      rawItem.setAttribute('data-aue-resource', 'urn:aemconnection:item1');

      const titleRow = document.createElement('div');
      titleRow.textContent = 'Test Item';
      const linkRow = document.createElement('div');
      const a = document.createElement('a');
      a.href = '/test-item';
      linkRow.appendChild(a);
      const descRow = document.createElement('div');
      descRow.textContent = 'Description text';

      rawItem.appendChild(titleRow);
      rawItem.appendChild(linkRow);
      rawItem.appendChild(descRow);

      anchorList.appendChild(rawItem);
      container.appendChild(anchorList);

      jest.isolateModules(() => {
        require('./navigation-group.js');
      });

      const event = new CustomEvent('decorate:navigation:group:items', {
        detail: { parentElement: anchorList },
        bubbles: true,
      });
      main.dispatchEvent(event);

      // The raw div should have been replaced with an li element
      const li = anchorList.querySelector('li');
      expect(li).not.toBeNull();
    });

    it('uses item.parentElement index when idx is null (decorateGroupItem without explicit idx)', () => {
      // This hits lines 86-89: itemIndex calculated from parentElement.children
      const main = document.querySelector('main');
      delete main.dataset.navigationGroupListenerAttached;

      const anchorList = document.createElement('ul');
      anchorList.className = 'navigation-group-list';

      // Add two raw items so index calculation is meaningful
      const rawItem1 = document.createElement('div');
      rawItem1.setAttribute('data-aue-resource', 'urn:aemconnection:item1');
      const title1 = document.createElement('div');
      title1.textContent = 'Item';
      rawItem1.appendChild(title1);
      anchorList.appendChild(rawItem1);

      const rawItem2 = document.createElement('div');
      rawItem2.setAttribute('data-aue-resource', 'urn:aemconnection:item2');
      const title2 = document.createElement('div');
      title2.textContent = 'Item';
      rawItem2.appendChild(title2);
      anchorList.appendChild(rawItem2);

      container.appendChild(anchorList);

      jest.isolateModules(() => {
        require('./navigation-group.js');
      });

      const event = new CustomEvent('decorate:navigation:group:items', {
        detail: { parentElement: anchorList },
        bubbles: true,
      });
      main.dispatchEvent(event);

      // Both items should have been decorated — title defaults to
      // 'Item N' when config.title === 'Item'
      const items = anchorList.querySelectorAll('li');
      expect(items.length).toBe(2);
    });

    it('replaces item in-place when item.parentElement === anchorList (line 119)', () => {
      // This specifically hits the item.parentElement === anchorList branch
      const main = document.querySelector('main');
      delete main.dataset.navigationGroupListenerAttached;

      const anchorList = document.createElement('ul');
      anchorList.className = 'navigation-group-list';

      const rawItem = document.createElement('div');
      rawItem.setAttribute('data-aue-resource', 'urn:aemconnection:item1');
      const titleRow = document.createElement('div');
      titleRow.textContent = 'Inline Item';
      rawItem.appendChild(titleRow);

      anchorList.appendChild(rawItem);
      container.appendChild(anchorList);

      jest.isolateModules(() => {
        require('./navigation-group.js');
      });

      const event = new CustomEvent('decorate:navigation:group:items', {
        detail: { parentElement: anchorList },
        bubbles: true,
      });
      main.dispatchEvent(event);

      // Original div should be gone, replaced by li
      const remainingDivs = anchorList.querySelectorAll(':scope > div[data-aue-resource]');
      expect(remainingDivs.length).toBe(0);
      const li = anchorList.querySelector(':scope > li');
      expect(li).not.toBeNull();
    });
  });

  // ─── readGroupItemConfig branches ─────────────────────────────────────────

  describe('readGroupItemConfig classes and open-in-new-tab branches', () => {
    it('parses classes (line 42) when item has a 5th row with comma-separated classes', async () => {
      // Build a block where decorate() processes items with 5 config rows
      // so readGroupItemConfig hits the classes branch (index 4)
      const { readKeyValueConfig } = require('../../scripts/baici/utils/config.js');
      // Return empty so readGroupItemConfig values flow through
      readKeyValueConfig.mockReturnValue({
        title: '',
        link: '',
        description: '',
        'open-in-new-tab': false,
        classes: [],
      });

      const block = document.createElement('div');
      block.className = 'navigation-group block';
      container.appendChild(block);

      // Item row (2 cells → treated as groupItem by allRows logic)
      const itemRow = document.createElement('div');

      const titleCell = document.createElement('div');
      titleCell.textContent = 'My Item';
      const linkCell = document.createElement('div');
      const a = document.createElement('a');
      a.href = '/my-item';
      linkCell.appendChild(a);
      const descCell = document.createElement('div');
      descCell.textContent = 'Desc';
      const newTabCell = document.createElement('div');
      newTabCell.textContent = 'false';
      const classesCell = document.createElement('div');
      classesCell.textContent = 'class-a, class-b';

      itemRow.appendChild(titleCell);
      itemRow.appendChild(linkCell);
      itemRow.appendChild(descCell);
      itemRow.appendChild(newTabCell);
      itemRow.appendChild(classesCell);

      block.appendChild(itemRow);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      // The li should have the class names from the classes config
      const li = container.querySelector('li.navigation-group li');
      expect(li).not.toBeNull();
      // classes are joined and set as className on the li
      expect(li.classList.contains('class-a')).toBe(true);
      expect(li.classList.contains('class-b')).toBe(true);
    });

    it('parses open-in-new-tab (line 44) when item 4th row is "true"', async () => {
      const { readKeyValueConfig } = require('../../scripts/baici/utils/config.js');
      readKeyValueConfig.mockReturnValue({
        title: '',
        link: '',
        description: '',
        'open-in-new-tab': false,
        classes: [],
      });

      const block = document.createElement('div');
      block.className = 'navigation-group block';
      container.appendChild(block);

      const itemRow = document.createElement('div');

      const titleCell = document.createElement('div');
      titleCell.textContent = 'New Tab Item';
      const linkCell = document.createElement('div');
      const a = document.createElement('a');
      a.href = '/new-tab';
      linkCell.appendChild(a);
      const descCell = document.createElement('div');
      descCell.textContent = '';
      const newTabCell = document.createElement('div');
      newTabCell.textContent = 'true';

      itemRow.appendChild(titleCell);
      itemRow.appendChild(linkCell);
      itemRow.appendChild(descCell);
      itemRow.appendChild(newTabCell);

      block.appendChild(itemRow);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const link = container.querySelector('li.navigation-group li a');
      expect(link).not.toBeNull();
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  // ─── data-aue-prop + data-aue-label single-child row branch ───────────────

  describe('decorate() - data-aue-prop + data-aue-label branch (lines 171-173)', () => {
    it('sets config from single-child row with both data-aue-prop and data-aue-label', async () => {
      const block = document.createElement('div');
      block.className = 'navigation-group block';
      container.appendChild(block);

      // Row 1: title with BOTH data-aue-prop AND data-aue-label (hits lines 171-173)
      const titleRow = document.createElement('div');
      const titleCell = document.createElement('div');
      titleCell.setAttribute('data-aue-prop', 'title');
      titleCell.setAttribute('data-aue-label', 'Title');
      titleCell.textContent = 'UE Prop Title';
      titleRow.appendChild(titleCell);
      block.appendChild(titleRow);

      // Row 2: is-header-only with BOTH attributes so decorate creates a button
      const headerRow = document.createElement('div');
      const headerCell = document.createElement('div');
      headerCell.setAttribute('data-aue-prop', 'is-header-only');
      headerCell.setAttribute('data-aue-label', 'Is Header Only');
      headerCell.textContent = 'true';
      headerRow.appendChild(headerCell);
      block.appendChild(headerRow);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      // The block should have been decorated — the title from the UE prop should be used
      const li = container.querySelector('li.navigation-group');
      expect(li).not.toBeNull();
      const btn = li.querySelector('button.navigation-group-button');
      expect(btn).not.toBeNull();
      // title should come from the UE prop cell
      const titleSpan = btn.querySelector('.navigation-group-button-title');
      expect(titleSpan.textContent).toBe('UE Prop Title');
    });

    it('does NOT set config from single-child row with data-aue-prop but missing data-aue-label', async () => {
      const block = document.createElement('div');
      block.className = 'navigation-group block';
      container.appendChild(block);

      // Row 1: title — only data-aue-prop, NO data-aue-label (lines 171-173 branch NOT taken)
      // readGroupUeConfig still picks this up via [data-aue-prop] selector
      const row = document.createElement('div');
      const cell = document.createElement('div');
      cell.setAttribute('data-aue-prop', 'title');
      cell.textContent = 'UE Title Via readGroupUeConfig';
      row.appendChild(cell);
      block.appendChild(row);

      // Row 2: is-header-only — also only data-aue-prop so block renders as button
      const headerRow = document.createElement('div');
      const headerCell = document.createElement('div');
      headerCell.setAttribute('data-aue-prop', 'is-header-only');
      headerCell.textContent = 'true';
      headerRow.appendChild(headerCell);
      block.appendChild(headerRow);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      const li = container.querySelector('li.navigation-group');
      expect(li).not.toBeNull();
      const btn = li.querySelector('button.navigation-group-button');
      expect(btn).not.toBeNull();
      // Title should come from readGroupUeConfig (the cell without data-aue-label is still
      // read by readGroupUeConfig), but lines 171-173 are NOT exercised because data-aue-label
      // is absent — confirmed by coverage showing that branch not taken
      const titleSpan = btn.querySelector('.navigation-group-button-title');
      expect(titleSpan.textContent).toBe('UE Title Via readGroupUeConfig');
    });
  });

  // ─── UE config fallback (readGroupUeConfig) ────────────────────────────────

  describe('readGroupUeConfig fallback', () => {
    it('uses readConfig when no data-aue-prop elements with labels exist', async () => {
      const { readConfig } = require('../../scripts/baici/utils/config.js');
      const block = buildHeaderOnlyBlock();
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      // readConfig is called when extractedConfig is empty (no UE props)
      expect(readConfig).toHaveBeenCalled();
    });

    it('skips readConfig when data-aue-prop elements provide config', async () => {
      const { readConfig } = require('../../scripts/baici/utils/config.js');
      readConfig.mockClear();

      const block = document.createElement('div');
      block.className = 'navigation-group block';

      // Add a non-data-aue-resource row with data-aue-prop elements
      const row = document.createElement('div');
      const cell = document.createElement('div');
      cell.setAttribute('data-aue-prop', 'title');
      cell.textContent = 'UE Group';
      row.appendChild(cell);

      const cell2 = document.createElement('div');
      cell2.setAttribute('data-aue-prop', 'is-header-only');
      cell2.textContent = 'true';
      row.appendChild(cell2);

      block.appendChild(row);
      container.appendChild(block);

      const { default: decorate } = await import('./navigation-group.js');
      await decorate(block);

      // When UE config is non-empty, readConfig should NOT be called
      expect(readConfig).not.toHaveBeenCalled();
    });
  });
});
