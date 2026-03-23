/**
 * Button Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core button block functionality
 * - Supports multiple buttons with style and color variants
 */

import { readVariant } from '../../scripts/scripts.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('button:before', { detail: ctx, bubbles: true }));

  // === BUTTON BLOCK LOGIC ===
  readVariant(block);

  const links = block.querySelectorAll('a');
  links.forEach((link) => {
    const wrapper = link.closest('div');

    // Read style (filled/outlined/text-only) from data attribute
    const linkStyle = wrapper?.dataset.linktype || block.dataset.linktype || 'filled';
    if (linkStyle) link.classList.add(linkStyle);

    // Read color (primary/secondary/tertiary/black/white) from data attribute
    const linkColor = wrapper?.dataset.linkcolor || block.dataset.linkcolor || 'primary';
    if (linkColor) link.classList.add(`color-${linkColor}`);
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
