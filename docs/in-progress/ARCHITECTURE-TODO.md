# Architecture TODO

This document tracks technical decisions and implementation details. Items are organized by category with status indicators.

---

## Resolved Items

The following items have been completed or clarified:

- ~~**Import Order Enforcement**~~ — Resolved via `@import` chain (`styles.css` → `fixed-tokens.css` → `root-tokens.css`) + runtime `loadCSS()` for brand tokens
- ~~**Wire token @import chain**~~ — `head.html` loads `styles.css`, which imports `fixed-tokens.css`, which imports `root-tokens.css`
- ~~**Fix grey token conflict**~~ — Grey scale is explicit hand-picked values in `root-tokens.css`, not derived via `color-mix()`
- ~~**Fix --text-dark-3 reference**~~ — Resolved; points to `--color-grey-500` in `root-tokens.css`
- ~~**Alias legacy tokens**~~ — Legacy aliases (`--background-color`, `--text-color`, etc.) mapped to design tokens in `styles.css`
- ~~**Implement brand token loading**~~ — `loadEager()` in `scripts.js` dynamically loads `brands/{brand}/tokens.css` via `loadCSS()`
- ~~**Brand detection via AEM metadata**~~ — `site-resolver.js` `getCurrentBrand()` checks AEM page metadata first, URL path fallback for local dev
- ~~**Create brand setup docs**~~ — `docs/BRAND-SETUP-GUIDE.md` created
- ~~**Remove Redundant package-lock.json**~~ — Removed; added to `.gitignore`
- ~~**Remove Completed Migration Script**~~ — Removed `tools/migrate-blocks.js`
- ~~**Remove Dead Code Functions**~~ — Removed `_autolinkModals()` and `_handleSelection()`
- ~~**Create Missing Model Files for Header and Footer**~~ — Added `_header.json` and `_footer.json`
- ~~**Add Missing icon-close.svg**~~ — Added `icons/close.svg`
- ~~**Add Missing Block READMEs**~~ — Added READMEs for accordion, cards, form, hero, modal, search, tabs
- ~~**Clean Up .git/.COMMIT_EDITMSG.swp**~~ — Removed
- ~~**buildAutoBlocks() stub**~~ — Implemented: auto-wraps bare YouTube/Vimeo links as `embed` blocks

---

## CSS Architecture

### 38. CSS Nesting — Migrate All Block CSS to Nested Syntax

**Decision**: CSS nesting is the preferred syntax for block stylesheets going forward. Blocks will be converted to nested CSS as they are worked on (opportunistic migration during dev work, not a dedicated refactor sprint).

**Context**: Native CSS nesting (the `&` selector) is Baseline 2024 and supported in Chrome 120+, Firefox 117+, Safari 17.2+. The project's `browserslist: "baseline widely available"` target will converge on these browsers as the Baseline 2024 window matures. The `accordion` block (upgraded March 2026) is the first block using nested CSS.

**Action Required**:
- Verify that the current PostCSS/build tooling passes nested CSS through correctly for the `browserslist` target without flattening or erroring
- If tooling needs updating, document the change in this file
- Each block upgrade on the `block-shopping` branch will use nested CSS — no back-conversion to flat

---

## Design Token Management

### 1. Zombie Token Prevention
**Question**: What process prevents accumulation of unused tokens over time?

**Context**: As brands evolve and components change, some tokens may become orphaned. Without cleanup, the token surface area grows indefinitely.

**Options to Consider**:
- Automated static analysis to detect unused tokens
- Manual periodic audits during quarterly reviews
- Build warnings for unreferenced tokens
- Token deprecation lifecycle (warn → remove)

---

### 2. Token Documentation Tool
**Question**: How do designers and developers discover available tokens?

**Context**: Token schemas can grow large. Teams need efficient ways to browse, search, and understand token purposes.

**Options to Consider**:
- Auto-generated documentation from CSS custom properties
- Storybook integration with token previews
- Figma plugin showing live token values
- Searchable token catalog in project docs

---

### 3. Brand-Specific Variants
**Question**: Can blocks have variants that only appear for certain brands?

**Context**: Some brands may require unique block configurations not relevant to others.

**Options to Consider**:
- Filter variants in Universal Editor based on brand context
- Allow variant metadata to specify brand whitelist/blacklist
- Keep all variants global, document brand recommendations
- Use conditional CSS to hide variants per brand

---

### 4. --nav-height Not in Design Token System
**Question**: Should `--nav-height: 64px` be moved from `styles.css` to `root-tokens.css`?

**Context**: `--nav-height` is defined directly in `styles.css` rather than in the design token system. This means brands cannot override it via `tokens.css`.

**Recommendation**: Move to `root-tokens.css` so brands can customize nav height.

---

### 5. Font Sizes Not in Design Token System
**Question**: Should responsive font size tokens be moved into the design token system?

**Context**: Body and heading font sizes (`--body-font-size-m`, `--heading-font-size-xxl`, etc.) are defined in `styles.css` with responsive `@media` overrides at `900px`. They live outside the token chain and cannot be overridden by brand `tokens.css`.

**Options to Consider**:
- Move to `root-tokens.css` (brands could override base sizes)
- Keep in `styles.css` (responsive breakpoints are structural, not brand-specific)
- Split: base sizes in `root-tokens.css`, responsive rules in `styles.css`

---

### 6. lazy-styles.css Is Empty
**Question**: Should `lazy-styles.css` be populated or removed?

**Context**: `styles/lazy-styles.css` is loaded in `loadLazy()` but contains only a placeholder comment. It adds an unnecessary network request.

**Recommendation**: Either populate with below-the-fold styles or remove the `loadCSS()` call from `scripts.js`.

---

## Build & Performance

### 8. Bundle Splitting
**Question**: How are shared dependencies handled across blocks?

**Options to Consider**:
- Current state: EDS handles bundling automatically
- Evaluate if manual chunk splitting needed
- Monitor actual bundle sizes before optimizing
- Document shared utility patterns

---

### 9. Source Maps
**Question**: Are source maps generated for production debugging? Where stored?

**Options to Consider**:
- Generate source maps, upload to separate secure location
- Only generate for staging environment
- Use error tracking service with source map integration
- Document current EDS source map behavior

---

### 10. Build Artifact Storage
**Question**: Where are merged models and optimized assets stored between stages?

**Options to Consider**:
- EDS handles automatically via edge caching
- GitHub release artifacts for versioning
- Separate artifact storage service
- Document current EDS artifact lifecycle

---

## Universal Editor & Authoring

### 11. UE Preview Environment
**Question**: Does Universal Editor preview use production edge, staging, or local dev server?

**Current Assumption**: Preview uses branch-specific EDS preview URLs

**Validation Needed**: Document actual UE preview behavior

---

### 12. Variant Selection UI
**Question**: How do authors discover available variants when authoring blocks?

**Options to Consider**:
- Dropdown populated from component-models.json
- Documentation links in author interface
- Preview thumbnails of variant appearances
- Autocomplete suggestions

---

### 13. Metadata Validation Timing
**Question**: Are invalid metadata values caught at authoring time or runtime?

**Options to Consider**:
- JSON schema validation in Universal Editor
- Runtime validation with error logging
- Build-time validation in CI/CD
- Combination of authoring + runtime checks

---

### 14. UE Form Configuration
**Question**: Where are the Universal Editor forms for token authoring defined?

**Investigation Needed**: Document AEM Universal Editor form setup

---

## Testing & Quality

### 15. Zero Test Files Exist
**Question**: When will tests be written?

**Context**: Jest and Playwright are installed and configured in `package.json` but no test files exist anywhere outside `node_modules/`. The `pnpm test` command has nothing to run.

**Recommendation**: Prioritize writing tests for:
- `site-resolver.js` (brand detection logic)
- Block `decorate()` functions (core rendering)
- E2E smoke tests via Playwright (critical pages load)

---

### 16. Coverage Targets
**Question**: What unit test coverage percentage is required? Enforced in CI?

**Options to Consider**:
- 80% coverage target for all JavaScript
- 100% coverage for critical paths only
- No hard target, review-based quality gates
- Incremental improvement approach

---

### 17. E2E Test Scenarios
**Question**: What end-to-end tests are actually implemented?

**Context**: Playwright is available in package.json but no test files exist.

**Investigation Needed**:
- Document existing E2E tests
- Prioritize critical user journeys
- Define test data management strategy

---

### 18. Visual Regression Testing
**Question**: Is automated screenshot comparison implemented?

**Options to Consider**:
- Percy, Chromatic, or similar visual testing service
- Playwright screenshot assertions
- Manual visual QA only
- Implement for high-traffic pages first

---

### 19. Browser Support Matrix
**Question**: Which browsers and versions are officially supported?

**Current State**: `package.json` specifies `browserslist: "baseline widely available"` which targets browsers with broad support for modern features.

**Recommendation**: Document the specific browser/version matrix this resolves to and ensure all team members understand the support boundary.

---

### 20. Accessibility CI Automation
**Question**: Beyond linting, are axe-core tests automated in CI?

**Options to Consider**:
- Add axe-core to Playwright E2E tests
- Pa11y or similar CI runner
- Pre-commit hooks for accessibility checks
- Manual WCAG audit schedule

---

## Monitoring & Operations

### 21. RUM Data Storage
**Question**: Where is Real User Monitoring data sent and analyzed?

**Context**: sampleRUM() calls in aem.js suggest RUM is implemented.

**Investigation Needed**: Document Adobe RUM infrastructure

---

### 22. RUM Event Catalog
**Question**: What is the complete list of tracked events beyond errors?

**Investigation Needed**:
- Audit all sampleRUM() calls in codebase
- Document custom event tracking
- Define success metrics

---

### 23. Error Tracking Service
**Question**: Is Sentry, New Relic, or another APM service used?

**Options to Consider**:
- Adobe-native error tracking (if available)
- Third-party APM integration
- Basic logging + alerting
- Define error severity thresholds

---

### 24. Lighthouse CI
**Question**: Is Lighthouse CI implemented? Blocking or advisory? What thresholds?

**Options to Consider**:
- Add Lighthouse CI to GitHub Actions
- Define performance budgets (FCP < 1.8s, LCP < 2.5s)
- Block PRs failing performance thresholds
- Start with advisory, graduate to blocking

---

### 25. Alert Routing
**Question**: Who receives performance/error alerts? Via what channels?

**Recommendation**: Define alerting strategy:
- Critical: PagerDuty to on-call rotation
- Warning: Slack channel
- Info: Email digest
- Define escalation paths

---

### 26. Deployment Notifications
**Question**: How is the team notified of deployments?

**Options to Consider**:
- GitHub Actions → Slack webhook
- Email to distribution list
- Status dashboard
- Automated changelog generation

---

### 27. Deployment Windows
**Question**: Are there any blackout periods or deployment restrictions?

**Recommendation**: Define deployment policy:
- No deployments during peak booking hours
- Emergency hotfix exception process
- Advance notice requirements

---

## Security & Compliance

### 28. CSP Configuration
**Question**: Are the current Content Security Policy headers sufficient?

**Current State**: `head.html` includes a CSP `<meta>` tag with `move-to-http-header="true"`:
```
script-src 'nonce-aem' 'strict-dynamic' 'unsafe-inline' http: https:;
base-uri 'self'; object-src 'none';
```

**Investigation Needed**:
- Review for XSS protections
- Test third-party integrations (maps, booking widgets)
- Verify the `move-to-http-header` directive works as expected in EDS

---

### 29. AEM Authentication
**Question**: How is Universal Editor access controlled? SSO? Role-based?

**Investigation Needed**: Document AEM authentication and authorization model

---

### 30. PII Handling
**Question**: Are there special requirements for form data? Where is it stored?

**Context**: Forms may collect email, phone, booking details.

**Recommendation**:
- Define PII data classification
- Document storage locations
- Retention policies
- Right to deletion workflows

---

### 31. GDPR Compliance
**Question**: How are cookie consent, data retention policies, and user rights implemented?

**Components Needed**:
- Cookie consent banner block
- Privacy policy link in footer
- Data deletion request workflow
- Document compliance checklist

---

### 32. Security Audit Logging
**Question**: What actions are logged? Retention period?

**Recommendation**: Define audit strategy:
- Content publishes
- Token changes
- Permission modifications
- 90-day retention minimum

---

## Third-Party Integrations

### 33. Vendor SLAs
**Question**: What are Adobe availability guarantees?

**Action Required**:
- Review vendor contracts
- Document uptime commitments
- Define backup procedures

---

### 34. Figma Integration
**Question**: Direct API connection or manual export/import for Root tokens?
**Resolution** - manual import - close this out
**Options to Consider**:
- Figma API webhooks → automated sync
- Manual export via Figma Tokens plugin
- Scheduled batch sync
- Document current workflow

---

### 35. Booking Widget APIs
**Question**: Authentication, failover, rate limiting for booking integrations?

**Investigation Needed**:
- Document API provider
- Test failure scenarios
- Define fallback UI
- Cache booking availability data

---

### 36. Weather Service Integration
**Question**: Provider, API keys, caching strategy for weather data?

**Options to Consider**:
- OpenWeather, Weather.com, or similar
- Client-side or server-side fetching
- Cache duration (15-30 minutes reasonable)
- Graceful degradation if unavailable

---

### 37. Map Integration
**Question**: Google Maps or Mapbox? Configuration approach?

**Options to Consider**:
- Google Maps (more familiar to users)
- Mapbox (more customization)
- API key management per brand
- Static maps for performance

---

## Next Steps

This document should be reviewed periodically and items promoted to active specification as needed:

- **Quarterly Review**: Evaluate which items have become urgent
- **Implementation Phase**: Address items as features are built
- **Team Retrospectives**: Surface new lower-priority items
- **Before Launch**: Promote security/compliance items to required

Related documents:
- [BLOCK-RENDERING-BUILD-CONFIG.md](BLOCK-RENDERING-BUILD-CONFIG.md) - Main architecture specification
- [FED-SOLUTION-DESIGN.md](FED-SOLUTION-DESIGN.md) - Design token system architecture
- [BRAND-SETUP-GUIDE.md](BRAND-SETUP-GUIDE.md) - Adding new brands
