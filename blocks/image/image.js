/**
 * Image Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core image block functionality
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('image:before', { detail: ctx }));

  // === IMAGE BLOCK LOGIC ===
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const altText = block.dataset.imagealt;
    if (img && altText) img.alt = altText;
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('image:after', { detail: ctx }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Image?.hooks
 */
export default (block) => decorate(block, window.Image?.hooks);
