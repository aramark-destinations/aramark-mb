# .agents

AI agent configuration and skills for this project. Skills are structured prompts that guide AI assistants (Claude, Copilot, etc.) through multi-step development workflows with proven, repeatable processes.

## Structure

```
.agents/
├── README.md              # This file
├── docs/
│   └── SUPERPOWERS.md     # Superpowers agent system reference (version, skill locations, conventions)
├── skills/
│   └── eds/
│       ├── site-spinup/         # Brand site scaffolding
│       ├── block-development/   # Block TDD workflow (new + modification)
│       ├── block-research/      # Pre-build research (existing blocks + external patterns)
│       ├── block-testing/       # Jest unit testing patterns + infrastructure bootstrapping
│       ├── block-readme/        # Developer README template and conventions
│       ├── authoring-guide/     # Author-facing CMS documentation
│       └── e2e-testing/         # Playwright E2E testing patterns
└── _archive/
    └── skills/
        └── eds/
            ├── block-creation/   # Archived block creation skill
            └── block-extension/  # Archived block extension skill
```

## Active Skills

### `eds/site-spinup`

Rapidly scaffolds a new brand site in the aramark-mb 2-tier multi-site framework.

**When to use:** Launching a new vacation property (e.g., post-Lake Powell).

**What it does:**
1. Creates `brands/{brand-name}/` directory structure
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

## Archived Skills

Skills in `_archive/` are retired but preserved for reference. They were superseded by the current implementation or became obsolete after framework changes.

| Skill | Reason Archived |
|-------|----------------|
| `block-creation` | Replaced by updated patterns in the extensibility guide |
| `block-extension` | Replaced by lifecycle hook model in `site-spinup` skill |

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
