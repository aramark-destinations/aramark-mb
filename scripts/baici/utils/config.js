import { toCamelCase } from '../../aem.js';

/**
 * Configuration utility functions for AEM blocks
 * Handles normalization and parsing of block configuration values
 */

/**
 * Extract column value compatible with Universal Editor.
 * Priority: data-aue-prop (UE) → nested content → direct text
 */
export function getColValue(col) {
  if (!col) return '';

  // Priority 1: Universal Editor dataset attribute
  if (col.dataset.aueProp) {
    return col.dataset.aueProp.trim();
  }

  const buttonContainer = col.querySelector('p.button-container');
  if (buttonContainer) {
    return buttonContainer.textContent.trim();
  }

  const nested = col.querySelector('div, p, span');
  if (nested) {
    return nested.innerHTML.trim();
  }

  const picture = col.querySelector('picture');
  if (picture) {
    return picture.outerHTML.trim();
  }

  return col.innerHTML.trim();
}

/** Read configuration from block rows based on provided config options.
 * Each row corresponds to a config option.
 *
 * @param {HTMLElement} block - The block element containing config rows
 * @param {Array} configOptions - Array of config option objects with keys: key, defaultValue
 * @returns {Object} Configuration object with extracted values
 */
export function readConfig(block, configOptions, assignData = true) {
  const rows = Array.from([...block.children]);
  const config = {};
  rows.forEach((row, idx) => {
    const cols = Array.from(row.children);
    if (cols.length >= 2 || idx + 1 > configOptions.length) {
      return false;
    }

    let value = getColValue(cols[0]) || configOptions[idx].defaultValue;
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    config[configOptions[idx].key] = value;
    if (assignData) {
      block.dataset[toCamelCase(configOptions[idx].key)] = config[configOptions[idx].key];
    }
    row.remove();
    return true;
  });
  return config;
}

/**
 * Reads configuration from Universal Editor (AUE) dataset attributes.
 * @param {HTMLElement} block - The block element containing AUE configuration
 * @returns {Object} Configuration object with extracted values
 */
export function readUeConfig(block) {
  const config = {};
  const auePropElements = block.querySelectorAll(':scope > div:not([data-aue-resource]) [data-aue-prop]');
  auePropElements.forEach((el) => {
    const prop = el.getAttribute('data-aue-prop');
    const value = el.innerHTML.trim();

    if (el.nodeName === 'IMG' && el.parentElement.nodeName === 'PICTURE') {
      config[prop] = el.parentElement.outerHTML.trim();
    }

    if (el.querySelector('div, p, span')) {
      config[prop] = el.innerHTML.trim();
    }

    if (prop && value) {
      config[prop] = value;
    }

    config[`_${prop}`] = el;
  });
  return config;
}

/**
 * Reads key-value configuration from a block element.
 * Supports Universal Editor (AUE) dataset attributes, link elements, and key-value pair format.
 *
 * @param {HTMLElement} element - The block element containing configuration rows
 * @param {Array<string>} expectedKeys - Array of expected configuration keys
 * @returns {Object} Configuration object with extracted values
 */
export function readKeyValueConfig(element, expectedKeys) {
  const keySet = new Set(expectedKeys);
  const config = Object.fromEntries(expectedKeys.map((key) => [key, '']));

  const rows = [...element.children].filter((child) => child.tagName === 'DIV');

  rows.forEach((row) => {
    // Check for AUE prop attribute
    const aueProp = row.getAttribute('data-aue-prop');
    if (aueProp && keySet.has(aueProp)) {
      config[aueProp] = row.textContent?.trim() || '';
      return;
    }

    // Check for link in a div without data-aue-prop
    if (keySet.has('link')) {
      const linkEl = row.querySelector('a');
      if (linkEl) {
        config.link = linkEl.href;
        return;
      }
    }

    // Fallback: key-value pair format with cells
    const cells = [...row.children].filter((child) => child.tagName === 'DIV');
    if (cells.length >= 2) {
      const key = cells[0].textContent?.trim().toLowerCase();
      if (keySet.has(key)) {
        const valueCell = cells[1];
        const valueLinkEl = valueCell.querySelector('a');
        config[key] = (valueLinkEl && key.includes('link'))
          ? valueLinkEl.href
          : (valueCell.textContent?.trim() || '');
      }
    }
  });

  return config;
}
