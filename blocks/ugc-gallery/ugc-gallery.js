import { readBlockConfig, loadScript } from '../../scripts/aem.js';

let ugcNumber = 1;

/**
 * @param {HTMLElement} block
 * @returns {void}
 */
export default function decorate(block) {
  const config = readBlockConfig(block);
  const { widgetId, pixleeApiKey, pixleeScript } = config;

  if (!widgetId) {
    return;
  }

  block.replaceChildren();
  block.id = `ugc-${ugcNumber}`;
  block.style.display = 'block';
  ugcNumber += 1;

  loadDelayed(block, String(widgetId), pixleeApiKey, pixleeScript);
}

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
