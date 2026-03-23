# AI-Assisted Development Guide

How to use Claude Code effectively on this project. This is the shared operating model for AI-assisted development across the team.

---

## 1. The setup

This project uses **Claude Code** as the AI coding tool. Claude Code runs in the terminal inside your editor (VS Code, Cursor, etc.) and has full access to the repo.

The project extends Claude Code with **project-level skills** — named workflows in `.agents/skills/eds/` that encode how work should be done here: what patterns to follow, what files to touch, what to check, and what "done" means for each type of task.

Think of skills as structured task templates that keep Claude Code on-rail and consistent across the team.

**There is no separate installation.** Claude Code + the skills in this repo is the entire setup.

---

## 2. First-time setup

```bash
# Install Claude Code (if not already installed)
npm install -g @anthropic-ai/claude-code

# Run inside the repo
cd eds
claude
```

That's it. Claude Code picks up the skills and solution design context from `.agents/skills/eds/` and `.claude/solution-design/` automatically.

**Verify it's working:** Ask Claude Code what skills are available. It will list the project skills and explain what each one does.

---

## 3. The solution design

Before writing any code, Claude Code reads the solution design documents in `.claude/solution-design/`. These are the authoritative requirements for the platform:

- `overview.md` — project goals, architecture, technology stack
- `blocks-and-components.md` — component inventory, authoring contracts, CF integration
- `technical-requirements.md` — performance targets, testing requirements, browser support
- `developer-alignment.md` — coding conventions, Pattern A, token rules

**You do not need to pass these to Claude Code manually.** They are automatically loaded as context. If Claude Code produces something that doesn't match what you expect, check the solution design first — the answer is usually there.

---

## 4. Project skills

Skills are invoked in Claude Code by describing what you want to do, or by referencing the skill name directly. Skills are located in `.agents/skills/eds/`.

### Block development workflow

| Skill | When to use |
|---|---|
| `eds/block-research` | Before building anything — checks existing blocks, Adobe Block Collection, and Block Party to avoid duplicate work |
| `eds/block-development` | Building a new block or making non-trivial changes to an existing one. Full TDD workflow: schema → Pattern A → CSS tokens → tests → audit |
| `eds/block-audit` | After implementing a block. Validates Pattern A compliance, spec alignment, and CSS token usage |
| `eds/block-readme` | Creating or updating a block's `README.md` following project conventions |
| `eds/block-testing` | Writing Jest unit tests for block logic |
| `eds/e2e-testing` | Writing Playwright E2E tests for blocks with interactive behavior |
| `eds/authoring-guide` | Creating author-facing documentation (separate from developer README) |

### Platform & quality

| Skill | When to use |
|---|---|
| `eds/pre-merge-check` | Final quality gate before any PR is merged — orchestrates block-audit and quality-audit |
| `eds/quality-audit` | Lighthouse, SEO, and WCAG 2.1 accessibility audit against solution design targets |
| `eds/validate-third-party` | Verifying third-party integrations meet async loading, consent, environment config, and performance requirements |

### Brand & content

| Skill | When to use |
|---|---|
| `eds/site-spinup` | Launching a new brand/property site — scaffolds the brand directory, token file, and admin API registration |
| `eds/create-brand-tokens` | Creating or updating a brand's `tokens.css` — ensures only root token overrides, no hard-coded values |
| `eds/scaffold-cf-model` | Designing and scaffolding a Content Fragment model following the platform's shared field naming conventions |

---

## 5. Standard workflows

### Building a new block

Always follow this order:

```
1. eds/block-research     — confirm no existing block covers it
2. eds/block-development  — build it (schema → JS → CSS → tests)
3. eds/block-audit        — validate before pushing
4. eds/pre-merge-check    — final gate before PR
```

Example prompt:

```
I need to build the side-by-side block per the ticket-details.md.
Start with eds/block-research to check for existing implementations,
then proceed with eds/block-development.
```

### Fixing a bug in a block

```
1. Describe the symptom clearly
2. Let Claude Code diagnose — it will read the block, audit file, and relevant docs
3. Implement the smallest correct fix
4. eds/block-audit — confirm no regressions
```

Example prompt:

```
The carousel block isn't advancing slides on mobile.
Read blocks/carousel/carousel.js and diagnose the root cause
before proposing a fix.
```

### Adding a new brand

```
1. eds/site-spinup        — scaffolds brand directory, tokens.css, registers the EDS site
2. eds/create-brand-tokens — if token values need refinement afterward
```

### Before merging a PR

Always run:

```
eds/pre-merge-check
```

This validates any modified blocks and runs quality checks. Do not skip it.

---

## 6. How to get good output

### Be specific about requirements

Claude Code reads `ticket-details.md` in each block directory as the source of requirements. If a ticket doesn't have one, tell Claude Code what the requirements are explicitly upfront.

```
# Good
Build the hero block to spec. ticket-details.md has the full requirements.

# Also good
Build a hero block that supports: background image, H1 heading,
optional eyebrow text, optional description, up to 2 CTA buttons,
and includes breadcrumbs. Refer to docs/audits/hero-audit.md for known gaps.

# Too vague
Make the hero block better
```

### Use plan mode for non-trivial work

For anything that touches multiple files or has unclear scope, start with a plan before implementation:

```
Plan how to add Content Fragment integration to the cards block.
Don't write any code yet — just show me the approach.
```

Claude Code will enter plan mode, explore the codebase, and present a plan for your approval before touching anything.

### Point to the audit files

The `docs/audits/{block}-audit.md` files contain detailed findings per block. Referencing them gets you targeted fixes faster:

```
Fix the Priority 1 issues in the button block.
See docs/audits/button-audit.md for the specific findings.
```

### Reference the solution design

When building features, referencing the solution design explicitly produces output that matches the platform requirements:

```
Implement the Section model background wiring per
docs/project/TODOS.md — see "Section Model Expansion" under Feature Work.
Follow the token rules in docs/BLOCK-RENDERING-BUILD-CONFIG.md.
```

---

## 7. What not to do

**Don't ask for large implementations without a plan.** Claude Code will jump into code and may miss requirements, skip tests, or make wrong assumptions. Use plan mode first.

**Don't skip the audit after building.** `eds/block-audit` catches things that are easy to miss: missing `bubbles: true`, hard-coded hex fallbacks, spec gaps. It takes seconds and saves review cycles.

**Don't trust "done" without evidence.** Ask Claude Code to show you the specific lines it changed and why. If it claims a spec requirement is met, ask it to show you the code that implements it.

**Don't ask Claude Code to skip the token rules.** If it produces CSS with hard-coded values, push back. The rule is: every visual value references a token. No exceptions.

**Don't let Claude Code modify multiple unrelated things in one pass.** Scope each task narrowly. One block, one issue, one skill at a time.

---

## 8. Team conventions

- Run `eds/block-research` before building anything new
- Run `eds/block-audit` after every block change, before pushing
- Run `eds/pre-merge-check` before every PR — no exceptions
- Use plan mode for anything that touches more than 2–3 files
- Reference `ticket-details.md` or provide explicit requirements before implementation
- Keep tasks scoped: one block per session when possible

---

## 9. Key files to know

| Path | What it is |
|---|---|
| `.claude/solution-design/` | Platform requirements — Claude Code reads these automatically |
| `.agents/skills/eds/` | Project-level skills — one directory per skill |
| `docs/project/TODOS.md` | All open work items — check here before starting any remediation task |
| `docs/audits/SUMMARY.md` | Block audit results — GO/NO-GO status for all 28 blocks |
| `docs/audits/{block}-audit.md` | Per-block findings — detailed issues and remediation notes |
| `blocks/{block}/ticket-details.md` | ADO requirements for the block — Claude Code's primary spec source |

---

## 10. One-line explanation for the team

> Claude Code + project skills is the shared operating model for AI-assisted development. The skills encode how work gets done here. Use them.
