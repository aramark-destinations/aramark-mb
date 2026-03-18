# Docs

Project documentation for architecture, design decisions, and developer guides. These documents are intended for contributors and developers working on the aramark-mb EDS project.

**Organization:** Stable, long-term reference docs live here in `docs/`. Working documents — specs for unshipped features, open decision trackers, and analysis — live in [`docs/in-progress/`](in-progress/) and move here (or are deleted) once the work is complete.

## Documents

### Architecture & Design

| File | Description |
|------|-------------|
| [BLOCK-RENDERING-BUILD-CONFIG.md](BLOCK-RENDERING-BUILD-CONFIG.md) | Block rendering pipeline, build configuration, and the EDS loading lifecycle |

### Developer Guides

| File | Description |
|------|-------------|
| [BRAND-SETUP-GUIDE.md](BRAND-SETUP-GUIDE.md) | Step-by-step guide for onboarding a new brand/property site. Covers directory structure, token setup, repoless EDS site registration via admin API, and optional block overrides |
| [BLOCK-EXTENSIBILITY-GUIDE.md](BLOCK-EXTENSIBILITY-GUIDE.md) | How to extend or override root blocks for a specific brand using lifecycle hooks (`onBefore`, `onAfter`) |
| [MULTI-BRAND-LOCAL-DEV.md](MULTI-BRAND-LOCAL-DEV.md) | Repoless multi-brand architecture and brand-aware dev server configuration for local development |
| [REPO-MIGRATION.md](REPO-MIGRATION.md) | Admin API authentication, org setup, and repoless site registration process |

### Reference

| File | Description |
|------|-------------|
| [PROJECT-README.md](PROJECT-README.md) | Expanded project overview and onboarding reference |
| [ICON-ARCHITECTURE.md](ICON-ARCHITECTURE.md) | Three-tier icon system: Phosphor system icons, custom global icons, and AEM Assets DAM project icons |
| [LAKE-POWELL-SYNC.md](LAKE-POWELL-SYNC.md) | Content sync investigation guide and Admin API checklist for Lake Powell |

## In-Progress

Working documents, specs for unshipped features, and open decision trackers live in [`in-progress/`](in-progress/).

| File | Description |
|------|-------------|
| [in-progress/ADOPTION-PLAN.md](in-progress/ADOPTION-PLAN.md) | Outstanding work items: Section model expansion, CTA block, preconnect hints |
| [in-progress/SECTION-AND-CTA-IMPLEMENTATION.md](in-progress/SECTION-AND-CTA-IMPLEMENTATION.md) | Implementation spec for Section background fields and CTA block variants |
| [in-progress/CTA-ANALYSIS.md](in-progress/CTA-ANALYSIS.md) | Analysis of block gaps that motivated the CTA block recommendation |
| [in-progress/FED-SOLUTION-DESIGN.md](in-progress/FED-SOLUTION-DESIGN.md) | Front-end solution design; has open TODOs around token whitelist and App Builder auth |
| [in-progress/ARCHITECTURE-TODO.md](in-progress/ARCHITECTURE-TODO.md) | Open architectural questions, resolved decisions log, and technical debt tracker |
| [in-progress/ICON-ARCHITECTURE.md](in-progress/ICON-ARCHITECTURE.md) | Three-tier icon system design; not yet implemented |

## Related Documentation

- Root [README.md](../README.md) — Quick-start and repository overview
- Root [CONTRIBUTING.md](../CONTRIBUTING.md) — Contribution guidelines and code standards
- [`.agents/skills/eds/site-spinup/SKILL.md`](../.agents/skills/eds/site-spinup/SKILL.md) — AI-assisted brand spinup skill
- [AEM EDS Documentation](https://www.aem.live/docs/)
- [Universal Editor Guide](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring)
