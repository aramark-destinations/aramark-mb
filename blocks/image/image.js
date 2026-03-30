/**
 * Image Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core image block functionality
 * - All images are delivered via Dynamic Media with OpenAPI
 * - Supports DAM alt text auto-population via imageAltFromDam checkbox
 */

import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';
import { createDmPicture, fetchDmAltText } from '../../scripts/baici/utils/utils.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('image:before', { detail: ctx, bubbles: true }));

  readVariant(block);

  // In UE rendering, non-reference fields are output as positional rows after
  // the image reference row. Read them into block.dataset and remove the rows
  // so they don't render as visible text content.
  const configRows = Array.from(block.children).filter((row) => !row.querySelector('picture'));
  configRows.forEach((row, idx) => {
    const text = row.querySelector('p')?.textContent?.trim() ?? row.textContent?.trim() ?? '';
    if (idx === 0) block.dataset.imagealtfromdam = text;
    if (idx === 1) block.dataset.imagealt = text;
    row.remove();
  });

  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const altText = block.dataset.imagealt || img?.alt || '';

    if (img) {
      const breakpoints = [
        { media: '(min-width: 1200px)', width: '1200' },
        { media: '(min-width: 768px)', width: '768' },
        { width: '375' },
      ];
      const dmPicture = createDmPicture(img.src, altText, false, breakpoints);
      moveInstrumentation(img, dmPicture.querySelector('img'));
      picture.replaceWith(dmPicture);

      if (block.dataset.imagealtfromdam !== 'false') {
        fetchDmAltText(img.src).then((dmAlt) => {
          if (dmAlt) dmPicture.querySelector('img')?.setAttribute('alt', dmAlt);
        });
      }
    }
  }

  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('image:after', { detail: ctx, bubbles: true }));
}

export default (block) => decorate(block, window.ImageBlock?.hooks);
