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

/**
 * Gets the block resolution paths in priority order
 * @param {string} blockName The name of the block
 * @returns {string[]} Array of paths to try, in order
 */
export function getBlockPaths(blockName) {
  const brand = getCurrentBrand();
  const paths = [];

  // 1. Brand-specific block (highest priority)
  if (brand) {
    paths.push(`/brands/${brand}/blocks/${blockName}/${blockName}`);
  }

  // 2. Shared blocks (root/project-level)
  paths.push(`/blocks/${blockName}/${blockName}`);

  return paths;
}

/**
 * Resolves the CSS path for a block following the same resolution order
 * @param {string} blockName The name of the block
 * @returns {string[]} Array of CSS paths to try, in order
 */
export function getBlockCssPaths(blockName) {
  const brand = getCurrentBrand();
  const paths = [];

  // 1. Brand-specific CSS
  if (brand) {
    paths.push(`/brands/${brand}/blocks/${blockName}/${blockName}.css`);
  }

  // 2. Shared CSS (root/project-level)
  paths.push(`/blocks/${blockName}/${blockName}.css`);

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

/**
 * Checks if a resource exists by attempting to fetch it
 * @param {string} url The URL to check
 * @returns {Promise<boolean>} True if the resource exists
 */
export async function resourceExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Resolves the actual block path by checking existence
 * @param {string} blockName The name of the block
 * @returns {Promise<string|null>} The resolved path or null if not found
 */
export async function resolveBlockPath(blockName) {
  const paths = getBlockPaths(blockName);

  for (const path of paths) {
    const jsPath = `${window.hlx.codeBasePath}${path}.js`;
    if (await resourceExists(jsPath)) {
      return path;
    }
  }

  return null;
}

// Backward compatibility aliases (deprecated)
export const getCurrentSite = getCurrentBrand;
export const getSiteBasePath = getBrandBasePath;
