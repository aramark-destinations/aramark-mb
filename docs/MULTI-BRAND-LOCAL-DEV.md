# Multi-Brand Local Development & EDS Configuration

## Problem

Local development for brand-specific sites (e.g., `http://localhost:3000/brands/lake-powell/`) returns 404. The root cause is that the Edge Delivery cloud configuration in AEM is scoped to `/conf/lake-powell`, meaning the `franklin.delivery` endpoint only serves content for `/content/lake-powell`. Adding a `/brands/lake-powell` mountpoint in `fstab.yaml` fails because it double-nests the content path.

## Current State

### AEM Content Structure

```
/content/
├── lake-powell/        ← current brand
└── {future-brand}/     ← sibling brands
```

### EDS Cloud Configuration

- **Location**: `/conf/lake-powell`
- **Scope**: Only `/content/lake-powell`
- **Repo**: `blueacorninc/aramark-mb`

Because the config is scoped to Lake Powell, the `franklin.delivery` endpoint at `/bin/franklin.delivery/BlueAcornInc/aramark-mb/main` resolves directly to `/content/lake-powell`. This means:

- `localhost:3000/` (root mountpoint) serves Lake Powell content — works
- `localhost:3000/brands/lake-powell/` appends `/content/lake-powell` to an endpoint already scoped to lake-powell — 404

### fstab.yaml

```yaml
mountpoints:
  /:
    url: https://author-p179307-e1885056.adobeaemcloud.com/bin/franklin.delivery/BlueAcornInc/aramark-mb/main
    type: markup
    suffix: ".html"

  /brands/lake-powell:
    url: https://author-p179307-e1885056.adobeaemcloud.com/bin/franklin.delivery/BlueAcornInc/aramark-mb/main/content/lake-powell
    type: markup
    suffix: ".html"
```

The `/brands/lake-powell` mountpoint will not resolve until the AEM EDS config is changed (see fix below).

---

## Fix: Shared EDS Configuration

### Step 1: Create Shared Config in AEM (Manual)

1. Go to **AEM Author → Tools → Cloud Services → Edge Delivery Services Configuration**
2. Create a new configuration at `/conf/aramark-mb` (shared across all brands)
3. Set the GitHub repo to `blueacorninc/aramark-mb`
4. Associate all brand content trees with this shared config:
   - `/content/lake-powell`
   - `/content/{future-brand}`
5. Deactivate the old `/conf/lake-powell` config once the shared one is verified

After this, the `franklin.delivery` endpoint will serve content from any site under `/content/`, and the path `/content/lake-powell` in the mountpoint URL will resolve correctly.

### Step 2: Verify fstab.yaml Mountpoints

The current `fstab.yaml` mountpoints should work once the shared config is active:

```yaml
mountpoints:
  /brands/lake-powell:
    url: https://author-p179307-e1885056.adobeaemcloud.com/bin/franklin.delivery/BlueAcornInc/aramark-mb/main/content/lake-powell
    type: markup
    suffix: ".html"

  # Add future brands:
  # /brands/{brand-name}:
  #   url: https://author-p179307-e1885056.adobeaemcloud.com/bin/franklin.delivery/BlueAcornInc/aramark-mb/main/content/{brand-name}
  #   type: markup
  #   suffix: ".html"
```

Whether to keep the root `/` mountpoint depends on whether you need non-brand pages at the root level.

### Step 3: Trigger EDS Code Bus Update

After pushing `fstab.yaml` changes:

```bash
# Re-read fstab.yaml
curl -X POST https://admin.hlx.page/code/BlueAcornInc/aramark-mb/main

# Preview lake-powell content
curl -X POST https://admin.hlx.page/preview/BlueAcornInc/aramark-mb/main/brands/lake-powell/
```

### Step 4: Verify

Check the admin status endpoint — `sourceLocation` should be populated and `edit` should no longer be empty:

```bash
curl -s https://admin.hlx.page/status/blueacorninc/aramark-mb/main/brands/lake-powell/ | python3 -m json.tool
```

Expected: `sourceLocation` shows `markup:https://author-p179307-e1885056.adobeaemcloud.com/content/lake-powell/index.html`

---

## How Local Dev Works After Fix

| URL | Brand Detection | Tokens Loaded |
|-----|----------------|---------------|
| `localhost:3000/brands/lake-powell/` | URL path match → `lake-powell` | `/brands/lake-powell/tokens.css` |
| `localhost:3000/brands/{future-brand}/` | URL path match → `{future-brand}` | `/brands/{future-brand}/tokens.css` |

Brand detection in `site-resolver.js` uses two methods:
1. **AEM metadata** (`brand` field in metadata sheet) — production on custom domains
2. **URL path** (`/brands/{brand}/`) — local development fallback

## How Production Works After Fix

Each brand gets a custom domain mapped in EDS/Helix Admin:
- `lakepowellresort.com` → `/brands/lake-powell`
- `{futuresite}.com` → `/brands/{future-brand}`

When a user visits `lakepowellresort.com/about`:
1. EDS resolves to `/brands/lake-powell/about`
2. AEM metadata sheet provides `brand: lake-powell`
3. `site-resolver.js` loads `/brands/lake-powell/tokens.css`
4. Brand tokens override root tokens via CSS cascade
