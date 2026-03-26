---
name: validate-third-party
description: Validate third-party integrations follow solution design requirements for async loading, consent, environment config, and performance. Use when adding or reviewing third-party integrations (OneTrust, HotJar, Elastic Search, Fleeknote, YouTube, Emplifi, Google Maps, chatbot).
---

# Validate Third-Party Integration

## Overview

Third-party integrations must meet strict requirements from the solution design:

1. **Async loading** — No render-blocking scripts
2. **Consent awareness** — Tracking scripts gated behind OneTrust consent
3. **Environment separation** — Different workspace/API IDs for dev, stage, prod
4. **Performance preservation** — Lighthouse score stays >= 90 with integration active

This skill validates one or more integrations against these requirements.

---

## Pre-flight

- [ ] Identify which integration(s) to validate
- [ ] Review the per-integration checklist in Step 5 of this skill
- [ ] Know the environment being tested (dev, staging, prod)

---

## Step 1: Async Loading

For each third-party script, verify it does NOT block rendering.

### What to check

- [ ] Script tags use `async` or `defer` attribute
- [ ] Scripts are NOT in `<head>` without `async`/`defer`
- [ ] Scripts are loaded via EDS delayed loading pattern (`scripts/delayed.js` or equivalent)
- [ ] No synchronous `document.write()` calls
- [ ] Script loading does not delay DOMContentLoaded

### How to verify

**Code inspection:**
```bash
# Search for script tags loading third-party resources
grep -rn '<script' head.html scripts/ blocks/
grep -rn 'document.write' scripts/ blocks/
```

**Runtime verification:**
1. Open DevTools Network tab
2. Filter by JS
3. Check each third-party script's initiator chain
4. Verify no scripts appear in the "render-blocking" section of Lighthouse

---

## Step 2: Consent Awareness

All tracking/analytics scripts must wait for user consent via OneTrust.

### Consent flow

```
Page loads → OneTrust banner displayed → User grants/denies consent →
  If granted: tracking scripts fire
  If denied: tracking scripts never load
```

### What to check

- [ ] OneTrust script loads BEFORE any tracking scripts
- [ ] Tracking scripts are wrapped in OneTrust consent callbacks or use OneTrust script categorization
- [ ] Scripts are tagged with appropriate consent category (e.g., `class="optanon-category-C0002"` for performance cookies)
- [ ] No tracking fires before consent is granted (test with consent denied)
- [ ] Cookie consent preferences are respected on subsequent page loads

### Integrations requiring consent gating

| Integration | Consent required | Category |
|---|---|---|
| HotJar | Yes | Analytics/Performance |
| Fleeknote | Yes | Marketing |
| Emplifi | Yes | Social/Marketing |
| Google Maps | Depends on config | Functional |
| YouTube (with tracking) | Yes | Analytics |
| Chatbot | Depends on config | Functional |

### Testing consent

1. Clear all cookies
2. Load page — verify OneTrust banner appears
3. Check Network tab — NO tracking requests should fire yet
4. Deny all cookies — verify no tracking loads
5. Accept cookies — verify tracking scripts now fire
6. Reload page — verify consent is remembered

---

## Step 3: Environment Configuration

Each integration must use separate configurations per environment.

### What to check

- [ ] Dev/staging environments use sandbox/test API keys, workspace IDs, or account IDs
- [ ] Production environment uses production credentials
- [ ] Environment detection is automatic (not manually toggled)
- [ ] No production API keys exposed in non-production environments

### Per-integration environment expectations

| Integration | Environment config |
|---|---|
| **OneTrust** | Separate consent groups for dev/stage vs prod |
| **HotJar** | Separate workspace configs per environment |
| **Elastic Search** | Separate indices per environment |
| **Fleeknote** | Environment-specific workspace IDs |
| **Google Maps** | May use same API key with domain restrictions |
| **Emplifi** | Separate embed/playlist/feed IDs if applicable |
| **Chatbot** | Separate workspace/bot IDs per environment |

### How to verify

**Code inspection:**
```bash
# Search for environment-specific configuration
grep -rn 'env' scripts/ blocks/ .env .env.example
grep -rn 'production\|staging\|development' scripts/ blocks/
```

**Runtime verification:**
1. Check `.env` or `.env.example` for environment-specific variables
2. Verify configuration loading logic in relevant blocks/scripts
3. Confirm dev server uses non-production values

---

## Step 4: Performance Impact

The integration must not degrade Lighthouse scores below 90.

### Before/after comparison

1. Run `eds/quality-audit` (Lighthouse) on the page WITHOUT the integration active
2. Enable the integration
3. Run `eds/quality-audit` again
4. Compare scores

### Acceptable impact

| Category | Max acceptable drop |
|---|---|
| Performance | 5 points (still must be >= 90) |
| Accessibility | 0 points |
| Best Practices | 5 points (still must be >= 90) |
| SEO | 0 points |

### Common performance issues from third-party scripts

- Large JS bundle blocking main thread
- Multiple HTTP requests during page load
- Scripts loading additional scripts (cascading requests)
- Inline styles causing layout shifts (CLS)
- Synchronous DOM manipulation

---

## Step 5: Integration-Specific Checks

### OneTrust
- [ ] Consent banner renders on first visit
- [ ] Cookie preferences are configurable
- [ ] Consent state persists across page loads
- [ ] Privacy policy link is accessible
- [ ] Non-essential scripts are blocked until consent

### HotJar
- [ ] Loads asynchronously
- [ ] Separate workspace per environment
- [ ] Gated behind analytics consent category
- [ ] Feedback widgets render correctly
- [ ] Does not interfere with page interactions

### Elastic Search
- [ ] Site search works across all properties
- [ ] Indexes EDS-generated HTML/JSON and AEM Assets metadata
- [ ] Multi-field search with typo-tolerance
- [ ] Faceted filtering works on listing pages
- [ ] Autocomplete suggestions appear
- [ ] Separate indices per environment

### Fleeknote
- [ ] Consent-aware via OneTrust
- [ ] Environment-specific workspace IDs
- [ ] Newsletter sign-up forms submit correctly
- [ ] Promotional callouts render correctly
- [ ] Loads asynchronously

### YouTube
- [ ] Responsive iframe embed (fills container width)
- [ ] Lightweight embed (no unnecessary script loading)
- [ ] Optional parameters work (autoplay, controls)
- [ ] Accessible controls (play/pause, captions)
- [ ] Privacy-enhanced mode used if available

### Emplifi
- [ ] Block-driven configuration (embed/playlist/feed IDs in block config)
- [ ] Async loading
- [ ] Social posts render correctly
- [ ] UGC galleries display properly
- [ ] Live feeds update as expected

### Google Maps
- [ ] **Simple embed (Embed block):** iframe loads, responsive, no API key needed
- [ ] **Interactive Map (custom block):** Google Maps API loads async, custom POIs render, starting zoom works, custom icons display
- [ ] Both types are responsive

### Chatbot
- [ ] Async script loading
- [ ] Can be enabled/disabled per page via metadata/configuration
- [ ] Can be enabled/disabled per property
- [ ] Does not interfere with other page interactions
- [ ] Accessible (keyboard navigable, screen reader compatible)

---

## Step 6: Generate Report

```
# Third-Party Integration Audit Report
Integration: {name}
Environment: {dev/staging/prod}
Date: {date}

## Summary
| Check | Result |
|---|---|
| Async loading | PASS/FAIL |
| Consent awareness | PASS/FAIL/N-A |
| Environment config | PASS/FAIL |
| Performance impact | PASS/FAIL (score delta: {N}) |
| Integration-specific | PASS/FAIL |

## Overall: PASS / FAIL

## Issues Found
1. {issue + remediation}
...
```

---

## Anti-Patterns

| Do NOT | Do instead |
|--------|-----------|
| Load third-party scripts synchronously in `<head>` | Use async/defer or delayed loading pattern |
| Fire tracking before OneTrust consent | Gate all tracking behind consent callbacks |
| Use production API keys in dev/staging | Maintain separate credentials per environment |
| Accept "it works" without performance check | Run before/after Lighthouse comparison |
| Embed third-party CSS inline | Load via block CSS or async stylesheet |
| Skip consent testing with cookies denied | Always test the deny path — it's the most common failure |
