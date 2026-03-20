---
name: eds/block-development
description: Full TDD workflow for building or modifying EDS blocks in the aramark-mb repo. Covers UE JSON schema, Pattern A boilerplate, CSS tokens, build commands, testing, and verification.
when_to_use: when creating a new block or making non-trivial changes to an existing block in /blocks/
version: 1.0.0
---

# EDS Block Development

## Overview

This skill covers the full workflow for creating or modifying a block in the aramark-mb EDS codebase. Follow these steps in order. Do not skip steps.

**Before starting:** Run `eds/block-research` first to check whether an existing block or external implementation should be used instead.

**Reference block:** `blocks/cards/cards.js` — the best example of a fully-featured block in this repo.

---

## Pre-flight Checklist

- [ ] Confirmed with `eds/block-research` that no existing block covers this need
- [ ] Have the ticket-details.md (or equivalent spec) for requirements
- [ ] Know whether this is a new block or modification of an existing one
- [ ] Know which UE JSON schema location to use (block dir vs `models/`)

---

## Step 1: Read Requirements

Create `blocks/{block-name}/ticket-details.md` if it doesn't exist. This is the source of truth for requirements.

Then read:
- `docs/BLOCK-EXTENSIBILITY-GUIDE.md` — hook patterns and brand override architecture
- `docs/BLOCK-RENDERING-BUILD-CONFIG.md` — token system and build pipeline
- The existing block's README.md if modifying

---

## Step 2: UE JSON Schema

Create or update `blocks/{block-name}/_{block-name}.json`. This defines the authoring contract — do this first, before writing JS.

**Schema structure:**

```json
{
  "definitions": [
    {
      "title": "Block Name",
      "id": "block-name",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "Block Name",
              "model": "block-name"
            }
          }
        }
      }
    }
  ],
  "models": [
    {
      "id": "block-name",
      "fields": [
        {
          "component": "reference",
          "valueType": "string",
          "name": "image",
          "label": "Image",
          "multi": false
        },
        {
          "component": "text",
          "valueType": "string",
          "name": "imageAlt",
          "label": "Alt text",
          "value": ""
        },
        {
          "component": "richtext",
          "name": "text",
          "value": "",
          "label": "Text",
          "valueType": "string"
        }
      ]
    }
  ],
  "filters": []
}
```

**Field component types:** `text`, `richtext`, `reference` (image/asset), `select`, `boolean`, `multiselect`

**After editing the schema, always run:**
```bash
pnpm build:json
```

This aggregates schemas into the root `component-*.json` files that Universal Editor reads. Without this, UE will not see the block.

**Note:** Default content blocks (button, image, page, section, text, title) have schemas in `models/` not in the block directory.

---

## Step 3: Write Tests (if block has meaningful logic)

Check if `jest.config.js` exists at the project root. If not, bootstrap the test infrastructure first — see `eds/block-testing` skill.

Keeper tests (committed, run with `pnpm test`):
- Pure JS logic: event handling, data transformation, state management
- Helper functions with clear input/output
- **Not** trivial DOM wiring or things better verified in the browser

Create tests at `test/blocks/{block-name}.test.js`.

```js
// test/blocks/my-block.test.js
import { someHelper } from '../../blocks/my-block/my-block.js';

describe('someHelper', () => {
  it('transforms input correctly', () => {
    expect(someHelper('input')).toBe('expected');
  });
});
```

---

## Step 4: Implement the Block (Pattern A)

All blocks in this repo use **Pattern A**. This is the required standard.

**JS boilerplate (`blocks/{name}/{name}.js`):**

```js
/**
 * {Block Name} Block
 * - Provides lifecycle hooks (onBefore/onAfter)
 * - Dispatches before/after events
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('{block-name}:before', { detail: ctx, bubbles: true }));

  // === BLOCK LOGIC ===
  readVariant(block);

  // ... your implementation here ...

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('{block-name}:after', { detail: ctx, bubbles: true }));
}

export default (block) => decorate(block, window.{BlockName}?.hooks);
```

**Key rules:**
- `{BlockName}` in the default export matches the title-cased block name (e.g., `window.Cards?.hooks`, `window.Hero?.hooks`)
- `options.onBefore?.(ctx)` MUST come before block logic
- `options.onAfter?.(ctx)` MUST come after block logic
- Hooks and events are boilerplate for future-proofing — do not over-engineer them

**Common imports (use only what you need):**

```js
// From aem.js
import { createOptimizedPicture, readBlockConfig, loadCSS, toClassName } from '../../scripts/aem.js';

// From scripts.js
import { moveInstrumentation, readVariant, moveAttributes } from '../../scripts/scripts.js';

// From baici utilities (for config/key-value reading)
import { readConfig, readKeyValueConfig, readUeConfig } from '../../scripts/baici/utils/config.js';
import { fetchSvg, debounce } from '../../scripts/baici/utils/utils.js';

// For analytics
import { pushAnalyticsEvent } from '../../scripts/analytics.js';
```

**Image optimization:**

```js
block.querySelectorAll('img').forEach((img) => {
  const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
  img.closest('picture')?.replaceWith(optimized);
});
```

**CSS class pattern:**

```js
// Good: .{blockname}-{element}
card.classList.add('cards-card-image');
card.classList.add('cards-card-body');

// Bad: arbitrary or BEM-style
card.classList.add('card__image'); // wrong
```

**Migrating an existing block (Pattern B or C → Pattern A):**

Pattern B (has hooks but wrong default export):
```js
// Change this:
export default decorate;
// To this:
export default (block) => decorate(block, window.{BlockName}?.hooks);
```

Pattern C (no hooks at all): Add `options = {}` parameter, wrap logic with `onBefore`/`onAfter` hook calls and events, update the default export.

---

## Step 5: CSS

Create `blocks/{block-name}/{block-name}.scss` (or `.css` directly if no SCSS preprocessing needed).

**Rules:**
- NEVER hardcode colors, fonts, or spacing
- Always use CSS custom properties from the token system

```scss
.{block-name} {
  // Layout and structure
}

.{block-name}-{element} {
  // Token usage examples:
  color: var(--color-primary);
  background-color: var(--color-secondary);
  padding: var(--spacing-016);
  border-radius: var(--radius-m);
  font-family: var(--font-family-body, system-ui, sans-serif);
}

@media (width >= 768px) {
  .{block-name} {
    // Responsive adjustments
  }
}
```

**Compile:**
```bash
pnpm build:css
```

Block CSS compiles **in-place** — `{name}.scss` produces `{name}.css` in the same directory. Not in `dist/`.

---

## Step 6: Lint, Test, Local Dev

```bash
pnpm lint          # Must pass — enforced by Husky pre-commit
pnpm test          # Run keeper tests
pnpm build:css     # Recompile CSS if changed
pnpm build:json    # Required if schema changed
pnpm start         # Local dev server — verify block renders correctly
```

Verify in the browser:
- Block renders correctly at `http://localhost:3000`
- No console errors
- CSS classes match the `.{blockname}-{element}` pattern
- `readVariant` sets `data-variant` if variants are used

---

## Step 7: Block README

Run `eds/block-readme` skill to create or update `blocks/{block-name}/README.md`.

---

## Step 8: Verification Checklist

Before calling this done:

- [ ] `pnpm lint` passes with zero errors/warnings
- [ ] `pnpm test` passes
- [ ] `pnpm build:css` run — CSS file present next to SCSS
- [ ] `pnpm build:json` run — schema changes aggregated (if schema was changed)
- [ ] Block renders correctly in local dev (`pnpm start`)
- [ ] No hardcoded color/font/spacing values in CSS
- [ ] Pattern A: `export function decorate(block, options = {})` with hooks + events + `window.{Name}?.hooks` in default export
- [ ] UE JSON schema has correct `id` matching block name
- [ ] README.md exists and is up to date
- [ ] ticket-details.md exists in block directory

---

## Anti-Patterns

| Do NOT | Do instead |
|--------|-----------|
| Hardcode `color: #004d99` | Use `color: var(--color-primary)` |
| Skip `pnpm build:json` after schema change | Always run it |
| Use `export default decorate` without hooks wiring | Use `export default (block) => decorate(block, window.{Name}?.hooks)` |
| Import from wrong path (`../scripts/aem.js`) | Use `../../scripts/aem.js` from block dir |
| Add inline styles | Use CSS classes with token variables |
| Skip the `options` parameter | Always include `options = {}` in `decorate` signature |
