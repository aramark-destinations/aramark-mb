# Platform Constraints

## Authoring Platform

Content is authored in **AEM Universal Editor** — a visual, in-context web editor.

- The term "document-based authoring" does **not** apply to this project
- Authors do **not** use Google Docs, SharePoint, or any document editor
- Authors use a visual editor that works directly against the live page
- Any agent that references Google Docs or SharePoint authoring is working from wrong assumptions

## Content Storage

Content lives in **AEM**, not in Git or SharePoint.

- This is the **repoless EDS pattern** — AEM serves content; Git holds only code (blocks, scripts, styles)
- Content mount points are configured via the **AEM Admin API**, not a `fstab.yaml` file (which is the document-based authoring pattern and does **not** apply here)
- Content paths follow the pattern `/content/aramark-mb`, `/content/lake-powell`, etc.
- Do **not** assume content files exist in the Git repository

## Multi-Brand Architecture

Multiple destination sites share a single Git repository and block library.

- Brand differences are handled entirely through a **CSS token cascade**:
  `styles/root-tokens.scss` → `brands/{brand}/tokens.css`
- A brand site is a directory under `brands/` with a `tokens.css` file
- There is **no MSM** (Multi-Site Manager), no live copies, no blueprint inheritance
- Do **not** use MSM, live copy, or blueprint concepts — they do not exist in this project

## No Adobe Commerce

This project has **no shopping cart, no product catalog, no checkout, no Adobe Commerce**.

- References to `scripts/__dropins__/` and `configs.js` may exist in the boilerplate but are **not active** in this project
- Any agent that attempts to implement commerce features is working from wrong assumptions

## Ticket and Issue Tracking

This project uses **Azure DevOps (ADO)**, not Jira.

- Branch naming convention: `ADO-{ticket}-{block/element/feature}` (e.g., `ADO-94-cards`, `ADO-120-carousel-scroll`)
- `ticket-details.md` files reference ADO ticket IDs
- Any reference to Jira tickets or Jira-based workflows should be treated as wrong

## CI Pipeline

The CI pipeline (`.github/workflows/main.yaml`) runs **`pnpm lint` only**.

- Tests do **not** run in CI — they run locally only
- `pnpm build:css` and `pnpm build:json` do **not** run in CI
- An agent that assumes tests will be caught by CI will miss coverage regressions
- This is tracked as an open TODO in `docs/project/TODOS.md`

## SCSS, Not Plain CSS

- Global styles and the token system use `.scss` with a PostCSS/SCSS build pipeline
- Block styles use `.css` files
- After modifying any `.scss` file, run `pnpm build:css` before verifying changes
- Forgetting `pnpm build:css` will result in changes not being reflected in the browser

## Third-Party Integrations

The following integrations are **planned per the solution design** but most are not yet implemented:
OneTrust, HotJar, Elastic Search, Fleeknote, YouTube, Emplifi, Google Maps, chatbot.

Do **not** assume these integrations exist unless the specific block or script for them is present in the repository. Use `eds/validate-third-party` skill when working with any integration.

---

*Last Updated: 2026-03-25*
