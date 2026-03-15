/**
 * Banner Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Rotating announcement bar with optional auto-rotation
 * - Dismiss with sessionStorage persistence
 */

import { readVariant } from '../../scripts/scripts.js';

/**
 * Decorates the banner block
 * @param {Element} block The banner block element
 * @param {Object} options Configuration options
 * @param {Function} options.onBefore Lifecycle hook called before decoration
 * @param {Function} options.onAfter Lifecycle hook called after decoration
 * @returns {Promise<void>}
 */
export async function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('banner:before', { detail: ctx }));

  // === BANNER BLOCK LOGIC ===
  readVariant(block);

  // Dismiss persistence keyed to page path
  const storageKey = `banner-dismissed:${window.location.pathname}`;
  if (sessionStorage.getItem(storageKey)) {
    block.closest('.section')?.remove();
    options.onAfter?.(ctx);
    block.dispatchEvent(new CustomEvent('banner:after', { detail: ctx }));
    return;
  }

  const rows = [...block.children];
  if (!rows.length) return;

  // Wrap rows into slides
  const slidesEl = document.createElement('div');
  slidesEl.className = 'banner-slides';
  rows.forEach((row, i) => {
    row.classList.add('banner-slide');
    if (i === 0) row.classList.add('banner-slide-active');
    slidesEl.append(row);
  });

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'banner-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close banner');
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    sessionStorage.setItem(storageKey, '1');
    block.closest('.section')?.remove();
  });

  block.append(slidesEl, closeBtn);

  // Auto-rotate when multiple slides
  if (rows.length > 1) {
    let current = 0;
    setInterval(() => {
      rows[current].classList.remove('banner-slide-active');
      current = (current + 1) % rows.length;
      rows[current].classList.add('banner-slide-active');
    }, 5000);
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('banner:after', { detail: ctx }));
}

/**
 * Default export
 * Allows the base implementation to be used directly or with hooks
 */
export default decorate;
