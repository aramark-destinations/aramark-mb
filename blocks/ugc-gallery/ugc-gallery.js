import { readBlockConfig, loadScript } from '../../scripts/aem.js';

let ugcNumber = 1;

/**
 * @param {HTMLElement} block
 * @param {Object} options Configuration options
 * @param {Function} options.onBefore Lifecycle hook called before decoration
 * @param {Function} options.onAfter Lifecycle hook called after decoration
 * @returns {void}
 */
export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('ugc-gallery:before', { detail: ctx }));

  // === UGC-GALLERY BLOCK LOGIC ===
  const config = readBlockConfig(block);
  const { widgetId, pixleeApiKey, pixleeScript } = config;

  if (!widgetId) {
    options.onAfter?.(ctx);
    block.dispatchEvent(new CustomEvent('ugc-gallery:after', { detail: ctx }));
    return;
  }

  block.replaceChildren();
  block.id = `ugc-${ugcNumber}`;
  block.style.display = 'block';
  ugcNumber += 1;

  loadDelayed(block, String(widgetId), pixleeApiKey, pixleeScript);

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('ugc-gallery:after', { detail: ctx }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.UgcGallery?.hooks
 */
export default (block) => decorate(block, window.UgcGallery?.hooks);

/**
 * @param {HTMLElement} block
 * @param {string} widgetId
 * @param {string} apiKey
 * @param {string} scriptSrc
 * @returns {void}
 */
function loadDelayed(block, widgetId, apiKey, scriptSrc) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadUgc(block.id, widgetId, apiKey, scriptSrc);
    }
  });
  setTimeout(() => observer.observe(block), 500);
}

/**
 * @param {string} containerId
 * @param {string} widgetId
 * @param {string} apiKey
 * @param {string} scriptSrc
 * @returns {Promise<void>}
 */
async function loadUgc(containerId, widgetId, apiKey, scriptSrc) {
  if (!window.Pixlee) {
    if (scriptSrc) {
      await loadScript(scriptSrc);
    }
    if (apiKey) {
      window.Pixlee?.init({ apiKey });
    }
  }
  window.Pixlee?.addSimpleWidget({ containerId, widgetId });
  window.Pixlee?.resizeWidget();
}
