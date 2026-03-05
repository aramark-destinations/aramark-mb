# Icon Architecture

This project uses a two-tier icon system: **Phosphor** SVGs for developer-managed system UI icons (`ph-*`) and **AEM Assets DAM** SVGs for author-managed project/brand icons (`prj-*`). Both are consumed through the standard EDS `:iconname:` token syntax and resolved to inline SVG by a custom icon resolver in `scripts/scripts.js`.

## Icon Types

| Type | Prefix | Source | Managed By |
|---|---|---|---|
| System icons | `ph-*` | `/icons/ph-{name}.svg` in repo | Developers |
| Project / brand icons | `prj-*` | AEM Assets Delivery (Dynamic Media) | Authors / Brand Governance |

## Authoring Syntax

EDS converts `:iconname:` tokens in content to icon spans during page rendering. Authors use this syntax in Universal Editor inline text, RTE fields, block content, and Content Fragments.

```
:ph-map-pin:
:prj-tennis:
```

Output HTML (produced by EDS token parser):

```html
<span class="icon icon-ph-map-pin"></span>
<span class="icon icon-prj-tennis"></span>
```

The custom `decorateIcons()` resolver then fetches and inlines the SVG into each span.

**RTE authoring note:** In the Universal Editor RTE, authors type icon tokens as plain text. The UE RTE does not support custom toolbar buttons — tokens are rendered as icons outside of active editing (on save/patch), not inline while typing.

## System Icons (Phosphor)

System icons use a developer-curated subset of [Phosphor Icons](https://phosphoricons.com/).

**Setup:**
1. Install the Phosphor SVG source: `npm install @phosphor-icons/core`
2. Copy the required SVGs from `node_modules/@phosphor-icons/core/assets/regular/` into `/icons/`
3. Rename each file to match the `ph-` prefix convention: `ph-{icon-name}.svg`

```
icons/
├── ph-map-pin.svg
├── ph-airplane.svg
├── ph-magnifying-glass.svg
└── ...
```

These files are committed to the repo and loaded by the resolver from `${codeBasePath}/icons/ph-{name}.svg`.

System icons are not author-managed. Changes require a developer to update the `/icons/` directory and deploy.

## Project Icons (DAM)

Project and brand icons are stored in AEM Assets and served via **AEM Assets Delivery (Dynamic Media with Open APIs)**.

### DAM Folder Structure

```
/content/dam/aramark/icons/project/
├── prj-tennis.svg
├── prj-hiking.svg
└── prj-trailhead.svg
```

### Naming Convention

All project icons must use the `prj-{slug}.svg` format. The slug maps directly to the authoring token:

| DAM asset | Token |
|---|---|
| `prj-tennis.svg` | `:prj-tennis:` |
| `prj-hiking.svg` | `:prj-hiking:` |

### Icon Update Workflow

Authors update icons entirely through DAM — no code changes required:

1. Upload the new SVG to the DAM folder
2. Replace the existing asset
3. Publish the asset

After publish, AEM Assets Delivery invalidates the CDN cache automatically. All pages using `:prj-tennis:` display the updated icon.

## Icon Resolver

The custom `decorateIcons()` in `scripts/scripts.js` replaces the default EDS boilerplate implementation (which injects `<img>` tags) with an inline SVG resolver. Inline SVG is required to enable CSS styling of icon internals (`fill`, `stroke`, `currentColor`).

### Resolver Logic

```javascript
// ph-* → fetch from local /icons/ directory
// prj-* → fetch from AEM Assets Delivery
async function decorateIcon(span) {
  const iconName = [...span.classList]
    .find((c) => c.startsWith('icon-'))
    .substring(5);

  const url = iconName.startsWith('prj-')
    ? `${getIconBaseUrl()}/${iconName}.svg`
    : `${window.hlx.codeBasePath}/icons/${iconName}.svg`;

  const response = await fetch(url);
  const svg = await response.text();
  span.innerHTML = svg;
}
```

### Assets Delivery Base URL

The Assets Delivery base URL is environment-specific and must be configured per site. Store it in the page metadata sheet under the key `icon-base-url`:

| Key | Value |
|---|---|
| `icon-base-url` | `https://assets.example.adobeaemcloud.com/adobe/assets/urn:.../prj-` |

The resolver reads this at runtime via `getMetadata('icon-base-url')`.

## Governance

### Upload Permissions

Only the following teams may add or replace icons in the DAM folder:

- Design system team
- Brand governance

### SVG Requirements

All icons must:

- Be SVG format
- Use the `prj-{slug}.svg` naming convention
- Contain no embedded scripts or external references
- Be optimized (run through SVGO or equivalent)

### Review Workflow

```
upload → peer review → publish
```

Reviewing before publish prevents broken or non-compliant icons from reaching production.

## Implementation Status

| Feature | Status |
|---|---|
| EDS `:iconname:` token parsing | **Built** — standard EDS boilerplate |
| `decorateIcons(main)` called on page load | **Built** — `scripts/scripts.js:95` |
| `/icons/close.svg`, `/icons/search.svg` | **Built** |
| Custom `decorateIcons()` with prefix routing | **Planned** — not yet implemented |
| Inline SVG injection | **Planned** — not yet implemented |
| Phosphor SVG subset in `/icons/ph-*.svg` | **Planned** — not yet implemented |
| DAM project icon delivery via Assets Delivery | **Planned** — not yet implemented |
| `icon-base-url` metadata field | **Planned** — not yet configured |

## Sources

1. [Adobe EDS Icon Block Documentation](https://www.aem.live/developer/block-collection/icons)
2. [AEM Boilerplate — `scripts/aem.js`](https://github.com/adobe/aem-boilerplate/blob/main/scripts/aem.js)
3. [AEM Assets Delivery — Cache Management](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/dynamicmedia/dynamic-media-open-apis/cache-management-dynamic-media-open-api)
4. [Universal Editor — RTE Configuration](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/configure-rte)
5. [Phosphor Icons](https://phosphoricons.com/)
