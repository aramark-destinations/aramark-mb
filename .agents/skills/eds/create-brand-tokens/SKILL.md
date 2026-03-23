---
name: eds/create-brand-tokens
description: Create or update a brand token CSS file for a property site. Only override what differs from root.
when_to_use: when creating tokens for a new brand or updating an existing brand's visual identity without full site spinup
version: 1.0.0
---

# Create Brand Tokens

## Overview

Brand tokens are the primary mechanism for visual differentiation across the 30+ property sites. Each brand gets a single `tokens.css` file that overrides root token values. Everything not overridden falls back to root defaults automatically via CSS cascade.

**Key principle:** Only include tokens that DIFFER from root. An empty `tokens.css` is valid (see `brands/unbranded/tokens.css`).

**Reference implementation:** `brands/{{brand}}/tokens.css`

---

## Pre-flight

- [ ] Know the brand name (lowercase, hyphenated — e.g., `two-words`, `this-example`)
- [ ] Have the brand's primary and secondary colors (hex values)
- [ ] Know the brand's font choices (if different from root default Roboto)
- [ ] Read `styles/root-tokens.scss` for the full list of overridable tokens
- [ ] Read `styles/fixed-tokens.scss` to understand derived tokens (color-mix shades)

---

## Step 1: Create Brand Directory

If the brand directory doesn't exist yet:

```bash
mkdir -p brands/{{brand}}
```

If running full site spinup, use `eds/site-spinup` instead — it handles directory creation, README, registration, and more.

---

## Step 2: Read Root Tokens

Read `styles/root-tokens.scss` to see all available tokens. These are organized by category:

### Overridable Token Categories

| Category | Token prefix | Common overrides |
|---|---|---|
| **Brand colors** | `--color-primary`, `--color-secondary` | Almost always overridden |
| **Grey scale** | `--color-grey-50` through `--color-grey-900` | Rarely overridden |
| **Alert colors** | `--color-alerts-*` | Rarely overridden |
| **Border radius** | `--radius-*` | Override for sharper/rounder brand feel |
| **Text colors** | `--text-light-*`, `--text-dark-*` | Override if brand uses non-standard text colors |
| **Typography weights** | `--font-weight-*` | Override if brand font has different weight values |
| **Line heights** | `--line-height-*` | Rarely overridden |
| **Layout widths** | `--layout-max-width-*` | Rarely overridden |
| **Transitions** | `--transition-duration-*` | Rarely overridden |
| **Icon sizes** | `--icons-size-*` | Rarely overridden |
| **Buttons** | `--button-*` | Override for brand-specific button styling |
| **Inputs** | `--input-*` | Rarely overridden |

**Note:** Font family tokens are defined in `styles/styles.scss` (`--body-font-family`, `--heading-font-family`), not in `root-tokens.scss`. Brand tokens can still override them.

### Derived tokens (DO NOT override directly)

`styles/fixed-tokens.scss` generates shade/tint scales from the base colors using CSS `color-mix()`. These automatically recalculate when you override `--color-primary` or `--color-secondary`. Do not override the derived tokens — override the base values instead.

---

## Step 3: Create Token File

Create `brands/{{brand}}/tokens.css` following this template:

```css
/* ==========================================================================
   {Brand Name} — Brand Design Tokens
   Override root-tokens.css values for the {Brand Name} brand site.

   These values are loaded at runtime when the brand is detected
   (via AEM metadata or URL path). They override the root tokens
   through CSS cascade specificity (loaded after styles.css).

   Only include tokens that DIFFER from root-tokens.css defaults.
   ========================================================================== */

:root {
  /* Brand Colors */
  --color-primary: #{primary-hex};
  --color-secondary: #{secondary-hex};

  /* Typography (only if different from root) */
  /* --body-font-family: '{Brand Body Font}', system-ui, sans-serif; */
  /* --heading-font-family: '{Brand Heading Font}', serif; */

  /* Border Radius (only if brand has a different feel) */
  /* --radius-s: 4px; */
  /* --radius-m: 8px; */

  /* Button (only if brand buttons differ) */
  /* --button-border-radius: 4px; */
}
```

**Rules:**
- Use the exact file header comment pattern (matches `{{brand}}/tokens.css`)
- Wrap all tokens in `:root { }`
- Comment out tokens that aren't overridden — this serves as documentation of what's available
- Only uncomment and set values that differ from root

---

## Step 4: Add Brand Fonts (if applicable)

If the brand uses fonts other than Roboto, you need both the token override and the font files:

1. Add font files to `fonts/` directory (woff2 format preferred)
2. Add `@font-face` declarations — either in the brand's `tokens.css` or in a separate brand stylesheet
3. Override the font family tokens:

```css
:root {
  --body-font-family: '{Brand Font}', system-ui, sans-serif;
  --heading-font-family: '{Brand Heading Font}', serif;
}
```

**Always include fallback stacks.** Never set a font family without a system fallback.

---

## Step 5: Validate Token Values

Check each overridden value:

| Check | Rule |
|---|---|
| Hex colors | Must be valid 3, 4, 6, or 8 character hex (e.g., `#fff`, `#0066cc`) |
| Font families | Must include fallback stack (e.g., `'Montserrat', sans-serif`) |
| Radius values | Must use `px`, `%`, or named values; be consistent with the scale |
| Spacing values | Must use `px` or `rem`; maintain proportional relationships |
| No `!important` | Never use `!important` — cascade order handles specificity |

---

## Step 6: Verify Cascade

After creating the token file, verify it works:

### Local development
```bash
pnpm start:brand {{brand}}
# Opens http://localhost:3000 with the brand's tokens active
```

### DevTools verification
1. Open browser DevTools
2. Inspect any element
3. In the Computed tab, verify `--color-primary` resolves to the brand value
4. Check that derived colors (tints/shades) updated automatically

### Visual verification
- All blocks should render with brand colors — no unbranded colors unless that IS the brand color
- Typography should use brand fonts if overridden
- Button styles, radius, and spacing should match brand expectations

---

## Overridable Token Reference

Complete list from `root-tokens.scss` with defaults:

| Token | Default Value | Category |
|---|---|---|
| `--color-primary` | `#eb002a` | Brand color |
| `--color-secondary` | `#022035` | Brand color |
| `--color-base-white` | `#fff` | Base |
| `--color-base-black` | `#000` | Base |
| `--color-grey-50` | `#f6f9fb` | Grey scale |
| `--color-grey-100` | `#e7ecf1` | Grey scale |
| `--color-grey-200` | `#c4ccd8` | Grey scale |
| `--color-grey-300` | `#abb5c5` | Grey scale |
| `--color-grey-400` | `#727f96` | Grey scale |
| `--color-grey-500` | `#4f5b76` | Grey scale |
| `--color-grey-600` | `#3f4b66` | Grey scale |
| `--color-grey-700` | `#2e3a55` | Grey scale |
| `--color-grey-800` | `#152a3f` | Grey scale |
| `--color-grey-900` | `#041526` | Grey scale |
| `--color-alerts-success` | `#008545` | Alerts |
| `--color-alerts-caution` | `#edc700` | Alerts |
| `--color-alerts-error` | `#d73044` | Alerts |
| `--color-alerts-general` | `#0084ff` | Alerts |
| `--radius-none` | `0px` | Border radius |
| `--radius-xs` | `4px` | Border radius |
| `--radius-s` | `8px` | Border radius |
| `--radius-m` | `16px` | Border radius |
| `--radius-l` | `24px` | Border radius |
| `--radius-xl` | `32px` | Border radius |
| `--radius-full` | `999px` | Border radius |
| `--radius-circle` | `50%` | Border radius |
| `--font-weight-normal` | `400` | Typography |
| `--font-weight-medium` | `500` | Typography |
| `--font-weight-semibold` | `600` | Typography |
| `--font-weight-bold` | `700` | Typography |
| `--line-height-tight` | `1` | Typography |
| `--line-height-snug` | `1.25` | Typography |
| `--line-height-normal` | `1.6` | Typography |
| `--line-height-relaxed` | `1.75` | Typography |
| `--layout-max-width-content` | `1200px` | Layout |
| `--layout-max-width-narrow` | `900px` | Layout |
| `--transition-duration-fast` | `0.2s` | Transitions |
| `--transition-duration-normal` | `0.3s` | Transitions |
| `--transition-duration-slow` | `0.5s` | Transitions |
| `--button-border-radius` | `2.4em` | Buttons |
| `--button-font-weight` | `var(--font-weight-medium)` | Buttons |

---

## Anti-Patterns

| Do NOT | Do instead |
|--------|-----------|
| Copy all root tokens into brand file | Only include tokens that differ from root |
| Override derived tokens from `fixed-tokens.scss` | Override the base color values — derived tokens recalculate |
| Use `!important` | Rely on CSS cascade (brand tokens load after root) |
| Set font family without fallback stack | Always include generic fallback |
| Create brand-specific block CSS here | Use `brands/{brand}/blocks/{block}/` for block overrides (discouraged) |
| Hard-code values in block CSS instead of adding a token | Add to root-tokens.scss if it's a system-level value, or use existing tokens |
