/**
 * Button Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core button block functionality
 * - Supports multiple buttons with style and color variants
 *
 * Block row structure (positional):
 *   Row 1: link (rendered as <a> by field collapse)
 *   Row 2: linkType  — filled | outlined | text-only        (default: filled)
 *   Row 3: linkColor — primary | secondary | tertiary | black | white (default: primary)
 *   Row 4: linkSize  — large | medium | small               (default: large)
 *   Row 5: linkShape — rectangular | pill                   (default: rectangular)
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('button:before', { detail: ctx, bubbles: true }));

  // Collect all rows
  const rows = [...block.querySelectorAll(':scope > div')];

  // Helper: get trimmed text from a row's first cell
  const rowText = (row) => row?.querySelector('div, p')?.textContent?.trim()
    || row?.textContent?.trim()
    || '';

  // Find the row containing the link (Row 1)
  const linkRowIndex = rows.findIndex((row) => row.querySelector('a'));

  // Positional config rows after the link row
  const linkType = rowText(rows[linkRowIndex + 1]) || 'filled';
  const linkColor = rowText(rows[linkRowIndex + 2]) || 'primary';
  const linkSize = rowText(rows[linkRowIndex + 3]) || 'large';
  const linkShape = rowText(rows[linkRowIndex + 4]) || '';

  // Apply classes to each link
  block.querySelectorAll('a').forEach((link) => {
    // Style: filled | outlined | text-only
    if (linkType) link.classList.add(linkType);

    // Color: color-primary | color-secondary | color-tertiary | color-black | color-white
    if (linkColor) link.classList.add(`color-${linkColor}`);

    // Size: size-large | size-medium | size-small
    if (linkSize) link.classList.add(`size-${linkSize}`);

    // Shape: shape-pill (only applied when explicitly set to 'pill')
    if (linkShape === 'pill') link.classList.add('shape-pill');
  });

  // Remove config rows from DOM — they are data, not visible content
  rows.forEach((row, index) => {
    if (index > linkRowIndex) row.remove();
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
