import { getMetadata } from '../../scripts/aem.js';
import { readVariant } from '../../scripts/scripts.js';
import { getBrandCode } from '../../scripts/baici/utils/utils.js';

/**
 * Local storage key for breadcrumb category context
 */
const STORAGE_KEY = 'breadcrumb-context';

/**
 * Time-to-live for stored category context (30 seconds)
 */
const CONTEXT_TTL_MS = 30000;

/**
 * Check if analytics consent has been granted
 * @returns {boolean} True if consent granted
 */
function hasAnalyticsConsent() {
  // Check Adobe Client Data Layer for consent state
  if (window.adobeDataLayer && typeof window.adobeDataLayer.getState === 'function') {
    const state = window.adobeDataLayer.getState();
    if (state.consent && state.consent.analytics === false) {
      return false;
    }
  }
  // Default to true if no consent management is configured
  return true;
}

/**
 * Sanitize HTML from text to prevent XSS
 * @param {string} text Text that may contain HTML
 * @returns {string} Sanitized text
 */
function sanitizeHTML(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.textContent;
}

/**
 * Check if URL is same domain as current site
 * @param {string} url URL to validate
 * @param {string|null} currentHostname Optional hostname for testing (test-only parameter)
 *                                       If null, uses window.location.hostname
 * @returns {boolean} True if same domain
 */
function isSameDomain(url, currentHostname = null) {
  try {
    // Get hostname at runtime, not at module load time
    const hostname = currentHostname || window.location.hostname;
    const urlObj = new URL(url, window.location.origin);
    return urlObj.hostname === hostname;
  } catch (e) {
    return false;
  }
}

/**
 * Log breadcrumb warning with reason code
 * @param {string} code Reason code
 * @param {object} details Additional details
 */
function logBreadcrumbWarning(code, details) {
  console.warn(`BREADCRUMB: ${code}`, details);
}

/**
 * Restore category context from localStorage
 * @returns {object|null} Category context or null
 */
function restoreCategoryContext() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const context = JSON.parse(stored);
    const {
      categoryName, categoryUrl, brandCode, timestamp,
    } = context;

    // Validate required fields
    if (!categoryName || !categoryUrl || !brandCode || !timestamp) {
      logBreadcrumbWarning('INVALID_CONTEXT', { context });
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Validate brand matches current site
    const currentBrand = getBrandCode();
    if (brandCode !== currentBrand) {
      logBreadcrumbWarning('BRAND_MISMATCH', {
        stored: brandCode,
        current: currentBrand,
      });
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Validate TTL (30 seconds)
    const age = Date.now() - new Date(timestamp).getTime();
    if (age > CONTEXT_TTL_MS) {
      logBreadcrumbWarning('TTL_EXPIRED', { age_ms: age });
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Valid context - remove from storage and return
    localStorage.removeItem(STORAGE_KEY);

    return {
      categoryName,
      categoryUrl,
      age,
    };
  } catch (error) {
    console.error('BREADCRUMB: Failed to restore context', error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore errors removing item
    }
    return null;
  }
}

/**
 * Build breadcrumb trail from hierarchy and context
 * @param {object} options Configuration options
 * @returns {Array} Array of breadcrumb objects
 */
function buildBreadcrumbTrail(options) {
  const {
    hierarchy, currentTitle, labelOverride, parentOverride, categoryContext,
  } = options;

  const crumbs = [];

  // Add hierarchy crumbs
  if (hierarchy && Array.isArray(hierarchy) && hierarchy.length > 0) {
    hierarchy.forEach((item, index) => {
      crumbs.push({
        label: item.title,
        url: item.url,
        position: index,
        override_used: false,
      });
    });
  } else if (!categoryContext) {
    // No hierarchy and no category context - add Home
    crumbs.push({
      label: 'Home',
      url: '/',
      position: 0,
      override_used: false,
    });
  }

  // Insert category context if available (for PDPs)
  if (categoryContext) {
    // Ensure Home is first
    if (crumbs.length === 0 || crumbs[0].label !== 'Home') {
      crumbs.unshift({
        label: 'Home',
        url: '/',
        position: 0,
        override_used: false,
      });
    }

    // Insert category before current page
    crumbs.push({
      label: categoryContext.categoryName,
      url: categoryContext.categoryUrl,
      position: crumbs.length,
      override_used: false,
    });
  }

  // Insert parent override as an immediate-parent crumb
  if (parentOverride && parentOverride.trim()) {
    // Support test hostname override for unit tests
    const testHostname = options.block?.dataset?.testHostname || null;
    if (isSameDomain(parentOverride, testHostname)) {
      // Derive a label from the last non-empty path segment
      let overrideLabel;
      try {
        const { pathname } = new URL(parentOverride, window.location.origin);
        const segment = pathname.split('/').filter(Boolean).pop() || '';
        overrideLabel = segment
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      } catch (e) {
        overrideLabel = parentOverride;
      }
      crumbs.push({
        label: sanitizeHTML(overrideLabel),
        url: parentOverride,
        position: crumbs.length,
        override_used: true,
      });
    } else {
      logBreadcrumbWarning('INVALID_DOMAIN', { url: parentOverride });
    }
  }

  // Add current page
  const currentLabel = (labelOverride && labelOverride.trim()) ? labelOverride : currentTitle || 'Current Page';
  crumbs.push({
    label: sanitizeHTML(currentLabel),
    url: window.location.pathname,
    position: crumbs.length,
    override_used: !!(labelOverride && labelOverride.trim()),
    isCurrent: true,
  });

  return crumbs;
}

/**
 * Create a breadcrumb list item
 * @param {object} crumb Breadcrumb data
 * @returns {HTMLElement} List item element
 */
function createCrumbItem(crumb) {
  const li = document.createElement('li');
  li.className = 'breadcrumbs-item';

  if (crumb.isCurrent) {
    // Current page - plain text with aria-current
    const span = document.createElement('span');
    span.className = 'breadcrumbs-current';
    span.setAttribute('aria-current', 'page');
    span.textContent = crumb.label;
    li.appendChild(span);
  } else {
    // Ancestor - clickable link
    const a = document.createElement('a');
    a.href = crumb.url;
    a.className = 'breadcrumbs-link';
    a.textContent = crumb.label;
    a.dataset.analyticsId = `breadcrumb-${crumb.position}`;

    // Add click handler for analytics
    a.addEventListener('click', () => {
      dispatchBreadcrumbClick(crumb);
    });

    li.appendChild(a);
  }

  return li;
}

/**
 * Dispatch breadcrumb_rendered analytics event
 * @param {Array} crumbs Breadcrumb trail
 */
function dispatchBreadcrumbRendered(crumbs) {
  if (!hasAnalyticsConsent()) {
    /* eslint-disable no-console */
    console.log('BREADCRUMB: Analytics deferred (no consent)');
    /* eslint-enable no-console */
    return;
  }

  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: 'breadcrumb_rendered',
    breadcrumb: {
      crumb_count: crumbs.length,
      has_override: crumbs.some((c) => c.override_used),
      page_name: document.title,
      site: getBrandCode(),
    },
  });
}

/**
 * Dispatch breadcrumb_link_click analytics event
 * @param {object} crumb Clicked breadcrumb
 */
function dispatchBreadcrumbClick(crumb) {
  if (!hasAnalyticsConsent()) {
    return;
  }

  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: 'breadcrumb_link_click',
    breadcrumb: {
      target_url: crumb.url,
      target_position: crumb.position,
      override_used: crumb.override_used || false,
      page_name: document.title,
    },
  });
}

/**
 * Dispatch breadcrumb_context_restored analytics event
 * @param {object} context Restored category context
 */
function dispatchBreadcrumbContextRestored(context) {
  if (!hasAnalyticsConsent()) {
    return;
  }

  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: 'breadcrumb_context_restored',
    breadcrumb: {
      category_name: context.categoryName,
      category_url: context.categoryUrl,
      age_ms: context.age,
      site: getBrandCode(),
    },
  });
}

/**
 * Decorate the breadcrumbs block
 * @param {HTMLElement} block The breadcrumbs block element
 * @param {object} options Optional lifecycle hooks
 */
export async function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('breadcrumbs:before', { detail: ctx, bubbles: true }));

  readVariant(block);

  try {
    // Read page metadata
    const hierarchyData = getMetadata('breadcrumb');
    const currentTitle = getMetadata('breadcrumb-title') || getMetadata('og:title') || document.title;
    const labelOverride = getMetadata('breadcrumb-label-override');
    let parentOverride = getMetadata('breadcrumb-parent-override');

    // Read UE-authored parent override: aem-content field renders as a
    // single-cell row containing an <a> with a JCR path href.
    // Convert JCR path (/content/{brand}/path.html) to EDS path (/path).
    const parentOverrideLink = block.querySelector(':scope > div > div > a');
    if (parentOverrideLink) {
      const jcrPath = parentOverrideLink.getAttribute('href');
      if (jcrPath) {
        parentOverride = jcrPath.replace(/^\/content\/[^/]+/, '').replace(/\.html$/, '') || parentOverride;
      }
    }

    // Parse hierarchy
    let hierarchy = [];
    try {
      if (hierarchyData) {
        hierarchy = JSON.parse(hierarchyData);
      }
    } catch (e) {
      logBreadcrumbWarning('INVALID_HIERARCHY', { error: e.message });
    }

    // Check for category context (PDP use case)
    const categoryContext = restoreCategoryContext();

    // Dispatch analytics if context was restored
    if (categoryContext) {
      dispatchBreadcrumbContextRestored(categoryContext);
    }

    // Build breadcrumb trail
    const crumbs = buildBreadcrumbTrail({
      hierarchy,
      currentTitle,
      labelOverride,
      parentOverride,
      categoryContext,
    });

    // Create semantic navigation structure
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Breadcrumb');

    const ol = document.createElement('ol');
    ol.className = 'breadcrumbs-list';

    // Render breadcrumb items
    crumbs.forEach((crumb) => {
      const li = createCrumbItem(crumb);
      ol.appendChild(li);
    });

    nav.appendChild(ol);

    // Add aria-live region for dynamic updates
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'breadcrumbs-live-region';
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';

    if (categoryContext) {
      liveRegion.textContent = `Breadcrumb updated with ${categoryContext.categoryName}`;
    }

    nav.appendChild(liveRegion);

    // Replace block content
    block.innerHTML = '';
    block.appendChild(nav);

    // Dispatch analytics
    dispatchBreadcrumbRendered(crumbs);
  } catch (error) {
    console.error('BREADCRUMB: Failed to decorate', error);
    // Fallback rendering
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Breadcrumb');
    const ol = document.createElement('ol');
    ol.className = 'breadcrumbs-list';

    const homeItem = document.createElement('li');
    homeItem.className = 'breadcrumbs-item';
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.textContent = 'Home';
    homeLink.className = 'breadcrumbs-link';
    homeItem.appendChild(homeLink);
    ol.appendChild(homeItem);

    const currentItem = document.createElement('li');
    currentItem.className = 'breadcrumbs-item';
    const currentSpan = document.createElement('span');
    currentSpan.className = 'breadcrumbs-current';
    currentSpan.setAttribute('aria-current', 'page');
    currentSpan.textContent = document.title;
    currentItem.appendChild(currentSpan);
    ol.appendChild(currentItem);

    nav.appendChild(ol);
    block.innerHTML = '';
    block.appendChild(nav);
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('breadcrumbs:after', { detail: ctx, bubbles: true }));
}

export default (block) => decorate(block, window.Breadcrumbs?.hooks);
