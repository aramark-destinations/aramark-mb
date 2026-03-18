# EDS Admin API — Org Setup & Authentication

> Source: [config-service-setup](https://www.aem.live/docs/config-service-setup) and [admin-apikeys](https://www.aem.live/docs/admin-apikeys)

---

## Overview

The aem.live org is a mirror of the GitHub org of the same name. Admin access to the Config Service API (`admin.hlx.page`) is tied to the GitHub identity that installed the **AEM Code Sync GitHub App** on the repository — that person is automatically added as the aem.live org admin.

All Config API calls use an `x-auth-token`: an AEM-issued session token obtained by logging into `https://admin.hlx.page/login` with that GitHub identity.

---

## Setting Up the `aramark` Org

This is a one-time bootstrap process when the project moves to the `aramark` GitHub org.

### Step 1 — Confirm the GitHub org has an owner

Aramark's GitHub org must have at least one org owner from the customer's organization before proceeding. This is a hard requirement:

> "It must have at least one owner from the customer's organization." — [config-service-setup](https://www.aem.live/docs/config-service-setup)

### Step 2 — Install the AEM Code Sync GitHub App

Install the [AEM Code Sync App](https://github.com/apps/aem-code-sync) on the repository inside the `aramark` GitHub org.

**Whoever installs the app becomes the aem.live org admin for `aramark`.** This should be a designated team lead or technical owner — the choice is intentional. If a different admin is needed later, contact an Adobe representative.

### Step 3 — Log in and obtain the admin token

The designated admin logs in at `https://admin.hlx.page/login` with their GitHub identity to obtain an `x-auth-token`.

### Step 4 — Register each brand site

For each brand, run the following three calls. Replace `{brand-name}` and `{repo}` accordingly.

**Create the site:**
```bash
curl -X PUT \
  "https://admin.hlx.page/config/aramark/sites/{brand-name}.json" \
  -H "x-auth-token: <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "version": 1,
    "code": { "owner": "aramark", "repo": "{repo}" },
    "content": {
      "source": {
        "url": "https://author-p179307-e1885056.adobeaemcloud.com",
        "type": "markup",
        "suffix": ".html"
      }
    }
  }'
```

**Apply access config:**
```bash
curl -X POST \
  "https://admin.hlx.page/config/aramark/sites/{brand-name}/access.json" \
  -H "x-auth-token: <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "admin": {
      "role": {
        "admin": ["<admin-email>"],
        "config_admin": ["<tech-account>@techacct.adobe.com"]
      },
      "requireAuth": "auto"
    }
  }'
```

**Apply path mappings:**
```bash
curl -X POST \
  "https://admin.hlx.page/config/aramark/sites/{brand-name}/public.json" \
  -H "x-auth-token: <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": {
      "mappings": ["/content/{brand-name}/:/"],
      "includes": ["/content/{brand-name}/"]
    }
  }'
```

**Verify:**
```bash
curl -s "https://admin.hlx.page/config/aramark/sites/{brand-name}.json" \
  -H "x-auth-token: <ADMIN_TOKEN>" | python -m json.tool
```

Response must contain all four sections: `code`, `content`, `access`, `public`.

### Step 5 — Generate API keys per site

Immediately after registration, generate a scoped API key for each site so the team can run ongoing operations without using the admin's personal session token.

```bash
curl -X POST \
  "https://admin.hlx.page/config/aramark/sites/{brand-name}/apiKeys.json" \
  -H "x-auth-token: <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "{brand-name} automation key",
    "roles": ["publish"]
  }'
```

The response includes a `value` field — **this is the API key, store it immediately** in a team secrets manager (1Password, Vault, etc.). Adobe never stores it and it cannot be retrieved again.

---

## Ongoing: Using API Keys

All brand registration and automation after initial setup uses API keys rather than the admin's personal token:

```bash
curl -X PUT \
  "https://admin.hlx.page/config/aramark/sites/{brand-name}.json" \
  -H "X-Auth-Token: <API_KEY>" \
  ...
```

Key properties:
- Scoped per site with assigned roles (e.g., `publish`, `config`)
- Have an expiration — rotate regularly
- Can be listed, updated (description), and deleted via the API
- Stored and shared via team secrets manager, not tied to any individual

---

## UI Alternative

For one-off operations without curl, Adobe provides a UI at **https://tools.aem.live**.

> "For most of the common tasks there are simple user interfaces available on https://tools.aem.live" — [config-service-setup](https://www.aem.live/docs/config-service-setup)

Requires admin login.

---

## Related Docs

- [BRAND-SETUP-GUIDE.md](./BRAND-SETUP-GUIDE.md) — full runbook for adding a brand
- [config-service-setup](https://www.aem.live/docs/config-service-setup) — official Adobe setup guide
- [admin-apikeys](https://www.aem.live/docs/admin-apikeys) — official API keys reference
