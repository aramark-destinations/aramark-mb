/**
 * Button Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core button block functionality
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('button:before', { detail: ctx }));

  // === BUTTON BLOCK LOGIC ===
  const link = block.querySelector('a');
  if (link) {
    const linkType = block.dataset.linktype;
    if (linkType) link.classList.add(linkType);
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('button:after', { detail: ctx }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Button?.hooks
 */
export default (block) => decorate(block, window.Button?.hooks);
