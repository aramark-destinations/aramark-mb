import { moveInstrumentation } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { debounce } from '../../scripts/baici/utils/utils.js';
import { getStore } from '../../scripts/commerce.js';
import { updateSubMenuHeight } from '../navigation/navigation.js';

function decorateMenuItem(parent) {
  const rawItems = parent.querySelectorAll(':scope > div.navigation-item[data-aue-resource], :scope > div[data-aue-model="navigation-item"]');
  rawItems.forEach((item) => {
    decorate(item);
  });
}

export default async function decorate(block) {
  const {
    title = 'Menu Item',
    link = '#',
    description = '',
    'open-in-new-tab': openInNewTabStr = 'false',
  } = readBlockConfig(block);

  const openInNewTab = openInNewTabStr === 'true';

  const anchor = document.createElement('a');
  anchor.href = link;
  anchor.textContent = title;

  if (description) {
    anchor.setAttribute('title', description);
  }

  if (openInNewTab) {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  }

  const li = document.createElement('li');
  li.className = 'navigation-item';
  li.setAttribute('role', 'menuitem');
  li.appendChild(anchor);

  const linkEl = li.querySelector('a');

  linkEl.addEventListener('keyup', debounce((event) => {
    if (event.key === 'Escape') {
      const sectionButton = event.target.closest('.navigation-section').querySelector('.navigation-section-button, .navigation-section-link');
      const newEvent = new CustomEvent('close:navigation:section', { detail: { section: sectionButton } });
      window.dispatchEvent(newEvent);
    }
  }, 100));

  window.adobeDataLayer = window.adobeDataLayer || [];
  linkEl.addEventListener('click', () => {
    window.adobeDataLayer.push({
      event: 'nav_link_click',
      nav: {
        level: 'item',
        label: linkEl.textContent.trim(),
        url: linkEl.href,
        store: getStore() || null,
      },
    });
  });

  moveInstrumentation(block, li);
  block.replaceWith(li);
}

// Event handler reference for proper add/remove
function handleItemDecorate(event) {
  decorateMenuItem(event.detail.parentElement);
  updateSubMenuHeight(event.detail.parentElement);
}

// Register listener once at module level, not on each decorate call
const main = document.querySelector('main');
if (main && !main.dataset.navigationItemListenerAttached) {
  main.dataset.navigationItemListenerAttached = 'true';
  main.addEventListener('decorate:navigation:item', handleItemDecorate);
}
