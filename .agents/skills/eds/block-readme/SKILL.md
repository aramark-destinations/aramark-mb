---
name: eds/block-readme
description: Create or update a block README.md following the conventions.
when_to_use: after implementing a new block or making significant changes to an existing block
version: 1.0.0
---

# EDS Block README Management

## Overview

Block README files are **developer documentation** — for engineers who need to understand how the block works, extend it, or override it per brand.

Reference examples (read these before writing):
- `blocks/hero/README.md` — simple block, clean structure
- `blocks/cards/README.md` — complex block with variants, analytics, hooks

---

## Step 1: Read the Block

Before writing the README, read the full block implementation:
- `blocks/{name}/{name}.js` — implementation
- `blocks/{name}/{name}.scss` — CSS classes used
- `blocks/{name}/_{name}.json` — UE schema fields

---

## Step 2: README Template

```markdown
# {Block Name} Block

[1-2 sentences describing what the block does and its primary use case.]

## Features

- **[Feature 1]** — [brief description]
- **[Feature 2]** — [brief description]
- **Lifecycle hooks** — `onBefore` / `onAfter` for customization
- **Events** — dispatched before and after decoration

## Usage

### Basic Usage (Brand Override)

\`\`\`javascript
// brands/{brand}/blocks/{name}/{name}.js
import { decorate as rootDecorate } from '../../../blocks/{name}/{name}.js';

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
| `{variant-name}` | [What it changes] |

Add variant class in Universal Editor or via the block name (e.g., `Cards (horizontal)`).

## Universal Editor Fields

| Field | Label | Type | Description |
|-------|-------|------|-------------|
| `image` | Image | Reference | [What it's for] |
| `imageAlt` | Alt text | Text | [What it's for] |
| `text` | Text | Richtext | [What it's for] |

## DOM Structure

\`\`\`html
<div class="{name}">
  <div class="{name}-{element}">...</div>
  <div class="{name}-{element}">...</div>
</div>
\`\`\`

## CSS Classes

| Class | Description |
|-------|-------------|
| `.{name}` | Block root |
| `.{name}-{element}` | [What this element is] |

## Lifecycle Hooks

### `onBefore`
Called before block decoration. Context: `{ block, options }`.

Use for: adding variant classes, modifying DOM before layout, injecting brand-specific elements.

### `onAfter`
Called after block decoration. Context: `{ block, options }`.

Use for: adding analytics tracking, animations, brand-specific CTAs.

## Events

| Event | When | Detail |
|-------|------|--------|
| `{name}:before` | Before decoration | `{ block, options }` |
| `{name}:after` | After decoration | `{ block, options }` |

## Analytics

[Describe what analytics events are fired, under what conditions, and what data they include. If none, write "No analytics events."]

## See Also

- [Related Block](../{related}/README.md)
- [Extensibility Guide](../../docs/BLOCK-EXTENSIBILITY-GUIDE.md)
```

---

## Step 3: Fill in Each Section

**Description** — one factual sentence about what the block renders. Not marketing copy.

**Features** — concrete capabilities, not abstract concepts. "Supports 4 layout orientations" not "Highly customizable".

**Variants** — list every variant class that changes behavior or layout. Check `readVariant()` usage and the SCSS for variant selectors.

**UE Fields** — read directly from `_{name}.json`. Don't invent field names.

**DOM Structure** — trace the actual output, not the input. What HTML does `decorate()` produce?

**CSS Classes** — list every class applied by the JS, not just what exists in SCSS. These are the extension points for brand CSS overrides.

**Lifecycle Hooks** — describe what the before/after boundary actually means for this specific block. What state is ready when `onAfter` fires?

**Events** — list actual event names from the `dispatchEvent` calls in the JS.

**Analytics** — only document what exists. If the block has no `pushAnalyticsEvent` calls, write "No analytics events."

---

## Step 4: Keep it Accurate

Verify every claim against the actual code:
- Every CSS class in the README should exist in the JS or SCSS
- Every UE field in the README should exist in the JSON schema
- Every event name should match a `dispatchEvent` call

If you are uncertain about a section, leave a `<!-- TODO: verify -->` comment rather than guessing.
