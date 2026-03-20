/**
 * Image Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core image block functionality
 * - Supports DAM alt text population and manual alt text override
 */

import { readVariant } from '../../scripts/scripts.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('image:before', { detail: ctx, bubbles: true }));

  // === IMAGE BLOCK LOGIC ===
  readVariant(block);

  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');

    // Alt text: manual override takes precedence, otherwise DAM metadata is used
    // When getAltFromDam is true (default), the alt text from DAM metadata is already
    // present on the img element. When false, use the authored imageAlt value.
    const altText = block.dataset.imagealt;
    if (img && altText) {
      img.alt = altText;
    }
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('image:after', { detail: ctx, bubbles: true }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Image?.hooks
 */
export default (block) => decorate(block, window.Image?.hooks);
