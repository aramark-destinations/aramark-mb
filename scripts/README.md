# Scripts

Core JavaScript for the AEM Edge Delivery Services (EDS) runtime. These scripts handle page initialisation, block loading, brand resolution, and accessibility enhancements.

## Page Lifecycle

`scripts.js` orchestrates three sequential loading phases to optimise performance:

```
loadEager()   → Critical path: decorates DOM, loads brand tokens, renders LCP section
loadLazy()    → After LCP: loads remaining sections, header, footer, lazy styles, fonts
loadDelayed() → 3 seconds after load: analytics, third-party scripts, non-essential features
```

## Files

### `scripts.js` — Main Entry Point

Loaded by `head.html`. Drives the three-phase page lifecycle and exports shared DOM utilities.

Key exports:
- `decorateMain(main)` — Applies button, icon, section, and block decoration to the main element
- `moveAttributes(from, to, attributes)` — Moves HTML attributes between elements
- `moveInstrumentation(from, to)` — Moves AEM Universal Editor instrumentation attributes (`data-aue-*`, `data-richtext-*`) between elements

Brand token loading happens here in `loadEager()`:
```js
const { getCurrentBrand } = await import('./site-resolver.js');
const brand = getCurrentBrand();
if (brand) await loadCSS(`${window.hlx.codeBasePath}/brands/${brand}/tokens.css`);
```

### `aem.js` — AEM EDS Core Library

The Adobe-provided EDS framework library. Provides all foundational page decoration and loading utilities:

- `loadHeader()` / `loadFooter()` — Async header/footer block loading
- `decorateButtons()` / `decorateIcons()` — Button and icon DOM decoration
- `decorateSections()` / `decorateBlocks()` — Section and block wrapping
- `decorateTemplateAndTheme()` — Template and theme class application
- `loadSection()` / `loadSections()` — Lazy section loading
- `loadCSS()` — Dynamic CSS injection
- `getMetadata()` — Page metadata accessor
- `waitForFirstImage()` — LCP image awaiting helper
- `sampleRUM()` — Real User Monitoring event emission

> This file is managed by Adobe and should not be modified directly.

### `site-resolver.js` — Brand Detection & Block Resolution

Detects the active brand context and resolves the correct block file paths using the 2-tier lookup order.

**Brand detection priority:**
1. AEM page metadata `brand` field (production — set via metadata sheet in AEM Author)
2. URL path `/brands/{brand}/` (local development fallback)

**Exported functions:**
- `getCurrentBrand()` — Returns the active brand name or `null`
- `getBlockPaths(blockName)` — Returns JS paths to try: `[brands/{brand}/blocks/…, /blocks/…]`
- `getBlockCssPaths(blockName)` — Same, for CSS files
- `getBrandBasePath()` — Returns `/brands/{brand}` or `''`
- `resolveBlockPath(blockName)` — Async: checks existence and returns the first valid path

Deprecated aliases: `getCurrentSite`, `getSiteBasePath`

### `delayed.js` — Delayed Initialisation

Executed 3 seconds after page load. Use this file to load analytics scripts, chatbots, cookie consent banners, and any other non-critical third-party integrations that should not impact Core Web Vitals.

### `editor-support.js` — Universal Editor Support

Loaded in AEM authoring environments. Provides instrumentation and tooling for the AEM Universal Editor (block picking, inline editing, section management).

### `editor-support-rte.js` — Rich Text Editor Support

Supplements `editor-support.js` with rich-text-specific Universal Editor instrumentation.

### `placeholders.js` — Content Placeholders

Utility for fetching and substituting text placeholders from the project's placeholders spreadsheet. Use to externalise copy strings for multi-locale or content-team-managed text.

### `dompurify.min.js` — DOM Sanitisation

Bundled [DOMPurify](https://github.com/cure53/DOMPurify) library. Used to sanitise any HTML constructed from external or user-provided content before inserting it into the DOM, preventing XSS vulnerabilities.

## Adding Auto-Blocks

The `buildAutoBlocks()` stub in `scripts.js` is the hook for auto-block logic — DOM transformations that automatically wrap content in blocks without author intervention (e.g., converting bare video URLs into embed blocks). Add auto-block logic there.
