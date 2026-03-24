# EDS Admin API — Org Setup & Authentication

> Sources:
> - [Configuration Service Setup](https://www.aem.live/docs/config-service-setup) — org creation, site registration, access control
> - [Admin API Keys](https://www.aem.live/docs/admin-apikeys) — scoped key lifecycle and management
> - [Admin API Reference](https://www.aem.live/docs/admin.html) — full endpoint specification
> - [Repoless Multi-Site Architecture](https://www.aem.live/docs/repoless) — shared-code site model

---

## Overview

The `aem.live` org is a mirror of the GitHub org of the same name. Every `aem.live` organization must correspond to a `github.com` organization, and at least one repository must be synced via the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync). ([source](https://www.aem.live/docs/config-service-setup))

Admin access to the Config Service API (`admin.hlx.page`) is tied to the GitHub identity that installed the AEM Code Sync App — that person is automatically registered as the `aem.live` org admin. ([source](https://www.aem.live/docs/config-service-setup))

All Config API calls authenticate via one of two mechanisms:
- **`x-auth-token`** — a session token obtained by logging in at `admin.hlx.page` with an authorized GitHub or Adobe identity
- **API keys** — scoped, rotating credentials tied to a specific org or site ([source](https://www.aem.live/docs/admin-apikeys))

### Key admin.hlx.page URLs

| URL | Purpose |
|-----|---------|
| `https://admin.hlx.page/login` | Initiates the login flow to authenticate and obtain a session token. Redirects through Adobe IMS. |
| `https://admin.hlx.page/profile` | Returns the authenticated user's profile: identity, org memberships, and roles. Use this to verify that your session is valid and that you have the expected permissions before running config operations. |
| `https://admin.hlx.page/config/{org}/sites.json` | Lists all registered sites within an org (e.g., `https://admin.hlx.page/config/aramark-destinations/sites.json`). Requires an authenticated session with admin or config_admin role on the org. Useful for verifying which sites exist and auditing the org's configuration state. |

---

## Setting Up the `aramark` Org

This is a one-time bootstrap process when the project moves to the `aramark` GitHub org.

### Step 1 — Obtain access to an Aramark GitHub org owner account

We must have access to a GitHub account that holds **org owner** permissions in the Aramark GitHub org before proceeding. This is a hard requirement.

> "The `github.com` org can exceptionally be created by Adobe or a trusted implementation partner on the customer's behalf, but it must have at least one owner from the customer's organization." — [config-service-setup](https://www.aem.live/docs/config-service-setup)

### Why org owner access is required

**How the AEM Config Service bootstraps authority**

Adobe's Config Service (`admin.hlx.page`) does not have its own identity system. It mirrors the GitHub organization structure entirely. The `aramark` org on `aem.live` does not exist until it is bootstrapped, and the only way to bootstrap it is for someone to install the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) on a repository inside that GitHub org. ([source](https://www.aem.live/docs/config-service-setup))

The GitHub identity that performs the app installation automatically and permanently becomes the `aem.live` org admin for `aramark`. Adobe has no alternative onboarding path — there is no admin invitation, no service account workaround, and no way to transfer this role without contacting Adobe directly. ([source](https://www.aem.live/docs/config-service-setup))

**Why org owner specifically — not repo admin**

GitHub restricts organization-scoped GitHub App installation to **org owners only**. A repo admin can install an app on a single repository, but AEM Code Sync requires org-level installation to:

1. **Claim the org namespace** — The `aem.live` org is created as a parallel to the GitHub org. This ensures "the organization namespace is properly claimed by an entity that can also claim an org on `github.com`." ([source](https://www.aem.live/docs/config-service-setup))
2. **Enable the repoless architecture** — In a multi-brand setup, multiple sites share a single code repository. The org-level app installation is what allows new sites to be provisioned against the shared repo without per-repo app installation. ([source](https://www.aem.live/docs/repoless))
3. **Establish the canonical site** — For repoless setups, "one canonical site for which the `org/site` matches the GitHub `owner/repo`" must exist. This canonical binding requires org-level app access. ([source](https://www.aem.live/docs/config-service-setup))

**What happens if a non-Aramark identity performs the installation**

If the app is installed by someone from the parent company — even with good intentions — that person's GitHub identity becomes the permanent `aem.live` org admin for the `aramark` org. This creates the following risks:

- Aramark loses administrative control of their own AEM deployment configuration. All future admin-level Config API operations require a session tied to that individual's identity.
- If that person leaves the parent company, changes roles, or has their GitHub access revoked, the `aem.live` org admin is severed and Adobe must be contacted to recover access — there is no self-service path. ([source](https://www.aem.live/docs/config-service-setup))
- The parent company's employee would hold admin authority over Aramark's production content delivery configuration, creating a compliance and security boundary issue.

**What is being requested of the parent company's team**

Aramark Destinations needs one member of their technical team to be granted **GitHub org owner** status in the parent company's GitHub organization. This person should be a designated technical lead or platform owner on the Aramark side.

**The org admin role in `aem.live` is permanently tied to the GitHub identity that installs the AEM Code Sync App.** That identity must remain active and accessible because:

- **New site creation requires admin authentication.** Each time a new brand site is provisioned (`PUT /config/{org}/sites/{site}.json`), the org admin must authenticate with their session token. API keys cannot create new sites. ([source](https://www.aem.live/docs/config-service-setup))
- **API key creation and rotation require admin authentication.** Each new site needs its own scoped API key, and keys must be rotated before expiration. Only the admin can create and manage keys. ([source](https://www.aem.live/docs/admin-apikeys))
- **If the admin's GitHub identity is deactivated**, there is no self-service recovery — Adobe must be contacted to reassign the org admin.

**Minimizing ongoing admin dependency — batch pre-provisioning**

To reduce the number of times the org admin must be involved, all known brand sites can be **pre-provisioned in a single session** — even if the AEM content for those brands does not exist yet. Site creation in the Config Service is a JSON configuration registration; the site entry is valid regardless of whether content exists at the source URL. Content will simply not resolve until it is authored, but the config, access control, and API keys are all in place.

This means the org admin can, in a single working session:
1. Create all 30+ planned site configs (`PUT /config/{org}/sites/{site}.json` for each)
2. Set access control and path mappings for each
3. Generate API keys for each site

After this batch, **no further admin involvement is needed** for those sites. Content source URLs, path mappings, headers, and other config can all be updated later using the site's API key with a `config` role — no admin session required.

For any **net-new sites** added after the initial batch (names not yet known), the org admin would need to authenticate once to create the site and its API key. This can be handled as a ticketed request.

**Caveats for pre-provisioning:**
- **Site names are permanent.** If a brand's site name changes after pre-provisioning, the admin must delete the old site and create a new one. Finalize naming conventions before the batch.
- **API keys expire.** Keys created during pre-provisioning have a defined expiration (typically one year). If a site doesn't launch before its key expires, the admin must authenticate to rotate the key. Consider generating keys closer to launch for brands with distant timelines, or plan a single key-rotation session.

The org owner role is needed for the initial GitHub App installation. After that, the individual's authority in `aem.live` persists independently of their GitHub org role — but their GitHub account itself must remain active since it is the identity backing their `aem.live` session.

Day-to-day operations (publishing, content preview, configuration updates to existing sites) use **scoped, rotating API keys** and do not require the admin. See [Long-Term Access Model](#long-term-access-model) for the full breakdown.

### Step 2 — Install the AEM Code Sync GitHub App

Install the [AEM Code Sync App](https://github.com/apps/aem-code-sync) on the repository inside the `aramark` GitHub org. This must be done by the org owner identified in Step 1.

**Whoever installs the app becomes the `aem.live` org admin for `aramark`.** This should be a designated team lead or technical owner — the choice is intentional. If a different admin is needed later, contact an Adobe representative. ([source](https://www.aem.live/docs/config-service-setup))

An `aem.live` org with the name `aramark` (matching the GitHub org) will be created automatically during this step. ([source](https://www.aem.live/docs/config-service-setup))

### Step 3 — Authenticate and obtain the `x-auth-token`

The `x-auth-token` is a session token required for all Admin API calls. It is obtained by logging in through the browser and extracting the resulting cookie.

**Login:**

Navigate to:
```
https://admin.hlx.page/login
```

This redirects through Adobe IMS authentication. Sign in with the GitHub or Adobe identity that installed the AEM Code Sync App in Step 2.

**Extract the `auth_token` cookie:**

After successful login, `admin.hlx.page` sets a cookie named `auth_token`. This cookie value is what you pass as the `x-auth-token` header in all API calls.

To extract it:
1. Open your browser's Developer Tools (F12 or Cmd+Option+I)
2. Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Under **Cookies**, select `https://admin.hlx.page`
4. Find the cookie named `auth_token`
5. Copy its **Value** — this is your `x-auth-token`

**Verify the session:**

```bash
curl -s "https://admin.hlx.page/profile" \
  -H "x-auth-token: <AUTH_TOKEN>" | python -m json.tool
```

This returns the authenticated user's identity, org memberships, and admin roles. Confirm that the `aramark` org appears with admin privileges before proceeding.

> **Note:** The session token expires. If API calls begin returning `401`, re-authenticate at `https://admin.hlx.page/login` and extract a fresh token.

### Step 4 — Register each brand site

For multi-site / repoless setups, one **canonical site** must exist where `org/site` matches the GitHub `owner/repo`. Additional brand sites reference the shared code repository and their own content sources. ([source](https://www.aem.live/docs/config-service-setup), [repoless](https://www.aem.live/docs/repoless))

For each brand, run the following calls. Replace `{brand-name}` and `{repo}` accordingly.

**Create the site** ([source](https://www.aem.live/docs/config-service-setup)):
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
        "url": "https://author-p179307-e1885056.adobeaemcloud.com/bin/franklin.delivery/aramark/{brand-name}/main",
        "type": "markup",
        "suffix": ".html"
      }
    }
  }'
```

The site becomes immediately available at `https://main--{brand-name}--aramark.aem.page`. ([source](https://www.aem.live/docs/config-service-setup))

**Apply access config** ([source](https://www.aem.live/docs/config-service-setup#access-control)):
```bash
curl -X POST \
  "https://admin.hlx.page/config/aramark/sites/{brand-name}/access/admin.json" \
  -H "x-auth-token: <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": {
      "config": ["<tech-account>@techacct.adobe.com"]
    }
  }'
```

> **Where to find the `<tech-account>@techacct.adobe.com` value:**
> This is the technical account email from the AEM as a Cloud Service environment's Developer Console. To locate it:
> 1. Go to [Adobe Developer Console](https://developer.adobe.com/console/)
> 2. Select the project associated with the AEM environment
> 3. Under **Credentials**, find the **Service Account (JWT)** or **OAuth Server-to-Server** credential
> 4. The **Technical Account Email** field contains the value (format: `<hex-id>@techacct.adobe.com`)

**Apply path mappings** ([source](https://www.aem.live/docs/config-service-setup)):
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

**List all sites in the org:**
```bash
curl -s "https://admin.hlx.page/config/aramark/sites.json" \
  -H "x-auth-token: <ADMIN_TOKEN>" | python -m json.tool
```

This is equivalent to what you see at `https://admin.hlx.page/config/aramark-destinations/sites.json` for the current aramark-destinations org — it returns every registered site and its configuration.

### Step 5 — Generate API keys per site

Immediately after registration, generate a scoped API key for each site so the team can run ongoing operations without using the admin's personal session token. ([source](https://www.aem.live/docs/admin-apikeys))

Creating, updating, or deleting API keys requires authentication with an **admin role**. ([source](https://www.aem.live/docs/admin-apikeys))

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

The response includes a `value` field — **this is the only time the key value is returned.** It will not be retrievable again through the API. Store it securely immediately. ([source](https://www.aem.live/docs/admin-apikeys))

API keys can also be created at the **org level** for broader operations:

```bash
curl -X POST \
  "https://admin.hlx.page/config/aramark/apiKeys.json" \
  -H "x-auth-token: <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "aramark org automation key",
    "roles": ["publish", "config"]
  }'
```

---

## Ongoing: Using API Keys

All brand automation after initial setup uses API keys rather than the admin's personal token. ([source](https://www.aem.live/docs/admin-apikeys))

```bash
curl -X PUT \
  "https://admin.hlx.page/config/aramark/sites/{brand-name}.json" \
  -H "X-Auth-Token: <API_KEY>" \
  ...
```

Key properties:
- Scoped per site or per org with assigned roles (e.g., `publish`, `config`)
- Have a defined expiration — Adobe recommends setting up a process to generate new keys and replace old ones before expiration ([source](https://www.aem.live/docs/admin-apikeys))
- Can be listed, updated (description), and deleted via the API
- Not tied to any individual identity — can be shared across the team

### API key management endpoints ([source](https://www.aem.live/docs/admin-apikeys))

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Create (site) | POST | `/config/{org}/sites/{site}/apiKeys.json` |
| List (site) | GET | `/config/{org}/sites/{site}/apiKeys.json` |
| Update description | POST | `/config/{org}/sites/{site}/apiKeys/{id}.json` |
| Delete | DELETE | `/config/{org}/sites/{site}/apiKeys/{id}.json` |
| Create (org) | POST | `/config/{org}/apiKeys.json` |
| List (org) | GET | `/config/{org}/apiKeys.json` |

---

## Long-Term Access Model

This section answers the critical question: **do we need org admin access every time we add a new brand site, or can API keys handle it?**

### Operations that require org admin (session token)

| Operation | Frequency | Why |
|-----------|-----------|-----|
| **Initial org bootstrap** (Step 1-3) | One-time | Creates the `aem.live` org by installing the GitHub App |
| **Creating a new brand site** | Each new brand (~30+ planned) | `PUT /config/{org}/sites/{site}.json` requires admin-level auth — API keys cannot create new sites ([source](https://www.aem.live/docs/config-service-setup)) |
| **Creating/rotating API keys** | Each new brand + periodic rotation | Key management requires admin role authentication ([source](https://www.aem.live/docs/admin-apikeys)) |
| **Modifying org-level access control** | As needed | Adding/removing users and roles at the org level |
| **Changing the org admin** | Rare | Requires contacting Adobe — no API path ([source](https://www.aem.live/docs/config-service-setup)) |

### Operations that can use API keys (no org admin needed)

| Operation | Required role | Notes |
|-----------|--------------|-------|
| **Publishing content** | `publish` | Day-to-day content operations |
| **Updating site configuration** | `config` | Modifying existing site settings (code source, content source, headers, public config, etc.) |
| **Preview and live operations** | `publish` | Content preview and cache invalidation |

### Creating new brand sites — the nuance

Creating a new site (`PUT /config/{org}/sites/{site}.json`) requires **admin-level authentication**. API keys — even org-scoped keys with a `config` role — cannot create entirely new sites. They can only modify existing configurations. ([source](https://www.aem.live/docs/config-service-setup), [source](https://www.aem.live/docs/admin-apikeys))

However, **sites can be pre-provisioned before their content exists.** The site creation call is a JSON config registration — the Config Service accepts it regardless of whether content is available at the source URL yet. This means all known brand sites can be batch-created in a single admin session, and content can be authored later without further admin involvement.

### Recommended long-term access strategy

1. **Org admin account** — Maintain one designated Aramark team member as the `aem.live` org admin. This person does not need to be a GitHub org owner on an ongoing basis — they only needed org owner access during the initial Code Sync App installation. Their admin authority in `aem.live` persists independently of their GitHub permissions after bootstrap.

2. **Batch pre-provision all known sites** — During the initial setup session, create all 30+ planned brand site configs, access controls, and API keys in one pass. This front-loads the admin dependency and eliminates the need for admin involvement as each brand goes live. Config changes to those sites (content URLs, path mappings, headers) can be made later with API keys.

3. **`config_admin` role** — Assign trusted team members and tech accounts the `config_admin` role at the site level so they can manage day-to-day configuration without the org admin.

4. **Org-level API key with `config` role** — Create an org-scoped API key for automation workflows that need to operate across multiple sites.

5. **Site-level API keys with `publish` role** — Create per-site keys for CI/CD pipelines and content automation. Rotate these before expiration per Adobe's recommendation.

6. **Net-new sites (unplanned brands)** — For any brand site not included in the initial batch, submit a ticketed request for the org admin to authenticate, create the site config, and generate its API key. This is a lightweight operation (a few API calls). All subsequent day-to-day operations use the key.

7. **API key rotation** — Keys created during pre-provisioning will expire (typically one year). Schedule a single admin session to rotate keys for sites that haven't launched yet, or defer key generation for distant-timeline brands until closer to launch.

---

## UI Alternative

For one-off operations without curl, Adobe provides a UI at **https://tools.aem.live**.

> "For most of the common tasks there are simple user interfaces available on https://tools.aem.live" — [config-service-setup](https://www.aem.live/docs/config-service-setup)

Requires admin login.

---

### Per-site configuration endpoints ([source](https://www.aem.live/docs/config-service-setup))

| Configuration | Endpoint | Purpose |
|---------------|----------|---------|
| Access control | `/config/{org}/sites/{site}/access/admin.json` | Assign user roles (admin, config_admin) |
| Code source | `/config/{org}/sites/{site}/code.json` | Point to shared code repo (repoless) |
| Content source | `/config/{org}/sites/{site}/content.json` | Set content origin URL |
| CDN (production) | `/config/{org}/sites/{site}/cdn/prod.json` | Configure Fastly or other CDN |
| Custom headers | `/config/{org}/sites/{site}/headers.json` | Set HTTP headers by path pattern |
| Public config | `/config/{org}/sites/{site}/public.json` | Client-accessible settings (path mappings, etc.) |
| Sidekick | `/config/{org}/sites/{site}/sidekick.json` | Customize AEM Sidekick plugins |
| Query/indexing | `/config/{org}/sites/{site}/content/query.yaml` | Search index configuration |
| Sitemap | `/config/{org}/sites/{site}/content/sitemap.yaml` | Sitemap generation rules |
| robots.txt | `/config/{org}/sites/{site}/robots.txt` | Crawler instructions |

**Security note:** Do not store secrets in public configuration — it is accessible at `https://{your-host}/config.json`. ([source](https://www.aem.live/docs/config-service-setup))

---

## Related Docs

- [BRAND-SETUP-GUIDE.md](./BRAND-SETUP-GUIDE.md) — full runbook for adding a brand
- [Configuration Service Setup](https://www.aem.live/docs/config-service-setup) — official Adobe setup guide
- [Admin API Keys](https://www.aem.live/docs/admin-apikeys) — official API keys reference
- [Admin API Reference](https://www.aem.live/docs/admin.html) — full REST API specification
- [Repoless Architecture](https://www.aem.live/docs/repoless) — shared-code multi-site model
- [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) — the GitHub App that must be installed
