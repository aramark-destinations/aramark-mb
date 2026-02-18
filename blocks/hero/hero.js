/**
 * Hero Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core hero block functionality
 */

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('hero:before', { detail: ctx }));

  // === HERO BLOCK LOGIC ===
  // The hero block is already properly structured by AEM
  // It contains a picture element and text content (typically h1)
  // No additional DOM manipulation needed for the base implementation

  // Optional: Add data attributes or classes based on structure
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h1');

  if (picture) {
    picture.closest('div')?.classList.add('hero-image');
  }

  if (heading) {
    heading.closest('div')?.classList.add('hero-text');
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('hero:after', { detail: ctx }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Hero?.hooks
 */
export default (block) => decorate(block, window.Hero?.hooks);
