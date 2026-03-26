# .agents

AI agent configuration and skills for this project. Skills are structured prompts that guide AI assistants (Claude, Copilot, etc.) through multi-step development workflows with proven, repeatable processes.

## Structure

```
.agents/
├── README.md                        # This file
├── CODE_GENERATION_CHECKLIST.md     # Per-generation ESLint checklist (run before + after every code change)
├── docs/
│   └── SUPERPOWERS.md               # Superpowers agent system reference (version, skill locations, conventions)
├── project-knowledge/               # JIT-loaded project context for agents
│   ├── AGENTS.md                    # Loading strategy + 3-tier update permissions
│   ├── INDEX.md                     # Project overview + knowledge base structure
│   ├── technical/
│   │   ├── technical-standards.md  # Block Pattern A, SCSS pipeline, WCAG, ARIA, testing
│   │   ├── platform-constraints.md # EDS repoless, AEM UE, no MSM, ADO (not Jira)
│   │   └── performance-targets.md  # CWV thresholds, component budgets, image breakpoints
│   ├── design/
│   │   └── design-standards.md     # Breakpoints, CSS token cascade, multi-brand
│   └── governance/
│       └── business-rules.md       # ADO workflow, branch naming, ticket-details convention
├── skills/
│   ├── collab/
│   │   └── update-status/          # Daily EOD status log for async team visibility
│   └── eds/
│       ├── site-spinup/            # Brand site scaffolding
│       ├── block-development/      # Block TDD workflow (new + modification)
│       ├── block-research/         # Pre-build research (existing blocks + external patterns)
│       ├── block-testing/          # Jest unit testing patterns + infrastructure bootstrapping
│       ├── block-readme/           # Developer README template and conventions
│       ├── authoring-guide/        # Author-facing CMS documentation
│       ├── e2e-testing/            # Playwright E2E testing patterns
│       ├── block-audit/            # Block validation, spec alignment, and token audit
│       ├── scaffold-cf-model/      # Content Fragment model scaffolding
│       ├── create-brand-tokens/    # Brand token CSS creation and validation
│       ├── quality-audit/          # Lighthouse, SEO, and accessibility audit
│       ├── validate-third-party/   # Third-party integration validation
│       ├── pre-merge-check/        # Pre-PR orchestrator (lint, test, block audit)
│       ├── figma-map/              # Figma design system token mapping
│       └── docs-search/            # aem.live documentation search with relevance scoring
└── superpowers/
    ├── bug-hunt.prompt.md          # Systematic block bug investigation workflow
    └── create-uat-document.prompt.md # Generate UAT docs from ticket-details.md + block-audit
```

## Active Skills

### `collab/update-status`

Daily EOD status log for async team visibility across time zones.

**When to use:** At the end of the workday to log completed work, in-progress items, blockers, and handoff notes.

**What it does:**
1. Reads `docs/collaboration/daily-status.md`
2. Finds or creates a heading for today's date
3. Appends a formatted status entry
4. Reminds you to commit and push

See [skills/collab/update-status/SKILL.md](skills/collab/update-status/SKILL.md) for the full format and examples.

---

### `eds/site-spinup`

Rapidly scaffolds a new brand site in the 2-tier multi-site framework.

**When to use:** Launching a new brand site

**What it does:**
1. Creates `brands/{{brand}}/` directory structure
2. Generates `tokens.css` with brand color and typography variables
3. Registers the brand as a repoless EDS site via the `admin.hlx.page` config API
4. Creates brand `README.md` from the reference template
5. Optionally sets up block overrides and `config.json` for integrations

See [skills/eds/site-spinup/SKILL.md](skills/eds/site-spinup/SKILL.md) for the full checklist and implementation patterns.

---

### `eds/block-development`

Full TDD workflow for building or modifying EDS blocks — from reading requirements through verification.

**When to use:** Creating a new block or making non-trivial changes to an existing block in `/blocks/`.

**What it does:**
1. Pre-flight research (run `eds/block-research` first)
2. Reads `ticket-details.md` for requirements
3. Creates/updates UE JSON schema (`_{name}.json`) and runs `pnpm build:json`
4. Writes Jest tests for meaningful block logic
5. Implements `decorate(block, options)` using Pattern A boilerplate
6. Writes CSS using design tokens only, runs `pnpm build:css`
7. Runs lint + tests, verifies in local dev
8. Creates/updates block README

See [skills/eds/block-development/SKILL.md](skills/eds/block-development/SKILL.md) for the full workflow and code templates.

---

### `eds/block-research`

Pre-build research to avoid duplicate blocks and find reusable patterns.

**When to use:** Before building any new block.

**What it does:**
1. Checks existing `/blocks/` for overlapping functionality
2. Evaluates Adobe Block Collection and Block Party community patterns
3. Provides decision criteria: adapt existing vs. build from scratch

See [skills/eds/block-research/SKILL.md](skills/eds/block-research/SKILL.md).

---

### `eds/block-testing`

Jest unit testing patterns including infrastructure bootstrapping.

**When to use:** Writing tests for a block with meaningful JS logic (state management, data transformation, event handling).

**What it does:**
- Creates `jest.config.js` and test directory if they don't exist yet
- Distinguishes keeper tests (committed) from throwaway tests (DOM verification)
- Provides mock patterns for `aem.js`, `scripts.js`, `baici/utils/`
- Covers event verification and async block testing

See [skills/eds/block-testing/SKILL.md](skills/eds/block-testing/SKILL.md).

---

### `eds/block-readme`

Developer README template for EDS blocks.

**When to use:** After implementing a new block or making significant changes to an existing block.

**What it covers:** Description, variants, UE fields, lifecycle hooks, events, CSS classes, analytics, DOM structure.

See [skills/eds/block-readme/SKILL.md](skills/eds/block-readme/SKILL.md).

---

### `eds/authoring-guide`

Author-facing CMS documentation — strictly separated from developer docs.

**When to use:** When a block needs documentation for content authors using Universal Editor.

**What it covers:** Audience boundaries, field-to-author-language mapping, accessibility notes, common mistakes.

See [skills/eds/authoring-guide/SKILL.md](skills/eds/authoring-guide/SKILL.md).

---

### `eds/e2e-testing`

Playwright E2E testing patterns for blocks with interactive browser behavior.

**When to use:** When a block has user interactions (carousels, accordions, forms, modals) that unit tests can't cover.

**What it does:**
- Bootstrap steps for `playwright.config.js` and `tests/e2e/` directory
- E2E vs unit test decision matrix
- Carousel navigation, accordion keyboard, swipe gesture test patterns

See [skills/eds/e2e-testing/SKILL.md](skills/eds/e2e-testing/SKILL.md).

---

### `eds/block-audit`

Comprehensive block validation: structure, Pattern A compliance, CSS token usage, spec alignment, and developer checklist.

**When to use:** After implementing or modifying a block, before creating a PR, or when reviewing someone else's block.

**What it does:**
1. Validates directory structure and file naming conventions
2. Checks Pattern A compliance (decorate export, lifecycle hooks, window.Name?.hooks)
3. Scans CSS for hard-coded values that should use design tokens
4. Compares implementation against spec in `blocks-and-components.md`
5. Walks the developer alignment checklist (responsive, authoring, performance, a11y)
6. Outputs a structured PASS/FAIL report with remediation steps

See [skills/eds/block-audit/SKILL.md](skills/eds/block-audit/SKILL.md).

---

### `eds/scaffold-cf-model`

Design Content Fragment models with consistent field naming across all content types.

**When to use:** Creating a new CF model (lodging, activities, dining, events, FAQs, specials) or reviewing an existing one.

**What it does:**
1. Ensures all 12 common card fields use identical names across models
2. Adds content-type-specific detail page fields
3. Includes compare tool attributes where applicable
4. Validates field types against AEM data type mappings
5. Outputs model as markdown table matching solution design format

See [skills/eds/scaffold-cf-model/SKILL.md](skills/eds/scaffold-cf-model/SKILL.md).

---

### `eds/create-brand-tokens`

Create or update brand token CSS files for property sites.

**When to use:** Creating tokens for a new brand or updating visual identity without full site spinup.

**What it does:**
1. Reads root tokens to identify all overridable variables
2. Creates `brands/{brand}/tokens.css` with only values that differ from root
3. Validates token values (hex format, font fallbacks, unit consistency)
4. Provides cascade verification instructions (local dev + DevTools)
5. Includes complete overridable token reference table with defaults

See [skills/eds/create-brand-tokens/SKILL.md](skills/eds/create-brand-tokens/SKILL.md).

---

### `eds/quality-audit`

Lighthouse, SEO, and WCAG 2.1 accessibility audit against solution design targets.

**When to use:** Periodic quality audits, before major releases, or investigating performance/accessibility/SEO issues.

**What it does:**
1. Runs Lighthouse audit and compares scores against 90+ targets
2. Reports Core Web Vitals (LCP, INP, CLS)
3. Checks SEO: canonical tags, meta tags, heading hierarchy, robots.txt, sitemap, LLM optimization
4. Audits accessibility: keyboard nav, color contrast, semantic HTML, ARIA, media controls
5. Outputs structured report with prioritized remediation

See [skills/eds/quality-audit/SKILL.md](skills/eds/quality-audit/SKILL.md).

---

### `eds/validate-third-party`

Validate third-party integrations against solution design requirements.

**When to use:** Adding or reviewing integrations (OneTrust, HotJar, Elastic Search, Fleeknote, YouTube, Emplifi, Google Maps, chatbot).

**What it does:**
1. Verifies async/deferred script loading (no render-blocking)
2. Checks consent awareness (OneTrust gating before tracking fires)
3. Validates environment-specific configurations (separate IDs for dev/stage/prod)
4. Measures performance impact (before/after Lighthouse comparison)
5. Runs integration-specific checklist per the solution design

See [skills/eds/validate-third-party/SKILL.md](skills/eds/validate-third-party/SKILL.md).

---

### `eds/pre-merge-check`

Orchestrator skill — final quality gate before merging a PR.

**When to use:** Before merging any PR.

**What it does:**
1. Identifies changed files and scopes checks accordingly
2. Runs automated checks: `pnpm lint`, `pnpm test`, `pnpm build:css`, `pnpm build:json`
3. For modified blocks: runs abbreviated `eds/block-audit`
4. For token changes: validates cascade integrity
5. Checks branch naming (`ADO-{ticket}-{type}`) and commit hygiene
6. Outputs GO/NO-GO report

See [skills/eds/pre-merge-check/SKILL.md](skills/eds/pre-merge-check/SKILL.md).

---

### `eds/figma-map`

Maps Figma design system tokens to the project's CSS token system.

**When to use:** When comparing a Figma design spec against the project's token system, or when adding new tokens from a design handoff.

See [skills/eds/figma-map/SKILL.md](skills/eds/figma-map/SKILL.md).

---

### `eds/docs-search`

Searches the aem.live documentation index for information on EDS platform features and concepts.

**When to use:** When you need information about an aem.live feature and basic web search is not returning relevant documentation results.

**What it does:**
1. Runs a local search script against the aem.live docpages index (150+ pages)
2. Returns relevance-ranked results with title, description, snippet, and deprecation warnings
3. Falls back to blog posts if fewer than 5 doc results found
4. Caches index locally for 24 hours to speed up subsequent searches

```bash
# Usage from project root
node .agents/skills/eds/docs-search/scripts/search.js <keyword1> [keyword2]
node .agents/skills/eds/docs-search/scripts/search.js --all metadata
```

See [skills/eds/docs-search/SKILL.md](skills/eds/docs-search/SKILL.md) for full workflow and examples.

---

## Superpowers

Superpower prompts in `superpowers/` are pre-assembled agent instructions for complex investigation or generation tasks. Use them as the starting prompt when tackling multi-step workflows.

### `bug-hunt`

Systematic block bug investigation workflow for NO-GO block remediation.

**When to use:** Investigating a specific block bug — schema/implementation mismatch, missing lifecycle hooks, broken event delegation, or wrong localStorage namespace.

**What it assembles:** `eds/block-audit` → root cause analysis → `eds/block-development` fix → `eds/block-testing` regression test → `eds/pre-merge-check` verification.

See [superpowers/bug-hunt.prompt.md](superpowers/bug-hunt.prompt.md).

---

### `create-uat-document`

Generate structured UAT documentation for block remediation and acceptance review.

**When to use:** When a block needs a formal UAT document for stakeholder sign-off (reads `ticket-details.md` + block-audit output).

**Output:** `docs/UAT-{BLOCK-NAME}.md` with authoring guide, test scenarios, and sign-off checklist.

See [superpowers/create-uat-document.prompt.md](superpowers/create-uat-document.prompt.md).

---

## Superpowers Agent System

Skills are managed by the [Superpowers](https://github.com/complexthings/superpowers) agent framework. See `docs/SUPERPOWERS.md` for:
- Current version (`SAV:6.5.2`)
- Skill discovery locations (project, personal, global)
- Naming conventions per AI assistant
- How to create, test, and publish new skills

## Adding a New Skill

1. Create a directory under `skills/{category}/{skill-name}/`
2. Add `SKILL.md` — human-readable instructions with steps and examples
3. Add `skill.json` — metadata (name, description, when_to_use, version)
4. Test the skill end-to-end before committing
5. Reference it from the root `AGENTS.md` if it should be auto-loaded
