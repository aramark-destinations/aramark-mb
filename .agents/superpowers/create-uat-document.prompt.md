# Create UAT Document — Aramark MB Block

## Purpose

Generate a structured UAT (User Acceptance Testing) document for an Aramark MB block. Used during block remediation and acceptance review to give stakeholders and QA a clear test guide.

## Instructions

1. **Identify the block** — determine the block name from the ADO ticket or user request
2. **Read source files** — before writing anything, read:
   - `blocks/{block-name}/ticket-details.md` — ADO ticket requirements (authoritative spec)
   - `blocks/{block-name}/{block-name}.js` — implementation
   - `blocks/{block-name}/{block-name}.css` — styles
   - `blocks/{block-name}/_{block-name}.json` — UE schema (fields available to authors)
3. **Run eds/block-audit** — get a current PASS/FAIL report to include in the UAT doc
4. **Generate the UAT document** at `docs/UAT-{BLOCK-NAME}.md`

## Available Skills

| Skill | When to Use |
|---|---|
| `eds/block-audit` | Run first — provides the implementation status and known issues |
| `eds/block-readme` | Reference for block variant and field documentation conventions |
| `eds/pre-merge-check` | Run at the end to verify block is ready for sign-off |

## UAT Document Structure

The generated document must include these sections:

### 1. Overview
- Block name and ADO ticket reference
- Purpose of the block (from ticket-details.md)
- Current status (from block-audit output)

### 2. Authoring Guide (Author-Facing)
- How to add the block in AEM Universal Editor
- Available fields and their purpose (derived from `_{block-name}.json`)
- Supported variants (derived from ticket-details.md)

### 3. Test Scenarios
For each variant and configuration option, provide:
- Scenario name
- Preconditions (authoring setup)
- Steps to test
- Expected result
- Pass/Fail checkbox

Test scenarios must cover:
- **Default state** — block renders with no optional fields set
- **All variants** — one scenario per variant defined in ticket-details.md
- **Responsive behavior** — verify at mobile (375px), tablet (768px), desktop (1280px)
- **Accessibility** — keyboard navigation, screen reader announcement, color contrast

### 4. Known Issues
List any FAIL items from the block-audit output with their remediation status.

### 5. Sign-Off
- [ ] Author review complete
- [ ] Functional testing complete
- [ ] Responsive testing complete
- [ ] Accessibility testing complete
- [ ] ADO ticket: `ADO-{ticket-number}`

## Parallel Research Pattern

For generating UAT documents for multiple blocks simultaneously, spawn one subagent per block:

```
Subagent 1: Generate UAT doc for blocks/accordion — read ticket-details.md, run block-audit, generate docs/UAT-ACCORDION.md
Subagent 2: Generate UAT doc for blocks/carousel — read ticket-details.md, run block-audit, generate docs/UAT-CAROUSEL.md
Subagent 3: Generate UAT doc for blocks/tabs — read ticket-details.md, run block-audit, generate docs/UAT-TABS.md
```

## Output Location

`docs/UAT-{BLOCK-NAME}.md` — use uppercase block name with hyphens, e.g.:
- `docs/UAT-ACCORDION.md`
- `docs/UAT-CAROUSEL.md`
- `docs/UAT-HERO-BANNER.md`
