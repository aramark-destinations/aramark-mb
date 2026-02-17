# Block Rendering & Build Configuration

## Related Documentation

This document covers block rendering, build pipeline, and deployment. For related topics, see:

- **[FED-SOLUTION-DESIGN.md](FED-SOLUTION-DESIGN.md)** - Design token system architecture, App Builder integration, brand governance
- **[BLOCK-EXTENSIBILITY-GUIDE.md](BLOCK-EXTENSIBILITY-GUIDE.md)** - Practical patterns for creating and extending blocks
- **[NEW-SITE-GUIDE.md](NEW-SITE-GUIDE.md)** - Complete process for launching new property sites
- **[PROJECT-README.md](PROJECT-README.md)** - Project overview, quick start, and available blocks

---

## Overview

Block rendering is driven by the **Universal Editor (UE) authoring model** using a **2-tier block resolution system**. This architecture maintains a canonical block library while enabling brand-specific customizations without forking code.

**Nomenclature**: This project uses `/brands/{brand}/` directory structure where each "site" represents a distinct brand. Throughout this document, "brand" and "site" are used interchangeably, referring to the same entity.

All block code and styles are version-controlled in Git and deployed through Adobe's Edge Delivery Services (EDS) infrastructure.

## Architectural Principles

The system enforces strict separation of concerns:

1. **Structural Logic** - Shared block implementations in `/blocks/` provide canonical functionality
2. **Brand Customization** - Optional overrides in `/brands/{brand}/blocks/` extend or replace brand-specific blocks
3. **Design Tokens** - CSS custom properties define themeable values across Root and Brand layers
4. **Multi-Brand Support** - Architecture supports multiple brands within single repository

This architecture guarantees:
- Zero block forking
- Deterministic override behavior  
- Rapid new-site deployment
- Centralized maintenance of shared components

---

## Content Authoring Model

### Universal Editor Integration

Authors compose pages using blocks from a curated library. The Universal Editor provides:

- Visual block selection and placement
- In-context content editing
- Real-time preview
- Variant configuration via metadata

**Key constraints:**
- No hard-coded page templates
- No layout assumptions in block code
- Content determines rendering order
- All blocks must support UE authoring patterns

### Block Characteristics

Every block must be:

- **Canonical** - Single implementation serves all sites
- **Variant-capable** - Supports configuration through author metadata
- **Accessible** - WCAG 2.1 AA compliant markup
- **Performant** - Lazy-loaded, optimized for Core Web Vitals

---

## Repository Structure

The repository enforces this directory layout:

```
/blocks/                           # Canonical block library
  {blockname}/
    {blockname}.js                 # Block implementation
    {blockname}.css                # Block styles
    README.md                      # Usage documentation

/brands/                            # Brand-specific overrides (each site = brand)
  {brand}/
    blocks/                        # Optional block overrides
      {blockname}/
        {blockname}.js
        {blockname}.css
    tokens.css                     # Brand design tokens
    README.md

/styles/
  styles.css                       # Root design tokens (CSS custom properties)
  fonts.css                        # Web font definitions
  lazy-styles.css                  # Below-the-fold styles

/models/                           # Universal Editor JSON schemas
  _component-models.json           # Block configurations
  _component-definition.json       # Block definitions
  _component-filters.json          # Block visibility rules

/scripts/
  site-resolver.js                 # 2-tier resolution logic
  aem.js                           # EDS core framework
  scripts.js                       # Global utilities
```

### File Naming Conventions

- Block directories match block names exactly (lowercase, hyphenated)
- JavaScript files: `{blockname}.js`
- CSS files: `{blockname}.css`
- No preprocessing extensions (`.scss`, `.tsx`) in repository

---

## Block Resolution System

The 2-tier resolution system is implemented in `/scripts/site-resolver.js` and enforces this lookup order:

**Priority order (first match wins):**
1. `/brands/{brand}/blocks/{blockname}/{blockname}.js` - Brand-specific override
2. `/blocks/{blockname}/{blockname}.js` - Canonical implementation

**Resolution algorithm:**

```javascript
// Core functions provided by site-resolver.js
getCurrentBrand()          // Extracts brand identifier from URL path
getBlockPaths(blockName)   // Returns ordered array of paths to attempt
resolveBlockPath(blockName) // Performs existence check, returns first valid path
```

**Behavior guarantees:**

- URL pattern `/brands/{brand}/` triggers brand-specific resolution
- CSS and JavaScript files follow identical resolution logic
- Missing brand overrides automatically fall through to canonical blocks
- Brand overrides completely replace canonical implementation (no automatic inheritance)
- Resolution occurs at page load; no runtime path discovery

### Extension Pattern

Brand-specific blocks extend canonical blocks using lifecycle hooks:

```javascript
// /brands/lake-powell/blocks/hero/hero.js
import decorateRoot from '../../../blocks/hero/hero.js';

export default function decorate(block) {
  decorateRoot(block, {
    onBefore: ({ block }) => {
      // Pre-processing logic
    },
    onAfter: ({ block }) => {
      // Post-processing enhancements
    }
  });
}
```

This pattern:
- Imports canonical block logic
- Wraps execution with brand-specific hooks
- Maintains a clear extension boundary
- Preserves upgradability of canonical blocks

---

## Design Token Architecture

> **📘 Detailed Specification:** See [FED-SOLUTION-DESIGN.md](FED-SOLUTION-DESIGN.md) for complete token authoring workflow, App Builder integration, and governance model.

### Token Layer System

Design tokens are organized in a 2-layer override system:

**Layer 1: Root Tokens** (`/styles/styles.css`)
- Global defaults applicable to all brands
- Semantic naming conventions (e.g., `--text-color`, `--spacing-lg`)
- Foundation values that establish system-wide consistency
- Maintained by design system team in Figma, authored via Universal Editor

**Layer 2: Brand Tokens** (`/brands/{brand}/tokens.css`)
- Brand-specific color palettes, typography, spacing scales
- Override root token values using identical CSS custom property names
- Each brand (in `/brands/{brand}/` directory) has its own tokens file
- Authored by brand stakeholders via Universal Editor forms
- Transforms and publishes via App Builder integration

**Key Principle**: Tokens cascade naturally via CSS import order. No runtime injection required.

### Token Naming Convention

All tokens follow this structure:

```css
--{category}-{property}-{variant}

Examples:
--color-primary-base
--color-primary-light
--color-primary-dark
--spacing-section-vertical
--font-family-heading
--border-radius-button
```

**Requirements:**
- Semantic names only (no visual references like "blue" or "14px")
- kebab-case formatting
- Category prefixes for organization
- Variant suffixes for related values

### Token Loading Order

CSS custom properties must load in this sequence:

```html
<link rel="stylesheet" href="/styles/styles.css">          <!-- Root tokens -->
<link rel="stylesheet" href="/brands/lake-powell/tokens.css"> <!-- Brand layer -->
<link rel="stylesheet" href="/blocks/{block}/{block}.css"> <!-- Block styles -->
```

This ensures:
- Later layers override earlier layers via CSS cascade
- Blocks reference tokens, never hardcode values
- Brand switching requires only swapping token file
- No `!important` declarations needed

### Runtime Brand Determination

**Brand-to-token mapping** is configured in `fstab.yaml` via extended mountpoint syntax:

```yaml
mountpoints:
  # Default root content
  /:
    url: "https://author-p130360-e1272151.adobeaemcloud.com/..."
    type: "markup"
    suffix: ".html"
  
  # Lake Powell brand
  /brands/lake-powell:
    url: "https://author-p130360-e1272151.adobeaemcloud.com/.../lake-powell"
    type: "markup"
    suffix: ".html"
    brand: "lake-powell"  # Maps to /brands/lake-powell/tokens.css
```

**Runtime behavior:**
1. EDS matches incoming URL path to mountpoint
2. Reads `brand` property from matched mountpoint config
3. Injects `<link>` tag for `/brands/{brand}/tokens.css` into `<head>`
4. CSS cascade applies brand overrides to root tokens

**Benefits:**
- Brand determined by content path, not URL inspection
- Centralized brand mapping configuration
- Single source of truth for content → brand relationship
- Supports multiple brands mapping to same content if needed

### Block Token Usage

Blocks must reference tokens exclusively:

```css
/* ✅ CORRECT - Uses tokens */
.hero {
  color: var(--color-text-primary);
  font-family: var(--font-family-heading);
  padding: var(--spacing-section-vertical) var(--spacing-section-horizontal);
}

/* ❌ INCORRECT - Hardcoded values */
.hero {
  color: #131313;
  font-family: 'Roboto', sans-serif;
  padding: 40px 24px;
}
```

---

## Asset Structure & Loading

### CSS Architecture

**File organization:**
- Each block maintains isolated `.css` file
- Plain CSS only (no preprocessors in source control)
- EDS framework automatically loads block CSS when block renders
- No global stylesheet beyond `/styles/styles.css` and token files

**CSS scoping:**
- Block classes follow BEM-style conventions for natural scoping
- No CSS modules or scoped attributes required
- Site overrides can extend or completely replace block CSS
- EDS applies block CSS only when block appears on page (automatic code splitting)

**Performance characteristics:**
- Critical CSS inlined by EDS edge
- Block CSS lazy-loaded as blocks enter viewport
- CSS custom properties enable performant theming without runtime computation
- Edge network automatically minifies and optimizes CSS

### JavaScript Architecture

**Block JavaScript:**
- Each block declares single default export `decorate(block)` function
- EDS calls `decorate()` after block markup is in DOM
- JavaScript must be idempotent (safe for repeated calls)
- Site overrides import and wrap canonical block JS

**Loading behavior:**
- EDS lazy-loads block JavaScript
- Execution deferred until block approaches viewport
- Lifecycle hooks (`onBefore`, `onAfter`) enable extension without modification
- Event-driven communication between blocks (no direct coupling)

**Required patterns:**

```javascript
// Canonical block structure
export default function decorate(block) {
  // Defensive programming - check for expected structure
  const content = block.querySelector('.hero-content');
  if (!content) return;
  
  // Apply enhancements
  // Dispatch custom events for extensibility
  block.dispatchEvent(new CustomEvent('hero:decorated', { detail: { block } }));
}
```

---

## Build Pipeline & Quality Enforcement

### Pre-Merge Validation

Every pull request triggers automated validation:

**Code Quality Gates:**
- ESLint enforcement (JavaScript, JSON)
- Stylelint enforcement (CSS)
- Universal Editor model validation (JSON schema)
- Token reference validation (verify all `var()` references resolve)
- Accessibility linting (axe-core rules)

**Build Process:**
```bash
# Executed on every PR
pnpm lint:js          # JavaScript/JSON linting
pnpm lint:css         # CSS linting
pnpm build:json       # Merge UE model fragments
pnpm test            # Unit tests for block logic
```

**Merge Requirements:**
- All linters pass
- No unresolved code review comments
- Branch up-to-date with target branch
- PR description includes EDS preview URL for testing

### Deployment Pipeline

**Trigger:** Merge to `main` branch

**Automated Steps:**
1. Build artifacts (merged JSON models, optimized assets)
2. Deploy to Adobe Edge Network
3. Purge CDN cache for affected paths
4. Verify deployment health checks
5. Notify team channels

**Edge Optimization:**
- CSS minification and tree-shaking
- JavaScript minification and bundling
- Image optimization (format conversion, responsive sizing)
- Font subsetting and optimization
- HTML minimization

**Rollback Capability:**
- Git-based versioning enables instant rollback
- Deployment history tracked in CI/CD system
- Emergency rollback achievable via git revert + force push

### Development Workflow

**Local Development:**
```bash
pnpm install          # Install dependencies
pnpm start            # Launch EDS CLI dev server
# Server runs on http://localhost:3000
```

**Dev Server Features:**
- Hot reload for CSS/JS changes
- Universal Editor integration for authoring preview
- Multi-site support (auto-detects site from URL path)
- Network request mocking for API integration testing

**Branch Preview:**
- Every branch automatically deployed to `https://main--{repo}--{org}.aem.page`
- Branch name embedded in preview URL
- Authors can test changes before merge

---

## Block Variants & Configuration

### Variant Implementation

Blocks support multiple visual and behavioral variants through:

**Metadata-driven variants:**
```html
<!-- Author-specified in Universal Editor -->
<div class="hero hero-centered hero-dark">
  <!-- Block content -->
</div>
```

**CSS-based variant styling:**
```css
/* Default hero styling */
.hero { /* ... */ }

/* Variant: centered layout */
.hero.hero-centered {
  text-align: center;
  align-items: center;
}

/* Variant: dark theme */
.hero.hero-dark {
  background: var(--color-background-dark);
  color: var(--color-text-inverse);
}
```

**JavaScript variant handling:**
```javascript
export default function decorate(block) {
  const isCentered = block.classList.contains('hero-centered');
  const isDark = block.classList.contains('hero-dark');
  
  // Conditional behavior based on variants
  if (isCentered) {
    // Apply centered-specific logic
  }
}
```

### Variant Constraints

**Requirements:**
- Variants must work in any combination
- Token-driven styling only (no hardcoded brand-specific values)
- Variants declared in block README.md
- Universal Editor model documents available variants

**Prohibited patterns:**
- Site-specific variant logic in canonical blocks
- Variants that assume specific content structure
- Variants requiring external dependencies
- Breaking changes to existing variant APIs

### Configuration via Metadata

Blocks receive author-defined metadata:

```javascript
export default function decorate(block) {
  // Metadata available via data attributes
  const config = {
    autoplay: block.dataset.autoplay === 'true',
    transition: block.dataset.transition || 'fade',
    interval: parseInt(block.dataset.interval, 10) || 5000
  };
  
  // Use configuration to control behavior
}
```

Authors configure via Universal Editor property panels (defined in `/models/` JSON schemas).

---

## Brand Extension Model

### Permitted Extensions

Brands may customize through:

**1. Block Overrides** (`/brands/{brand}/blocks/{blockname}/`)
- Complete block replacement
- Lifecycle hook-based extension (import canonical + wrap)
- CSS-only styling extensions
- Variant enablement/restriction

**2. Brand Tokens** (`/brands/{brand}/tokens.css`)
- Token value overrides
- Brand-specific color palettes, typography, spacing

**3. Brand-Specific Scripts** (`/brands/{brand}/scripts/`)
- Analytics integration
- Third-party service connections
- Brand-specific utilities

**4. Configuration** (`/brands/{brand}/config.json`)
- Brand metadata
- Feature flags
- API endpoints
- Integration credentials

### Prohibited Patterns

Brands must never:

❌ Fork canonical blocks and diverge implementation  
❌ Override token values with hardcoded values in block CSS  
❌ Modify canonical block files directly  
❌ Introduce breaking changes to block APIs  
❌ Create dependencies between brand-specific code and canonical blocks  
❌ Use `!important` to override token values  
❌ Bypass 2-tier resolution system  

### Extension Responsibilities

**When creating brand overrides:**

1. **Document rationale** - Explain why override needed in brand README
2. **Maintain upgrade path** - Use lifecycle hooks to preserve canonical upgrades
3. **Test across scenarios** - Verify override doesn't break variant combinations
4. **Follow conventions** - Match canonical block patterns and naming
5. **Minimize scope** - Override only what's necessary

**Code review checklist:**
- [ ] Override necessary (can't achieve with tokens alone)?
- [ ] Lifecycle hooks used (not complete replacement)?
- [ ] Documentation updated?
- [ ] All variants tested?
- [ ] No hardcoded brand values?
- [ ] Accessible markup maintained?

---

## Production Architecture

### Content Delivery Flow

**Request path:**
```
Browser → Adobe Edge CDN → Origin (if cache miss) → Response
```

**Caching strategy:**
- Static assets: 1 year TTL
- HTML content: 5 minutes TTL (author-controlled)
- Dynamic content: No caching (pass-through)

**Geographic distribution:**
- 200+ edge locations worldwide
- Automatic failover and load balancing
- <50ms latency for 95% of global traffic

### Asset Optimization

**Automatic optimizations (performed at edge):**
- Image format conversion (AVIF, WebP with fallbacks)
- Responsive image generation (srcset with multiple sizes)
- CSS/JS minification and compression (Brotli/gzip)
- Font subsetting based on page content
- HTML minimization
- Critical CSS inlining

**Developer responsibilities:**
- Provide source images in highest quality
- Use semantic HTML
- Reference design tokens consistently
- Follow lazy-loading patterns for below-fold content

### Performance Targets

All pages must achieve:

- **Largest Contentful Paint (LCP):** <2.5s
- **First Input Delay (FID):** <100ms  
- **Cumulative Layout Shift (CLS):** <0.1
- **Time to Interactive (TTI):** <3.5s
- **Lighthouse Score:** >90 (all categories)

These targets are enforced through:
- Automated Lighthouse CI in deployment pipeline
- Real user monitoring (RUM) data collection
- Performance budgets in CI checks

---

## Governance & Maintenance

### Change Management

**Canonical block changes:**
- Require approval from platform team
- Must maintain backward compatibility
- Automated tests must pass
- Breaking changes require major version bump + brand coordination

**Brand override changes:**
- Brand team approval sufficient
- Must not break canonical block contracts
- Brand-specific tests required

### Versioning Strategy

**Repository versioning:**
- Semantic versioning (MAJOR.MINOR.PATCH)
- Git tags for releases
- CHANGELOG.md documents all changes

**Block versioning:**
- Breaking changes → New block variant or new block  
- Non-breaking enhancements → Update existing block
- Deprecated blocks → Marked in README, removal announced 2 releases ahead

### Documentation Requirements

Every block must include:

**README.md containing:**
- Block purpose and use cases
- Available variants
- Configuration options (metadata)
- Token dependencies
- Accessibility considerations
- Example markup
- Known limitations

**Universal Editor model:**
- JSON schema in `/models/`
- Property panel configuration
- Variant definitions
- Preview templates

### Monitoring & Alerting

**Automated monitoring:**
- Deployment success/failure notifications
- Performance regression detection
- JavaScript error tracking
- Accessibility audit results
- Broken link detection

**Response protocols:**
- Critical errors: Immediate rollback + incident response
- Performance degradation: Investigation within 24 hours
- Accessibility violations: Fix within sprint
- Minor bugs: Prioritize in backlog

---

## Architecture Guarantees

This system enforces:

✅ **Zero Block Forking** - 2-tier resolution prevents code duplication  
✅ **Deterministic Overrides** - Priority order guarantees predictable behavior  
✅ **Token-Driven Theming** - Multi-brand support without block modifications  
✅ **Backward Compatibility** - Lifecycle hooks preserve upgrade paths  
✅ **Universal Editor Integration** - All blocks support visual authoring  
✅ **Performance by Default** - Edge optimization and lazy loading built-in  
✅ **Accessibility Compliance** - WCAG 2.1 AA enforced via linting and audits  
✅ **Rapid Site Deployment** - New sites inherit complete block library instantly  

### Design Decisions

**Why 2-tier (not 3-tier with `/libs/`)?**
- Sufficient for 2-brand deployment model
- Reduces cognitive overhead for developers
- Simpler mental model for troubleshooting
- Fewer path resolution edge cases

**Why CSS custom properties (not CSS-in-JS)?**
- Standard CSS cascade behavior
- No runtime performance cost
- Better browser DevTools support
- Universal Editor compatibility

**Why lifecycle hooks (not HOC pattern)?**
- Clearer extension intent
- Preserves canonical block upgradability
- Easier debugging (linear execution flow)
- Framework-agnostic pattern

**Why Git-based deployment (not package registry)?**
- Aligns with EDS architecture
- Simpler rollback mechanism
- No package versioning complexity
- Direct connection between repo and edge

---

## Summary: Resolved vs. Outstanding Items

### ✅ Information Resolved from Project Documentation & User Feedback

The following previously unknown items have been clarified:

**Nomenclature:**
- **Brands = Sites**: The `/brands/{brand}/` directory structure represents brands. "Site" and "brand" are used interchangeably throughout this project.

**Design Token System:**
- Token file location: `/brands/{brand}/tokens.css` (not `/styles/brand/` directory)
- Two-layer system: Root (`/styles/styles.css`) → Brand (`/brands/{brand}/tokens.css`)
- Runtime brand scoping: `fstab.yaml` extended to map mountpoints to brand token files
- Token authoring via Universal Editor forms in AEM Author
- Root tokens: Designed in Figma, input via UE form, managed by system admins
- Brand tokens: Authored by brand stakeholders with restricted access
- App Builder validates (hex format), transforms, publishes via PR to staging
- Token layering via CSS cascade and import order (Root → Brand)
- Figma sync: Manual/scheduled input via UE form (same as brand tokens, larger dataset)

**Environment & Deployment:**
- **Staging**: PR branch previews (devs open PRs against staging)
- **Production**: `main` branch
- Merging to staging updates preview URLs
- CSS processing: PostCSS/Autoprefixer in repo/local build (not at edge)
- GitHub Actions: Linting on PR (ESLint, Stylelint)
- EDS handles deployment automatically on merge to main
- Asset optimization at edge (images, CSS, JS, fonts)
- Git-based rollback via revert + force push

**Governance:**
- Model-code sync: Governance-based (manual checklist, documentation, code review)

**Integration Architecture:**
- SharePoint as content repository (mountpoints in fstab.yaml)
- Bynder as DAM (configured per brand in config.json)
- Analytics: Google Analytics + Adobe Analytics (IDs in config.json)
- Brand features controlled via config.json (booking widgets, weather, maps)

**Testing:**
- Jest configured for unit tests
- Playwright available for E2E
- RUM tracking in aem.js (errors, performance)
- Accessibility target: WCAG 2.1 AA

### ⚠️ Outstanding Items Requiring Specification

**11 high/medium priority items remain**, plus 35 lower-priority items moved to [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md):

#### 🔴 High Priority (Blocks Development/Deployment)

1. **✅ Runtime brand scoping** - RESOLVED: `fstab.yaml` will be extended to map brands to their token files. Each mountpoint entry will specify which `/brands/{brand}/tokens.css` should be loaded for that content path. This enables runtime determination of brand CSS without URL inspection or config lookups.

2. **✅ Brand token file path** - RESOLVED: `/brands/{brand}/tokens.css` (not `/styles/brand/` directory)

3. **✅ Model-code sync** - RESOLVED: Governance process. JSON models in `/models/` must be manually kept in sync with block code changes through code review checklist and documentation requirements.

4. **✅ Environment strategy** - RESOLVED: 
   - **Staging** = PR branch previews (devs open PRs against staging branch)
   - **Production** = `main` branch
   - Merging to staging updates preview URLs for testing

5. **✅ CSS processing** - RESOLVED: PostCSS/Autoprefixer handled in repo/local build, not at edge

6. **⚠️ App Builder Integration** - REQUIRES SPECIFICATION: See consolidated section below

#### 🟡 Medium Priority (Governance/Process)

7. **✅ Figma-AEM sync** - RESOLVED: Figma Root tokens input via Universal Editor form (same workflow as Brand tokens, but with larger dataset). Manual or scheduled sync process.

8. **Cross-brand testing** - ⚠️ Requires further exploration: Process to verify canonical block changes work across all brands

9. **Hotfix process** - ⚠️ Requires further exploration: Emergency deployment bypass procedure and approval workflow

10. **Deployment SLA** - ⚠️ Requires further exploration: Time from merge to live, rollback timing expectations

11. **App Builder deployment** - ⚠️ Requires further exploration: Hosting location, scaling approach, monitoring infrastructure

#### 🟢 Lower Priority (Optimization/Documentation)

Items 12-49 have been moved to [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md) for future consideration.

---

### ⚠️ App Builder Integration - Full Specification Required

The following App Builder capabilities are referenced throughout this architecture but lack detailed specification:

**Authentication & Authorization:**
- Service account credentials and permission model
- AEM Author → App Builder auth flow
- Token-scoped access control (Root vs Brand forms)
- API key management and rotation

**Validation & Transformation:**
- Complete validation rule set beyond hex color format
- Token schema enforcement
- Tonal variant generation algorithm specification
- Error message format and severity levels

**Error Handling & Author Feedback:**
- How validation failures are surfaced in Universal Editor
- Retry logic for transient failures
- Failed publish state management
- Author notification mechanisms

**PR Automation:**
- GitHub PR creation workflow
- Target branch strategy (staging vs main)
- PR description template and preview URLs
- Auto-review vs manual approval requirements
- Merge automation or manual merge

**Infrastructure & Operations:**
- Hosting location (Adobe I/O Runtime assumed)
- Scaling approach and capacity limits
- Monitoring and alerting
- Deployment process for App Builder updates
- SLA expectations

**Status**: These details must be specified before production deployment. See [FED-SOLUTION-DESIGN.md](FED-SOLUTION-DESIGN.md) for current partial specification.

---

### 📋 Next Steps for Production Readiness

**Immediate Actions:**
1. ✅ Brand token file structure confirmed: `/brands/{brand}/tokens.css`
2. ✅ Runtime brand scoping via fstab.yaml extension (mountpoints map to brand tokens)
3. ✅ Environment strategy defined: Staging (PR previews) → Main (production)
4. ✅ Model-code sync: Governance-based process (code review checklist)
5. ⚠️ Complete App Builder detailed specification (see section above)

**Before Launch:**
6. Establish cross-brand testing procedure
7. Define hotfix and emergency deployment process
8. Implement CSS processing pipeline (PostCSS/Autoprefixer in build)
9. Set up monitoring/alerting infrastructure
10. Document security and compliance controls

**See Also**: [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md) for lower-priority items deferred to future implementation phases.

---

## Documentation Gaps (Client Deliverable)

For a complete client-facing architecture document, these topics should be added:

### Business Context
- **Project objectives** - Why this architecture? What business problems does it solve?
- **Stakeholder mapping** - Who owns different aspects (content, code, design, operations)?
- **Success metrics** - How will effectiveness be measured?

### Content Strategy
- **Content modeling approach** - How authors structure content for blocks
- **Content governance** - Approval workflows, publishing schedules, compliance
- **Asset management** - DAM integration, image specifications, naming conventions
- **Localization strategy** - Multi-language support, translation workflows

### Developer Onboarding
- **Development environment setup** - Step-by-step local environment configuration
- **Git workflow** - Branching strategy, PR templates, commit conventions
- **Code review checklist** - What reviewers should verify
- **Common troubleshooting** - FAQ for typical development issues

### Operational Procedures
- **Incident response playbook** - Steps for different severity levels
- **Deployment runbook** - Pre-deployment checks, deployment steps, verification
- **Disaster recovery** - Backup strategy, recovery procedures, RTOs
- **Escalation paths** - Who to contact for different types of issues

### Integration Points

**✅ RESOLVED:**
- **AEM content flow** - Universal Editor authoring → SharePoint storage → EDS delivery
- **Bynder integration** - Asset delivery via portalId and assetPrefix (per brand config.json)
- **Analytics integration** - Google Analytics and Adobe Analytics IDs in brand config.json
- **SharePoint mountpoints** - Configured in fstab.yaml per brand (with brand token mapping)
- **App Builder role** - Token validation/transformation service in publishing flow
- **Third-party APIs** - Booking widgets, weather data, map integration (per brand features in config.json)

**⚠️ REMAINING:**
42. **App Builder authentication** - Auth flow, service credentials, permission model (from FED-SOLUTION-DESIGN.md)
43. **App Builder error handling** - How are validation failures surfaced to authors? Retry logic?
44. **App Builder deployment** - Hosted where? Scaling? Monitoring?
45. **Token PR automation** - How are PRs created? Auto-review or manual? Branch strategy?
46. **Figma integration** - Direct API connection or manual export/import?
47. **Booking widget APIs** - Authentication, failover, rate limiting
48. **Weather service** - Provider, API keys, caching strategy
49. **Map integration** - Google Maps? Mapbox? Configuration?

### Cost & Scaling
- **Edge infrastructure** - Adobe-managed CDN with 200+ edge locations
- **Scaling model** - EDS automatically scales; no manual intervention needed
- **Build infrastructure** - GitHub Actions (current: linting only)
- **Content repositories** - SharePoint (brand-specific folders) + Bynder (asset storage)

**⚠️ NEEDS DETAIL:**
- **Pricing model** - Page views? Data transfer? Storage?
- **Traffic handling** - Load testing results? Traffic spike behavior?
- **Team requirements** - Recommended team size and skill composition?
- **Vendor SLAs** - Adobe/SharePoint/Bynder availability guarantees?
- **Disaster recovery** - Failover procedures if Adobe services down?

### Training Materials
- **Author training** - How to use Universal Editor effectively
- **Developer training** - Block development patterns and best practices
- **QA process** - Testing checklist for different change types
- **Video walkthroughs** - Screen recordings of common tasks

### Compliance & Security
- **Security architecture** - Authentication, authorization, data encryption
- **Accessibility testing process** - Tools, checklists, remediation workflows
- **Privacy controls** - Cookie consent, data retention, user rights
- **Audit logging** - What actions are logged? How long are logs retained?