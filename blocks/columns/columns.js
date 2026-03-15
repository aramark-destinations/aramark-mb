/**
 * Columns Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core column layout functionality
 * - Automatically detects and classifies image columns
 * - Supports optional `mobileslider` variant for horizontal scroll-snap on mobile
 */

import { readVariant } from '../../scripts/scripts.js';

/**
 * Decorates the columns block
 * @param {Element} block The columns block element
 * @param {Object} options Configuration options
 * @param {Function} options.onBefore Lifecycle hook called before decoration
 * @param {Function} options.onAfter Lifecycle hook called after decoration
 */
export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('columns:before', { detail: ctx }));

  // === COLUMNS BLOCK LOGIC ===
  readVariant(block);

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // mobileslider: add dot indicators (CSS handles scroll-snap layout)
  if (block.dataset.variant === 'mobileslider') {
    const rows = [...block.children];
    const dots = document.createElement('div');
    dots.className = 'columns-slider-dots';

    rows.forEach((row, i) => {
      const dot = document.createElement('button');
      dot.className = 'columns-slider-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dots.append(dot);
    });

    block.append(dots);

    // Update active dot via IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = [...block.children].indexOf(entry.target);
          dots.querySelectorAll('.columns-slider-dot').forEach((d, i) => {
            d.classList.toggle('active', i === idx);
          });
        }
      });
    }, { root: block, threshold: 0.5 });

    rows.forEach((row) => observer.observe(row));
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('columns:after', { detail: ctx }));
}

/**
 * Default export
 * Allows the base implementation to be used directly or with hooks
 */
export default decorate;
