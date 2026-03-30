/**
 * Image Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core image block functionality
 * - DM OpenAPI delivery used when a DM URL is available (UE author preview)
 * - Falls back to standard EDS image delivery for DAM paths
 *   (EDS reference serialization on aem.page)
 * - Supports DAM alt text auto-population via imageAltFromDam checkbox
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';
import { createDmPicture, fetchDmAltText, isDmUrl } from '../../scripts/baici/utils/utils.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('image:before', { detail: ctx, bubbles: true }));

  readVariant(block);

  // Block schema field order: image (row 0), imageAltFromDam (row 1), imageAlt (row 2 if present).
  // Positional separation handles both delivery modes without content-sniffing:
  // - UE author preview: image row has <picture> (AEM pre-renders the ContentReference)
  // - EDS delivery (aem.page): image row has <a href="/content/dam/..."> (Franklin serialization)
  const [imageRow, ...configRows] = Array.from(block.children);

  configRows.forEach((row, idx) => {
    const text = row.querySelector('p')?.textContent?.trim() ?? row.textContent?.trim() ?? '';
    if (idx === 0) block.dataset.imagealtfromdam = text;
    if (idx === 1) block.dataset.imagealt = text;
    row.remove();
  });

  // In EDS delivery, ContentReference fields serialize as <a href="/content/dam/...">[alt or path]</a>.
  // Synthesize a <picture> so the picture logic below applies uniformly.
  let picture = imageRow?.querySelector('picture');
  if (!picture && imageRow) {
    const link = imageRow.querySelector('a[href]');
    if (link) {
      const src = link.getAttribute('href');
      const linkText = link.textContent?.trim() ?? '';
      const altFromLink = linkText !== src ? linkText : '';
      const img = document.createElement('img');
      img.setAttribute('src', src);
      img.setAttribute('alt', altFromLink);
      picture = document.createElement('picture');
      picture.appendChild(img);
      link.replaceWith(picture);
    }
  }

  if (picture) {
    const img = picture.querySelector('img');
    const altText = block.dataset.imagealt || img?.alt || '';

    if (img) {
      const breakpoints = [
        { media: '(min-width: 1200px)', width: '1200' },
        { media: '(min-width: 768px)', width: '768' },
        { width: '375' },
      ];

      let dmPicture;
      if (isDmUrl(img.src)) {
        // DM OpenAPI delivery URL — use DM-native params and optionally fetch DAM alt text
        dmPicture = createDmPicture(img.src, altText, false, breakpoints);
        if (block.dataset.imagealtfromdam !== 'false') {
          fetchDmAltText(img.src).then((dmAlt) => {
            if (dmAlt) dmPicture.querySelector('img')?.setAttribute('alt', dmAlt);
          });
        }
      } else {
        // DAM path from EDS reference serialization — use standard EDS image delivery
        dmPicture = createOptimizedPicture(img.src, altText, false, breakpoints);
      }

      moveInstrumentation(img, dmPicture.querySelector('img'));
      picture.replaceWith(dmPicture);
    }
  }

  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('image:after', { detail: ctx, bubbles: true }));
}

export default (block) => decorate(block, window.ImageBlock?.hooks);
