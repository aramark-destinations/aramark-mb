# Aramark MB EDS Platform

A multi-brand Adobe Edge Delivery Services (EDS) website platform for Aramark MB's portfolio of vacation rental properties. Built on `@adobe/aem-boilerplate` with AEM Cloud Service as the authoring backend.

## Environments

Each brand is a separate repoless EDS site with its own preview/live URLs:

- **Preview:** `https://main--{brand}--blueacorninc.aem.page/`
- **Live:** `https://main--{brand}--blueacorninc.aem.live/`

Example (Lake Powell):
- **Preview:** https://main--lake-powell--blueacorninc.aem.page/
- **Live:** https://main--lake-powell--blueacorninc.aem.live/

## Project Structure

```
eds/
├── blocks/            # Shared block library (20 blocks)
├── brands/            # Per-brand token overrides
│   └── lake-powell/   # Lake Powell brand tokens
├── docs/              # Developer documentation
├── fonts/             # Web fonts (Roboto family, woff2)
├── icons/             # SVG icons
├── models/            # Universal Editor JSON schema partials
├── scripts/           # Core JS modules
├── styles/            # Global CSS and design tokens
└── tools/sidekick/    # AEM Sidekick configuration
```

## Prerequisites

- Node.js 18.3.x or newer
- pnpm (declared via `packageManager` in package.json)
- AEM Cloud Service release 2024.8 or newer (>= `17465`)

## Installation

```sh
pnpm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Launch local AEM proxy dev server (`aem up`) |
| `pnpm lint` | Run ESLint + Stylelint |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm test` | Run Jest unit tests |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:watch` | Run tests in watch mode |

## Local Development

1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
2. Install dependencies: `pnpm install`
3. Start the dev server for a brand: `pnpm start:brand {brand}` (opens `http://localhost:3000` proxying that brand's EDS site)

## Architecture

### Multi-Brand System

The platform supports multiple brand sites sharing a common block library with brand-specific overrides.

- **Brand detection:** `scripts/site-resolver.js` resolves the current brand from AEM page metadata or URL path
- **2-tier block resolution:** Brand-specific blocks in `brands/{brand}/blocks/` take priority over shared blocks in `blocks/`
- **Design tokens:** Brand token overrides in `brands/{brand}/tokens.css` are loaded at runtime before first paint

### Design Token Layers

1. **Root tokens** (`styles/root-tokens.css`) — base configurable values (colors, spacing, typography, radii)
2. **Fixed tokens** (`styles/fixed-tokens.css`) — derived scales and semantic tokens using `color-mix()`
3. **Brand tokens** (`brands/{brand}/tokens.css`) — runtime overrides for brand-specific values

### Page Lifecycle

`loadEager` (critical path, LCP) → `loadLazy` (header, footer, remaining sections) → `loadDelayed` (analytics, 3s delay)

### Universal Editor Models

Block schemas live as `_blockname.json` co-located inside each block directory (`blocks/{block}/_*.json`). Shared non-block schemas (page, section, image, title, text, button) live in `models/`. The root `component-*.json` files reference all schemas directly via AEM's native include syntax — no build step required.

## Blocks

accordion, cards, carousel, columns, embed, footer, form, fragment, header, hero, modal, navigation, navigation-group, navigation-item, quote, search, table, tabs, ugc-gallery, video

Each block supports lifecycle hooks (`onBefore`/`onAfter`) and dispatches custom DOM events for extensibility. See individual block `README.md` files for details.

## Further Documentation

- [docs/PROJECT-README.md](docs/PROJECT-README.md) — Full project overview and architecture
- [docs/BLOCK-EXTENSIBILITY-GUIDE.md](docs/BLOCK-EXTENSIBILITY-GUIDE.md) — Block resolution and extension patterns
- [docs/BRAND-SETUP-GUIDE.md](docs/BRAND-SETUP-GUIDE.md) — How to add a new brand site
- [docs/FED-SOLUTION-DESIGN.md](docs/FED-SOLUTION-DESIGN.md) — Design system architecture
- [docs/BLOCK-RENDERING-BUILD-CONFIG.md](docs/BLOCK-RENDERING-BUILD-CONFIG.md) — Build pipeline and token deep-dive

## AEM / EDS Documentation

- [Getting Started with AEM + EDS](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/edge-dev-getting-started)
- [Creating Blocks](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/create-block)
- [Content Modelling](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/content-modeling)
- [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
- [Web Performance](https://www.aem.live/developer/keeping-it-100)
- [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)
