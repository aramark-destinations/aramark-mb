/**
 * Section Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 * - Implements core section block functionality
 * - Supports section types, backgrounds, overlays, gradients, and themes
 */

import { readVariant } from '../../scripts/scripts.js';

/**
 * Maps gradient direction values to CSS gradient directions
 */
const GRADIENT_DIRECTIONS = {
  'bottom-to-top': 'to top',
  'top-to-bottom': 'to bottom',
  'left-to-right': 'to right',
  'right-to-left': 'to left',
};

/**
 * Maps overlay values to rgba overlays
 */
const OVERLAY_MAP = {
  'darken-20': 'rgb(0 0 0 / 20%)',
  'darken-40': 'rgb(0 0 0 / 40%)',
  'lighten-20': 'rgb(255 255 255 / 20%)',
  'lighten-40': 'rgb(255 255 255 / 40%)',
};

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('section:before', { detail: ctx, bubbles: true }));

  // === SECTION BLOCK LOGIC ===
  readVariant(block);

  // Section type (full-width / contained / full-bleed)
  const sectionType = block.dataset.sectiontype;
  if (sectionType) {
    block.classList.add(`section-${sectionType}`);
  }

  // Section theme
  const sectionTheme = block.dataset.sectiontheme;
  if (sectionTheme) {
    block.classList.add(sectionTheme);
  }

  // Background image
  const bgImage = block.dataset.backgroundimage;
  if (bgImage) {
    block.style.backgroundImage = `url('${bgImage}')`;
    block.style.backgroundSize = 'cover';
    block.style.backgroundPosition = 'center';
    block.classList.add('has-background-image');
  }

  // Background color
  const bgColor = block.dataset.backgroundcolor;
  if (bgColor) {
    block.classList.add(`bg-${bgColor}`);
  }

  // Full overlay
  const fullOverlay = block.dataset.fulloverlay;
  if (fullOverlay && OVERLAY_MAP[fullOverlay]) {
    const overlay = document.createElement('div');
    overlay.className = 'section-overlay';
    overlay.style.backgroundColor = OVERLAY_MAP[fullOverlay];
    block.prepend(overlay);
  }

  // Linear gradient
  const gradient = block.dataset.lineargradient;
  if (gradient && GRADIENT_DIRECTIONS[gradient]) {
    const startOpacity = parseInt(block.dataset.gradientstartopacity || '0', 10) / 100;
    const endOpacity = parseInt(block.dataset.gradientendopacity || '100', 10) / 100;
    const direction = GRADIENT_DIRECTIONS[gradient];

    const gradientOverlay = document.createElement('div');
    gradientOverlay.className = 'section-gradient';
    gradientOverlay.style.background = `linear-gradient(${direction}, rgb(0 0 0 / ${startOpacity}), rgb(0 0 0 / ${endOpacity}))`;
    block.prepend(gradientOverlay);
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('section:after', { detail: ctx, bubbles: true }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Section?.hooks
 */
export default (block) => decorate(block, window.Section?.hooks);
