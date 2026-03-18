# Block Rendering & Build Configuration

## Related Documentation

This document covers block rendering, build pipeline, and deployment. For related topics, see:

- **[FED-SOLUTION-DESIGN.md](FED-SOLUTION-DESIGN.md)** - Design token system architecture, App Builder integration, brand governance
- **[BLOCK-EXTENSIBILITY-GUIDE.md](BLOCK-EXTENSIBILITY-GUIDE.md)** - Practical patterns for creating and extending blocks
- **[BRAND-SETUP-GUIDE.md](BRAND-SETUP-GUIDE.md)** - Complete process for launching new brand sites
- **[PROJECT-README.md](PROJECT-README.md)** - Project overview, quick start, and available blocks

---

## Overview

Block rendering is driven by the **Universal Editor (UE) authoring model** using a **2-tier block resolution system**. This architecture maintains a canonical block library while enabling brand-specific customizations without forking code.

**Nomenclature**: This project uses `/brands/{brand}/` directory structure where each "site" represents a distinct brand. Throughout this document, "brand" and "site" are used interchangeably, referring to the same entity.

**Content Source**: AEM Author markup (`author-p179307-e1885056.adobeaemcloud.com`), delivered via Edge Delivery Services. Each brand is registered as a repoless EDS site via the `admin.hlx.page` config API, with content path mappings (`/content/{brand}/` → `/`) configured per site.

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
  styles.css                       # Global styles, legacy token aliases, @import entry for token chain
  fixed-tokens.css                 # Derived tokens (color shades, semantic surfaces via color-mix)
  root-tokens.css                  # Configurable root design tokens (CSS custom properties)
  fonts.css                        # Web font definitions
  lazy-styles.css                  # Below-the-fold styles (currently empty placeholder)

/models/                           # Universal Editor JSON schemas
  _component-models.json           # Block configurations
  _component-definition.json       # Block definitions
  _component-filters.json          # Block visibility rules

/scripts/
  site-resolver.js                 # 2-tier resolution logic + brand detection
  aem.js                           # EDS core framework
  scripts.js                       # Global utilities + brand token loading
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
getCurrentBrand()          // Detects brand from AEM page metadata (production) or URL path (local dev)
getBlockPaths(blockName)   // Returns ordered array of paths to attempt
resolveBlockPath(blockName) // Performs existence check, returns first valid path
```

**Behavior guarantees:**

- AEM page metadata `brand` field is the primary brand detection mechanism (production)
- URL pattern `/brands/{brand}/` is the fallback for local development
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

> See [FED-SOLUTION-DESIGN.md](FED-SOLUTION-DESIGN.md) for complete token authoring workflow, App Builder integration, and governance model.

### Token Layer System

Design tokens are organized in a 2-layer override system:

**Layer 1: Root Tokens** (`/styles/root-tokens.css`)
- Global defaults applicable to all brands
- Imported via chain: `styles.css` → `fixed-tokens.css` → `root-tokens.css`
- Configurable values: colors, radii, text colors, typography weights, layout widths, transitions, component tokens
- `fixed-tokens.css` derives shade scales, semantic surfaces, and stroke tokens from root values via `color-mix()`
- `styles.css` contains legacy aliases (e.g., `--background-color: var(--surface-light-0)`) plus font families and responsive font sizes
- Maintained by design system team in Figma, authored via Universal Editor

**Layer 2: Brand Tokens** (`/brands/{brand}/tokens.css`)
- Brand-specific color palettes, typography, spacing scales
- Override root token values using identical CSS custom property names
- Each brand (in `/brands/{brand}/` directory) has its own tokens file
- **Loaded at runtime via JavaScript** — `loadEager()` in `scripts.js` calls `loadCSS()` before first paint
- Authored by brand stakeholders via Universal Editor forms (planned; currently direct CSS editing)
- Transforms and publishes via App Builder integration (planned)

### Token Loading Order

Root tokens load via static CSS `@import` chain. Brand tokens load via runtime JavaScript injection:

```
head.html
  └─ <link rel="stylesheet" href="/styles/styles.css">     ← Static link
       └─ @import url('fixed-tokens.css')                   ← CSS @import
            └─ @import url('root-tokens.css')                ← CSS @import

scripts.js loadEager()
  └─ getCurrentBrand() → loadCSS('/brands/{brand}/tokens.css')  ← Runtime JS injection
```

This ensures:
- Root tokens are available immediately via CSS cascade
- Brand tokens override root tokens before first paint (loaded in `loadEager()`)
- Derived tokens in `fixed-tokens.css` automatically recalculate when base values change
- Blocks reference tokens, never hardcode values
- Brand switching requires only changing the brand metadata
- No `!important` declarations needed

### Runtime Brand Determination

Brand detection is handled by `site-resolver.js` `getCurrentBrand()`:

1. **AEM page metadata** (production): Reads `brand` field from the page's metadata sheet. On custom domains, the URL path won't contain `/brands/{brand}/`, so metadata is the primary detection mechanism.
2. **URL path fallback** (local dev): Matches `/brands/{brand}/` in the URL pathname.

```json
// Site config at admin.hlx.page/config/{org}/sites/lake-powell.json
{
  "code": { "owner": "{org}", "repo": "{repo}" },
  "content": { "source": { "url": "https://author-p179307-e1885056.adobeaemcloud.com", "type": "markup", "suffix": ".html" } },
  "public": { "paths": { "mappings": ["/content/lake-powell/:/"], "includes": ["/content/lake-powell/"] } }
}
```

**Runtime behavior:**
1. `scripts.js` `loadEager()` imports `site-resolver.js` and calls `getCurrentBrand()`
2. If a brand is detected, `loadCSS()` injects the brand's `tokens.css` into the `<head>`
3. CSS cascade applies brand overrides to root tokens
4. All of this happens before `body.appear` class is added (before first paint)

### Block Token Usage

Blocks must reference tokens exclusively:

```css
/* CORRECT - Uses tokens */
.hero {
  color: var(--text-dark-1);
  font-family: var(--heading-font-family);
  padding: var(--spacing-040) var(--spacing-024);
}

/* INCORRECT - Hardcoded values */
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
pnpm test             # Unit tests for block logic
```

**Merge Requirements:**
- All linters pass
- No unresolved code review comments
- Branch up-to-date with target branch
- PR description includes EDS preview URL for testing

### Deployment Pipeline

**Trigger:** Merge to `main` branch

EDS deploys automatically on merge to `main`. No manual deployment commands are needed.

**Automated Steps:**
1. Build artifacts (merged JSON models, optimized assets)
2. Deploy to Adobe Edge Network
3. Purge CDN cache for affected paths
4. Verify deployment health checks

**Edge Optimization:**
- CSS minification and tree-shaking
- JavaScript minification and bundling
- Image optimization (format conversion, responsive sizing)
- Font subsetting and optimization
- HTML minimization

**Rollback Capability:**
- Git-based versioning enables instant rollback
- Deployment history tracked in CI/CD system
- Emergency rollback achievable via git revert + merge to main

### Development Workflow

**Local Development:**
```bash
pnpm install          # Install dependencies
pnpm start            # Launch EDS CLI dev server (aem up)
# Server runs on http://localhost:3000
```

**Dev Server Features:**
- Hot reload for CSS/JS changes
- Universal Editor integration for authoring preview
- Multi-site support (auto-detects brand from URL path)

**Branch Preview:**
- Each brand site gets its own preview URL: `https://{branch}--{brand}--{org}.aem.page`
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
  background: var(--surface-dark-0);
  color: var(--text-light-1);
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

### Prohibited Patterns

Brands must never:

- Fork canonical blocks and diverge implementation
- Override token values with hardcoded values in block CSS
- Modify canonical block files directly
- Introduce breaking changes to block APIs
- Create dependencies between brand-specific code and canonical blocks
- Use `!important` to override token values
- Bypass 2-tier resolution system

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

- **Zero Block Forking** - 2-tier resolution prevents code duplication
- **Deterministic Overrides** - Priority order guarantees predictable behavior
- **Token-Driven Theming** - Multi-brand support without block modifications
- **Backward Compatibility** - Lifecycle hooks preserve upgrade paths
- **Universal Editor Integration** - All blocks support visual authoring
- **Performance by Default** - Edge optimization and lazy loading built-in
- **Accessibility Compliance** - WCAG 2.1 AA enforced via linting and audits
- **Rapid Site Deployment** - New sites inherit complete block library instantly

### Design Decisions

**Why 2-tier (not 3-tier with `/libs/`)?**
- Sufficient for current multi-brand deployment model
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

## Outstanding Items

### App Builder Integration - Full Specification Required

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

## Unknowns & TODOs

- `buildAutoBlocks()` auto-wraps bare YouTube/Vimeo links as `embed` blocks; expand for additional patterns as needed
- `lazy-styles.css` is empty — see [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md) #6
- Zero test files exist (Jest + Playwright installed but unused) — see [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md) #15
- `--nav-height` not in design token system — see [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md) #4
- Font sizes not in design token system — see [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md) #5
- Browser support matrix needs formal documentation — see [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md) #19
- CSP headers need review for third-party integrations — see [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md) #28
