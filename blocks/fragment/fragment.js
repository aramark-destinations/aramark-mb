/**
 * Fragment Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core fragment loading functionality
 * - Loads and includes content from other pages as fragments
 */

import {
  decorateMain,
  moveInstrumentation,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

// TODO: Add fragment caching
// Currently every loadFragment() call makes a fresh fetch(), so repeated loads
// of the same path result in redundant network requests.
// Future fix: cache a Promise<string> (raw HTML text) keyed by path in a
// module-level Map, e.g.:
//   const fragmentCache = new Map();
//   if (!fragmentCache.has(path)) fragmentCache.set(path, fetch(...).then(r => r.text()));
//   const html = await fragmentCache.get(path);
// Do NOT cache the DOM element — callers mutate it via replaceWith(),
// which would corrupt a shared cached reference.

/**
 * Loads a fragment from a given path
 * @param {string} path The path to the fragment
 * @returns {Promise<HTMLElement|null>} The root element of the fragment or null
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment base
      const resetAttribute = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttribute('img', 'src');
      resetAttribute('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

/**
 * Decorates the fragment block
 * @param {Element} block The fragment block element
 * @param {Object} options Configuration options
 * @param {Function} options.onBefore Lifecycle hook called before decoration
 * @param {Function} options.onAfter Lifecycle hook called after decoration
 * @returns {Promise<void>}
 */
export async function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('fragment:before', { detail: ctx }));

  // === FRAGMENT BLOCK LOGIC ===
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      moveInstrumentation(block, block.parentElement);
      block.closest('.fragment').replaceWith(...fragment.childNodes);
    }
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('fragment:after', { detail: ctx }));
}

/**
 * Default export
 * Allows the base implementation to be used directly or with hooks
 */
export default decorate;
