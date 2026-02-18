# Brand Setup Guide

How to add a new brand site to the multi-brand EDS platform.

## Prerequisites

- AEM Cloud author access (`author-p179307-e1885056.adobeaemcloud.com`)
- GitHub repo write access (`BlueAcornInc/aramark-mb`)
- EDS/Helix Admin access for custom domain configuration

## Architecture Overview

```
head.html → styles.css → fixed-tokens.css → root-tokens.css   (shared base)
                                ↓
              scripts.js detects brand → injects brand tokens.css   (per-brand override)
```

Brand detection priority:
1. **AEM page metadata** `brand` field (production — custom domains)
2. **URL path** `/brands/{brand}/` fallback (local development)

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

### 4. Add fstab.yaml Mountpoint

Add a mountpoint entry for the brand's content:

```yaml
mountpoints:
  # ... existing mountpoints ...

  /brands/{brand-name}:
    url: "https://author-p179307-e1885056.adobeaemcloud.com/content/{brand-name}"
    type: "markup"
    suffix: ".html"
```

The path `/brands/{brand-name}` must match:
- The `brand` metadata value (step 2)
- The repo directory name (step 3)

### 5. Configure Custom Domain (Production)

In EDS/Helix Admin, map the custom domain to the brand's content path:

1. Go to Helix Admin for the `aramark-mb` project
2. Add custom domain (e.g., `brandsite.com`)
3. Map it to the `/brands/{brand-name}` path prefix
4. EDS will serve content from the `/brands/{brand-name}` mountpoint on this domain

When a user visits `brandsite.com/about`:
- EDS internally resolves to `/brands/{brand-name}/about`
- The page's metadata includes `brand: {brand-name}` (from the metadata sheet)
- `scripts.js` reads the metadata, loads `/brands/{brand-name}/tokens.css`
- Brand tokens override root tokens via CSS cascade

### 6. Local Development

Access the brand site locally via path prefix:

```
http://localhost:3000/brands/{brand-name}/
```

`site-resolver.js` detects the brand from the URL path and loads the brand token file. This works identically to production behavior.

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
