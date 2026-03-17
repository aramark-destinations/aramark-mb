import { readBlockConfig } from '../../scripts/aem.js';

// keep track globally of the number of tab blocks on the page
let tabBlockCnt = 0;

/**
 * Dispatch analytics event for tab interactions
 * @param {string} eventName - Name of the event (tabs_interaction, tabs_deep_link)
 * @param {Object} detail - Event detail object
 */
function dispatchAnalyticsEvent(eventName, detail) {
  // Don't fire analytics events on AEM Cloud preview/editor environments
  if (window.location.hostname.includes('adobeaemcloud.com')) {
    return;
  }

  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
  });
  window.dispatchEvent(event);

  // Push to Adobe Data Layer with event data
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: eventName,
    eventInfo: detail,
  });
}

/**
 * Generate URL-friendly slug from tab title
 * @param {string} title - Tab title
 * @param {Array} existingSlugs - Already used slugs to avoid duplicates
 * @returns {string} - URL-friendly slug
 */
function generateSlug(title, existingSlugs = []) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

  // Handle duplicate slugs by appending number
  let uniqueSlug = slug;
  let counter = 2;
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter += 1;
  }

  return uniqueSlug;
}

/**
 * Activate a specific tab
 * @param {Element} block - The tabs block
 * @param {number} index - Index of tab to activate
 * @param {boolean} updateHash - Whether to update URL hash
 * @param {boolean} fromUser - Whether activation was triggered by user interaction
 */
function activateTab(block, index, updateHash = true, fromUser = false) {
  const buttons = block.querySelectorAll('.tabs-tab');
  const panels = block.querySelectorAll('.tabs-panel');

  if (index < 0 || index >= buttons.length) return;

  // Check if in mobile accordion mode
  const isMobileAccordion = block.classList.contains('mobile-accordion');

  // Update ARIA attributes
  buttons.forEach((btn, i) => {
    btn.setAttribute('aria-selected', i === index);
    btn.setAttribute('tabindex', i === index ? '0' : '-1');

    // In mobile accordion mode, set aria-expanded
    if (isMobileAccordion) {
      btn.setAttribute('aria-expanded', i === index ? 'true' : 'false');
    }
  });

  panels.forEach((panel, i) => {
    panel.setAttribute('aria-hidden', i !== index);
  });

  // Focus the activated tab
  buttons[index].focus();

  // Update URL hash if enabled
  const allowHash = block.dataset.allowHashDeepLinks === 'true';
  if (updateHash && allowHash) {
    const slug = buttons[index].dataset.tabSlug;
    if (slug) {
      window.location.hash = `#${slug}`;
    }
  }

  // Dispatch analytics event for user interactions
  if (fromUser) {
    const category = block.dataset.analyticsCategory || 'tabs';
    const tabTitle = buttons[index].textContent.trim();
    const { tabSlug } = buttons[index].dataset;

    dispatchAnalyticsEvent('tabs_interaction', {
      category,
      action: 'tab_click',
      tabIndex: index,
      tabTitle,
      tabSlug,
    });
  }
}

/**
 * Handle keyboard navigation
 * @param {Element} block - The tabs block
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeydown(block, e) {
  // Only handle keyboard events if the focused element is a tab button in THIS block
  const buttons = Array.from(block.querySelectorAll('.tabs-tab'));
  const { activeElement } = document;

  // Check if the active element is one of this block's tab buttons
  if (!buttons.includes(activeElement)) return;

  const currentIndex = buttons.indexOf(activeElement);
  if (currentIndex === -1) return;

  const layoutVariant = block.dataset.layoutVariant || 'horizontal';
  const isVertical = layoutVariant === 'vertical';

  let handled = false;
  let newIndex = currentIndex;

  // Arrow navigation
  if ((e.key === 'ArrowRight' && !isVertical) || (e.key === 'ArrowDown' && isVertical)) {
    newIndex = (currentIndex + 1) % buttons.length;
    handled = true;
  } else if ((e.key === 'ArrowLeft' && !isVertical) || (e.key === 'ArrowUp' && isVertical)) {
    newIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
    handled = true;
  } else if (e.key === 'Home') {
    newIndex = 0;
    handled = true;
  } else if (e.key === 'End') {
    newIndex = buttons.length - 1;
    handled = true;
  }

  if (handled) {
    e.preventDefault();
    activateTab(block, newIndex);
  }
}

/**
 * Handle hash change events
 * @param {Element} block - The tabs block
 */
function handleHashChange(block) {
  const hash = window.location.hash.slice(1); // Remove the '#'
  if (!hash) return;

  const buttons = Array.from(block.querySelectorAll('.tabs-tab'));
  const matchingIndex = buttons.findIndex(
    (btn) => btn.dataset.tabSlug === hash,
  );

  if (matchingIndex === -1) return; // No matching tab in this block

  // Only activate if:
  // 1. This block currently has focus (one of its buttons is activeElement), OR
  // 2. No tabs block currently has focus
  const { activeElement } = document;
  const thisBlockHasFocus = buttons.includes(activeElement);
  const anyTabHasFocus = activeElement && activeElement.classList.contains('tabs-tab');

  if (thisBlockHasFocus || !anyTabHasFocus) {
    activateTab(block, matchingIndex, false); // Don't update hash when responding to hash change
  }
}

export default async function decorate(block) {
  tabBlockCnt += 1;
  const blockId = tabBlockCnt;

  // Read configuration from key-value rows (backward compatibility)
  const config = readBlockConfig(block);

  // Get all rows from the block
  const allRows = Array.from(block.querySelectorAll(':scope > div'));

  // Extract configuration from single-column rows (Universal Editor pattern)
  const singleColRows = allRows.filter((row) => {
    const cols = Array.from(row.children);
    return cols.length === 1 && !row.hasAttribute('data-aue-resource');
  });

  const configFieldNames = [
    'layoutVariant',
    'stackOnMobile',
    'allowHashDeepLinks',
    'activateOnHover',
    'transitionStyle',
    'analyticsCategory',
  ];

  singleColRows.forEach((row, index) => {
    if (index < configFieldNames.length) {
      const fieldName = configFieldNames[index];
      const value = row.textContent.trim();
      if (value) {
        block.dataset[fieldName] = value;
      }
    }
  });

  // Remove configuration rows from DOM
  allRows.forEach((row) => {
    if (singleColRows.includes(row)) {
      row.remove();
    }
  });

  // Apply configuration with defaults
  const layoutVariant = block.dataset.layoutVariant || config.layoutvariant || 'horizontal';
  const stackOnMobile = (block.dataset.stackOnMobile || config.stackonmobile) !== 'false';
  const allowHashDeepLinks = (block.dataset.allowHashDeepLinks || config.allowhashdeeplinks) !== 'false';
  const activateOnHover = (block.dataset.activateOnHover || config.activateonhover) === 'true';
  const transitionStyle = block.dataset.transitionStyle || config.transitionstyle || 'fade';
  const analyticsCategory = block.dataset.analyticsCategory || config.analyticscategory || 'tabs';

  // Store in dataset for later access
  block.dataset.layoutVariant = layoutVariant;
  block.dataset.stackOnMobile = String(stackOnMobile);
  block.dataset.allowHashDeepLinks = String(allowHashDeepLinks);
  block.dataset.activateOnHover = String(activateOnHover);
  block.dataset.transitionStyle = transitionStyle;
  block.dataset.analyticsCategory = analyticsCategory;

  // Apply layout variant class
  if (layoutVariant === 'vertical') {
    block.classList.add('tabs-vertical');
  }

  // Apply transition class, respecting prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const effectiveTransition = prefersReducedMotion ? 'none' : transitionStyle;
  block.classList.add(`tabs-transition-${effectiveTransition}`);

  // Function to build and switch between desktop tabs and mobile accordion
  function buildLayout(isMobileMode) {
    // Get buttons and panels BEFORE clearing layout
    const buttons = Array.from(block.querySelectorAll('.tabs-tab'));
    const panels = Array.from(block.querySelectorAll('.tabs-panel'));

    // Clear existing layout structures
    const existingTablist = block.querySelector('.tabs-list');
    const existingAccordion = block.querySelector('.tabs-accordion');

    if (existingTablist) existingTablist.remove();
    if (existingAccordion) existingAccordion.remove();

    if (isMobileMode) {
      // Mobile accordion layout
      block.classList.add('mobile-accordion');
      block.classList.remove('tabs-desktop');

      // Interleave buttons and panels for accordion
      buttons.forEach((button, i) => {
        block.appendChild(button);
        block.appendChild(panels[i]);
      });
    } else {
      // Desktop tablist layout
      block.classList.remove('mobile-accordion');
      block.classList.add('tabs-desktop');

      // Build tablist
      const tablist = document.createElement('div');
      tablist.className = 'tabs-list';
      tablist.setAttribute('role', 'tablist');
      tablist.id = `tablist-${blockId}`;

      // Add all buttons to tablist
      buttons.forEach((button) => {
        tablist.appendChild(button);
      });

      // Prepend tablist, then add panels
      block.prepend(tablist);
      panels.forEach((panel) => {
        block.appendChild(panel);
      });
    }

    // Reactivate current tab to update ARIA
    const selectedIndex = buttons.findIndex((btn) => btn.getAttribute('aria-selected') === 'true');
    if (selectedIndex !== -1) {
      activateTab(block, selectedIndex, false);
    }
  } // Check if mobile viewport and stacking is enabled
  const mediaQuery = window.matchMedia('(max-width: 600px)');
  const checkLayout = () => {
    const isMobile = mediaQuery.matches;
    const useMobileLayout = stackOnMobile && isMobile;
    return useMobileLayout;
  };

  // Build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tablist-${blockId}`;

  // The first cell of each row is the title of the tab
  // Store both the row and the heading together to maintain the relationship
  const tabData = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0)
    .map((child) => ({
      row: child,
      heading: child.firstElementChild,
    }));

  const existingSlugs = [];

  tabData.forEach((data, i) => {
    const { row: tabpanel, heading: tab } = data;
    const id = `tabpanel-${blockId}-tab-${i + 1}`;
    const tabTitle = tab.textContent.trim();

    // Generate unique slug for deep linking (scoped to this block)
    const baseSlug = generateSlug(tabTitle, existingSlugs);
    const slug = `${baseSlug}-block-${blockId}`;
    existingSlugs.push(slug);

    // Decorate tabpanel (the row itself becomes the panel)
    tabpanel.className = 'tabs-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');
    tabpanel.dataset.tabSlug = slug;

    // Build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;

    // Replace <p> tags with <span> inside button
    button.querySelectorAll('p').forEach((p) => {
      const span = document.createElement('span');
      span.innerHTML = p.innerHTML;
      // Copy attributes from p to span
      Array.from(p.attributes).forEach((attr) => {
        span.setAttribute(attr.name, attr.value);
      });
      p.replaceWith(span);
    });

    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.setAttribute('tabindex', i === 0 ? '0' : '-1');
    button.dataset.tabSlug = slug;

    button.addEventListener('click', () => {
      activateTab(block, i, true, true); // fromUser = true for click events
    });

    // Add the new tab list button to the tablist
    tablist.append(button);

    // Remove the tab heading from the DOM
    tab.remove();

    // Remove instrumentation attributes from nested elements
    if (button.firstElementChild) {
      const nestedElement = button.firstElementChild;
      [...nestedElement.attributes]
        .filter((attr) => attr.name.startsWith('data-aue-') || attr.name.startsWith('data-richtext-'))
        .forEach((attr) => nestedElement.removeAttribute(attr.name));
    }
  });

  // Add tablist to block initially (buildLayout will reorganize)
  block.prepend(tablist);

  // Build initial layout based on viewport
  const useMobileLayout = checkLayout();
  buildLayout(useMobileLayout);

  // Listen for viewport changes and rebuild layout
  if (stackOnMobile) {
    mediaQuery.addEventListener('change', (e) => {
      const shouldUseMobile = e.matches;
      buildLayout(shouldUseMobile);
    });
  }

  // Add keyboard navigation
  block.addEventListener('keydown', (e) => {
    handleKeydown(block, e);
  });

  // Add hover activation if configured
  if (activateOnHover) {
    // Use mouseover instead of mouseenter because mouseenter doesn't bubble
    block.addEventListener('mouseover', (e) => {
      // Check if target or any parent up to block is a tab button
      const tabButton = e.target.closest('.tabs-tab');
      if (tabButton && block.contains(tabButton)) {
        const buttons = Array.from(block.querySelectorAll('.tabs-tab'));
        const index = buttons.indexOf(tabButton);
        if (index !== -1) {
          activateTab(block, index, true, true); // fromUser = true for hover events
        }
      }
    });
  }

  // Handle hash deep linking on page load
  if (allowHashDeepLinks) {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const buttons = block.querySelectorAll('.tabs-tab');
      const matchingIndex = Array.from(buttons).findIndex(
        (btn) => btn.dataset.tabSlug === hash,
      );
      if (matchingIndex !== -1) {
        activateTab(block, matchingIndex, false);

        // Dispatch deep link analytics event
        const category = block.dataset.analyticsCategory || 'tabs';
        dispatchAnalyticsEvent('tabs_deep_link', {
          category,
          tabSlug: hash,
          tabIndex: matchingIndex,
        });
      }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      handleHashChange(block);
    });
  }
}
