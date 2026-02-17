# Architecture TODO - Lower Priority Items

This document tracks lower-priority technical decisions and implementation details that have been deferred from the immediate architecture specification. These items should be revisited during implementation phases or as needs arise.


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

## Build & Performance

### 4. Bundle Splitting
**Question**: How are shared dependencies handled across blocks?

**Context**: Multiple blocks may import common utilities. Intelligent bundling reduces payload.

**Options to Consider**:
- Current state: EDS handles bundling automatically
- Evaluate if manual chunk splitting needed
- Monitor actual bundle sizes before optimizing
- Document shared utility patterns

---

### 5. Source Maps
**Question**: Are source maps generated for production debugging? Where stored?

**Context**: Production debugging is easier with source maps, but they expose implementation details.

**Options to Consider**:
- Generate source maps, upload to separate secure location
- Only generate for staging environment
- Use error tracking service with source map integration
- Document current EDS source map behavior

---

### 6. Build Artifact Storage
**Question**: Where are merged models and optimized assets stored between stages?

**Context**: Build pipeline may generate intermediate artifacts (merged JSON, optimized CSS).

**Options to Consider**:
- EDS handles automatically via edge caching
- GitHub release artifacts for versioning
- Separate artifact storage service
- Document current EDS artifact lifecycle

---

## Universal Editor & Authoring

### 7. UE Preview Environment
**Question**: Does Universal Editor preview use production edge, staging, or local dev server?

**Context**: Authors need realistic previews without publishing to production.

**Current Assumption**: Preview uses branch-specific EDS preview URLs

**Validation Needed**: Document actual UE preview behavior

---

### 8. Variant Selection UI
**Question**: How do authors discover available variants when authoring blocks?

**Context**: Universal Editor should guide authors to valid variant choices.

**Options to Consider**:
- Dropdown populated from component-models.json
- Documentation links in author interface
- Preview thumbnails of variant appearances
- Autocomplete suggestions

---

### 9. Metadata Validation Timing
**Question**: Are invalid metadata values caught at authoring time or runtime?

**Context**: Early validation prevents publishing broken configurations.

**Options to Consider**:
- JSON schema validation in Universal Editor
- Runtime validation with error logging
- Build-time validation in CI/CD
- Combination of authoring + runtime checks

---

### 10. UE Form Configuration
**Question**: Where are the Universal Editor forms for token authoring defined?

**Context**: Root and Brand token forms are mentioned but configuration location unclear.

**Investigation Needed**: Document AEM Universal Editor form setup

---

## Testing & Quality

### 11. Coverage Targets
**Question**: What unit test coverage percentage is required? Enforced in CI?

**Options to Consider**:
- 80% coverage target for all JavaScript
- 100% coverage for critical paths only
- No hard target, review-based quality gates
- Incremental improvement approach

---

### 12. E2E Test Scenarios
**Question**: What end-to-end tests are actually implemented?

**Context**: Playwright is available in package.json but test suite status unclear.

**Investigation Needed**: 
- Document existing E2E tests
- Prioritize critical user journeys
- Define test data management strategy

---

### 13. Visual Regression Testing
**Question**: Is automated screenshot comparison implemented?

**Options to Consider**:
- Percy, Chromatic, or similar visual testing service
- Playwright screenshot assertions
- Manual visual QA only
- Implement for high-traffic pages first

---

### 14. Browser Support Matrix
**Question**: Which browsers and versions are officially supported?

**Recommendation**: Define and document matrix:
- Last 2 versions of Chrome, Firefox, Safari, Edge
- iOS Safari (last 2 major versions)
- Accessibility testing browsers

---

### 15. Accessibility CI Automation
**Question**: Beyond linting, are axe-core tests automated in CI?

**Options to Consider**:
- Add axe-core to Playwright E2E tests
- Pa11y or similar CI runner
- Pre-commit hooks for accessibility checks
- Manual WCAG audit schedule

---

## Monitoring & Operations

### 16. RUM Data Storage
**Question**: Where is Real User Monitoring data sent and analyzed?

**Context**: sampleRUM() calls in aem.js suggest RUM is implemented.

**Investigation Needed**: Document Adobe RUM infrastructure

---

### 17. RUM Event Catalog
**Question**: What is the complete list of tracked events beyond errors?

**Investigation Needed**: 
- Audit all sampleRUM() calls in codebase
- Document custom event tracking
- Define success metrics

---

### 18. Error Tracking Service
**Question**: Is Sentry, New Relic, or another APM service used?

**Options to Consider**:
- Adobe-native error tracking (if available)
- Third-party APM integration
- Basic logging + alerting
- Define error severity thresholds

---

### 19. Lighthouse CI
**Question**: Is Lighthouse CI implemented? Blocking or advisory? What thresholds?

**Options to Consider**:
- Add Lighthouse CI to GitHub Actions
- Define performance budgets (FCP < 1.8s, LCP < 2.5s)
- Block PRs failing performance thresholds
- Start with advisory, graduate to blocking

---

### 20. Alert Routing
**Question**: Who receives performance/error alerts? Via what channels?

**Recommendation**: Define alerting strategy:
- Critical: PagerDuty to on-call rotation
- Warning: Slack channel
- Info: Email digest
- Define escalation paths

---

### 21. Deployment Notifications
**Question**: How is the team notified of deployments?

**Options to Consider**:
- GitHub Actions → Slack webhook
- Email to distribution list
- Status dashboard
- Automated changelog generation

---

### 22. Deployment Windows
**Question**: Are there any blackout periods or deployment restrictions?

**Recommendation**: Define deployment policy:
- No deployments during peak booking hours
- Emergency hotfix exception process
- Advance notice requirements

---

## Security & Compliance

### 23. CSP Configuration
**Question**: What Content Security Policy headers are enforced? Where configured?

**Investigation Needed**:
- Document current CSP policy
- Review for XSS protections
- Test third-party integrations (maps, booking widgets)

---

### 24. AEM Authentication
**Question**: How is Universal Editor access controlled? SSO? Role-based?

**Investigation Needed**: Document AEM authentication and authorization model

---

### 25. SharePoint Permissions
**Question**: How are per-site content permissions managed?

**Investigation Needed**: Document SharePoint permission model per brand

---

### 26. Bynder Asset Permissions
**Question**: How are asset permissions scoped per site/brand?

**Investigation Needed**: Document Bynder access control integration

---

### 27. PII Handling
**Question**: Are there special requirements for form data? Where is it stored?

**Context**: Forms may collect email, phone, booking details.

**Recommendation**:
- Define PII data classification
- Document storage locations
- Retention policies
- Right to deletion workflows

---

### 28. GDPR Compliance
**Question**: How are cookie consent, data retention policies, and user rights implemented?

**Components Needed**:
- Cookie consent banner block
- Privacy policy link in footer
- Data deletion request workflow
- Document compliance checklist

---

### 29. Security Audit Logging
**Question**: What actions are logged? Retention period?

**Recommendation**: Define audit strategy:
- Content publishes
- Token changes
- Permission modifications
- 90-day retention minimum

---

## Third-Party Integrations

### 30. Vendor SLAs
**Question**: What are Adobe/SharePoint/Bynder availability guarantees?

**Action Required**: 
- Review vendor contracts
- Document uptime commitments
- Define backup procedures

---

### 31. Figma Integration
**Question**: Direct API connection or manual export/import for Root tokens?

**Options to Consider**:
- Figma API webhooks → automated sync
- Manual export via Figma Tokens plugin
- Scheduled batch sync
- Document current workflow

---

### 32. Booking Widget APIs
**Question**: Authentication, failover, rate limiting for booking integrations?

**Investigation Needed**:
- Document API provider
- Test failure scenarios
- Define fallback UI
- Cache booking availability data

---

### 33. Weather Service Integration
**Question**: Provider, API keys, caching strategy for weather data?

**Options to Consider**:
- OpenWeather, Weather.com, or similar
- Client-side or server-side fetching
- Cache duration (15-30 minutes reasonable)
- Graceful degradation if unavailable

---

### 34. Map Integration
**Question**: Google Maps or Mapbox? Configuration approach?

**Options to Consider**:
- Google Maps (more familiar to users)
- Mapbox (more customization)
- API key management per brand
- Static maps for performance

---

## CSS & Styling

### 35. Import Order Enforcement
**Question**: Is CSS import order sufficient or is runtime injection needed?

**Current Assumption**: Import order in HTML <head> is sufficient:
1. Root tokens
2. Brand tokens  
3. Block styles

**Validation Needed**: Test across all scenarios

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
