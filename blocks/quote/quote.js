/*
 * Quote Block - Implementation
 * Display quotations with optional attribution
 */

/**
 * Decorates the quote block with lifecycle hooks and events
 * @param {HTMLElement} block - The quote block element
 * @param {Object} options - Decoration options
 * @param {Function} options.onBefore - Hook called before decoration
 * @param {Function} options.onAfter - Hook called after decoration
 * @returns {Promise<void>}
 */
export async function decorate(block, options = {}) {
  const ctx = { block, options };

  // Lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('quote:before', { detail: ctx }));

  const [quotation, attribution] = [...block.children].map((c) => c.firstElementChild);
  const blockquote = document.createElement('blockquote');

  // decorate quotation
  quotation.className = 'quote-quotation';
  blockquote.append(quotation);

  // decoration attribution
  if (attribution) {
    attribution.className = 'quote-attribution';
    blockquote.append(attribution);
    const ems = attribution.querySelectorAll('em');
    ems.forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = em.innerHTML;
      em.replaceWith(cite);
    });
  }

  block.innerHTML = '';
  block.append(blockquote);

  // Lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('quote:after', { detail: ctx }));
}

/**
 * Default export for block decoration
 * @param {HTMLElement} block - The quote block element
 * @returns {Promise<void>}
 */
export default (block) => decorate(block, window.Quote?.hooks);
