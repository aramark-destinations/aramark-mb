/**
 * Image Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core image block functionality
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('image:before', { detail: ctx }));

  // === IMAGE BLOCK LOGIC ===
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const altText = block.dataset.imagealt || img?.alt || '';

    const optimizedPicture = createOptimizedPicture(
      img.src,
      altText,
      false,
      [{ width: '375' }, { width: '768' }, { width: '1200' }],
    );
    moveInstrumentation(img, optimizedPicture.querySelector('img'));
    picture.replaceWith(optimizedPicture);
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
