/**
 * Cards Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core cards block functionality
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('cards:before', { detail: ctx }));

  // === CARDS BLOCK LOGIC ===
  // Convert block structure to ul/li for better semantics
  const ul = document.createElement('ul');
  
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    
    // Move all children from row to li
    while (row.firstElementChild) li.append(row.firstElementChild);
    
    // Classify card content (image vs body)
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    
    ul.append(li);
  });
  
  // Optimize all card images
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  
  // Replace block children with the new ul
  block.replaceChildren(ul);

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('cards:after', { detail: ctx }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Cards?.hooks
 */
export default (block) => decorate(block, window.Cards?.hooks);
