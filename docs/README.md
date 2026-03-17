# Docs

Project documentation for architecture, design decisions, and developer guides. These documents are intended for contributors and developers working on the aramark-mb EDS project.

## Documents

### Architecture & Design

| File | Description |
|------|-------------|
| [FED-SOLUTION-DESIGN.md](FED-SOLUTION-DESIGN.md) | Front-end solution design: the 2-tier multi-site architecture, design token system, brand extensibility model, and block resolution strategy |
| [BLOCK-RENDERING-BUILD-CONFIG.md](BLOCK-RENDERING-BUILD-CONFIG.md) | Block rendering pipeline, build configuration, and the EDS loading lifecycle |
| [ARCHITECTURE-TODO.md](ARCHITECTURE-TODO.md) | Open architectural questions, resolved decisions log, and technical debt tracker. Covers design token management, testing strategy, monitoring, security, and third-party integrations |

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

## Related Documentation

- Root [README.md](../README.md) — Quick-start and repository overview
- Root [CONTRIBUTING.md](../CONTRIBUTING.md) — Contribution guidelines and code standards
- [`.agents/skills/eds/site-spinup/SKILL.md`](../.agents/skills/eds/site-spinup/SKILL.md) — AI-assisted brand spinup skill
- [AEM EDS Documentation](https://www.aem.live/docs/)
- [Universal Editor Guide](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring)
