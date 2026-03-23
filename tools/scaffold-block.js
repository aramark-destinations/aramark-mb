#!/usr/bin/env node
/**
 * Block Scaffolding Tool
 *
 * Usage: node tools/scaffold-block.js <block-name>
 *   or:  pnpm scaffold:block <block-name>
 *
 * Generates a Pattern A block skeleton with 4 files:
 *   blocks/{name}/{name}.js        — decorate() with lifecycle hooks
 *   blocks/{name}/{name}.scss      — token-based placeholder styles
 *   blocks/{name}/_{name}.json     — minimal UE JSON schema
 *   blocks/{name}/README.md        — developer documentation template
 *
 * Run `pnpm build:json` after editing the JSON schema.
 * Run `pnpm build:css` to compile SCSS to CSS (compiles in-place).
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Helpers ────────────────────────────────────────────────────────────────

function toPascalCase(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toTitleCase(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// ── Template generators ────────────────────────────────────────────────────

function generateJs(name) {
  const pascal = toPascalCase(name);
  return `import { readVariant } from '../../scripts/scripts.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('${name}:before', { detail: ctx, bubbles: true }));

  // === ${name.toUpperCase()} BLOCK LOGIC ===
  readVariant(block);
  // TODO: implement block logic here

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('${name}:after', { detail: ctx, bubbles: true }));
}

export default (block) => decorate(block, window.${pascal}?.hooks);
`;
}

function generateScss(name) {
  return `.${name} {
  // TODO: implement styles using design tokens only
  // Color tokens:   var(--color-brand-primary), var(--color-text-primary), etc.
  // Spacing tokens: var(--spacing-008) through var(--spacing-064)
  // Typography:     var(--font-size-body), var(--font-weight-bold), etc.
  // Layout:         var(--layout-max-width-content)
}
`;
}

function generateJson(name) {
  const title = toTitleCase(name);
  return JSON.stringify(
    {
      definitions: [
        {
          title,
          id: name,
          plugins: {
            xwalk: {
              page: {
                resourceType: 'core/franklin/components/block/v1/block',
                template: {
                  name: title,
                  model: name,
                },
              },
            },
          },
        },
      ],
      models: [
        {
          id: name,
          fields: [
            {
              component: 'richtext',
              name: 'text',
              value: '',
              label: 'Text',
              valueType: 'string',
            },
          ],
        },
      ],
      filters: [],
    },
    null,
    2,
  );
}

function generateReadme(name) {
  const title = toTitleCase(name);
  return `# ${title} Block

[1-2 sentences describing what the block does and its primary use case.]

## Features

- **[Feature 1]** — [brief description]
- **Lifecycle hooks** — \`onBefore\` / \`onAfter\` for customization
- **Events** — dispatched before and after decoration

## Usage

### Basic Usage (Brand Override)

\`\`\`javascript
// brands/{brand}/blocks/${name}/${name}.js
import { decorate as rootDecorate } from '../../../blocks/${name}/${name}.js';

export default (block) => rootDecorate(block, {
  onBefore: ({ block }) => {
    // Brand-specific setup
  },
  onAfter: ({ block }) => {
    // Brand-specific enhancements
  },
});
\`\`\`

## Variants

| Variant class | Behavior |
|---------------|----------|
| (none) | Default layout |

Add variant class in Universal Editor or via the block name (e.g., \`${title} (variant)\`).

## Universal Editor Fields

| Field | Label | Type | Description |
|-------|-------|------|-------------|
| \`text\` | Text | Richtext | Block body content |

## DOM Structure

\`\`\`html
<div class="${name}">
  <!-- TODO: document DOM structure after implementation -->
</div>
\`\`\`

## CSS Classes

| Class | Description |
|-------|-------------|
| \`.${name}\` | Block root |

## Lifecycle Hooks

### \`onBefore\`
Called before block decoration. Context: \`{ block, options }\`.

Use for: adding variant classes, modifying DOM before layout, injecting brand-specific elements.

### \`onAfter\`
Called after block decoration. Context: \`{ block, options }\`.

Use for: adding analytics tracking, animations, brand-specific CTAs.

## Events

| Event | When | Detail |
|-------|------|--------|
| \`${name}:before\` | Before decoration | \`{ block, options }\` |
| \`${name}:after\` | After decoration | \`{ block, options }\` |

## Analytics

No analytics events.

## See Also

- [Extensibility Guide](../../docs/BLOCK-EXTENSIBILITY-GUIDE.md)
- [Block Development Skill](../../.agents/skills/eds/block-development/SKILL.md)
`;
}

// ── Main ───────────────────────────────────────────────────────────────────

const [, , name] = process.argv;

if (!name) {
  console.error('Usage: pnpm scaffold:block <block-name>');
  console.error('Example: pnpm scaffold:block section-cta');
  process.exit(1);
}

if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error(`Error: Block name must be kebab-case (e.g., "section-cta"). Got: "${name}"`);
  process.exit(1);
}

const blockDir = join(ROOT, 'blocks', name);

if (existsSync(blockDir)) {
  console.error(`Error: Directory already exists: blocks/${name}/`);
  console.error('If you want to add files to an existing block, edit them directly.');
  process.exit(1);
}

mkdirSync(blockDir, { recursive: true });

const files = [
  [`${name}.js`, generateJs(name)],
  [`${name}.scss`, generateScss(name)],
  [`_${name}.json`, generateJson(name)],
  ['README.md', generateReadme(name)],
];

for (const [filename, content] of files) {
  const filepath = join(blockDir, filename);
  writeFileSync(filepath, content, 'utf8');
  console.log(`  created  blocks/${name}/${filename}`);
}

console.log('');
console.log(`Block scaffolded: blocks/${name}/`);
console.log('');
console.log('Next steps:');
console.log(`  1. Edit blocks/${name}/${name}.js  — implement block logic`);
console.log(`  2. Edit blocks/${name}/_${name}.json — define UE fields, then run: pnpm build:json`);
console.log(`  3. Edit blocks/${name}/${name}.scss — add styles using design tokens, then run: pnpm build:css`);
console.log(`  4. Update blocks/${name}/README.md  — document DOM structure and CSS classes`);
console.log('  5. Run: pnpm lint');
console.log('  6. Verify in local dev: pnpm start');
