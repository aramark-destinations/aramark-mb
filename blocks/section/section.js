/**
 * Section Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core section block functionality
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('section:before', { detail: ctx }));

  // === SECTION BLOCK LOGIC ===
  // Section is a structural container rendered by AEM
  // Style variants (e.g. highlight) are applied via data-style attribute
  // No additional DOM manipulation needed for base implementation

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('section:after', { detail: ctx }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Section?.hooks
 */
export default (block) => decorate(block, window.Section?.hooks);
