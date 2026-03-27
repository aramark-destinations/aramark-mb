/**
 * Aramark Button Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core button block functionality
 * - Supports multiple buttons with style and color variants
 * - Reads linkType, linkColor, linkSize, linkShape from AUE block model fields
 */

import { extractAueConfig } from '../../scripts/aem.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('aramark-button:before', { detail: ctx, bubbles: true }));

  const links = block.querySelectorAll('a');
  links.forEach((link) => {
    // Extract AUE config from block model fields (linkType, linkColor, linkSize, linkShape)
    const config = extractAueConfig(block);

    // Read style (filled/outlined/text-only)
    // from AUE config, wrapper data attr, or block data attr
    const wrapper = link.closest('div');
    const linkStyle = config.linkType
      || wrapper?.dataset.linktype
      || block.dataset.linktype
      || 'filled';
    if (linkStyle) link.classList.add(linkStyle);

    // Read color (primary/secondary/tertiary/black/white)
    const linkColor = config.linkColor
      || wrapper?.dataset.linkcolor
      || block.dataset.linkcolor
      || 'primary';
    if (linkColor) link.classList.add(`color-${linkColor}`);

    // Read size (large/medium/small)
    const linkSize = config.linkSize
      || wrapper?.dataset.linksize
      || block.dataset.linksize
      || 'large';
    if (linkSize) link.classList.add(`size-${linkSize}`);

    // Read shape (rectangular/pill)
    const linkShape = config.linkShape
      || wrapper?.dataset.linkshape
      || block.dataset.linkshape;
    if (linkShape === 'pill') link.classList.add('shape-pill');
  });

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('aramark-button:after', { detail: ctx, bubbles: true }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.AramarkButton?.hooks
 */
export default (block) => decorate(block, window.AramarkButton?.hooks);
