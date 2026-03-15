# CTA Block Analysis

**Project:** Aramark Multi-Brand EDS
**Date:** 2026-03-15

This document maps how CTA-like content is handled today, identifies the real gaps, and recommends an implementation path.

---

## 1. Current State — What Each Block Can Do

### `hero` block
**Best for:** Full-page opening sections with a background image and heading.

**How it works:**
- Picture element is positioned `absolute; inset: 0; z-index: -1` — full-bleed background fill
- Text (h1) is centered with `max-width: var(--layout-max-width-content)`
- The wrapper overrides the standard section container: `.hero-wrapper { max-width: unset; padding: 0 }`

**CTA patterns it covers:**

| Pattern | Notes |
|---------|-------|
| Full-bleed background image + heading | ✅ Core use case |
| Text overlay on image (bgimage style) | ✅ Works |
| Button row below heading | ⚠️ Works visually — buttons render but are not structured into a dedicated actions area |
| Mid-page use | ❌ The `max-width: unset` wrapper override breaks section padding and layout when placed mid-page |
| Image optimization | ❌ Does not call `createOptimizedPicture()` — image is served at whatever size AEM provides |

**Authoring today:** Author adds a picture row and a text row. The block renders the picture as background and the text centered on top. There is no way to add an image *beside* text or control button placement.

---

### `columns` block
**Best for:** Content grids — text alongside text, image alongside text, multi-column data layouts.

**How it works:**
- Each row in the block table becomes a flex container; each cell is a flex child with `flex: 1`
- Cells containing only a `<picture>` get `.columns-img-col` — this controls mobile ordering (image first)
- Desktop (`≥ 900px`): `flex-direction: row`, `align-items: center`, `gap: var(--spacing-024)`
- Mobile: `flex-direction: column` (stacks vertically, image on top)

**CTA patterns it covers:**

| Pattern | Notes |
|---------|-------|
| Image left, text right | ✅ Works well — use a 2-column row with image in first cell |
| Image right, text left | ✅ Works — image cell gets `order: 0` on mobile regardless of authored position; on desktop order follows DOM |
| Two equal text columns | ✅ Works — 2-column row with text in both cells |
| Three or more columns | ✅ Works — `columns-N-cols` class added for CSS targeting |
| Image + text + button row (3-part CTA) | ❌ No clean path — the block has no concept of media / content / actions separation. A button row would be a third column, not a row below the text. |
| Full-bleed background image | ❌ Not supported — columns has no background image concept |
| Image optimization | ❌ Does not call `createOptimizedPicture()` — images served at original size |

**Authoring today:** Author creates a table with one row and two cells. Cell 1 = image, Cell 2 = heading + body + buttons. The image and text sit side by side on desktop.

**Key limitation for CTAs:** `columns` is a horizontal grid — all cells in a row sit *beside* each other. A typical CTA has a vertical structure within one side (image | [heading, body, buttons stacked]). This works if the text is in one cell, but there's no way to add a dedicated "actions" row that spans just the text side.

---

### `carousel` block
**Best for:** Rotating image galleries or slide decks.

| Pattern | Notes |
|---------|-------|
| Image with text overlay | ✅ Works — slides support picture + heading + body |
| Single static promotional section | ⚠️ Technically works but is semantically incorrect and adds prev/next/dot UI that doesn't make sense for a single slide |
| Full-bleed background | ✅ Carousel slides use absolute-positioned images as slide backgrounds |

---

### `cards` block
**Best for:** Grid of repeating content items (articles, menu items, team members).

| Pattern | Notes |
|---------|-------|
| Grid of image + text cards | ✅ Core use case; calls `createOptimizedPicture()` |
| Single featured CTA card | ⚠️ Works visually but authoring a 1-item cards block is unusual |
| Promotional section | ❌ Not the right semantic context |

---

## 2. Gaps — What Can't Be Done Today

### Gap 1: Mid-page full-bleed image section
A section mid-page with a background image, overlay text, and a button — like a "learn more" promotional break between content areas.

`hero` can't be used mid-page because `.hero-wrapper` overrides `max-width: unset; padding: 0`, which breaks the standard section grid. There is no current block that provides a background-image section with proper mid-page spacing.

**Workaround authors use today:** Plain section with a background color set via section metadata, manually formatted text. No image background.

---

### Gap 2: Centered text + buttons, no image
A section with a heading, one or two lines of body copy, and a row of 1–3 CTA buttons, all centered — no image involved.

`columns` requires a grid structure; a single-column layout with centered content and a constrained text width has no block to wrap it. Authors drop this into a plain content section but have no control over max-width, text alignment, or button layout as a semantic unit.

**Workaround authors use today:** Plain section text with centered alignment via section metadata. Buttons render via `decorateButtons()` but the section has no width constraint or padding control.

---

### Gap 3: Icon + text callout
A small icon (SVG or 48×48px image) to the left of a short text block — used for feature lists, benefit callouts, location markers.

`columns` technically works (2-column row, tiny image in first cell) but the image cell gets `flex: 1` — same width as the text cell — so the icon takes up 50% of the row width. There is no way to give the icon a fixed/small width without custom CSS.

**Workaround authors use today:** Either avoid the pattern or use an inline icon in the text cell.

---

## 3. Recommendations

Three options were considered:

### Option A — Minimal: Add variants to the `hero` block
Extend `hero` with a `mid-page` variant that removes the wrapper override and adds section padding. Add a `buttons` row concept.

- **Pro:** No new block; reuses the bgimage pattern already working.
- **Con:** `hero` is semantically "the page header." Adding mid-page promotional sections to it confuses the authoring mental model. The block name stops matching its purpose.

**Not recommended.**

---

### Option B — Targeted: New `cta` block for true gaps only
Build `cta` for only the 3 patterns `columns`/`hero` don't cover: `bgimage` (mid-page), `buttons`, `iconleft`. Document that `medialeft`/`mediaright` remain as `columns`.

- **Pro:** Minimal new code; clear that `columns` is unchanged.
- **Con:** Authors need two blocks for image+text layouts — `columns` for content grids, `cta` for promotional image+text. This split is hard to document clearly, and `columns` still lacks image optimization.

**Considered but not preferred.**

---

### Option C — Full: New `cta` block covering all promotional layouts (Recommended)

Build a dedicated `cta` block for all marketing/promotional section layouts. `columns` continues to exist for content grids. The semantic distinction:

> **`cta`** = editorial/promotional section. Has a defined visual weight. Used when the author intends to drive a user action. Always optimizes images.
>
> **`columns`** = content layout. Used for organizing information into a grid. No special visual weight implied.

This is the same decision that led to having both `cards` and `columns` — they both do multi-cell layouts, but with different semantic intent and structure.

**Variants to implement:**

| Variant | Layout | Row structure |
|---------|--------|---------------|
| `medialeft` | Image ~50% left, text + buttons right | Row 0: picture, Row 1: heading + body, Row 2: buttons |
| `mediaright` | Image ~50% right, text + buttons left | Same rows; CSS reverses order |
| `bgimage` | Full-bleed background image, text + buttons centered over it | Row 0: picture (background), Row 1: heading + body, Row 2: buttons |
| `buttons` | Centered text + button row, no image | Row 0: heading + body, Row 1: buttons |
| `iconleft` | Small icon (fixed width) left of text block | Row 0: icon image, Row 1: heading + body |
| `twocol` | Two equal text columns, no image | Row 0: text col 1, Row 1: text col 2 |

**Why this is better than `columns` for promotional content:**
- Calls `createOptimizedPicture()` — images resized for viewport
- Has semantic `.cta-media` / `.cta-content` / `.cta-actions` containers for CSS targeting
- CSS Grid (not flexbox) for `medialeft`/`mediaright` — more precise column control
- `bgimage` works mid-page with correct section spacing (no wrapper override)
- Fixed icon width for `iconleft` via CSS without affecting `columns`

---

## 4. Authoring Decision Tree

When deciding which block to use for a page section:

```
Is this a rotating set of slides?
  → YES: carousel

Is this the primary page header (top of page, full-screen image)?
  → YES: hero

Is this a promotional section (drives user action, has a visual weight)?
  → YES: cta (with appropriate variant)
       - Image beside text → medialeft or mediaright
       - Text + buttons only → buttons
       - Icon beside text → iconleft
  → Background image behind content → configure Section backgroundImage,
       then place a cta (buttons) block inside it

Is this a content layout (organizing information, repeating items)?
  → Grid of cards (articles, menu items) → cards
  → Side-by-side content columns → columns
  → Tabular data → table
```

---

## 5. CTA Block Specification

Implementation proceeds with Option C. The `bgimage` and `twocol` variants from the original analysis are not implemented — `bgimage` is replaced by composing a Section (with `backgroundImage` configured) and a `cta--buttons` block; `twocol` was removed as out of scope.

**Files:** `blocks/cta/cta.js` (new), `blocks/cta/cta.css` (new)

**Multi-brand:** All values reference CSS custom properties. Brand overrides go in `brands/{brand}/blocks/cta/cta.css`.

**Variants:**

| Variant class | Layout | Use case |
|---|---|---|
| `cta--medialeft` | Image ~50% left, text + buttons right | Editorial split section |
| `cta--mediaright` | Image ~50% right, text + buttons left | Same, mirrored |
| `cta--buttons` | Centered text block + button row, no image | Promotional text break; often inside a bg-image section |
| `cta--iconleft` | Fixed-width icon left, text right | Feature callout / benefit list item |

**Row structure (authored in Google Doc table):**

| Row | Content | Semantic class |
|-----|---------|----------------|
| Row 0 | Picture element or video link | `.cta-media` |
| Row 1 | Heading + body text | `.cta-content` |
| Row 2 | Button links | `.cta-actions` |

For `buttons` and `iconleft` variants, Row 0 is the first text block (no media row).

**Variant dispatch:** Author adds variant as a class name on the block in the Google Doc (e.g., `CTA (medialeft)`). `readVariant(block)` promotes this to `block.dataset.variant`. JS applies `cta--{variant}` class. CSS variant rules handle layout.

**CSS approach:**
- `medialeft` / `mediaright`: CSS Grid, `grid-template-columns: 1fr 1fr`, image in one column, content+actions stacked in the other
- `buttons`: no media row; content + actions centered, `max-width: var(--layout-max-width-narrow)`
- `iconleft`: CSS Grid, `grid-template-columns: var(--sizing-048) 1fr` (fixed icon column)
- Responsive: single column at `< 600px` for `medialeft`/`mediaright`

**bgimage pattern:** Not a block variant. Achieved by composing a Section with `backgroundImage` set + a `cta--buttons` block inside it. See `docs/SECTION-AND-CTA-IMPLEMENTATION.md` for the full authoring composition steps.

**Full implementation detail:** See `docs/SECTION-AND-CTA-IMPLEMENTATION.md`.
