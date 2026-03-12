# Lake Powell Content Sync — Investigation & Unblocking Guide

**Status:** Blocked pending EDS org admin access  
**URLs affected:**
- `https://main--lake-powell--blueacorninc.aem.page/` — preview loads but content not syncing
- `https://main--lake-powell--blueacorninc.aem.live/` — 404

---

## Root Cause

The Lake Powell EDS site has not been fully registered via the **Helix/EDS Site Admin API**. This means:

1. EDS has no content source mapping for the `lake-powell--blueacorninc` site
2. The site cannot resolve AEM content paths → all page fetches return 404
3. The header and footer blocks load their content as fragments (`/nav`, `/footer`) via `loadFragment()` — since EDS cannot route these to AEM, the fetches hang or return 404, causing the header/footer previews to appear stuck

This is **not a code bug** — the application code in the repo is correct. The blocker is purely an infrastructure configuration step that requires org-level admin access to `admin.hlx.page`.

### Why `paths.json` Is Not the Issue

In the repoless multi-brand architecture, path mappings are **not** read from `paths.json` in the repo. They are applied directly to the EDS site config via the Admin API (`POST /config/{org}/sites/{site}/public.json`). The `paths.json` file in this repo is a legacy artifact from the previous fstab-based setup and is no longer the active configuration mechanism.

---

## Prerequisites to Unblock

- GitHub account with **admin access** to the `BlueAcornInc` org (or a member of the org with `admin.hlx.page` admin rights)
- A valid auth token from `https://admin.hlx.page/login` (GitHub identity linked to the org — **not** Adobe identity)
- AEM content at `/content/lake-powell/` published/previewed (confirmed already set up)

---

## Step-by-Step: Admin API Registration

Replace `<your-github-auth-token>` with the token obtained from `https://admin.hlx.page/login`.

### Step 1 — Create the Lake Powell Site (PUT)

```bash
curl -v -X PUT \
  "https://admin.hlx.page/config/blueacorninc/sites/lake-powell.json" \
  -H "x-auth-token: <your-github-auth-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "version": 1,
    "code": {
      "owner": "BlueAcornInc",
      "repo": "aramark-mb"
    },
    "content": {
      "source": {
        "url": "https://author-p179307-e1885056.adobeaemcloud.com",
        "type": "markup",
        "suffix": ".html"
      }
    }
  }'
```

**Expected response:** `HTTP 201 Created`  
If you get `HTTP 409 Conflict`, the site already exists — proceed to Step 2.  
Use `-v` to see the `x-error` header if debugging a `400` (no response body is returned on errors).

> **Important:** The org identifier in the URL must be **lowercase** (`blueacorninc`, not `BlueAcornInc`).

---

### Step 2 — Apply Path Mappings (POST)

This maps AEM content paths to EDS URL paths:

```bash
curl -v -X POST \
  "https://admin.hlx.page/config/blueacorninc/sites/lake-powell/public.json" \
  -H "x-auth-token: <your-github-auth-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": {
      "mappings": [
        "/content/lake-powell/:/",
        "/content/lake-powell/configuration:/.helix/config.json",
        "/content/lake-powell/metadata:/metadata.json",
        "/content/lake-powell/headers:/.helix/headers.json"
      ],
      "includes": ["/content/lake-powell/"]
    }
  }'
```

**Expected response:** `HTTP 200 OK`

---

### Step 3 — Apply Access Config (POST)

```bash
curl -v -X POST \
  "https://admin.hlx.page/config/blueacorninc/sites/lake-powell/access.json" \
  -H "x-auth-token: <your-github-auth-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "admin": {
      "role": {
        "admin": ["<admin-email@blueacorninc.com>"],
        "config_admin": ["<tech-account>@techacct.adobe.com"]
      },
      "requireAuth": "auto"
    }
  }'
```

---

### Step 4 — Verify the Full Config

```bash
curl -s \
  "https://admin.hlx.page/config/blueacorninc/sites/lake-powell.json" \
  -H "x-auth-token: <your-github-auth-token>" | python -m json.tool
```

Confirm the response contains all four sections: `code`, `content`, `access`, `public` (paths).

---

## AEM Content Checklist

The following content must exist **and be previewed** in AEM at `author-p179307-e1885056.adobeaemcloud.com` for the site to render correctly:

| AEM Path | Purpose | EDS URL |
|---|---|---|
| `/content/lake-powell/index` | Homepage | `/` |
| `/content/lake-powell/nav` | Header navigation fragment | `/nav` |
| `/content/lake-powell/footer` | Footer fragment | `/footer` |
| `/content/lake-powell/metadata` | Metadata sheet (must include `brand: lake-powell` row) | `/metadata.json` |

> **Why the metadata sheet matters:** `scripts/site-resolver.js` reads the `brand` field from AEM page metadata to load the correct brand token file (`brands/lake-powell/tokens.css`). Without `brand: lake-powell` in the metadata sheet, the Lake Powell styles will not apply.

### Previewing Content in AEM

After creating/editing content in AEM Author, it must be **previewed** (not just published) to appear on `.aem.page` URLs. Use the AEM Sidekick extension or the AEM Admin API to trigger a preview:

```bash
# Preview the homepage
curl -X POST \
  "https://admin.hlx.page/preview/blueacorninc/aramark-mb/main/content/lake-powell/index" \
  -H "x-auth-token: <your-github-auth-token>"

# Preview the nav fragment
curl -X POST \
  "https://admin.hlx.page/preview/blueacorninc/aramark-mb/main/content/lake-powell/nav" \
  -H "x-auth-token: <your-github-auth-token>"

# Preview the footer fragment
curl -X POST \
  "https://admin.hlx.page/preview/blueacorninc/aramark-mb/main/content/lake-powell/footer" \
  -H "x-auth-token: <your-github-auth-token>"
```

---

## Verification Steps (Once Admin Steps Are Complete)

1. **Check the preview URL loads:**
   ```
   https://main--lake-powell--blueacorninc.aem.page/
   ```
   Should return an HTML page (not 404).

2. **Check the nav fragment:**
   ```
   https://main--lake-powell--blueacorninc.aem.page/nav
   ```
   Should return the navigation HTML.

3. **Check the footer fragment:**
   ```
   https://main--lake-powell--blueacorninc.aem.page/footer
   ```
   Should return the footer HTML.

4. **Check metadata:**
   ```
   https://main--lake-powell--blueacorninc.aem.page/metadata.json
   ```
   Should return JSON including `{ "brand": "lake-powell" }`.

5. **Check the live URL:**
   ```
   https://main--lake-powell--blueacorninc.aem.live/
   ```
   Should return the page (`.aem.live` = published content, `.aem.page` = previewed content).

---

## Local Development (Once Site Is Live)

Once the Lake Powell EDS site is registered and content is syncing, local development works via:

```bash
pnpm start:brand lake-powell
```

This proxies `https://main--lake-powell--blueacorninc.aem.page` as the content source and runs the local EDS dev server. Brand detection will work automatically via AEM page metadata.

---

## Header/Footer Hang — Technical Explanation

The header block (`blocks/header/header.js`) calls:

```javascript
const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
const fragment = await loadFragment(navPath);
```

`loadFragment()` fetches `/nav` as an HTML document from the EDS origin. When the site config isn't registered, EDS returns a 404 for this fetch. The `loadFragment` implementation in `scripts/aem.js` awaits the response, which either:
- Returns a 404 → `fragment` is empty → the header renders with no content (appears blank/hanging)
- Times out → the header render never completes (appears stuck)

The same applies to the footer (`loadFooter` calls `loadFragment('/footer')`).

**Resolution:** Once the admin API config is applied and AEM content is previewed, these fetches will resolve correctly.

---

## Related Files

| File | Purpose |
|---|---|
| `brands/lake-powell/tokens.css` | Lake Powell brand design tokens |
| `scripts/site-resolver.js` | Brand detection from AEM metadata |
| `scripts/scripts.js` | Loads brand tokens in `loadEager()` |
| `scripts/dev-brand.js` | Local dev brand proxy launcher |
| `blocks/header/header.js` | Header/nav fragment loading |
| `archive-fstab.yaml` | Legacy fstab config (superseded by Admin API) |
| `docs/BRAND-SETUP-GUIDE.md` | Full brand onboarding reference |

---

## Summary

| Item | Status |
|---|---|
| AEM content at `/content/lake-powell/` | ✅ Confirmed set up |
| `brands/lake-powell/` directory in repo | ✅ Exists with `tokens.css` |
| Brand detection code (`site-resolver.js`) | ✅ Implemented |
| EDS site admin API registration | ❌ Blocked — requires org admin access |
| Path mappings applied via Admin API | ❌ Blocked — requires org admin access |
| Content previewed in AEM | ⚠️ Needs verification after admin API steps |
