# Business Rules

## Project Context

**Client:** Aramark Destinations — a division of Aramark operating vacation and outdoor recreation properties.
**Scope:** 30+ destination websites being replatformed from Milestone CMS to AEM EDS.
**Pilot site:** Lake Powell
**Architecture:** Repoless multi-brand — one Git repo, one block library, multiple AEM content mounts, CSS token-based brand differentiation.

## ADO Ticket Workflow

This project uses **Azure DevOps (ADO)** for issue tracking. There is no Jira.

- All work is tied to an ADO ticket
- Each block directory includes a committed `ticket-details.md` with the full ADO ticket requirements
- **`ticket-details.md` is the authoritative spec source** — always read it before reading any other file when working on a block
- Ticket IDs follow the format `ADO-{number}` (e.g., `ADO-94`, `ADO-120`)

## Branch Naming Convention

```
ADO-{ticket}-{type}
```

Examples:
- `ADO-94-feat` — new feature for ticket 94
- `ADO-120-fix` — bug fix for ticket 120
- `ADO-87-chore` — chore/refactor for ticket 87

Valid types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`

Branches that don't follow this convention will be flagged by `eds/pre-merge-check`.

## Block Status Tracking

Block remediation status is tracked in `docs/audits/SUMMARY.md`:
- **GO** — Block meets spec, passes audit, ready for production (7 blocks as of 2026-03-25)
- **NO-GO** — Block has issues requiring remediation (21 blocks as of 2026-03-25)

Bug categories in NO-GO blocks include: schema/implementation mismatches, missing lifecycle hooks, broken event delegation, and wrong localStorage namespace.

## Commit Guidelines

- Commit messages use conventional commits format: `type(scope): description`
- Do not add `Co-Authored-By:` lines referencing AI tools
- Keep commit messages factual and technical — do not reference client names from other projects

## Open Questions

Several decisions are pending external input (as of 2026-03-25) and are tracked in `docs/project/TODOS.md`:
- Admin API key format for site provisioning
- Lake Powell brand color finalization
- Brand-specific block variant strategy

Do not encode unresolved decisions as facts. If a decision is needed, check `TODOS.md` first for its current status.

---

*Last Updated: 2026-03-25*
