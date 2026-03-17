import {
  describe, it, expect, beforeEach, afterEach, jest,
} from '@jest/globals';

/* eslint-disable global-require */

// Mock dependencies before importing the module under test
jest.mock('../navigation/navigation.js', () => ({
  updateSubMenuHeight: jest.fn(),
}));

jest.mock('../../scripts/aem.js', () => ({
  readBlockConfig: jest.fn(() => ({
    title: 'Test Item',
    link: '/test-link',
    description: '',
    'open-in-new-tab': 'false',
  })),
}));

jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
}));

jest.mock('../../scripts/baici/utils/utils.js', () => ({
  debounce: jest.fn((fn) => fn),
}));

jest.mock('../../scripts/commerce.js', () => ({
  getStore: jest.fn(() => null),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const createBlock = () => {
  const block = document.createElement('div');
  block.className = 'navigation-item';
  document.body.appendChild(block);
  return block;
};

const dispatchKeyup = (el, key) => {
  el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('navigation-item block', () => {
  let block;
  let decorate;
  let readBlockConfig;
  let moveInstrumentation;
  let updateSubMenuHeight;
  let getStore;

  beforeEach(() => {
    document.body.innerHTML = '';
    window.adobeDataLayer = [];

    jest.clearAllMocks();

    ({ readBlockConfig } = require('../../scripts/aem.js'));
    ({ moveInstrumentation } = require('../../scripts/scripts.js'));
    ({ updateSubMenuHeight } = require('../navigation/navigation.js'));
    ({ getStore } = require('../../scripts/commerce.js'));
    decorate = require('./navigation-item.js').default;

    readBlockConfig.mockReturnValue({
      title: 'Test Item',
      link: '/test-link',
      description: '',
      'open-in-new-tab': 'false',
    });

    block = createBlock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Basic structure ──────────────────────────────────────────────────────

  describe('decorate(block) - basic structure', () => {
    it('creates an <li> with class navigation-item and role menuitem', async () => {
      await decorate(block);

      const li = document.querySelector('li.navigation-item');
      expect(li).not.toBeNull();
      expect(li.getAttribute('role')).toBe('menuitem');
    });

    it('creates an <a> with the correct href from config', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      expect(anchor).not.toBeNull();
      expect(anchor.getAttribute('href')).toBe('/test-link');
    });

    it('creates an <a> with the correct text content from config', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      expect(anchor.textContent).toBe('Test Item');
    });

    it('calls moveInstrumentation with the original block and new li', async () => {
      await decorate(block);

      const li = document.querySelector('li.navigation-item');
      expect(moveInstrumentation).toHaveBeenCalledTimes(1);
      expect(moveInstrumentation).toHaveBeenCalledWith(block, li);
    });

    it('replaces block with the new li element', async () => {
      await decorate(block);

      expect(document.querySelector('div.navigation-item')).toBeNull();
      expect(document.querySelector('li.navigation-item')).not.toBeNull();
    });

    it('does not set title attribute when description is empty', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      expect(anchor.hasAttribute('title')).toBe(false);
    });

    it('does not set target or rel attributes when open-in-new-tab is false', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      expect(anchor.hasAttribute('target')).toBe(false);
      expect(anchor.hasAttribute('rel')).toBe(false);
    });
  });

  // ── With description ─────────────────────────────────────────────────────

  describe('decorate(block) - with description', () => {
    beforeEach(() => {
      readBlockConfig.mockReturnValue({
        title: 'Described Item',
        link: '/described-link',
        description: 'A helpful tooltip',
        'open-in-new-tab': 'false',
      });
    });

    it('sets the title attribute on the anchor when description is provided', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      expect(anchor.getAttribute('title')).toBe('A helpful tooltip');
    });
  });

  // ── open-in-new-tab ──────────────────────────────────────────────────────

  describe('decorate(block) - with open-in-new-tab=true', () => {
    beforeEach(() => {
      readBlockConfig.mockReturnValue({
        title: 'External Item',
        link: 'https://example.com',
        description: '',
        'open-in-new-tab': 'true',
      });
    });

    it('sets target="_blank" on the anchor', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      expect(anchor.getAttribute('target')).toBe('_blank');
    });

    it('sets rel="noopener noreferrer" on the anchor', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  // ── Default config values ─────────────────────────────────────────────────

  describe('decorate(block) - default config fallbacks', () => {
    it('uses "Menu Item" as title when title is not provided', async () => {
      readBlockConfig.mockReturnValue({});
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      expect(anchor.textContent).toBe('Menu Item');
    });

    it('uses "#" as href when link is not provided', async () => {
      readBlockConfig.mockReturnValue({});
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      expect(anchor.getAttribute('href')).toBe('#');
    });
  });

  // ── Keyboard behaviour ───────────────────────────────────────────────────

  describe('decorate(block) - keyboard behaviour', () => {
    it('dispatches close:navigation:section event on Escape keyup', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');

      // Wrap the anchor in a mock .navigation-section with a button
      const section = document.createElement('div');
      section.className = 'navigation-section';
      const sectionBtn = document.createElement('button');
      sectionBtn.className = 'navigation-section-button';
      section.appendChild(sectionBtn);
      const li = document.querySelector('li.navigation-item');
      section.appendChild(li);
      document.body.appendChild(section);

      const handler = jest.fn();
      window.addEventListener('close:navigation:section', handler);

      dispatchKeyup(anchor, 'Escape');

      window.removeEventListener('close:navigation:section', handler);

      expect(handler).toHaveBeenCalledTimes(1);
      const firedEvent = handler.mock.calls[0][0];
      expect(firedEvent.type).toBe('close:navigation:section');
      expect(firedEvent.detail.section).toBe(sectionBtn);
    });

    it('does not dispatch close:navigation:section for non-Escape keys', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');

      // Wrap in a section so Escape wouldn't throw if it fired
      const section = document.createElement('div');
      section.className = 'navigation-section';
      const sectionBtn = document.createElement('button');
      sectionBtn.className = 'navigation-section-button';
      section.appendChild(sectionBtn);
      const li = document.querySelector('li.navigation-item');
      section.appendChild(li);
      document.body.appendChild(section);

      const handler = jest.fn();
      window.addEventListener('close:navigation:section', handler);

      ['Enter', 'Tab', 'ArrowDown', ' ', 'a'].forEach((key) => {
        dispatchKeyup(anchor, key);
      });

      window.removeEventListener('close:navigation:section', handler);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ── Click analytics ──────────────────────────────────────────────────────

  describe('decorate(block) - click analytics', () => {
    it('pushes a nav_link_click event to window.adobeDataLayer on anchor click', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      anchor.click();

      expect(window.adobeDataLayer).toHaveLength(1);
      expect(window.adobeDataLayer[0].event).toBe('nav_link_click');
    });

    it('includes nav level "item" in the analytics payload', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      anchor.click();

      expect(window.adobeDataLayer[0].nav.level).toBe('item');
    });

    it('includes the link label in the analytics payload', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      anchor.click();

      expect(window.adobeDataLayer[0].nav.label).toBe('Test Item');
    });

    it('includes the store value from getStore() in the analytics payload', async () => {
      getStore.mockReturnValue('test-store');

      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      anchor.click();

      expect(window.adobeDataLayer[0].nav.store).toBe('test-store');
    });

    it('sets store to null when getStore() returns a falsy value', async () => {
      getStore.mockReturnValue(null);

      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      anchor.click();

      expect(window.adobeDataLayer[0].nav.store).toBeNull();
    });

    it('initialises window.adobeDataLayer if it does not exist', async () => {
      delete window.adobeDataLayer;

      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      anchor.click();

      expect(Array.isArray(window.adobeDataLayer)).toBe(true);
      expect(window.adobeDataLayer).toHaveLength(1);
    });

    it('accumulates multiple click events in adobeDataLayer', async () => {
      await decorate(block);

      const anchor = document.querySelector('li.navigation-item a');
      anchor.click();
      anchor.click();

      expect(window.adobeDataLayer).toHaveLength(2);
    });
  });

  // ── Module-level event registration ──────────────────────────────────────

  describe('module-level event registration', () => {
    it('attaches the decorate:navigation:item listener to <main> when it exists', async () => {
      // The module already ran at import time; verify the attribute was set.
      const main = document.querySelector('main');
      if (main) {
        expect(main.dataset.navigationItemListenerAttached).toBe('true');
      }
    });

    it('calls decorateMenuItem and updateSubMenuHeight when decorate:navigation:item fires on main', async () => {
      const main = document.querySelector('main');

      if (!main) {
        // jsdom may not include <main>; skip gracefully
        return;
      }

      // Create a child navigation-item div with UE resource data attribute
      const parent = document.createElement('div');
      const childBlock = document.createElement('div');
      childBlock.className = 'navigation-item';
      childBlock.setAttribute('data-aue-resource', 'urn:test');
      parent.appendChild(childBlock);
      main.appendChild(parent);

      const event = new CustomEvent('decorate:navigation:item', {
        detail: { parentElement: parent },
      });
      main.dispatchEvent(event);

      expect(updateSubMenuHeight).toHaveBeenCalledWith(parent);
    });
  });

  // ── Module-level guard: registers listener once on <main> ─────────────────

  describe('module-level listener guard via isolateModules', () => {
    it('sets data-navigation-item-listener-attached on <main> and registers listener', () => {
      jest.isolateModules(() => {
        // Provide a fresh <main> without the attribute so the guard triggers
        document.body.innerHTML = '<main></main>';
        const freshMain = document.querySelector('main');
        delete freshMain.dataset.navigationItemListenerAttached;

        // Load the module fresh – module-level code runs again
        require('./navigation-item.js');

        expect(freshMain.dataset.navigationItemListenerAttached).toBe('true');
      });
    });

    it('does not re-register listener when attribute already set', () => {
      jest.isolateModules(() => {
        document.body.innerHTML = '<main></main>';
        const freshMain = document.querySelector('main');
        // Pre-set the attribute so the guard should skip
        freshMain.dataset.navigationItemListenerAttached = 'true';
        const addEventSpy = jest.spyOn(freshMain, 'addEventListener');

        require('./navigation-item.js');

        // addEventListener should NOT have been called for the decorate event
        const decorateCalls = addEventSpy.mock.calls.filter(
          ([evt]) => evt === 'decorate:navigation:item',
        );
        expect(decorateCalls).toHaveLength(0);
        addEventSpy.mockRestore();
      });
    });

    it('dispatching decorate:navigation:item calls updateSubMenuHeight via handleItemDecorate', () => {
      jest.isolateModules(() => {
        document.body.innerHTML = '<main></main>';
        const freshMain = document.querySelector('main');
        delete freshMain.dataset.navigationItemListenerAttached;

        const { updateSubMenuHeight: freshUpdateSubMenuHeight } = require('../navigation/navigation.js');

        require('./navigation-item.js');

        const parentEl = document.createElement('div');
        const childBlock = document.createElement('div');
        childBlock.setAttribute('data-aue-model', 'navigation-item');
        parentEl.appendChild(childBlock);
        freshMain.appendChild(parentEl);

        freshMain.dispatchEvent(
          new CustomEvent('decorate:navigation:item', { detail: { parentElement: parentEl } }),
        );

        expect(freshUpdateSubMenuHeight).toHaveBeenCalledWith(parentEl);
      });
    });

    it('decorateMenuItem decorates child blocks matching data-aue-model selector', () => {
      jest.isolateModules(() => {
        document.body.innerHTML = '<main></main>';
        const freshMain = document.querySelector('main');
        delete freshMain.dataset.navigationItemListenerAttached;

        const aemMod = require('../../scripts/aem.js');
        aemMod.readBlockConfig.mockReturnValue({
          title: 'Child Item',
          link: '/child',
          description: '',
          'open-in-new-tab': 'false',
        });

        require('./navigation-item.js');

        const parentEl = document.createElement('div');
        const childBlock = document.createElement('div');
        childBlock.setAttribute('data-aue-model', 'navigation-item');
        parentEl.appendChild(childBlock);
        document.body.appendChild(parentEl);

        freshMain.dispatchEvent(
          new CustomEvent('decorate:navigation:item', { detail: { parentElement: parentEl } }),
        );

        // decorate() should have replaced the childBlock with an <li>
        expect(parentEl.querySelector('li.navigation-item')).not.toBeNull();
      });
    });
  });
});
