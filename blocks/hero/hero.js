/**
 * Site-Specific Hero Block Extension
 * - Imports and re-exports base hero block
 * - Wraps with local hooks for site-specific customizations
 */

import { decorate as baseDecorate } from '../../libs/blocks/hero/base.js';

const hooks = {
  onBefore: ({ block }) => {
    // Site-specific: Add variant classes if specified
    if (block.dataset.variant) {
      block.classList.add(`hero--${block.dataset.variant}`);
    }
    
    // Site-specific: Add animation classes
    if (!block.classList.contains('no-animate')) {
      block.classList.add('hero--animated');
    }
  },
  onAfter: ({ block }) => {
    // Site-specific: Add analytics tracking
    // Example: Track hero impressions
    block.addEventListener('hero:after', () => {
      // Analytics code would go here
      // console.log('Hero block loaded:', block);
    });
  },
};

export function decorate(block) {
  return baseDecorate(block, hooks);
}

export default (block) => decorate(block);
