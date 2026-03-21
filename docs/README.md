# Docs

Project documentation for the Aramark MB EDS multi-brand platform. Intended for developers and contributors.

---

## Architecture & Design

Core architecture specifications and design system documentation.

| File | Description |
|------|-------------|
| [BLOCK-RENDERING-BUILD-CONFIG.md](BLOCK-RENDERING-BUILD-CONFIG.md) | Block rendering pipeline, 2-tier resolution system, design token architecture, build and deployment |
| [MULTI-BRAND-SUPPORT-OVERVIEW.md](MULTI-BRAND-SUPPORT-OVERVIEW.md) | Repoless multi-brand architecture, design token system, brand detection, 2-tier block resolution |
| [in-progress/FED-SOLUTION-DESIGN.md](in-progress/FED-SOLUTION-DESIGN.md) | Design token governance model, Root vs Brand authoring, App Builder integration spec |
| [in-progress/ICON-ARCHITECTURE.md](in-progress/ICON-ARCHITECTURE.md) | Three-tier icon system design (Phosphor + custom global + DAM) — not yet implemented |

---

## How-To Guides

Step-by-step guides for common developer tasks.

| File | Description |
|------|-------------|
| [BRAND-SETUP-GUIDE.md](BRAND-SETUP-GUIDE.md) | Add a new brand/property site — directory structure, token setup, admin API registration, optional block overrides |
| [BLOCK-EXTENSIBILITY-GUIDE.md](BLOCK-EXTENSIBILITY-GUIDE.md) | Extend or override root blocks for a specific brand using lifecycle hooks (`onBefore`, `onAfter`) |
| [MULTI-BRAND-LOCAL-DEV.md](MULTI-BRAND-LOCAL-DEV.md) | Local development setup — brand-aware dev server, brand URL configuration, troubleshooting |
| [REPO-MIGRATION.md](REPO-MIGRATION.md) | Admin API authentication, org setup, repoless site registration, and long-term API key access model |
| [in-progress/AEM-EDS-REPOLESS-UE-SETUP.md](in-progress/AEM-EDS-REPOLESS-UE-SETUP.md) | AEM repoless + Universal Editor setup guide — GitHub repo migration, Code Sync app, site registration |
| [in-progress/superpowers-get-started-guide.md](in-progress/superpowers-get-started-guide.md) | AI-assisted development workflow guide using structured skills (brainstorm, plan, debug, verify, review) |

---

## Reference

Background context and project state documentation.

| File | Description |
|------|-------------|
| [PROJECT-README.md](PROJECT-README.md) | Project overview, quick start, available blocks, roadmap, and documentation index |
| [BRAND-CONFIG-TICKET-RUNDOWN.md](BRAND-CONFIG-TICKET-RUNDOWN.md) | Ticket-level rundown of the `unbranded` and `lake-powell` brand configurations — what was built and how |

---

## Open Work

Active work items and outstanding implementation tasks.

| File | Description |
|------|-------------|
| [project/TODOS.md](project/TODOS.md) | **Single source of truth for all open to-do items** — blocks, architecture, testing, security, integrations |
| [in-progress/ADOPTION-PLAN.md](in-progress/ADOPTION-PLAN.md) | Detailed specs for three outstanding features: Section model expansion, CTA block, preconnect hints |

---

## Block Audits

| File | Description |
|------|-------------|
| [audits/SUMMARY.md](audits/SUMMARY.md) | Audit results for all 28 blocks — GO/NO-GO status, prioritized remediation list, cross-cutting issues |
| [audits/](audits/) | Individual block audit files (`{block}-audit.md`) with detailed per-finding analysis |

---


## Related

- Root [README.md](../README.md) — Quick-start and repository overview
- Root [CONTRIBUTING.md](../CONTRIBUTING.md) — Contribution guidelines and code standards
- [`.agents/skills/eds/`](../.agents/skills/eds/) — 13 AI-assisted development skills (block-development, block-audit, site-spinup, and more)
- [AEM EDS Documentation](https://www.aem.live/docs/)
- [Universal Editor Guide](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring)
