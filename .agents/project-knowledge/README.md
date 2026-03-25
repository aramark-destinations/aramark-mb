# Agent Project Knowledge — Index

This directory holds agent-guidance files that are tracked in the repo: the `INDEX.md`, `AGENTS.md` override, and `skills-to-build.md` planning doc.

## ⚠️ Project Knowledge Has Moved

Human-readable project documentation (business rules, technical standards, design standards, platform constraints, performance targets, solution design overview) now lives in:

```
docs/project-knowledge/
```

That directory is **gitignored** — it is not committed to the public repo. Share it with teammates via your internal channel (Slack, email, shared drive).

## What Lives Here (tracked)

| File | Purpose |
|---|---|
| `AGENTS.md` | Agent-specific overrides for this project |
| `INDEX.md` | Index of knowledge files for agent discovery |
| `skills-to-build.md` | Backlog of agent skills to build |

## What Lives in `docs/project-knowledge/` (gitignored)

| File | Purpose |
|---|---|
| `overview.md` | Project goals, scope, architecture, technology stack |
| `governance/business-rules.md` | ADO workflow, branch naming, commit convention, block status |
| `technical/technical-standards.md` | Block Pattern A, SCSS pipeline, code style, WCAG requirements |
| `technical/platform-constraints.md` | AEM/EDS repoless pattern, multi-brand rules, no-commerce constraints |
| `technical/performance-targets.md` | Core Web Vitals targets, Lighthouse scores, image budgets |
| `design/design-standards.md` | Breakpoint system, CSS token cascade, image standards |
| `blocks-and-components.md` | Full component inventory with use cases and solution designs |
| `developer-alignment.md` | Delivery checklist for developer reference |
| `responsive.md` | Responsive design patterns |
| `technical-requirements.md` | Infrastructure, CDN, testing, SEO requirements |

## How Agents Should Load This Knowledge

When a skill calls for loading project knowledge, read from `docs/project-knowledge/`. If the files are not present, the developer needs to sync that directory from the team's internal share.
