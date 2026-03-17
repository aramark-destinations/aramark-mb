import { loadCSS, toCamelCase, readBlockConfig } from '../../scripts/aem.js';
import { fetchSvg } from '../../scripts/baici/utils/utils.js';
import { getStore } from '../../scripts/commerce.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const isDesktop = window.matchMedia('(min-width: 768px)');

/* Sanitizes a string for use as class name. */
function toClassName(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    : '';
}

export function resetMenuState(section) {
  const desktop = isDesktop.matches;

  if (!desktop) {
    const buttons = section.querySelectorAll('button.navigation-section-button[aria-expanded="true"], a.navigation-section-link[aria-expanded="true"], button.navigation-group-button[aria-expanded="true"], a.navigation-group-link[aria-expanded="true"]');
    buttons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
    section.querySelectorAll('.navigation-overlay').forEach((overlay) => overlay?.remove());
  } else {
    const sectionButtons = section.querySelectorAll('button.navigation-section-button, a.navigation-section-link');
    sectionButtons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
    const groupButtons = section.querySelectorAll('button.navigation-group-button, a.navigation-group-link');
    groupButtons.forEach((button) => {
      button.setAttribute('aria-expanded', 'true');
    });
  }
}

function updateDataSetFromAttributes(element) {
  [...element.attributes].forEach((attr) => {
    const { name, value } = attr;

    // Handle data-aue-* attributes → dataset.aue*
    if (name.startsWith('data-aue-')) {
      const dataKey = name.replace('data-aue-', '');
      element.dataset[toCamelCase(`aue-${dataKey}`)] = value;
      // Handle regular data-* attributes (not aue) → dataset.*
    } else if (name.startsWith('data-') && !name.startsWith('data-aue-')) {
      const dataKey = name.replace('data-', '');
      element.dataset[toCamelCase(dataKey)] = value;
      // Handle class attribute - add as actual CSS classes
    } else if (name === 'class') {
      // Classes are already applied, no action needed
      element.dataset.class = value;
    }
  });
}

function getOtherSectionButtons(currentButton) {
  const wrapper = currentButton.closest('ul.navigation-wrapper');
  if (!wrapper) return [];
  return Array.from(wrapper.querySelectorAll('button.navigation-section-button, a.navigation-section-link'))
    .filter(((btn) => btn !== currentButton));
}

function closeOnEscape(event) {
  if (event.defaultPrevented) return;
  if (event.code === 'Escape') {
    const openButton = document.querySelector('button.navigation-section-button[aria-expanded="true"], a.navigation-section-link[aria-expanded="true"]');
    if (openButton) {
      closeSection(openButton);
    }
  }
}

export function closeAllSections(container, expanded = false) {
  const buttons = container.querySelectorAll('button.navigation-section-button, a.navigation-section-link');
  buttons.forEach((button) => {
    if (expanded) {
      closeSection(button);
    } else {
      openSection(button);
    }
  });
}

function closeSection(button) {
  button.setAttribute('aria-expanded', 'false');
  const title = button.querySelector('.navigation-section-button-title, .navigation-section-link-title')?.textContent;
  const event = new CustomEvent('update:live:region', { detail: { message: `${title} Navigation Section Menu Closed` } });
  window.dispatchEvent(event);
  const submenu = document.getElementById(button.getAttribute('aria-controls'));
  window.removeEventListener('keydown', closeOnEscape);
  if (submenu) {
    submenu.toggleAttribute('inert', true);
    const additionalSubmenus = submenu.querySelectorAll('[aria-haspopup="true"]');
    if (additionalSubmenus.length > 0) {
      additionalSubmenus.forEach((subBtn) => {
        subBtn.setAttribute('aria-expanded', 'false');
      });
    }
    button.focus();
  }
}

function getRowCount(navigationSubMenu) {
  const items = navigationSubMenu.querySelectorAll('.navigation-item');
  return items.length;
}

function openSection(button) {
  button.setAttribute('aria-expanded', 'true');
  const title = button.querySelector('.navigation-section-button-title, .navigation-section-link-title')?.textContent;
  const event = new CustomEvent('update:live:region', { detail: { message: `${title} Navigation Section Menu Opened` } });
  window.dispatchEvent(event);
  if (isDesktop.matches) {
    const wrapper = button.closest('ul.navigation-wrapper');
    if (wrapper) {
      const parent = wrapper.parentElement;
      const buttonText = button.querySelector('.navigation-section-button-title, .navigation-section-link-title')?.textContent;
      const overlay = document.createRange().createContextualFragment(`
          <div class="navigation-overlay" role="button"><span class="sr-only">Close ${buttonText} Menu</span></div>
      `).firstElementChild;
      parent.appendChild(overlay);
      overlay.addEventListener('click', () => {
        closeSection(button);
        overlay.remove();
      });
    }
    window.addEventListener('keydown', closeOnEscape);
  }
  const submenu = document.getElementById(button.getAttribute('aria-controls'));
  if (submenu) {
    const rowCount = getRowCount(submenu);
    submenu.toggleAttribute('inert', false);
    const rows = Array(rowCount).fill('auto');
    rows[rows.length - 1] = '1fr';
    const rowTemplate = rows.join(' ');
    submenu.style.setProperty('--row-template', rowTemplate);
    submenu.querySelectorAll('.navigation-group').forEach((group) => {
      group.style.setProperty('--row-span', rowCount);
    });
    const firstMenuItem = submenu.querySelector('[role="menuitem"] a');
    firstMenuItem?.focus();
    const additionalSubmenus = submenu.querySelectorAll('[aria-haspopup="true"]');
    if (additionalSubmenus.length > 0) {
      additionalSubmenus.forEach((subBtn) => {
        if (isDesktop.matches && subBtn.getAttribute('aria-expanded') !== 'true') {
          subBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  }
}

export function updateSubMenuHeight(element) {
  const submenu = element.closest('.navigation-section-submenu');
  const rowCount = getRowCount(submenu);
  submenu.querySelectorAll('.navigation-group').forEach((group) => {
    group.style.setProperty('--row-span', rowCount);
  });
}

function toggleButton(button) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  const wrapper = button.closest('ul.navigation-wrapper');
  if (wrapper) {
    const parent = wrapper.parentElement;
    const existingOverlay = parent.querySelector('.navigation-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  }
  if (isExpanded) {
    closeSection(button);
  } else {
    getOtherSectionButtons(button).forEach((otherButton) => {
      if (otherButton.getAttribute('aria-expanded') === 'true') {
        closeSection(otherButton);
      }
    });
    openSection(button);
  }
}

function setEventListeners(button) {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleButton(button);
  });
}

function displaySubMenusForUe(button) {
  if (!button) return;
  button.setAttribute('aria-expanded', 'true');
  const submenu = button.nextElementSibling;
  if (submenu && submenu.classList.contains('navigation-section-submenu')) {
    submenu.removeAttribute('inert');
    const rowCount = getRowCount(submenu);
    const rows = Array(rowCount).fill('auto');
    rows[rows.length - 1] = '1fr';
    const rowTemplate = rows.join(' ');
    submenu.style.setProperty('--row-template', rowTemplate);
    submenu.querySelectorAll('.navigation-group').forEach((group) => {
      group.style.setProperty('--row-span', rowCount);
    });
  }
}

export async function autoBlockNavigationFragment(contain) {
  let container = contain;
  const isUe = container.hasAttribute('data-aue-resource') || container?.dataset?.aueResource !== undefined;
  try {
    await loadCSS(`${window.hlx.codeBasePath}/blocks/navigation/navigation.css`);
  } catch (error) {
    console.warn('Could not load navigation block CSS', error);
  }

  if (isUe) {
    if (!container.querySelector(':scope > div[data-aue-model="navigation-section"], :scope .navigation-section')) {
      return container;
    }

    try {
      const refParam = new URLSearchParams(window.location.search).get('ref');
      const cssUrl = `${window.hlx.codeBasePath}/blocks/navigation/navigation-ue.css${refParam ? `?ref=${refParam}` : ''}`;
      await loadCSS(cssUrl);
    } catch (error) {
      console.warn('Navigation CSS failed to load', error);
    }

    const hasNav = container.querySelector(':scope > nav.navigation');
    let nav = null;

    if (!hasNav) {
      nav = document.createElement('nav');
      nav.className = 'navigation';
      nav.append(...container.childNodes);
      container.appendChild(nav);
      container = nav;
    }
  }

  let navWrapper = null;
  const hasNavWrapper = container.querySelector('.navigation-wrapper');
  if (!hasNavWrapper) {
    navWrapper = document.createElement('ul');
    navWrapper.className = 'navigation-wrapper';
    navWrapper.setAttribute('role', 'menubar');
    const firstSection = container.querySelector(':scope > div.navigation-section:first-of-type, :scope > [data-aue-model="navigation-section"]:first-of-type');
    if (firstSection) {
      container.insertBefore(navWrapper, firstSection);
    } else {
      container.prepend(navWrapper);
    }
  } else {
    navWrapper = hasNavWrapper;
  }
  const sections = Array.from([
    ...navWrapper.querySelectorAll('.navigation-section, .section[data-type="navigation"], [data-aue-model="navigation-section"]:not(.section-metadata)'),
    ...container.querySelectorAll(':scope > div.navigation-section, :scope > div.section[data-type="navigation"], :scope > [data-aue-model="navigation-section"]:not(.section-metadata)'),
  ]);

  sections.forEach(async (originalSection, idx) => {
    let section = originalSection;
    const update = section.tagName !== 'LI';
    if (update) {
      const childContent = section.innerHTML;
      const li = document.createElement('li');
      li.innerHTML = childContent;
      Object.assign(li.dataset, section.dataset);
      moveInstrumentation(section, li);
      section.replaceWith(li);
      section = li;
    }
    navWrapper.appendChild(section);
    section.classList.add('navigation-section');
    section.setAttribute('role', 'menuitem');
    section.dataset.sectionStatus = 'initialized';
    const sectionMeta = section.querySelector('div.section-metadata, [data-aue-model="section-metadata"], .section-metadata, [data-aue-label="section metadata"]');

    const navigationSource = container?.querySelector('[data-navigation-source]');
    navigationSource?.remove();

    let meta = null;
    if (sectionMeta) {
      meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        if (key === 'custom-classes') {
          const styles = meta['custom-classes']
            .split(',')
            .filter((className) => className)
            .map((className) => toClassName(className.trim()));
          styles.forEach((className) => section.classList.add(className));
        } else {
          section.dataset[toCamelCase(key)] = meta[key];
        }
      });
      sectionMeta.remove();
    }

    updateDataSetFromAttributes(section);

    const childItems = section.querySelectorAll('.navigation-item, .navigation-group, div[data-aue-model="navigation-item"], div[data-aue-model="navigation-group"]');
    const noChildren = childItems.length === 0;
    let sectionButton = null;
    let existingSectionList = null;
    if (update) {
      if (section?.dataset?.title === undefined && section.hasAttribute('data-title')) {
        section.dataset.title = section.getAttribute('data-title');
      }

      if (section?.dataset?.link === undefined && section.hasAttribute('data-link')) {
        section.dataset.link = section.getAttribute('data-link');
      }

      const buttonTitle = section.dataset.title || 'Menu';
      const chevron = await fetchSvg('/icons/chevron-down.svg');
      const link = section?.dataset?.link !== undefined ? new URL(section.dataset.link).pathname.replace(/\.html$/, '') : false;
      const existingButton = section.querySelector('.navigation-section-button, .navigation-section-link');
      existingButton?.remove();

      if (noChildren && link) {
        sectionButton = document.createRange().createContextualFragment(`
          <a href="${link}" class="navigation-section-link">
            <span class="navigation-section-link-title">${buttonTitle}</span>
          </a>`).firstElementChild;
        section.prepend(sectionButton);
        section.querySelector('.navigation-section-submenu')?.remove();
        return;
      }

      const sectionButtonAriaAttributes = !isUe ? `aria-expanded="false" aria-label="Menu Section" aria-haspopup="true" aria-controls="nav-section-submenu-${idx}"` : '';

      sectionButton = document.createRange().createContextualFragment(`
        <button class="navigation-section-button" ${sectionButtonAriaAttributes}>
          <span class="navigation-section-button-title">${buttonTitle}</span>
          <span class="navigation-section-button-icon">${chevron}</span>
        </button>`).firstElementChild;
      section.prepend(sectionButton);
    }

    existingSectionList = section.querySelector('.navigation-section-submenu');

    if (!existingSectionList) {
      const sectionListAriaAttributes = !isUe ? 'inert' : '';
      existingSectionList = document.createRange().createContextualFragment(`
        <ul class="navigation-section-submenu" id="nav-section-submenu-${idx}" role="menu" ${sectionListAriaAttributes}></ul>
        `).firstElementChild;
      section.appendChild(existingSectionList);
    }

    if (sectionButton && existingSectionList && !isUe) {
      setEventListeners(sectionButton, existingSectionList);
    }

    const children = Array.from([...childItems]);

    if (children.length > 0) {
      children.forEach((child) => {
        if (child.classList.contains('navigation-item') || child.dataset.aueModel === 'navigation-item') {
          child.dataset.blockName = 'navigation-item';
        } else if (child.classList.contains('navigation-group') || child.dataset.aueModel === 'navigation-group') {
          child.dataset.blockName = 'navigation-group';
        }
        import('../../scripts/aem.js').then(async ({ loadBlock }) => {
          await loadBlock(child);
        });
        existingSectionList.appendChild(child);
      });
    }

    section.querySelectorAll(':scope > div[class*="-wrapper"]').forEach((wrapper) => {
      wrapper?.remove();
    });

    section.style.display = null;

    window.removeEventListener('close:navigation:section', (event) => closeSection(event.detail.section));
    window.addEventListener('close:navigation:section', (event) => {
      const button = event.detail.section;
      closeSection(button);
    });

    if (isUe) {
      displaySubMenusForUe(sectionButton);
    } else {
      window.adobeDataLayer = window.adobeDataLayer || [];
      section.querySelectorAll('.navigation-section-link').forEach((link) => {
        link.addEventListener('click', () => {
          window.adobeDataLayer.push({
            event: 'nav_link_click',
            nav: {
              level: 'section',
              label: link.textContent.trim(),
              url: link.href,
              store: getStore() || null,
            },
          });
        });
      });
    }
  });

  return container;
}
