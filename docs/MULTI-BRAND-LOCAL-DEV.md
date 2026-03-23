# Multi-Brand Local Development & EDS Configuration

## Architecture: Repoless Multi-Brand

Each brand is registered as its own **repoless EDS site** via the `admin.hlx.page` config API. All sites share one code repository but have independent content path mappings, access controls, and preview URLs.

This replaces the previous `fstab.yaml` mountpoint approach.

### AEM Content Structure

```
/content/
├── lake-powell/        ← registered EDS site
├── unbranded/          ← registered EDS site
└── {future-brand}/     ← register via admin API
```

### AEM Cloud Configuration

- **Location**: `/conf/mb-root`
- **Scope**: Shared across all brands (all content trees reference this config)
- **Project Type**: `aem.live with repoless config setup`
- **Organization**: `aramark-destinations` (temporary — will move to Aramark-owned org)
- **Site Name**: `aramark-mb` (temporary repo name)
- **Branch**: `main`

> **Important**: The org and repo names are temporary. The repo will be copied to an Aramark-owned organization once provisioned. The AEM content structure (`/content/{brand}/`) is the permanent layer.

### EDS Site Registration (per brand)

Each brand has a site config at `admin.hlx.page/config/{org}/sites/{brand}.json` containing:

| Section | Purpose |
|---------|---------|
| `code` | Points to the shared code repo (owner + repo) |
| `content` | AEM author URL as content source |
| `access` | Admin emails + tech account for authorization |
| `public.paths` | Maps `/content/{brand}/` to `/` (root) |

See [BRAND-SETUP-GUIDE.md](BRAND-SETUP-GUIDE.md) step 4 for the full registration process.

---

## Local Development

### Brand-Aware Dev Server

The local dev server uses `scripts/dev-brand.js` to launch a brand-specific EDS preview:

```bash
pnpm start:brand lake-powell
```

This maps to the brand's site-specific EDS preview URL (e.g., `https://main--lake-powell--{org}.aem.page`).

### Brand URL Configuration

Brand preview URLs are configured in `scripts/dev-brand.js`:

```javascript
const BRAND_URLS = {
  'lake-powell': 'https://main--lake-powell--aramark-destinations.aem.page',
  'unbranded': 'https://main--unbranded--aramark-destinations.aem.page',
};
```

Additional brands can be added locally via `.dev-brands.json` (gitignored) without modifying the committed file.

### How Local Dev Works

| Command | Preview URL | Content Source |
|---------|-------------|---------------|
| `pnpm start:brand lake-powell` | `main--lake-powell--{org}.aem.page` | `/content/lake-powell/` via path mappings |
| `pnpm start:brand unbranded` | `main--unbranded--{org}.aem.page` | `/content/unbranded/` via path mappings |

Brand detection in `site-resolver.js` uses two methods:
1. **AEM metadata** (`brand` field in metadata sheet) — primary mechanism for all environments
2. **URL path** (`/brands/{brand}/`) — local development fallback only (when metadata is unavailable)

---

## How Production Works

Each brand gets a custom domain mapped to its EDS site:
- `lakepowellresort.com` → `lake-powell` site
- `{futuresite}.com` → `{future-brand}` site

When a user visits `lakepowellresort.com/about`:
1. EDS routes to the `lake-powell` site
2. Path mappings resolve `/about` to `/content/lake-powell/about` in AEM
3. AEM metadata sheet provides `brand: lake-powell`
4. `site-resolver.js` loads `/brands/lake-powell/tokens.css`
5. Brand tokens override root tokens via CSS cascade

---

## Troubleshooting

### Preview returns 404 after site registration

Trigger a preview to initialize the content bus:

```bash
curl -X POST "https://admin.hlx.page/preview/{org}/{brand}/main/" \
  -H "x-auth-token: <token>"
```

Check the `x-error` header (use `-v` flag) for details.

### "not authorized to access resource" error

- Verify the AEM cloud config (`mb-root`) is set to **"aem.live with repoless config setup"** project type
- Verify the `config_admin` role in the site's access config includes the correct tech account
- Verify the auth token comes from the **GitHub identity** (not Adobe identity)

### Verifying site config

```bash
curl -s "https://admin.hlx.page/config/{org}/sites/{brand}.json" \
  -H "x-auth-token: <token>"
```

Confirm all sections (code, content, access, public.paths) are present and correct.
