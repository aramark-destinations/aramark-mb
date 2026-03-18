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
│       └── site-spinup/
│           ├── SKILL.md   # Human-readable skill documentation
│           └── skill.json # Machine-readable skill metadata
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
