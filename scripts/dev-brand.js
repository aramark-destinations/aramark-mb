#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Brand-aware local dev server launcher.
 *
 * Usage:
 *   pnpm start:brand lake-powell
 *   pnpm start:brand brand-dummy
 *
 * Each brand maps to an EDS preview URL that serves that brand's content
 * at root (/). This mirrors production where each brand has its own
 * custom domain serving content at root.
 *
 * Brand detection relies on AEM page metadata (`brand` field in the
 * metadata sheet) — same as production on custom domains.
 */

import { execSync } from 'child_process';
import {
  existsSync, readFileSync, readdirSync, statSync,
} from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Brand → EDS preview URL mapping.
 * Each brand site in AEM needs its own EDS cloud config or a shared config
 * that makes the content available at a known preview URL.
 *
 * Update this map when adding a new brand.
 */
const BRAND_URLS = {
  'lake-powell': 'https://main--lake-powell--blueacorninc.aem.page',
  'unbranded': 'https://main--unbranded--blueacorninc.aem.page',
  // 'brand-dummy': 'https://main--brand-dummy--blueacorninc.aem.page',
};

// Allow overrides via a local config file (not committed)
const localConfigPath = resolve(projectRoot, '.dev-brands.json');
if (existsSync(localConfigPath)) {
  try {
    const localConfig = JSON.parse(readFileSync(localConfigPath, 'utf-8'));
    Object.assign(BRAND_URLS, localConfig);
  } catch (e) {
    console.error(`Warning: Could not parse .dev-brands.json: ${e.message}`);
  }
}

const brand = process.argv[2];

if (!brand) {
  console.error('Usage: pnpm start:brand <brand-name>\n');
  console.error('Available brands:');

  const brandsDir = resolve(projectRoot, 'brands');
  try {
    readdirSync(brandsDir)
      .filter((f) => statSync(resolve(brandsDir, f)).isDirectory())
      .forEach((b) => {
        const url = BRAND_URLS[b] || '(no preview URL configured)';
        console.error(`  - ${b}  →  ${url}`);
      });
  } catch {
    console.error('  (no brands found in brands/ directory)');
  }
  process.exit(1);
}

const brandDir = resolve(projectRoot, 'brands', brand);
if (!existsSync(brandDir)) {
  console.error(`Brand "${brand}" not found. Expected directory: brands/${brand}/`);
  process.exit(1);
}

const url = BRAND_URLS[brand];
if (!url) {
  console.error(`No preview URL configured for brand "${brand}".`);
  console.error('Add it to BRAND_URLS in scripts/dev-brand.js or to .dev-brands.json');
  process.exit(1);
}

console.log(`Starting dev server for brand: ${brand}`);
console.log(`Content proxy: ${url}\n`);

execSync(
  `npx aem up --url ${url}`,
  { cwd: projectRoot, stdio: 'inherit' },
);
