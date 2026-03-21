/**
 * Page Block
 * - Holds page-level metadata (title, description, keywords)
 * - Not rendered as a visible block; metadata is consumed by AEM
 * - Provides lifecycle hooks for completeness
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('page:before', { detail: ctx, bubbles: true }));

  // === PAGE BLOCK LOGIC ===
  // Page metadata is consumed by AEM at the document level
  // No DOM decoration needed

  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('page:after', { detail: ctx, bubbles: true }));
}

export default (block) => decorate(block, window.Page?.hooks);
