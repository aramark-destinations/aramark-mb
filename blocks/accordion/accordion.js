/**
 * Accordion Block
 * - Provides lifecycle hooks (onBefore/onAfter) for site-specific extensions
 * - Dispatches before/after events for advanced customization
 * - Implements core accordion/collapsible functionality
 * - Uses native details/summary elements for accessibility
 * - Supports optional subtitle column (col 2), configurable collapsed-by-default (col 4)
 * - Home/End keyboard navigation between summaries
 * - Respects prefers-reduced-motion
 *
 * TODO (accordion dev): Review +/− icon vs. arrow icon — see blocks/accordion/accordion.css
 * TODO (accordion dev): Review whether subtitle (h5) column is used; remove if not needed
 */

import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';

/**
 * Decorates the accordion block
 * @param {Element} block The accordion block element
 * @param {Object} options Configuration options
 * @param {Function} options.onBefore Lifecycle hook called before decoration
 * @param {Function} options.onAfter Lifecycle hook called after decoration
 */
export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('accordion:before', { detail: ctx, bubbles: true }));

  // === ACCORDION BLOCK LOGIC ===
  readVariant(block);
  const allSummaries = [];
  let accordionIndex = 0;

  [...block.children].forEach((row) => {
    const children = [...row.children];
    const hasAueResource = row.hasAttribute('data-aue-resource');
    const hasAnyContent = children.some((child) => child?.textContent?.trim());

    if (!hasAueResource && !hasAnyContent) {
      row.remove();
      return;
    }

    let collapsedByDefault = true;

    if (row.dataset.collapsedByDefault !== undefined) {
      collapsedByDefault = row.dataset.collapsedByDefault !== 'false';
    } else if (children[3] && children[3].textContent.trim()) {
      const configValue = children[3].textContent.trim().toLowerCase();
      collapsedByDefault = configValue !== 'false';
      children[3].remove();
    }

    const summaryDiv = children[0];
    const subtitleDiv = children[1];
    const contentDiv = children[2];

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';

    const titleContainer = document.createElement('div');
    titleContainer.className = 'accordion-title-container';

    if (summaryDiv) {
      const summaryText = document.createElement('h4');
      summaryText.className = 'accordion-title';
      summaryText.innerHTML = summaryDiv.textContent.trim();
      titleContainer.append(summaryText);
      moveInstrumentation(summaryDiv, summaryText);
    }

    if (subtitleDiv && subtitleDiv.textContent.trim()) {
      const subtitleText = document.createElement('h5');
      subtitleText.className = 'accordion-subtitle';
      subtitleText.innerHTML = subtitleDiv.textContent.trim();
      titleContainer.append(subtitleText);
      moveInstrumentation(subtitleDiv, subtitleText);
    }

    summary.append(titleContainer);

    const currentIndex = accordionIndex;
    summary.dataset.accordionIndex = currentIndex;

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    if (contentDiv) {
      if (contentDiv.querySelector('[data-aue-prop="content"]')) {
        body.append(contentDiv.querySelector('[data-aue-prop="content"]'));
      } else {
        body.append(...contentDiv.childNodes);
      }
    }

    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-item';
    details.append(summary, body);

    if (!collapsedByDefault) {
      details.open = true;
    }

    allSummaries.push(summary);

    details.addEventListener('toggle', () => {
      const title = summary.querySelector('.accordion-title')?.textContent.trim() || '';
      const eventName = details.open ? 'accordion_panel_expanded' : 'accordion_panel_collapsed';
      const accordionId = details.dataset.aueResource || `accordion-${currentIndex}`;

      window.adobeDataLayer?.push({
        event: eventName,
        eventInfo: {
          accordionTitle: title,
          accordionIndex: currentIndex,
          accordionId,
        },
        pageContext: {
          accordionInteraction: {
            action: details.open ? 'expand' : 'collapse',
            title,
            index: currentIndex,
            id: accordionId,
            timestamp: Date.now(),
          },
        },
      });
    });

    row.replaceWith(details);
    accordionIndex += 1;
  });

  allSummaries.forEach((summary) => {
    summary.addEventListener('keydown', (e) => {
      if (e.key === 'Home') {
        e.preventDefault();
        allSummaries[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        allSummaries[allSummaries.length - 1].focus();
      }
    });
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    block.classList.add('no-motion');
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('accordion:after', { detail: ctx, bubbles: true }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Accordion?.hooks
 */
export default (block) => decorate(block, window.Accordion?.hooks);
