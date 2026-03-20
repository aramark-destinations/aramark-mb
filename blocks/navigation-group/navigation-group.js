import { moveInstrumentation } from '../../scripts/scripts.js';
import { readConfig, readKeyValueConfig, readUeConfig } from '../../scripts/baici/utils/config.js';
import { fetchSvg, debounce } from '../../scripts/baici/utils/utils.js';
import { extractAueConfig } from '../../scripts/aem.js';
import { updateSubMenuHeight } from '../navigation/navigation.js';

const MOBILE_MAX_BREAKPOINT = '767px';

const isMobile = window.matchMedia(`(max-width: ${MOBILE_MAX_BREAKPOINT})`);

function decorateGroupItems(parent) {
  // Find raw div elements that UE has inserted and need to be decorated into li elements
  const rawItems = parent.querySelectorAll(':scope > div[data-aue-resource]');
  rawItems.forEach((item) => {
    decorateGroupItem(item, parent);
  });
}

function readGroupUeConfig(block) {
  return readUeConfig(block);
}

function readGroupItemConfig(item) {
  const configOptions = ['title', 'link', 'description', 'open-in-new-tab', 'classes'];
  const rows = Array.from([...item.children]);
  const config = {};
  rows.forEach((row, idx) => {
    const current = configOptions[idx];
    if (current === 'link') {
      config[current] = row.querySelector('a') ? row.querySelector('a').href : '/';
    } else if (current === 'classes') {
      config[current] = row.textContent.split(', ').map((c) => c.trim());
    } else if (current === 'open-in-new-tab') {
      config[current] = row.textContent.trim().toLowerCase() === 'true';
    } else {
      config[current] = row.textContent.trim();
    }
  });
  return config;
}

function openGroupMenu(button) {
  const title = button.textContent.trim();
  button.setAttribute('aria-expanded', 'true');
  button.closest('.navigation-group')?.querySelector('.navigation-group-list a')?.focus();
  const event = new CustomEvent('update:live:region', { detail: { message: `${title} Group Menu Opened` } });
  window.dispatchEvent(event);
}

function closeGroupMenu(button) {
  const title = button.textContent.trim();
  button.setAttribute('aria-expanded', 'false');
  const event = new CustomEvent('update:live:region', { detail: { message: `${title} Group Menu Closed` } });
  window.dispatchEvent(event);
  button.focus();
}

function toggleGroupMenu(button) {
  if (isMobile.matches) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    if (!isExpanded) {
      const navigationSubMenu = button.closest('.navigation-section-submenu');
      navigationSubMenu?.querySelectorAll('[aria-expanded="true"]').forEach((expandedBtn) => {
        expandedBtn.setAttribute('aria-expanded', 'false');
      });
      openGroupMenu(button);
    } else {
      closeGroupMenu(button);
    }
  }
}

function decorateGroupItem(item, anchorList, idx = null) {
  let itemIndex = idx;
  if (itemIndex === null || itemIndex === undefined) {
    itemIndex = [...item.parentElement.children]
      .filter((child) => child.hasAttribute('data-aue-resource'))
      .indexOf(item);
  }
  const configOptions = ['title', 'link', 'description', 'open-in-new-tab', 'classes'];
  const extractedConfig = extractAueConfig(item);
  const blockConfig = readKeyValueConfig(item, configOptions);
  const groupItemConfig = readGroupItemConfig(item);
  const config = { ...extractedConfig, ...blockConfig, ...groupItemConfig };
  const title = config.title === 'Item' ? `Item ${itemIndex + 1}` : config.title;
  const itemLink = config.link;
  const description = config.description === '' ? null : config.description;
  const classes = config.classes.length > 0 ? config.classes.join(' ') : '';
  const openInNewTab = config['open-in-new-tab'] || false;
  const groupLi = document.createRange().createContextualFragment(`
      <li class="${classes}" role="menuitem">
        <a href="${itemLink}" class="navigation-group-list-link">${title}</a>
      </li>
    `).firstElementChild;

  const groupLiAnchor = groupLi.querySelector('a');

  if (description) {
    groupLiAnchor.setAttribute('aria-description', description);
  }

  if (openInNewTab) {
    groupLiAnchor.setAttribute('target', '_blank');
    groupLiAnchor.setAttribute('rel', 'noopener noreferrer');
  }

  // If item is already a child of anchorList, replace in place to preserve position
  if (item.parentElement === anchorList) {
    item.replaceWith(groupLi);
  } else {
    anchorList.appendChild(groupLi);
  }
  moveInstrumentation(item, groupLi);

  groupLiAnchor.addEventListener('click', () => {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'nav_link_click',
      nav: {
        level: 'group-item',
        label: groupLiAnchor.textContent.trim(),
        url: groupLiAnchor.href,
      },
    });
  });
}

/**
 * Decorates the navigation-group block
 * @param {Element} block The navigation-group block element
 * @param {Object} options Configuration options
 * @param {Function} options.onBefore Lifecycle hook called before decoration
 * @param {Function} options.onAfter Lifecycle hook called after decoration
 * @returns {Promise<void>}
 */
export async function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('navigation-group:before', { detail: ctx }));
  const groupItems = [];
  const configOptions = [
    {
      key: 'title',
      defaultValue: 'Menu Group',
    },
    {
      key: 'link',
      defaultValue: '/',
    },
    {
      key: 'is-header-only',
      defaultValue: 'true',
      possibleValues: ['true', 'false'],
    },
  ];
  const extractedConfig = readGroupUeConfig(block);
  const hasExtractedConfig = Object.keys(extractedConfig).length > 0;
  const blockConfig = hasExtractedConfig ? {} : readConfig(block, configOptions);
  const config = { ...extractedConfig, ...blockConfig };
  const chevron = await fetchSvg('/icons/chevron-down.svg');

  const allRows = block.querySelectorAll(':scope > div');
  allRows.forEach((row) => {
    if (Array.from(row.children).length >= 2) {
      groupItems.push(row);
      return;
    }

    if (row.children.length === 1) {
      const firstChild = row.children[0];
      if (firstChild.hasAttribute('data-aue-prop') && firstChild.hasAttribute('data-aue-label')) {
        config[firstChild?.dataset?.aueProp] = firstChild?.textContent.trim();
      }

      if (firstChild.querySelector(':scope > a')) {
        config.link = firstChild.querySelector(':scope > a').href;
      }
    }
  });

  const headerOnly = config['is-header-only'] === 'true' || config['is-header-only'] === true;
  const title = config.title || 'Group Name';
  const groupSuffix = `${title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;
  const link = config?.link || '#';
  const li = document.createElement('li');
  li.className = 'navigation-group';

  let anchor = null;

  if (headerOnly) {
    anchor = document.createRange().createContextualFragment(`
      <button class="navigation-group-button" aria-expanded="false" aria-label="Menu Group" aria-haspopup="true" aria-controls="navigation-group-${groupSuffix}">
          <span class="navigation-group-button-title">${title}</span>
          <span class="navigation-group-button-icon" aria-hidden="true">${chevron}</span>
        </button>
    `).firstElementChild;
  } else {
    const linkUrl = link;
    anchor = document.createRange().createContextualFragment(`
      <a href="${linkUrl}" class="navigation-group-link" aria-label="Menu Group" aria-expanded="false" aria-haspopup="true" aria-controls="navigation-group-${groupSuffix}">
          <span class="navigation-group-link-title">${title}</span>
          <span class="navigation-group-link-icon" aria-hidden="true">${chevron}</span>
        </a>  
    `).firstElementChild;
  }

  const anchorList = document.createRange().createContextualFragment(`
  <ul id="navigation-group-${groupSuffix}" class="navigation-group-list" role="menu" aria-label="${title} Submenu"></ul>  
`).firstElementChild;

  groupItems.forEach((item, idx) => {
    decorateGroupItem(item, anchorList, idx);
  });

  moveInstrumentation(block, li);

  li.appendChild(anchor);
  li.appendChild(anchorList);
  block.replaceWith(li);

  const blockHeadingLink = li.querySelector('button.navigation-group-button, a.navigation-group-link');

  updateSubMenuHeight(blockHeadingLink);

  blockHeadingLink.removeEventListener('click', toggleGroupMenu);
  blockHeadingLink.addEventListener('click', () => {
    toggleGroupMenu(blockHeadingLink);
  });

  li.querySelectorAll('.navigation-group-button, .navigation-group-link, .navigation-group-list-link').forEach((el) => {
    el.addEventListener('keydown', debounce((event) => {
      if (event.key === 'Escape') {
        const element = event.target;
        const closestGroupTrigger = element.closest('.navigation-group')?.querySelector('button.navigation-group-button, a.navigation-group-link');
        closeGroupMenu(closestGroupTrigger);
      }
    }, 100));
  });

  // lifecycle hook + event (after) — fires on detached block (block.replaceWith(li) above)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('navigation-group:after', { detail: ctx }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.NavigationGroup?.hooks
 */
export default (block) => decorate(block, window.NavigationGroup?.hooks);

// Event handler references for proper add/remove
function handleGroupDecorate(event) {
  decorate(event.detail.element);
  updateSubMenuHeight(event.detail.element);
}

function handleGroupItemsDecorate(event) {
  decorateGroupItems(event.detail.parentElement);
  updateSubMenuHeight(event.detail.parentElement);
}

// Register listeners once at module level, not on each decorate call
const main = document.querySelector('main');
if (main && !main.dataset.navigationGroupListenerAttached) {
  main.dataset.navigationGroupListenerAttached = 'true';
  main.addEventListener('decorate:navigation:group', handleGroupDecorate);
  main.addEventListener('decorate:navigation:group:items', handleGroupItemsDecorate);
}
