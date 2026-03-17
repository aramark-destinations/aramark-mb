import { readBlockConfig } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const SCROLL_INSTRUCTIONS = 'Scroll horizontally to view all columns. Use Shift + mouse wheel or arrow keys.';
const PLACEHOLDER_GLYPH = '-';
const PLACEHOLDER_TEXT = 'No data available';
const MEANINGFUL_CONTENT_SELECTORS = 'img, picture, svg, video, source, iframe, object, ul, ol, a, button, strong, em';

const copyAttributes = (source, target, attributes) => {
  attributes.forEach((attribute) => {
    const value = source.getAttribute(attribute);
    if (value) target.setAttribute(attribute, value);
  });
};

const normaliseText = (value = '') => value.replace(/\u00a0/g, ' ').trim();

const hasMeaningfulChild = (element) => Boolean(
  element.querySelector(MEANINGFUL_CONTENT_SELECTORS),
);

const isCaptionRow = (row) => row.classList.contains('table-caption') || row.dataset.tableCaption === 'true' || row.dataset.caption === 'true';

const shouldRenderRowHeader = (cell, index) => {
  if (index !== 0) return false;
  if (cell.hasAttribute('colspan') || cell.dataset.rowHeader === 'false') return false;
  if (cell.dataset.rowHeader === 'true') return true;
  if (cell.getAttribute('role') === 'rowheader') return true;
  if (cell.classList.contains('row-header')) return true;
  if (cell.getAttribute('headers')) return true;
  if (cell.dataset.header === 'row') return true;
  if (cell.dataset.tableCellType === 'header') return true;
  return false;
};

const createPlaceholderContent = () => {
  const fragment = document.createDocumentFragment();
  const placeholder = document.createElement('span');
  placeholder.className = 'table-cell-placeholder';
  placeholder.setAttribute('aria-hidden', 'true');
  placeholder.textContent = PLACEHOLDER_GLYPH;

  const assistive = document.createElement('span');
  assistive.className = 'visually-hidden';
  assistive.textContent = PLACEHOLDER_TEXT;

  fragment.append(placeholder, assistive);
  return fragment;
};

const isNumericContent = (textContent) => {
  const normalized = normaliseText(textContent);
  if (!normalized) return false;

  // Remove spaces (often used as thousand separator)
  const cleaned = normalized.replace(/\s/g, '');

  // US/UK format: 1,234.56 (commas as thousand separators, dot as decimal)
  const usFormat = /^-?(?:\d+|\d{1,3}(?:,\d{3})*)(?:\.\d+)?$/;

  // EU format: 1.234,56 (dots as thousand separators, comma as decimal)
  const euFormat = /^-?(?:\d+|\d{1,3}(?:\.\d{3})*)(?:,\d+)?$/;

  return usFormat.test(cleaned) || euFormat.test(cleaned);
};

const buildTableStructure = (block, { captionOverride = '', hasHeaderRow } = {}) => {
  const allRows = Array.from(block.querySelectorAll(':scope > div'));
  if (!allRows.length) return null;

  // Filter out Universal Editor configuration rows
  const hasUEItems = allRows.some((row) => row.hasAttribute('data-aue-resource'));
  const rows = allRows.filter((row) => {
    if (row.hasAttribute('data-aue-resource')) return true;
    if (hasUEItems) return false; // In UE mode, discard anything without resource (config)
    return true; // In legacy/test mode, keep all rows
  });

  // Remove filtered config rows from DOM
  allRows.forEach((row) => {
    if (!rows.includes(row)) row.remove();
  });

  const table = document.createElement('table');
  const tableHead = document.createElement('thead');
  const tableBody = document.createElement('tbody');

  const dataRows = [...rows];
  let captionText = captionOverride;

  if (!captionText && dataRows.length) {
    const firstRow = dataRows[0];
    if (isCaptionRow(firstRow)) {
      captionText = normaliseText(firstRow.textContent || '');
      dataRows.shift();
    }
  }

  const hasHeaderRowEnabled = typeof hasHeaderRow === 'boolean'
    ? hasHeaderRow
    : !block.classList.contains('no-header');

  dataRows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);

    const cells = Array.from(row.children);
    const isHeaderRow = hasHeaderRowEnabled && rowIndex === 0;

    cells.forEach((cell, cellIndex) => {
      const shouldBeRowHeader = !isHeaderRow && shouldRenderRowHeader(cell, cellIndex);
      const cellTag = isHeaderRow || shouldBeRowHeader ? 'th' : 'td';
      const cellElement = document.createElement(cellTag);
      moveInstrumentation(cell, cellElement);
      copyAttributes(cell, cellElement, ['colspan', 'rowspan', 'headers', 'id', 'aria-describedby', 'aria-labelledby', 'aria-label']);

      if (isHeaderRow) {
        cellElement.setAttribute('scope', 'col');
      } else if (shouldBeRowHeader) {
        cellElement.setAttribute('scope', 'row');
        cellElement.classList.add('table-cell--row-header');
      }

      const innerText = normaliseText(cell.textContent || '');
      const isEmpty = !innerText && !hasMeaningfulChild(cell);

      if (isEmpty) {
        cellElement.classList.add('table-cell--empty');
        cellElement.append(createPlaceholderContent());
      } else {
        cellElement.innerHTML = cell.innerHTML;
        if (!isHeaderRow && !shouldBeRowHeader && isNumericContent(cellElement.textContent || '')) {
          cellElement.classList.add('table-cell--numeric');
        }
      }

      tr.append(cellElement);
    });

    if (!tr.children.length) return;
    if (isHeaderRow) tableHead.append(tr);
    else tableBody.append(tr);
  });

  if (captionText) {
    const caption = document.createElement('caption');
    caption.textContent = captionText;
    table.append(caption);
  }

  if (tableHead.childElementCount) table.append(tableHead);
  table.append(tableBody);

  return {
    table,
    captionText,
  };
};

let tableIdCounter = 0;

const createScrollWrapper = (table) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Scrollable table');

  tableIdCounter += 1;
  const instructionsId = `table-scroll-instructions-${tableIdCounter}`;
  wrapper.setAttribute('aria-describedby', instructionsId);

  const instructions = document.createElement('span');
  instructions.id = instructionsId;
  instructions.className = 'table-scroll-instructions visually-hidden';
  instructions.textContent = SCROLL_INSTRUCTIONS;

  const startIndicator = document.createElement('div');
  startIndicator.className = 'table-overflow-indicator table-overflow-indicator--start';
  startIndicator.setAttribute('aria-hidden', 'true');

  const endIndicator = document.createElement('div');
  endIndicator.className = 'table-overflow-indicator table-overflow-indicator--end is-visible';
  endIndicator.setAttribute('aria-hidden', 'true');

  wrapper.append(instructions, startIndicator, endIndicator, table);

  const updateOverflowIndicators = () => {
    const { scrollLeft, scrollWidth, clientWidth } = wrapper;
    if (!clientWidth && !scrollWidth) return;
    const maxScroll = Math.max(scrollWidth - clientWidth, 0);

    if (maxScroll <= 1) {
      startIndicator.classList.remove('is-visible');
      endIndicator.classList.remove('is-visible');
      return;
    }

    if (scrollLeft > 1) startIndicator.classList.add('is-visible');
    else startIndicator.classList.remove('is-visible');

    if (scrollLeft < maxScroll - 1) endIndicator.classList.add('is-visible');
    else endIndicator.classList.remove('is-visible');
  };

  wrapper.addEventListener('scroll', updateOverflowIndicators, { passive: true });

  let cleanup = () => {};

  if (typeof window !== 'undefined') {
    if (window.ResizeObserver) {
      const resizeObserver = new window.ResizeObserver(updateOverflowIndicators);
      resizeObserver.observe(wrapper);
      cleanup = () => resizeObserver.disconnect();
    } else {
      window.addEventListener('resize', updateOverflowIndicators);
      cleanup = () => window.removeEventListener('resize', updateOverflowIndicators);
    }
  }

  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    window.requestAnimationFrame(updateOverflowIndicators);
  }

  return { wrapper, updateOverflowIndicators, cleanup };
};

export default async function decorate(block) {
  const config = readBlockConfig(block) || {};

  if (config.classes) {
    config.classes.split(',').forEach((c) => block.classList.add(c.trim()));
  }

  const captionFromConfig = normaliseText(config.caption || '');
  const captionFromDataset = normaliseText(block.dataset.caption || block.dataset.tableCaption || '');
  const headerRowSetting = typeof config['header-row'] === 'string'
    ? config['header-row'].toLowerCase() !== 'false'
    : undefined;
  const structure = buildTableStructure(block, {
    captionOverride: captionFromConfig || captionFromDataset,
    hasHeaderRow: headerRowSetting,
  });
  if (!structure) return;

  const { table, captionText } = structure;
  const { wrapper } = createScrollWrapper(table);

  if (captionText) delete block.dataset.tableMissingCaption;
  else block.dataset.tableMissingCaption = 'true';

  block.replaceChildren(wrapper);
}
