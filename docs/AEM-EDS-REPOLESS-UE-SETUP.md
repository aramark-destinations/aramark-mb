# AEM EDS Repoless + Universal Editor Setup Guide

**Version:** v1.0
**Status:** Working draft — open questions noted inline

---

## Table of Contents

1. [Overview & Migration Context](#1-overview--migration-context)
2. [Required Actors & Permissions](#2-required-actors--permissions)
3. [Phase A — GitHub Repo Setup](#3-phase-a--github-repo-setup)
4. [Phase B — AEM Code Sync GitHub App](#4-phase-b--aem-code-sync-github-app)
5. [Phase C — Create First Site (unbranded) in AEM Sites UI](#5-phase-c--create-first-site-unbranded-in-aem-sites-ui)
6. [Phase D — Admin API Authentication](#6-phase-d--admin-api-authentication)
7. [Phase E — Technical Account Setup](#7-phase-e--technical-account-setup-aem--eds-publish-auth)
8. [Phase F — Configure unbranded Site via Admin API](#8-phase-f--configure-unbranded-site-via-admin-api)
9. [Phase G — Create lake-powell Site via Admin API](#9-phase-g--create-lake-powell-site-via-admin-api-repoless)
10. [Verification](#10-verification)
11. [Open Questions](#11-open-questions)

---

## Placeholder Reference

Before running any commands, replace these tokens throughout:

| Placeholder | Description |
|-------------|-------------|
| `<NEW_GITHUB_ORG>` | The new GitHub organization that aligns to the correct Adobe org |
| `<NEW_REPO>` | The repository name in the new GitHub org |
| `<AEM_PROGRAM_ID>` | AEM Cloud Service program ID (e.g. `179307`) |
| `<AEM_ENV_ID>` | AEM Cloud Service environment ID (e.g. `1885056`) |
| `<TECH_ACCOUNT_ID>` | The technical account identifier from AEM Cloud Services config (format: `<id>@techacct.adobe.com`) |
| `<TOKEN>` | Your Admin API auth token (see [Phase D](#6-phase-d--admin-api-authentication)) |

---

## 1. Overview & Migration Context

### Why we are migrating

The current repository lives in the `blueacorninc` GitHub org. AEM Code Sync ties a GitHub org to an Adobe org at installation time. Because the `blueacorninc` org is associated with the wrong Adobe org, code sync sends the wrong credentials when attempting to sync code to AEM — breaking deployment entirely.

**Fix**: move the repository to a new GitHub org that aligns with the correct Adobe org, then reconfigure AEM Code Sync and the Admin API site configs against that org.

### Target architecture

- **One shared repo**: `https://github.com/<NEW_GITHUB_ORG>/<NEW_REPO>`
- **Two repoless sites** — both pointing at the same code repo, each with its own AEM content source:
  - `unbranded` — the canonical template site; created via AEM Sites UI
  - `lake-powell` — the first client site; created via Admin API (repoless pattern)
- **Live URLs**:
  - `https://main--unbranded--<NEW_GITHUB_ORG>.aem.live`
  - `https://main--lake-powell--<NEW_GITHUB_ORG>.aem.live`

### What "repoless" means in this context

In a repoless setup, each site's configuration (code source, content source, paths) is stored in Adobe's configuration service rather than in per-site `fstab.yaml` and `paths.json` files. Multiple sites can share one GitHub repo while maintaining independent content sources. All config is managed via the Admin API.

> Source: [https://www.aem.live/docs/repoless](https://www.aem.live/docs/repoless)

---

## 2. Required Actors & Permissions

| Actor | System | Permission required |
|-------|--------|---------------------|
| GitHub Repo Admin | GitHub | Admin access to `<NEW_REPO>` — required to install GitHub Apps on the repo |
| AEM Admin | AEM Cloud Console | Create sites, manage Cloud Services configuration |
| EDS Admin API Operator | admin.hlx.page | Adobe identity login; create/update site configs via Admin API |

> **Note on GitHub permissions**: Adobe's documentation states the Code Sync app must be "installed on the repository." Per standard GitHub behavior, a **repository admin** (not necessarily org owner) can install GitHub Apps on their specific repository without org-level admin rights. Adobe does not explicitly require org-level permissions.

---

## 3. Phase A — GitHub Repo Setup

1. Create a new repository `<NEW_REPO>` inside `<NEW_GITHUB_ORG>`.
   - Adobe recommends keeping the repository **public** for standard EDS projects.
2. Push the existing Crosswalk-based codebase (built on `aem-boilerplate-xwalk`) to the new repo.
   ```bash
   git remote set-url origin https://github.com/<NEW_GITHUB_ORG>/<NEW_REPO>.git
   git push -u origin main
   ```
3. Confirm the repo is live at `https://github.com/<NEW_GITHUB_ORG>/<NEW_REPO>`.

> Source: [https://www.aem.live/developer/ue-tutorial](https://www.aem.live/developer/ue-tutorial)

---

## 4. Phase B — AEM Code Sync GitHub App

AEM Code Sync is a GitHub App that watches your repository for code changes and syncs them to Adobe's code bus, which backs the CDN-served `.aem.live` URLs. This is a **GitHub App concern** — it is separate from Admin API authentication.

### Installation steps

1. Navigate to: `https://github.com/apps/aem-code-sync/installations/new`
2. Select `<NEW_GITHUB_ORG>` as the account to install on.
3. Under **Repository access**, select **"Only select repositories"**.
4. Choose `<NEW_REPO>` from the list.
5. Click **Save**.

### Who performs this step

The person installing must have **admin access to `<NEW_REPO>`** (repository admin). An org owner can also install at the org level if that access is available, but repo-level admin is sufficient per standard GitHub App behavior.

### What Code Sync does

Once installed, the app:
- Listens for pushes to the repository
- Publishes code changes to Adobe's code bus
- Automatically purges CDN caches when the `main` branch is updated

> Source: [https://www.aem.live/developer/tutorial](https://www.aem.live/developer/tutorial), [https://www.aem.live/developer/ue-tutorial](https://www.aem.live/developer/ue-tutorial)

---

## 5. Phase C — Create First Site (unbranded) in AEM Sites UI

The first site (`unbranded`) must be created through the AEM Sites console UI using the Universal Editor boilerplate template. Subsequent repoless sites (like `lake-powell`) are created via the Admin API only — no UI required.

### Steps

1. **Download the site template**
   Get the latest release from:
   `https://github.com/adobe-rnd/aem-boilerplate-xwalk/releases`
   Download the `.zip` template file.

2. **Open AEM Sites console**
   Navigate to your AEM author instance:
   `https://author-p<AEM_PROGRAM_ID>-e<AEM_ENV_ID>.adobeaemcloud.com/sites.html`

3. **Create site from template**
   - Click **Create** → **Site from template**
   - Click **Import** and upload the `.zip` file from step 1
   - Fill in the fields:

   | Field | Value |
   |-------|-------|
   | Site title | `Unbranded` |
   | Site name | `unbranded` |
   | GitHub URL | `https://github.com/<NEW_GITHUB_ORG>/<NEW_REPO>` |

   - Click **Create**

4. **Quick Publish all pages**
   - In the Sites console, select all pages under the new site
   - Click **Quick Publish** in the toolbar
   - Confirm in the dialog

> Source: [https://www.aem.live/developer/ue-tutorial](https://www.aem.live/developer/ue-tutorial)

---

## 6. Phase D — Admin API Authentication

All Admin API configuration calls (creating/updating site configs, paths, access) require an auth token. Adobe documents two approaches:

### Option 1: Org/Site-level API Keys (recommended for team use)

Adobe's Admin API documents the ability to create non-personal API keys scoped to an org or site:

- **Create org-level key**: `POST https://admin.hlx.page/org/<org>/admin-api-keys`
- **Create site-level key**: `POST https://admin.hlx.page/site/<org>/<site>/admin-api-keys`
- **List, read, delete** endpoints also available at the same paths

> **Open question — header format**: Adobe's documentation confirms these API key endpoints exist but **does not document the authorization header format** for using the keys in requests. The published curl examples in the docs only demonstrate `x-auth-token`. Before relying on org/site API keys for team automation, confirm the header format with Adobe support.
>
> Source: [https://www.aem.live/docs/admin.html](https://www.aem.live/docs/admin.html)

### Option 2: Personal x-auth-token (fallback for individual use)

1. Open `https://admin.hlx.page/login` in a browser
2. Log in with your Adobe credentials
3. Open browser DevTools → Application tab → Cookies
4. Copy the value of the `auth_token` cookie
5. Use it in all curl commands as: `-H 'x-auth-token: <TOKEN>'`

> **Important**: This token is **user-session based** and tied to the individual who logged in. It cannot be shared across team members.
>
> Source: [https://www.aem.live/developer/repoless-authoring](https://www.aem.live/developer/repoless-authoring)

---

> All curl examples in this guide use `x-auth-token` as shown in Adobe's published documentation. Once the API key header format is confirmed with Adobe, substitute accordingly for team use.

---

## 7. Phase E — Technical Account Setup (AEM → EDS Publish Auth)

AEM uses a technical account (a service identity) when publishing content to EDS. This account must be granted `config_admin` access in each site's configuration. This is separate from developer Admin API auth.

### Locate the technical account ID

1. Log in to your AEM author instance
2. Navigate to **Tools → Cloud Services → Edge Delivery Services Configuration**
3. Find the **Technical Account ID** — it has the format: `<id>@techacct.adobe.com`
4. Copy this value — you will use it as `<TECH_ACCOUNT_ID>` in Phase F and G

> Source: [https://www.aem.live/developer/repoless-authoring](https://www.aem.live/developer/repoless-authoring)

---

## 8. Phase F — Configure unbranded Site via Admin API

These three API calls configure the `unbranded` site's code source, content source, paths mapping, and access control.

### F1. Create/update site config

This tells AEM's configuration service where the code lives (GitHub) and where the content is served from (AEM author).

```bash
curl -X PUT https://admin.hlx.page/config/<NEW_GITHUB_ORG>/sites/unbranded.json \
  -H 'x-auth-token: <TOKEN>' \
  -H 'content-type: application/json' \
  --data '{
    "code": {
      "owner": "<NEW_GITHUB_ORG>",
      "repo": "<NEW_REPO>",
      "source": {
        "type": "github",
        "url": "https://github.com/<NEW_GITHUB_ORG>/<NEW_REPO>"
      }
    },
    "content": {
      "source": {
        "url": "https://author-p<AEM_PROGRAM_ID>-e<AEM_ENV_ID>.adobeaemcloud.com/bin/franklin.delivery/<NEW_GITHUB_ORG>/unbranded/main",
        "type": "markup",
        "suffix": ".html"
      }
    }
  }'
```

### F2. Configure paths mapping (public.json)

Maps AEM content repository paths to EDS URL paths. Replaces the role of `fstab.yaml` and `paths.json` in a repoless setup.

```bash
curl --request POST \
  https://admin.hlx.page/config/<NEW_GITHUB_ORG>/sites/unbranded/public.json \
  -H 'x-auth-token: <TOKEN>' \
  -H 'content-type: application/json' \
  --data '{
    "paths": {
      "mappings": [
        "/content/unbranded/:/",
        "/content/unbranded/configuration:/.helix/config.json"
      ],
      "includes": ["/content/unbranded/"]
    }
  }'
```

### F3. Configure access (access.json)

Grants the technical account publish/write access and `config_admin` role.

```bash
curl --request POST \
  https://admin.hlx.page/config/<NEW_GITHUB_ORG>/sites/unbranded/access.json \
  -H 'x-auth-token: <TOKEN>' \
  -H 'content-type: application/json' \
  --data '{
    "admin": {
      "require": {
        "read": [],
        "write": ["<TECH_ACCOUNT_ID>@techacct.adobe.com"]
      },
      "allow": {
        "config_admin": ["<TECH_ACCOUNT_ID>@techacct.adobe.com"]
      }
    }
  }'
```

> Source: [https://www.aem.live/developer/repoless-authoring](https://www.aem.live/developer/repoless-authoring)

---

## 9. Phase G — Create lake-powell Site via Admin API (Repoless)

Because `unbranded` is the canonical first site (created via AEM Sites UI), all additional sites like `lake-powell` are created purely via the Admin API. No AEM Sites UI is required. Both sites share the same code repo but have independent content sources and configurations.

### G1. Create site config

```bash
curl -X PUT https://admin.hlx.page/config/<NEW_GITHUB_ORG>/sites/lake-powell.json \
  -H 'x-auth-token: <TOKEN>' \
  -H 'content-type: application/json' \
  --data '{
    "code": {
      "owner": "<NEW_GITHUB_ORG>",
      "repo": "<NEW_REPO>",
      "source": {
        "type": "github",
        "url": "https://github.com/<NEW_GITHUB_ORG>/<NEW_REPO>"
      }
    },
    "content": {
      "source": {
        "url": "https://author-p<AEM_PROGRAM_ID>-e<AEM_ENV_ID>.adobeaemcloud.com/bin/franklin.delivery/<NEW_GITHUB_ORG>/lake-powell/main",
        "type": "markup",
        "suffix": ".html"
      }
    }
  }'
```

### G2. Configure paths mapping (public.json)

```bash
curl --request POST \
  https://admin.hlx.page/config/<NEW_GITHUB_ORG>/sites/lake-powell/public.json \
  -H 'x-auth-token: <TOKEN>' \
  -H 'content-type: application/json' \
  --data '{
    "paths": {
      "mappings": [
        "/content/lake-powell/:/",
        "/content/lake-powell/configuration:/.helix/config.json"
      ],
      "includes": ["/content/lake-powell/"]
    }
  }'
```

### G3. Configure access (access.json)

```bash
curl --request POST \
  https://admin.hlx.page/config/<NEW_GITHUB_ORG>/sites/lake-powell/access.json \
  -H 'x-auth-token: <TOKEN>' \
  -H 'content-type: application/json' \
  --data '{
    "admin": {
      "require": {
        "read": [],
        "write": ["<TECH_ACCOUNT_ID>@techacct.adobe.com"]
      },
      "allow": {
        "config_admin": ["<TECH_ACCOUNT_ID>@techacct.adobe.com"]
      }
    }
  }'
```

> Source: [https://www.aem.live/docs/repoless](https://www.aem.live/docs/repoless), [https://www.aem.live/developer/repoless-authoring](https://www.aem.live/developer/repoless-authoring)

> **Adding future sites**: Repeat Phase G substituting the new site name throughout. Each new site gets its own `<site>.json`, `<site>/public.json`, and `<site>/access.json` — all pointing at the same shared `<NEW_GITHUB_ORG>/<NEW_REPO>` code source.

---

## 10. Verification

### Check preview URLs

After completing all phases, both sites should be accessible at their preview URLs:

- `https://main--unbranded--<NEW_GITHUB_ORG>.aem.page`
- `https://main--lake-powell--<NEW_GITHUB_ORG>.aem.page`

Production (`.aem.live`) URLs are available after content is published.

### Confirm Code Sync is active

Push a trivial change to the `main` branch:

```bash
# e.g. update a comment in a block file
git add .
git commit -m "test: verify code sync on new org"
git push origin main
```

Within a few minutes the change should be reflected at the `.aem.page` URL, confirming Code Sync is operating correctly under the new org.

### Local development

```bash
npm install -g @adobe/aem-cli
aem up --url https://main--unbranded--<NEW_GITHUB_ORG>.aem.page
```

Opens `http://localhost:3000/` proxied against the live preview.

---

## 11. Open Questions

These items have gaps in Adobe's public documentation. Resolve with Adobe support before proceeding to production.

| # | Question | Why it matters |
|---|----------|----------------|
| 1 | **Admin API key header format** | Adobe documents that org/site-level API keys can be created via `POST /org/<org>/admin-api-keys` and `POST /site/<org>/<site>/admin-api-keys`, but does not document the header format for *using* those keys in requests. The published curl examples only show `x-auth-token`. Confirm with Adobe support before using API keys for team automation. |
| 2 | **Exact request body for API key creation** | The API key creation endpoints are listed in the Admin API docs but no example request body is published. |

---

## Source Documentation

All steps in this guide are derived from official Adobe documentation:

- [https://www.aem.live/docs/repoless](https://www.aem.live/docs/repoless)
- [https://www.aem.live/developer/tutorial](https://www.aem.live/developer/tutorial)
- [https://www.aem.live/developer/ue-tutorial](https://www.aem.live/developer/ue-tutorial)
- [https://www.aem.live/developer/repoless-authoring](https://www.aem.live/developer/repoless-authoring)
- [https://www.aem.live/docs/admin.html](https://www.aem.live/docs/admin.html)
