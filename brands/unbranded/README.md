# Unbranded (Default)

This directory serves as the **default fallback brand** — used when no specific brand is detected. It provides baseline token values and serves as a reference implementation for creating new brands.

## Structure

```
brands/unbranded/
├── README.md        # This file
├── tokens.css       # Default design tokens (CSS custom properties)
├── blocks/          # (Optional) Block behavior overrides
│   └── {block}/     # Override block logic from /blocks (root)
└── scripts/         # (Optional) Brand-specific scripts if needed
```

## Purpose

The unbranded brand exists to:

1. **Provide sensible defaults** — baseline token values when no brand is active
2. **Serve as a template** — reference for creating new brand directories
3. **Support local development** — a working brand without requiring brand-specific assets

## Design Tokens

`tokens.css` contains default values that override `/styles/root-tokens.css`. Since this is the unbranded default, these values should remain generic and neutral.

### How It Works

1. Root tokens are defined in `/styles/root-tokens.css` (imported via the `styles.css` → `fixed-tokens.css` → `root-tokens.css` chain)
2. `scripts.js` falls back to `unbranded` when no brand is detected
3. `loadCSS()` injects `brands/unbranded/tokens.css`
4. Tokens override root values via CSS cascade

## Block Overrides

Block overrides should generally not be needed in the unbranded brand. If default block behavior needs changing, prefer updating the root block in `/blocks/` instead.

For brand-specific override patterns, see the [Block Extensibility Guide](/docs/BLOCK-EXTENSIBILITY-GUIDE.md).

## Creating a New Brand

Use this directory as a starting point. Copy it, rename, and customize `tokens.css` with actual brand values. See the [Brand Setup Guide](/docs/BRAND-SETUP-GUIDE.md) for details.

## TODOs

- Font family tokens (`--body-font-family`, `--heading-font-family`) not yet in `root-tokens.css` — see [ARCHITECTURE-TODO.md](/docs/ARCHITECTURE-TODO.md) #5
