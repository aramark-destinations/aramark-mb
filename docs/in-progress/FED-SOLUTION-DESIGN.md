# Styling / Design System

The styling and design system for this implementation is structured around a layered, token-based architecture that separates shared system design from brand-specific identity. This separation enables the organization to maintain a consistent, high-quality user experience across all property sites while allowing controlled brand differentiation without structural redevelopment.

The system is intentionally designed to support future property launches, acquisitions, and rebrands without requiring component rewrites or layout restructuring.

## System Architecture

The design system operates at two distinct levels:

- **Root**
- **Brand**

### Root Layer

The **Root layer** represents the shared, unbranded foundation of the entire platform. It defines the authoritative token schema required to render all components, layouts, and templates.

Root includes:

- Spacing scales
- Typography scales
- Elevation and shadow values
- Border radii
- Semantic surface definitions
- Component-level styling tokens

Root guarantees that every block, template, and page has a defined and predictable visual outcome even in the absence of brand overrides.

All structural styling logic originates at this layer, ensuring consistency and long-term maintainability across properties.

### Brand Layer

The **Brand layer** functions as a constrained override surface.

It is intentionally limited to identity-related styling concerns and:

- Cannot introduce new structural tokens
- Cannot modify layout logic

Brand tokens override predefined values within the Root schema. If a token is not explicitly overridden at the Brand level, the system automatically falls back to the Root default.

This ensures that two newly provisioned properties will render identically from a structural perspective, with visual differences driven only by brand-defined values such as color.

## Root Level Styling

The Root design system originates in Figma, where the full token model is defined and maintained. Tokens in Figma map directly to the codebase token structure, preserving alignment between design and implementation.

Root defines the complete token schema for the platform and serves as the single source of structural styling truth.

### Authoring Workflow

Root tokens are authored and managed through a Universal Editor form within AEM Author.

- Access is restricted to system-level administrators or design system owners.
- Changes have cross-property impact.

### Publishing Flow

1. Root updates are published in AEM.
2. Data is passed to an Adobe App Builder application.
3. App Builder:
   - Validates input against predefined constraints
   - Standardizes values
   - Generates token artifacts
   - Creates a pull request against the staging branch

All Root-level changes proceed through the standard Edge Delivery Services workflow, including:

- Automated quality checks
- Performance validation
- Governed review processes

No direct modifications are made to production assets outside of this pipeline.

This ensures updates are:

- Versioned
- Reviewable
- Fully traceable

## Brand Level Styling

The Brand layer enables business stakeholders to manage brand identity without direct development involvement.

Brand tokens are authored through a separate Universal Editor form in AEM Author, exposing only a constrained subset of identity-related fields.

### Input Constraints

- All color inputs are restricted to hexadecimal format
- App Builder validates inputs against accepted hex patterns
- Invalid values block publication and surface errors to the author

### Tonal Variant Generation

Approved base values are used to generate lighter and darker variations programmatically during the App Builder transformation step.

- Derived tokens are not manually authored
- Variant logic remains centralized
- All properties follow identical derivation rules

### Build & Import Behavior

- Brand tokens are written to the repository
- Brand tokens are imported after Root tokens
- Override occurs naturally through CSS cascade
- No runtime style injection required

Brand updates follow the same governed workflow as Root:

- Feature branch creation
- Pull request against staging
- Automated checks
- Manual review
- Controlled deployment

## Tokenization Model

The system uses CSS custom properties as the runtime styling mechanism.

- Root defines the authoritative global token schema.
- Brand artifacts override values via controlled import order.
- Components reference semantic tokens instead of hard-coded values.

This ensures:

- Automatic brand inheritance
- No bespoke styling logic
- No per-property code forks

### Gradients

Gradients:

- Use shared naming conventions
- Are composed from base and derived tokens
- Accept brand-provided base inputs (start/stop colors)
- Keep full gradient logic centralized in the shared system model

This prevents drift across properties.

## Token Authoring Experience & Tooling Integration

### Business Perspective

Brand owner workflow:

1. Select Brand configuration in AEM Author
2. Update identity fields
3. Publish

No Git interaction required.

The system automatically handles:

- Validation
- Transformation
- Pull request creation
- Deployment

### Technical Perspective

- All styling decisions are versioned in Git
- CI controls enforce quality
- App Builder:
  - Enforces input validation
  - Restricts output to approved tokens
  - Prevents arbitrary token creation
- Rollback and auditing follow standard Git workflows

This architecture balances:

- Business ease-of-use
- Engineering governance
- Long-term sustainability

## Governance and Scalability

The design system scales horizontally across properties.

Launching a new property requires:

- Creating a new Brand configuration in AEM Author
- Defining identity tokens

No structural component changes required.

Because layout, accessibility, typography, and component logic remain centralized in Root:

- Enhancements propagate uniformly
- Regression risk is reduced
- Design fragmentation is prevented

## Open Items

- Final Brand token whitelist must be documented and approved
- Tonal variant generation algorithm requires final specification and documentation
- Permission model governing Root vs Brand authoring requires governance alignment
- App Builder authentication, permission mapping, and error handling must be fully defined in the technical architecture documentation

## Resolved Items

- ~~Runtime scoping mechanism for Brand CSS must be formally confirmed~~ — RESOLVED: `site-resolver.js` detects brand via AEM page metadata (production) or URL path fallback (local dev). `loadEager()` in `scripts.js` calls `loadCSS()` to inject brand tokens before first paint.
- ~~Determine whether import order alone satisfies all use cases~~ — RESOLVED: Static `@import` chain handles root tokens (`styles.css` → `fixed-tokens.css` → `root-tokens.css`). Runtime JS `loadCSS()` handles brand tokens. This hybrid approach covers all cases.

## TODOs

- Font families and responsive font sizes live in `styles.css`, not in the design token system — see [TODOS.md](../project/TODOS.md) #5
- `--nav-height` is not part of the token system — see [TODOS.md](../project/TODOS.md) #4
- No test files exist for any of this logic — see [TODOS.md](../project/TODOS.md) #15