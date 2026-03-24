/**
 * Site Resolver
 * Detects the current brand context and provides block resolution
 * order for the extensibility framework:
 * brands/{brand}/blocks → /blocks
 *
 * Brand detection priority:
 * 1. AEM page metadata 'brand' field (production — set via metadata sheet)
 * 2. URL path fallback /brands/{brand}/ (local development)
 */

import { getMetadata } from './aem.js';

/**
 * Detects the current brand from AEM metadata or URL path.
 * @returns {string|null} The brand name or null if not in a brand context
 */
export function getCurrentBrand() {
  // 1. AEM metadata (production — set via metadata sheet in AEM author)
  const metaBrand = getMetadata('brand');
  if (metaBrand) return metaBrand;

  // 2. URL path fallback (local dev — /brands/{brand}/)
  const { pathname } = window.location;
  const brandMatch = pathname.match(/^\/brands\/([^/]+)/);
  return brandMatch ? brandMatch[1] : null;
}

let brandOverrides = null;

/**
 * Sets the list of block names that have brand-specific JS overrides.
 * Call this once at startup after loading brands/{brand}/overrides.js.
 * @param {string[]} overrides Array of block names with brand overrides
 */
export function setBrandOverrides(overrides) {
  brandOverrides = overrides;
}

/**
 * Gets the block resolution paths in priority order.
 * Brand-specific JS path is only included if the block is listed in overrides.js.
 * @param {string} blockName The name of the block
 * @returns {string[]} Array of paths to try, in order
 */
export function getBlockPaths(blockName) {
  const brand = getCurrentBrand();
  const paths = [];

  // Brand-specific block only if explicitly declared in overrides.js
  if (brand && Array.isArray(brandOverrides) && brandOverrides.includes(blockName)) {
    paths.push(`/brands/${brand}/blocks/${blockName}/${blockName}`);
  }

  // Shared blocks (root/project-level)
  paths.push(`/blocks/${blockName}/${blockName}`);

  return paths;
}

/**
 * Gets the brand-specific code base path
 * @returns {string} The base path for brand-specific code
 */
export function getBrandBasePath() {
  const brand = getCurrentBrand();
  return brand ? `/brands/${brand}` : '';
}

// Backward compatibility aliases (deprecated)
export const getCurrentSite = getCurrentBrand;
export const getSiteBasePath = getBrandBasePath;
