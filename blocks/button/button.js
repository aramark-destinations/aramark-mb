/**
 * Button Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core button block functionality
 * - Supports multiple buttons with style and color variants
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('button:before', { detail: ctx, bubbles: true }));

  const links = block.querySelectorAll('a');
  links.forEach((link) => {
    const wrapper = link.closest('div');

    // Read style (filled/outlined/text-only) from data attribute
    const linkStyle = wrapper?.dataset.linktype || block.dataset.linktype || 'filled';
    if (linkStyle) link.classList.add(linkStyle);

    // Read color (primary/secondary/tertiary/black/white) from data attribute
    const linkColor = wrapper?.dataset.linkcolor || block.dataset.linkcolor || 'primary';
    if (linkColor) link.classList.add(`color-${linkColor}`);

    // Read size (large/medium/small) from data attribute
    const linkSize = wrapper?.dataset.linksize || block.dataset.linksize || 'large';
    if (linkSize) link.classList.add(`size-${linkSize}`);

    // Read shape (rectangular/pill) from data attribute
    const linkShape = wrapper?.dataset.linkshape || block.dataset.linkshape;
    if (linkShape === 'pill') link.classList.add('shape-pill');
  });

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('button:after', { detail: ctx, bubbles: true }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Button?.hooks
 */
export default (block) => decorate(block, window.Button?.hooks);
