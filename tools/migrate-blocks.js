#!/usr/bin/env node

/**
 * Migration Script: 3-tier to 2-tier Block Resolution
 * Merges base.js/base.css from /libs/blocks/ into /blocks/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const blocks = [
  'cards',
  'carousel', 
  'columns',
  'embed',
  'footer',
  'fragment',
  'header',
  'hero',
  'quote',
  'table',
  'tabs',
  'video'
];

function migrateBlock(blockName) {
  console.log(`\n📦 Migrating ${blockName}...`);
  
  const blockDir = path.join(rootDir, 'blocks', blockName);
  const libsDir = path.join(rootDir, 'libs', 'blocks', blockName);
  
  // Check if libs version exists
  if (!fs.existsSync(libsDir)) {
    console.log(`  ⚠️  No libs version found, skipping`);
    return false;
  }
  
  const baseJs = path.join(libsDir, 'base.js');
  const baseCss = path.join(libsDir, 'base.css');
  const blockJs = path.join(blockDir, `${blockName}.js`);
  const blockCss = path.join(blockDir, `${blockName}.css`);
  
  // Migrate JS
  if (fs.existsSync(baseJs)) {
    let baseContent = fs.readFileSync(baseJs, 'utf-8');
    
    // Update import paths (../../scripts -> ../../scripts)
    baseContent = baseContent.replace(
      /from ['"]\.\.\/\.\.\/\.\.\/scripts\//g,
      "from '../../scripts/"
    );
    
    // Update header comment
    baseContent = baseContent.replace(
      /\/\*\*\s*\n\s*\* Base \w+ Block/,
      `/**\n * ${blockName.charAt(0).toUpperCase() + blockName.slice(1)} Block`
    );
    
    // Remove "Base" from comments
    baseContent = baseContent.replace(/Base /g, '');
    
    fs.writeFileSync(blockJs, baseContent);
    console.log(`  ✅ Merged base.js → ${blockName}.js`);
  }
  
  // Migrate CSS (check if current block.css is just importing base.css)
  if (fs.existsSync(baseCss)) {
    const currentCss = fs.existsSync(blockCss) 
      ? fs.readFileSync(blockCss, 'utf-8') 
      : '';
    
    // If current CSS is empty or just has imports, replace entirely
    if (!currentCss.trim() || currentCss.includes('@import') || currentCss.trim().length < 50) {
      const baseCssContent = fs.readFileSync(baseCss, 'utf-8');
      fs.writeFileSync(blockCss, baseCssContent);
      console.log(`  ✅ Merged base.css → ${blockName}.css`);
    } else {
      console.log(`  ⚠️  ${blockName}.css has custom content, manual review needed`);
    }
  }
  
  // Copy README if it doesn't exist
  const libsReadme = path.join(libsDir, 'README.md');
  const blockReadme = path.join(blockDir, 'README.md');
  if (fs.existsSync(libsReadme) && !fs.existsSync(blockReadme)) {
    let readmeContent = fs.readFileSync(libsReadme, 'utf-8');
    
    // Update paths in README
    readmeContent = readmeContent.replace(/\/libs\/blocks\//g, '/blocks/');
    readmeContent = readmeContent.replace(/base\.js/g, `${blockName}.js`);
    readmeContent = readmeContent.replace(/base\.css/g, `${blockName}.css`);
    
    fs.writeFileSync(blockReadme, readmeContent);
    console.log(`  ✅ Copied README.md`);
  }
  
  return true;
}

console.log('🚀 Starting block migration from 3-tier to 2-tier...\n');
console.log('This will merge /libs/blocks/{block}/base.* into /blocks/{block}/*\n');

let migrated = 0;
let skipped = 0;

for (const block of blocks) {
  if (migrateBlock(block)) {
    migrated++;
  } else {
    skipped++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`✅ Migration complete!`);
console.log(`   Migrated: ${migrated} blocks`);
console.log(`   Skipped: ${skipped} blocks`);
console.log('='.repeat(60));
console.log('\nNext steps:');
console.log('1. Review migrated files for correctness');
console.log('2. Test blocks in Universal Editor');
console.log('3. Remove /libs/ directory: rm -rf libs/');
console.log('4. Update documentation');
