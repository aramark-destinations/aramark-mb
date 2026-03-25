# Project Knowledge Base — Index

## Project Overview

**Project:** Aramark Destinations — Modernization
**Platform:** AEM Edge Delivery Services (EDS) + AEM Universal Editor
**Scale:** 30+ vacation and recreation destination sites
**Pilot site:** Lake Powell
**Architecture:** Repoless multi-brand — one Git repo, multiple AEM content mounts

Aramark Destinations is modernizing 30+ property websites from Milestone CMS to AEM EDS. All sites share a single block library and token system. Brand differentiation is handled entirely via CSS token overrides (`brands/{brand}/tokens.css`). Content is authored via AEM Universal Editor and stored in AEM, not in Git.

## Knowledge Base Structure

Agent configuration (tracked in repo):
```
.agents/project-knowledge/
├── AGENTS.md          # Loading strategy + 3-tier permission model
├── INDEX.md           # This file — project context and quick start
└── README.md          # Directory guide
```

Content documentation (gitignored — obtain from team lead):
```
docs/project-knowledge/
├── overview.md
├── technical/
│   ├── technical-standards.md     # Code standards, Block Pattern A, WCAG, testing
│   ├── platform-constraints.md    # EDS, AEM UE, no MSM, ADO (not Jira)
│   └── performance-targets.md     # CWV thresholds, component budgets, image breakpoints
├── design/
│   └── design-standards.md        # Breakpoints, token cascade, multi-brand
├── governance/
│   └── business-rules.md          # ADO workflow, branch naming, ticket-details convention
├── blocks-and-components.md
├── developer-alignment.md
├── responsive.md
└── technical-requirements.md
```

## Quick Start for New Agents

1. Read `.agents/project-knowledge/AGENTS.md` to understand loading strategy and permissions
2. Read `.agents/project-knowledge/INDEX.md` (this file) for project context
3. Load only the `docs/project-knowledge/` files relevant to your task (see task-type table in `AGENTS.md`)
4. **Always read `ticket-details.md` inside the block directory before doing any block work**
5. If `docs/project-knowledge/` is missing, ask the developer to sync it from the team's internal share

## Key Facts Every Agent Must Know

- Content is in **AEM**, not Git or SharePoint
- Authoring is via **AEM Universal Editor** — not Google Docs, not SharePoint
- Ticketing is **ADO** — not Jira
- Branch naming: `ADO-{ticket}-{block/element/feature}` (e.g., `ADO-94-cards`, `ADO-120-carousel-scroll`)
- There is **no Adobe Commerce**, no cart, no checkout
- There are **no MSM live copies** — multi-brand is CSS tokens only
- SCSS is used for global styles; run `pnpm build:css` after modifying `.scss` files
- CI only runs `pnpm lint` — tests run locally only
- All blocks follow **Block Pattern A** (see `technical/technical-standards.md`)

---

*Last Updated: 2026-03-25*
