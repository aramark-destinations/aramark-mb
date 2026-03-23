/**
 * Image Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core image block functionality
 * - Supports DAM alt text population and manual alt text override
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';

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
    const altText = block.dataset.imagealt || img?.alt || '';

    if (img) {
      const optimizedPicture = createOptimizedPicture(
        img.src,
        altText,
        false,
        [{ width: '375' }, { width: '768' }, { width: '1200' }],
      );
      moveInstrumentation(img, optimizedPicture.querySelector('img'));
      picture.replaceWith(optimizedPicture);
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
