# Developer Alignment Checklist

Use this checklist to verify that block/component implementations align with the Solution Design.

## General Block Requirements

- [ ] Block directory follows convention: `/blocks/{blockname}/` (lowercase, hyphenated)
- [ ] Block has `{blockname}.js` with default export `decorate(block)`
- [ ] Block has `{blockname}.css` (one per block)
- [ ] CSS classes follow BEM-style convention (e.g., `.cards-card-image`)
- [ ] Block has a README documenting its use cases and configuration
- [ ] Block is part of the shared global library (no site-specific components)
- [ ] Brand differentiation achieved via tokens only — no brand-specific block overrides unless absolutely necessary
- [ ] Block uses semantic design tokens, not hard-coded colors/spacing/typography
- [ ] Block supports Root + Brand token cascade (Root loads first, Brand overrides)

## Responsive Design

- [ ] Block renders correctly across all 8 breakpoints (xxs through xxl)
- [ ] Content fluidly expands within margins at each breakpoint
- [ ] Columns stack vertically at mobile viewport widths
- [ ] Default container max-width respects 1440px
- [ ] Full-width option available where applicable

## Authoring Contract

- [ ] Block works with Universal Editor in-context editing
- [ ] Author-facing fields are clear and documented
- [ ] Block is composable — not bound to specific templates or page types
- [ ] Structure/content/presentation are decoupled
- [ ] Content Fragment integration works where specified (cards, accordion, carousel, compare tool, fragment)

## Performance

- [ ] Lighthouse score ≥90 on mobile and desktop with block present
- [ ] Third-party scripts load asynchronously
- [ ] Images use AEM Assets / Dynamic Media optimized URLs
- [ ] No unnecessary JavaScript — CSS and content conventions preferred
- [ ] Video uses Dynamic Media streaming or YouTube lightweight embed

## Accessibility (WCAG 2.1)

- [ ] Keyboard navigation works correctly
- [ ] Color contrast meets WCAG requirements
- [ ] Semantic HTML structure (proper heading levels, landmarks, etc.)
- [ ] Works with assistive technologies (screen readers, etc.)
- [ ] Video controls are accessible (especially Video Hero)
- [ ] Alt text fields available and populated for images

## Testing

- [ ] Unit tests cover JS modules, utilities, and rendering behaviors
- [ ] Unit tests integrated into CI — run on every PR
- [ ] Integration tests cover authoring-to-delivery lifecycle
- [ ] Lighthouse audits automated in CI pipeline

## SEO

- [ ] Canonical tags generated correctly in HTML output
- [ ] Meta tags (title, description, OG) injected at build time (not client-side)
- [ ] Content structured for LLM interpretability (clear headings, summaries, semantic markup)
- [ ] Page contributes to XML sitemap generation

## Section Component Specifics

- [ ] Coverage styles implemented: Full-width, Contained, Full-bleed
- [ ] Background options: image, color, video
- [ ] Theme options: Dark, Light, Light 2, Brand

## Hero Specifics

- [ ] Background options: image, color, video
- [ ] H1 heading text (required)
- [ ] Optional: eyebrow text, description, CTA buttons, breadcrumb
- [ ] Video Hero variant: ≤30 second clip, Dynamic Media hosted, accessible controls

## Header Specifics

- [ ] Two scroll states implemented
- [ ] Site logo, main menu with mega menu panels, search bar
- [ ] Menu items author-configurable
- [ ] Booking trigger in second state (opens modal)

## Footer Specifics

- [ ] Navigation links, social links, newsletter subscribe form
- [ ] Ownership/affiliation badges, copyright
- [ ] Subscribe form submits to property-specific endpoints

## Cards Specifics

- [ ] Manual card fields: eyebrow, title, description, image, up to 2 CTAs
- [ ] Dynamic population from Content Fragments works
- [ ] Common CF card fields use identical field names across models

## Carousel Specifics

- [ ] Manual panel/slide configuration
- [ ] Content Fragment dynamic population
- [ ] Multiple style variants with conceptual roles
- [ ] Slides are either media assets or Card variants

## Modal Specifics

- [ ] Rule-based dynamic display supported
- [ ] Content sourced from Experience Fragments
- [ ] Button "Open in Modal" behavior works with XF link/path

## Booking Component Specifics

- [ ] Product selection from Content Fragment configuration
- [ ] Progressive disclosure based on booking engine capabilities
- [ ] Springer Miller: accepts dates + guest counts
- [ ] FareHarbor: does not accept additional data
- [ ] Single product + dates: starts with date fields
- [ ] Single product + no dates: just "Check Availability" button

## Compare Tool Specifics

- [ ] Filterable product listing grid
- [ ] Select 2-4 products for comparison
- [ ] Compare mode: matrix table of attributes
- [ ] Data from Content Fragments
- [ ] Author selects CF model and filter fields

## Forms Specifics

- [ ] Subscribe forms (email only)
- [ ] General contact forms
- [ ] RFP forms for large event booking
- [ ] Each form type works across all property sites
- [ ] Configurable endpoint or property code differentiation

## Media Gallery Specifics

- [ ] Full-page gallery display
- [ ] Thumbnails from tag/root path configuration
- [ ] Filterable by author-selected tag groups
- [ ] Lightbox with native aspect ratio
- [ ] Lightbox carousel (next/previous) without closing
