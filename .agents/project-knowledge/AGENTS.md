# Agent Instructions — Project Knowledge Base

## Loading Strategy

**Always load first:** `AGENTS.md` + `INDEX.md` (this file + structure overview).
**Then load on demand (JIT):** Only the category files relevant to the current task.

Knowledge files live in `docs/project-knowledge/` (gitignored — obtain from team lead if missing).

| Task Type | Load These Files |
|---|---|
| Block development | `docs/project-knowledge/technical/technical-standards.md`, `docs/project-knowledge/design/design-standards.md` |
| Bug investigation | `docs/project-knowledge/technical/technical-standards.md`, `docs/project-knowledge/technical/platform-constraints.md` |
| Brand token work | `docs/project-knowledge/design/design-standards.md` |
| CF model work | `docs/project-knowledge/technical/technical-standards.md`, `docs/project-knowledge/technical/platform-constraints.md` |
| Deployment / site spinup | `docs/project-knowledge/technical/platform-constraints.md`, `docs/project-knowledge/governance/business-rules.md` |
| Third-party integration | `docs/project-knowledge/technical/platform-constraints.md`, `docs/project-knowledge/technical/technical-standards.md` |
| Performance / CWV work | `docs/project-knowledge/technical/performance-targets.md`, `docs/project-knowledge/technical/platform-constraints.md` |
| Accessibility | `docs/project-knowledge/technical/technical-standards.md`, `docs/project-knowledge/design/design-standards.md` |
| Testing | `docs/project-knowledge/technical/technical-standards.md` |

## Context Intake (Mandatory)

Before producing any deliverable:
1. Read the relevant knowledge base files for your task
2. Apply knowledge — flag any conflicts between the task and KB standards
3. Cite KB sources when referencing constraints or decisions

### Critical Files Reference

| File | Content |
|---|---|
| `docs/project-knowledge/technical/technical-standards.md` | Code standards, Block Pattern A, WCAG 2.1 AA, ARIA, testing |
| `docs/project-knowledge/technical/platform-constraints.md` | EDS repoless, AEM Universal Editor, no Google Docs, no MSM, ADO (not Jira) |
| `docs/project-knowledge/technical/performance-targets.md` | CWV thresholds, component budgets, image breakpoints |
| `docs/project-knowledge/design/design-standards.md` | Breakpoints, CSS token cascade, multi-brand via tokens.css |
| `docs/project-knowledge/governance/business-rules.md` | Aramark Destinations context, ADO workflow, branch naming |

## 3-Tier Update Permissions

| Tier | Scope | Action |
|---|---|---|
| **T1 — Silent** | Typo fixes, broken link repairs, filling TBD values from authoritative sources | Apply without announcement |
| **T2 — Inform** | New subsections, resolved open questions, clarification additions | Apply and note in response |
| **T3 — Approval** | Changing established standards, creating new files, resolving contradictions | Propose and wait for approval |

## Post-Session Updates

After completing substantive work:
1. Review if any open questions were resolved — update the relevant KB file
2. Propose any knowledge migration (session learnings → KB files) using the appropriate tier
3. Keep `INDEX.md` current if files are added or moved

## Synchronization Rules

- **INDEX.md must stay current** — update the structure table when files are added/moved/removed
- **Preserve folder structure** — files belong in their category directories
- **Split files > 500 lines** — if a file exceeds 500 lines, propose splitting by logical sections

---

*Last Updated: 2026-03-25*
