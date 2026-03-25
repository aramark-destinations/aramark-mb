---
name: eds/figma-map
description: Map a Figma design section to a local EDS block. Extracts styles via the Figma MCP, maps to CSS tokens, creates a figma-audit.md, updates block SCSS, and produces an analysis report.
when_to_use: when starting a block implementation from Figma, or auditing an existing block against its Figma spec
version: 1.0.0
---

# EDS Figma Map

## Overview

This skill bridges the gap between Figma designs and EDS block implementations. It uses the connected Figma MCP (`mcp__figma__get_figma_data`) to extract visual specs from a design node, maps those specs to the project's CSS token system, and produces:

1. A `{block}-figma-audit.md` file in the block directory
2. Updated block SCSS with token usage verified and gap candidates documented
3. An inline analysis report

---

## Pre-flight

- [ ] Figma MCP is connected (`/mcp` shows `figma` as active)
- [ ] Know which block you're targeting (or have a Figma URL to identify it)
- [ ] Have either a Figma node URL or the base file URL

---

## Step 0: Identify the Target Node

### If a Figma URL with `node-id` was provided

Extract the file key and node-id from the URL:
- File key: the segment after `/design/` — e.g. `sf2qQ3I3BFFN4NdWCC04cw`
- Node ID: the `node-id` query param — e.g. `51-125` (URL-encoded as `51%3A125`)

Proceed directly to Step 1.

### If only a base file URL was provided (no node-id)

Call `mcp__figma__get_figma_data` with `depth=1` to list top-level frames:

```
file_key: {extracted file key}
depth: 1
```

Present the frame list to the developer and ask:
- Which frame maps to which block?
- Once confirmed, note the node-id and proceed to Step 1.

---

## Step 1: Fetch Design Data

Call `mcp__figma__get_figma_data` with the identified node:

```
file_key: {file key}
node_ids: [{node-id}]
```

From the response, extract and record:

| Property | Where to find it |
|---|---|
| Component name | `name` field on the top-level node |
| Fill colors | `fills[].color` (r/g/b/a → convert to hex) |
| Text colors | `style.fills[].color` on text nodes |
| Font family | `style.fontFamily` |
| Font size | `style.fontSize` |
| Font weight | `style.fontWeight` |
| Line height | `style.lineHeightPx` or `style.lineHeightPercent` |
| Letter spacing | `style.letterSpacing` |
| Padding | `paddingTop/Right/Bottom/Left` |
| Gap | `itemSpacing` |
| Corner radius | `cornerRadius` or `rectangleCornerRadii` |
| Width constraints | `absoluteBoundingBox.width`, `constraints` |

---

## Step 2: Identify the Target Block

Use the Figma component name and visual structure to match it to a block in `blocks/`:

| If the component looks like... | Map to block |
|---|---|
| accordion/expandable | `accordion` |
| announcement / top bar | `banner` |
| breadcrumb trail | `breadcrumbs` |
| CTA / button | `button` |
| card grid / card list | `cards` |
| image slideshow | `carousel` |
| multi-column | `columns` |
| site footer | `footer` |
| form / input fields | `form` |
| hero / banner with image | `hero` |
| standalone image | `image` |
| overlay / dialog | `modal` |
| pull quote / blockquote | `quote` |
| section wrapper / background | `section` |
| data table | `table` |
| tabbed content | `tabs` |
| rich text / body copy | `text` |
| heading / page title | `title` |
| video player | `video` |

If ambiguous, ask the developer to confirm the block before proceeding.

---

## Step 3: Map Styles to Tokens

Read `styles/root-tokens.scss` and `styles/fixed-tokens.scss` to get the full token list.

For each extracted Figma value, attempt to map to a token:

### Color mapping

**Critical: do NOT match colors by hex value.**

**Step 1 — Check the brand token file first.**

Read `brands/{brand}/tokens.css` to find the brand's actual override values for `--color-primary`, `--color-secondary`, and any other overridden tokens. Compare Figma colors against *brand token values*, not root token values.

- If a brand token value **matches** Figma → no gap, the block SCSS just needs to use the right token name.
- If a brand token value **differs** from Figma → **brand token gap**: record the gap pointing to `brands/{brand}/tokens.css`.
- Root token values (e.g. `--color-primary: #eb002a`) are unbranded placeholders — mismatches between root and Figma are **always expected and never gaps**.

**Step 2 — Match by semantic role.**

Block SCSS must only ever reference token *names* via `var(--color-primary)`. The resolved color is the brand's responsibility, not the block's.

| Figma color role | Token to use |
|---|---|
| Primary CTA / brand fill / dominant brand color | `var(--color-primary)` |
| Secondary brand color / dark background | `var(--color-secondary)` |
| White / light background | `var(--color-base-white)` |
| Black / dark text | `var(--color-base-black)` |
| Light neutral background | `var(--color-grey-50)` through `var(--color-grey-200)` |
| Mid grey / UI elements | `var(--color-grey-300)` through `var(--color-grey-600)` |
| Dark grey / text on light | `var(--color-grey-700)` through `var(--color-grey-900)` |
| Success green | `var(--color-alerts-success)` |
| Warning yellow | `var(--color-alerts-caution)` |
| Error red | `var(--color-alerts-error)` |
| Info blue | `var(--color-alerts-general)` |
| Tinted/shaded brand color | Derived token e.g. `var(--color-primary-100)` from `fixed-tokens.scss` |

**A Figma color is only a token gap if the brand token value differs from it, or if it has no semantic equivalent** (e.g. a decorative color that isn't primary, secondary, grey, or an alert). When recording a brand color gap, always cite `brands/{brand}/tokens.css` as the location — never `root-tokens.scss`.

### Typography mapping

| Figma value | Token |
|---|---|
| fontFamily = Inter / inter | `--body-font-family` |
| fontFamily = Montserrat | `--heading-font-family` |
| fontSize = 40 (desktop h1) | `--heading-font-size-h1` |
| fontSize = 32 (desktop h2) | `--heading-font-size-h2` |
| fontSize = 24 (desktop h3) | `--heading-font-size-h3` |
| fontSize = 20 (desktop h4) | `--heading-font-size-h4` |
| fontWeight = 400 | `--font-weight-normal` |
| fontWeight = 500 | `--font-weight-medium` |
| fontWeight = 600 | `--font-weight-semibold` |
| fontWeight = 700 | `--font-weight-bold` |

### Spacing mapping
Match padding/gap values to `--spacing-*` tokens (multiples of 8px).

### Radius mapping

| Figma value | Token |
|---|---|
| 0 | `--radius-none` |
| 4 | `--radius-xs` |
| 8 | `--radius-s` |
| 16 | `--radius-m` |
| 24 | `--radius-l` |
| 32 | `--radius-xl` |
| 999+ | `--radius-full` |
| 50% | `--radius-circle` |

### Token gap identification
Any Figma value with no matching token = **token gap**. Record:
- The Figma property name
- The raw value
- A suggested token name following the existing naming convention

---

## Step 4: Create `{block}-figma-audit.md`

Create `blocks/{block}/{block}-figma-audit.md`:

```markdown
# {Block Name} — Figma Audit

**Figma file:** https://www.figma.com/design/{file-key}/...
**Node URL:** https://www.figma.com/design/{file-key}/...?node-id={node-id}
**Audit date:** {YYYY-MM-DD}
**Block:** `blocks/{block}/`

---

## Token Matches

| Figma property | Value | CSS Token |
|---|---|---|
| Background color | #{hex} | `--color-primary` |
| ... | ... | ... |

---

## Token Gaps

These values have no semantic token equivalent. Consider whether they warrant a new token in `root-tokens.scss` (if system-wide) or should stay as a local candidate in the block SCSS. Brand color differences are NOT listed here — those live in `brands/{brand}/tokens.css`.

| Figma property | Value | Suggested token |
|---|---|---|
| ... | ... | `--{suggested-name}` |

---

## Structural Notes

{Any notes about component structure, variants, states, or constraints observed in the design.}
```

---

## Step 5: Update Block SCSS

Read `blocks/{block}/{block}.scss`.

### For matched tokens
Verify the block already uses the token. If a hardcoded value is found that matches a token, replace it:

```scss
// Before
background-color: #eb002a;

// After
background-color: var(--color-primary);
```

### For token gaps
Add a commented section at the bottom of the block SCSS (or after the last property group):

```scss
// ============================================================
// Token candidates — consider migrating to root-tokens.scss
// ============================================================
// --{suggested-token-name}: {value}; /* from Figma: {figma-property} */
```

Do not add an active `:root {}` block in the block file — these are candidates only.

---

## Step 6: Output Analysis Report

Produce a concise inline summary:

```
## Figma Map — {Block Name}

**Node:** https://www.figma.com/design/...?node-id={node-id}
**Block:** blocks/{block}/

### Token matches ({n} found)
- {Figma property} → `{token}` ✓

### Token gaps ({n} found)
- {Figma property}: `{value}` → suggested: `--{token-name}`
  Candidate added to block SCSS. Promote to `styles/root-tokens.scss` only if needed across multiple blocks.
  Note: brand color differences are NOT gaps — they belong in `brands/{brand}/tokens.css`.

### Files modified
- `blocks/{block}/{block}.scss` — token usage verified / gap candidates added
- `blocks/{block}/{block}-figma-audit.md` — created
```

---

## Figma MCP Tool Reference

```
mcp__figma__get_figma_data
  file_key: string       — the ID from the Figma URL after /design/
  node_ids: string[]     — one or more node IDs (use colon format: "51:125")
  depth: number          — how deep to traverse children (1 = top level only)
```

```
mcp__figma__download_figma_images
  file_key: string
  node_ids: string[]
  local_path: string     — where to save images
  image_scale: number    — 1–4x
```
