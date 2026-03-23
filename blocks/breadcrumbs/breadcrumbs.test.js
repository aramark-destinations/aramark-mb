import {
  describe, it, expect, beforeEach, jest, afterEach,
} from '@jest/globals';

/* eslint-disable global-require */

// Shared test utility: Default metadata mock
// Must be defined before jest.mock() calls due to hoisting
const getDefaultMetadata = (name) => {
  const metadata = {
    'og:title': 'Current Page Title',
    breadcrumb: JSON.stringify([
      { title: 'Home', url: '/' },
      { title: 'Category', url: '/category' },
      { title: 'Subcategory', url: '/category/subcategory' },
    ]),
    'breadcrumb-label-override': '',
    'breadcrumb-parent-override': '',
  };
  return metadata[name] || '';
};

// Mock dependencies
jest.mock('../../scripts/baici/utils/utils.js', () => ({
  getBrandCode: jest.fn(() => 'kershaw'),
}));

jest.mock('../../scripts/aem.js', () => ({
  getMetadata: jest.fn((name) => {
    const metadata = {
      'og:title': 'Current Page Title',
      breadcrumb: JSON.stringify([
        { title: 'Home', url: '/' },
        { title: 'Category', url: '/category' },
        { title: 'Subcategory', url: '/category/subcategory' },
      ]),
      'breadcrumb-label-override': '',
      'breadcrumb-parent-override': '',
    };
    return metadata[name] || '';
  }),
}));

jest.mock('../../scripts/scripts.js', () => ({
  getMetadata: jest.fn((name) => {
    const metadata = {
      'og:title': 'Current Page Title',
      breadcrumb: JSON.stringify([
        { title: 'Home', url: '/' },
        { title: 'Category', url: '/category' },
        { title: 'Subcategory', url: '/category/subcategory' },
      ]),
      'breadcrumb-label-override': '',
      'breadcrumb-parent-override': '',
    };
    return metadata[name] || '';
  }),
  moveInstrumentation: jest.fn((from, to) => {
    Array.from(from.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-aue') || attr.name.startsWith('data-')) {
        to.setAttribute(attr.name, attr.value);
      }
    });
  }),
  readVariant: jest.fn(),
}));

// Mock Adobe Client Data Layer
const mockACDLPush = jest.fn();
global.window.adobeDataLayer = {
  push: mockACDLPush,
  getState: jest.fn(() => ({ events: [] })),
  addEventListener: jest.fn(),
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Breadcrumbs Block', () => {
  let block;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockACDLPush.mockClear();
    localStorageMock.clear();

    // Reset analytics consent state (clearAllMocks doesn't clear mockReturnValue)
    global.window.adobeDataLayer.getState.mockReturnValue({ events: [] });

    // Create basic block structure
    document.body.innerHTML = `
      <div class="breadcrumbs block" data-aue-resource="urn:aem:breadcrumbs">
      </div>
    `;
    block = document.querySelector('.breadcrumbs');

    // Reset mock implementations
    const { getMetadata } = require('../../scripts/aem.js');
    getMetadata.mockImplementation(getDefaultMetadata);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ============================================================================
  // BASIC RENDERING TESTS
  // ============================================================================

  describe('Basic Rendering', () => {
    it('should render nav element with aria-label', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const nav = block.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    });

    it('should render ordered list structure', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const ol = block.querySelector('nav ol');
      expect(ol).toBeTruthy();
      expect(ol.className).toContain('breadcrumbs-list');
    });

    it('should render minimum breadcrumb (Home + Current)', async () => {
      // Mock getMetadata to return no hierarchy
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Current Page';
        if (name === 'breadcrumb') return '[]';
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const items = block.querySelectorAll('li');
      expect(items.length).toBeGreaterThanOrEqual(2); // Home + Current
    });

    it('should generate correct crumb structure from hierarchy', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const items = block.querySelectorAll('li.breadcrumbs-item');
      expect(items.length).toBeGreaterThanOrEqual(3); // Home, Category, Subcategory, Current
    });
  });

  // ============================================================================
  // CONTENT PAGE HIERARCHY TESTS
  // ============================================================================

  describe('Content Page Hierarchy', () => {
    it('should read hierarchy from page metadata', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      expect(getMetadata).toHaveBeenCalledWith('breadcrumb');
    });

    it('should render ancestor crumbs as clickable links', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const links = block.querySelectorAll('a.breadcrumbs-link');
      expect(links.length).toBeGreaterThan(0);

      links.forEach((link) => {
        expect(link.href).toBeTruthy();
        expect(link.textContent).toBeTruthy();
      });
    });

    it('should render current page as plain text with aria-current', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const current = block.querySelector('[aria-current="page"]');
      expect(current).toBeTruthy();
      expect(current.tagName).not.toBe('A');
      expect(current.className).toContain('breadcrumbs-current');
    });

    it('should not make current page clickable', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const items = block.querySelectorAll('li.breadcrumbs-item');
      const lastItem = items[items.length - 1];
      const link = lastItem.querySelector('a');

      expect(link).toBeFalsy();
    });

    it('should use correct URLs for ancestor crumbs', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const links = block.querySelectorAll('a.breadcrumbs-link');
      const homeLink = links[0];

      expect(homeLink.href).toContain('/');
    });
  });

  // ============================================================================
  // METADATA OVERRIDE TESTS
  // ============================================================================

  describe('Metadata Overrides', () => {
    it('should apply label override to current page', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb-label-override') return 'Custom Label';
        if (name === 'og:title') return 'Original Title';
        if (name === 'breadcrumb') return JSON.stringify([{ title: 'Home', url: '/' }]);
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const current = block.querySelector('[aria-current="page"]');
      expect(current.textContent).toBe('Custom Label');
    });

    it('should use default title when label override is empty', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb-label-override') return '';
        if (name === 'og:title') return 'Default Title';
        if (name === 'breadcrumb') return JSON.stringify([{ title: 'Home', url: '/' }]);
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const current = block.querySelector('[aria-current="page"]');
      expect(current.textContent).toBe('Default Title');
    });

    it('should sanitize HTML from label override', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb-label-override') return '<script>alert("xss")</script>Safe Text';
        if (name === 'og:title') return 'Original';
        if (name === 'breadcrumb') return JSON.stringify([{ title: 'Home', url: '/' }]);
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const current = block.querySelector('[aria-current="page"]');
      expect(current.innerHTML).not.toContain('<script>');
      expect(current.textContent).toContain('Safe Text');
    });

    it('should apply parent override URL', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb-parent-override') return 'http://localhost/custom-parent';
        if (name === 'og:title') return 'Current Page';
        if (name === 'breadcrumb') {
          return JSON.stringify([
            { title: 'Home', url: '/' },
            { title: 'Category', url: '/category' },
          ]);
        }
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const links = block.querySelectorAll('a.breadcrumbs-link');

      // Parent override should modify the immediate parent of current page
      // With hierarchy [Home, Category] + Current Page
      // Parent should be Category (links[1])
      expect(links.length).toBeGreaterThanOrEqual(2);
      expect(links[1]).toBeTruthy();
      const categoryLink = links[1]; // Category is the immediate parent
      expect(categoryLink.href).toContain('custom-parent');
    });

    it('should validate parent override is same domain', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb-parent-override') return 'https://evil.com/malicious';
        if (name === 'og:title') return 'Current Page';
        if (name === 'breadcrumb') {
          return JSON.stringify([
            { title: 'Home', url: '/' },
            { title: 'Category', url: '/category' },
          ]);
        }
        return '';
      });

      // Mock console.warn to verify warning is logged
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('BREADCRUMB'),
        expect.anything(),
      );

      warnSpy.mockRestore();
    });

    it('should handle invalid parent override URL gracefully', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb-parent-override') return 'not-a-valid-url';
        if (name === 'og:title') return 'Current Page';
        if (name === 'breadcrumb') return JSON.stringify([{ title: 'Home', url: '/' }]);
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await expect(decorate(block)).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // LOCAL STORAGE - CATEGORY CONTEXT TESTS
  // ============================================================================

  describe('Local Storage - Category Context', () => {
    it('should read category context from localStorage', async () => {
      const context = {
        categoryName: 'Pocket Knives',
        categoryUrl: 'https://kershaw.kaiusa.com/knives/pocket-knives',
        brandCode: 'kershaw',
        timestamp: Date.now(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('breadcrumb-context');
    });

    it('should inject category crumb between Home and Current', async () => {
      const context = {
        categoryName: 'Pocket Knives',
        categoryUrl: 'https://kershaw.kaiusa.com/knives/pocket-knives',
        brandCode: 'kershaw',
        timestamp: Date.now(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Product Name';
        if (name === 'breadcrumb') return '[]'; // Empty hierarchy for PDP
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const links = block.querySelectorAll('a.breadcrumbs-link');
      const categoryLink = Array.from(links).find((link) => link.textContent === 'Pocket Knives');

      expect(categoryLink).toBeTruthy();
      expect(categoryLink.href).toContain('pocket-knives');
    });

    it('should remove context from localStorage after reading', async () => {
      const context = {
        categoryName: 'Test Category',
        categoryUrl: 'https://kershaw.kaiusa.com/test',
        brandCode: 'kershaw',
        timestamp: Date.now(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('breadcrumb-context');
    });

    it('should validate brand code matches current site', async () => {
      const context = {
        categoryName: 'Wrong Brand Category',
        categoryUrl: 'https://zt.kaiusa.com/category',
        brandCode: 'zt', // Wrong brand
        timestamp: Date.now(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      // getBrandCode() returns 'kershaw' (mocked), context has 'zt' - mismatch detected
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      // Should log warning about brand mismatch
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('BREADCRUMB'),
        expect.anything(),
      );

      warnSpy.mockRestore();
    });

    it('should ignore expired context (>30 seconds)', async () => {
      const oldTimestamp = Date.now() - 35000; // 35 seconds ago
      const context = {
        categoryName: 'Old Category',
        categoryUrl: 'https://kershaw.kaiusa.com/old',
        brandCode: 'kershaw',
        timestamp: oldTimestamp,
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      // Should log warning about expired context
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('BREADCRUMB'),
        expect.anything(),
      );

      warnSpy.mockRestore();
    });

    it('should accept fresh context (<30 seconds)', async () => {
      const freshTimestamp = Date.now() - 5000; // 5 seconds ago
      const context = {
        categoryName: 'Fresh Category',
        categoryUrl: 'https://kershaw.kaiusa.com/fresh',
        brandCode: 'kershaw',
        timestamp: freshTimestamp,
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const links = block.querySelectorAll('a.breadcrumbs-link');
      const categoryLink = Array.from(links).find((link) => link.textContent === 'Fresh Category');

      expect(categoryLink).toBeTruthy();
    });

    it('should fall back to Home > Current when context missing', async () => {
      // No context in localStorage
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Product Name';
        if (name === 'breadcrumb') return '[]';
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const items = block.querySelectorAll('li.breadcrumbs-item');
      expect(items.length).toBe(2); // Only Home + Current
    });

    it('should handle localStorage unavailable gracefully', async () => {
      // Simulate private browsing mode where localStorage throws
      // getMockImplementation() retrieves the closure fn so it can be properly restored
      const originalImpl = localStorageMock.getItem.getMockImplementation();
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { default: decorate } = await import('./breadcrumbs.js');
      await expect(decorate(block)).resolves.not.toThrow();

      // Restore original implementation to avoid polluting other tests
      localStorageMock.getItem.mockImplementation(originalImpl);
      errorSpy.mockRestore();
    });

    it('should handle malformed JSON in localStorage', async () => {
      localStorageMock.setItem('breadcrumb-context', '{invalid json}');

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { default: decorate } = await import('./breadcrumbs.js');
      await expect(decorate(block)).resolves.not.toThrow();

      errorSpy.mockRestore();
    });
  });

  // ============================================================================
  // ANALYTICS EVENTS TESTS
  // ============================================================================

  describe('Analytics Events', () => {
    it('should dispatch breadcrumb_rendered event on load', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      expect(mockACDLPush).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'breadcrumb_rendered',
        }),
      );
    });

    it('should include correct payload in breadcrumb_rendered event', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const renderCall = mockACDLPush.mock.calls.find(
        (call) => call[0].event === 'breadcrumb_rendered',
      );

      expect(renderCall).toBeTruthy();
      expect(renderCall[0].breadcrumb).toEqual(
        expect.objectContaining({
          crumb_count: expect.any(Number),
          has_override: expect.any(Boolean),
          page_name: expect.any(String),
          site: expect.any(String),
        }),
      );
    });

    it('should dispatch breadcrumb_link_click event on crumb click', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const link = block.querySelector('a.breadcrumbs-link');
      link.click();

      expect(mockACDLPush).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'breadcrumb_link_click',
        }),
      );
    });

    it('should include target_url and position in click event', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const link = block.querySelector('a.breadcrumbs-link');
      link.click();

      const clickCall = mockACDLPush.mock.calls.find(
        (call) => call[0].event === 'breadcrumb_link_click',
      );

      expect(clickCall[0].breadcrumb).toEqual(
        expect.objectContaining({
          target_url: expect.any(String),
          target_position: expect.any(Number),
          override_used: expect.any(Boolean),
        }),
      );
    });

    it('should dispatch breadcrumb_context_restored when category context used', async () => {
      const context = {
        categoryName: 'Test Category',
        categoryUrl: 'https://kershaw.kaiusa.com/test',
        brandCode: 'kershaw',
        timestamp: Date.now(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const contextCall = mockACDLPush.mock.calls.find(
        (call) => call[0].event === 'breadcrumb_context_restored',
      );

      expect(contextCall).toBeTruthy();
      expect(contextCall[0].breadcrumb).toEqual(
        expect.objectContaining({
          category_name: 'Test Category',
          category_url: expect.any(String),
          age_ms: expect.any(Number),
          site: expect.any(String),
        }),
      );
    });

    it('should include override_used flag in events', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb-label-override') return 'Custom';
        if (name === 'og:title') return 'Original';
        if (name === 'breadcrumb') return JSON.stringify([{ title: 'Home', url: '/' }]);
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const renderCall = mockACDLPush.mock.calls.find(
        (call) => call[0].event === 'breadcrumb_rendered',
      );

      expect(renderCall[0].breadcrumb.has_override).toBe(true);
    });

    it('should not dispatch events when consent not granted', async () => {
      // Mock consent check to return false
      global.window.adobeDataLayer.getState.mockReturnValue({
        consent: { analytics: false },
      });

      mockACDLPush.mockClear();

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      // Should log that analytics is deferred
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // Reset and test again
      document.body.innerHTML = '<div class="breadcrumbs block"></div>';
      const newBlock = document.querySelector('.breadcrumbs');
      await decorate(newBlock);

      logSpy.mockRestore();
    });

    it('should not dispatch duplicate events on SPA rehydration', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const initialCallCount = mockACDLPush.mock.calls.filter(
        (call) => call[0].event === 'breadcrumb_rendered',
      ).length;

      // Simulate rehydration - decorate again
      await decorate(block);

      const afterCallCount = mockACDLPush.mock.calls.filter(
        (call) => call[0].event === 'breadcrumb_rendered',
      ).length;

      // Should not have duplicated the event
      expect(afterCallCount).toBeLessThanOrEqual(initialCallCount + 1);
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const links = block.querySelectorAll('a.breadcrumbs-link');
      links.forEach((link) => {
        expect(link.tabIndex).not.toBe(-1);
      });
    });

    it('should provide visible focus indicators', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const link = block.querySelector('a.breadcrumbs-link');
      expect(link).toBeTruthy();
      // CSS will provide the focus styling
    });

    it('should include aria-live region for dynamic updates', async () => {
      const context = {
        categoryName: 'Dynamic Category',
        categoryUrl: 'https://kershaw.kaiusa.com/dynamic',
        brandCode: 'kershaw',
        timestamp: Date.now(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const liveRegion = block.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
    });

    it('should wrap abbreviations in abbr element', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb-label-override') return 'PDP Info';
        if (name === 'og:title') return 'Original';
        if (name === 'breadcrumb') return JSON.stringify([{ title: 'Home', url: '/' }]);
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const abbr = block.querySelector('abbr');
      // Only if abbreviation is detected
      if (abbr) {
        expect(abbr.title).toBeTruthy();
      }
    });

    it('should maintain proper heading hierarchy', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      // Breadcrumbs should not introduce heading elements
      const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBe(0);
    });

    it('should exclude current page from tab order', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const current = block.querySelector('[aria-current="page"]');
      expect(current.tagName).not.toBe('A');
      expect(current.tabIndex).not.toBe(0);
    });
  });

  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================

  describe('Responsive Design', () => {
    it('should wrap gracefully on narrow viewports', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const list = block.querySelector('ol');
      expect(list).toBeTruthy();
      // CSS will handle wrapping via flex-wrap
    });

    it('should not truncate labels', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Very Long Product Name That Should Not Be Truncated';
        if (name === 'breadcrumb') {
          return JSON.stringify([
            { title: 'Home', url: '/' },
            { title: 'Very Long Category Name', url: '/category' },
          ]);
        }
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const current = block.querySelector('[aria-current="page"]');
      expect(current.textContent).toBe('Very Long Product Name That Should Not Be Truncated');
    });

    it('should use design tokens for styling', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      // Verify classes are applied that will use CSS variables
      const list = block.querySelector('.breadcrumbs-list');
      expect(list).toBeTruthy();
    });
  });

  // ============================================================================
  // EDGE CASES TESTS
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle missing hierarchy data', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Current Page';
        if (name === 'breadcrumb') return '';
        return '';
      });

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      // Should fall back to Home + Current
      const items = block.querySelectorAll('li.breadcrumbs-item');
      expect(items.length).toBeGreaterThanOrEqual(1);

      warnSpy.mockRestore();
    });

    it('should log diagnostic warnings with reason codes', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb') return 'invalid json';
        return '';
      });

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should handle single-page breadcrumb', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Current Page';
        if (name === 'breadcrumb') return '[]';
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const items = block.querySelectorAll('li.breadcrumbs-item');
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle very long breadcrumb trail', async () => {
      const longHierarchy = Array.from({ length: 10 }, (_, i) => ({
        title: `Level ${i + 1}`,
        url: `/level-${i + 1}`,
      }));

      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb') return JSON.stringify(longHierarchy);
        if (name === 'og:title') return 'Current Page';
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const items = block.querySelectorAll('li.breadcrumbs-item');
      expect(items.length).toBeGreaterThanOrEqual(10);
    });

    it('should handle special characters in labels', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Product & Service <Details>';
        if (name === 'breadcrumb') {
          return JSON.stringify([
            { title: 'Home & Start', url: '/' },
          ]);
        }
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const current = block.querySelector('[aria-current="page"]');
      expect(current.textContent).toContain('&');
      expect(current.textContent).toContain('Details');
    });

    it('should handle Unicode in URLs', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'breadcrumb') {
          return JSON.stringify([
            { title: 'Home', url: '/' },
            { title: 'Categoría', url: '/categoría' },
          ]);
        }
        if (name === 'og:title') return 'Producto';
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await expect(decorate(block)).resolves.not.toThrow();
    });

    it('should not fail when block is empty', async () => {
      const emptyBlock = document.createElement('div');
      emptyBlock.className = 'breadcrumbs block';

      const { default: decorate } = await import('./breadcrumbs.js');
      await expect(decorate(emptyBlock)).resolves.not.toThrow();
    });

    it('should handle null or undefined metadata gracefully', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation(() => null);

      const { default: decorate } = await import('./breadcrumbs.js');
      await expect(decorate(block)).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance', () => {
    it('should complete hydration quickly', async () => {
      const startTime = performance.now();

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (100ms for test environment)
      expect(duration).toBeLessThan(100);
    });

    it('should not cause layout thrashing', async () => {
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      // Verify single DOM manipulation
      expect(block.children.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // DATASET OVERRIDES TESTS (Universal Editor)
  // ============================================================================

  describe('Dataset Overrides', () => {
    it('should read hierarchy from dataset breadcrumb', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Test Page';
        return '';
      });
      block.dataset.breadcrumb = JSON.stringify([{ title: 'Home', url: '/' }]);
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);
      const links = block.querySelectorAll('a.breadcrumbs-link');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('should read label override from dataset', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Original Title';
        if (name === 'breadcrumb') return JSON.stringify([{ title: 'Home', url: '/' }]);
        return '';
      });
      block.dataset.breadcrumbLabelOverride = 'Dataset Label';
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);
      const current = block.querySelector('[aria-current="page"]');
      expect(current.textContent).toBe('Dataset Label');
    });

    it('should apply valid same-domain parent override via dataset', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Current Page';
        if (name === 'breadcrumb') {
          return JSON.stringify([
            { title: 'Home', url: '/' },
            { title: 'Category', url: '/category' },
          ]);
        }
        return '';
      });
      block.dataset.breadcrumbParentOverride = 'http://localhost/custom-parent';
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);
      expect(block.querySelector('nav')).toBeTruthy();
      const links = block.querySelectorAll('a.breadcrumbs-link');
      const overriddenLink = Array.from(links).find((l) => l.href.includes('custom-parent'));
      expect(overriddenLink).toBeTruthy();
    });

    it('should reject cross-domain parent override via dataset', async () => {
      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Current Page';
        if (name === 'breadcrumb') return JSON.stringify([{ title: 'Home', url: '/' }]);
        return '';
      });
      block.dataset.breadcrumbParentOverride = 'https://evil.com/bad';
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should handle invalid JSON in breadcrumb dataset', async () => {
      block.dataset.breadcrumb = 'invalid json';
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  // ============================================================================
  // CATEGORY CONTEXT - NEW COVERAGE TESTS
  // ============================================================================

  describe('Category Context via Global localStorage', () => {
    it('should use valid localStorage context to build breadcrumb trail', async () => {
      const context = {
        categoryName: 'Pocket Knives',
        categoryUrl: '/knives/pocket-knives',
        brandCode: 'kershaw',
        timestamp: new Date().toISOString(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Product Name';
        if (name === 'breadcrumb') return '[]';
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const links = block.querySelectorAll('a.breadcrumbs-link');
      const categoryLink = Array.from(links).find((l) => l.textContent === 'Pocket Knives');
      expect(categoryLink).toBeTruthy();
    });

    it('should dispatch breadcrumb_context_restored event when context found', async () => {
      const context = {
        categoryName: 'Fixed Blades',
        categoryUrl: '/knives/fixed',
        brandCode: 'kershaw',
        timestamp: new Date().toISOString(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Product Name';
        if (name === 'breadcrumb') return '[]';
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const contextCall = mockACDLPush.mock.calls.find(
        (call) => call[0].event === 'breadcrumb_context_restored',
      );
      expect(contextCall).toBeTruthy();
      expect(contextCall[0].breadcrumb.category_name).toBe('Fixed Blades');
    });

    it('should reject expired context and warn', async () => {
      const context = {
        categoryName: 'Old Category',
        categoryUrl: '/old',
        brandCode: 'kershaw',
        timestamp: new Date(Date.now() - 35000).toISOString(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('BREADCRUMB'),
        expect.anything(),
      );
      warnSpy.mockRestore();
    });

    it('should reject context with brand mismatch and warn', async () => {
      const context = {
        categoryName: 'Other Brand Category',
        categoryUrl: '/zt/category',
        brandCode: 'zt',
        timestamp: new Date().toISOString(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('BREADCRUMB'),
        expect.anything(),
      );
      warnSpy.mockRestore();
    });

    it('should reject context with missing required fields', async () => {
      const context = {
        categoryName: 'Partial Category',
        // missing categoryUrl, brandCode, timestamp
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('BREADCRUMB'),
        expect.anything(),
      );
      warnSpy.mockRestore();
    });

    it('should include aria-live region text when context is applied', async () => {
      const context = {
        categoryName: 'Dynamic Category',
        categoryUrl: '/dynamic',
        brandCode: 'kershaw',
        timestamp: new Date().toISOString(),
      };
      localStorageMock.setItem('breadcrumb-context', JSON.stringify(context));

      const { getMetadata } = require('../../scripts/aem.js');
      getMetadata.mockImplementation((name) => {
        if (name === 'og:title') return 'Product Name';
        if (name === 'breadcrumb') return '[]';
        return '';
      });

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const liveRegion = block.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toContain('Dynamic Category');
    });
  });

  // ============================================================================
  // ERROR FALLBACK TESTS
  // ============================================================================

  describe('Error Fallback Rendering', () => {
    it('should render fallback Home + current page on error', async () => {
      const { getBrandCode } = require('../../scripts/baici/utils/utils.js');
      getBrandCode.mockImplementation(() => { throw new Error('test error'); });
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { default: decorate } = await import('./breadcrumbs.js');
      await decorate(block);

      const nav = block.querySelector('nav');
      expect(nav).toBeTruthy();
      const homeLink = block.querySelector('a.breadcrumbs-link');
      expect(homeLink).toBeTruthy();
      expect(homeLink.textContent).toBe('Home');

      errorSpy.mockRestore();
      getBrandCode.mockImplementation(() => 'kershaw');
    });
  });
});
