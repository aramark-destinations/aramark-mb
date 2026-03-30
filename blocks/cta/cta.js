/**
 * CTA Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core CTA block functionality
 * - Supports multiple buttons with style and color variants
 *
 * Variant classes are authored via classes_* fields in the UE model and rendered
 * as CSS classes directly on the block wrapper element by AEM delivery:
 *   <div class="cta [filled|outlined|text-only] [color-*] [size-*] [shape-pill]">
 *
 * JS reads block.classList and applies defaults when no authored class is present.
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('cta:before', { detail: ctx, bubbles: true }));

  const STYLE_CLASSES = ['filled', 'outlined', 'text-only'];
  const COLOR_CLASSES = ['color-primary', 'color-secondary', 'color-tertiary', 'color-black', 'color-white'];
  const SIZE_CLASSES = ['size-large', 'size-medium', 'size-small'];

  if (!STYLE_CLASSES.some((c) => block.classList.contains(c))) block.classList.add('filled');
  if (!COLOR_CLASSES.some((c) => block.classList.contains(c))) block.classList.add('color-primary');
  if (!SIZE_CLASSES.some((c) => block.classList.contains(c))) block.classList.add('size-large');

  // Remove any stale positional content rows (defense for old authored content)
  block.querySelectorAll(':scope > div').forEach((row) => {
    if (!row.querySelector('a')) row.remove();
  });

  // Mirror title attr → aria-label for screen readers
  block.querySelectorAll('a').forEach((link) => {
    if (link.title) link.setAttribute('aria-label', link.title);
  });

  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('cta:after', { detail: ctx, bubbles: true }));
}

/**
 * Default export — allows global hook injection via window.Cta?.hooks
 */
export default (block) => decorate(block, window.Cta?.hooks);
