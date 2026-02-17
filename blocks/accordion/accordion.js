/**
 * Accordion Block
 * - Provides lifecycle hooks (onBefore/onAfter) for site-specific extensions
 * - Dispatches before/after events for advanced customization
 * - Implements core accordion/collapsible functionality
 * - Uses native details/summary elements for accessibility
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorates the accordion block
 * @param {Element} block The accordion block element
 * @param {Object} options Configuration options
 * @param {Function} options.onBefore Lifecycle hook called before decoration
 * @param {Function} options.onAfter Lifecycle hook called after decoration
 */
export default function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('accordion:before', { detail: ctx }));

  // === ACCORDION BLOCK LOGIC ===
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    
    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('accordion:after', { detail: ctx }));
}
