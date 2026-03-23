---
name: eds/block-research
description: Research existing EDS block implementations before building new ones. Checks the project's /blocks/ directory, Adobe Block Collection, and Block Party community.
when_to_use: before creating any new block or when unsure if a block capability already exists
version: 1.0.0
---

# EDS Block Research

## Overview

Run this skill **before** `eds/block-development`. Prevents duplicate work and encourages reuse of existing patterns.

---

## Step 1: Check the Project's Existing Blocks

Read `blocks/` to see what already exists:

```
blocks/
├── accordion/        Expandable sections
├── banner/           Announcement bar / top banner
├── button/           Standalone CTA button
├── cards/            Card grid (4 layout orientations, optional card-as-link)
├── carousel/         Slideshow (touch/keyboard, indicators, auto-scroll)
├── columns/          Multi-column layout
├── embed/            Embed iframes/videos by URL
├── footer/           Site footer
├── form/             Form rendering (AEM Forms integration)
├── fragment/         Include another page's content inline
├── header/           Site header/nav
├── hero/             Full-width banner with image + text
├── image/            Standalone optimized image
├── modal/            Dialog/overlay (utility block, not standard pattern)
├── navigation/       Navigation utility module
├── navigation-group/ Nav group (desktop mega-menu support)
├── navigation-item/  Individual nav item
├── page/             Page-level wrapper
├── quote/            Pull quote / blockquote
├── search/           Site search UI
├── section/          Section wrapper with optional background
├── table/            Data table with scrolling/accessibility
├── tabs/             Tabbed content
├── text/             Rich text block
├── title/            Heading block
├── ugc-gallery/      UGC/social gallery (Pixlee integration)
└── video/            Video player (YouTube, Vimeo, MP4)
```

For each existing block, read its README.md to understand:
- What it does
- What variants it supports
- What hooks it exposes

**Decision criteria — can the existing block cover the need?**
- Can a variant/modifier class achieve the design?
- Can the existing hooks (`onBefore`/`onAfter`) add the needed behavior?
- Can CSS tokens alone change the appearance?

If yes to any of these: **extend don't duplicate**.

---

## Step 2: Check Adobe Block Collection

WebFetch: `https://www.aem.live/developer/block-collection`

Adobe maintains reference implementations for common EDS patterns. These are production-quality and EDS-idiomatic.

**When to use an Adobe block:**
- The capability is generic and not project-specific
- The Adobe implementation follows EDS conventions (it will)
- The block can be adapted to use this repo's Pattern A and token system

**How to evaluate an Adobe block for this repo:**
1. Does it export a `decorate(block)` function? (Likely yes)
2. Can Pattern A be applied without breaking its logic?
3. Does it use hardcoded styles that would conflict with our token system?
4. Does it require any external dependencies this repo doesn't have?

---

## Step 3: Check Block Party Community

WebFetch: `https://main--block-party--hlxsites.aem.live/`

Community-contributed blocks. More varied quality than Adobe's collection.

**When to use a Block Party block:**
- The capability is niche/specific and not in the Adobe collection
- The implementation looks clean and EDS-idiomatic
- It's a good starting point, not a copy-paste

**Quality filter — skip it if:**
- It uses inline styles instead of CSS classes
- No `decorate(block)` pattern
- Complex external dependencies
- Untested or clearly broken

---

## Step 4: Decision

| Situation | Action |
|-----------|--------|
| Existing project block covers it | Extend via hooks/variants — do NOT create new block |
| Existing block is close but needs new variant | Add variant to existing block |
| Adobe Block Collection has a match | Adapt the Adobe block with Pattern A + token system |
| Block Party has a reasonable match | Use as starting point, adapt fully |
| Nothing matches | Build from scratch using `eds/block-development` |

---

## Step 5: Compatibility Check (for external blocks)

Before adapting an external block, verify:

- [ ] The block's logic is compatible with EDS lifecycle (runs in `decorate`)
- [ ] No dependency on `customElements` or Web Components (EDS doesn't use these)
- [ ] No hardcoded `document.querySelector` of elements outside the block
- [ ] No global CSS that would bleed into other blocks
- [ ] Pattern A can be applied to wrap the logic
- [ ] CSS can be converted to use design tokens instead of hardcoded values

---

## Output

After running this skill, document your findings:

```
Block research for: {block name}

Existing project blocks checked:
- [block name] — [why it doesn't cover the need]

Adobe Block Collection:
- [found / not found] — [notes]

Block Party:
- [found / not found] — [notes]

Decision: [Build new / Adapt existing / Extend existing]
Reasoning: [1-2 sentences]
```

Then proceed with `eds/block-development`.
