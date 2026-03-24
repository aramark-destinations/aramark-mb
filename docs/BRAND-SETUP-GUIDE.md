# Brand Setup Guide

How to add a new brand site to the multi-brand EDS platform.

## Prerequisites

- AEM Cloud author access (`author-p179307-e1885056.adobeaemcloud.com`)
- GitHub repo write access (current temporary repo: `aramark-destinations/aramark-mb`)
- Auth token from `admin.hlx.page/login` (GitHub identity linked to the org)
- EDS/Helix Admin access for custom domain configuration

## Architecture Overview

```
head.html → styles.css → fixed-tokens.css → root-tokens.css   (shared base)
                                ↓
              scripts.js detects brand → injects brand tokens.css   (per-brand override)
```

Brand detection priority:
1. **AEM page metadata** `brand` field (production — custom domains)
2. **URL path** `/brands/{brand}/` fallback (local development ONLY)

## Step-by-Step: Adding a New Brand

### 1. Create Brand Content in AEM

In AEM Author, create a content tree for the new brand:

```
/content/{brand-name}/
├── index                    # Homepage
├── metadata                 # Metadata sheet (critical — see step 2)
├── nav                      # Navigation structure
├── footer                   # Footer content
└── ...                      # Brand-specific pages
```

### 2. Configure Brand Metadata Sheet

In the brand's metadata sheet (`/content/{brand-name}/metadata`), add a row:

| Key     | Value           |
|---------|-----------------|
| `brand` | `{brand-name}`  |

This metadata is automatically merged into every page under this content tree by EDS. The `brand` value **must match** the folder name used in step 3.

**Why this matters:** On production custom domains, the URL path won't contain `/brands/{brand}/`. The metadata field is how `site-resolver.js` detects which brand is active and loads the correct token file.

### 3. Create Brand Directory in Repo

```bash
mkdir -p brands/{brand-name}
```

Create the brand token file at `brands/{brand-name}/tokens.css`:

```css
/* {Brand Name} — Brand Design Tokens
   Override root-tokens.css values for this brand. */
:root {
  --color-primary: #XXXXXX;
  --color-secondary: #XXXXXX;
  /* Add any root-tokens.css overrides here */
}
```

**Convention:** Only include tokens that differ from `styles/root-tokens.css` defaults. All tokens in `root-tokens.css` are overridable.

### 4. Register Repoless EDS Site

Each brand gets its own EDS site registration via the admin.hlx.page config API. This replaces the old `fstab.yaml` mountpoint approach.

**Step 4a: Create the site (PUT)**

```bash
curl -s -X PUT \
  "https://admin.hlx.page/config/{org}/sites/{brand-name}.json" \
  -H "x-auth-token: <your-github-auth-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "version": 1,
    "code": { "owner": "{org}", "repo": "{repo}" },
    "content": {
        "source": {
            "url": "https://author-p179307-e1885056.adobeaemcloud.com/bin/franklin.delivery/{org}/{brand-name}/main",
            "type": "markup",
            "suffix": ".html"
        }
    }
}'
```

Expected: HTTP 201 Created. If 409, the site already exists.

**Step 4b: Apply access config (POST)**

```bash
curl -s -X POST \
  "https://admin.hlx.page/config/{org}/sites/{brand-name}/access/admin.json" \
  -H "x-auth-token: <your-github-auth-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": {
        "config": ["<tech-account>@techacct.adobe.com"]
    }
}'
```

**Step 4c: Apply path mappings (POST)**

```bash
curl -s -X POST \
  "https://admin.hlx.page/config/{org}/sites/{brand-name}/public.json" \
  -H "x-auth-token: <your-github-auth-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": {
        "mappings": ["/content/{brand-name}/:/"],
        "includes": ["/content/{brand-name}/"]
    }
}'
```

**Step 4d: Verify**

```bash
curl -s "https://admin.hlx.page/config/{org}/sites/{brand-name}.json" \
  -H "x-auth-token: <your-github-auth-token>"
```

Confirm all sections (code, content, access, public) are present.

> **API notes:**
> - Org ID must be **lowercase** in URL paths
> - `"version": 1` is required in the initial PUT payload
> - Auth token must come from the **GitHub identity** linked to the org (not Adobe identity)
> - Use `-v` flag to see `x-error` header when debugging 400s (no response body)

### 5. Configure Custom Domain (Production)

In EDS/Helix Admin, map the custom domain to the brand site:

1. The brand's repoless site is already registered (step 4)
2. Add custom domain (e.g., `brandsite.com`) for the site
3. The `paths.mappings` config (`/content/{brand-name}/:/`) maps AEM content to root

When a user visits `brandsite.com/about`:
- EDS routes to the `{brand-name}` site
- Path mappings resolve `/about` to `/content/{brand-name}/about` in AEM
- The page's metadata includes `brand: {brand-name}` (from the metadata sheet)
- `scripts.js` reads the metadata, loads `/brands/{brand-name}/tokens.css`
- Brand tokens override root tokens via CSS cascade

### 6. Update Local Dev Config

Add the brand's site-specific preview URL. The preferred method is a local `.dev-brands.json` file (gitignored) so the committed file stays clean:

```json
{
  "{brand-name}": "https://main--{brand-name}--{org}.aem.page"
}
```

Alternatively, add it directly to the committed `BRAND_URLS` map in `scripts/dev-brand.js`:

```javascript
const BRAND_URLS = {
  // ... existing brands ...
  '{brand-name}': 'https://main--{brand-name}--{org}.aem.page',
};
```


Then run local dev:

```bash
pnpm start:brand {brand-name}
```

## Overridable Tokens

All CSS custom properties defined in `styles/root-tokens.css` can be overridden in a brand's `tokens.css`. Key categories:

| Category | Example Tokens |
|----------|---------------|
| **Brand Colors** | `--color-primary`, `--color-secondary` |
| **Grey Scale** | `--color-grey-50` through `--color-grey-900` |
| **Alert Colors** | `--color-alerts-success`, `--color-alerts-error`, etc. |
| **Border Radius** | `--radius-xs` through `--radius-full` |
| **Text Colors** | `--text-light-1/2/3`, `--text-dark-1/2/3` |
| **Typography** | `--font-weight-*`, `--line-height-*` |
| **Layout** | `--layout-max-width-content`, `--layout-max-width-narrow` |
| **Transitions** | `--transition-duration-fast`, `--transition-duration-normal` |
| **Buttons** | `--button-border-radius`, `--button-padding-*` |
| **Inputs** | `--input-border-radius`, `--input-border-color` |

Derived tokens in `styles/fixed-tokens.css` (color shades, semantic surfaces, etc.) are **automatically recalculated** when base tokens change — no need to override them individually.

## Block Overrides (Rare)

If a brand needs different **behavior** (not just styling), create a block override:

```
brands/{brand-name}/blocks/{block-name}/{block-name}.js
```

See `brands/lake-powell/README.md` for the lifecycle hooks pattern.

## Future: UE Token Editor

The planned workflow for non-developer brand token management:

1. Brand author opens a Universal Editor form in their AEM author environment
2. Form fields correspond to overridable tokens (`--color-primary`, etc.)
3. On submit, an App Builder action creates a PR on the staging branch
4. PR updates `brands/{brand-name}/tokens.css` with the new values
5. After review/merge, EDS serves the updated tokens from the edge network

This is not yet implemented — current workflow is direct CSS file editing.

## Unknowns & TODOs

- UE Token Editor / App Builder integration is not yet implemented — see [TODOS.md](project/TODOS.md) and [FED-SOLUTION-DESIGN.md](in-progress/FED-SOLUTION-DESIGN.md) open items
- Font family and font size tokens live in `styles.css`, not in the design token chain — brands cannot yet override them via `tokens.css` — see [TODOS.md](project/TODOS.md) #5
- `--nav-height` is not in the design token system — see [TODOS.md](project/TODOS.md) #4
- Zero test files exist for brand detection or token loading — see [TODOS.md](project/TODOS.md) #15
