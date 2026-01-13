/**
 * Site Resolver
 * Detects the current site context from URL path and provides
 * block resolution order for the extensibility framework:
 * sites/{site}/blocks → /blocks → /libs/blocks
 */

/**
 * Detects the current site from the URL path
 * @returns {string|null} The site name or null if not in a site context
 */
export function getCurrentSite() {
  const { pathname } = window.location;
  const siteMatch = pathname.match(/^\/sites\/([^/]+)/);
  return siteMatch ? siteMatch[1] : null;
}

/**
 * Gets the block resolution paths in priority order
 * @param {string} blockName The name of the block
 * @returns {string[]} Array of paths to try, in order
 */
export function getBlockPaths(blockName) {
  const site = getCurrentSite();
  const paths = [];

  // 1. Site-specific block (highest priority)
  if (site) {
    paths.push(`/sites/${site}/blocks/${blockName}/${blockName}`);
  }

  // 2. Shared blocks (project-level)
  paths.push(`/blocks/${blockName}/${blockName}`);

  // 3. Base blocks from library (lowest priority, fallback)
  paths.push(`/libs/blocks/${blockName}/base`);

  return paths;
}

/**
 * Resolves the CSS path for a block following the same resolution order
 * @param {string} blockName The name of the block
 * @returns {string[]} Array of CSS paths to try, in order
 */
export function getBlockCssPaths(blockName) {
  const site = getCurrentSite();
  const paths = [];

  // 1. Site-specific CSS
  if (site) {
    paths.push(`/sites/${site}/blocks/${blockName}/${blockName}.css`);
  }

  // 2. Shared CSS
  paths.push(`/blocks/${blockName}/${blockName}.css`);

  // 3. Base CSS
  paths.push(`/libs/blocks/${blockName}/base.css`);

  return paths;
}

/**
 * Gets the site-specific code base path
 * @returns {string} The base path for site-specific code
 */
export function getSiteBasePath() {
  const site = getCurrentSite();
  return site ? `/sites/${site}` : '';
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
