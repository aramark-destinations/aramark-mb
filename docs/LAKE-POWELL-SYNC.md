# Lake Powell Content Sync — Investigation Guide

**Status:** Blocked pending EDS org admin access  
**URLs affected:**
- `https://main--lake-powell--blueacorninc.aem.page/` — preview loads but content not syncing
- `https://main--lake-powell--blueacorninc.aem.live/` — 404

---

## Root Cause (Assumtions)

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

    - To grant Sourabh admin role on the site, run:
```bash
    curl -X POST \
    "https://admin.hlx.page/config/BlueAcornInc/sites/lake-powell/access/admin.json" \
    -H "Content-Type: application/json" \
    -H "authorization: token YOUR_TOKEN" \
    -d '{
        "role": {
        "admin": [
            "sourabh.kumawat@blueacornici.com"
        ]
        },
        "requireAuth": "auto"
    }'
---
admin → list of emails allowed to fully administer the site (preview/publish via Admin API, headers, etc.)[access-admin]
requireAuth: "auto" → standard setting used in current Edge Delivery docs; site operations require authenticated users when applicable.

## Step-by-Step: Admin API Checklist

Replace `<YOUR_TOKEN>` with the token obtained from `https://admin.hlx.page/login`.

### Step 1 — Clear content chache and check 
```bash
curl -X POST \
  "https://admin.hlx.page/cache/BlueAcornInc/lake-powell/main" \
  -H "x-auth-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": [   
      "/*"
    ]
  }'
```

Above call will wipe cached content for all paths of the branch:

Tp clear Clear cache for
https://main--aramark-mb--blueacorninc.aem.live/menu/lunch
Path is /menu/lunch.

### Step 1 — Verify the Full Config

```bash
curl -s \
  "https://admin.hlx.page/config/blueacorninc/sites/lake-powell.json" \
  -H "x-auth-token: <YOUR_TOKEN>" | python -m json.tool
```

Confirm the response contains all four sections: `code`, `content`, `access`, `public` (paths).

if anything is not configured properly check the below calls

---

### Step 2 — For Creating the Lake Powell Site (PUT)

```bash
curl -v -X PUT \
  "https://admin.hlx.page/config/blueacorninc/sites/lake-powell.json" \
  -H "x-auth-token: <YOUR_TOKEN>" \
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

### Step 3 — For Appling Path Mappings (POST)

This maps AEM content paths to EDS URL paths:

```bash
curl -v -X POST \
  "https://admin.hlx.page/config/blueacorninc/sites/lake-powell/public.json" \
  -H "x-auth-token: <YOUR_TOKEN>" \
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

### Step 4 — For Appling Access Config (POST)

```bash
curl -v -X POST \
  "https://admin.hlx.page/config/blueacorninc/sites/lake-powell/access.json" \
  -H "x-auth-token: <YOUR_TOKEN>" \
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

### Step 5 — Reverify the Full Config and see all configs are fine now,

```bash
curl -s \
  "https://admin.hlx.page/config/blueacorninc/sites/lake-powell.json" \
  -H "x-auth-token: <YOUR_TOKEN>" | python -m json.tool
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
  -H "x-auth-token: <YOUR_TOKEN>"

# Preview the nav fragment
curl -X POST \
  "https://admin.hlx.page/preview/blueacorninc/aramark-mb/main/content/lake-powell/nav" \
  -H "x-auth-token: <YOUR_TOKEN>"

# Preview the footer fragment
curl -X POST \
  "https://admin.hlx.page/preview/blueacorninc/aramark-mb/main/content/lake-powell/footer" \
  -H "x-auth-token: <YOUR_TOKEN>"
```

---