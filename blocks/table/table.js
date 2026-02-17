/*
 * Table Block - Implementation
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorates the table block with lifecycle hooks and events
 * @param {HTMLElement} block - The table block element
 * @param {Object} options - Decoration options
 * @param {Function} options.onBefore - Hook called before decoration
 * @param {Function} options.onAfter - Hook called after decoration
 * @returns {Promise<void>}
 */
export async function decorate(block, options = {}) {
  const ctx = { block, options };

  // Lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('table:before', { detail: ctx }));

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');

  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);

    [...row.children].forEach((cell) => {
      const td = document.createElement(i === 0 && header ? 'th' : 'td');

      if (i === 0) td.setAttribute('scope', 'column');
      td.innerHTML = cell.innerHTML;
      tr.append(td);
    });
    if (i === 0 && header) thead.append(tr);
    else tbody.append(tr);
  });
  table.append(thead, tbody);
  block.replaceChildren(table);

  // Lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('table:after', { detail: ctx }));
}

/**
 * Default export for block decoration
 * @param {HTMLElement} block - The table block element
 * @returns {Promise<void>}
 */
export default (block) => decorate(block, window.Table?.hooks);
