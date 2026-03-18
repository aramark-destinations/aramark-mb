# Multi-Brand (Property-Level) Support — EDS Platform Overview

This document summarizes the work done to support multiple Aramark brands ("properties") within the EDS platform. It is intended as a ticket-level rundown for stakeholders and engineering teams.

---

## Background: The Repoless Architecture

The EDS platform is built on Adobe's Edge Delivery Services (AEM.live) with a **repoless** configuration model. This means:

- **A single shared GitHub repository** (`BlueAcornInc/aramark-mb`) hosts all block code, styles, scripts, and brand configs.
- **Each brand is registered as an independent EDS site** via the `admin.hlx.page` configuration API — no `fstab.yaml` changes are required.
- **Each brand has its own AEM content tree** (`/content/{brand-name}/`) in AEM Cloud, with an independent preview and live URL.
- **Content path mappings** translate the brand root (`/content/{brand-name}/`) to the web root (`/`), so all brands share the same URL structure.

This model allows us to onboard new properties without forking code or spinning up new repositories. All blocks, scripts, and tooling are inherited from the shared platform.

---

## Brand Registration

Each brand is registered via three API calls to `admin.hlx.page`:

1. **Create site** — Points the brand site at the shared code repository and the shared AEM Cloud author.
2. **Configure access** — Sets admin roles and auth requirements.
3. **Set path mappings** — Maps `/content/{brand-name}/` to `/` so page URLs are clean and consistent.

Once registered, each brand gets:

| URL Type | Pattern |
|---|---|
| Preview | `https://main--{brand}--{org}.aem.page` |
| Live | `https://main--{brand}--{org}.aem.live` |

Local development uses `pnpm start:brand {brand-name}`, which launches the AEM CLI proxied to the brand's preview URL.

---

## Design Token System

Brand differentiation is driven entirely by **CSS custom properties (design tokens)**. No hard-coded values are permitted in block CSS; every visual decision references a token.

### Token Layers

The token system is structured in four layers that apply in cascade order:

| Layer | File | Purpose | Load Mechanism |
|---|---|---|---|
| 1 — Root Tokens | `styles/root-tokens.css` | Configurable base values (colors, spacing, radii, typography weights, etc.) | Static CSS `@import` |
| 2 — Fixed/Derived Tokens | `styles/fixed-tokens.css` | Auto-calculated values via `color-mix()` (tint/shade scales, semantic surfaces) | Static CSS `@import` |
| 3 — Brand Tokens | `brands/{brand}/tokens.css` | Brand-specific overrides — only values that differ from root defaults | Runtime JS injection (`loadCSS()`) |
| 4 — Legacy Aliases | `styles/styles.css` | Maps old token names to the new system for backward compatibility | Static CSS `@link` |

### How Brand Tokens Override Root Tokens

Brand tokens are injected at runtime in `loadEager()` (before the first paint) using the same CSS custom property names as the root layer. Because they are loaded after the root tokens, they win via normal CSS cascade — no `!important` required.

```
styles.css (static link)
  └─ @import fixed-tokens.css
       └─ @import root-tokens.css    ← root defaults
                                      ↑ overridden by cascade
brands/{brand}/tokens.css            ← brand overrides (runtime inject)
```

### Derived Token Auto-Recalculation

`fixed-tokens.css` uses `color-mix()` to derive an entire tint/shade scale from `--color-primary` and `--color-secondary`. When a brand overrides those two root values, the full color scale (50–950) recalculates automatically — no additional work needed from the brand author.

### What Brands Can Override

All tokens defined in `root-tokens.css` are overridable per brand:

- Brand colors (`--color-primary`, `--color-secondary`)
- Grey scale (`--color-grey-50` through `--color-grey-900`)
- Alert colors (success, error, caution, general)
- Border radii (`--radius-xs` through `--radius-full`)
- Text colors (`--text-light-1/2/3`, `--text-dark-1/2/3`)
- Typography weights and line heights
- Layout max-widths
- Transition durations
- Component-level tokens (`--button-*`, `--input-*`)
- Sizing and spacing scales

### Current Limitation

Font families (`--body-font-family`, `--heading-font-family`), responsive heading sizes, and `--nav-height` currently live in `styles/styles.css` rather than `root-tokens.css`, so they cannot be overridden per brand without additional work.

---

## Brand Detection

The platform detects the active brand via two mechanisms:

1. **Primary (production):** AEM page metadata field `brand` — set in the brand's metadata sheet in AEM Author. This is reliable on custom domains where the URL path doesn't contain brand context.
2. **Fallback (local dev):** URL pathname pattern `/brands/{brand}/` — detected by `scripts/site-resolver.js`.

Once detected, the brand name is used to load the correct `brands/{brand}/tokens.css` file.

---

## 2-Tier Block Resolution

Blocks are resolved using a priority-based 2-tier system managed by `scripts/site-resolver.js`:

```
1. /brands/{brand}/blocks/{blockname}/{blockname}.js  ← brand override (highest priority)
2. /blocks/{blockname}/{blockname}.js                 ← shared root block (fallback)
```

The same pattern applies to CSS files. This allows a brand to selectively override individual block behavior or styles without affecting the shared block library or other brands.

**Block overrides are intentionally rare.** Styling differences are handled exclusively through tokens. Overrides are reserved for genuine behavioral differences (custom analytics, brand-specific interactions, unique DOM requirements).

### Block Extensibility via Lifecycle Hooks

Root blocks expose `onBefore` and `onAfter` hooks so brand overrides can inject logic without duplicating the core implementation:

```javascript
// brands/lake-powell/blocks/hero/hero.js
import decorateRoot from '../../../blocks/hero/hero.js';

export default function decorate(block) {
  decorateRoot(block, {
    onBefore: ({ block }) => {
      // Runs before core block logic
    },
    onAfter: ({ block }) => {
      // Runs after core block logic — analytics, event listeners, etc.
    }
  });
}
```

---

## Brand Directory Structure

Each brand lives under `brands/{brand-name}/` in the shared repository:

```
brands/
├── lake-powell/
│   ├── README.md         # Brand documentation
│   ├── tokens.css        # Token overrides (primary customization)
│   └── blocks/           # Optional block behavior overrides
│       └── hero/
│           ├── hero.js
│           └── hero.css
│
└── unbranded/            # Default fallback / reference template
    ├── README.md
    ├── tokens.css
    └── blocks/
```

New brands are onboarded by:
1. Registering the EDS site via `admin.hlx.page` API
2. Creating the AEM content tree under `/content/{brand-name}/`
3. Adding a `brands/{brand-name}/tokens.css` with brand color and style overrides
4. Adding a `brands/{brand-name}/README.md` with brand documentation
5. Registering the brand URL in `scripts/dev-brand.js` for local development

A full step-by-step guide lives at [`docs/BRAND-SETUP-GUIDE.md`](BRAND-SETUP-GUIDE.md).

---

## Current Brands

| Brand | Status | Preview URL |
|---|---|---|
| `lake-powell` | Active | `https://main--lake-powell--blueacorninc.aem.page` |
| `unbranded` | Active (default/reference) | `https://main--unbranded--blueacorninc.aem.page` |

> Note: Brand-specific token values for Lake Powell are currently placeholder values pending final brand color confirmation.

---

## Developer Tooling

| Command | Purpose |
|---|---|
| `pnpm start:brand {brand}` | Launch local dev server proxied to a specific brand's preview URL |
| `pnpm start` | Launch local dev server (default) |
| `pnpm build:json` | Merge Universal Editor model partials into root-level config files |
| `pnpm lint` | ESLint + Stylelint |
| `pnpm test` | Jest unit tests |

A `.dev-brands.json` file (gitignored) can be used to override brand preview URLs locally.

---

## Key Files

| File | Purpose |
|---|---|
| `scripts/site-resolver.js` | Brand detection and 2-tier block resolution |
| `scripts/scripts.js` | Global utilities; calls `loadCSS()` for brand tokens in `loadEager()` |
| `scripts/dev-brand.js` | Brand-aware local dev server launcher |
| `styles/root-tokens.css` | Configurable base tokens |
| `styles/fixed-tokens.css` | Derived tokens (color scales via `color-mix()`) |
| `styles/styles.css` | Legacy token aliases + CSS entry point |
| `brands/{brand}/tokens.css` | Brand token overrides |
| `docs/BRAND-SETUP-GUIDE.md` | Step-by-step new brand onboarding |
| `docs/MULTI-BRAND-LOCAL-DEV.md` | Local development setup for multiple brands |
| `docs/BLOCK-EXTENSIBILITY-GUIDE.md` | Block override patterns and lifecycle hooks |

---

## Summary

The EDS platform supports multiple Aramark brands ("properties") from a single shared codebase using:

- **Repoless EDS site registration** — each brand is an independent site with its own content tree, preview/live URLs, and path mappings, all without a separate repository.
- **CSS custom property token system** — brands customize the visual experience by overriding a well-defined set of design tokens; the derived color scale recalculates automatically.
- **Runtime brand token injection** — brand tokens are loaded before first paint, eliminating flash of unstyled content while keeping brand logic decoupled from shared styles.
- **2-tier block resolution** — brands inherit the full shared block library and can optionally override individual blocks at the behavior level using a lifecycle hook pattern.
- **Shared tooling and documentation** — a single `pnpm start:brand` command, a complete onboarding guide, and per-block READMEs support rapid brand onboarding.
