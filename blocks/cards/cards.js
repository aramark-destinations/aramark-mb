/**
 * Site-Specific Cards Block Extension
 * - Imports and re-exports base cards block
 * - Wraps with local hooks for site-specific customizations
 */

import { decorate as baseDecorate } from '../../libs/blocks/cards/base.js';

const hooks = {
  onBefore: ({ block }) => {
    // Site-specific: Add variant classes if specified
    if (block.dataset.variant) {
      block.classList.add(`cards--${block.dataset.variant}`);
    }
    
    // Site-specific: Add column count class if specified
    const columns = block.dataset.columns;
    if (columns) {
      block.classList.add(`cards--${columns}-cols`);
    }
  },
  onAfter: ({ block }) => {
    // Site-specific: Add hover effects
    const cards = block.querySelectorAll('li');
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.transition = 'transform 0.3s ease';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
    
    // Site-specific: Add analytics tracking
    block.addEventListener('click', (e) => {
      const card = e.target.closest('li');
      if (card) {
        // Analytics code would go here
        // console.log('Card clicked:', card);
      }
    });
  },
};

export default function decorate(block) {
  return baseDecorate(block, hooks);
}

