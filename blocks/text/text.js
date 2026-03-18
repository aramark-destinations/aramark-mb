/**
 * Text Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core text block functionality
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('text:before', { detail: ctx }));

  // === TEXT BLOCK LOGIC ===
  // Rich text content is rendered directly by AEM
  // No additional DOM manipulation needed for base implementation

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('text:after', { detail: ctx }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Text?.hooks
 */
export default (block) => decorate(block, window.Text?.hooks);
