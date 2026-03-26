# Technical Requirements

## Responsive Design

Approach: Mobile-first responsive design ensuring consistent experience across all devices.

### Primary Breakpoints
| Name | Range |
|---|---|
| Extra Extra Small (xxs) | ≤360px |
| Extra Small (xs) | 360px–640px |
| Small (sm) | 640px–768px |
| Medium (md) | 768px–881px |
| Medium Large (md-lg) | 881px–1024px |
| Large (lg) | 1024px–1280px |
| Extra Large (xl) | 1281px–1440px |
| Extra Extra Large (xxl) | ≥1440px |

- Content fluidly expands within margins at each breakpoint
- Default container max-width: **1440px**
- Authors can set full viewport width via style system option on container component

## Design Token System

### Token-Based Styling Model
All visual choices (colors, spacing, typography) defined as reusable tokens — never hard-coded into components. Components reference semantic tokens (e.g., "brand primary color", "medium spacing").

### Two-Layer Architecture

**Root Layer** (shared across all properties):
- Spacing, typography scales, base colors, layout constraints, system-level tokens
- Acts as shared source of truth
- Maintains accessibility, consistency, structural stability
- Derived tokens (tonal scales, surface styles) generated automatically from base values

**Brand Layer** (per-property identity):
- Overrides approved tokens: primary/secondary colors, typography choices
- Does NOT change layout rules or core system behavior
- Properties only define tokens that differ from Root; everything else falls back automatically
- Each property's token set lives in its own directory, processed through EDS pipeline

**Cascade**: Root tokens load first → Brand tokens load after → overrides apply predictably via CSS cascade.

### Governance
- Brand-level updates limited to approved identity variables
- Structured submission process prevents ad hoc styling
- Root token updates treated as coordinated design changes (not routine config)
- All token changes go through formal review and deployment lifecycle aligned with front-end engineering practices

## Component Architecture

### Author-Driven Composition
- Page layout and component ordering fully author-controlled
- Components not bound to rigid templates or page types
- Structure, content, and presentation intentionally decoupled
- Pages assembled from reusable blocks

### Extensibility-First Strategy
Three layers: Core → Brand → Site

**Shared Core Block**: Single canonical implementation defining:
- Markup structure
- Base functionality and behavior
- Authoring contract (content shape, supported variants, configuration)
- Styled by Root token layer with Brand-level overrides

**Site-Level Overrides** (available but limited):
- Site-specific CSS for identity adjustments, spacing, layout tuning only
- Variant enablement/restriction through configuration
- Optional JS enhancements scoped to site (no shared markup contract changes)
- Conditional behavior via site configuration/metadata

**Key rule**: No site-specific components. All functionality in shared global library. Brand differences via tokens only. Brand-level block overrides available (`/brands/{brand}/blocks/{blockname}/`) but discouraged.

### EDS Out-of-the-Box Block Usage
- Use OOTB blocks directly wherever possible
- Customization via CSS, block variants, content conventions
- JavaScript avoided unless required for interaction/dynamic behavior
- Custom blocks only when business requirements exceed OOTB capabilities

## Performance

### Lighthouse Targets
- Score of **90 or higher** on Core Web Vitals across mobile and desktop for each property site

### CDN Configuration
- Fastly-based CDN built into Adobe EDS
- Global edge caching for HTML, blocks, images, metadata
- Cache invalidation tied to Git commits and Universal Editor publish actions

### Cache Recommendations

| Asset Type | Cache-Control Header |
|---|---|
| HTML Pages | `max-age=0, must-revalidate` |
| Static Assets (JS/CSS) | `max-age=31536000, immutable` |
| Images/Media | `max-age=604800, stale-while-revalidate=86400` |
| Dynamic Media | Use optimized URLs from DM integration (handles own caching) |

- Use `stale-while-revalidate=3600` globally to prevent "First Byte" delay
- Configure CDN to ignore unimportant query strings (maintain high CHR)
- EDS Publish triggers Purge Request to edge — enables long TTLs

### Performance Targets
| Metric | Target |
|---|---|
| Cache Hit Ratio (CHR) | >90% |
| Time to First Byte (TTFB) | <100ms (cached hits) |
| Lighthouse Score | 90+ |

### Asset Optimization
- Consistent rendition, compression, caching standards across all properties
- AEM Assets (Ultimate) + Dynamic Media (Ultimate) for centralized, optimized asset delivery
- Centrally managed assets encourage cross-property reuse

## Infrastructure & Environments

### Development (Dev)
- Active block development, CSS/JS updates, authoring workflow validation
- Feature branches or develop branch trigger EDS build pipeline
- Integrations connect to non-production/sandbox endpoints
- Author: `author-p179307-e1885056.adobeaemcloud.com`

### Staging (Stage)
- Mirrors production (near-production caching, edge routing, CDN settings)
- Used for QA, UAT, accessibility/performance testing
- Integrations point to pre-production endpoints
- Release candidates validated here before Prod
- Status: Not yet stood up at time of writing

### Production (Prod)
- Serves live site traffic from global edge network
- Only approved builds from main branch deployed
- Edge caching, CDN config, consent logic, performance constraints fully enforced

## Backup, Logging, Monitoring

### Backups
- EDS content versioned/backed up in JCR via AEMaaCS
- Content reverted by republishing previous version
- Code rolled back by reverting Git commits → triggers rebuild
- AEM Assets backed up via AEMaaCS

### Logging
- Build logs for EDS pipelines
- Universal Editor activity logs
- CDN/edge logs (errors, performance, cache behavior)

### Monitoring
- Edge performance dashboards (Fastly/CDN metrics via Adobe Developer Console)
- Build status and failure alerts (GitHub Actions CI, Adobe Developer Console)
- Uptime checks: CDN-level availability, synthetic monitoring, RUM signals, build-triggered notifications
- Additional alerting channels (email, Slack, Teams) integrable via CI pipelines or CDN tools

## User/Group/Permission Management

### Recommended Permissions
| Role | Permissions |
|---|---|
| Content Authors | Create, Edit, Push to workflow |
| Marketing/SEO Analysts | Edit, Push to workflow |
| Front-end Developers | Create, Edit, Approve, Publish, Delete, access to template editor |

### Universal Editor Access
- Standard authors → manage page content
- Brand administrators → manage Brand tokens
- System-level administrators → manage Root tokens

## Testing & Quality

| Test Type | Description |
|---|---|
| **Unit Tests** | Validate individual JS modules, utility functions, rendering behaviors. Integrated into Git-based CI — auto-run on every PR. |
| **Integration Tests** | Validate block features, data inputs, styling tokens across authoring-to-delivery lifecycle. Simulate real authoring scenarios. |
| **Lighthouse Audits** | Automated in CI pipeline. Validate performance, accessibility, SEO, best practices. Monitor trends for 90%+ Core Web Vitals pass rate. |
| **Accessibility (WCAG 2.1)** | Keyboard navigation, color contrast, semantic structure, assistive technology. Include authoring guardrails. |
| **UAT (Stage)** | Final validation before Prod. Cross-functional stakeholder validation. Sign-off required before Production promotion. |

## Security
- Dependency scanning, linting for insecure patterns, basic static analysis in CI/CD
- Failed security gates prevent merges/deployments
- Penetration and performance testing performed by Aramark Destinations

## SEO & Content Discovery

| Feature | Implementation |
|---|---|
| **Canonical Tags** | Generated in HTML output via block-level metadata fields in UE. Authors can override. Default rules ensure single authoritative URL. Server-side in final HTML. |
| **LLM Optimization** | Clear, structured, semantically rich content. Page metadata, headings, summaries authored for LLM interpretation. |
| **Meta Tags** | Titles, descriptions, OG fields, optional schema markup as configurable fields in EDS blocks / page-level metadata panels. Injected at build time (not client-side). |
| **XML Sitemaps** | Auto-generated via EDS build pipeline from Git-stored definitions. Per-environment sitemaps. Prod has consolidated sitemap index. Regenerated on publish. |
| **Robots.txt** | Environment-specific file in EDS repo. Non-prod disallows crawling. Prod exposes crawl-friendly rules. References sitemap locations. |

## Dependencies (Pre-requisites)
1. Designs must be fully approved before development begins
2. Aramark Destinations must provide all required platform credentials (ADO, AEM, CJA, etc.) before development
3. All designs must adhere to WCAG; non-compliant designs raise issues for refactor or backlog
4. As blocks/templates complete, Aramark begins authoring and content migration
5. Penetration and performance testing performed by Aramark Destinations
6. Align on scope/expectations with Aramark Enterprise for security scans
