/**
 * Title Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core title block functionality
 */

import { readVariant } from '../../scripts/scripts.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('title:before', { detail: ctx, bubbles: true }));

  // === TITLE BLOCK LOGIC ===
  readVariant(block);
  // titleType is applied by AEM as the heading tag (h1–h6)
  // No additional DOM manipulation needed for base implementation

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('title:after', { detail: ctx, bubbles: true }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Title?.hooks
 */
export default (block) => decorate(block, window.Title?.hooks);
