# Agent Skills to Build

Skills derived from the Solution Design document. Organized by category, with references to the relevant solution design sections.

---

## Block Development Skills

### skill: scaffold-block
**Purpose**: Create a new EDS block following all conventions from the solution design.
**What it should do**:
- Create block directory `/blocks/{blockname}/` with `{blockname}.js`, `{blockname}.css`, and `README.md`
- JS file exports `decorate(block)` function
- CSS uses BEM-style class naming (`.{blockname}-{element}`)
- CSS references semantic design tokens (not hard-coded values)
- README documents use cases, configurable fields, and variants
- Ensure block is responsive across all 8 breakpoints (xxs–xxl)

### skill: validate-block
**Purpose**: Validate that a block implementation meets all solution design requirements.
**What it should do**:
- Check directory structure and naming conventions
- Verify BEM CSS class naming
- Check for hard-coded colors/spacing (should use tokens)
- Verify README exists and documents use cases
- Check for accessibility basics (semantic HTML, alt text fields, keyboard support)
- Verify no site-specific code (should be global/shared)
- Run Lighthouse audit and flag if score <90

### skill: review-block-alignment
**Purpose**: Compare a block's implementation against its specification in the solution design.
**What it should do**:
- Read the block's spec from `blocks-and-components.md`
- Read the actual implementation
- Compare: are all specified use cases covered? Are all configurable fields implemented?
- Flag gaps between spec and implementation
- Check for missing Content Fragment integration where specified

---

## Design Token Skills

### skill: create-brand-tokens
**Purpose**: Create a new brand token set for a property site.
**What it should do**:
- Create brand token directory under `/brands/{brand}/`
- Scaffold brand token CSS file with overridable variables
- Only include tokens that differ from Root — everything else falls back
- Validate token values (color formats, typography choices)
- Ensure Root → Brand cascade works correctly

### skill: audit-token-usage
**Purpose**: Audit blocks for proper token usage vs hard-coded values.
**What it should do**:
- Scan all block CSS for hard-coded colors, spacing, font values
- Report which values should be converted to token references
- Verify semantic token naming is used (e.g., `--brand-primary`, not `--blue-500`)

---

## Content Fragment Skills

### skill: scaffold-cf-model
**Purpose**: Design a Content Fragment model following solution design patterns.
**What it should do**:
- Ensure common card fields (title, eyebrow, shortDescription, images, button1/2 fields) use identical field names across models
- Include all fields needed for: card display, detail page population, and compare tool (if applicable)
- Document which "Page Type" options map to which UI templates
- Validate field types match expected data types

---

## Testing Skills

### skill: generate-block-tests
**Purpose**: Generate unit tests for a block's JS module.
**What it should do**:
- Create test file following project test conventions
- Test `decorate(block)` function with sample block HTML
- Test responsive behavior expectations
- Test Content Fragment data rendering where applicable
- Ensure tests are CI-compatible (run on every PR)

### skill: lighthouse-check
**Purpose**: Run Lighthouse audit on a page and report results against solution design targets.
**What it should do**:
- Run Lighthouse on specified URL
- Compare scores against targets (90+ for Performance, Accessibility, Best Practices, SEO)
- Report Core Web Vitals (LCP, FID/INP, CLS)
- Flag specific blocks or assets causing degradation

---

## New Property Onboarding Skills

### skill: onboard-property
**Purpose**: Set up a new property site within the existing platform.
**What it should do**:
- Create brand token set (scaffold from existing brand or defaults)
- Add content mountpoint entry for the new property
- Verify all shared blocks render correctly with new brand tokens
- Create property-specific configurations (booking endpoints, form endpoints, search indices)
- Document the new property setup

---

## SEO Skills

### skill: audit-seo
**Purpose**: Audit a page or set of pages for SEO alignment with solution design requirements.
**What it should do**:
- Check canonical tags in HTML output
- Verify meta tags (title, description, OG) are injected at build time
- Check semantic structure (headings hierarchy, landmarks)
- Verify page appears in XML sitemap
- Check robots.txt is environment-appropriate (disallow non-prod)
- Assess LLM optimization (clear structured content, summaries)

---

## Accessibility Skills

### skill: audit-accessibility
**Purpose**: Audit a block or page for WCAG 2.1 compliance.
**What it should do**:
- Check keyboard navigation
- Verify color contrast ratios
- Check semantic HTML structure
- Test with screen reader expectations
- Verify alt text on images
- Check video controls accessibility (especially Video Hero)
- Flag any author-configurable settings that could create accessibility barriers

---

## Integration Skills

### skill: validate-third-party
**Purpose**: Validate that third-party integrations follow solution design requirements.
**What it should do**:
- Verify scripts load asynchronously
- Check consent-awareness (OneTrust integration before tracking fires)
- Verify environment-specific configurations (separate workspace IDs for dev/stage/prod)
- Check that integrations don't degrade Lighthouse scores

---

## Code Quality Skills

### skill: pre-merge-check
**Purpose**: Run all solution design compliance checks before a PR is merged.
**What it should do**:
- Run unit tests
- Run Lighthouse audit
- Check block naming conventions
- Verify no hard-coded token values
- Check for accessibility basics
- Verify branch naming convention (ADO-{ticket}-{block/element/feature})
- Ensure README is updated if block was modified

---

## Notes on Skill Prioritization

**High priority** (core development workflow):
1. `scaffold-block` — Used every time a new block is created
2. `validate-block` — Used on every PR
3. `review-block-alignment` — Ensures delivery matches spec
4. `generate-block-tests` — Ensures test coverage

**Medium priority** (property scaling):
5. `create-brand-tokens` — Needed as new properties onboard
6. `onboard-property` — Streamlines new property setup
7. `audit-token-usage` — Periodic maintenance

**Lower priority** (quality assurance):
8. `lighthouse-check` — Can start manual, automate later
9. `audit-seo` — Periodic audits
10. `audit-accessibility` — Periodic audits
11. `validate-third-party` — Integration phase
12. `pre-merge-check` — Can be built incrementally as CI matures
